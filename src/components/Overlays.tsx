import {
  ArrowRight,
  Award,
  Bike,
  HeartCrack,
  Home,
  Medal,
  PauseCircle,
  Play,
  RotateCcw,
  Trophy,
} from "lucide-react";
import type { ScoreEntry } from "../lib/game";
import { formatNumber } from "../lib/game";
import { cn } from "../utils/cn";
import { Meter, Stamp, Tag } from "./ui";

export type OverlayMode = "pause" | "gameover" | "complete";

interface OverlaysProps {
  mode: OverlayMode;
  manager: string;
  score: number;
  confidence: number;
  chapter: number;
  highScores: ScoreEntry[];
  lastEntryId: string | null;
  onResume: () => void;
  onRestart: () => void;
  onTitle: () => void;
  onNextChapter?: () => void;
}

function Leaderboard({
  highScores,
  lastEntryId,
  limit = 5,
}: {
  highScores: ScoreEntry[];
  lastEntryId: string | null;
  limit?: number;
}) {
  if (highScores.length === 0) {
    return (
      <div className="border-y border-dashed border-ink/30 py-3 text-center">
        <Award size={17} className="mx-auto text-muted" />
        <p className="mt-1 text-[12.5px] font-bold">No receipts in the hall of fame yet.</p>
        <p className="font-mono text-[10.5px] text-muted">This shift could be the first.</p>
      </div>
    );
  }
  return (
    <div className="overflow-hidden border-y-[1.5px] border-ink">
      <div className="grid grid-cols-[24px_1fr_64px] gap-1 border-b-[1.5px] border-ink bg-canvas px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
        <span>#</span>
        <span>Manager</span>
        <span className="text-right">Score</span>
      </div>
      {highScores.slice(0, limit).map((entry, index) => {
        const current = entry.id === lastEntryId;
        return (
          <div
            key={entry.id}
            className={cn(
              "grid grid-cols-[24px_1fr_64px] items-center gap-1 border-b border-dashed border-ink/15 px-2 py-1.5 last:border-0",
              current && "bg-warn-soft"
            )}
          >
            <span
              className={cn(
                "num flex h-4 w-4 items-center justify-center rounded-[2px] border border-ink text-[10px] font-bold",
                index === 0 ? "bg-warn text-white" : "bg-paper",
                current && "bg-ink text-paper"
              )}
            >
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-bold">{entry.name}</span>
              <span className="font-mono text-[9.5px] uppercase tracking-wide text-muted">
                {entry.outcome} · {entry.date}
              </span>
            </span>
            <span className="num text-right text-[12.5px] font-bold">{formatNumber(entry.score)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Overlays({
  mode,
  manager,
  score,
  confidence,
  chapter,
  highScores,
  lastEntryId,
  onResume,
  onRestart,
  onTitle,
  onNextChapter,
}: OverlaysProps) {
  const rank = highScores.findIndex((entry) => entry.id === lastEntryId);

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-ink/55 px-3 py-5 sm:items-center sm:py-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={
          mode === "pause"
            ? "Game paused"
            : mode === "gameover"
              ? "Shift ended, desk revoked"
              : "Shift complete"
        }
        className="rise-in relative w-full max-w-[485px] rounded-xl border-[2px] border-ink bg-paper shadow-[7px_7px_0_#16161A]"
      >
        <div
          className={cn(
            "flex items-center justify-between border-b-[1.5px] border-ink px-3 py-2",
            mode === "pause" && "bg-ink text-paper",
            mode === "gameover" && "bg-quickbite text-white",
            mode === "complete" && "bg-peace text-white"
          )}
        >
          <div className="flex items-center gap-2 font-mono text-[11.5px] font-bold uppercase tracking-[0.16em]">
            {mode === "pause" ? <PauseCircle size={14} /> : null}
            {mode === "gameover" ? <HeartCrack size={14} /> : null}
            {mode === "complete" ? <Trophy size={14} /> : null}
            {mode === "pause"
              ? "Shift paused · desk on hold"
              : mode === "gameover"
                ? "Board notice · desk revoked"
                : "Shift closed · report filed"}
          </div>
          <span className="font-mono text-[10.5px] uppercase tracking-widest opacity-70">
            QuickBite · 0427
          </span>
        </div>

        <div className="p-4 sm:p-5">
          {mode === "pause" ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-muted">
                    Pricing manager {manager || "unassigned"}
                  </div>
                  <h2 className="mt-1 font-display text-[29px] font-bold leading-none">
                    Take a breather.
                    <br />
                    The market won’t.
                  </h2>
                </div>
                <div className="rotate-3">
                  <Stamp tone="warn">PAUSED</Stamp>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="border-t border-ink/25 pt-2">
                  <div className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
                    Shift score
                  </div>
                  <div className="num text-[20px] font-bold">{formatNumber(score)} pts</div>
                </div>
                <div className="border-t border-ink/25 pt-2">
                  <div className="flex items-center justify-between font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
                    <span>Board trust</span>
                    <span className="text-ink">{confidence}</span>
                  </div>
                  <Meter
                    value={confidence}
                    tone={confidence <= 30 ? "quickbite" : confidence <= 60 ? "warn" : "peace"}
                    className="mt-1.5 h-2"
                    label="Board trust"
                  />
                </div>
              </div>

              <div className="mt-2.5 border-t border-ink/25 pt-2">
                <div className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted">
                  Controls while paused
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[11.5px] font-semibold">
                  {[
                    ["Esc / P", "Resume"],
                    ["M", "Toggle sound"],
                    ["R", "Restart shift"],
                    ["1 / 2", "Quick decisions"],
                  ].map(([key, action]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <span className="rounded border border-ink bg-canvas px-1 py-0.5 font-mono text-[10px] font-bold">
                        {key}
                      </span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-2 border-l border-ink/25 pl-2 py-1 text-[11px] font-semibold text-muted">
                This pause menu does not stop the real market. Your shift is saved locally.
              </div>

              <div className="mt-3 grid gap-2">
                <button type="button" onClick={onResume} className="btn btn-ink w-full">
                  <Play size={14} fill="currentColor" /> Resume the desk
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={onRestart} className="btn btn-soft">
                    <RotateCcw size={13} /> Restart shift
                  </button>
                  <button type="button" onClick={onTitle} className="btn btn-soft">
                    <Home size={13} /> Quit to title
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted">
                Chapter {String(chapter).padStart(2, "0")} · progress held in this session
              </p>
            </>
          ) : null}

          {mode === "gameover" ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-quickbite">
                    Confidence exhausted · board vote
                  </div>
                  <h2 className="mt-1 font-display text-[29px] font-bold leading-none">
                    Your desk
                    <br />
                    has been cleared.
                  </h2>
                </div>
                <div className="rotate-[-4deg]">
                  <Stamp tone="war" animate>DESK REVOKED</Stamp>
                </div>
              </div>

              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-muted">
                The board watched too many weak calls erode trust. You understood the theory — but
                the market still won the quarter. A new shift starts with a clean confidence meter.
              </p>

              <div className="mt-2.5 border-y border-ink/25 py-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                      Final receipt
                    </div>
                    <div className="font-display text-[13px] font-bold">{manager || "Pricing manager"}</div>
                  </div>
                  <div className="text-right">
                    <div className="num text-[22px] font-bold leading-none">{formatNumber(score)}</div>
                    <div className="font-mono text-[9.5px] uppercase tracking-wider text-muted">points</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 border-t border-dashed border-ink/20 pt-2">
                  <Tag tone="quickbite">Fired</Tag>
                  <Tag tone="neutral">Chapter {chapter}/4</Tag>
                  {rank >= 0 ? (
                    <Tag tone="warn">
                      <Medal size={9} /> Rank #{rank + 1}
                    </Tag>
                  ) : null}
                </div>
              </div>

              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted">
                    <Trophy size={11} className="text-warn" /> Dispatch hall of fame
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted">
                    Saved locally
                  </span>
                </div>
                <Leaderboard highScores={highScores} lastEntryId={lastEntryId} />
              </div>

              <div className="mt-3 grid gap-2">
                <button type="button" onClick={onRestart} className="btn btn-q w-full">
                  <RotateCcw size={15} /> Restart immediately
                  <span className="ml-auto rounded border border-white/40 px-1 font-mono text-[10.5px]">
                    R
                  </span>
                </button>
                <button type="button" onClick={onTitle} className="btn btn-soft w-full">
                  <Home size={13} /> Back to title screen
                </button>
              </div>
            </>
          ) : null}

          {mode === "complete" ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-peace">
                    Shift report accepted
                  </div>
                  <h2 className="mt-1 font-display text-[29px] font-bold leading-none">
                    You priced
                    <br />
                    the game.
                  </h2>
                </div>
                <div className="rotate-3">
                  <Stamp tone="peace" animate>SHIFT CLOSED</Stamp>
                </div>
              </div>

              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-muted">
                Four chapters, one clear lesson: an equilibrium describes what is stable — not what
                is best. You spotted dominance, tested the future, and kept a rival guessing.
              </p>

              <div className="mt-2.5 border-y border-ink/25 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-ink bg-warn text-white">
                      <Award size={16} />
                    </div>
                    <div>
                      <div className="font-display text-[13px] font-bold">{manager || "Pricing manager"}</div>
                      <div className="font-mono text-[9.5px] uppercase tracking-wider text-muted">
                        Pricing the Game · {new Date().getFullYear()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="num text-[24px] font-bold leading-none">{formatNumber(score)}</div>
                    <div className="font-mono text-[9.5px] uppercase tracking-wider text-muted">points</div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-dashed border-ink/20 pt-2">
                  <Tag tone="peace">Shift complete</Tag>
                  <Tag tone="neutral">Trust {confidence}/100</Tag>
                  {rank >= 0 ? (
                    <Tag tone="warn">
                      <Medal size={9} /> Hall rank #{rank + 1}
                    </Tag>
                  ) : null}
                  <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wider text-muted">
                    Receipt saved
                  </span>
                </div>
              </div>

              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted">
                    <Trophy size={11} className="text-warn" /> Dispatch hall of fame
                  </span>
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-muted">
                    Top 5
                  </span>
                </div>
                <Leaderboard highScores={highScores} lastEntryId={lastEntryId} />
              </div>

              <div className="mt-3 grid gap-2">
                <button type="button" onClick={onRestart} className="btn btn-ink w-full">
                  <RotateCcw size={15} /> Start a new shift
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={onResume} className="btn btn-soft">
                    Review my X-rays <ArrowRight size={12} />
                  </button>
                  <button type="button" onClick={onTitle} className="btn btn-soft">
                    <Home size={12} /> Title screen
                  </button>
                </div>
              </div>
              {onNextChapter ? (
                <button
                  type="button"
                  onClick={onNextChapter}
                  className="mt-2 flex w-full items-center justify-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted hover:text-ink"
                >
                  <Bike size={10} /> Back to chapter 01
                </button>
              ) : null}
            </>
          ) : null}

        </div>
      </div>
    </div>
  );
}
