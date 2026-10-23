/**
 * Request/response plumbing shared by every route.
 *
 * All backend endpoints answer under `/api/` and speak JSON in and JSON out.
 * Errors use one shape, `{ error, code }`, so the frontend never has to guess:
 * `error` is human readable (Chinese, matching the audience), `code` is a stable
 * machine identifier the UI may branch on.
 */

const JSON_HEADERS: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const SECURITY_HEADERS: Record<string, string> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY"
};

/** A failure we expect: the status code is returned to the caller as is. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string
  ) {
    super(message);
  }
}

export function json(value: unknown, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...JSON_HEADERS, ...SECURITY_HEADERS, ...extra }
  });
}

/** Cacheable GET responses: the edge keeps them for `ttl` seconds. */
export function jsonCached(value: unknown, ttl: number): Response {
  return json(value, 200, { "cache-control": `public, max-age=${ttl}` });
}

export async function readJson<T>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "请求体必须是合法的 JSON", "invalid_json");
  }
}

export function requireString(value: unknown, message: string, max = 100): string {
  if (typeof value !== "string" || !value.trim()) throw new HttpError(400, message, "invalid_param");
  const trimmed = value.trim();
  if (trimmed.length > max) throw new HttpError(400, `${message}（长度不能超过 ${max}）`, "invalid_param");
  return trimmed;
}

export function clampInt(value: string | null, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function errorMessage(error: unknown): { status: number; message: string; code?: string } {
  if (error instanceof HttpError) return { status: error.status, message: error.message, code: error.code };
  const message = error instanceof Error ? error.message : "服务内部错误";
  return { status: 500, message };
}

/**
 * Edge cache wrapper for read-only endpoints.
 *
 * Every cache hit is a D1 query that never happens, which is the cheapest way to
 * stay inside the free tier. Only use it for responses that do not depend on the
 * caller (no cookies, no personalisation).
 */
export async function withEdgeCache(
  request: Request,
  ctx: ExecutionContext,
  ttl: number,
  build: () => Promise<Response>
): Promise<Response> {
  // `caches.default` exists in the Workers runtime but not in the standard
  // WebWorker lib typings bundled with `wrangler types`, hence the cast.
  const cache = (caches as unknown as { default: Cache }).default;
  const key = new Request(request.url, { method: "GET" });
  const hit = await cache.match(key);
  if (hit) return hit;

  const fresh = await build();
  if (fresh.status === 200) {
    const headers = new Headers(fresh.headers);
    headers.set("cache-control", `public, max-age=${ttl}`);
    const cacheable = new Response(fresh.body, { status: 200, headers });
    ctx.waitUntil(cache.put(key, cacheable.clone()));
    return cacheable;
  }
  return fresh;
}
