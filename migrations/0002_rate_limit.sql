-- IP 维度限流计数（每分钟一个窗口）。
--
-- Workers 原生的 Rate Limiting binding 是「每个边缘节点、每个 isolate 各自计数」，
-- 并发请求分散到多个 isolate 时几乎不会触发阈值，所以改成 D1 共享计数。
-- 只保留最近两个窗口，旧行由入口按概率惰性清理，不长期留存 IP。
CREATE TABLE IF NOT EXISTS api_rate_limit (
  ip           TEXT    NOT NULL,   -- cf-connecting-ip
  window_start INTEGER NOT NULL,   -- Unix 秒 / 60 取整
  count        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, window_start)
) WITHOUT ROWID;
