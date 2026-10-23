/**
 * 根据「关系表里出现、但症状表没有」的名字生成 D1 补丁：
 *   - symptom 行（负数 id 与 disease_symptom.symptom_id 对齐，拼音列由 pinyin-pro 生成）
 *   - symptom_gram 索引（1~3 字子串，中文搜索走它）
 *
 * 输入是 D1 导出的映射文件：[{ symptom_id, symptom_name }, ...]
 * 名字原样使用，不做 trim、不做别名归一。
 */
import fs from "node:fs";
import path from "node:path";
import { pinyin } from "pinyin-pro";

const ROOT = path.resolve(import.meta.dirname, "..");
const MAP_FILE = process.argv[2];
if (!MAP_FILE) {
  console.error("用法: node scripts/build-symptom-backfill.mjs <mapping.json>");
  process.exit(1);
}
const OUT_DIR = path.join(ROOT, "build/patch-symptom");
const MAX_BYTES = 1_500_000;

// 兼容 wrangler d1 execute --json 的输出包装：[{ results: [...] }]
let rows = JSON.parse(fs.readFileSync(MAP_FILE, "utf8"));
if (Array.isArray(rows) && rows[0]?.results) rows = rows[0].results;
const sqlText = (value) => `'${String(value).replace(/'/g, "''")}'`;

function pinyinKeys(name) {
  const syllables = pinyin(name, { toneType: "none", type: "array", nonZh: "consecutive" });
  const flat = syllables.join("").toLowerCase().replace(/[^a-z]/g, "");
  const initials = syllables
    .map((syllable) => syllable.toLowerCase().replace(/[^a-z]/g, "")[0] ?? "")
    .join("");
  return { initial: flat, initials };
}

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

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const writers = new Map();
function write(group, statement) {
  let state = writers.get(group);
  if (!state) {
    state = { index: 0, lines: [], bytes: 0, files: [] };
    writers.set(group, state);
  }
  state.lines.push(statement);
  state.bytes += Buffer.byteLength(statement) + 1;
  if (state.bytes >= MAX_BYTES) flush(group);
}
function flush(group) {
  const state = writers.get(group);
  if (!state || !state.lines.length) return;
  const name = `${group}-${String(++state.index).padStart(3, "0")}.sql`;
  fs.writeFileSync(path.join(OUT_DIR, name), state.lines.join("\n") + "\n");
  state.files.push(name);
  state.lines = [];
  state.bytes = 0;
}

for (const row of rows) {
  const name = String(row.symptom_name);
  const id = Number(row.symptom_id);
  const { initial, initials } = pinyinKeys(name);
  write(
    "symptom",
    `INSERT OR IGNORE INTO symptom (id,name,initial,initials,parts,families,intro,cause,diagnose,examine) VALUES (` +
      [id, sqlText(name), sqlText(initial), sqlText(initials), "'[]'", "'[]'", "''", "''", "''", "''"].join(",") +
      ");"
  );
  for (const [gram, pos] of gramsOf(name)) {
    write("gram", `INSERT OR IGNORE INTO symptom_gram (gram,symptom_id,pos) VALUES (${sqlText(gram)},${id},${pos});`);
  }
}
for (const group of writers.keys()) flush(group);

const summary = {
  symptoms: rows.length,
  gram: [...writers.values()].reduce((sum, state) => sum + state.index * 0, 0),
  files: Object.fromEntries([...writers.entries()].map(([group, state]) => [group, state.files]))
};
// 统计实际 gram 行数
summary.gram = rows.reduce((sum, row) => sum + gramsOf(String(row.symptom_name)).length, 0);
fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(summary, null, 2));
