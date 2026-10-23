# API reference

All endpoints live under `/api/` and speak JSON in and JSON out. Errors always use one shape:

```json
{ "error": "人类可读的说明", "code": "stable_machine_code" }
```

`GET` responses on lookup endpoints carry `cache-control: public, max-age=86400` and are stored in
the edge cache, so a repeated query costs no D1 reads.

---

## GET /api/health

Deployment smoke test and dataset size. Cached for 60 seconds.

```json
{
  "ok": true,
  "service": "doctor",
  "version": "1.0.0",
  "dataset": { "diseases": 10, "symptoms": 25, "edges": 35, "builtAt": "2026-10-19T07:54:31.657Z" }
}
```

`ok` is true when the `meta` table reports a non-zero disease count.

---

## GET /api/symptoms/search

| Query | Type | Default | Notes |
| --- | --- | --- | --- |
| `q` | string | – | Chinese text or Latin pinyin |
| `limit` | int | 20 | clamped to 1..50 |

Latin input is matched against the pinyin columns as a **prefix** (index seek). Chinese input goes
through `symptom_gram`, which indexes every 1–3 character substring, so a contains-style lookup is
still an index seek rather than a full scan.

```json
{
  "query": "头痛",
  "items": [
    { "id": 1, "name": "头痛", "parts": ["头部"], "families": ["神经内科"], "initial": "toutong", "initials": "tt" }
  ]
}
```

---

## GET /api/symptoms

Symptoms of one body part.

| Query | Type | Default | Notes |
| --- | --- | --- | --- |
| `part` | string | required | one tag, or a comma separated list (`头,头部`); max 4 |
| `limit` | int | 50 | 1..200 |
| `offset` | int | 0 | 0..5000 |

The dataset names the same region inconsistently (`头` with 309 symptoms and `头部` with 145), so
the body map sends every alias at once and the result is de-duplicated. The response echoes the
normalised `parts` array.

---

## GET /api/parts

```json
{ "items": [{ "name": "头部", "count": 5 }], "total": 25 }
```

Ordered by count descending. `total` is the sum of the per-part counts (a symptom with two body
parts counts twice).

---

## POST /api/analyze

The core endpoint.

```json
{
  "sex": "female",
  "age": 28,
  "symptoms": ["头痛", "恶心"]
}
```

| Field | Accepted | Notes |
| --- | --- | --- |
| `sex` | `male` / `female` / `unknown`, or `男` / `女` | unknown means no sex screening |
| `age` | number or `[min, max]` | only the first element of a range is used, as before |
| `symptoms` | string[] | max 20, trimmed and de-duplicated |
| `symptom` | string[] | alias for `symptoms` |

Response:

```json
{
  "input": { "sex": "female", "age": 28, "symptoms": ["头痛", "恶心"] },
  "diseases": [
    {
      "id": 1,
      "name": "偏头痛",
      "intro": "一种反复发作的原发性头痛，常伴恶心与畏光。",
      "parts": ["头部"],
      "families": ["神经内科"],
      "sexScope": "any",
      "ageScope": "any",
      "symptomCount": 4,
      "symptoms": ["头痛", "恶心", "呕吐", "畏光"],
      "matched": 2,
      "score": 0.7
    }
  ],
  "symptoms": ["呕吐", "发热", "咳嗽"],
  "resolved": [{ "from": "头痛", "to": "全头痛" }],
  "unknownSymptoms": [],
  "candidateCount": 9
}
```

- `diseases` is capped at 20 items, ordered by `matched` descending then `score` descending.
- `matched` is how many of the submitted symptoms the disease lists.
- `score` is `matched / symptomCount + matched * 0.1`. It is a **ranking value, not a probability**.
- `symptoms` are related symptoms (top 50) that appear across the shortlisted diseases, with the
  user's own input removed.
- `resolved` maps every input term that was not a dictionary key onto the entry it was matched to
  (shortest dictionary name containing the input). The dictionary holds granular phrases, so a plain
  `头痛` resolves to `全头痛`.
- `unknownSymptoms` lists terms that could not be resolved or that no disease links to, so a typo is
  visible instead of silently ignored.
- `input.symptoms` is the resolved list; `input.submitted` is what the caller sent.

Errors: `400 no_symptom` when no usable symptom is submitted, `405 method_not_allowed` for non-POST.

---

## GET /api/diseases

| Query | Type | Default |
| --- | --- | --- |
| `q` | string | required |
| `limit` | int | 20 (1..50) |

Matches `name LIKE %q% OR initial LIKE q% OR initials LIKE q%`. Returns summary objects (no long
text fields) so the list stays small.

---

## GET /api/diseases/:id

Full record: all seven long text fields plus parsed `symptoms` / `complications` arrays.
`404 disease_not_found` when the id does not exist.

---

## GET /api/graph

| Query | Type | Notes |
| --- | --- | --- |
| `id` | int | either `id` or `name` is required |
| `name` | string | exact disease name |

```json
{
  "id": 1,
  "name": "偏头痛",
  "nodes": [
    { "id": 0, "name": "偏头痛", "value": "…", "group": 0 },
    { "id": 1, "name": "病因", "value": "…", "group": 1 },
    { "id": 7, "name": "头痛", "value": "", "group": 2 }
  ],
  "links": [{ "source": 0, "target": 1, "relation": "属性" }]
}
```

`group` 0 is the disease, 1 the six attribute nodes, 2 the symptom neighbours (max 12).
