-- Doctor schema (SQLite / Cloudflare D1)
--
-- Apply locally:  npx wrangler d1 execute doctor --local  --file=./migrations/0001_init.sql
-- Apply remote:   npx wrangler d1 execute doctor --remote --file=./migrations/0001_init.sql
--
-- Layout note: diseases, symptoms and their relations live in one SQLite database.
-- The disease -> symptom relation is a join table because it is always queried one
-- hop deep: "which diseases point at this symptom".

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------- diseases
-- `symptom_list` is the parsed list of symptom names taken from the free-text
-- `symptom` field by the original crawler. It is the only field the scoring
-- algorithm reads, so it is stored as a compact JSON array.
CREATE TABLE IF NOT EXISTS disease (
  id             INTEGER PRIMARY KEY,
  name           TEXT    NOT NULL UNIQUE,
  initial        TEXT    NOT NULL DEFAULT '',   -- ASCII pinyin, e.g. piantoutong for 偏头痛
  initials       TEXT    NOT NULL DEFAULT '',   -- first letters only, e.g. ptt
  parts          TEXT    NOT NULL DEFAULT '[]', -- JSON array of body parts
  families       TEXT    NOT NULL DEFAULT '[]', -- JSON array of departments (raw, for display)
  sex_scope      TEXT    NOT NULL DEFAULT 'any', -- any | female | male   (derived from families)
  age_scope      TEXT    NOT NULL DEFAULT 'any', -- any | child | adult | elder (derived)
  intro          TEXT    NOT NULL DEFAULT '',
  cause          TEXT    NOT NULL DEFAULT '',
  diagnose       TEXT    NOT NULL DEFAULT '',
  cure           TEXT    NOT NULL DEFAULT '',
  prevent        TEXT    NOT NULL DEFAULT '',
  complication   TEXT    NOT NULL DEFAULT '',
  symptom        TEXT    NOT NULL DEFAULT '',
  symptom_list   TEXT    NOT NULL DEFAULT '[]', -- JSON array of symptom names
  complication_list TEXT NOT NULL DEFAULT '[]',
  symptom_count  INTEGER NOT NULL DEFAULT 0     -- denormalised len(symptom_list) for scoring
);

CREATE INDEX IF NOT EXISTS idx_disease_initial ON disease (initial);
CREATE INDEX IF NOT EXISTS idx_disease_initials ON disease (initials);

-- ---------------------------------------------------------------- symptoms
CREATE TABLE IF NOT EXISTS symptom (
  id       INTEGER PRIMARY KEY,
  name     TEXT    NOT NULL UNIQUE,
  initial  TEXT    NOT NULL DEFAULT '',
  initials TEXT    NOT NULL DEFAULT '',
  parts    TEXT    NOT NULL DEFAULT '[]',
  families TEXT    NOT NULL DEFAULT '[]',
  intro    TEXT    NOT NULL DEFAULT '',
  cause    TEXT    NOT NULL DEFAULT '',
  diagnose TEXT    NOT NULL DEFAULT '',
  examine  TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_symptom_initial ON symptom (initial);
CREATE INDEX IF NOT EXISTS idx_symptom_initials ON symptom (initials);

-- ------------------------------------------------------- disease <-> symptom
-- Disease -> symptom relation. `symptom_name` is denormalised on purpose:
-- the diagnosis hot path filters on the symptom name and never needs the symptom row.
CREATE TABLE IF NOT EXISTS disease_symptom (
  disease_id   INTEGER NOT NULL,
  symptom_id   INTEGER NOT NULL,
  symptom_name TEXT    NOT NULL,
  PRIMARY KEY (disease_id, symptom_id)
);

CREATE INDEX IF NOT EXISTS idx_disease_symptom_name ON disease_symptom (symptom_name);

-- ------------------------------------------------------------ body part tags
-- Body part lookup. One row per (part, symptom) pair so
-- "click a body part" is an index seek instead of a full scan.
CREATE TABLE IF NOT EXISTS symptom_part (
  part       TEXT    NOT NULL,
  symptom_id INTEGER NOT NULL,
  PRIMARY KEY (part, symptom_id)
);

CREATE INDEX IF NOT EXISTS idx_symptom_part_part ON symptom_part (part);

-- ---------------------------------------------------------- substring search
-- Substring search index. A full scan per keystroke
-- would burn D1 row reads, so every 1..3 character substring of a name is
-- pre-indexed together with its offset; a prefix hit therefore sorts first.
CREATE TABLE IF NOT EXISTS symptom_gram (
  gram       TEXT    NOT NULL,
  symptom_id INTEGER NOT NULL,
  pos        INTEGER NOT NULL, -- 0 means the gram starts at the beginning of the name
  PRIMARY KEY (gram, symptom_id, pos)
) WITHOUT ROWID;

-- ------------------------------------------------------------ dataset metadata
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
