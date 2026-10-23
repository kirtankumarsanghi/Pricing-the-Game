import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarRange,
  ChevronDown,
  Handshake,
  Info,
  RotateCcw,
  Swords,
  Target,
  Zap,
} from "lucide-react";
import type { FeedFn, RepeatedMove } from "../lib/game";
import {
  COLLUSION_THRESHOLD,
  REPEATED,
  countCooperativeWeeks,
  futurePunishment,
  loadJson,
  repeatedPayoff,
  storeJson,
} from "../lib/game";
import { playSound } from "../lib/sound";
import { cn } from "../utils/cn";
import {
  Card,
  Kbd,
  PanelHead,
  Stamp,
} from "./ui";

interface RepeatedProps {
  active: boolean;
  feed: FeedFn;
  onNext: () => void;
}

interface Round {
  q: RepeatedMove;
  y: RepeatedMove;
  qb: number;
  ym: number;
}

const maxDelta = 0.95;
const REPEATED_KEY = "pricing-the-game:repeated:v2";

function isRound(value: unknown): value is Round {
  if (!value || typeof value !== "object") return false;
  const round = value as Partial<Round>;
  return (
    (round.q === "coop" || round.q === "defect") &&
    (round.y === "coop" || round.y === "defect") &&
    typeof round.qb === "number" &&
    typeof round.ym === "number"
  );
}

function loadRepeatedState(): { rounds: Round[]; delta: number } {
  const parsed = loadJson<unknown>(REPEATED_KEY, null);
  if (!parsed || typeof parsed !== "object") return { rounds: [], delta: 0.58 };
  const data = parsed as { rounds?: unknown; delta?: unknown };
  return {
    rounds: Array.isArray(data.rounds) ? data.rounds.filter(isRound).slice(0, 10) : [],
    delta:
      typeof data.delta === "number"
        ? Math.min(maxDelta, Math.max(0, data.delta))
        : 0.58,
  };
}

function ScaleSvg({
  delta,
  future,
  temptation,
  angle,
}: {
  delta: number;
  future: number;
  temptation: number;
  angle: number;
}) {
  return (
    <svg
      viewBox="0 0 500 195"
      className="h-auto w-full max-w-[500px] overflow-visible"
      role="img"
      aria-label={`Scale comparing gain today ${temptation} lakh versus loss later ${future.toFixed(1)} lakh`}
    >
      <rect x="8" y="8" width="484" height="175" rx="10" fill="#FBF8F1" stroke="#16161A" strokeWidth="1.5" />
      <line x1="250" y1="115" x2="186" y2="165" stroke="#16161A" strokeWidth="5" strokeLinecap="round" />
      <line x1="250" y1="115" x2="314" y2="165" stroke="#16161A" strokeWidth="5" strokeLinecap="round" />
      <line x1="206" y1="165" x2="294" y2="165" stroke="#16161A" strokeWidth="8" strokeLinecap="round" />
      <rect x="250" y="40" width="8" height="78" rx="3" fill="#16161A" />
      <g
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: "250px 40px",
          transformBox: "view-box",
          transition: "transform 520ms cubic-bezier(.2,.8,.25,1)",
        }}
      >
        <line x1="76" y1="40" x2="424" y2="40" stroke="#16161A" strokeWidth="8" strokeLinecap="round" />
        <circle cx="250" cy="40" r="11" fill="#FBF8F1" stroke="#16161A" strokeWidth="3" />
        <line x1="76" y1="44" x2="76" y2="74" stroke="#16161A" strokeWidth="2" />
        <line x1="48" y1="74" x2="104" y2="74" stroke="#16161A" strokeWidth="2" />
        <path d="M44 78 Q76 112 108 78 Z" fill="#FDEBE6" stroke="#16161A" strokeWidth="1.8" />
        <text x="76" y="98" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill="#16161A">{temptation}</text>
        <text x="76" y="108" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6" fontWeight="700" fill="#64646E">₹ LAKH TODAY</text>
        <line x1="424" y1="44" x2="424" y2="74" stroke="#16161A" strokeWidth="2" />
        <line x1="396" y1="74" x2="452" y2="74" stroke="#16161A" strokeWidth="2" />
        <path d="M392 78 Q424 112 456 78 Z" fill="#E9F7EE" stroke="#16161A" strokeWidth="1.8" />
        <text x="424" y="98" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="#16161A">{future.toFixed(0)}</text>
        <text x="424" y="108" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6" fontWeight="700" fill="#64646E">₹ LAKH LATER</text>
      </g>
      <text x="76" y="136" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6.5" fontWeight="700" fill="#64646E">GAIN FROM CHEATING</text>
      <text x="424" y="136" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6.5" fontWeight="700" fill="#64646E">LOSS FROM PUNISHMENT</text>
      <text x="250" y="156" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="9" fontWeight="700" fill="#16161A">FUTURE MATTERS {Math.round(delta*100)}%</text>
    </svg>
  );
}

type RoundOutcome = "peace" | "cheat" | "caught" | "war";

function outcomeOf(round: Round): RoundOutcome {
  if (round.q === "coop" && round.y === "coop") return "peace";
  if (round.q === "defect" && round.y === "coop") return "cheat";
  if (round.q === "coop" && round.y === "defect") return "caught";
  return "war";
}

const outcomeTone: Record<
  RoundOutcome,
  { dot: string; border: string; label: string; note: string }
> = {
  peace: {
    dot: "bg-peace",
    border: "border-peace",
    label: "Both held ₹49",
    note: "Trust intact — both platforms kept the high margin.",
  },
  cheat: {
    dot: "bg-warn",
    border: "border-warn",
    label: "You undercut",
    note: "One big week, but Yummly's trigger is now tripped.",
  },
  caught: {
    dot: "bg-quickbite",
    border: "border-quickbite",
    label: "You got caught",
    note: "Yummly is undercutting while you hold — that is the punishment.",
  },
  war: {
    dot: "bg-quickbite",
    border: "border-quickbite",
    label: "Both undercut",
    note: "Price war: customers win, both margins bleed.",
  },
};

function WeekBars({ rounds }: { rounds: Round[] }) {
  const max = 110;
  const summary = rounds.length
    ? rounds
        .map(
          (round, index) =>
            `week ${index + 1}: you ${round.qb} lakh, Yummly ${round.ym} lakh`
        )
        .join("; ")
    : "No weeks played yet";
  return (
    <div role="img" aria-label={`Weekly profit chart. ${summary}.`}>
      <div className="flex h-[118px] items-end gap-1 border-b-[1.5px] border-ink/40 pb-1" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => {
          const round = rounds[index];
          return (
            <div key={index} className="flex h-full flex-1 items-end justify-center gap-[2px]">
              {round ? (
                <>
                  <div
                    className="w-1/2 max-w-[16px] rounded-t-[2px] border border-ink bg-quickbite transition-[height] duration-500 ease-out"
                    style={{ height: `${Math.max(6, (round.qb / max) * 100)}%` }}
                    title={`Week ${index + 1} · You ₹${round.qb}L`}
                  />
                  <div
                    className="w-1/2 max-w-[16px] rounded-t-[2px] border border-ink bg-yummly transition-[height] duration-500 ease-out"
                    style={{ height: `${Math.max(6, (round.ym / max) * 100)}%` }}
                    title={`Week ${index + 1} · Yummly ₹${round.ym}L`}
                  />
                </>
              ) : (
                <div
                  className={cn(
                    "h-full w-full max-w-[34px] rounded-t-[2px] border border-dashed",
                    index === rounds.length
                      ? "border-warn/60 bg-warn-soft/60"
                      : "border-ink/15 bg-canvas/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1" aria-hidden="true">
        {Array.from({ length: 10 }, (_, index) => {
          const round = rounds[index];
          return (
            <div key={index} className="flex-1 text-center">
              <div
                className={cn(
                  "mx-auto h-1.5 w-1.5 rounded-full",
                  round ? outcomeTone[outcomeOf(round)].dot : "bg-ink/15"
                )}
              />
              <div className="mt-0.5 font-mono text-[8.5px] font-bold text-muted">W{index + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchReport({
  rounds,
  roundQb,
  roundYm,
  coopRounds,
  completed,
}: {
  rounds: Round[];
  roundQb: number;
  roundYm: number;
  coopRounds: number;
  completed: boolean;
}) {
  const lastRound = rounds[rounds.length - 1];
  return (
    <div className="overflow-hidden rounded-lg border-[1.5px] border-ink bg-[#fffef9] shadow-[2px_2px_0_#16161A]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-ink px-2.5 py-1.5 text-paper">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
          <Activity size={11} className="text-warn" /> Live match report
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-paper/60">
          Week {Math.min(rounds.length + (completed ? 0 : 1), 10)} / 10
        </span>
      </div>

      <div className="p-2.5">
        <div className="grid grid-cols-3 gap-1.5">
          <div className="rounded-md border border-quickbite/30 bg-quickbite-soft px-2 py-1.5">
            <div className="font-mono text-[9px] font-bold uppercase tracking-wide text-quickbite">You · QuickBite</div>
            <div className="num text-[15px] font-bold">₹{roundQb}L</div>
          </div>
          <div className="rounded-md border border-yummly/30 bg-yummly-soft px-2 py-1.5">
            <div className="font-mono text-[9px] font-bold uppercase tracking-wide text-yummly">Yummly</div>
            <div className="num text-[15px] font-bold">₹{roundYm}L</div>
          </div>
          <div className="rounded-md border border-ink/20 bg-canvas px-2 py-1.5">
            <div className="font-mono text-[9px] font-bold uppercase tracking-wide text-muted">Peaceful</div>
            <div className="num text-[15px] font-bold">{coopRounds}<span className="text-[11px] font-semibold text-muted"> / 10</span></div>
          </div>
        </div>

        <div className="mt-3 lg:hidden">
          <div className="flex flex-wrap items-center justify-between gap-x-2 font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
            <span>Weekly profit · ₹ lakh</span>
            <span>■ <span className="text-quickbite">You</span> &nbsp;■ <span className="text-yummly">Yummly</span></span>
          </div>
          <WeekBars rounds={rounds} />
        </div>

        {lastRound ? (
            <div
              role="status"
              aria-live="polite"
              className={cn("mt-2.5 border-l-[3px] pl-2.5 py-1", outcomeTone[outcomeOf(lastRound)].border)}
            >
            <div className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">Week {rounds.length} verdict</div>
            <p className="text-[12px] font-semibold leading-relaxed">
              <strong className="text-ink">{outcomeTone[outcomeOf(lastRound)].label}.</strong>{" "}
              You ₹{lastRound.qb}L · Yummly ₹{lastRound.ym}L.
            </p>
            <p className="mt-0.5 text-[11.5px] font-semibold leading-relaxed text-muted">
              {outcomeTone[outcomeOf(lastRound)].note}
            </p>
          </div>
        ) : (
          <div className="mt-2.5 flex items-center gap-2 border-l border-ink/20 pl-2.5 py-1">
            <Target size={14} className="shrink-0 text-muted" />
            <p className="text-[12px] font-semibold leading-relaxed text-muted">
              Pick a move above. The chart fills in week by week so you can compare both platforms.
            </p>
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[9px] font-bold uppercase tracking-wide text-muted">
          <span><span className="text-peace">●</span> both held</span>
          <span><span className="text-warn">●</span> you cheated</span>
          <span><span className="text-quickbite">●</span> caught / war</span>
        </div>
      </div>
    </div>
  );
}

function WeekChart({ rounds }: { rounds: Round[] }) {
  return (
    <div className="overflow-hidden rounded-lg border-[1.5px] border-ink bg-[#fffef9] shadow-[2px_2px_0_#16161A]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-ink px-2.5 py-1.5 text-paper">
        <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
          <Activity size={11} className="text-warn" /> Weekly profit
        </span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-paper/60">
          {rounds.length} / 10 weeks
        </span>
      </div>
      <div className="p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-x-2 font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
          <span>Live bars · ₹ lakh</span>
          <span>■ <span className="text-quickbite">You</span> &nbsp;■ <span className="text-yummly">Yummly</span></span>
        </div>
        <WeekBars rounds={rounds} />
        <p className="mt-2 text-[11.5px] font-semibold leading-relaxed text-muted">
          Each pair is one week. Green dot = both held, amber = you cheated, red = caught / price war.
        </p>
      </div>
    </div>
  );
}

export function Repeated({ active, feed, onNext }: RepeatedProps) {
  const [restored] = useState(loadRepeatedState);
  const [delta, setDelta] = useState(restored.delta);
  const [autoRun, setAutoRun] = useState(false);
  const [autoRuns, setAutoRuns] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [rounds, setRounds] = useState<Round[]>(restored.rounds);
  const lastDeltaNews = useRef(0);
  const keyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => {});

  const future = futurePunishment(delta);
  const temptation = REPEATED.temptation - REPEATED.reward; // 30
  const isPeace = delta >= COLLUSION_THRESHOLD;
  const completed = rounds.length >= 10;
  const userDefected = rounds.some((round) => round.q === "defect");
  const botNext: RepeatedMove = rounds.length === 0 || !userDefected ? "coop" : "defect";
  const roundQb = rounds.reduce((sum, round) => sum + round.qb, 0);
  const roundYm = rounds.reduce((sum, round) => sum + round.ym, 0);
  const coopRounds = rounds.filter((round) => round.qb === REPEATED.reward).length;
  const angle = Math.max(-14, Math.min(14, Math.log((future + 0.001) / (temptation + 0.001)) * 7));

  const suggestedWeeks = Array.from({ length: 10 }, (_, index) => ({
    week: index + 1,
    qb: isPeace ? REPEATED.reward : REPEATED.punishment,
  }));

  const changeDelta = (next: number) => {
    setDelta(next);
    if (Date.now() - lastDeltaNews.current > 1000) {
      lastDeltaNews.current = Date.now();
      playSound("click");
    }
  };

  const runAuto = () => {
    setAutoRun(true);
    setAutoRuns((value) => value + 1);
    feed({
      awardKey: "repeated-auto-projection",
      points: 120,
      confidence: isPeace ? 6 : -12,
      tone: isPeace ? "win" : "war",
      news: isPeace
        ? `10-WEEK VIEW: High patience → both hold ₹49 all 10 weeks (₹800L total).`
        : `10-WEEK VIEW: Low patience → both discount every week (₹400L total).`,
    });
  };

  const playRound = (move: RepeatedMove) => {
    if (completed) return;
    const yummlyMove: RepeatedMove =
      rounds.length === 0 || !userDefected ? "coop" : "defect";
    const payoff = repeatedPayoff(move, yummlyMove);
    const newRounds = [...rounds, { q: move, y: yummlyMove, qb: payoff.qb, ym: payoff.ym }];
    setRounds(newRounds);

    const peaceful = move === "coop" && yummlyMove === "coop";
    const betrayal = move === "defect" && yummlyMove === "coop";
    const tone = peaceful ? "win" : betrayal ? "cash" : "war";
    const news =
      peaceful
        ? `WEEK ${newRounds.length}: Both kept ₹49 → ₹80L each. Trust intact.`
        : betrayal
          ? `WEEK ${newRounds.length}: You cheated → ₹110L this week, but Yummly will punish forever.`
          : move === "coop" && yummlyMove === "defect"
            ? `WEEK ${newRounds.length}: Yummly is punishing you. Your ₹49 now earns only ₹25L.`
            : `WEEK ${newRounds.length}: Both at ₹19 → ₹40L each. Price war.`;

    const finished = newRounds.length === 10;
    const cooperativeWeeks = countCooperativeWeeks(newRounds);
    const totalQb = newRounds.reduce((sum, round) => sum + round.qb, 0);
    const defectedThisRun = newRounds.some((round) => round.q === "defect");
    const finalPeace = finished && !defectedThisRun;

    feed({
      awardKey: `repeated-play-${rounds.length}`,
      points:
        (peaceful ? 15 : 5) +
        (finished ? (finalPeace ? 70 + cooperativeWeeks * 6 : 20 + cooperativeWeeks * 3) : 0),
      confidence:
        (peaceful ? 1 : betrayal ? -6 : -5) + (finished ? (finalPeace ? 6 : -10) : 0),
      tone: finished ? (finalPeace ? "win" : "war") : tone,
      news: finished
        ? finalPeace
          ? `RESULT: All 10 weeks peaceful. Trust paid off — ₹${totalQb}L total.`
          : cooperativeWeeks >= 6
            ? `RESULT: You cheated late. ₹${totalQb}L total now, but Yummly is in permanent punishment.`
            : `RESULT: ${10 - cooperativeWeeks} costly weeks. One cheat changed the quarter — ₹${totalQb}L total.`
        : news,
    });
  };

  const resetPlay = () => {
    setRounds([]);
    playSound("click");
  };

  keyHandlerRef.current = (event: KeyboardEvent) => {
    if (event.repeat) return;
    if (event.key === "1" || event.key.toLowerCase() === "c") {
      event.preventDefault();
      playRound("coop");
    }
    if (event.key === "2" || event.key.toLowerCase() === "u") {
      event.preventDefault();
      playRound("defect");
    }
  };

  useEffect(() => {
    if (!active || !playing) return;
    const onKey = (event: KeyboardEvent) => keyHandlerRef.current(event);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, playing]);

  useEffect(() => {
    storeJson(REPEATED_KEY, { rounds, delta });
  }, [rounds, delta]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-x-0">
      {/* LEFT - Play */}
      <div className="space-y-3 lg:pr-8">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b-[1.5px] border-ink bg-ink px-3 py-2 text-paper">
            <span className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-paper/30 bg-peace">
              <CalendarRange size={11} strokeWidth={2.8} />
            </span>
            <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.18em]">Left · You play</span>
            <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-paper/60">
              <span className="hidden sm:inline">Same fee game</span> · 10 weeks
            </span>
          </div>

          <div className="p-3.5 sm:p-4">
            {/* Intro story box */}
            <div className="border-l-[3px] border-ink bg-canvas/50 py-2 pl-3">
              <p className="text-[12.5px] font-bold leading-snug">
                Chapter 1 was one week. Now imagine <span className="text-quickbite">the same choice every week for 10 weeks.</span>
              </p>
              <p className="mt-1 flex items-start gap-1.5 text-[12px] font-semibold leading-relaxed text-muted">
                <Info size={12} className="mt-0.5 shrink-0" />
                Yummly's rule is simple: <strong className="text-ink">“I trust you until you cheat once. After that, I discount every week forever.”</strong> That's it.
              </p>
              <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-muted">
                The relationship continues after this 10-week window — there is no known final week to cheat safely.
              </p>
            </div>

            {/* What is actually happening */}
            <div className="mt-3 rounded-md border border-ink/15 bg-canvas/40 p-2.5">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                What is actually happening · the setup
              </div>
              <p className="mt-1 text-[12.5px] font-semibold leading-relaxed">
                Every week both apps choose a delivery fee: <strong className="text-peace">₹49 (hold)</strong> or{" "}
                <strong className="text-quickbite">₹19 (undercut)</strong>. The week's profit for each platform
                (₹ lakh) is fixed by four possible outcomes:
              </p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <div className="rounded border border-peace/30 bg-peace-soft px-2 py-1.5">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-peace">Both hold ₹49</div>
                  <div className="num text-[12.5px] font-bold">₹80L each</div>
                </div>
                <div className="rounded border border-quickbite/30 bg-quickbite-soft px-2 py-1.5">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-quickbite">You ₹19 · Yummly ₹49</div>
                  <div className="num text-[12.5px] font-bold">You ₹110L · Yum ₹25L</div>
                </div>
                <div className="rounded border border-yummly/30 bg-yummly-soft px-2 py-1.5">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-yummly">You ₹49 · Yummly ₹19</div>
                  <div className="num text-[12.5px] font-bold">You ₹25L · Yum ₹110L</div>
                </div>
                <div className="rounded border border-ink/20 bg-canvas px-2 py-1.5">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-muted">Both undercut ₹19</div>
                  <div className="num text-[12.5px] font-bold">₹40L each</div>
                </div>
              </div>
              <p className="mt-2 text-[12px] font-semibold leading-relaxed text-muted">
                That is a <strong className="text-ink">Prisoner's Dilemma</strong>: undercutting pays best if the
                other side holds, but if both undercut, both earn less. Repeating the choice 10 times is what lets
                Yummly punish you — and what can make cooperation rational.
              </p>
            </div>

            <h2 className="mt-4 font-display text-[18px] font-bold leading-tight">What changes when the game repeats?</h2>
            <p className="mt-1 max-w-[520px] text-[12.5px] font-semibold leading-relaxed text-muted">
              Played once, undercutting looks safest. Played ten times, Yummly can <em>respond</em>: cheating wins{" "}
              <strong className="text-ink">+₹30L this week</strong>, then costs about{" "}
              <strong className="text-ink">₹40L every week after</strong>. Whether cheating pays depends on how much
              you value the future.
            </p>

            {/* Slider section */}
            <div className="mt-4 border-y border-ink/20 py-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">1 · How much does next week matter to you?</span>
                <span className={cn("rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-white", isPeace ? "bg-peace" : "bg-quickbite")}>
                  {isPeace ? "Future matters a lot" : "Only today matters"}
                </span>
              </div>

              <div className="mt-2 relative pt-1">
                <input
                  type="range"
                  min={0}
                  max={maxDelta}
                  step={0.01}
                  value={delta}
                  onChange={(event) => changeDelta(Number(event.target.value))}
                  className="ink-range w-full"
                  aria-label="How much next week matters"
                />
                <div className="pointer-events-none absolute top-0 z-10 flex -translate-x-1/2 flex-col items-center" style={{ left: `${(COLLUSION_THRESHOLD / maxDelta) * 100}%` }}>
                  <span className="h-3 w-[2px] bg-ink" />
                  <span className="mt-0.5 whitespace-nowrap rounded-[3px] border border-ink bg-ink px-1.5 py-[2px] font-mono text-[10px] font-bold uppercase text-paper">tipping point 43%</span>
                </div>
                <div className="mt-1 flex justify-between font-mono text-[10px] font-semibold text-muted">
                  <span>← Don't care about future</span>
                  <span>Care a lot →</span>
                </div>
                <p className="mt-1.5 text-[12px] font-semibold leading-relaxed text-muted">
                  <strong className="text-ink">δ (delta) is your future-focus.</strong> It is the weight you put on
                  next week's ₹1 compared with today's ₹1. 0% = only this week matters; 95% = the future almost
                  fully matters. The slider drives the long-run projection and the scale; in the week-by-week game
                  Yummly's trigger rule is fixed.
                </p>
              </div>
            </div>

            {/* 10 week visualization */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">2 · What happens in 10 weeks?</span>
                <button type="button" onClick={runAuto} className="btn btn-sm btn-ink">
                  <Zap size={13} className="text-warn" /> {autoRun ? "Replay" : "Show me"} 10 weeks
                </button>
              </div>

              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {suggestedWeeks.map((week, index) => (
                  <div key={`${autoRuns}-${week.week}`} className={cn("rounded-md border py-2 text-center transition-all", isPeace ? "border-peace/40 bg-peace-soft" : "border-quickbite/40 bg-quickbite-soft", autoRun ? "pop-in" : "")} style={{ animationDelay: autoRun ? `${index * 40}ms` : undefined }}>
                    <div className="font-mono text-[10px] font-bold text-muted">W{week.week}</div>
                    <div className={cn("num text-[14px] font-bold", isPeace ? "text-peace" : "text-quickbite")}>
                      ₹{week.qb}L
                    </div>
                    <div className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-wide opacity-60">
                      {isPeace ? "both ₹49" : "both ₹19"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-col gap-2 rounded-md bg-ink px-3 py-2.5 text-paper sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-paper/60">Total in 10 weeks (each platform)</div>
                  <div className="num text-[20px] font-bold">{isPeace ? "₹800L" : "₹400L"} <span className="text-[12px] font-semibold text-paper/60">{isPeace ? "— peaceful" : "— price war"}</span></div>
                </div>
                <div className={cn("rounded-full px-3 py-1.5 text-center font-mono text-[11px] font-bold uppercase", isPeace ? "bg-peace text-white" : "bg-quickbite text-white")}>
                  {isPeace ? "Both earn more" : "Both earn less"}
                </div>
              </div>

              <p className="mt-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted">
                Projection, not chance: both firms play their best reply to Yummly's trigger rule at this δ.
              </p>

              <p className="mt-2.5 rounded-md bg-canvas px-2.5 py-2 text-[12.5px] font-semibold leading-relaxed">
                {isPeace ? (
                  <>✅ <strong>Above 43%:</strong> The ₹30L you gain by cheating is <em>less</em> than what you'll lose in future weeks. So you both stay honest at ₹49. No contract needed — just the fear of punishment.</>
                ) : (
                  <>⚠️ <strong>Below 43%:</strong> Future weeks don't matter enough. You cheat, Yummly punishes, and you're stuck earning ₹40L/week. “Cheating today felt good for one week, terrible for nine.”</>
                )}
              </p>
            </div>

            {/* Optional play */}
            <div className="mt-5 border-t border-ink/20 pt-3">
              <button type="button" onClick={() => { setPlaying(v => !v); playSound("click"); }} className="flex w-full items-center justify-between text-left">
                <span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">3 · Want to feel it? Play week by week</span>
                  <span className="mt-0.5 block text-[13px] font-bold">You decide each week. Yummly reacts.</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full border border-ink/25 bg-canvas px-2 py-0.5 font-mono text-[10px] font-bold text-muted">
                    {rounds.length}/10
                  </span>
                  <ChevronDown size={18} className={cn("transition-transform", playing && "rotate-180")} />
                </span>
              </button>

              {playing ? (
                <div className="mt-3 space-y-3 rise-in">
                  <div className={cn("flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] font-bold", botNext === "coop" ? "bg-peace-soft text-peace border border-peace/20" : "bg-quickbite-soft text-quickbite border border-quickbite/20")}>
                    <Bot size={14} /> Yummly will: <strong>{botNext === "coop" ? "Keep ₹49 (trusts you)" : "Punish with ₹19 (never trusts again)"}</strong>
                    <Stamp tone={userDefected ? "war" : "warn"} className="ml-auto">{userDefected ? "PUNISHING" : "TRUSTING"}</Stamp>
                  </div>
                  <p className="text-[11.5px] font-semibold leading-relaxed text-muted">
                    <strong className="text-ink">Yummly's rule (grim trigger):</strong> it holds ₹49 for as long as you
                    do. The first time you pick ₹19, it switches to ₹19 permanently — so one cheat changes every later
                    week.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => playRound("coop")} disabled={completed} className="group rounded-lg border-[1.5px] border-ink bg-peace-soft p-3 text-left shadow-[2px_2px_0_#16161A] transition-transform hover:-translate-y-0.5 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40">
                      <Handshake size={18} className="text-peace" />
                      <div className="mt-1 font-bold">Stay at ₹49</div>
                      <div className="font-mono text-[11px] text-muted">Earn ₹80L if Yummly does too <Kbd>1</Kbd></div>
                    </button>
                    <button type="button" onClick={() => playRound("defect")} disabled={completed} className="group rounded-lg border-[1.5px] border-ink bg-quickbite-soft p-3 text-left shadow-[2px_2px_0_#16161A] transition-transform hover:-translate-y-0.5 active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40">
                      <Swords size={18} className="text-quickbite" />
                      <div className="mt-1 font-bold">Cheat to ₹19</div>
                      <div className="font-mono text-[11px] text-muted">Get ₹110L once — then war <Kbd>2</Kbd></div>
                    </button>
                  </div>

                  {/* Live match report */}
                  <MatchReport
                    rounds={rounds}
                    roundQb={roundQb}
                    roundYm={roundYm}
                    coopRounds={coopRounds}
                    completed={completed}
                  />

                  {rounds.length > 0 && (
                    <div className="flex items-center justify-between border-t border-ink/20 pt-2 text-[12.5px]">
                      <span><strong>Running total:</strong> ₹{roundQb}L vs ₹{roundYm}L · <span className="text-peace">{coopRounds} peaceful</span> · <span className="text-quickbite">{rounds.length - coopRounds} costly</span></span>
                      <button onClick={resetPlay} className="btn btn-sm btn-soft"><RotateCcw size={12}/> Reset</button>
                    </div>
                  )}
                  {completed && (
                    <div className={cn("border-l-[3px] pl-3 py-1.5", !userDefected ? "border-peace" : "border-quickbite")}>
                      <p className="text-[13px] font-semibold leading-relaxed">
                        {!userDefected
                          ? `You cooperated in all 10 weeks and earned ₹${roundQb}L (Yummly ₹${roundYm}L). The peaceful path paid.`
                          : coopRounds >= 6
                            ? `You held for ${coopRounds} weeks but undercut late. That wins ₹${roundQb}L now, but the trigger has tripped: Yummly keeps punishing after this window, so there is no safe last week.`
                            : `You earned ₹${roundQb}L (Yummly ₹${roundYm}L). A fully cooperative run pays ₹800L — the ${10 - coopRounds} costly weeks are Yummly's punishment.`}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-ink/15 pt-2.5">
              <span className="text-[12px] font-semibold text-muted">Move the slider, then press “Show me”</span>
              <button onClick={() => { playSound("click"); onNext(); }} className="flex items-center gap-1 text-[13px] font-extrabold text-quickbite hover:text-ink">
                Next chapter <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT - Theory + weekly chart */}
      <div className="space-y-3 lg:border-l lg:border-ink/25 lg:pl-8">
        <Card className="xray-frame overflow-hidden">
        <div className="border-b-[1.5px] border-ink bg-[#fffdf7] px-3 py-2.5">
          <PanelHead
            kicker="Right · The idea in one picture"
            title="Today's gain vs tomorrow's loss"
            accent="yummly"
            right={<Stamp tone={isPeace ? "peace" : "war"} animate key={String(isPeace)}>{isPeace ? "TRUST WINS" : "CHEATING WINS"}</Stamp>}
          />
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-[13px] font-semibold leading-relaxed text-muted">
            The scale shows why 43% is the tipping point. Left = what you gain <em>this week</em> by cheating. Right = what you lose <em>every future week</em> in the price war.
          </p>

          <div className="mt-3">
            <ScaleSvg delta={delta} future={future} temptation={temptation} angle={angle} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="border-l-[3px] border-quickbite pl-2.5">
              <div className="font-mono text-[11px] font-bold uppercase text-muted">Cheat today</div>
              <div className="num text-[22px] font-bold text-quickbite">+₹30L</div>
              <div className="text-[12px] font-semibold leading-snug text-muted">₹110L instead of ₹80L — <strong>once</strong>.</div>
            </div>
            <div className="border-l-[3px] border-peace pl-2.5">
              <div className="font-mono text-[11px] font-bold uppercase text-muted">Lose tomorrow</div>
              <div className="num text-[22px] font-bold text-peace">−₹40L<span className="text-[12px]">/week</span></div>
              <div className="text-[12px] font-semibold leading-snug text-muted">₹40L instead of ₹80L — <strong>every week after</strong>.</div>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-canvas px-3 py-2.5">
            <p className="text-[13px] font-bold leading-relaxed">
              If you care <strong className="text-peace">≥ 43% about next week</strong>, the future loss outweighs today's gain → you both cooperate.
            </p>
            <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-muted">
              If you care <strong className="text-quickbite">&lt; 43%</strong>, cheating feels worth it → price war.
            </p>
            <button onClick={() => setShowMath(v => !v)} className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wide text-muted hover:text-ink">
              {showMath ? "Hide math ▲" : "Show the math ▼"}
            </button>
            {showMath && (
              <div className="mt-2 border-t border-dashed border-ink/20 pt-2 font-mono text-[11px] leading-relaxed">
                <div>Extra today = 110 − 80 = <strong>30</strong></div>
                <div>Loss per future week = 80 − 40 = <strong>40</strong></div>
                <div className="mt-1">Future loss total = <strong>δ/(1−δ) × 40</strong></div>
                <div>Cheating not worth it when: <strong>δ/(1−δ)×40 &gt; 30</strong> → <strong>δ &gt; 30/70 ≈ 43%</strong></div>
                <div className="mt-1 text-muted">This is why the slider flips at 43%. “Future-focus” is the discount factor.</div>
              </div>
            )}
          </div>

          <div className="mt-3 rounded-md border border-ink/15 bg-canvas/40 px-3 py-2">
            <p className="text-[11.5px] font-semibold leading-relaxed text-muted">
              <strong className="text-ink">Model note.</strong> This campaign is a 10-week window into an ongoing
              relationship. Treat it as a <em>discounted repeated game</em> with no known final week (equivalently, a
              game that may continue with probability δ). That is why the 43% condition and Yummly's permanent
              punishment apply; a known finite last week would unravel cooperation by backward induction.
            </p>
          </div>

          <div className="mt-3 flex items-start gap-2 border-l-[3px] border-peace bg-peace-soft/50 px-3 py-2">
            <Info size={14} className="mt-0.5 shrink-0 text-peace" />
            <p className="text-[12.5px] font-semibold leading-relaxed">
              <strong>No handshake needed.</strong> Both platforms just <em>expect</em> punishment if they cheat. In real life this can be legally tricky — here it's just a model.
            </p>
          </div>

          <div className="mt-3 rounded-md border border-ink/15 bg-canvas/40 px-3 py-2.5">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Key terms</div>
            <dl className="mt-1.5 grid gap-1 text-[12px] leading-snug">
              <div>
                <dt className="inline font-extrabold">Repeated game:</dt>{" "}
                <dd className="inline font-semibold text-muted">the same two players make the same choice over many rounds, and remember the past.</dd>
              </div>
              <div>
                <dt className="inline font-extrabold">Discount factor (δ):</dt>{" "}
                <dd className="inline font-semibold text-muted">how much a future rupee is worth to you today — the slider.</dd>
              </div>
              <div>
                <dt className="inline font-extrabold">Grim trigger:</dt>{" "}
                <dd className="inline font-semibold text-muted">cooperate until cheated once, then punish forever. Yummly's rule.</dd>
              </div>
              <div>
                <dt className="inline font-extrabold">Folk Theorem:</dt>{" "}
                <dd className="inline font-semibold text-muted">with enough patience, many outcomes — including cooperation — can be sustained as equilibria of a repeated game. This chapter shows one.</dd>
              </div>
              <div>
                <dt className="inline font-extrabold">Nash equilibrium:</dt>{" "}
                <dd className="inline font-semibold text-muted">neither player can gain by changing only their own move. Above 43%, ₹49 & ₹49 is one.</dd>
              </div>
            </dl>
          </div>
        </div>
        </Card>

        {playing ? (
          <div className="hidden lg:sticky lg:top-3 lg:z-10 lg:block">
            <WeekChart rounds={rounds} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
