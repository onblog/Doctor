/**
 * GET /api/graph?id=123 -- the knowledge graph payload for one disease.
 *
 * Shape: one centre node, six attribute nodes, plus the symptom neighbours, so the
 * drawing is an actual bipartite picture instead of a seven spoke star.
 */

import { all, first, type DiseaseRecord } from "../db";
import { HttpError, json, withEdgeCache } from "../http";
import { parseNameList } from "../lib/diagnose";

const EXPLAIN_TTL = 3600;
const PREVIEW_CHARS = 90;
const MAX_SYMPTOM_NODES = 8;

export interface GraphNode {
  id: number;
  name: string;
  value: string;
  group: 0 | 1 | 2;
}

export interface GraphLink {
  source: number;
  target: number;
  relation: string;
}

function preview(raw: string | null | undefined, fallback: string): string {
  const text = (raw ?? "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return Array.from(text).slice(0, PREVIEW_CHARS).join("") + (text.length > PREVIEW_CHARS ? "…" : "");
}

export async function getGraph(env: Env, url: URL): Promise<Response> {
  const idParam = url.searchParams.get("id");
  const nameParam = url.searchParams.get("name");

  let row: DiseaseRecord | null = null;
  if (idParam) {
    const id = Number.parseInt(idParam, 10);
    if (!Number.isFinite(id)) throw new HttpError(400, "id 必须是数字", "invalid_id");
    row = await first<DiseaseRecord>(env.DB, "SELECT * FROM disease WHERE id = ?", [id]);
  } else if (nameParam) {
    row = await first<DiseaseRecord>(env.DB, "SELECT * FROM disease WHERE name = ?", [nameParam]);
  } else {
    throw new HttpError(400, "缺少 id 或 name 参数", "missing_param");
  }

  if (!row) throw new HttpError(404, "没有找到该疾病", "disease_not_found");

  const attributes: Array<[string, string]> = [
    ["病因", preview(row.cause, "暂无资料")],
    ["症状", preview(row.symptom, "暂无资料")],
    ["诊断", preview(row.diagnose, "暂无资料")],
    ["并发症", preview(row.complication, "暂无资料")],
    ["治疗", preview(row.cure, "暂无资料")],
    ["预防", preview(row.prevent, "暂无资料")]
  ];

  const nodes: GraphNode[] = [{ id: 0, name: row.name, value: preview(row.intro, ""), group: 0 }];
  const links: GraphLink[] = [];

  attributes.forEach(([label, value], index) => {
    const nodeId = index + 1;
    nodes.push({ id: nodeId, name: label, value, group: 1 });
    links.push({ source: 0, target: nodeId, relation: "属性" });
  });

  const symptoms = parseNameList(row.symptom_list).slice(0, MAX_SYMPTOM_NODES);
  symptoms.forEach((name, index) => {
    const nodeId = attributes.length + 1 + index;
    nodes.push({ id: nodeId, name, value: "", group: 2 });
    links.push({ source: 0, target: nodeId, relation: "症状" });
  });

  return json({ id: row.id, name: row.name, nodes, links });
}


/* ----------------------------------------------------------------------------
 * GET /api/graph/explain?id=&symptoms=a,b,c&per=3
 *
 * The "how did we get here" graph, not the disease profile: every symptom the user
 * picked becomes a node, and each one points at its top diseases — always including
 * the disease under inspection. That is the reasoning chain the diagnosis performs,
 * made visible.
 * -------------------------------------------------------------------------- */

export interface ExplainNode {
  id: string;
  label: string;
  kind: "symptom" | "target" | "disease";
}

export interface ExplainLink {
  source: string;
  target: string;
}

const MAX_EXPLAIN_SYMPTOMS = 6;

export interface ExplainTarget {
  id: number;
  name: string;
  symptom_list: string;
}

export interface ExplainPayload {
  target: { id: number; name: string };
  symptoms: string[];
  nodes: ExplainNode[];
  links: ExplainLink[];
}

export async function explainGraph(
  request: Request,
  env: Env,
  url: URL,
  ctx: ExecutionContext
): Promise<Response> {
  const id = Number.parseInt(url.searchParams.get("id") ?? "", 10);
  if (!Number.isFinite(id)) throw new HttpError(400, "缺少有效的 id 参数", "invalid_id");

  const perParam = Number.parseInt(url.searchParams.get("per") ?? "3", 10);
  const per = Math.min(Math.max(Number.isFinite(perParam) ? perParam : 3, 2), 5);
  const requested = parseSymptomParam(url);

  return withEdgeCache(request, ctx, EXPLAIN_TTL, async () => {
    const target = await first<ExplainTarget>(
      env.DB,
      "SELECT id, name, symptom_list FROM disease WHERE id = ?",
      [id]
    );
    if (!target) throw new HttpError(404, "没有找到该疾病", "disease_not_found");
    return json(await buildExplain(env, target, requested, per));
  });
}

function parseSymptomParam(url: URL): string[] {
  return (url.searchParams.get("symptoms") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Build the reasoning graph for one disease. Shared by /api/graph/explain and
 * the combined disease+graph endpoint so the disease row is only read once.
 */
export async function buildExplain(
  env: Env,
  target: ExplainTarget,
  requested: string[],
  per: number
): Promise<ExplainPayload> {
  // Fall back to the disease's own symptom list so the graph is never empty.
  const symptoms = [
    ...new Set(requested.length ? requested : parseNameList(target.symptom_list).slice(0, 4))
  ].slice(0, MAX_EXPLAIN_SYMPTOMS);

  const targetNodeId = `d${target.id}`;
  const nodes = new Map<string, ExplainNode>();
  const links: ExplainLink[] = [];
  nodes.set(targetNodeId, { id: targetNodeId, label: target.name, kind: "target" });

  // One query per symptom, but all in flight at once: opening a disease used to
  // wait for four sequential round trips to D1 before anything was drawn.
  const groups = await Promise.all(
    symptoms.map(async (symptom) => ({
      symptom,
      others: await all<{ id: number; name: string }>(
        env.DB,
        `SELECT d.id, d.name
           FROM disease_symptom ds
           JOIN disease d ON d.id = ds.disease_id
          WHERE ds.symptom_name = ? AND d.id <> ?
          ORDER BY d.symptom_count DESC, d.name ASC
          LIMIT ?`,
        [symptom, target.id, Math.max(per - 1, 1)]
      )
    }))
  );

  for (const { symptom, others } of groups) {
    const symptomId = `s${symptom}`;
    nodes.set(symptomId, { id: symptomId, label: symptom, kind: "symptom" });
    links.push({ source: symptomId, target: targetNodeId });

    for (const other of others) {
      const nodeId = `d${other.id}`;
      nodes.set(nodeId, { id: nodeId, label: other.name, kind: "disease" });
      links.push({ source: symptomId, target: nodeId });
    }
  }

  return {
    target: { id: target.id, name: target.name },
    symptoms,
    nodes: [...nodes.values()],
    links
  };
}
