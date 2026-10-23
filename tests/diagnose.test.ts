import { describe, expect, it } from "vitest";
import {
  buildScopeFilter,
  extractRelatedSymptoms,
  MAX_SYMPTOMS,
  normalizeAge,
  normalizeSex,
  normalizeSymptoms,
  rankDiseases,
  scoreOf,
  type DiseaseRow
} from "../src/lib/diagnose";

function row(id: number, name: string, symptoms: string[], count = symptoms.length): DiseaseRow {
  return { id, name, symptom_list: JSON.stringify(symptoms), symptom_count: count };
}

describe("normalizeSex", () => {
  it("accepts Chinese sex values", () => {
    expect(normalizeSex("男")).toBe("male");
    expect(normalizeSex("女")).toBe("female");
  });

  it("accepts English values case-insensitively", () => {
    expect(normalizeSex("FEMALE")).toBe("female");
    expect(normalizeSex("Male")).toBe("male");
  });

  it("falls back to unknown", () => {
    expect(normalizeSex(undefined)).toBe("unknown");
    expect(normalizeSex("其他")).toBe("unknown");
  });
});

describe("normalizeAge", () => {
  it("keeps the first element of a range, like the original controller", () => {
    expect(normalizeAge([28, 35])).toBe(28);
  });

  it("accepts a plain number or numeric string", () => {
    expect(normalizeAge(41)).toBe(41);
    expect(normalizeAge("41")).toBe(41);
  });

  it("falls back for nonsense input", () => {
    expect(normalizeAge(null)).toBe(30);
    expect(normalizeAge(-5)).toBe(30);
    expect(normalizeAge(999)).toBe(30);
  });
});

describe("normalizeSymptoms", () => {
  it("trims, drops empties and de-duplicates", () => {
    expect(normalizeSymptoms([" 头痛 ", "头痛", "", 3, "恶心"])).toEqual(["头痛", "恶心"]);
  });

  it("rejects non arrays", () => {
    expect(normalizeSymptoms("头痛")).toEqual([]);
    expect(normalizeSymptoms(undefined)).toEqual([]);
  });

  it("caps the list so the SQL IN clause stays bounded", () => {
    const many = Array.from({ length: 40 }, (_, i) => `symptom-${i}`);
    expect(normalizeSymptoms(many)).toHaveLength(MAX_SYMPTOMS);
  });
});

describe("buildScopeFilter", () => {
  it("excludes 男科 for a woman", () => {
    const filter = buildScopeFilter("female", 30);
    expect(filter.sql).toContain("d.sex_scope <> ?");
    expect(filter.params).toEqual(["male", "elder", "child"]);
  });

  it("excludes the female-only departments for a man", () => {
    expect(buildScopeFilter("male", 30).params[0]).toBe("female");
  });

  it("keeps 老年科 for a 70 year old and 小儿科 for a 5 year old", () => {
    expect(buildScopeFilter("unknown", 70).params).toEqual(["child"]);
    expect(buildScopeFilter("unknown", 5).params).toEqual(["elder"]);
  });

  it("adds no clause when age lands inside both bands", () => {
    // 13..64 keeps both 小儿科 and 老年科 out of the exclusion list.
    expect(buildScopeFilter("unknown", 30).params).toEqual(["elder", "child"]);
    expect(buildScopeFilter("unknown", 30).sql).toBe(" AND d.age_scope <> ? AND d.age_scope <> ?");
  });
});

describe("scoreOf", () => {
  it("matches the original formula", () => {
    // 2 of 8 symptoms matched -> 0.25 + 0.2
    expect(scoreOf(2, 8)).toBe(0.45);
  });

  it("does not divide by zero for an empty symptom list", () => {
    expect(scoreOf(1, 0)).toBe(0.1);
  });
});

describe("rankDiseases", () => {
  it("orders by matched count, then by score", () => {
    const rows = [
      row(1, "甲病", ["头痛", "恶心", "发热", "乏力"]), // 2 matched / 4 = 0.5 + 0.2
      row(2, "乙病", ["头痛"]), // 1 matched / 1 = 1.0 + 0.1
      row(3, "丙病", ["头痛", "恶心", "咳嗽"]) // 2 matched / 3 = 0.66 + 0.2
    ];
    const ranked = rankDiseases(rows, ["头痛", "恶心"]);
    expect(ranked.map((item) => item.name)).toEqual(["丙病", "甲病", "乙病"]);
    expect(ranked[0].score).toBeCloseTo(0.8667, 3);
  });

  it("sorts every element of an equal-count bucket (the original skipped the last two)", () => {
    const rows = [
      row(1, "A", ["头痛", "x", "y"]), // 1/3 + 0.1
      row(2, "B", ["头痛"]), // 1/1 + 0.1
      row(3, "C", ["头痛", "x"]), // 1/2 + 0.1
      row(4, "D", ["头痛", "x", "y", "z"]) // 1/4 + 0.1
    ];
    const ranked = rankDiseases(rows, ["头痛"]);
    expect(ranked.map((item) => item.name)).toEqual(["B", "C", "A", "D"]);
  });

  it("is deterministic for exact ties", () => {
    const rows = [row(1, "乙", ["头痛"]), row(2, "甲", ["头痛"])];
    // Code-point order: 乙 (U+4E59) sorts before 甲 (U+7532), and it must not
    // depend on the host locale.
    expect(rankDiseases(rows, ["头痛"]).map((item) => item.name)).toEqual(["乙", "甲"]);
  });

  it("caps the result at 20 diseases", () => {
    const rows = Array.from({ length: 30 }, (_, i) => row(i + 1, `病-${i}`, ["头痛"]));
    expect(rankDiseases(rows, ["头痛"])).toHaveLength(20);
  });

  it("survives a malformed symptom_list column", () => {
    const broken: DiseaseRow = { id: 9, name: "坏数据", symptom_list: "not json", symptom_count: 3 };
    expect(rankDiseases([broken], ["头痛"])[0]).toMatchObject({ name: "坏数据", matched: 0 });
  });
});

describe("extractRelatedSymptoms", () => {
  it("counts how often a symptom appears across the shortlist and drops user input", () => {
    const rows = [
      row(1, "甲", ["头痛", "恶心", "呕吐"]),
      row(2, "乙", ["头痛", "恶心", "发热"])
    ];
    expect(extractRelatedSymptoms(rows, ["头痛"])).toEqual(["恶心", "发热", "呕吐"]);
  });

  it("respects the limit", () => {
    const rows = [row(1, "甲", Array.from({ length: 80 }, (_, i) => `症状-${i}`))];
    expect(extractRelatedSymptoms(rows, [], 10)).toHaveLength(10);
  });
});
