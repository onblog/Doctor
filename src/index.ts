/**
 * Worker entry point.
 *
 * Request flow: edge matches `/api/*` -> this Worker -> route table -> D1.
 * Everything else is a static asset and never enters the Worker, which keeps the
 * free-tier request count for the actual pages at zero.
 *
 * The whole project is a single Worker: frontend in `public/`, backend in `src/`.
 */

import { first } from "./db";
import { errorMessage, json } from "./http";
import { handleApi } from "./routes/index";

/**
 * 每个 IP 每分钟允许的 API 请求数。正常用户一次自查只有个位数请求，
 * 阈值只拦批量爬库；计数放在 D1 里，所有 isolate 共享，才能真正生效。
 */
const API_RATE_LIMIT_PER_MINUTE = 120;

/** 返回该 IP 在当前窗口的累计次数（含本次）。 */
async function bumpRateLimit(env: Env, ip: string, windowStart: number): Promise<number> {
  const row = await first<{ count: number }>(
    env.DB,
    `INSERT INTO api_rate_limit (ip, window_start, count) VALUES (?, ?, 1)
       ON CONFLICT (ip, window_start) DO UPDATE SET count = count + 1
     RETURNING count`,
    [ip, windowStart]
  );
  return row?.count ?? 0;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname.startsWith("/api/")) {
        const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
        const windowStart = Math.floor(Date.now() / 60_000);
        const hits = await bumpRateLimit(env, ip, windowStart);
        // 旧窗口按概率惰性清理，避免每次请求都多一次写
        if (hits % 97 === 1) {
          ctx.waitUntil(
            env.DB.prepare("DELETE FROM api_rate_limit WHERE window_start < ?").bind(windowStart - 2).run()
          );
        }
        if (hits > API_RATE_LIMIT_PER_MINUTE) {
          console.warn(
            JSON.stringify({ level: "warn", event: "rate_limited", ip, path: url.pathname, hits, limit: API_RATE_LIMIT_PER_MINUTE })
          );
          return json(
            { error: "请求过于频繁，请稍后再试", code: "rate_limited" },
            429,
            { "retry-after": "60" }
          );
        }
        return await handleApi(request, env, url, ctx);
      }

      // Not expected in production (static assets answer first), but keeps
      // `wrangler dev` and preview URLs working.
      return await env.ASSETS.fetch(request);
    } catch (error) {
      const { status, message, code } = errorMessage(error);
      console.error(
        JSON.stringify({
          level: status >= 500 ? "error" : "warn",
          status,
          message,
          path: url.pathname,
          method: request.method
        })
      );
      return json(code ? { error: message, code } : { error: message }, status);
    }
  }
} satisfies ExportedHandler<Env>;
