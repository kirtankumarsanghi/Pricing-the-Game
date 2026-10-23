import { afterEach, describe, expect, it, vi } from "vitest";
import {
  COLLUSION_THRESHOLD,
  DAY_MATRIX,
  MATRIX,
  clamp,
  countCooperativeWeeks,
  cooperationIsStable,
  expectedQuickBiteAgainstFairYummly,
  expectedYummlyIfSat,
  expectedYummlyIfWed,
  formatNumber,
  futurePunishment,
  getPayoff,
  playDay,
  predictRivalDay,
  readPattern,
  repeatedPayoff,
} from "./game";

describe("payoff matrix", () => {
  it("matches the four documented outcomes", () => {
    expect(MATRIX.standard.standard).toEqual({ qb: 80, ym: 80 });
    expect(MATRIX.standard.discount).toEqual({ qb: 25, ym: 110 });
    expect(MATRIX.discount.standard).toEqual({ qb: 110, ym: 25 });
    expect(MATRIX.discount.discount).toEqual({ qb: 40, ym: 40 });
  });

  it("swaps payoffs when the fees swap", () => {
    const a = getPayoff("standard", "discount");
    const b = getPayoff("discount", "standard");
    expect([a.qb, a.ym]).toEqual([b.ym, b.qb]);
  });

  it("maps repeated moves to fee payoffs", () => {
    expect(repeatedPayoff("coop", "coop")).toEqual({ qb: 80, ym: 80 });
    expect(repeatedPayoff("defect", "coop")).toEqual({ qb: 110, ym: 25 });
    expect(repeatedPayoff("coop", "defect")).toEqual({ qb: 25, ym: 110 });
    expect(repeatedPayoff("defect", "defect")).toEqual({ qb: 40, ym: 40 });
  });
});

describe("discount factor", () => {
  it("uses the expected collusion threshold", () => {
    expect(COLLUSION_THRESHOLD).toBeCloseTo(30 / 70, 10);
    expect(COLLUSION_THRESHOLD).toBeCloseTo(0.428571, 5);
  });

  it("flips exactly at the threshold", () => {
    expect(cooperationIsStable(COLLUSION_THRESHOLD)).toBe(true);
    expect(cooperationIsStable(COLLUSION_THRESHOLD - 0.0001)).toBe(false);
  });

  it("computes the discounted future loss", () => {
    expect(futurePunishment(0)).toBe(0);
    expect(futurePunishment(0.5)).toBeCloseTo(40, 10);
    expect(futurePunishment(0.95)).toBeCloseTo((0.95 / 0.05) * 40, 8);
    expect(futurePunishment(1)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("cooperative week counting", () => {
  it("does not count a week where the user undercut", () => {
    expect(
      countCooperativeWeeks([
        { q: "coop", y: "coop" },
        { q: "defect", y: "coop" },
        { q: "coop", y: "coop" },
      ])
    ).toBe(2);
    expect(countCooperativeWeeks(Array.from({ length: 10 }, () => ({ q: "coop" as const, y: "coop" as const })))).toBe(10);
  });
});

describe("pattern reading", () => {
  it("reports insufficient history", () => {
    const read = readPattern(["W", "S"]);
    expect(read.level).toBe("Low");
    expect(read.pct).toBe(0);
    expect(read.title).toMatch(/Not enough/);
  });

  it("flags a repeated day as highly predictable", () => {
    const read = readPattern(["W", "W", "W", "W"]);
    expect(read.level).toBe("High");
    expect(read.pct).toBe(100);
  });

  it("flags an alternating pattern as medium", () => {
    const read = readPattern(["W", "S", "W", "S"]);
    expect(read.level).toBe("Medium");
    expect(read.alternating).toBe(true);
    expect(read.signal).toBe("alternating");
  });

  it("detects a recent alternation even after an earlier repeat", () => {
    const read = readPattern(["S", "S", "W", "S", "W", "S"]);
    expect(read.alternating).toBe(true);
    expect(read.signal).toBe("alternating");
  });

  it("treats a balanced mix as low", () => {
    const read = readPattern(["W", "S", "W", "S", "S", "W"]);
    expect(read.level).toBe("Low");
    expect(read.signal).toBe("none");
  });
});

describe("rival prediction", () => {
  afterEach(() => vi.restoreAllMocks());

  it("plays a coin with fewer than three observations", () => {
    expect(predictRivalDay([]).method).toBe("coin");
    expect(predictRivalDay(["W"]).method).toBe("coin");
    expect(predictRivalDay(["W", "S"]).method).toBe("coin");
  });

  it("copies a repeated day", () => {
    expect(predictRivalDay(["W", "W", "W"]).day).toBe("W");
    expect(predictRivalDay(["S", "S", "S"]).day).toBe("S");
  });

  it("predicts the opposite of an alternating sequence", () => {
    expect(predictRivalDay(["W", "S", "W"]).day).toBe("S");
    expect(predictRivalDay(["W", "S", "W", "S"]).day).toBe("W");
    expect(predictRivalDay(["S", "W", "S", "W"]).day).toBe("S");
  });

  it("detects a recent alternation after an earlier repeat", () => {
    expect(predictRivalDay(["S", "S", "W", "S", "W", "S"]).day).toBe("W");
  });

  it("uses the majority day when the lean is strong", () => {
    expect(predictRivalDay(["W", "W", "W", "W", "S"]).day).toBe("W");
  });
});

describe("flash-sale payoffs", () => {
  it("is a zero-sum 70/30 split", () => {
    expect(playDay("W", "W")).toEqual({ qb: 30, ym: 70 });
    expect(playDay("W", "S")).toEqual({ qb: 70, ym: 30 });
    expect(playDay("S", "W")).toEqual({ qb: 70, ym: 30 });
    expect(playDay("S", "S")).toEqual({ qb: 30, ym: 70 });
    Object.values(DAY_MATRIX).forEach((row) =>
      Object.values(row).forEach((cell) => expect(cell.qb + cell.ym).toBe(100))
    );
  });

  it("makes the rival indifferent at p = 50%", () => {
    expect(expectedYummlyIfWed(0.5)).toBeCloseTo(50, 10);
    expect(expectedYummlyIfSat(0.5)).toBeCloseTo(50, 10);
    expect(expectedQuickBiteAgainstFairYummly()).toBe(50);
  });
});

describe("helpers", () => {
  it("clamps values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("formats numbers in en-IN", () => {
    expect(formatNumber(1234)).toBe("1,234");
  });
});
