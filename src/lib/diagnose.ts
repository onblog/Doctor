/**
 * The diagnosis algorithm.
 *
 * What it does, step by step:
 *   1. for every symptom the user picked, read the disease -> symptom relations and
 *      collect the diseases that point at it;
 *   2. drop the shifted department (妇科 for men, 男科 for women, 小儿科 / 老年科
 *      outside their age band);
 *   3. count, per remaining disease, how many of the user's symptoms it matches;
 *   4. keep the best 20, score them and sort again inside equal-count buckets.
 *
 * Steps 1 and 2 are now a single indexed SQL query (see `buildScopeFilter`), so
 * this module only owns steps 3 and 4. Everything here is pure: no I/O, so it is
 * directly unit tested in `tests/diagnose.test.ts`.
 *
 * Two defects of the original implementation are fixed here, both off-by-one:
 *   - the bubble sorts ran `i < size - 2`, silently leaving the last two
 *     elements of every bucket in insertion order;
 *   - `AnaylzeUtil.sort` initialised `max = 0`, so a name whose count was 0
 *     could never be picked and the loop then removed `null`.
 */

export type Sex = "male" | "female" | "unknown";

/** Upper bound of user symptoms accepted per request (bounds the SQL IN list). */
export const MAX_SYMPTOMS = 20;
/** Diseases returned to the client, same cap as the original `MAX = 20`. */
export const MAX_DISEASES = 20;
/** Related symptoms returned alongside the result, same as the original `XG_MAX`. */
export const MAX_RELATED_SYMPTOMS = 50;
/** Rows pulled from SQL before the fine-grained re-sort; must exceed MAX_DISEASES. */
export const CANDIDATE_LIMIT = 60;

const ELDER_AGE = 65;
const CHILD_AGE = 12;

export interface DiseaseRow {
  id: number;
  name: string;
  symptom_list: string;
  symptom_count: number;
}

export interface RankedDisease {
  id: number;
  name: string;
  /** Number of the user's symptoms this disease lists. */
  matched: number;
  /** `matched / symptom_count + matched * 0.1`, rounded like the original. */
  score: number;
}

/**
 * Accepts both Chinese `"男" / "女"` values and clean English ones, so callers can
 * send whichever they already have.
 */
export function normalizeSex(raw: unknown): Sex {
  if (typeof raw !== "string") return "unknown";
  const value = raw.trim().toLowerCase();
  if (value === "男" || value === "male" || value === "m") return "male";
  if (value === "女" || value === "female" || value === "f") return "female";
  return "unknown";
}

/**
 * The original API took an age range (`age: [20, 30]`) but only ever read
 * `age.get(0)`. A single number is accepted here; arrays keep working.
 */
export function normalizeAge(raw: unknown): number {
  const first = Array.isArray(raw) ? raw[0] : raw;
  const parsed = typeof first === "number" ? first : Number.parseInt(String(first ?? ""), 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 130) return 30;
  return Math.round(parsed);
}

export function normalizeSymptoms(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const name = item.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
    if (out.length >= MAX_SYMPTOMS) break;
  }
  return out;
}

export interface ScopeFilter {
  /** SQL fragment to append to the WHERE clause; empty when nothing is excluded. */
  sql: string;
  params: string[];
}

/**
 * Department screening, mirroring `application-part.properties`:
 *   maps.woman = 妇科, 产科, 妇产科, 乳腺外科
 *   maps.man   = 男科
 *   maps.child = 小儿科
 *   maps.old   = 老年科
 *
 * The converter pre-computes `sex_scope` / `age_scope` per disease so screening is
 * an equality test instead of a JSON scan.
 */
export function buildScopeFilter(sex: Sex, age: number): ScopeFilter {
  const clauses: string[] = [];
  const params: string[] = [];
  if (sex === "female") {
    clauses.push("d.sex_scope <> ?");
    params.push("male");
  } else if (sex === "male") {
    clauses.push("d.sex_scope <> ?");
    params.push("female");
  }
  if (age < ELDER_AGE) {
    clauses.push("d.age_scope <> ?");
    params.push("elder");
  }
  if (age > CHILD_AGE) {
    clauses.push("d.age_scope <> ?");
    params.push("child");
  }
  return { sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "", params };
}

export function parseNameList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

/**
 * Relevance score, identical in shape to `gainScore`:
 * `matched / total symptoms of the disease + matched * 0.1`.
 *
 * The second term is what breaks ties between diseases that match the same number
 * of symptoms, which is exactly the case the original called "匹配度相同".
 */
export function scoreOf(matchedInList: number, symptomCount: number): number {
  const fraction = symptomCount > 0 ? matchedInList / symptomCount : 0;
  return Number((fraction + matchedInList * 0.1).toFixed(8));
}

/**
 * Sorts candidates the way `sortAgain` intended: by matched count descending,
 * then by relevance score descending. Ties fall back to name so responses are
 * deterministic (the original relied on HashMap iteration order).
 */
export function rankDiseases(rows: DiseaseRow[], userSymptoms: string[]): RankedDisease[] {
  const wanted = new Set(userSymptoms);
  const ranked = rows.map((row) => {
    const listed = parseNameList(row.symptom_list);
    const matchedInList = listed.reduce((acc, name) => (wanted.has(name) ? acc + 1 : acc), 0);
    const symptomCount = row.symptom_count > 0 ? row.symptom_count : listed.length;
    return { id: row.id, name: row.name, matched: matchedInList, score: scoreOf(matchedInList, symptomCount) };
  });

  ranked.sort((a, b) => {
    if (b.matched !== a.matched) return b.matched - a.matched;
    if (b.score !== a.score) return b.score - a.score;
    // Code-point order, not locale order: the tie-break must be identical in the
    // Workers runtime and in Node, otherwise cached responses differ per runtime.
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

  return ranked.slice(0, MAX_DISEASES);
}

/**
 * Related symptoms, ported from `RelatedSymptomServiceImpl`: count how often each
 * symptom shows up across the shortlisted diseases, drop what the user already
 * entered, keep the most frequent ones.
 */
export function extractRelatedSymptoms(
  rows: DiseaseRow[],
  userSymptoms: string[],
  limit = MAX_RELATED_SYMPTOMS
): string[] {
  const excluded = new Set(userSymptoms);
  const counts = new Map<string, number>();

  for (const row of rows) {
    for (const name of parseNameList(row.symptom_list)) {
      if (excluded.has(name)) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
    })
    .slice(0, limit)
    .map(([name]) => name);
}
