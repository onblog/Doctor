/** Body part tags with symptom counts. */

import { all } from "../db";
import { json, withEdgeCache } from "../http";

const PARTS_TTL = 86_400;

interface PartRow {
  name: string;
  count: number;
}

export async function listParts(request: Request, env: Env, _url: URL, ctx: ExecutionContext): Promise<Response> {
  return withEdgeCache(request, ctx, PARTS_TTL, async () => {
    const rows = await all<PartRow>(
      env.DB,
      `SELECT part AS name, COUNT(*) AS count
         FROM symptom_part
        GROUP BY part
        ORDER BY count DESC, name ASC`
    );
    return json({ items: rows, total: rows.reduce((sum, row) => sum + row.count, 0) });
  });
}
