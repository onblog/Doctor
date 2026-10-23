#!/usr/bin/env node
/**
 * MySQL dump -> Cloudflare D1 seed converter.
 *
 * A mysqldump file cannot be imported as is: MySQL DDL (`ENGINE=InnoDB`, `KEY`,
 * charset clauses) is not SQLite syntax, and list columns live in their own side
 * tables. This script reads the dump directly and rewrites it into the compact
 * schema in `migrations/0001_init.sql`, chunked into files small enough for
 * `wrangler d1 execute`.
 *
 * Usage:
 *   node scripts/convert-mysql-dump.mjs                 # reads _data/*.sql(.gz)
 *   node scripts/convert-mysql-dump.mjs path/to/robot.sql
 *   node scripts/convert-mysql-dump.mjs --summary       # parse only, print counts
 *
 * Output: build/seed-0001.sql ... build/manifest.json
 */

import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import { join } from "node:path";
import { pinyin } from "pinyin-pro";

const DATA_DIR = "_data";
const BUILD_DIR = "build";
const CHUNK_BYTES = 1_800_000;
// D1 rejects a single SQL statement longer than 100 KB ("statement too long" /
// SQLITE_TOOBIG). A handful of disease rows have 60 KB text fields, so every
// emitted statement is measured and the longest text field is shortened until it
// fits. The untouched source dump stays the authoritative copy.
// D1 单条 SQL 有大小上限；超限时拆成「基础行 + 逐字段 UPDATE」，绝不截断正文。
const MAX_STATEMENT_BYTES = 85_000;

/** Long free-text columns of `disease`; the only fields worth shrinking. */
const DISEASE_TEXT_FIELDS = ["intro", "cause", "diagnose", "cure", "prevent", "complication", "symptom"];
const SYMPTOM_TEXT_FIELDS = ["intro", "cause", "diagnose", "examine"];

/**
 * Builds the INSERT. If the statement would exceed D1's per-statement limit, the row is
 * split into a base INSERT plus one UPDATE per long text field, so no character is lost.
 */
function buildRowStatements(fields, textFields, buildFull, buildBase, buildUpdate, key) {
  const full = buildFull(fields);
  if (Buffer.byteLength(full, "utf8") <= MAX_STATEMENT_BYTES) {
    return { statements: [full], split: 0 };
  }
  const statements = [buildBase(fields)];
  let split = 0;
  for (const field of textFields) {
    if (!fields[field]) continue;
    statements.push(buildUpdate(field, fields[field], fields[key]));
    split += 1;
  }
  return { statements, split };
}

// Department rules: departments that only apply to one sex or age band.
const WOMAN_DEPTS = ["妇科", "产科", "妇产科", "乳腺外科"];
const MAN_DEPTS = ["男科"];
const CHILD_DEPTS = ["小儿科"];
const OLD_DEPTS = ["老年科"];

// ---------------------------------------------------------------- utilities

const SQL_ESCAPES = { n: "\n", r: "\r", t: "\t", 0: "\0", b: "\b", Z: "\u001a", "\\": "\\", "'": "'", '"': '"' };

function sqlText(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
  return `'${String(value).replace(/\u0000/g, "").replace(/'/g, "''")}'`;
}

function sqlJsonArray(list) {
  return sqlText(JSON.stringify(list));
}

function unique(list) {
  return [...new Set(list)];
}

/** Full pinyin + first letters, both lower case ASCII, used by the search indexes. */
function pinyinKeys(name) {
  const syllables = pinyin(name, { toneType: "none", type: "array", nonZh: "consecutive" });
  const flat = syllables.join("").toLowerCase().replace(/[^a-z]/g, "");
  const initials = syllables
    .map((syllable) => syllable.toLowerCase().replace(/[^a-z]/g, "")[0] ?? "")
    .join("");
  return { initial: flat, initials };
}

// ------------------------------------------------------------ dump parsing

/**
 * Parses one `INSERT INTO \`table\` VALUES (...),(...);` line.
 * The scanner tracks quotes so a literal `),(` inside a text column cannot split
 * a tuple.
 */
function parseInsertValues(text) {
  const rows = [];
  let row = null;
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (char === "(") {
      row = [];
      index += 1;
      continue;
    }
    if (char === ")") {
      if (row) rows.push(row);
      row = null;
      index += 1;
      continue;
    }
    if (char === "," || char === " " || char === "\t" || char === "\n" || char === "\r") {
      index += 1;
      continue;
    }
    if (char === "'") {
      let value = "";
      index += 1;
      while (index < text.length) {
        const current = text[index];
        if (current === "\\") {
          const escaped = text[index + 1];
          value += SQL_ESCAPES[escaped] ?? escaped ?? "";
          index += 2;
          continue;
        }
        if (current === "'") {
          if (text[index + 1] === "'") {
            value += "'";
            index += 2;
            continue;
          }
          index += 1;
          break;
        }
        value += current;
        index += 1;
      }
      row?.push(value);
      continue;
    }

    const start = index;
    while (index < text.length && !",)".includes(text[index])) index += 1;
    const token = text.slice(start, index).trim();
    if (token) row?.push(token === "NULL" ? null : /^-?\d+(\.\d+)?$/.test(token) ? Number(token) : token);
  }

  return rows;
}

/** Column names of a `CREATE TABLE` body, in declaration order. */
function parseColumns(body) {
  const columns = [];
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("`")) continue;
    const match = /^`([^`]+)`/.exec(line);
    if (match) columns.push(match[1]);
  }
  return columns;
}

// --------------------------------------------------------------- collecting

const tables = new Map(); // table -> { columns: string[], rows: unknown[][] }

function storeRow(table, columns, values) {
  const entry = tables.get(table) ?? { columns, rows: [] };
  if (entry.columns.length === 0) entry.columns = columns;
  entry.rows.push(values);
  tables.set(table, entry);
}

async function readDump(path) {
  const stream = path.endsWith(".gz")
    ? createReadStream(path).pipe(createGunzip())
    : createReadStream(path);
  const lines = createInterface({ input: stream, crlfDelay: Infinity });

  let pendingCreate = null; // { table, body: string[] }
  let pendingInsert = null; // { table, declared, buffer: string[] }
  let lineCount = 0;

  const finishInsert = () => {
    const { table, declared, buffer } = pendingInsert;
    const payload = buffer.join(" ").replace(/;\s*$/, "");
    const values = parseInsertValues(payload);
    for (const row of values) storeRow(table, declared, row);
    pendingInsert = null;
  };

  for await (const line of lines) {
    lineCount += 1;

    if (pendingCreate) {
      pendingCreate.body.push(line);
      if (/^\)\s*(ENGINE|AUTO_INCREMENT|;)/i.test(line.trim()) || line.trim().startsWith(");")) {
        storeRow(pendingCreate.table, parseColumns(pendingCreate.body.join("\n")), []);
        tables.get(pendingCreate.table).columns = parseColumns(pendingCreate.body.join("\n"));
        pendingCreate = null;
      }
      continue;
    }

    // mysqldump normally emits one INSERT per line, but `--skip-extended-insert`
    // and hand-written dumps may wrap one statement over several lines.
    if (pendingInsert) {
      pendingInsert.buffer.push(line);
      if (line.trimEnd().endsWith(";")) finishInsert();
      continue;
    }

    const create = /^CREATE TABLE(?: IF NOT EXISTS)? `?([A-Za-z0-9_]+)`?/i.exec(line);
    if (create) {
      pendingCreate = { table: create[1], body: [line] };
      if (!tables.has(create[1])) tables.set(create[1], { columns: [], rows: [] });
      continue;
    }

    const insert = /^INSERT INTO `?([A-Za-z0-9_]+)`?\s*(?:\(([^)]*)\))?\s*VALUES\s*([\s\S]*)$/i.exec(line);
    if (!insert) continue;

    const table = insert[1];
    const declared = insert[2]
      ? insert[2].split(",").map((part) => part.trim().replace(/^`|`$/g, ""))
      : tables.get(table)?.columns ?? [];
    pendingInsert = { table, declared, buffer: [insert[3]] };
    if (insert[3].trimEnd().endsWith(";")) finishInsert();
  }

  return lineCount;
}

// ------------------------------------------------------------------ shaping

function columnIndex(columns, ...candidates) {
  for (const candidate of candidates) {
    const index = columns.indexOf(candidate);
    if (index >= 0) return index;
  }
  return -1;
}

/** Reads the side tables that hold list columns back into per-owner arrays. */
function collectElementLists(entity) {
  const listByOwner = new Map(); // ownerId -> Map<field, string[]>

  for (const [table, { columns, rows }] of tables) {
    const field = table.startsWith(`${entity}_`) ? table.slice(entity.length + 1) : null;
    if (!field) continue;

    // The foreign key is usually `<entity>_id`; some hand-made dumps use `id`.
    let ownerIndex = columns.indexOf(`${entity}_id`);
    if (ownerIndex < 0) ownerIndex = columns.findIndex((column) => column.endsWith("_id"));
    if (ownerIndex < 0) ownerIndex = columns.indexOf("id");
    const positionIndex = columnIndex(columns, "position");
    const valueIndex = columnIndex(columns, field);
    if (ownerIndex < 0 || valueIndex < 0) continue;

    // Sort by the @OrderColumn so the list keeps the original order.
    const sorted = positionIndex >= 0
      ? [...rows].sort((a, b) => Number(a[positionIndex] ?? 0) - Number(b[positionIndex] ?? 0))
      : rows;

    for (const values of sorted) {
      const owner = values[ownerIndex];
      const value = values[valueIndex];
      if (owner === null || value === null || value === "") continue;
      const byField = listByOwner.get(owner) ?? new Map();
      const list = byField.get(field) ?? [];
      list.push(String(value));
      byField.set(field, list);
      listByOwner.set(owner, byField);
    }
  }

  return listByOwner;
}

function scopeOf(families) {
  const sexScope = families.some((name) => MAN_DEPTS.includes(name))
    ? "male"
    : families.some((name) => WOMAN_DEPTS.includes(name))
      ? "female"
      : "any";
  const ageScope = families.some((name) => CHILD_DEPTS.includes(name))
    ? "child"
    : families.some((name) => OLD_DEPTS.includes(name))
      ? "elder"
      : "any";
  return { sexScope, ageScope };
}

/** All 1..3 code-point substrings, used to make substring search an index seek. */
function gramsOf(name) {
  const chars = Array.from(name);
  const seen = new Set();
  const out = [];
  for (let pos = 0; pos < chars.length; pos += 1) {
    for (let size = 1; size <= 3 && pos + size <= chars.length; size += 1) {
      const gram = chars.slice(pos, pos + size).join("");
      const key = `${pos}:${gram}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push([gram, pos]);
    }
  }
  return out;
}

// --------------------------------------------------------------- sql writing

class ChunkWriter {
  constructor(dir, maxBytes = CHUNK_BYTES) {
    this.dir = dir;
    this.maxBytes = maxBytes;
    this.files = [];
    this.buffer = [];
    this.size = 0;
    this.statementCount = 0;
  }

  add(statement) {
    const line = `${statement}\n`;
    this.buffer.push(line);
    // Count UTF-8 bytes: the chunk limit is about what the upload can carry, and
    // Chinese text is 3 bytes per character.
    this.size += Buffer.byteLength(line, "utf8");
    this.statementCount += 1;
    if (this.size >= this.maxBytes) this.flush();
  }

  flush() {
    if (this.size === 0) return;
    const name = `seed-${String(this.files.length + 1).padStart(4, "0")}.sql`;
    const path = join(this.dir, name);
    const header = `-- generated by scripts/convert-mysql-dump.mjs\n-- chunk ${this.files.length + 1}\n`;
    writeFileSync(path, header + this.buffer.join(""));
    this.files.push({ name, bytes: this.size });
    this.buffer = [];
    this.size = 0;
  }

  finish() {
    this.flush();
    return this.files;
  }
}

// -------------------------------------------------------------------- main

function findDump() {
  if (!existsSync(DATA_DIR)) return null;
  const candidates = readdirSync(DATA_DIR)
    .filter((name) => /\.sql(\.gz)?$/i.test(name))
    .map((name) => join(DATA_DIR, name));
  return candidates[0] ?? null;
}

async function main() {
  const args = process.argv.slice(2);
  const summaryOnly = args.includes("--summary");
  const explicit = args.find((arg) => !arg.startsWith("--"));
  const dumpPath = explicit ?? findDump();

  if (!dumpPath || !existsSync(dumpPath)) {
    console.error(`未找到 SQL dump。请把 robot.sql 放到 ${DATA_DIR}/，或传入路径。`);
    process.exit(1);
  }

  console.log(`解析 ${dumpPath} ...`);
  const lineCount = await readDump(dumpPath);
  console.log(`完成：${lineCount} 行，识别到 ${tables.size} 张表`);

  const medical = tables.get("medical");
  const symptom = tables.get("symptom");
  if (!medical?.rows.length || !symptom?.rows.length) {
    console.error("dump 中没有找到 medical / symptom 数据，表名是否为 `medical` 与 `symptom`？");
    console.error("实际表名：", [...tables.keys()].join(", "));
    process.exit(1);
  }

  const medicalColumns = medical.columns;
  const symptomColumns = symptom.columns;
  const medicalLists = collectElementLists("medical");
  const symptomLists = collectElementLists("symptom");

  const pick = (row, columns, name) => {
    const index = columns.indexOf(name);
    return index >= 0 ? row[index] : null;
  };

  // -- symptoms ----------------------------------------------------------
  const symptomRecords = [];
  const symptomNameToId = new Map();
  for (const row of symptom.rows) {
    const id = Number(pick(row, symptomColumns, "id"));
    const name = pick(row, symptomColumns, "name");
    if (!id || !name) continue;
    const lists = symptomLists.get(id) ?? new Map();
    const list = (field) => unique((lists.get(field) ?? []).filter(Boolean));
    const { initial, initials } = pinyinKeys(String(name));
    symptomNameToId.set(String(name), id);
    symptomRecords.push({
      id,
      name: String(name),
      initial,
      initials,
      parts: list("part"),
      families: list("family"),
      intro: pick(row, symptomColumns, "intro") ?? "",
      cause: pick(row, symptomColumns, "cause") ?? "",
      diagnose: pick(row, symptomColumns, "diagnose") ?? "",
      examine: pick(row, symptomColumns, "examine") ?? ""
    });
  }

  // -- diseases ----------------------------------------------------------
  const diseaseRecords = [];
  for (const row of medical.rows) {
    const id = Number(pick(row, medicalColumns, "id"));
    const name = pick(row, medicalColumns, "name");
    if (!id || !name) continue;
    const lists = medicalLists.get(id) ?? new Map();
    const list = (field) => unique((lists.get(field) ?? []).filter(Boolean));
    const families = list("family");
    const symptomList = list("symptom_list").filter((item) => symptomNameToId.has(item));
    const { initial, initials } = pinyinKeys(String(name));
    const { sexScope, ageScope } = scopeOf(families);
    diseaseRecords.push({
      id,
      name: String(name),
      initial,
      initials,
      parts: list("part"),
      families,
      sexScope,
      ageScope,
      intro: pick(row, medicalColumns, "intro") ?? "",
      cause: pick(row, medicalColumns, "cause") ?? "",
      diagnose: pick(row, medicalColumns, "diagnose") ?? "",
      cure: pick(row, medicalColumns, "cure") ?? "",
      prevent: pick(row, medicalColumns, "prevent") ?? "",
      complication: pick(row, medicalColumns, "complication") ?? "",
      symptom: pick(row, medicalColumns, "symptom") ?? "",
      symptomList,
      complicationList: list("complication_list"),
      sexRaw: families
    });
  }

  const edgeCount = diseaseRecords.reduce((sum, disease) => sum + disease.symptomList.length, 0);
  const noSymptomEdges = diseaseRecords.filter((disease) => disease.symptomList.length === 0).length;

  console.log(
    `症状 ${symptomRecords.length} 条，疾病 ${diseaseRecords.length} 条，疾病->症状关系 ${edgeCount} 条`
  );
  if (noSymptomEdges > 0) console.log(`提示：${noSymptomEdges} 条疾病没有任何可匹配的症状词。`);

  if (summaryOnly) return;

  mkdirSync(BUILD_DIR, { recursive: true });
  const writer = new ChunkWriter(BUILD_DIR);

  // Table order matters only for readability; every statement is independent.
  let splitRows = 0;
  for (const item of symptomRecords) {
    const fields = { ...item };
    const full = (row) =>
      `INSERT OR REPLACE INTO symptom (id,name,initial,initials,parts,families,intro,cause,diagnose,examine) VALUES (` +
      [
        row.id,
        sqlText(row.name),
        sqlText(row.initial),
        sqlText(row.initials),
        sqlJsonArray(row.parts),
        sqlJsonArray(row.families),
        sqlText(row.intro),
        sqlText(row.cause),
        sqlText(row.diagnose),
        sqlText(row.examine)
      ].join(",") +
      ");";
    const base = (row) =>
      `INSERT OR REPLACE INTO symptom (id,name,initial,initials,parts,families,intro,cause,diagnose,examine) VALUES (` +
      [
        row.id,
        sqlText(row.name),
        sqlText(row.initial),
        sqlText(row.initials),
        sqlJsonArray(row.parts),
        sqlJsonArray(row.families),
        "''",
        "''",
        "''",
        "''"
      ].join(",") +
      ");";
    const update = (field, value, id) => `UPDATE symptom SET ${field}=${sqlText(value)} WHERE id=${id};`;
    const { statements, split } = buildRowStatements(fields, SYMPTOM_TEXT_FIELDS, full, base, update, "id");
    if (split > 0) splitRows += 1;
    for (const statement of statements) writer.add(statement);
  }

  let splitDiseases = 0;
  for (const item of diseaseRecords) {
    const fields = { ...item };
    const full = (row) =>
      `INSERT OR REPLACE INTO disease (id,name,initial,initials,parts,families,sex_scope,age_scope,intro,cause,diagnose,cure,prevent,complication,symptom,symptom_list,complication_list,symptom_count) VALUES (` +
      [
        row.id,
        sqlText(row.name),
        sqlText(row.initial),
        sqlText(row.initials),
        sqlJsonArray(row.parts),
        sqlJsonArray(row.families),
        sqlText(row.sexScope),
        sqlText(row.ageScope),
        sqlText(row.intro),
        sqlText(row.cause),
        sqlText(row.diagnose),
        sqlText(row.cure),
        sqlText(row.prevent),
        sqlText(row.complication),
        sqlText(row.symptom),
        sqlJsonArray(row.symptomList),
        sqlJsonArray(row.complicationList),
        row.symptomList.length
      ].join(",") +
      ");";
    const base = (row) =>
      `INSERT OR REPLACE INTO disease (id,name,initial,initials,parts,families,sex_scope,age_scope,intro,cause,diagnose,cure,prevent,complication,symptom,symptom_list,complication_list,symptom_count) VALUES (` +
      [
        row.id,
        sqlText(row.name),
        sqlText(row.initial),
        sqlText(row.initials),
        sqlJsonArray(row.parts),
        sqlJsonArray(row.families),
        sqlText(row.sexScope),
        sqlText(row.ageScope),
        "''",
        "''",
        "''",
        "''",
        "''",
        "''",
        "''",
        sqlJsonArray(row.symptomList),
        sqlJsonArray(row.complicationList),
        row.symptomList.length
      ].join(",") +
      ");";
    const update = (field, value, id) => `UPDATE disease SET ${field}=${sqlText(value)} WHERE id=${id};`;
    const { statements, split } = buildRowStatements(fields, DISEASE_TEXT_FIELDS, full, base, update, "id");
    if (split > 0) splitDiseases += 1;
    for (const statement of statements) writer.add(statement);
  }

  for (const item of diseaseRecords) {
    for (const symptomName of item.symptomList) {
      writer.add(
        `INSERT OR IGNORE INTO disease_symptom (disease_id,symptom_id,symptom_name) VALUES (` +
          [item.id, symptomNameToId.get(symptomName), sqlText(symptomName)].join(",") +
          ");"
      );
    }
  }

  const partsSeen = new Set();
  for (const item of symptomRecords) {
    for (const part of item.parts) {
      const key = `${part}\u0000${item.id}`;
      if (partsSeen.has(key)) continue;
      partsSeen.add(key);
      writer.add(`INSERT OR IGNORE INTO symptom_part (part,symptom_id) VALUES (${sqlText(part)},${item.id});`);
    }
  }

  for (const item of symptomRecords) {
    for (const [gram, pos] of gramsOf(item.name)) {
      writer.add(`INSERT OR IGNORE INTO symptom_gram (gram,symptom_id,pos) VALUES (${sqlText(gram)},${item.id},${pos});`);
    }
  }

  for (const [key, value] of Object.entries({
    disease_count: diseaseRecords.length,
    symptom_count: symptomRecords.length,
    edge_count: edgeCount,
    built_at: new Date().toISOString()
  })) {
    writer.add(`INSERT OR REPLACE INTO meta (key,value) VALUES (${sqlText(key)},${sqlText(String(value))});`);
  }

  const files = writer.finish();
  writeFileSync(
    join(BUILD_DIR, "manifest.json"),
    `${JSON.stringify({ source: dumpPath, files, diseaseCount: diseaseRecords.length, symptomCount: symptomRecords.length, edgeCount, builtAt: new Date().toISOString() }, null, 2)}\n`
  );

  if (splitRows || splitDiseases) {
    console.log(
      `为避免超过 D1 单语句大小限制，${splitDiseases} 条疾病、${splitRows} 条症状改为「基础行 + 字段 UPDATE」写入，正文未截断。`
    );
  }
  console.log(`生成 ${files.length} 个分片，共 ${(files.reduce((sum, file) => sum + file.bytes, 0) / 1_048_576).toFixed(1)} MB -> ${BUILD_DIR}/`);
  console.log("下一步：npm run data:load -- --local   或   npm run data:load -- --remote");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
