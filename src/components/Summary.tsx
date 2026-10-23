import { ArrowRight, Check, ChevronRight, Dices, Medal, Repeat2, Scale } from "lucide-react";
import { playSound } from "../lib/sound";
import { cn } from "../utils/cn";
import { Tag } from "./ui";

interface SummaryProps {
  onComplete: () => void;
  onChapter: (chapter: number) => void;
  score: number;
}

const lessons = [
  {
    number: "01",
    title: "Dominance & Nash equilibrium",
    insight: "Sometimes individual incentives produce an outcome that everyone dislikes.",
    detail:
      "Discounting beat standard pricing whatever Yummly did, so both ended at ₹40L each. Both would have preferred ₹80L each, but that outcome is not stable.",
    stat: "80 → 40",
    statLabel: "each platform, after the trap",
    Icon: Scale,
    color: "text-quickbite",
    chapter: 1,
    where: "Chapter 1",
  },
  {
    number: "02",
    title: "Repeated games",
    insight: "The possibility of future punishment can encourage cooperation.",
    detail:
      "When future-focus is at least 3/7 (about 43%), the one-time gain from undercutting is smaller than the discounted loss from a price war. Standard pricing holds without any agreement — the Folk Theorem logic. (The campaign is a 10-week window into an ongoing relationship; the threshold uses that discounted/uncertain-end model.)",
    stat: "3/7",
    statLabel: "future-focus threshold",
    Icon: Repeat2,
    color: "text-peace",
    chapter: 2,
    where: "Chapter 2",
  },
  {
    number: "03",
    title: "Mixed strategies",
    insight: "When there is no single best choice, unpredictability can be the best strategy.",
    detail:
      "In the flash-sale game no fixed day is safe. A 50–50 mix makes the rival indifferent, so each side expects a 50% share.",
    stat: "50 / 50",
    statLabel: "equilibrium mix",
    Icon: Dices,
    color: "text-yummly",
    chapter: 3,
    where: "Chapter 3",
  },
];

const rows = [
  {
    label: "Business problem",
    cells: [
      "Set a delivery fee while Yummly sets its own.",
      "Hold standard prices for ten weeks, or undercut.",
      "Pick a flash-sale day against a bigger brand.",
    ],
  },
  {
    label: "Game type",
    cells: [
      "One-shot, 2×2 normal-form game.",
      "Repeated game with a grim-trigger rival.",
      "Zero-sum 2×2 market-share game.",
    ],
  },
  {
    label: "What happened",
    cells: [
      "Both ended at ₹40L instead of the better ₹80L.",
      "Low patience → price war (₹400L). High patience → peace (₹800L).",
      "No fixed day is safe. Being unpredictable protects you.",
    ],
  },
];

export function Summary({ onComplete, onChapter, score }: SummaryProps) {
  return (
    <div className="space-y-10">
      <section>
        <div className="font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-muted">
          Summary
        </div>
        <h1 className="mt-1 max-w-[720px] font-display text-[clamp(1.7rem,3.6vw,2.6rem)] font-bold leading-[1.05]">
          Three games. One idea:
          <br />
          <span className="text-quickbite">a stable outcome is not always a good one.</span>
        </h1>
        <p className="mt-3 max-w-[620px] text-[14px] font-semibold leading-relaxed text-muted">
          You played QuickBite’s pricing manager in three situations. Here is what each one showed.
        </p>

        <div className="mt-6 grid gap-x-8 gap-y-6 md:grid-cols-3">
          {lessons.map(({ number, title, insight, detail, stat, statLabel, Icon, color, chapter, where }) => (
            <article key={number} className="flex flex-col border-t-[1.5px] border-ink pt-3">
              <div className="flex items-center gap-2">
                <Icon size={16} className={color} strokeWidth={2.4} />
                <span className="num text-[12.5px] font-bold text-muted">{number}</span>
                <h2 className="font-display text-[16px] font-bold leading-tight">{title}</h2>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={cn("num text-[28px] font-bold leading-none", color)}>{stat}</span>
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                  {statLabel}
                </span>
              </div>
              <p className="mt-3 font-display text-[14px] font-bold leading-snug">“{insight}”</p>
              <p className="mt-2 flex-1 text-[12.5px] font-semibold leading-relaxed text-muted">
                {detail}
              </p>
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  onChapter(chapter);
                }}
                className="mt-3 flex items-center gap-1 self-start text-[12px] font-extrabold text-quickbite hover:text-ink"
              >
                Replay {where} <ChevronRight size={12} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-[20px] font-bold">Side by side</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead>
              <tr className="border-y-[1.5px] border-ink">
                <th className="w-[140px] py-2 pr-3 font-mono text-[11px] font-bold uppercase tracking-wider text-muted" />
                <th className="py-2 pr-4 font-display text-[13px] font-bold text-quickbite">
                  1 · One-shot fee
                </th>
                <th className="py-2 pr-4 font-display text-[13px] font-bold text-peace">
                  2 · Ten-week war
                </th>
                <th className="py-2 font-display text-[13px] font-bold text-yummly">
                  3 · Flash-sale timing
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-dashed border-ink/25 align-top">
                  <th className="py-2.5 pr-3 font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
                    {row.label}
                  </th>
                  {row.cells.map((cell) => (
                    <td key={cell} className="py-2.5 pr-4 text-[12.5px] font-semibold leading-relaxed">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            "Normal-form games",
            "Dominance",
            "Nash equilibrium",
            "Repeated games",
            "Discount factor",
            "Folk Theorem",
            "Tacit collusion",
            "Mixed strategies",
          ].map((concept) => (
            <Tag key={concept} tone="neutral" className="bg-white">
              <Check size={10} className="text-peace" /> {concept}
            </Tag>
          ))}
        </div>
        <p className="mt-3 max-w-[680px] text-[12px] font-semibold leading-relaxed text-muted">
          This is a simplified model for building intuition. Tacit collusion in real markets can raise
          legal and regulatory questions, and these payoffs are illustrative, not forecasts.
        </p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-ink pt-4">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
            Your shift score
          </div>
          <div className="num text-[28px] font-bold leading-none">{score} pts</div>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound("win");
            onComplete();
          }}
          className="btn btn-q"
        >
          <Medal size={16} />
          Finish shift &amp; save score
          <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}
