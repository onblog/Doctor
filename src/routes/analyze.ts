/**
 * POST /api/analyze -- the core self-assessment endpoint.
 *
 * Request body:
 *   { "sex": "female" | "女", "age": 28 | [28, 35], "symptoms": ["头痛"], "symptom": ["头痛"] }
 *
 * The graph lookup is one indexed join on `disease_symptom`. Department screening,
 * counting and ordering also happen in SQL, so the Worker only does the final
 * score computation in memory.
 */

import { all, DISEASE_LIST_COLUMNS, first, toDiseaseSummary, type DiseaseRecord } from "../db";
import { HttpError, json, readJson } from "../http";
import {
  buildScopeFilter,
  CANDIDATE_LIMIT,
  extractRelatedSymptoms,
  normalizeAge,
  normalizeSex,
  normalizeSymptoms,
  rankDiseases,
  type DiseaseRow
} from "../lib/diagnose";

interface AnalyzeBody {
  sex?: unknown;
  age?: unknown;
  job?: unknown;
  symptom?: unknown;
  symptoms?: unknown;
}

export async function analyze(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") throw new HttpError(405, "该接口只接受 POST", "method_not_allowed");

  const body = await readJson<AnalyzeBody>(request);
  const submitted = normalizeSymptoms(body.symptoms ?? body.symptom);
  if (submitted.length === 0) throw new HttpError(400, "请至少选择一个症状后再开始分析", "no_symptom");

  // 不做别名归一：robot.sql 的关系表本身就是「头痛」「腹痛」这类原始写法，
  // 直接按名字去 disease_symptom 里匹配即可；只有关系表里完全没出现的名字才算未收录。
  const submittedPlaceholders = submitted.map(() => "?").join(", ");
  const known = await all<{ symptom_name: string }>(
    env.DB,
    `SELECT DISTINCT symptom_name FROM disease_symptom WHERE symptom_name IN (${submittedPlaceholders})`,
    submitted
  );
  const knownSet = new Set(known.map((row) => row.symptom_name));
  const symptoms = submitted.filter((name) => knownSet.has(name));
  const unresolved = submitted.filter((name) => !knownSet.has(name));
  if (symptoms.length === 0) {
    throw new HttpError(400, `知识库中没有这些症状：${unresolved.join("、")}`, "no_match");
  }

  const sex = normalizeSex(body.sex);
  const age = normalizeAge(body.age);
  const scope = buildScopeFilter(sex, age);

  const symptomPlaceholders = symptoms.map(() => "?").join(", ");
  const candidates = await all<DiseaseRow>(
    env.DB,
    `SELECT ${DISEASE_LIST_COLUMNS}
       FROM disease d
       JOIN (
         SELECT disease_id, COUNT(*) AS hits
           FROM disease_symptom
          WHERE symptom_name IN (${symptomPlaceholders})
          GROUP BY disease_id
       ) m ON m.disease_id = d.id
      WHERE 1 = 1${scope.sql}
      ORDER BY m.hits DESC, d.name ASC
      LIMIT ${CANDIDATE_LIMIT}`,
    [...symptoms, ...scope.params]
  );

  const ranked = rankDiseases(candidates, symptoms);
  const rankedIds = ranked.map((item) => item.id);

  const detailRows = rankedIds.length
    ? await all<DiseaseRecord>(
        env.DB,
        `SELECT * FROM disease WHERE id IN (${rankedIds.map(() => "?").join(", ")})`,
        rankedIds
      )
    : [];
  const detailById = new Map(detailRows.map((row) => [row.id, row]));

  const diseases = ranked.flatMap((item) => {
    const row = detailById.get(item.id);
    if (!row) return [];
    return [{ ...toDiseaseSummary(row), matched: item.matched, score: item.score }];
  });

  // Terms that no disease links to are reported so nothing is silently dropped.
  const unknownSymptoms = unresolved;

  const relatedDiseases = detailRows.filter((row) => rankedIds.includes(row.id));

  return json({
    input: { sex, age, symptoms, submitted },
    diseases,
    symptoms: extractRelatedSymptoms(relatedDiseases, symptoms),
    // 保留字段以兼容前端：现在不做别名归一，因此恒为空数组
    resolved: [] as Array<{ from: string; to: string }>,
    unknownSymptoms,
    candidateCount: candidates.length
  });
}
