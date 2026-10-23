/**
 * 把被旧转换脚本截断的长文本按 robot.sql 原文补回。
 *
 * 旧脚本有 MAX_TEXT_CHARS=6000 的硬截断（并在超 85KB 时继续缩短到 60%），
 * 会让 289 条疾病、54 条症状的正文尾部丢失。这里逐字段生成 UPDATE，
 * 值直接取 dump 解析结果，不做 trim、不做归一、保留所有空白与标点。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DUMP = process.argv[2] ?? path.join(ROOT, "_data/robot.sql");
const OUT_DIR = path.join(ROOT, "build/patch-text");
const MAX_BYTES = 1_600_000;

/** 解析 `INSERT INTO \`table\` VALUES ...`，返回每条记录的字段数组（保留原始字符）。 */
function parseTuples(line, prefix) {
  const body = line.slice(prefix.length).replace(/;\s*$/, "");
  const tuples = [];
  let buf = [];
  let inString = false;
  let depth = 0;
  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];
    if (inString) {
      if (ch === "\\" && i + 1 < body.length) {
        buf.push(ch, body[i + 1]);
        i += 1;
        continue;
      }
      if (ch === "'" && body[i + 1] === "'") {
        buf.push("''");
        i += 1;
        continue;
      }
      if (ch === "'") inString = false;
      buf.push(ch);
      continue;
    }
    if (ch === "'") {
      inString = true;
      buf.push(ch);
      continue;
    }
    if (ch === "(") {
      depth += 1;
      if (depth === 1) {
        buf = [];
        continue;
      }
    }
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) {
        tuples.push(buf.join(""));
        buf = [];
        continue;
      }
    }
    if (depth >= 1) buf.push(ch);
  }
  return tuples.map((tuple) => decodeFields(tuple));
}

/** 把一行元组拆成字段值，处理 \n \r \t \0 转义与 '' \' 引号。 */
function decodeFields(tuple) {
  const out = [];
  let buf = [];
  let inString = false;
  for (let i = 0; i < tuple.length; i += 1) {
    const ch = tuple[i];
    if (inString) {
      if (ch === "\\" && i + 1 < tuple.length) {
        const next = tuple[i + 1];
        buf.push({ n: "\n", r: "\r", t: "\t", 0: "\0" }[next] ?? next);
        i += 1;
        continue;
      }
      if (ch === "'" && tuple[i + 1] === "'") {
        buf.push("'");
        i += 1;
        continue;
      }
      if (ch === "'") {
        inString = false;
        continue;
      }
      buf.push(ch);
      continue;
    }
    if (ch === "'") {
      inString = true;
      continue;
    }
    if (ch === ",") {
      out.push(buf.join(""));
      buf = [];
      continue;
    }
    buf.push(ch);
  }
  out.push(buf.join(""));
  return out;
}

const DISEASE_FIELDS = ["intro", "cause", "diagnose", "cure", "prevent", "complication", "symptom"];
const SYMPTOM_FIELDS = ["intro", "cause", "diagnose", "examine"];
const DISEASE_COLS = ["id", "name", "cause", "complication", "cure", "diagnose", "intro", "prevent", "symptom"];
const SYMPTOM_COLS = ["id", "name", "cause", "diagnose", "examine", "intro"];

const sqlText = (value) => `'${String(value).replace(/'/g, "''")}'`;

const diseaseRows = [];
const symptomRows = [];
for (const line of fs.readFileSync(DUMP, "utf8").split("\n")) {
  if (line.startsWith("INSERT INTO `medical` VALUES ")) {
    for (const f of parseTuples(line, "INSERT INTO `medical` VALUES ")) {
      const row = {};
      DISEASE_COLS.forEach((col, i) => (row[col] = f[i] ?? ""));
      if (DISEASE_FIELDS.some((col) => row[col].length > 6000)) diseaseRows.push(row);
    }
    continue;
  }
  if (line.startsWith("INSERT INTO `symptom` VALUES ")) {
    for (const f of parseTuples(line, "INSERT INTO `symptom` VALUES ")) {
      const row = {};
      SYMPTOM_COLS.forEach((col, i) => (row[col] = f[i] ?? ""));
      if (SYMPTOM_FIELDS.some((col) => row[col].length > 6000)) symptomRows.push(row);
    }
  }
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

let fileIndex = 0;
let current = [];
let currentBytes = 0;
const files = [];
const flush = () => {
  if (!current.length) return;
  const name = `text-${String(++fileIndex).padStart(3, "0")}.sql`;
  fs.writeFileSync(path.join(OUT_DIR, name), current.join("\n") + "\n");
  files.push({ name, bytes: currentBytes, statements: current.length });
  current = [];
  currentBytes = 0;
};
const push = (statement) => {
  current.push(statement);
  currentBytes += Buffer.byteLength(statement) + 1;
  if (currentBytes >= MAX_BYTES) flush();
};

for (const row of diseaseRows) {
  for (const col of DISEASE_FIELDS) {
    if (row[col].length <= 6000) continue;
    push(`UPDATE disease SET ${col}=${sqlText(row[col])} WHERE id=${Number(row.id)};`);
  }
}
for (const row of symptomRows) {
  for (const col of SYMPTOM_FIELDS) {
    if (row[col].length <= 6000) continue;
    push(`UPDATE symptom SET ${col}=${sqlText(row[col])} WHERE id=${Number(row.id)};`);
  }
}
flush();

const summary = { diseases: diseaseRows.length, symptoms: symptomRows.length, files };
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify({ ...summary, files: files.length }, null, 2));
