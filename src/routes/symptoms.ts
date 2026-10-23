/**
 * Symptom lookup.
 *
 * Two request shapes share this module because both back the same search box and
 * the same "click a body part" panel:
 *   GET /api/symptoms/search?q=偏&limit=20   -> autocomplete
 *   GET /api/symptoms?part=头部&limit=50     -> symptoms of one body part
 */

import { all } from "../db";
import { clampInt, json, withEdgeCache } from "../http";

const SEARCH_TTL = 86_400;

interface SymptomRow {
  id: number;
  name: string;
  initial: string;
  initials: string;
  parts: string;
  families: string;
}

interface SymptomBrief {
  id: number;
  name: string;
  parts: string[];
  families: string[];
  initial: string;
  initials: string;
}

function toBrief(row: SymptomRow): SymptomBrief {
  const parse = (raw: string): string[] => {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  };
  return {
    id: row.id,
    name: row.name,
    parts: parse(row.parts),
    families: parse(row.families),
    initial: row.initial ?? "",
    initials: row.initials ?? ""
  };
}

const BRIEF_COLUMNS = "s.id, s.name, s.initial, s.initials, s.parts, s.families";

/**
 * Latin input is matched against the pinyin columns (prefix only, so both indexes
 * are usable). Chinese input goes through `symptom_gram`, because a `LIKE '%x%'`
 * scan would cost one row read per symptom on every keystroke.
 */
function isLatin(query: string): boolean {
  return /^[a-z]+$/i.test(query);
}

async function searchByPinyin(db: D1Database, query: string, limit: number): Promise<SymptomBrief[]> {
  const prefix = `${query.toLowerCase()}%`;
  const rows = await all<SymptomRow>(
    db,
    `SELECT ${BRIEF_COLUMNS}
       FROM symptom s
      WHERE s.initial LIKE ?1 OR s.initials LIKE ?1
      ORDER BY LENGTH(s.name) ASC, s.name ASC
      LIMIT ?2`,
    [prefix, limit]
  );
  return rows.map(toBrief);
}

async function searchBySubstring(db: D1Database, query: string, limit: number): Promise<SymptomBrief[]> {
  // The gram table only holds substrings up to three characters, so longer input
  // is anchored on its first three characters and then filtered exactly.
  const anchor = Array.from(query).slice(0, 3).join("");
  const rows = await all<SymptomRow>(
    db,
    `SELECT ${BRIEF_COLUMNS}, MIN(g.pos) AS pos
       FROM symptom_gram g
       JOIN symptom s ON s.id = g.symptom_id
      WHERE g.gram = ?1 AND s.name LIKE ?2
      GROUP BY s.id
      ORDER BY pos ASC, LENGTH(s.name) ASC, s.name ASC
      LIMIT ?3`,
    [anchor, `%${query}%`, limit]
  );
  return rows.map(toBrief);
}

export async function searchSymptoms(
  request: Request,
  env: Env,
  url: URL,
  ctx: ExecutionContext
): Promise<Response> {
  const query = (url.searchParams.get("q") ?? "").trim();
  const limit = clampInt(url.searchParams.get("limit"), 20, 1, 50);
  if (!query) return json({ query: "", items: [] });

  return withEdgeCache(request, ctx, SEARCH_TTL, async () => {
    const items = isLatin(query)
      ? await searchByPinyin(env.DB, query, limit)
      : await searchBySubstring(env.DB, query, limit);
    return json({ query, items });
  });
}

/**
 * `part` accepts a comma separated list because the dataset names the same region
 * inconsistently (`头` and `头部` both exist, 309 and 145 symptoms). The body map
 * sends every alias for a zone at once and the result is de-duplicated.
 */
export async function listSymptomsByPart(
  request: Request,
  env: Env,
  url: URL,
  ctx: ExecutionContext
): Promise<Response> {
  const raw = (url.searchParams.get("part") ?? "").trim();
  const parts = [...new Set(raw.split(",").map((item) => item.trim()).filter(Boolean))].slice(0, 4);
  if (parts.length === 0) return json({ part: "", items: [] });

  // The UI now fetches a whole body part once and filters by pinyin initial in the
  // browser, so the ceiling has to cover the largest part (全身 ~1k symptoms).
  const limit = clampInt(url.searchParams.get("limit"), 50, 1, 5000);
  const offset = clampInt(url.searchParams.get("offset"), 0, 0, 5000);
  // Optional pinyin initial filter, the A-Z strip the original UI had.
  const letter = (url.searchParams.get("letter") ?? "").trim().toUpperCase();
  const useLetter = /^[A-Z]$/.test(letter);
  const letterSql = useLetter ? " AND UPPER(SUBSTR(s.initial, 1, 1)) = ?" : "";
  const placeholders = parts.map(() => "?").join(", ");

  return withEdgeCache(request, ctx, SEARCH_TTL, async () => {
    const rows = await all<SymptomRow>(
      env.DB,
      `SELECT DISTINCT ${BRIEF_COLUMNS}
         FROM symptom_part p
         JOIN symptom s ON s.id = p.symptom_id
        WHERE p.part IN (${placeholders})${letterSql}
        ORDER BY LENGTH(s.name) ASC, s.name ASC
        LIMIT ? OFFSET ?`,
      [...parts, ...(useLetter ? [letter] : []), limit, offset]
    );
    return json({
      part: parts.join(","),
      parts,
      letter: useLetter ? letter : "",
      items: rows.map(toBrief)
    });
  });
}
