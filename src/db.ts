/**
 * D1 access helpers and row -> DTO mapping.
 *
 * Every list field in the database is a JSON array stored as TEXT (SQLite has no
 * array type). Parsing happens here, in one place, so routes stay free of
 * `JSON.parse` noise and a malformed row degrades to an empty list instead of a
 * 500.
 */

import { parseNameList } from "./lib/diagnose";

export async function all<T>(db: D1Database, sql: string, params: unknown[] = []): Promise<T[]> {
  const statement = params.length ? db.prepare(sql).bind(...params) : db.prepare(sql);
  const { results } = await statement.all<T>();
  return results ?? [];
}

export async function first<T>(db: D1Database, sql: string, params: unknown[] = []): Promise<T | null> {
  const statement = params.length ? db.prepare(sql).bind(...params) : db.prepare(sql);
  return ((await statement.first<T>()) ?? null) as T | null;
}

/** Raw `disease` row, exactly as stored. */
export interface DiseaseRecord {
  id: number;
  name: string;
  initial: string;
  initials: string;
  parts: string;
  families: string;
  sex_scope: string;
  age_scope: string;
  intro: string;
  cause: string;
  diagnose: string;
  cure: string;
  prevent: string;
  complication: string;
  symptom: string;
  symptom_list: string;
  complication_list: string;
  symptom_count: number;
}

export interface DiseaseDTO {
  id: number;
  name: string;
  initial: string;
  initials: string;
  parts: string[];
  families: string[];
  sexScope: string;
  ageScope: string;
  intro: string;
  cause: string;
  diagnose: string;
  cure: string;
  prevent: string;
  complication: string;
  symptom: string;
  symptoms: string[];
  complications: string[];
  symptomCount: number;
}

/** Raw `symptom` row. */
export interface SymptomRecord {
  id: number;
  name: string;
  initial: string;
  initials: string;
  parts: string;
  families: string;
  intro: string;
  cause: string;
  diagnose: string;
  examine: string;
}

export interface SymptomDTO {
  id: number;
  name: string;
  initial: string;
  initials: string;
  parts: string[];
  families: string[];
  intro: string;
  cause: string;
  diagnose: string;
  examine: string;
}

function parseJsonList(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function toDiseaseDTO(row: DiseaseRecord): DiseaseDTO {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial ?? "",
    initials: row.initials ?? "",
    parts: parseJsonList(row.parts),
    families: parseJsonList(row.families),
    sexScope: row.sex_scope ?? "any",
    ageScope: row.age_scope ?? "any",
    intro: row.intro ?? "",
    cause: row.cause ?? "",
    diagnose: row.diagnose ?? "",
    cure: row.cure ?? "",
    prevent: row.prevent ?? "",
    complication: row.complication ?? "",
    symptom: row.symptom ?? "",
    symptoms: parseNameList(row.symptom_list),
    complications: parseNameList(row.complication_list),
    symptomCount: row.symptom_count ?? 0
  };
}

export function toSymptomDTO(row: SymptomRecord): SymptomDTO {
  return {
    id: row.id,
    name: row.name,
    initial: row.initial ?? "",
    initials: row.initials ?? "",
    parts: parseJsonList(row.parts),
    families: parseJsonList(row.families),
    intro: row.intro ?? "",
    cause: row.cause ?? "",
    diagnose: row.diagnose ?? "",
    examine: row.examine ?? ""
  };
}

/** Columns needed by the diagnosis query; keeps `SELECT` lists honest. */
export const DISEASE_LIST_COLUMNS = "d.id, d.name, d.symptom_list, d.symptom_count";

/**
 * Light payload for result lists. The six long text fields stay behind
 * `GET /api/diseases/:id`, otherwise a 20 item list would ship ~60 KB of prose the
 * list view never renders.
 */
export interface DiseaseSummary {
  id: number;
  name: string;
  intro: string;
  parts: string[];
  families: string[];
  sexScope: string;
  ageScope: string;
  symptomCount: number;
  symptoms: string[];
}

const SUMMARY_SYMPTOMS = 12;

export function toDiseaseSummary(row: DiseaseRecord): DiseaseSummary {
  return {
    id: row.id,
    name: row.name,
    intro: row.intro ?? "",
    parts: parseJsonList(row.parts),
    families: parseJsonList(row.families),
    sexScope: row.sex_scope ?? "any",
    ageScope: row.age_scope ?? "any",
    symptomCount: row.symptom_count ?? 0,
    symptoms: parseNameList(row.symptom_list).slice(0, SUMMARY_SYMPTOMS)
  };
}
