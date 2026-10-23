<div align="center">

<img src="docs/assets/logo.svg" width="104" alt="医疗知识图谱" />

# Doctor

**医疗知识图谱 · 基于知识图谱的医疗症状自查 —— 一个页面、三个步骤、一个 Worker。**

<a href="https://doctor.wordtk.com"><img alt="在线体验" src="https://img.shields.io/badge/%E2%96%B6_%E5%9C%A8%E7%BA%BF%E4%BD%93%E9%AA%8C-doctor.wordtk.com-79b15b?style=for-the-badge"></a>

<br/>

<img alt="license" src="https://img.shields.io/github/license/onblog/doctor?style=flat-square">
<img alt="runtime" src="https://img.shields.io/badge/runtime-Cloudflare_Workers-f38020?style=flat-square">
<img alt="database" src="https://img.shields.io/badge/database-D1-2f7d52?style=flat-square">
<img alt="data" src="https://img.shields.io/badge/data-7%2C733_%E7%96%BE%E7%97%85%C2%B7_4%2C697_%E7%97%87%E7%8A%B6%C2%B7_96%2C134_%E5%85%B3%E7%B3%BB-4d7a35?style=flat-square">

<br/><br/>

🇨🇳 **简体中文** &nbsp;·&nbsp; [🇺🇸 English](README.md)

<br/>

<img src="docs/assets/home.webp" width="880" alt="Doctor 症状自查">

</div>

> 填写性别与年龄，点人体部位选症状。Doctor 会沿着「疾病 ↔ 症状」图谱反查候选疾病，先按科室排除，
> 再按「解释了你多少症状」排序。只做健康科普与自我了解，**不构成诊断**。

---

## 目录

| | |
| --- | --- |
| [它能做什么](#它能做什么) | [判断逻辑](#判断逻辑) |
| [界面截图](#界面截图) | [本地运行](#本地运行) |
| [接口](#接口) | [使用完整数据集](#使用完整数据集) |
| [部署](#部署) | [目录结构](#目录结构) |
| [成本与额度](#成本与额度) | [许可](#许可) |

---

## 它能做什么

- **单页三步**：填信息 → 选症状 → 看结果，不跳路由、不整页刷新。
- **人体图是主要入口**：前后两张人体图，热区覆盖头、胸、腹、腰、盆腔、四肢；
  鼠标移到头部会就地展开 眼/鼻/口/牙/耳/眉，不占用图外空间。
- **症状面板浮在人体图右侧**：单个部位动辄几百个症状，用 A-Z 拼音首字母筛选，页面不会上下乱跳。
- **结果用弹窗 + 推导图谱**：左边是你勾选的症状，右边是它们指向的疾病（当前疾病高亮），连线就是推导关系。

## 判断逻辑

1. 把你选的症状映射到图谱里的症状节点。
2. 反向走边：哪些疾病指向这些症状。
3. 按性别与年龄排除不可能的科室（妇科 / 男科 / 小儿科 / 老年科）。
4. 先按命中症状数排序，再用 `命中数 / 该病症状总数 + 命中数 × 0.1` 打破平局。

列表的主排序是**这个疾病解释了你几个症状**；界面上的环形表示本次结果内的相对强度，不是患病概率。

## 界面截图

<div align="center">

| 人体图 + 右侧症状面板 | 结果弹窗里的推导图谱 |
| --- | --- |
| <img src="docs/assets/body-map.webp" width="420" alt="人体图与症状面板"> | <img src="docs/assets/reasoning.webp" width="420" alt="推导图谱"> |

<img src="docs/assets/result.webp" width="880" alt="分析结果">

</div>

## 本地运行

```bash
npm install

# 1. 建本地库
npx wrangler d1 execute doctor --local --file=./migrations/0001_init.sql

# 2. 用示例 dump 生成种子 SQL
node scripts/convert-mysql-dump.mjs db/sample-dump.sql

# 3. 导入
node scripts/load-d1.mjs --local

# 4. 启动
npm run dev          # http://127.0.0.1:8788
```

`npm test` 跑算法单元测试，`npm run check` 跑类型检查 + 测试。

## 接口

所有接口都在 `/api/` 下，全部 JSON。错误统一为 `{ "error": "…", "code": "…" }`。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| `GET` | `/api/health` | 健康检查 + 数据集规模 |
| `GET` | `/api/symptoms/search?q=&limit=` | 症状自动补全，支持中文与拼音 |
| `GET` | `/api/symptoms?part=&letter=&limit=` | 某部位症状，可选 A-Z 首字母过滤 |
| `GET` | `/api/parts` | 部位标签及数量 |
| `POST` | `/api/analyze` | 核心自查接口 |
| `GET` | `/api/diseases?q=` | 疾病检索 |
| `GET` | `/api/diseases/:id` | 疾病完整记录 |
| `GET` | `/api/graph/explain?id=&symptoms=&per=` | 推导图谱：症状 → 疾病 |
| `GET` | `/api/graph?id=` | 单疾病的属性图谱 |

```bash
curl -X POST https://doctor.wordtk.com/api/analyze \
  -H 'content-type: application/json' \
  -d '{"sex":"女","age":[28,35],"symptom":["头痛","恶心"]}'
```

也支持中文性别值与 `age` 数组写法，例如 `{"sex":"女","age":[28,35],"symptom":["头痛"]}`。字段级说明见
[docs/zh-CN/api.md](docs/zh-CN/api.md)。

## 使用完整数据集

仓库里只有手工编写的演示子集，完整知识库另行商业授权。

```bash
mkdir -p _data && cp /path/to/robot.sql _data/     # 120+ MB 的 mysqldump
node scripts/convert-mysql-dump.mjs               # -> build/seed-*.sql
node scripts/load-d1.mjs --local                  # 或 --remote
```

转换脚本直接读 mysqldump：解析 `CREATE TABLE` 拿到列顺序，把存放列表字段的侧表还原成 JSON 数组，
推导性别/年龄科室范围，计算拼音键，最后输出适合 `wrangler d1 execute` 的分片 SQL。

### 按天分批导入

一次全量约 **17.3 万行写入**，免费版每天 **10 万行**。先切分，再分两天导：

```bash
npm run data:days                        # 生成 build/day-1、build/day-2 与 days.json
npm run data:load -- --remote --day 1    # 约 8.67 万行
npm run data:load -- --remote --day 2    # 余下部分，第二天再跑
```

`days.json` 记录了每天的行数和涉及的表，跑之前就能看到这批要消耗多少写入。

## 部署

```bash
npx wrangler login
npx wrangler d1 create doctor          # 复制返回的 database_id
# 填进 wrangler.jsonc 后：
npm run data:load -- --remote
npm run deploy
```

Worker 通过 `wrangler.jsonc` 的 `routes`（`custom_domain: true`）绑定到 `doctor.wordtk.com`，
并关闭了 `workers.dev` 子域，保证对外只有一个入口。

## 目录结构

```
src/
  index.ts            Worker 入口、/api/ 分发、错误封装
  http.ts             JSON 工具与边缘缓存
  db.ts               D1 访问与行 -> DTO 映射
  lib/diagnose.ts     打分与排序，纯函数且有单元测试
  routes/             health、symptoms、parts、analyze、diseases、graph
public/
  index.html          单页外壳（三步）
  assets/app.css      布局与主题
  assets/app.js       步骤流转、人体图、搜索、d3 推导图谱
  assets/body/        前后人体图素材
  assets/vendor/      d3 v3（只打开疾病详情时才加载）
migrations/           D1 表结构
db/sample-dump.sql    手写演示数据（mysqldump 格式）
scripts/              dump 转换器、按天切分、D1 导入器
tests/                算法测试
```

## 成本与额度

静态资源请求不计入 Worker 调用，接口面也很窄。截至 2026 年 10 月，免费版为每天 10 万次 Worker 请求、
每次 10 ms CPU；D1 每天 500 万行读、10 万行写。实际使用前请按
[官方 Limits 文档](https://developers.cloudflare.com/workers/platform/limits/)复核。

热点路径只有一次索引 join 加内存打分，瓶颈不是 CPU 而是**行读**。这就是为什么检索全部走索引定位，
而不是 `LIKE '%…%'` 全表扫描。

## 许可

Copyright (C) 2026 onblog。

代码采用 **AGPL-3.0-only** 许可，见 [LICENSE](LICENSE)。你可以自由使用、修改、自行部署甚至收费分发，
前提是衍生作品、以及基于它提供的网络服务，同样以 AGPL-3.0 开源。

如果这个条件不适用于你（例如闭源分发、或闭源托管服务），可以购买**商业授权**：<hello@wordtk.com>。

**数据集不在 AGPL-3.0 的授权范围内**，单独按商业协议授权；因此本仓库只包含一份手写的小样本。

---

<div align="center">

**Doctor** · 基于 Cloudflare Workers、D1 与 d3 构建

<a href="https://doctor.wordtk.com">在线体验</a> ·
<a href="docs/zh-CN/api.md">接口文档</a> ·
<a href="README.md">English</a>

<sub>本工具输出仅供健康科普与自我了解，不构成诊断、治疗方案或用药建议，也不能替代医生。</sub>

</div>
