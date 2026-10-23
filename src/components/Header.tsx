import {
  CalendarDays,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  Pause,
  Repeat2,
  ShieldCheck,
  Target,
  Volume2,
  VolumeX,
  Bike,
} from "lucide-react";
import { cn } from "../utils/cn";
import { CheckMark, Meter } from "./ui";

const tabs = [
  { id: 1, label: "One-shot fee", sub: "The trap", Icon: Target },
  { id: 2, label: "10-week war", sub: "Same game again", Icon: Repeat2 },
  { id: 3, label: "Flash-sale timing", sub: "Hide your pattern", Icon: CalendarDays },
  { id: 4, label: "Summary", sub: "What you learned", Icon: GraduationCap },
];

interface HeaderProps {
  chapter: number;
  onChapter: (chapter: number) => void;
  score: number;
  confidence: number;
  news: string;
  manager: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  completed: Set<number>;
}

export function Header({
  chapter,
  onChapter,
  score,
  confidence,
  news,
  manager,
  soundOn,
  onToggleSound,
  onPause,
  completed,
}: HeaderProps) {
  const tickerText = `${news}  •  QUICKBITE ${manager || "PRICING DESK"}  •  INDIA FOOD-DELIVERY MARKET  •  `;

  return (
    <header className="relative z-30">
      <div className="border-b-[1.5px] border-ink bg-paper">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink bg-quickbite text-white shadow-[2px_2px_0_#16161A]"
              aria-hidden="true"
            >
              <Bike size={21} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="font-display text-[15px] font-bold uppercase leading-none tracking-[-0.01em] sm:text-base">
                Pricing the Game
              </span>
              <div className="mt-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
                <span className="text-quickbite">QuickBite (You)</span>
                <span className="font-bold text-muted">VS</span>
                <span className="text-yummly">Yummly (Rival)</span>
              </div>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="flex h-10 items-center gap-2 border-l border-ink/25 pl-3">
              <ShieldCheck size={14} strokeWidth={2.5} className="text-muted" />
              <div>
                <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">
                  Shift score
                </div>
                <div className="num text-[13px] font-bold leading-none">
                  {score.toString().padStart(4, "0")}
                  <span className="ml-1 font-sans text-[11.5px] font-semibold text-muted">pts</span>
                </div>
              </div>
            </div>

            <div className="hidden h-10 min-w-[130px] items-center gap-2 border-l border-ink/25 pl-3 md:flex">
              <HeartPulse
                size={14}
                strokeWidth={2.5}
                className={confidence <= 30 ? "text-quickbite" : "text-peace"}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
                  <span>Board trust</span>
                  <span className="num text-ink">{confidence}</span>
                </div>
                <Meter
                  value={confidence}
                  tone={confidence <= 30 ? "quickbite" : confidence <= 60 ? "warn" : "peace"}
                  className="mt-1 h-2"
                  label="Board trust"
                />
              </div>
            </div>

            <button
              type="button"
              className={cn(
                "btn btn-sm btn-soft h-10 min-h-10",
                soundOn ? "text-ink" : "text-muted"
              )}
              onClick={onToggleSound}
              aria-pressed={soundOn}
              title="Toggle sound (M)"
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden sm:inline">SFX {soundOn ? "ON" : "OFF"}</span>
            </button>

            <button
              type="button"
              className="btn btn-sm btn-ink h-10 min-h-10"
              onClick={onPause}
              title="Pause game (Esc)"
            >
              <Pause size={14} fill="currentColor" />
              <span className="hidden sm:inline">Pause</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-ink text-paper">
        <div className="mx-auto flex max-w-[1360px] items-stretch">
          <div className="flex shrink-0 items-center gap-1.5 border-r border-paper/25 bg-quickbite px-2.5 py-2 font-mono text-[11.5px] font-bold uppercase tracking-[0.13em] text-white sm:px-3">
            <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-white" />
            <span className="hidden sm:inline">Live market wire</span>
            <span className="sm:hidden">Live</span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden py-2" role="region" aria-label="Live market news">
            <div className="ticker-track" aria-hidden="true">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  className="flex shrink-0 items-center gap-3 whitespace-nowrap pr-3 font-mono text-[12.5px] font-semibold tracking-wide"
                >
                  <span className="text-warn">★</span>
                  <span>{tickerText}</span>
                  <span className="text-warn">★</span>
                  <span className="text-paper/70">{tickerText}</span>
                </div>
              ))}
            </div>
            <span className="sr-only">{news}</span>
          </div>
        </div>
      </div>

      <div className="border-b-[1.5px] border-ink bg-canvas">
        <div className="mx-auto max-w-[1360px] px-3 sm:px-6">
          <div
            className="no-scrollbar -mb-[1.5px] flex overflow-x-auto"
            role="tablist"
            aria-label="Game chapters"
          >
            {tabs.map(({ id, label, sub, Icon }) => {
              const active = chapter === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onChapter(id)}
                  className={cn(
                    "group relative flex min-h-[54px] min-w-[156px] flex-1 items-center gap-2 border-r-[1.5px] border-ink/20 px-3 py-2 text-left transition-colors sm:min-w-0",
                    active
                      ? "bg-ink text-paper"
                      : "bg-paper/60 hover:bg-white"
                  )}
                >
                  <span
                    className={cn(
                      "num text-[12.5px] font-bold",
                      active ? "text-warn" : "text-muted"
                    )}
                  >
                    {String(id).padStart(2, "0")}
                  </span>
                  <Icon
                    size={15}
                    strokeWidth={2.3}
                    className={active ? "text-paper" : "text-muted"}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[12px] font-bold leading-tight">
                      {label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate font-mono text-[10.5px] font-medium uppercase tracking-[0.12em]",
                        active ? "text-paper/55" : "text-muted"
                      )}
                    >
                      {sub}
                    </span>
                  </span>
                  {completed.has(id) ? (
                    <CheckMark done />
                  ) : (
                    <ChevronRight
                      size={13}
                      className={cn(
                        "shrink-0 transition-transform group-hover:translate-x-0.5",
                        active ? "text-warn" : "text-muted/60"
                      )}
                    />
                  )}
                  {active ? (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-quickbite" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
