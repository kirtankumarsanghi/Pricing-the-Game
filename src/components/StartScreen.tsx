import { useEffect } from "react";
import {
  ArrowRight,
  Award,
  Bike,
  Binary,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  FileSignature,
  Flame,
  Scale,
  Sparkles,
  Trophy,
  Utensils,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ScoreEntry } from "../lib/game";
import { formatNumber } from "../lib/game";
import { BrandMark, Kbd, Stamp, Tag } from "./ui";

interface StartScreenProps {
  manager: string;
  onManager: (name: string) => void;
  onStart: () => void;
  highScores: ScoreEntry[];
  soundOn: boolean;
  onToggleSound: () => void;
}

const learnCards = [
  {
    number: "01",
    title: "Spot the trap",
    copy: "Why two rational platforms both end up discounting — and why nobody can fix it alone.",
    Icon: Scale,
    accent: "bg-quickbite-soft text-quickbite",
  },
  {
    number: "02",
    title: "Play the long game",
    copy: "Change how much the future matters and watch a 10-week price war flip to peace.",
    Icon: CalendarClock,
    accent: "bg-peace-soft text-peace",
  },
  {
    number: "03",
    title: "Mix your moves",
    copy: "When a fixed schedule leaks, a 50–50 coin can be the strongest strategy on the board.",
    Icon: Binary,
    accent: "bg-yummly-soft text-yummly",
  },
];

function MiniMatrix() {
  return (
    <div className="rounded-lg border-[1.5px] border-ink bg-white p-2.5 shadow-[2px_2px_0_#16161A]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted">
          Profit matrix · ₹ lakh
        </span>
        <span className="font-mono text-[10.5px] font-bold text-quickbite">LEAKED</span>
      </div>
      <div className="grid grid-cols-[54px_1fr_1fr] gap-[3px] font-mono">
        <div />
        <div className="pb-1 text-center text-[10.5px] font-bold leading-tight text-yummly">
          YUM
          <br />₹49
        </div>
        <div className="pb-1 text-center text-[10.5px] font-bold leading-tight text-yummly">
          YUM
          <br />₹19
        </div>
        <div className="flex flex-col justify-center text-[10.5px] font-bold leading-tight text-quickbite">
          <span>QB</span>
          <span>₹49</span>
        </div>
        <div className="rounded border border-ink/25 bg-canvas p-1.5 text-center">
          <div className="num text-[12px] font-bold">80</div>
          <div className="num text-[10.5px] text-muted">80</div>
        </div>
        <div className="rounded border-[1.5px] border-ink bg-quickbite-soft p-1.5 text-center">
          <div className="num text-[12px] font-bold">25</div>
          <div className="num text-[10.5px] text-muted">110</div>
        </div>
        <div className="flex flex-col justify-center text-[10.5px] font-bold leading-tight text-quickbite">
          <span>QB</span>
          <span>₹19</span>
        </div>
        <div className="rounded border-[1.5px] border-ink bg-quickbite-soft p-1.5 text-center">
          <div className="num text-[12px] font-bold">110</div>
          <div className="num text-[10.5px] text-muted">25</div>
        </div>
        <div className="relative rounded border border-ink/25 bg-canvas p-1.5 text-center">
          <div className="num text-[12px] font-bold">40</div>
          <div className="num text-[10.5px] text-muted">40</div>
          <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-ink bg-warn" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-1 border-t border-dashed border-ink/25 pt-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
          Cell = (QB, YUM)
        </span>
        <span className="rounded-full border border-warn bg-warn-soft px-1.5 py-[1px] font-mono text-[10px] font-bold uppercase text-[#8a5104]">
          Where does this end?
        </span>
      </div>
    </div>
  );
}

export function StartScreen({
  manager,
  onManager,
  onStart,
  highScores,
  soundOn,
  onToggleSound,
}: StartScreenProps) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onStart]);

  return (
    <div className="relative min-h-screen">
      <div className="border-b-[1.5px] border-ink bg-paper">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-3 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-ink bg-quickbite text-white shadow-[2px_2px_0_#16161A]">
              <Bike size={19} strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-[14px] font-bold uppercase leading-none tracking-tight">
                Pricing the Game
              </div>
              <div className="mt-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                Food-delivery field office · Interactive story
              </div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-ink/25 bg-canvas px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-muted sm:inline">
              4 chapters · ~10 min
            </span>
            <button
              type="button"
              onClick={onToggleSound}
              className="btn btn-sm btn-soft h-9 min-h-9"
              aria-label={soundOn ? "Mute sound effects" : "Enable sound effects"}
              aria-pressed={soundOn}
            >
              {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden sm:inline">SFX {soundOn ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1360px] px-3 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-10">
        <div className="grid items-start gap-7 lg:grid-cols-[1.06fr_0.94fr] lg:gap-10">
          <div className="rise-in">
            <div className="flex flex-wrap items-center gap-2 border-y-[1.5px] border-dashed border-ink/30 py-1.5">
              <span className="bg-ink px-2 py-1 font-display text-[13px] font-bold uppercase tracking-[0.14em] text-paper">
                Pricing the Game
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                QuickBite vs Yummly
              </span>
              <span className="ml-auto hidden font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted sm:inline">
                A playable game-theory brief
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Stamp tone="ink">
                <ClipboardList size={10} /> Appointment notice
              </Stamp>
              <Stamp tone="warn">Game theory · Interactive demo</Stamp>
            </div>

            <h1 className="mt-4 font-display text-[clamp(2.75rem,7.2vw,5.5rem)] font-bold leading-[0.92] tracking-[-0.045em]">
              Two rivals.
              <br />
              One city.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-quickbite">Your move.</span>
                <svg
                  className="absolute -bottom-1 left-0 z-0 h-3 w-full"
                  viewBox="0 0 300 14"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 10 C 60 1, 120 13, 180 6 S 270 3, 298 8"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-5 max-w-[560px] text-[14.5px] font-medium leading-relaxed text-[#3f3f46] sm:text-[16px]">
              You are the new pricing manager of <strong className="text-quickbite">QuickBite</strong>.
              Every delivery fee you set changes what{" "}
              <strong className="text-yummly">Yummly</strong> earns too — and what Yummly does next.
              You do not choose prices in a vacuum.
            </p>

            <div className="mt-5 grid max-w-[560px] grid-cols-2 gap-2.5">
              <div className="border-l-2 border-quickbite pl-2.5 py-1">
                <div className="flex items-center gap-2">
                  <BrandMark who="quickbite" size="sm" />
                  <div>
                    <div className="font-display text-[13px] font-bold">QuickBite</div>
                    <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
                      Your desk
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-[12.5px] font-semibold leading-snug text-[#57575e]">
                  Lean challenger. Agile, hungry, faster on discounts.
                </p>
              </div>
              <div className="border-l-2 border-yummly pl-2.5 py-1">
                <div className="flex items-center gap-2">
                  <BrandMark who="yummly" size="sm" />
                  <div>
                    <div className="font-display text-[13px] font-bold">Yummly</div>
                    <div className="font-mono text-[10.5px] uppercase tracking-wide text-muted">
                      Rival desk
                    </div>
                  </div>
                </div>
                <p className="mt-1.5 text-[12.5px] font-semibold leading-snug text-[#57575e]">
                  Larger incumbent. Bigger brand, deeper pockets.
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-[560px] rounded-lg border-[1.5px] border-ink bg-white p-3 shadow-[3px_3px_0_#16161A]">
              <label
                htmlFor="manager-name"
                className="block font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-muted"
              >
                Sign the appointment letter
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <FileSignature size={16} className="shrink-0 text-quickbite" />
                <input
                  id="manager-name"
                  className="input border-b-[2px] font-sans text-[13px] font-bold shadow-none"
                  value={manager}
                  onChange={(event) => onManager(event.target.value.slice(0, 22))}
                  placeholder="Your name, e.g. A. Rao"
                  maxLength={22}
                  autoComplete="name"
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5">
                <span className="text-[12px] font-semibold text-muted">
                  Optional. Your receipts go on the office leaderboard.
                </span>
                <KeyHintInline />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={onStart} className="btn btn-q px-5 py-3 text-[15px]">
                Start as pricing manager
                <ArrowRight size={18} strokeWidth={2.6} />
              </button>
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
                <Kbd>↵</Kbd> enter the desk
              </div>
            </div>
          </div>

          <div className="relative rise-in lg:sticky lg:top-4">
            <div
              className="absolute -left-2 -top-3 z-10 h-6 w-20 -rotate-3 border border-ink/20 bg-[#e9dfc9]/90 shadow-sm"
              aria-hidden="true"
            />
            <div
              className="absolute -right-2 top-10 z-10 h-6 w-16 rotate-6 border border-ink/20 bg-[#e9dfc9]/90 shadow-sm"
              aria-hidden="true"
            />
            <div className="card dispatch-ticket ticket-edge relative overflow-hidden bg-paper p-4 pt-5 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-quickbite">
                    Crisis desk · 23:48
                  </div>
                  <h2 className="mt-1 font-display text-[22px] font-bold leading-tight">
                    The city market brief
                  </h2>
                </div>
                <div className="rotate-3">
                  <Stamp tone="war">UNOFFICIAL</Stamp>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-y-[1.5px] border-dashed border-ink/25 py-2">
                <div className="flex items-center gap-2">
                  <BrandMark who="quickbite" size="sm" />
                  <span className="text-[13px] font-bold">QuickBite</span>
                  <span className="font-mono text-[12.5px] text-muted">vs</span>
                  <span className="text-[13px] font-bold">Yummly</span>
                  <BrandMark who="yummly" size="sm" />
                </div>
                <span className="font-mono text-[11.5px] font-bold text-muted">01 CITY</span>
              </div>

              <p className="mt-3 text-[12px] font-semibold leading-relaxed text-[#4b4b52]">
                Both platforms can charge{" "}
                <span className="num rounded border border-ink/25 bg-white px-1 font-bold">
                  ₹49
                </span>{" "}
                or go discount at{" "}
                <span className="num rounded border border-ink/25 bg-white px-1 font-bold">
                  ₹19
                </span>
                . Your rival moves too. The leaked matrix is on the right — but the strategy is yours
                to find.
              </p>

              <div className="mt-3 grid grid-cols-[1fr_auto] items-stretch gap-2.5">
                <MiniMatrix />
                <div className="flex w-[78px] flex-col justify-center gap-3 border-l border-ink/20 pl-2">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Flame size={20} className="text-warn" strokeWidth={2.4} />
                    <span className="mt-1 font-mono text-[10px] font-bold uppercase leading-tight tracking-wide">
                      Margin
                      <br />
                      pressure
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="num text-[16px] font-bold leading-none">2×2</div>
                    <div className="mt-1 font-mono text-[9.5px] uppercase tracking-wide text-muted">
                      game
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 border-l-2 border-warn pl-2.5 py-1">
                <div className="flex items-center gap-1.5">
                  <GavelIcon />
                  <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em]">
                    Your brief
                  </span>
                </div>
                <p className="mt-1 text-[13px] font-semibold leading-snug text-[#4b4b52]">
                  Play the fee game. Find the stable outcome. Then ask whether “stable” is actually
                  the same thing as “good”.
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t-[1.5px] border-dashed border-ink/25 pt-2">
                <span className="font-mono text-[10.5px] uppercase tracking-widest text-muted">
                  Desk no. 0427 · Q3
                </span>
                <div className="paper-strip h-5 w-20 opacity-50" aria-hidden="true" />
              </div>

              <div className="pointer-events-none absolute -right-8 -top-7 h-24 w-24 rounded-full bg-quickbite/10" />
            </div>

            <div className="mt-3 flex items-start gap-2 border-t border-ink/20 pt-2.5">
              <Sparkles size={15} className="mt-0.5 shrink-0 text-yummly" />
              <p className="text-[12.5px] font-semibold leading-relaxed text-[#3d4250]">
                <strong>Instructor’s note:</strong> this is a deliberately simplified model. The goal
                is intuition, not spreadsheet maths.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3" aria-label="What you will learn">
          {learnCards.map(({ number, title, copy, Icon, accent }) => (
            <div
              key={number}
              className="card-soft flex items-start gap-3 border-t-[1.5px] border-ink/25 py-3.5"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink ${accent}`}
              >
                <Icon size={17} strokeWidth={2.3} />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="num text-[11.5px] font-bold text-muted">{number}</span>
                  <h3 className="font-display text-[13px] font-bold">{title}</h3>
                </div>
                <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-muted">{copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="border-t-[1.5px] border-ink pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-ink pb-2">
              <div className="flex items-center gap-2">
                <Trophy size={15} className="text-warn" />
                <h3 className="font-display text-[13px] font-bold">Dispatch hall of fame</h3>
                <Tag tone="neutral">LOCAL</Tag>
              </div>
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                Saved on this device
              </span>
            </div>
            {highScores.length === 0 ? (
              <div className="mt-2 flex flex-wrap items-center gap-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-dashed border-ink/40 bg-canvas">
                  <Award size={17} className="text-muted" />
                </div>
                <div className="flex-1">
                  <p className="text-[11.5px] font-bold">The board is empty. Be the first receipt.</p>
                  <p className="font-mono text-[11.5px] text-muted">
                    Finish a shift to file your score · Nº 0001
                  </p>
                </div>
                <div className="paper-strip h-7 w-24 opacity-40" aria-hidden="true" />
              </div>
            ) : (
              <div className="mt-1.5 divide-y divide-dashed divide-ink/20">
                {highScores.slice(0, 5).map((entry, index) => (
                  <div key={entry.id} className="flex items-center gap-2.5 py-1.5">
                    <span
                      className={`num flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border border-ink text-[11.5px] font-bold ${
                        index === 0 ? "bg-warn text-white" : "bg-canvas"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] font-bold">
                      {entry.name}
                    </span>
                    <Tag tone={entry.outcome === "Fired" ? "quickbite" : "peace"}>
                      {entry.outcome}
                    </Tag>
                    <span className="num w-16 text-right text-[13px] font-bold">
                      {formatNumber(entry.score)}
                    </span>
                    <span className="hidden w-16 text-right font-mono text-[11px] text-muted sm:block">
                      {entry.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between border-t-[1.5px] border-ink pt-3 text-ink">
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList size={15} className="text-warn" />
                <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.15em] text-muted">
                  How the desk works
                </span>
              </div>
              <ul className="mt-2.5 space-y-2">
                {[
                  "Read the rival’s position, not just your own.",
                  "Press 1 / 2 for quick fee decisions.",
                  "Esc pauses. Sound M toggles. All progress runs locally.",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-[13px] font-semibold">
                    <ChevronRight size={13} className="mt-0.5 shrink-0 text-warn" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-ink/20 pt-2">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">
                QuickBite pricing operations
              </span>
              <span className="font-mono text-[10.5px] text-warn">EST. 2026</span>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t-[1.5px] border-dashed border-ink/30 pt-3 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.13em] text-muted">
            Pricing the Game · QuickBite vs. Yummly
          </span>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-ink bg-paper px-2.5 py-2 shadow-[0_-3px_0_rgba(22,22,26,0.12)] sm:hidden">
        <div className="mx-auto flex max-w-[620px] items-center gap-2.5">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-quickbite">
              QuickBite pricing desk
            </div>
            <div className="truncate font-display text-[12px] font-bold">
              Make your first delivery-fee call
            </div>
          </div>
          <button type="button" onClick={onStart} className="btn btn-q shrink-0 text-[12px]">
            Start <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function KeyHintInline() {
  return (
    <span className="hidden items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-muted sm:inline-flex">
      <Kbd>↵</Kbd> to start
    </span>
  );
}

function GavelIcon() {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-ink bg-warn text-white">
      <Utensils size={9} strokeWidth={3} />
    </span>
  );
}
