#!/usr/bin/env node
/**
 * Applies the generated seed chunks to D1, one file at a time.
 *
 * `wrangler d1 execute` is invoked per chunk rather than once with everything
 * because a single statement covering the whole dataset would be far past the
 * request limits, and a failure halfway through is much easier to resume.
 *
 * Usage:
 *   npm run data:load -- --local              # local SQLite used by `wrangler dev`
 *   npm run data:load -- --remote             # the real D1 database (whole dataset)
 *   npm run data:load -- --remote --day 1     # only day 1 of the split plan
 *   npm run data:load -- --local --init       # apply migrations/0001_init.sql first
 *
 * The free tier allows 100,000 rows written per day and the full dataset needs about
 * 173,000, so a single `--remote` run can exceed the daily quota. Use
 * `npm run data:days` once, then `--day 1` / `--day 2` on separate days.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BUILD_DIR = "build";
const DB_NAME = "doctor";

const args = process.argv.slice(2);
const remote = args.includes("--remote");
const init = args.includes("--init");
const target = remote ? "--remote" : "--local";
const dayIndex = args.indexOf("--day");
const day = dayIndex >= 0 ? Number.parseInt(args[dayIndex + 1], 10) : null;

function runWrangler(file, label) {
  process.stdout.write(`→ ${label} ... `);
  const result = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", DB_NAME, target, "--yes", `--file=${file}`],
    { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }
  );
  if (result.status !== 0) {
    process.stdout.write("失败\n");
    console.error(result.stdout?.slice(-4000) ?? "");
    console.error(result.stderr?.slice(-4000) ?? "");
    process.exit(result.status ?? 1);
  }
  process.stdout.write("ok\n");
}

function main() {
  if (init) {
    const migration = "migrations/0001_init.sql";
    if (!existsSync(migration)) {
      console.error(`缺少 ${migration}`);
      process.exit(1);
    }
    runWrangler(migration, `schema ${migration}`);
  }

  let files = [];

  if (day !== null) {
    const planPath = join(BUILD_DIR, "days.json");
    if (!existsSync(planPath)) {
      console.error(`没有找到 ${planPath}，先运行 npm run data:days`);
      process.exit(1);
    }
    const plan = JSON.parse(readFileSync(planPath, "utf8"));
    const entry = plan.days.find((item) => item.day === day);
    if (!entry) {
      console.error(`分批计划里没有第 ${day} 天，现有：${plan.days.map((item) => item.day).join(", ")}`);
      process.exit(1);
    }
    files = entry.files.map((file) => join(BUILD_DIR, `day-${day}`, file.name));
    console.log(`第 ${day} 天：${entry.rows} 行写入，${files.length} 个文件`);
  } else {
    const manifestPath = join(BUILD_DIR, "manifest.json");
    if (existsSync(manifestPath)) {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      files = manifest.files.map((entry) => join(BUILD_DIR, entry.name));
    }
    if (files.length === 0 && existsSync(BUILD_DIR)) {
      files = readdirSync(BUILD_DIR)
        .filter((name) => /^seed-\d+\.sql$/.test(name))
        .sort()
        .map((name) => join(BUILD_DIR, name));
    }
    if (files.length === 0) {
      console.error(`没有找到 ${BUILD_DIR}/seed-*.sql，先运行 npm run data:convert`);
      process.exit(1);
    }
    if (remote) {
      console.warn("提示：一次性导入全量数据可能超过 D1 每天 10 万行的写额度，可改用 --day 1 / --day 2。");
    }
  }

  console.log(`导入 ${files.length} 个分片到 ${remote ? "远程 D1" : "本地 D1"} (${DB_NAME})`);
  const started = Date.now();
  files.forEach((file, index) => runWrangler(file, `chunk ${index + 1}/${files.length}`));
  console.log(`完成，用时 ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(remote ? "线上校验：curl https://<your-worker>/api/health" : "本地校验：curl http://127.0.0.1:8788/api/health");
}

main();
