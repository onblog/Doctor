# 接口文档

所有接口都在 `/api/` 下，请求与响应均为 JSON。错误响应统一为：

```json
{ "error": "人类可读的说明", "code": "稳定的机器标识" }
```

检索类 `GET` 响应带 `cache-control: public, max-age=86400` 并写入边缘缓存，重复查询不再消耗 D1 行读。

---

## GET /api/health

部署自检与数据集规模，缓存 60 秒。

```json
{
  "ok": true,
  "service": "doctor",
  "version": "1.0.0",
  "dataset": { "diseases": 10, "symptoms": 25, "edges": 35, "builtAt": "2026-10-19T07:54:31.657Z" }
}
```

`ok` 为 true 表示 `meta` 表里疾病数不为 0。

---

## GET /api/symptoms/search

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `q` | string | 必填 | 中文或拼音 |
| `limit` | int | 20 | 限制在 1..50 |

拉丁字母输入走拼音列的前缀匹配（索引定位）；中文输入走 `symptom_gram`——它把每个症状名的
1~3 字子串都建了索引，所以「包含匹配」同样是一次索引定位，而不是全表扫描。

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

按部位取症状。

| 参数 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `part` | string | 必填 | 单个部位标签，或逗号分隔的多个（`头,头部`），最多 4 个 |
| `limit` | int | 50 | 1..200 |
| `offset` | int | 0 | 0..5000 |

---

## GET /api/parts

```json
{ "items": [{ "name": "头部", "count": 5 }], "total": 25 }
```

按数量倒序。`total` 是各部位数量之和（一个症状挂两个部位会被计两次）。

同一部位在数据里有多种写法（`头` 309 条、`头部` 145 条），人体图会一次传入全部别名，结果按症状去重，
响应里回显归一后的 `parts` 数组。

---

## POST /api/analyze

核心自查接口。

```json
{
  "sex": "female",
  "age": 28,
  "symptoms": ["头痛", "恶心"]
}
```

| 字段 | 可用取值 | 说明 |
| --- | --- | --- |
| `sex` | `male` / `female` / `unknown`，或 `男` / `女` | unknown 不做性别排除 |
| `age` | 数字，或 `[min, max]` | 传数组时只取第一个，与原实现一致 |
| `symptoms` | string[] | 最多 20 个，自动去空格与去重 |
| `symptom` | string[] | 旧字段名，等价于 `symptoms` |

响应：

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

- `diseases` 最多 20 条，先按 `matched` 倒序，再按 `score` 倒序。
- `matched` 是提交症状中该疾病收录了几个。
- `score = matched / symptomCount + matched * 0.1`，是**排序值，不代表患病概率**。
- `symptoms` 是短名单疾病的共同症状（最多 50 个），已剔除用户自己输入的词。
- `resolved` 列出被归一化的输入词：词典里存的是细粒度短语（`全头痛`、`头痛为搏动性`），
  所以直接输入 `头痛` 会解析成「包含该词且最短」的词条。
- `unknownSymptoms` 返回既无法归一、也没有任何疾病关联的词，打错字时能立刻看出来，而不是被静默忽略。
- `input.symptoms` 是归一后的列表，`input.submitted` 是调用方原始输入。

错误：未提交有效症状时 `400 no_symptom`；非 POST 请求 `405 method_not_allowed`。

---

## GET /api/diseases

| 参数 | 类型 | 默认 |
| --- | --- | --- |
| `q` | string | 必填 |
| `limit` | int | 20（1..50） |

匹配 `name LIKE %q% OR initial LIKE q% OR initials LIKE q%`，返回摘要对象（不含大文本字段）。

---

## GET /api/diseases/:id

返回完整记录：七个长文本字段，以及解析好的 `symptoms` / `complications` 数组。
id 不存在时返回 `404 disease_not_found`。

---

## GET /api/graph

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | int | `id` 与 `name` 二选一 |
| `name` | string | 疾病全名 |

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

`group`：0 为疾病本体，1 为六个属性节点，2 为症状邻居（最多 12 个）。
