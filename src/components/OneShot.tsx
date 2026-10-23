import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  IndianRupee,
  Percent,
  RotateCcw,
  Scale,
  Scissors,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import type { Fee, FeedFn } from "../lib/game";
import { CELL_NOTES, FEES, MATRIX, PARETO_CELLS, getPayoff } from "../lib/game";
import { playSound } from "../lib/sound";
import { cn } from "../utils/cn";
import {
  Card,
  Divider,
  KeyHint,
  Kbd,
  PanelHead,
  ReceiptHeader,
  Stamp,
  Tag,
  ToastNote,
} from "./ui";

interface OneShotProps {
  active: boolean;
  feed: FeedFn;
  onNext: () => void;
}

type CellKey = `${Fee}-${Fee}`;
type ToggleKey = "br" | "dom" | "pareto";

interface PlayedWeek {
  q: Fee;
  y: Fee;
  qb: number;
  ym: number;
}

const feeOptions: Fee[] = ["standard", "discount"];
const cellKey = (q: Fee, y: Fee): CellKey => `${q}-${y}`;

function resultCopy(q: Fee, y: Fee) {
  if (q === "discount" && y === "discount") {
    return {
      tone: "warn" as const,
      headline: "Both discounted. The trap has you.",
      body: "You each earn ₹40L. But if you had both held at ₹49, you would each have earned ₹80L. Each platform’s private incentive pulled both into the weaker joint result.",
    };
  }
  if (q === "standard" && y === "discount") {
    return {
      tone: "quickbite" as const,
      headline: "Yummly discounted alone.",
      body: "The rival takes ₹110L while you keep ₹25L. Your margin is intact, but the customers are not. This is exactly the risk that makes waiting at ₹49 feel unsafe.",
    };
  }
  if (q === "discount" && y === "standard") {
    return {
      tone: "peace" as const,
      headline: "You undercut Yummly — and won the week.",
      body: "QuickBite books ₹110L against Yummly’s ₹25L. Tempting — but Yummly now has every reason to retaliate with its own discount next week.",
    };
  }
  return {
    tone: "peace" as const,
    headline: "Both held at ₹49. A profitable ceasefire.",
    body: "₹80L each. Customers pay a higher fee, but both platforms are better off than under a discount war. The question is whether this is stable against temptation.",
  };
}

export function OneShot({ active, feed, onNext }: OneShotProps) {
  const [rival, setRival] = useState<Fee>("standard");
  const [last, setLast] = useState<PlayedWeek | null>(null);
  const [inspected, setInspected] = useState<{ q: Fee; y: Fee } | null>(null);
  const [history, setHistory] = useState<PlayedWeek[]>([]);
  const [seenCells, setSeenCells] = useState<Set<string>>(new Set());
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>({
    br: false,
    dom: false,
    pareto: false,
  });
  const receiptRef = useRef<HTMLDivElement>(null);
  const keyHandlerRef = useRef<(event: KeyboardEvent) => void>(() => {});

  const playFee = (q: Fee) => {
    const y: Fee = rival;
    const payoff = getPayoff(q, y);
    const week: PlayedWeek = { q, y, qb: payoff.qb, ym: payoff.ym };
    setLast(week);
    setInspected({ q, y });
    setHistory((prev) => [week, ...prev].slice(0, 6));

    const cellKey = `${q}-${y}`;
    const freshCell = !seenCells.has(cellKey);
    const completesAll = freshCell && seenCells.size === 3;
    if (freshCell) {
      setSeenCells((prev) => new Set([...prev, cellKey]));
    }

    const news =
      q === "discount" && y === "discount"
        ? "TICKER: QuickBite and Yummly both cut delivery fees to ₹19. Customers feast while margins bleed."
        : q === "standard" && y === "standard"
          ? "TICKER: Both platforms hold delivery at ₹49. Fragile peace in the city — rivals are watching."
          : q === "discount"
            ? "TICKER: QuickBite undercuts at ₹19 and grabs the week. Yummly’s desk is asking for a response."
            : "TICKER: Yummly discounts alone to ₹19. QuickBite keeps ₹49 — and loses the price-sensitive crowd.";

    feed({
      ...(freshCell
        ? {
            awardKey: `one-shot-cell-${cellKey}`,
            points: completesAll ? 125 : 25,
            confidence: completesAll ? 8 : 1,
          }
        : {}),
      tone: q === "discount" ? "cash" : "war",
      news: completesAll
        ? "ALL FOUR OUTCOMES EXPLORED. The whole game fits on one table — now read it on the right."
        : news,
    });

    window.setTimeout(() => {
      receiptRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

  keyHandlerRef.current = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    if (event.key === "1") {
      event.preventDefault();
      playFee("standard");
    }
    if (event.key === "2") {
      event.preventDefault();
      playFee("discount");
    }
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => keyHandlerRef.current(event);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const toggle = (key: ToggleKey) => {
    const next = !toggles[key];
    setToggles((prev) => ({ ...prev, [key]: next }));
    if (next) {
      feed({
        awardKey: `one-shot-proof-${key}`,
        points: 15,
        tone: "stamp",
        news: `X-RAY UPDATED: “${
          key === "br" ? "Best responses" : key === "dom" ? "Dominance elimination" : "Pareto vs. Nash"
        }” visual switched on.`,
      });
    } else {
      playSound("click");
    }
  };

  const revealWhy = () => {
    const fresh = !toggles.br || !toggles.dom;
    setToggles((prev) => ({ ...prev, br: true, dom: true }));
    if (fresh) {
      feed({
        awardKey: "one-shot-reveal-why",
        points: 25,
        tone: "stamp",
        news: "X-RAY: The full dominance proof is exposed. Discounting beats standard pricing under both rival choices.",
      });
    }
    if (window.innerWidth < 1024) {
      window.setTimeout(() => {
        document.getElementById("xray-oneshot")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    }
  };

  const resetTests = () => {
    setLast(null);
    setHistory([]);
    setInspected(null);
    playSound("click");
  };

  const foundCount = seenCells.size;

  const sessionQb = history.reduce((sum, week) => sum + week.qb, 0);
  const sessionYm = history.reduce((sum, week) => sum + week.ym, 0);
  const feedback = last ? resultCopy(last.q, last.y) : null;

  const bestQbInColumn = (y: Fee) =>
    Math.max(...feeOptions.map((q) => MATRIX[q][y].qb));
  const bestYmInRow = (q: Fee) =>
    Math.max(...feeOptions.map((y) => MATRIX[q][y].ym));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-x-0">
      <div className="space-y-3 lg:pr-8">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink bg-ink px-3 py-2 text-paper sm:px-4">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-[4px] border border-paper/30 bg-quickbite">
                <IndianRupee size={11} strokeWidth={2.8} />
              </span>
              <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.18em]">
                Left · You play
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-paper/65">
              <span>Week {String(history.length || 1).padStart(2, "0")}</span>
              <span className="h-3 w-px bg-paper/25" />
              <span className="text-warn">India · Q3</span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[11.5px] font-bold uppercase tracking-[0.15em] text-muted">
                  <Sparkles size={11} /> The fee board
                </div>
                <h2 className="mt-1 font-display text-[20px] font-bold leading-tight">Your move: set this week’s fee</h2>
              </div>
            </div>

            <div className="mt-3 border-y border-ink/25 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                    Step 1 · Yummly’s fee
                  </div>
                  <div className="mt-0.5 text-[13px] font-bold">
                    Pick the rival’s fee, then set yours. Try all four combinations.
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "num flex h-5 w-5 items-center justify-center border font-mono text-[11px] font-bold",
                        i < foundCount ? "border-ink bg-quickbite text-white" : "border-ink/30 text-muted"
                      )}
                      aria-label={i < foundCount ? "Outcome explored" : "Outcome not explored yet"}
                    >
                      {i < foundCount ? "✓" : i + 1}
                    </span>
                  ))}
                  <span className="ml-1 font-mono text-[11px] font-bold text-muted">
                    {foundCount}/4 outcomes
                  </span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {feeOptions.map((fee) => (
                  <button
                    key={fee}
                    type="button"
                    onClick={() => {
                      setRival(fee);
                      playSound("click");
                    }}
                    aria-pressed={rival === fee}
                    className={cn(
                      "flex min-h-9 items-center justify-between gap-1 rounded-[5px] border-[1.5px] px-2 py-1 text-left transition-colors",
                      rival === fee
                        ? "border-ink bg-yummly text-white shadow-[1px_1px_0_#16161A]"
                        : "border-ink/25 bg-white hover:border-ink"
                    )}
                  >
                    <span className="font-mono text-[11.5px] font-bold">{FEES[fee].short}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wide">
                      {fee === "standard" ? "Standard" : "Discount"}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-1.5 font-mono text-[10.5px] leading-relaxed text-muted">
                {foundCount < 4
                  ? "Each new combination scores +25. Finding all four scores +125."
                  : "All four outcomes explored. The pattern is on the right →"}
              </p>
            </div>

            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                  Step 2 · QuickBite’s fee
                </span>
                <KeyHint>
                  <Kbd>1</Kbd>
                  <Kbd>2</Kbd> quick fee
                </KeyHint>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {feeOptions.map((fee, index) => {
                  const chosen = last?.q === fee;
                  const isDiscount = fee === "discount";
                  return (
                    <button
                      key={fee}
                      type="button"
                      onClick={() => playFee(fee)}
                      className={cn(
                        "group relative min-h-[118px] overflow-hidden rounded-lg border-[1.5px] p-2.5 text-left shadow-[3px_3px_0_#16161A] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#16161A] sm:p-3",
                        isDiscount
                          ? "bg-quickbite text-white hover:-translate-y-0.5"
                          : "bg-white hover:-translate-y-0.5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-md border-[1.5px] border-ink",
                            isDiscount ? "bg-white/15 text-white" : "bg-canvas text-quickbite"
                          )}
                        >
                          {isDiscount ? (
                            <Percent size={14} strokeWidth={2.7} />
                          ) : (
                            <IndianRupee size={14} strokeWidth={2.7} />
                          )}
                        </span>
                        <span
                          className={cn(
                            "num rounded border px-1.5 py-0.5 text-[15px] font-bold leading-none sm:text-[17px]",
                            isDiscount ? "border-white/40 bg-white/10" : "border-ink bg-paper"
                          )}
                        >
                          {FEES[fee].short}
                        </span>
                      </div>
                      <div className="mt-2 font-display text-[14px] font-bold leading-tight sm:text-[15px]">
                        {fee === "standard" ? "Standard pricing" : "Discount pricing"}
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 text-[12px] font-semibold leading-snug",
                          isDiscount ? "text-white/80" : "text-muted"
                        )}
                      >
                        {FEES[fee].role}
                      </div>
                      <div className="mt-2 flex items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-wide">
                        <Kbd>{index + 1}</Kbd>
                        <span className={isDiscount ? "text-white/65" : "text-muted"}>
                          {chosen ? "ran last week" : "send to market"}
                        </span>
                        {chosen ? <Check size={10} className="ml-auto text-current" /> : null}
                      </div>
                      <div
                        className={cn(
                          "pointer-events-none absolute -bottom-5 -right-5 h-16 w-16 rounded-full border opacity-30 transition-transform group-hover:scale-110",
                          isDiscount ? "border-white/60 bg-white/5" : "border-quickbite/40 bg-quickbite/5"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <p className="text-[11.5px] font-semibold leading-snug text-muted">
                  Each click files one week. New combinations are scored.
                </p>
                <button
                  type="button"
                  onClick={resetTests}
                  className="flex shrink-0 items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-wide text-muted transition-colors hover:text-ink"
                >
                  <RotateCcw size={10} /> Clear desk
                </button>
              </div>
            </div>

            <Divider />

            <div ref={receiptRef}>
              {last && feedback ? (
                <div className="ticket-edge relative overflow-hidden rounded-lg border-[1.5px] border-ink bg-[#fffef9] shadow-[2px_2px_0_#16161A]">
                  <div className="flex items-center justify-between gap-2 border-b-[1.5px] border-dashed border-ink/30 bg-paper px-3 py-2">
                    <ReceiptHeader
                      title="Weekly margin receipt"
                      meta={`Desk 0427 · Week ${String(history.length).padStart(2, "0")} · Profit in ₹ lakh`}
                    />
                  </div>
                  <div key={history.length} className="pop-in px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[12.5px] font-bold">
                        <span className="h-2 w-2 rounded-full bg-quickbite" /> QuickBite (you)
                      </span>
                      <span className="font-mono text-[11.5px] text-muted">
                        fee {FEES[last.q].short}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full border border-ink/20 bg-canvas">
                        <div
                          className="h-full rounded-full bg-quickbite transition-[width] duration-700"
                          style={{ width: `${Math.min(100, (last.qb / 110) * 100)}%` }}
                        />
                      </div>
                      <span className="num w-[64px] text-right text-[15px] font-bold">
                        ₹{last.qb}L
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[12.5px] font-bold">
                        <span className="h-2 w-2 rounded-full bg-yummly" /> Yummly
                      </span>
                      <span className="font-mono text-[11.5px] text-muted">
                        fee {FEES[last.y].short}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full border border-ink/20 bg-canvas">
                        <div
                          className="h-full rounded-full bg-yummly transition-[width] duration-700"
                          style={{ width: `${Math.min(100, (last.ym / 110) * 100)}%` }}
                        />
                      </div>
                      <span className="num w-[64px] text-right text-[15px] font-bold">
                        ₹{last.ym}L
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-start gap-2 border-t border-dashed border-ink/25 pt-2">
                      {last.qb >= last.ym ? (
                        <TrendingUp size={14} className="mt-0.5 shrink-0 text-peace" />
                      ) : (
                        <TrendingDown size={14} className="mt-0.5 shrink-0 text-quickbite" />
                      )}
                      <div>
                        <div className="text-[13px] font-extrabold leading-snug">
                          {feedback.headline}
                        </div>
                        <p className="mt-0.5 text-[12.5px] font-semibold leading-relaxed text-muted">
                          {feedback.body}
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 flex items-end justify-between gap-2 border-t-[1.5px] border-dashed border-ink/25 pt-2">
                      <div className="font-mono text-[10.5px] leading-relaxed text-muted">
                        SESSION · QB ₹{sessionQb}L / YUM ₹{sessionYm}L
                        <br />
                        PLAYED {history.length} WEEK{history.length === 1 ? "" : "S"} · PROFIT IN ₹ LAKH
                      </div>
                      <div className="rotate-[-3deg]">
                        <Stamp tone={last.q === "standard" && last.y === "standard" ? "peace" : last.qb >= 40 ? "warn" : "war"}>
                          {last.q === "standard" && last.y === "standard" ? "PEACE?" : last.qb >= 80 ? "TEMPTING" : "TRAPPED"}
                        </Stamp>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-ink/30 bg-paper px-3 py-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                      Thank you for choosing strategy
                    </span>
                    <span className="paper-strip h-4 w-12 opacity-60" aria-hidden="true" />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[158px] flex-col items-center justify-center border-y border-dashed border-ink/30 px-4 py-5 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-dashed border-ink/40 bg-white">
                    <IndianRupee size={18} className="text-muted" />
                  </div>
                  <p className="mt-2 font-display text-[13px] font-bold">Your receipt will print here.</p>
                  <p className="mt-1 max-w-[290px] font-mono text-[11px] leading-relaxed text-muted">
                    TWO FEES IN → ONE RECEIPT OUT. Set Yummly’s fee, then QuickBite’s fee above.
                  </p>
                </div>
              )}
            </div>

            {last ? (
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={revealWhy}
                  className="flex min-h-[42px] items-center justify-between gap-2 rounded-md border-[1.5px] border-ink bg-warn-soft px-2.5 py-2 text-left shadow-[2px_2px_0_#16161A] transition-transform hover:-translate-y-0.5 active:translate-y-[1px]"
                >
                  <span>
                    <span className="block font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#8a5104]">
                      After the first round
                    </span>
                    <span className="block text-[13px] font-extrabold">
                      Why did this outcome happen?
                    </span>
                  </span>
                  <Eye size={15} className="shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    onNext();
                  }}
                  className="flex min-h-[42px] items-center justify-between gap-2 rounded-md border-[1.5px] border-ink bg-ink px-2.5 py-2 text-left text-paper shadow-[2px_2px_0_#16161A] transition-transform hover:-translate-y-0.5 active:translate-y-[1px]"
                >
                  <span>
                    <span className="block font-mono text-[10.5px] font-bold uppercase tracking-wider text-paper/50">
                      Chapter 02
                    </span>
                    <span className="block text-[13px] font-extrabold">Meet the 10-week war</span>
                  </span>
                  <ArrowRight size={15} className="shrink-0 text-warn" />
                </button>
              </div>
            ) : (
              <div className="mt-2.5 flex items-center gap-2 border-l border-ink/25 pl-2.5 py-1">
                <Users size={13} className="shrink-0 text-muted" />
                <p className="text-[12px] font-semibold leading-snug text-muted">
                  Yummly is watching the fee board. Its move is revealed the moment you file yours.
                </p>
              </div>
            )}
          </div>
        </Card>

      </div>

      <Card id="xray-oneshot" className="xray-frame overflow-hidden scroll-mt-3 lg:border-l lg:border-ink/25 lg:pl-8">
        <div className="border-b-[1.5px] border-ink bg-[#fffdf7]/90 px-3 py-2.5 sm:px-4">
          <PanelHead
            kicker="Right · The theory"
            title="The one-shot fee game"
            meta="Normal-form game · 2 players · 2 strategies · profit in ₹ lakhs"
            accent="yummly"
            right={
              <div className="text-right">
                <Stamp tone="ink">NORMAL FORM</Stamp>
                <div className="mt-1 font-mono text-[10.5px] uppercase tracking-wider text-muted">
                  Row = QB · Col = YUM
                </div>
              </div>
            }
          />
        </div>

        <div className="px-3 pb-3.5 pt-3 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-mono text-[11.5px] font-bold uppercase tracking-wider text-muted">
              <span className="h-2 w-2 rounded-sm bg-quickbite" /> QuickBite payoff
              <span className="ml-1 h-2 w-2 rounded-full bg-yummly" /> Yummly payoff
            </div>
            <Tag tone="warn">₹ Lakh / week</Tag>
          </div>

          <div className="mt-2 overflow-x-auto">
            <div className="min-w-[268px]">
              <div className="grid grid-cols-[72px_1fr_1fr] gap-[3px]">
                <div className="flex items-end justify-center pb-1">
                  <span className="rounded-[3px] bg-canvas px-1 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    QB / YUM
                  </span>
                </div>
                {feeOptions.map((y) => (
                  <div
                    key={`col-${y}`}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-t-md border-[1.5px] border-b-0 px-1 py-1.5 text-center transition-colors",
                      toggles.dom && y === "standard"
                        ? "border-ink/20 bg-canvas text-muted"
                        : "border-ink/30 bg-yummly-soft text-yummly"
                    )}
                  >
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider">
                      Yummly
                    </span>
                    <span
                      className={cn(
                        "num text-[12px] font-bold leading-tight",
                        toggles.dom && y === "standard" && "line-through decoration-2"
                      )}
                    >
                      {FEES[y].short} {y === "standard" ? "STD" : "DISC"}
                    </span>
                  </div>
                ))}

                {feeOptions.map((q) => (
                  <div key={`row-${q}`} className="contents">
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center rounded-l-md border-[1.5px] border-r-0 px-1 py-1 text-center transition-colors",
                        toggles.dom && q === "standard"
                          ? "border-ink/20 bg-canvas text-muted"
                          : "border-ink/30 bg-quickbite-soft text-quickbite"
                      )}
                    >
                      <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider">
                        QuickBite
                      </span>
                      <span
                        className={cn(
                          "num text-[12px] font-bold leading-tight",
                          toggles.dom && q === "standard" && "line-through decoration-2"
                        )}
                      >
                        {FEES[q].short} {q === "standard" ? "STD" : "DISC"}
                      </span>
                    </div>

                    {feeOptions.map((y) => {
                      const payoff = MATRIX[q][y];
                      const played = last?.q === q && last?.y === y;
                      const isInspected = inspected?.q === q && inspected?.y === y;
                      const dominated =
                        toggles.dom && (q === "standard" || y === "standard");
                      const isBestForQb = toggles.br && payoff.qb === bestQbInColumn(y);
                      const isBestForYm = toggles.br && payoff.ym === bestYmInRow(q);
                      const isParetoCell =
                        toggles.pareto && PARETO_CELLS.has(cellKey(q, y));
                      const isNashCell =
                        toggles.pareto && q === "discount" && y === "discount";

                      return (
                        <button
                          key={cellKey(q, y)}
                          type="button"
                          onClick={() => {
                            setInspected({ q, y });
                            playSound("click");
                          }}
                          className={cn(
                            "relative min-h-[92px] rounded-[6px] border-[1.5px] p-1.5 text-left transition-all duration-150",
                            "hover:-translate-y-[1px] hover:border-ink",
                            dominated
                              ? "hatch-red border-ink/15 text-muted/60"
                              : "border-ink/25 bg-white/80",
                            isInspected && "border-ink",
                            played &&
                              "z-10 -translate-y-[1px] border-2 border-ink bg-[#fffdf7] shadow-[3px_3px_0_#16161A]",
                            isParetoCell && toggles.pareto && "border-peace bg-peace-soft",
                            isNashCell && toggles.pareto && "border-warn bg-warn-soft"
                          )}
                          aria-label={`QuickBite ${FEES[q].name}, Yummly ${FEES[y].name}: QuickBite earns ${payoff.qb} lakh, Yummly earns ${payoff.ym} lakh.`}
                          aria-pressed={isInspected}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={cn(
                                "num inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[13px] font-bold leading-none sm:text-[14px]",
                                isBestForQb
                                  ? "border-[1.5px] border-quickbite bg-quickbite text-white"
                                  : "text-quickbite",
                                dominated && "line-through decoration-1"
                              )}
                            >
                              {payoff.qb}
                            </span>
                            <span className="font-mono text-[10.5px] font-bold text-muted">/</span>
                            <span
                              className={cn(
                                "num inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[13px] font-bold leading-none sm:text-[14px]",
                                isBestForYm
                                  ? "border-[1.5px] border-yummly bg-yummly text-white"
                                  : "text-yummly",
                                dominated && "line-through decoration-1"
                              )}
                            >
                              {payoff.ym}
                            </span>
                          </div>
                          <div className="mt-0.5 flex items-center justify-between font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
                            <span>QB</span>
                            <span>YUM</span>
                          </div>
                          <div className="mt-1 flex min-h-[14px] flex-wrap gap-1">
                            {played ? <Stamp tone="ink" className="px-1 py-0.5 text-[9px]">PLAYED</Stamp> : null}
                            {isBestForQb || isBestForYm ? (
                              <Stamp tone="muted" className="px-1 py-0.5 text-[9px]">
                                BEST RESP.
                              </Stamp>
                            ) : null}
                          </div>
                          {isParetoCell ? (
                            <span className="absolute bottom-1 right-1 rotate-[-4deg] rounded-[2px] border border-peace bg-peace px-1 py-[1px] font-mono text-[9px] font-bold uppercase tracking-wide text-white">
                              Pareto
                            </span>
                          ) : null}
                          {isNashCell ? (
                            <span className="absolute bottom-1 right-1 rotate-[-4deg] rounded-[2px] border border-warn bg-warn px-1 py-[1px] font-mono text-[9px] font-bold uppercase tracking-wide text-white">
                              Nash
                            </span>
                          ) : null}
                          {dominated ? (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full border border-quickbite bg-white text-quickbite">
                              <X size={8} strokeWidth={3} />
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 px-1">
                <span className="font-mono text-[10.5px] text-muted">
                  Cell format: <strong className="text-quickbite">QB profit</strong> /{" "}
                  <strong className="text-yummly">YUM profit</strong> · higher profit is better
                </span>
                <span className="font-mono text-[10.5px] text-muted">Tap a cell to inspect</span>
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {(
              [
                { key: "br" as const, label: "Best responses", Icon: Eye },
                { key: "dom" as const, label: "Eliminate dominated", Icon: Scissors },
                { key: "pareto" as const, label: "Pareto vs. Nash", Icon: Star },
              ]
            ).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={toggles[key]}
                className={cn(
                  "flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-md border-[1.5px] px-1.5 py-1.5 text-center transition-all",
                  toggles[key]
                    ? "border-ink bg-ink text-paper shadow-[2px_2px_0_#16161A]"
                    : "border-ink/30 bg-white hover:border-ink hover:bg-paper"
                )}
              >
                <Icon size={13} className={toggles[key] ? "text-warn" : "text-muted"} />
                <span className="font-mono text-[10px] font-bold uppercase leading-tight tracking-wider sm:text-[10.5px]">
                  {toggles[key] ? "✓ " : ""}
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-2 space-y-2">
            {inspected ? (
              <div className="border-t border-ink/25 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">
                    Cell inspector
                  </span>
                  <span className="font-mono text-[10.5px] font-bold text-muted">
                    ({inspected.q === "standard" ? "₹49" : "₹19"},{" "}
                    {inspected.y === "standard" ? "₹49" : "₹19"})
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-1">
                  <span className="font-display text-[12px] font-bold">
                    QuickBite {FEES[inspected.q].name.toLowerCase()} · Yummly{" "}
                    {FEES[inspected.y].name.toLowerCase()}
                  </span>
                  <span className="num text-[13px] font-bold text-quickbite">
                    ₹{MATRIX[inspected.q][inspected.y].qb}L
                    <span className="mx-1 text-muted">/</span>
                    <span className="text-yummly">₹{MATRIX[inspected.q][inspected.y].ym}L</span>
                  </span>
                </div>
                <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-muted">
                  {CELL_NOTES[cellKey(inspected.q, inspected.y)]}
                </p>
              </div>
            ) : (
              <div className="border-l border-ink/30 pl-2.5 py-1 text-[12.5px] font-semibold leading-relaxed text-muted">
                The board is live. Tap any payoff cell — or make a fee decision on the left — to pull
                its strategic read-out into this inspector.
              </div>
            )}

            {toggles.br ? (
              <ToastNote tone="neutral" className="rise-in">
                <Eye size={14} className="mt-0.5 shrink-0 text-quickbite" />
                <div>
                  <div className="text-[12.5px] font-extrabold">Best responses, underlined by colour</div>
                  <p className="mt-0.5 text-[12.5px] font-semibold leading-relaxed text-muted">
                    Read down a Yummly column: <strong>110 &gt; 80</strong> under Standard, and{" "}
                    <strong>40 &gt; 25</strong> under Discount. QuickBite’s best response is ₹19 both
                    times. Read across a row for Yummly: the same logic marks 💙 ₹19.
                  </p>
                </div>
              </ToastNote>
            ) : null}

            {toggles.dom ? (
              <div className="rise-in border-l-[3px] border-quickbite pl-3 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-quickbite">
                    <Scissors size={12} /> Iterated strict dominance
                  </div>
                  <Stamp tone="war">STANDARD OUT</Stamp>
                </div>
                <div className="mt-1.5 space-y-1">
                  {[
                    ["1", "If Yummly holds at ₹49, ₹19 earns ₹110L vs. ₹80L. Discount wins."],
                    ["2", "If Yummly cuts to ₹19, ₹19 protects ₹40L vs. only ₹25L. Discount wins again."],
                    ["3", "₹19 beats ₹49 in both columns. Remove the standard row. Yummly’s standard column goes the same way."],
                  ].map(([n, text]) => (
                    <div key={n} className="flex items-start gap-1.5">
                      <span className="num flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink bg-white text-[10px] font-bold">
                        {n}
                      </span>
                      <p className="text-[12px] font-semibold leading-snug text-[#4b3a36]">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 border-t border-dashed border-ink/25 pt-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wide">
                  For BOTH players: ₹19 is a dominant strategy.
                </div>
              </div>
            ) : null}

            {toggles.pareto ? (
              <div className="rise-in border-t border-ink/25 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider">
                    <Scale size={12} className="text-warn" /> Pareto vs. Nash
                  </div>
                  <span className="font-mono text-[10.5px] text-muted">“Good” ≠ “stable”</span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  <div className="border-l-2 border-peace pl-2 py-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase text-peace">
                        Both standard
                      </span>
                      <Check size={10} className="text-peace" />
                    </div>
                    <div className="num mt-0.5 text-[15px] font-bold">80 / 80</div>
                    <p className="text-[11px] font-semibold leading-snug text-[#315c40]">
                      Pareto optimal. Nobody can gain without hurting the other.
                    </p>
                  </div>
                  <div className="border-l-2 border-warn pl-2 py-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase text-[#955808]">
                        Both discount
                      </span>
                      <Star size={10} className="text-warn" />
                    </div>
                    <div className="num mt-0.5 text-[15px] font-bold">40 / 40</div>
                    <p className="text-[11px] font-semibold leading-snug text-[#6d4a14]">
                      Nash equilibrium. No one gains by switching alone.
                    </p>
                  </div>
                </div>
                <p className="mt-1.5 text-[12.5px] font-semibold leading-relaxed text-muted">
                  Both platforms agree that <strong className="text-peace">80/80</strong> is the
                  better world, yet <strong className="text-warn">40/40</strong> is the stable one.
                  That is the Prisoner’s Dilemma at the heart of this price war.
                </p>
                <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-muted">
                  The frontier has three cells: 80/80 is the symmetric Pareto outcome, and the two
                  asymmetric ₹110L/₹25L outcomes are also Pareto optimal. 80/80 is the one both
                  platforms would prefer before the game starts.
                </p>
              </div>
            ) : null}

          </div>

          <div className="mt-2 border-t-[1.5px] border-dashed border-ink/25 pt-2 text-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
              Payoffs in ₹ lakhs · one shot
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
