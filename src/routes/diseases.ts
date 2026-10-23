/**
 * Disease browsing and detail.
 *   GET /api/diseases?q=偏头痛&limit=20  -> search
 *   GET /api/diseases/123                -> full record
 */

import { all, first, toDiseaseDTO, toDiseaseSummary, type DiseaseRecord } from "../db";
import { HttpError, clampInt, json, withEdgeCache } from "../http";
import { buildExplain } from "./graph";

const DISEASE_TTL = 86_400;

export async function searchDiseases(
  request: Request,
  env: Env,
  url: URL,
  ctx: ExecutionContext
): Promise<Response> {
  const query = (url.searchParams.get("q") ?? "").trim();
  const limit = clampInt(url.searchParams.get("limit"), 20, 1, 50);
  if (!query) return json({ query: "", items: [] });

  return withEdgeCache(request, ctx, DISEASE_TTL, async () => {
    const rows = await all<DiseaseRecord>(
      env.DB,
      `SELECT * FROM disease
        WHERE name LIKE ?1 OR initial LIKE ?2 OR initials LIKE ?2
        ORDER BY LENGTH(name) ASC, name ASC
        LIMIT ?3`,
      [`%${query}%`, `${query.toLowerCase()}%`, limit]
    );
    return json({ query, items: rows.map(toDiseaseSummary) });
  });
}

export async function getDisease(
  request: Request,
  env: Env,
  id: number,
  ctx: ExecutionContext
): Promise<Response> {
  // Detail pages are opened far more often than they change, so a day of edge
  // caching turns every repeat open into a zero-D1 hit.
  return withEdgeCache(request, ctx, DISEASE_TTL, async () => {
    const row = await first<DiseaseRecord>(env.DB, "SELECT * FROM disease WHERE id = ?", [id]);
    if (!row) throw new HttpError(404, "没有找到该疾病", "disease_not_found");
    return json(toDiseaseDTO(row));
  });
}

/**
 * GET /api/diseases/123/context?symptoms=头痛,咳嗽
 *
 * Disease detail plus its reasoning graph in one response. The popup used to
 * fire two requests, and from mainland China the extra round trip cost more
 * than the database work itself.
 */
export async function getDiseaseContext(
  request: Request,
  env: Env,
  id: number,
  url: URL,
  ctx: ExecutionContext
): Promise<Response> {
  return withEdgeCache(request, ctx, DISEASE_TTL, async () => {
    const row = await first<DiseaseRecord>(env.DB, "SELECT * FROM disease WHERE id = ?", [id]);
    if (!row) throw new HttpError(404, "没有找到该疾病", "disease_not_found");

    const requested = (url.searchParams.get("symptoms") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const graph = await buildExplain(
      env,
      { id: row.id, name: row.name, symptom_list: row.symptom_list ?? "" },
      requested,
      3
    );
    return json({ disease: toDiseaseDTO(row), graph });
  });
}
