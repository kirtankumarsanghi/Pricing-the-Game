import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Dices,
  Info,
  PartyPopper,
  RotateCcw,
  Target,
  Zap,
} from "lucide-react";
import type { Day, FeedFn } from "../lib/game";
import {
  DAYS,
  loadJson,
  playDay,
  predictRivalDay,
  readPattern,
  storeJson,
} from "../lib/game";
import { playSound } from "../lib/sound";
import { cn } from "../utils/cn";
import {
  Card,
  Kbd,
  Meter,
  PanelHead,
  Stamp,
} from "./ui";

interface MixedProps {
  active: boolean;
  feed: FeedFn;
  onNext: () => void;
}

interface SaleRound {
  user: Day;
  rival: Day;
  q: number;
  y: number;
  reason: string;
  simulated: boolean;
}

interface SimPlan {
  rounds: SaleRound[];
  average: number;
  probWed: number;
}

const levelTone = {
  Low: { color: "peace", stamp: "peace", text: "text-peace", label: "Unpredictable ✓" },
  Medium: { color: "warn", stamp: "warn", text: "text-[#9a5705]", label: "Getting readable" },
  High: { color: "quickbite", stamp: "war", text: "text-quickbite", label: "Predictable ✗" },
} as const;

const MIXED_KEY = "pricing-the-game:mixed:v2";
const SIM_WEEKS = 60;

function isSaleRound(value: unknown): value is SaleRound {
  if (!value || typeof value !== "object") return false;
  const round = value as Partial<SaleRound>;
  return (
    (round.user === "W" || round.user === "S") &&
    (round.rival === "W" || round.rival === "S") &&
    typeof round.q === "number" &&
    typeof round.y === "number" &&
    typeof round.reason === "string" &&
    typeof round.simulated === "boolean"
  );
}

function loadMixedState(): { rounds: SaleRound[]; probability: number } {
  const parsed = loadJson<unknown>(MIXED_KEY, null);
  if (!parsed || typeof parsed !== "object") return { rounds: [], probability: 50 };
  const data = parsed as { rounds?: unknown; probability?: unknown };
  return {
    rounds: Array.isArray(data.rounds) ? data.rounds.filter(isSaleRound).slice(-200) : [],
    probability:
      typeof data.probability === "number"
        ? Math.min(100, Math.max(0, Math.round(data.probability / 5) * 5))
        : 50,
  };
}

function BestResponseCycle({ last }: { last?: SaleRound }) {
  const cells: Array<{ x: number; y: number; user: Day; rival: Day; label: string }> = [
    { x: 38, y: 44, user: "W", rival: "W", label: "W / W" },
    { x: 218, y: 44, user: "W", rival: "S", label: "W / S" },
    { x: 38, y: 146, user: "S", rival: "W", label: "S / W" },
    { x: 218, y: 146, user: "S", rival: "S", label: "S / S" },
  ];

  return (
    <svg
      viewBox="0 0 360 205"
      className="h-auto w-full"
      role="img"
      aria-label="No fixed day is safe. Arrows show the chase never ends."
    >
      <defs>
        <marker id="cycleArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#16161A" />
        </marker>
      </defs>
      <rect x="1" y="1" width="358" height="203" rx="8" fill="#FBF8F1" stroke="#16161A" strokeWidth="1.5" />
      <path className="cycle-arrow" d="M90 88 L90 140" stroke="#16161A" strokeWidth="1.8" markerEnd="url(#cycleArrow)" />
      <path className="cycle-arrow" d="M146 167 L210 167" stroke="#16161A" strokeWidth="1.8" markerEnd="url(#cycleArrow)" />
      <path className="cycle-arrow" d="M270 140 L270 90" stroke="#16161A" strokeWidth="1.8" markerEnd="url(#cycleArrow)" />
      <path className="cycle-arrow" d="M214 65 L150 65" stroke="#16161A" strokeWidth="1.8" markerEnd="url(#cycleArrow)" />

      {cells.map((cell) => {
        const active = last?.user === cell.user && last?.rival === cell.rival;
        const sameDay = cell.user === cell.rival;
        return (
          <g key={cell.label}>
            <rect
              x={cell.x}
              y={cell.y}
              width={104}
              height={44}
              rx={6}
              fill={active ? "#FDEBE6" : "#FFFFFF"}
              stroke="#16161A"
              strokeWidth={active ? 2.5 : 1.5}
            />
            <text x={cell.x + 8} y={cell.y + 13} fontFamily="JetBrains Mono, monospace" fontSize="6" fontWeight="700" fill="#64646E">
              {sameDay ? "SAME DAY" : "DIFFERENT"}
            </text>
            <text x={cell.x + 8} y={cell.y + 30} fontFamily="JetBrains Mono, monospace" fontSize="12" fontWeight="700" fill={sameDay ? "#1D4ED8" : "#E54826"}>
              {sameDay ? "YUM 70%" : "QB 70%"}
            </text>
            {active ? <circle cx={cell.x + 94} cy={cell.y + 10} r="3.5" fill="#E54826" /> : null}
          </g>
        );
      })}

      <text x="180" y="113" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="10" fontWeight="700" fill="#16161A">NO FIXED</text>
      <text x="180" y="123" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontSize="10" fontWeight="700" fill="#16161A">DAY IS SAFE</text>
    </svg>
  );
}

export function Mixed({ active, feed, onNext }: MixedProps) {
  const [restored] = useState(loadMixedState);
  const [rounds, setRounds] = useState<SaleRound[]>(restored.rounds);
  const [probability, setProbability] = useState(restored.probability);
  const [queue, setQueue] = useState<SaleRound[]>([]);
  const [simRunning, setSimRunning] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [showMath, setShowMath] = useState(false);
  const [simSummary, setSimSummary] = useState<{ same: number; total: number; average: number; probWed: number } | null>(null);
  const manualAwardRef = useRef(false);
  const simAwardRef = useRef(false);
  const planRef = useRef<{ average: number; probWed: number } | null>(null);
  const keyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => {});

  const manualHistory = rounds
    .filter((round) => !round.simulated)
    .map((round) => round.user);
  const read = readPattern(manualHistory);
  const last = rounds[rounds.length - 1];
  const manualRounds = manualHistory.length;
  const manualTotalShare = rounds
    .filter((round) => !round.simulated)
    .reduce((sum, round) => sum + round.q, 0);
  const manualAverage = manualRounds ? manualTotalShare / manualRounds : null;
  const simBalanced = simSummary ? Math.abs(simSummary.probWed - 0.5) < 0.001 : false;
  const patternMeter = read.signal === "none" ? read.pct : Math.max(read.pct, 70);
  const tone = levelTone[read.level];

  const addRound = (round: SaleRound) => {
    setRounds((previous) => [...previous, round].slice(-200));
  };

  const finishManualAward = (nextCount: number, nextHistory: Day[]) => {
    if (nextCount < 6 || manualAwardRef.current) return false;
    manualAwardRef.current = true;
    const finalRead = readPattern(nextHistory);
    feed({
      awardKey: "mixed-manual-objective",
      points: finalRead.level === "Low" ? 90 : 65,
      confidence: finalRead.level === "Low" ? 4 : -8,
      tone: finalRead.level === "Low" ? "win" : "stamp",
      news:
        finalRead.level === "Low"
          ? "PATTERN REPORT: Your mix stayed unpredictable — Yummly can't exploit you."
          : "PATTERN REPORT: Your schedule was readable — Yummly exploited it.",
    });
    return true;
  };

  const playManual = (day: Day) => {
    if (simRunning) return;
    const prediction = predictRivalDay(manualHistory);
    const payoff = playDay(day, prediction.day);
    const round: SaleRound = {
      user: day,
      rival: prediction.day,
      q: payoff.qb,
      y: payoff.ym,
      reason: prediction.reason,
      simulated: false,
    };
    addRound(round);
    const nextHistory = [...manualHistory, day];
    const awarded = finishManualAward(manualRounds + 1, nextHistory);
    if (!awarded) {
      feed({
        tone: payoff.qb === 70 ? "cash" : "war",
        news:
          payoff.qb === 70
            ? `FLASH SALE: Different days → You get 70% of customers!`
            : `FLASH SALE: Same day → Yummly's brand wins, you get 30%.`,
      });
    }
  };

  const buildSimulation = (probWed: number, length = SIM_WEEKS): SimPlan => {
    let localHistory = [...manualHistory];
    const planned: SaleRound[] = [];
    for (let index = 0; index < length; index += 1) {
      const day: Day = Math.random() < probWed ? "W" : "S";
      const prediction = predictRivalDay(localHistory);
      const payoff = playDay(day, prediction.day);
      planned.push({
        user: day,
        rival: prediction.day,
        q: payoff.qb,
        y: payoff.ym,
        reason: prediction.reason,
        simulated: true,
      });
      localHistory = [...localHistory, day];
    }
    const average = planned.reduce((sum, round) => sum + round.q, 0) / planned.length;
    return { rounds: planned, average, probWed };
  };

  const runSimulation = (probWed = probability / 100) => {
    if (simRunning) return;
    const plan = buildSimulation(probWed);
    planRef.current = { average: plan.average, probWed: plan.probWed };
    setSimSummary({
      same: plan.rounds.filter((round) => round.user === round.rival).length,
      total: plan.rounds.length,
      average: plan.average,
      probWed: plan.probWed,
    });
    setQueue(plan.rounds);
    setSimRunning(true);
    setSimProgress(0);
    feed({
      tone: "coin",
      news: `SIMULATION: Running ${SIM_WEEKS} weeks at ${Math.round(probWed * 100)}% Wednesday...`,
    });
  };

  const flipFairCoin = () => {
    setProbability(50);
    runSimulation(0.5);
  };

  useEffect(() => {
    if (queue.length === 0) return;
    const timer = window.setTimeout(() => {
      const [next, ...rest] = queue;
      addRound(next);
      setQueue(rest);
      setSimProgress((previous) => previous + 1);
      if (rest.length === 0) {
        const plan = planRef.current;
        const average = plan?.average ?? 0;
        const probWed = plan?.probWed ?? 0.5;
        const balanced = Math.abs(probWed - 0.5) < 0.001;
        setSimRunning(false);
        if (!simAwardRef.current) {
          simAwardRef.current = true;
          feed({
            awardKey: "mixed-fair-coin-simulation",
            points: balanced ? 130 : 75,
            confidence: balanced ? 5 : -10,
            tone: balanced ? "win" : "stamp",
            news: balanced
              ? `RESULT: Fair 50/50 mix → ${average.toFixed(0)}% share over ${SIM_WEEKS} weeks. No pattern to exploit.`
              : `RESULT: ${Math.round(probWed * 100)}% Wednesday mix → ${average.toFixed(0)}% share over ${SIM_WEEKS} weeks. A biased mix is exploitable.`,
          });
        }
      }
    }, 45);
    return () => window.clearTimeout(timer);
  }, [queue]);

  keyHandlerRef.current = (event: KeyboardEvent) => {
    if (event.repeat || simRunning) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    const key = event.key.toLowerCase();
    if (key === "1" || key === "w") {
      event.preventDefault();
      playManual("W");
    }
    if (key === "2" || key === "s") {
      event.preventDefault();
      playManual("S");
    }
    if (key === "f") {
      event.preventDefault();
      flipFairCoin();
    }
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => keyHandlerRef.current(event);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    storeJson(MIXED_KEY, { rounds, probability });
  }, [rounds, probability]);

  const resetHistory = () => {
    if (simRunning) return;
    setRounds([]);
    setSimProgress(0);
    setSimSummary(null);
    manualAwardRef.current = false;
    simAwardRef.current = false;
    playSound("click");
  };

  // Simple visual for slider: how biased?
  const isBalanced = probability === 50;
  const isBiased = Math.abs(probability - 50) > 20;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-x-0">
      <div className="space-y-3 lg:pr-8">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b-[1.5px] border-ink bg-ink px-3 py-2 text-paper">
            <span className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-paper/30 bg-warn">
              <CalendarDays size={11} strokeWidth={2.8} />
            </span>
            <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.18em]">Left · You play</span>
            <span className="ml-auto font-mono text-[11px] font-bold uppercase tracking-wider text-paper/60">
              Wednesday vs Saturday
            </span>
          </div>

          <div className="p-3.5 sm:p-4">
            {/* Simple rule box */}
            <div className="grid grid-cols-2 gap-2 rounded-md border border-ink/15 bg-canvas/40 p-2.5">
              <div className="text-center">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Same day →</div>
                <div className="mt-1 font-display text-[13px] font-bold text-yummly">Yummly wins 70%</div>
                <div className="text-[11px] font-semibold text-muted">Big brand wins the crowd</div>
              </div>
              <div className="text-center border-l border-ink/15">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Different day →</div>
                <div className="mt-1 font-display text-[13px] font-bold text-quickbite">You win 70%</div>
                <div className="text-[11px] font-semibold text-muted">You own your day</div>
              </div>
            </div>
            <p className="mt-2 text-[12.5px] font-semibold leading-relaxed text-muted">
              <strong className="text-ink">The puzzle:</strong> There's no single best day. If you always pick Wednesday, Yummly will just pick Wednesday too and beat you. The only defence is to be <span className="text-yummly">unpredictable</span>.
            </p>

            <div className="mt-2 rounded-md border border-ink/15 bg-canvas/40 p-2.5">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                What is actually happening · the sale game
              </div>
              <p className="mt-1 text-[12.5px] font-semibold leading-relaxed">
                Both apps run a one-day flash sale each week, and customers must split between them.
                <strong className="text-yummly"> Different days</strong> means each platform owns its own day, so you keep 70% of the crowd. <strong className="text-yummly">The same day</strong> puts both promotions head-to-head, and Yummly's bigger brand wins the overlap with 70%.
              </p>
              <p className="mt-1 text-[12px] font-semibold leading-relaxed text-muted">
                The two shares always add to 100% — this is a fight over a fixed pool, not a market that grows. In game theory it is called <strong className="text-ink">Matching Pennies</strong>: you want to differ, Yummly wants to match.
              </p>
            </div>

            {/* Play area */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">1 · Pick a sale day (try to be unpredictable)</span>
                <span className="font-mono text-[11px] text-muted"><Kbd>1</Kbd> <Kbd>2</Kbd></span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["W", "S"] as Day[]).map((day) => {
                  const detail = day === "W" ? "Midweek shoppers" : "Weekend shoppers";
                  const Icon = day === "W" ? CalendarDays : PartyPopper;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => playManual(day)}
                      disabled={simRunning}
                      className={cn(
                        "group relative min-h-[90px] rounded-lg border-[1.5px] p-3 text-left shadow-[2px_2px_0_#16161A] transition-transform hover:-translate-y-0.5 active:translate-y-[1px] disabled:opacity-50",
                        day === "W" ? "bg-warn-soft border-warn/30" : "bg-yummly-soft border-yummly/20"
                      )}
                    >
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-md border", day === "W" ? "bg-warn text-white border-warn" : "bg-yummly text-white border-yummly")}>
                        <Icon size={14} strokeWidth={2.5} />
                      </div>
                      <div className="mt-2 font-display text-[15px] font-bold leading-tight">{DAYS[day].name}</div>
                      <div className="text-[11px] font-semibold text-muted">{detail}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result */}
            {last ? (
              <div key={rounds.length} className="pop-in mt-3 rounded-lg border-[1.5px] border-ink bg-[#fffef9] p-3 shadow-[2px_2px_0_#16161A]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                    You: {DAYS[last.user].name} vs Yummly: {DAYS[last.rival].name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {last.simulated ? <Stamp tone="muted">SIM</Stamp> : null}
                    <Stamp tone={last.q === 70 ? "peace" : "war"}>{last.q === 70 ? "YOU WIN" : "YUMMLY WINS"}</Stamp>
                  </span>
                </div>
                <div className="mt-2 flex h-2.5 overflow-hidden rounded-full border border-ink/20">
                  <div className="bg-quickbite transition-all" style={{ width: `${last.q}%` }} />
                  <div className="bg-yummly transition-all" style={{ width: `${last.y}%` }} />
                </div>
                <div className="mt-1 flex justify-between font-mono text-[11px] font-bold">
                  <span className="text-quickbite">You {last.q}%</span>
                  <span className="text-yummly">Yummly {last.y}%</span>
                </div>
                <p className="mt-1.5 text-[12px] font-semibold leading-relaxed text-muted">
                  {last.q === 70 ? "Different days — you kept your own customers." : "Same day — Yummly's bigger brand pulled customers away."}
                </p>
                <p className="mt-1 font-mono text-[11px] font-semibold leading-relaxed text-muted">
                  Yummly's logic: {last.reason}
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 border-l border-ink/20 pl-3 py-1">
                <Target size={14} className="shrink-0 text-muted" />
                <p className="text-[12.5px] font-semibold leading-relaxed text-muted">
                  Pick a day. Yummly will try to guess and match you. Try picking the <em>same</em> day 3 times — watch what happens.
                </p>
              </div>
            )}

            <div className="mt-3 rounded-md border border-ink/15 bg-canvas/40 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">How Yummly picks its day</div>
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">Sees only your past picks</span>
              </div>
              <ul className="mt-1.5 grid gap-1 text-[12px] font-semibold leading-snug text-muted">
                <li><strong className="text-ink">Repeat:</strong> your last two picks match → Yummly copies that day.</li>
                <li><strong className="text-ink">Alternation:</strong> three or more switches in a row → it predicts the opposite of your last day.</li>
                <li><strong className="text-ink">Lean:</strong> at least two-thirds of the last 6 picks are one day (rounded up) → it picks that day.</li>
                <li><strong className="text-ink">Noise:</strong> fewer than 3 picks, or no readable pattern → it flips a coin.</li>
              </ul>
              <p className="mt-1.5 text-[11.5px] font-semibold leading-relaxed text-muted">
                It reads the same last-6 window as the predictability meter, and never sees your current pick — only history.
              </p>
            </div>

            {/* Predictability - super simple */}
            <div className="mt-4 border-t border-ink/15 pt-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">2 · Can Yummly read you?</span>
                <span className={cn("rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase text-white", tone.color === "peace" ? "bg-peace" : tone.color === "warn" ? "bg-warn" : "bg-quickbite")}>
                  {tone.label}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1">
                  <Meter value={patternMeter} tone={tone.color} className="h-2.5" label="Pattern predictability" />
                </div>
                <span className={cn("num text-[13px] font-bold", tone.text)}>
                  {read.level === "Low"
                    ? "Safe"
                    : read.signal === "alternating"
                      ? "Alternating"
                      : read.signal === "repeat"
                        ? "Repeat pattern"
                        : `${read.pct}% biased`}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] font-semibold leading-relaxed text-muted">
                {read.level === "Low"
                  ? "Your choices look random — hard to exploit."
                  : read.signal === "alternating"
                    ? "You are alternating. Readable, but harder to exploit than a fixed day."
                    : read.signal === "repeat"
                      ? "You are repeating a day. Yummly can copy it."
                      : "You are leaning one way. Yummly can lean against it."}
              </p>
              {manualHistory.length > 0 && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Your last 6 picks:</span>
                  <span className="font-mono text-[12px] font-bold tracking-widest">
                    {manualHistory.slice(-6).map((d, i) => (
                      <span key={i} className={d === "W" ? "text-warn" : "text-yummly"}>{d} </span>
                    ))}
                  </span>
                  <button onClick={resetHistory} disabled={simRunning} className="ml-auto font-mono text-[11px] font-bold text-muted hover:text-ink disabled:opacity-40">
                    <RotateCcw size={10} className="inline" /> Clear
                  </button>
                </div>
              )}
            </div>

            {rounds.length > 0 && (
              <div className="mt-3 border-t border-ink/15 pt-2">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                  <span>Round log</span>
                  <span>You / Yummly → your share</span>
                </div>
                <div className="no-scrollbar mt-1 max-h-[124px] space-y-0.5 overflow-y-auto pr-1">
                  {rounds.slice(-8).reverse().map((round, index) => {
                    const number = rounds.length - index;
                    return (
                      <div key={number} className="grid grid-cols-[34px_1fr_auto] items-center gap-2 rounded px-1 py-0.5 text-[11.5px] font-semibold odd:bg-canvas/60">
                        <span className="font-mono text-[10px] font-bold text-muted">R{number}</span>
                        <span>
                          <span className={round.user === "W" ? "text-warn" : "text-yummly"}>{DAYS[round.user].short}</span>
                          <span className="text-muted"> vs {DAYS[round.rival].short}</span>
                          {round.simulated ? <span className="ml-1 font-mono text-[9px] uppercase text-muted">sim</span> : null}
                        </span>
                        <span className={round.q === 70 ? "text-quickbite" : "text-yummly"}>{round.q}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mix lab - super simple */}
            <div className="mt-4 border-t border-ink/20 pt-3">
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">3 · The fix: mix your choices</div>
              <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-muted">
                Move the slider to choose how often you pick Wednesday. At <strong className="text-ink">50 / 50</strong>, Yummly can't exploit you — that's the balance point.
              </p>

              <div className="mt-3 flex items-center justify-between rounded-md bg-canvas px-3 py-2">
                <span className="font-mono text-[11px] font-bold">WED <span className="text-[#9a5705]">{probability}%</span></span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="ink-range mx-3 flex-1"
                  aria-label="How often you pick Wednesday"
                />
                <span className="font-mono text-[11px] font-bold">SAT <span className="text-yummly">{100 - probability}%</span></span>
              </div>
              <div className="mt-1 text-center font-mono text-[11px] font-bold uppercase tracking-wide">
                {isBalanced ? "✓ Perfectly balanced — hardest to exploit" : isBiased ? "⚠️ Very biased — easy to exploit" : "Somewhat biased — Yummly has an edge"}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" onClick={flipFairCoin} disabled={simRunning} className="btn btn-ink text-[12.5px]">
                  <Dices size={14} className="text-warn" /> Try fair coin (50/50)
                </button>
                <button type="button" onClick={() => runSimulation()} disabled={simRunning} className="btn btn-soft text-[12.5px]">
                  <Zap size={13} /> Test my mix
                </button>
              </div>

              {simRunning && (
                <div className="mt-2 border-y border-ink/20 py-2">
                  <div className="flex justify-between font-mono text-[11px] font-bold uppercase">
                    <span>Simulating {simProgress}/{SIM_WEEKS} weeks…</span>
                    <span>{Math.round((simProgress / SIM_WEEKS) * 100)}%</span>
                  </div>
                  <Meter
                    value={(simProgress / SIM_WEEKS) * 100}
                    tone="yummly"
                    className="mt-1 h-2"
                    label="Simulation progress"
                  />
                </div>
              )}

              {manualRounds > 0 && !simRunning && (
                <div className="mt-3 flex items-center justify-between rounded-md bg-ink px-3 py-2 text-paper">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-paper/60">Your manual average</span>
                  <span className="num text-[16px] font-bold">{manualAverage?.toFixed(0)}% <span className="text-[11px] font-semibold text-paper/60">of customers</span></span>
                </div>
              )}

              {simSummary && !simRunning && (
                <div className="mt-2 rounded-md border border-ink/15 bg-canvas/40 px-2.5 py-2 text-[12px] font-semibold leading-relaxed">
                  <strong className="text-ink">Last {simSummary.total}-week test:</strong>{" "}
                  {simBalanced
                    ? "fair 50/50 mix"
                    : `${Math.round(simSummary.probWed * 100)}% Wednesday mix`}
                  {" — "}Yummly matched your day {simSummary.same}/{simSummary.total} times; you kept{" "}
                  <strong className="text-ink">{simSummary.average.toFixed(0)}%</strong> on average.{" "}
                  {simBalanced
                    ? "That is consistent with the 50% value; a 60-week sample still varies."
                    : "A biased mix gives Yummly something to lean against."}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-ink/15 pt-2.5">
              <span className="text-[12.5px] font-semibold text-muted">Try: always pick one day, then try 50/50</span>
              <button onClick={() => { playSound("click"); onNext(); }} className="flex items-center gap-1 text-[13px] font-extrabold text-quickbite hover:text-ink">
                Summary <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Card>
      </div>

      {/* RIGHT - Simple theory */}
      <Card className="xray-frame overflow-hidden lg:border-l lg:border-ink/25 lg:pl-8">
        <div className="border-b-[1.5px] border-ink bg-[#fffdf7] px-3 py-2.5">
          <PanelHead kicker="Right · The idea in one picture" title="Why no fixed day is safe" accent="yummly" />
        </div>
        <div className="p-3 sm:p-4">
          <p className="text-[13px] font-semibold leading-relaxed text-muted">
            Same day helps Yummly (bigger brand). Different day helps you. So whatever day you always pick, the other player wants to switch — the chase never ends.
          </p>

          <div className="mt-3">
            <BestResponseCycle last={last} />
            <p className="mt-2 rounded-md bg-canvas px-2.5 py-2 text-[12.5px] font-semibold leading-relaxed">
              Each cell shows who wins 70%:<br />
              <span className="text-yummly">● Same day → Yummly 70%</span> &nbsp;|&nbsp; <span className="text-quickbite">● Different → You 70%</span><br />
              Arrows = “I want to switch.” It loops forever → <strong>no fixed choice is stable.</strong>
            </p>
          </div>

          <div className="mt-4">
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">The 2×2 table underneath</div>
            <div className="mt-2 grid grid-cols-[60px_1fr_1fr] gap-1.5 text-[12px]">
              <div />
              <div className="text-center font-mono text-[11px] font-bold uppercase text-yummly">YUM Wed</div>
              <div className="text-center font-mono text-[11px] font-bold uppercase text-yummly">YUM Sat</div>
              <div className="font-mono text-[11px] font-bold uppercase text-quickbite">You Wed</div>
              <div className="rounded border bg-yummly-soft py-1.5 text-center font-bold text-yummly">YUM 70%</div>
              <div className="rounded border bg-quickbite-soft py-1.5 text-center font-bold text-quickbite">YOU 70%</div>
              <div className="font-mono text-[11px] font-bold uppercase text-quickbite">You Sat</div>
              <div className="rounded border bg-quickbite-soft py-1.5 text-center font-bold text-quickbite">YOU 70%</div>
              <div className="rounded border bg-yummly-soft py-1.5 text-center font-bold text-yummly">YUM 70%</div>
            </div>
          </div>

          <div className="mt-4 rounded-md bg-warn-soft/50 px-3 py-2.5">
            <p className="text-[13px] font-bold">So what fixes it? Mix.</p>
            <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-muted">
              If you flip a fair coin (50% Wednesday, 50% Saturday), your expected share is 50% against any opponent.
              The equilibrium mix is 50/50 for both sides; this bot is a pattern-reader, so your 50/50 guarantees 50%
              against it. That is the <strong>mixed strategy</strong>.
            </p>
            <button onClick={() => setShowMath(v => !v)} className="mt-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-muted hover:text-ink">
              {showMath ? "Hide math ▲" : "Why exactly 50/50? Show math ▼"}
            </button>
            {showMath && (
              <div className="mt-2 border-t border-dashed border-ink/20 pt-2 font-mono text-[11px] leading-relaxed">
                <div>Yummly's payoff if it picks Wed: <strong>70×p + 30×(1−p)</strong></div>
                <div>Yummly's payoff if it picks Sat: <strong>30×p + 70×(1−p)</strong></div>
                <div className="mt-1">You make Yummly indifferent when they're equal:</div>
                <div className="font-bold">30 + 40p = 70 − 40p → 80p = 40 → <span className="text-peace">p = 50%</span></div>
                <div className="mt-1 text-muted">p = your chance of picking Wednesday. Same logic gives Yummly 50/50 too.</div>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-md bg-ink px-3 py-2.5 text-paper">
            <Info size={14} className="mt-0.5 shrink-0 text-warn" />
            <p className="text-[12px] font-semibold leading-relaxed text-paper/80">
              This is a simplified model. Real sale success depends on many things — but the core idea holds: <strong className="text-paper">predictable = punishable.</strong>
            </p>
          </div>

          <div className="mt-3 rounded-md border border-ink/15 bg-canvas/40 px-3 py-2.5">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">Key terms</div>
            <dl className="mt-1.5 grid gap-1 text-[12px] leading-snug">
              <div>
                <dt className="inline font-extrabold">Matching Pennies:</dt>{" "}
                <dd className="inline font-semibold text-muted">one player wants to match, the other wants to differ. Here you differ, Yummly matches.</dd>
              </div>
              <div>
                <dt className="inline font-extrabold">Zero-sum:</dt>{" "}
                <dd className="inline font-semibold text-muted">one side's gain is exactly the other's loss — the shares always add to 100%.</dd>
              </div>
              <div>
                <dt className="inline font-extrabold">Mixed strategy:</dt>{" "}
                <dd className="inline font-semibold text-muted">randomising your move so the rival cannot build a reliable prediction.</dd>
              </div>
              <div>
                <dt className="inline font-extrabold">Indifference:</dt>{" "}
                <dd className="inline font-semibold text-muted">choosing a mix that leaves the rival equally well off whichever day it picks — the 50/50 balance.</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>
    </div>
  );
}
