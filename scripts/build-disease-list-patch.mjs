/**
 * 用 robot.sql 的关系表重建 disease.symptom_list / symptom_count。
 *
 * 之前的转换把「症状字典里没有的名字」从列表里删掉了，导致「头痛」这类高频词
 * 虽然有关系记录，却算不进命中数。这里按源表全量回填，不做任何名字归一。
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DUMP = process.argv[2] ?? path.join(ROOT, "_data/robot.sql");
const OUT_DIR = path.join(ROOT, "build/patch-list");
const MAX_BYTES = 1_600_000;

const byDisease = new Map();
const relationInsert = "INSERT INTO `medical_symptom_list` VALUES ";
for (const line of fs.readFileSync(DUMP, "utf8").split("\n")) {
  if (!line.startsWith(relationInsert)) continue;
  const body = line.slice(relationInsert.length).replace(/;\s*$/, "");
  for (const match of body.matchAll(/\((\d+),'((?:[^'\\]|\\.)*)',(\d+)\)/g)) {
    const id = Number(match[1]);
    const list = byDisease.get(id) ?? [];
    if (!list.includes(match[2])) list.push(match[2]);
    byDisease.set(id, list);
  }
}

const sqlText = (value) => `'${value.replace(/'/g, "''")}'`;
fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

let fileIndex = 0;
let current = [];
let currentBytes = 0;
const files = [];
const flush = () => {
  if (!current.length) return;
  const name = `disease-list-${String(++fileIndex).padStart(3, "0")}.sql`;
  fs.writeFileSync(path.join(OUT_DIR, name), current.join("\n") + "\n");
  files.push({ name, bytes: currentBytes, statements: current.length });
  current = [];
  currentBytes = 0;
};

for (const [id, names] of byDisease) {
  const statement =
    "UPDATE disease SET symptom_list=" +
    `${sqlText(JSON.stringify(names))}, symptom_count=${names.length} WHERE id=${id};`;
  current.push(statement);
  currentBytes += Buffer.byteLength(statement) + 1;
  if (currentBytes >= MAX_BYTES) flush();
}
flush();

const summary = { source: path.relative(ROOT, DUMP), diseases: byDisease.size, files };
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify({ ...summary, files: files.length }, null, 2));
