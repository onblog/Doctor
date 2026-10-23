#!/bin/bash
# 明早 D1 免费额度重置后，把新症状的中文搜索索引（symptom_gram）补进 D1。
# 幂等：全部使用 INSERT OR IGNORE，重复执行安全。
set -u

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
unset https_proxy http_proxy HTTPS_PROXY HTTP_PROXY ALL_PROXY all_proxy

# 以脚本自身位置定位仓库根目录：换机器/别人 clone 都能跑，也不泄露本机路径
cd "$(dirname "$0")/.." || exit 1
LOG="build/patch-symptom/import-$(date +%Y%m%d-%H%M).log"
mkdir -p build/patch-symptom

{
  echo "== start $(date '+%F %T %Z')"
  failed=0
  for file in build/patch-symptom/gram-*.sql; do
    echo "== import ${file}"
    if out=$(npx wrangler d1 execute doctor --remote --file="$file" --yes 2>&1); then
      echo "$out" | tail -3
    else
      failed=1
      echo "!! import failed: ${file}"
      echo "$out" | tail -5
    fi
  done

  echo "== refresh meta"
  npx wrangler d1 execute doctor --remote --command \
    "INSERT OR REPLACE INTO meta (key,value) VALUES ('disease_count','7733'),('symptom_count','9159'),('edge_count','154081'),('built_at','$(date -u +%FT%TZ)');" 2>&1 | tail -3

  echo "== verify"
  npx wrangler d1 execute doctor --remote --json --command \
    "SELECT (SELECT COUNT(*) FROM symptom_gram) AS grams, (SELECT COUNT(*) FROM symptom) AS symptoms, (SELECT COUNT(*) FROM disease_symptom) AS edges" 2>&1 | tail -8

  echo "== done $(date '+%F %T %Z') failed=${failed}"

  # 导完就撤掉定时任务，避免明天再跑一遍重复写入
  if [ "$failed" = "0" ]; then
    ( sleep 20; launchctl bootout "gui/$(id -u)/com.doctor.import-gram" 2>/dev/null; rm -f "$HOME/Library/LaunchAgents/com.doctor.import-gram.plist" ) &
  fi
} >> "$LOG" 2>&1
