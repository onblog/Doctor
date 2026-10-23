/** GET /api/health -- deployment smoke test, also reports how big the dataset is. */

import { all } from "../db";
import { json, withEdgeCache } from "../http";

const HEALTH_TTL = 60;

export async function health(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  return withEdgeCache(request, ctx, HEALTH_TTL, async () => {
    const rows = await all<{ key: string; value: string }>(env.DB, "SELECT key, value FROM meta");
    const meta: Record<string, string> = {};
    for (const row of rows) meta[row.key] = row.value;

    const diseaseCount = Number.parseInt(meta.disease_count ?? "0", 10);
    return json({
      ok: diseaseCount > 0,
      service: "doctor",
      version: "1.0.0",
      dataset: {
        diseases: diseaseCount,
        symptoms: Number.parseInt(meta.symptom_count ?? "0", 10),
        edges: Number.parseInt(meta.edge_count ?? "0", 10),
        builtAt: meta.built_at ?? null
      }
    });
  });
}
