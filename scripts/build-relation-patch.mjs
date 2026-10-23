/**
 * 按 robot.sql 的原样数据生成「疾病→症状」关系补丁。
 *
 * 转换阶段曾丢弃「症状字典里查不到的名字」，这里把缺失的关系补回来：
 * 名字仍以源码里的字符串为准，不做任何别名归一；字典里没有的名字用稳定的负数 id
 * 占位（-1、-2…），保证 (disease_id, symptom_id) 主键不冲突，也不往 symptom 表里造行。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DUMP = process.argv[2] ?? path.join(ROOT, "_data/robot.sql");
const OUT_DIR = path.join(ROOT, "build/patch");
const MAX_BYTES = 1_600_000;

const tuplePattern = /\((\d+),'((?:[^'\\]|\\.)*)',(\d+)\)/g;

/** 读 dump，收集 symptom 表的名字集合，以及 medical_symptom_list 的全部关系。 */
function readDump(file) {
  const knownNames = new Set();
  const relations = new Map(); // `${diseaseId}|${name}` -> { diseaseId, name }
  const symptomInsert = "INSERT INTO `symptom` VALUES ";
  const relationInsert = "INSERT INTO `medical_symptom_list` VALUES ";

  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (line.startsWith(symptomInsert)) {
      const body = line.slice(symptomInsert.length).replace(/;\s*$/, "");
      for (const match of body.matchAll(/\((\d+),'((?:[^'\\]|\\.)*)'/g)) knownNames.add(match[2]);
      continue;
    }
    if (line.startsWith(relationInsert)) {
      const body = line.slice(relationInsert.length).replace(/;\s*$/, "");
      for (const match of body.matchAll(tuplePattern)) {
        const key = `${match[1]}|${match[2]}`;
        if (!relations.has(key)) relations.set(key, { diseaseId: Number(match[1]), name: match[2] });
      }
    }
  }
  return { knownNames, relations: [...relations.values()] };
}

const { knownNames, relations } = readDump(DUMP);
const missingNames = [...new Set(relations.filter((r) => !knownNames.has(r.name)).map((r) => r.name))].sort();
const missingId = new Map(missingNames.map((name, index) => [name, -(index + 1)]));
const missingRelations = relations.filter((r) => !knownNames.has(r.name));

const sqlText = (value) => `'${value.replace(/'/g, "''")}'`;
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

let fileIndex = 0;
let current = [];
let currentBytes = 0;
const files = [];
const flush = () => {
  if (!current.length) return;
  const name = `edges-${String(++fileIndex).padStart(3, "0")}.sql`;
  fs.writeFileSync(path.join(OUT_DIR, name), current.join("\n") + "\n");
  files.push({ name, bytes: currentBytes, statements: current.length });
  current = [];
  currentBytes = 0;
};

for (const relation of missingRelations) {
  const statement =
    "INSERT OR IGNORE INTO disease_symptom (disease_id,symptom_id,symptom_name) VALUES (" +
    `${relation.diseaseId},${missingId.get(relation.name)},${sqlText(relation.name)});`;
  current.push(statement);
  currentBytes += Buffer.byteLength(statement) + 1;
  if (currentBytes >= MAX_BYTES) flush();
}
flush();

const summary = {
  source: path.relative(ROOT, DUMP),
  knownNames: knownNames.size,
  relationsInDump: relations.length,
  missingNames: missingNames.length,
  missingRelations: missingRelations.length,
  files
};
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify({ ...summary, files: files.length }, null, 2));
