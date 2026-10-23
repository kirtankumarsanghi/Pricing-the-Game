export type Fee = "standard" | "discount";
export type Day = "W" | "S";
export type Tone = "click" | "cash" | "win" | "war" | "coin" | "stamp";
export type RepeatedMove = "coop" | "defect";
export type PatternLevel = "Low" | "Medium" | "High";

export interface FeedOptions {
  points?: number;
  confidence?: number;
  tone?: Tone;
  news?: string;
  awardKey?: string;
}

export type FeedFn = (options: FeedOptions) => void;
export type JuiceFn = (tone?: Tone, news?: string) => void;

export interface Payoff {
  qb: number;
  ym: number;
}

export const FEES: Record<
  Fee,
  { name: string; short: string; fee: number; role: string; blurb: string }
> = {
  standard: {
    name: "Standard pricing",
    short: "₹49",
    fee: 49,
    role: "Protect the margin",
    blurb: "Full delivery fee. Healthier per-order profit.",
  },
  discount: {
    name: "Discount pricing",
    short: "₹19",
    fee: 19,
    role: "Buy the market",
    blurb: "Subsidised fee. More orders, thinner margin.",
  },
};

/** Rows: QuickBite fee. Columns: Yummly fee. Values in ₹ lakhs. */
export const MATRIX: Record<Fee, Record<Fee, Payoff>> = {
  standard: {
    standard: { qb: 80, ym: 80 },
    discount: { qb: 25, ym: 110 },
  },
  discount: {
    standard: { qb: 110, ym: 25 },
    discount: { qb: 40, ym: 40 },
  },
};

export const CELL_NOTES: Record<string, string> = {
  "standard-standard":
    "Both protect margins. Profitable, but each side is tempted to undercut the other.",
  "standard-discount":
    "Yummly discounts alone and sweeps the price-sensitive customers. QuickBite keeps ₹25L.",
  "discount-standard":
    "QuickBite discounts alone, steals demand, and books ₹110L while Yummly keeps ₹25L.",
  "discount-discount":
    "Both discount. Customers win, margins bleed. Neither side can improve by switching alone.",
};

/**
 * The Pareto frontier: no cell can make one side better off without hurting the
 * other. The symmetric 80/80 outcome is the fair one both players prefer; the two
 * asymmetric 110/25 outcomes are also Pareto optimal.
 */
export const PARETO_CELLS = new Set([
  "standard-standard",
  "standard-discount",
  "discount-standard",
]);

export const REPEATED = {
  reward: 80,
  temptation: 110,
  punishment: 40,
  sucker: 25,
};

export const COLLUSION_THRESHOLD =
  (REPEATED.temptation - REPEATED.reward) / (REPEATED.temptation - REPEATED.punishment);

export const SYLLABUS: Record<
  number,
  { label: string; meta: string; short: string }
> = {
  1: {
    label: "One-shot fee",
    meta: "The pricing trap · One decision",
    short: "Chapter 01",
  },
  2: {
    label: "10-week subsidy war",
    meta: "Trust over time · 10-week window",
    short: "Chapter 02",
  },
  3: {
    label: "Flash-sale timing",
    meta: "Be unpredictable · Hide your pattern",
    short: "Chapter 03",
  },
  4: {
    label: "Summary",
    meta: "What you learned · All chapters",
    short: "Chapter 04",
  },
};

export const DAYS: Record<Day, { name: string; short: string; icon: string }> = {
  W: { name: "Wednesday", short: "Wed", icon: "W" },
  S: { name: "Saturday", short: "Sat", icon: "S" },
};

export const DAY_MATRIX: Record<Day, Record<Day, Payoff>> = {
  W: {
    W: { qb: 30, ym: 70 },
    S: { qb: 70, ym: 30 },
  },
  S: {
    W: { qb: 70, ym: 30 },
    S: { qb: 30, ym: 70 },
  },
};

export function getPayoff(quickbite: Fee, yummly: Fee): Payoff {
  return MATRIX[quickbite][yummly];
}

export function repeatedPayoff(
  quickbite: RepeatedMove,
  yummly: RepeatedMove
): Payoff {
  return getPayoff(
    quickbite === "coop" ? "standard" : "discount",
    yummly === "coop" ? "standard" : "discount"
  );
}

/**
 * Weeks where BOTH sides held the high fee. A week where the user undercut
 * (even if it paid 110) is not a cooperative week.
 */
export function countCooperativeWeeks(
  rounds: Array<{ q: RepeatedMove; y: RepeatedMove }>
): number {
  return rounds.filter((round) => round.q === "coop" && round.y === "coop").length;
}

export function cooperationIsStable(delta: number): boolean {
  return delta >= COLLUSION_THRESHOLD;
}

export function futurePunishment(delta: number): number {
  if (delta >= 1) return Number.POSITIVE_INFINITY;
  return (delta / (1 - delta)) * (REPEATED.reward - REPEATED.punishment);
}

export function expectedYummlyIfWed(p: number): number {
  return 70 * p + 30 * (1 - p);
}

export function expectedYummlyIfSat(p: number): number {
  return 30 * p + 70 * (1 - p);
}

export function expectedQuickBiteAgainstFairYummly(): number {
  return 50;
}

export const PATTERN_WINDOW = 6;
export const LEAN_SHARE = 2 / 3;

export type PatternSignal = "none" | "frequency" | "repeat" | "alternating";

export interface PatternRead {
  pct: number;
  level: PatternLevel;
  title: string;
  note: string;
  alternating: boolean;
  signal: PatternSignal;
}

function alternatingSuffix(history: Day[]): number {
  let run = 1;
  for (let i = history.length - 1; i > 0; i -= 1) {
    if (history[i] !== history[i - 1]) run += 1;
    else break;
  }
  return run;
}

function sameDaySuffix(history: Day[]): number {
  let run = 1;
  for (let i = history.length - 1; i > 0; i -= 1) {
    if (history[i] === history[i - 1]) run += 1;
    else break;
  }
  return run;
}

function leanCount(history: Day[]): { day: Day; count: number; need: number } {
  const wed = history.filter((d) => d === "W").length;
  const sat = history.length - wed;
  return {
    day: wed >= sat ? "W" : "S",
    count: Math.max(wed, sat),
    need: Math.ceil(history.length * LEAN_SHARE),
  };
}

/** A deliberately simple, readable analysis of recent choices. */
export function readPattern(history: Day[]): PatternRead {
  const recent = history.slice(-PATTERN_WINDOW);
  if (recent.length < 3) {
    return {
      pct: 0,
      level: "Low",
      title: "Not enough orders yet",
      note: `Play a few more sale days. Yummly needs at least 3 picks before it can read a pattern (you have ${recent.length}).`,
      alternating: false,
      signal: "none",
    };
  }

  const wed = recent.filter((d) => d === "W").length;
  const sat = recent.length - wed;
  const pct = Math.round((Math.max(wed, sat) / recent.length) * 100);
  const alternatingRun = alternatingSuffix(recent);
  const alternating = alternatingRun >= 3;
  const repeatRun = sameDaySuffix(recent);
  const lastThreeSame = repeatRun >= 3;
  const last = recent[recent.length - 1];
  const lastDayLabel = last === "W" ? "Wednesday" : "Saturday";
  const { day, count, need } = leanCount(recent);
  const lean = count >= need;
  const dayLabel = day === "W" ? "Wednesday" : "Saturday";

  let level: PatternLevel = "Low";
  let signal: PatternSignal = "none";
  let title = "Your choices are difficult to predict";

  if (lastThreeSame || pct >= 80) {
    level = "High";
    signal = repeatRun >= 2 ? "repeat" : "frequency";
    title = "Your pattern is becoming predictable";
  } else if (alternating) {
    level = "Medium";
    signal = "alternating";
    title = "Yummly can learn an alternating pattern";
  } else if (repeatRun >= 2 || lean) {
    level = "Medium";
    signal = repeatRun >= 2 ? "repeat" : "frequency";
    title = "A readable pattern is showing";
  }

  const note =
    level === "Low"
      ? `In the last ${recent.length} rounds you chose ${dayLabel} ${count} times. No strong pattern yet.`
      : signal === "repeat"
        ? `Your last ${repeatRun} picks were ${lastDayLabel}. Yummly can copy that day.`
        : signal === "alternating"
          ? `You have alternated for the last ${alternatingRun} rounds. That is a pattern, not randomness.`
          : `You chose ${dayLabel} ${count} of the last ${recent.length} rounds — enough for Yummly to lean against it.`;

  return { pct, level, title, note, alternating, signal };
}

export interface RivalPick {
  day: Day;
  reason: string;
  method: "pattern" | "frequency" | "coin";
}

function otherDay(day: Day): Day {
  return day === "W" ? "S" : "W";
}

function dayName(day: Day): string {
  return day === "W" ? "Wednesday" : "Saturday";
}

/**
 * A simplified pattern reader. It observes the user's PREVIOUS moves, then picks
 * the same day when it believes it has found a pattern (Yummly wins same-day).
 * It uses the same window and thresholds as readPattern, so the meter and the
 * bot agree on what is readable.
 */
export function predictRivalDay(history: Day[]): RivalPick {
  const recent = history.slice(-PATTERN_WINDOW);

  const coin = (): RivalPick => ({
    day: Math.random() < 0.5 ? "W" : "S",
    reason:
      recent.length === 0
        ? "No history yet. Yummly flipped a coin."
        : `Only ${recent.length} pick${recent.length === 1 ? "" : "s"} so far — not enough to read a pattern. Yummly flipped a coin.`,
    method: "coin",
  });

  if (recent.length < 3) return coin();

  const alternatingRun = alternatingSuffix(recent);
  if (alternatingRun >= 3) {
    const predicted = otherDay(recent[recent.length - 1]);
    return {
      day: predicted,
      reason: `Pattern spotted: ${alternatingRun} alternating days. Yummly pre-booked ${dayName(predicted)}.`,
      method: "pattern",
    };
  }

  const last = recent[recent.length - 1];
  const repeatRun = sameDaySuffix(recent);
  if (repeatRun >= 2) {
    return {
      day: last,
      reason: `Pattern spotted: ${repeatRun} ${dayName(last)} picks in a row. Yummly copied it.`,
      method: "frequency",
    };
  }

  const { day: majority, count, need } = leanCount(recent);
  if (count >= need) {
    return {
      day: majority,
      reason: `Pattern spotted: ${count} of the last ${recent.length} picks were ${dayName(majority)}. Yummly leaned with it.`,
      method: "frequency",
    };
  }

  return coin();
}

export function playDay(quickbiteDay: Day, yummlyDay: Day): Payoff {
  return DAY_MATRIX[quickbiteDay][yummlyDay];
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  confidence: number;
  outcome: "Fired" | "Shift complete";
  date: string;
}

const SCORE_KEY = "pricing-the-game:high-scores:v1";
const SOUND_KEY = "pricing-the-game:sfx";

export function loadHighScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is ScoreEntry =>
          entry &&
          typeof entry.name === "string" &&
          typeof entry.score === "number" &&
          typeof entry.id === "string"
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  } catch {
    return [];
  }
}

export function storeHighScores(entries: ScoreEntry[]): ScoreEntry[] {
  const next = [...entries].sort((a, b) => b.score - a.score).slice(0, 8);
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(next));
  } catch {
    // Local storage can be unavailable in private mode; the game still works.
  }
  return next;
}

export function makeScoreEntry(
  name: string,
  score: number,
  confidence: number,
  outcome: ScoreEntry["outcome"]
): ScoreEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim() || "New Manager",
    score,
    confidence,
    outcome,
    date: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}

export function loadSoundPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function storeSoundPreference(on: boolean): void {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    // Optional preference only.
  }
}

export function loadJson<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return (parsed as T) ?? fallback;
  } catch {
    return fallback;
  }
}

export function storeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private mode; the game still works.
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private mode.
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function randomDay(): Day {
  return Math.random() < 0.5 ? "W" : "S";
}
