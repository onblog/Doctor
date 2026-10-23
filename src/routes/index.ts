/**
 * `/api/` routing table.
 *
 * Every backend endpoint lives under this prefix, and nothing outside it reaches
 * the Worker (see `run_worker_first` in wrangler.jsonc), so static assets are
 * served by the edge for free.
 */

import { HttpError } from "../http";
import { analyze } from "./analyze";
import { getDisease, getDiseaseContext, searchDiseases } from "./diseases";
import { explainGraph, getGraph } from "./graph";
import { health } from "./health";
import { listParts } from "./parts";
import { listSymptomsByPart, searchSymptoms } from "./symptoms";

function requireGet(request: Request): void {
  if (request.method !== "GET") throw new HttpError(405, "该接口只接受 GET", "method_not_allowed");
}

export async function handleApi(
  request: Request,
  env: Env,
  url: URL,
  ctx: ExecutionContext
): Promise<Response> {
  const { pathname } = url;

  if (pathname === "/api/health") {
    requireGet(request);
    return health(request, env, ctx);
  }

  if (pathname === "/api/parts") {
    requireGet(request);
    return listParts(request, env, url, ctx);
  }

  if (pathname === "/api/symptoms/search") {
    requireGet(request);
    return searchSymptoms(request, env, url, ctx);
  }

  if (pathname === "/api/symptoms") {
    requireGet(request);
    return listSymptomsByPart(request, env, url, ctx);
  }

  if (pathname === "/api/analyze") return analyze(request, env);

  if (pathname === "/api/diseases") {
    requireGet(request);
    return searchDiseases(request, env, url, ctx);
  }

  const context = /^\/api\/diseases\/(\d+)\/context$/.exec(pathname);
  if (context) {
    requireGet(request);
    return getDiseaseContext(request, env, Number.parseInt(context[1], 10), url, ctx);
  }

  const detail = /^\/api\/diseases\/(\d+)$/.exec(pathname);
  if (detail) {
    requireGet(request);
    return getDisease(request, env, Number.parseInt(detail[1], 10), ctx);
  }

  if (pathname === "/api/graph/explain") {
    requireGet(request);
    return explainGraph(request, env, url, ctx);
  }

  if (pathname === "/api/graph") {
    requireGet(request);
    return getGraph(env, url);
  }

  throw new HttpError(404, "接口不存在", "not_found");
}
