import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Keyboard,
  Pause,
  RotateCcw,
} from "lucide-react";
import type { FeedOptions, ScoreEntry, Tone } from "./lib/game";
import {
  clamp,
  formatNumber,
  loadHighScores,
  loadJson,
  loadSoundPreference,
  makeScoreEntry,
  removeKey,
  storeHighScores,
  storeJson,
  storeSoundPreference,
} from "./lib/game";
import { playSound, setSoundMuted } from "./lib/sound";
import { cn } from "./utils/cn";
import { Header } from "./components/Header";
import { StartScreen } from "./components/StartScreen";
import { OneShot } from "./components/OneShot";
import { Repeated } from "./components/Repeated";
import { Mixed } from "./components/Mixed";
import { Summary } from "./components/Summary";
import { Guide } from "./components/Guide";
import { Overlays, type OverlayMode } from "./components/Overlays";
import { ParticleLayer, type Burst } from "./components/Effects";
import { Kbd, Meter } from "./components/ui";

type Screen = "start" | "play";

const RUN_KEY = "pricing-the-game:run:v2";
const CHAPTER_KEYS = ["pricing-the-game:repeated:v2", "pricing-the-game:mixed:v2"] as const;

interface SavedRun {
  screen: Screen;
  chapter: number;
  score: number;
  confidence: number;
  completed: number[];
  awards: string[];
  status: "active" | "closed";
}

function loadRun(): SavedRun | null {
  const parsed = loadJson<Partial<SavedRun> | null>(RUN_KEY, null);
  if (!parsed || parsed.status !== "active") return null;
  if (parsed.screen !== "start" && parsed.screen !== "play") return null;
  return {
    screen: parsed.screen,
    chapter: Math.min(4, Math.max(1, Number(parsed.chapter) || 1)),
    score: Math.max(0, Number(parsed.score) || 0),
    confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 0)),
    completed: Array.isArray(parsed.completed)
      ? parsed.completed.filter(
          (value): value is number =>
            typeof value === "number" && value >= 1 && value <= 4
        )
      : [1],
    awards: Array.isArray(parsed.awards)
      ? parsed.awards.filter((value): value is string => typeof value === "string")
      : [],
    status: "active",
  };
}

function clearRunState(): void {
  removeKey(RUN_KEY);
  CHAPTER_KEYS.forEach((key) => removeKey(key));
}

const initialNews =
  "New pricing head takes the QuickBite desk. Yummly is watching the fee board. First delivery-fee call is yours.";

const burstColors: Record<Tone, string> = {
  click: "#16161A",
  cash: "#D97706",
  win: "#15803D",
  war: "#E54826",
  coin: "#1D4ED8",
  stamp: "#D97706",
};

export default function App() {
  const [restored] = useState(loadRun);
  const [screen, setScreen] = useState<Screen>(restored?.screen ?? "start");
  const [chapter, setChapter] = useState(restored?.chapter ?? 1);
  const [runKey, setRunKey] = useState(1);
  const [manager, setManager] = useState(() => {
    try {
      return localStorage.getItem("pricing-the-game:manager") || "";
    } catch {
      return "";
    }
  });
  const [score, setScore] = useState(restored?.score ?? 0);
  const [confidence, setConfidence] = useState(restored?.confidence ?? 100);
  const [news, setNews] = useState(initialNews);
  const [overlay, setOverlay] = useState<OverlayMode | null>(null);
  const [soundOn, setSoundOn] = useState(loadSoundPreference);
  const [completed, setCompleted] = useState<Set<number>>(
    () => new Set(restored?.completed.length ? restored.completed : [1])
  );
  const [highScores, setHighScores] = useState<ScoreEntry[]>(loadHighScores);
  const [lastEntryId, setLastEntryId] = useState<string | null>(null);
  const [awardVersion, setAwardVersion] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [gain, setGain] = useState<{
    id: number;
    points: number;
    confidence: number;
  } | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const gainSeq = useRef(1);
  const seenAwards = useRef<Set<string>>(new Set(restored?.awards ?? []));
  const savedRef = useRef(false);
  const closedRef = useRef(false);
  const activeRef = useRef(false);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const burstId = useRef(1);
  const shakeTimer = useRef<number | null>(null);

  useEffect(() => {
    activeRef.current = screen === "play" && overlay === null && !closedRef.current;
  }, [screen, overlay]);

  useEffect(() => {
    setSoundMuted(!soundOn);
    storeSoundPreference(soundOn);
  }, [soundOn]);

  useEffect(() => {
    try {
      localStorage.setItem("pricing-the-game:manager", manager.slice(0, 22));
    } catch {
      // Name is a convenience only.
    }
  }, [manager]);

  useEffect(() => {
    const ended = screen !== "play" || closedRef.current || overlay === "gameover" || overlay === "complete";
    if (ended) {
      removeKey(RUN_KEY);
      return;
    }
    storeJson(RUN_KEY, {
      screen,
      chapter,
      score,
      confidence,
      completed: [...completed],
      awards: [...seenAwards.current],
      status: "active",
    } satisfies SavedRun);
  }, [screen, chapter, score, confidence, completed, overlay, runKey, awardVersion]);

  useEffect(() => {
    return () => {
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
    };
  }, []);

  const emitJuice = useCallback((tone: Tone = "click") => {
    const stage = stageRef.current;
    if (stage) {
      stage.classList.remove("stage-shake");
      void stage.offsetWidth;
      stage.classList.add("stage-shake");
      if (shakeTimer.current) window.clearTimeout(shakeTimer.current);
      shakeTimer.current = window.setTimeout(() => {
        stage.classList.remove("stage-shake");
      }, 400);
    }

    const fallback = {
      x: typeof window === "undefined" ? 300 : window.innerWidth / 2,
      y: typeof window === "undefined" ? 300 : window.innerHeight * 0.34,
    };
    const point = pointerRef.current ?? fallback;
    const particle: Burst = {
      id: burstId.current,
      x: point.x,
      y: point.y,
      color: burstColors[tone],
      count: tone === "win" || tone === "war" ? 20 : 12,
      spread: tone === "win" ? 120 : 88,
    };
    burstId.current += 1;
    setBursts((previous) => [...previous.slice(-3), particle]);
    window.setTimeout(() => {
      setBursts((previous) => previous.filter((burst) => burst.id !== particle.id));
    }, 940);
  }, []);

  const feed = useCallback(
    (options: FeedOptions) => {
      if (!activeRef.current) return;

      let fresh = true;
      if (options.awardKey) {
        fresh = !seenAwards.current.has(options.awardKey);
        if (fresh) {
          seenAwards.current.add(options.awardKey);
          setAwardVersion((previous) => previous + 1);
        }
      }

      if (fresh) {
        if (options.points) setScore((previous) => previous + options.points!);
        if (options.confidence) {
          setConfidence((previous) => clamp(previous + options.confidence!, 0, 100));
        }
        if (options.points || options.confidence) {
          const id = gainSeq.current;
          gainSeq.current += 1;
          setGain({
            id,
            points: options.points ?? 0,
            confidence: options.confidence ?? 0,
          });
          window.setTimeout(() => {
            setGain((previous) => (previous?.id === id ? null : previous));
          }, 1400);
        }
      }
      if (options.news) setNews(options.news);
      if (options.tone) {
        playSound(options.tone);
        emitJuice(options.tone);
      } else {
        emitJuice("click");
      }
    },
    [emitJuice]
  );

  const recordScore = useCallback(
    (outcome: ScoreEntry["outcome"]) => {
      if (savedRef.current) return;
      savedRef.current = true;
      removeKey(RUN_KEY);
      const entry = makeScoreEntry(manager, score, confidence, outcome);
      setHighScores((previous) => storeHighScores([...previous, entry]));
      setLastEntryId(entry.id);
    },
    [manager, score, confidence]
  );

  useEffect(() => {
    if (screen === "play" && confidence <= 0 && overlay === null && !closedRef.current) {
      closedRef.current = true;
      recordScore("Fired");
      setOverlay("gameover");
      playSound("war");
      emitJuice("war");
    }
  }, [confidence, screen, overlay, recordScore, emitJuice]);

  const startShift = useCallback(() => {
    clearRunState();
    setScore(0);
    setConfidence(100);
    setNews(initialNews);
    setOverlay(null);
    setChapter(1);
    setCompleted(new Set([1]));
    setLastEntryId(null);
    seenAwards.current = new Set();
    setAwardVersion((previous) => previous + 1);
    savedRef.current = false;
    closedRef.current = false;
    setGain(null);
    setRunKey((previous) => previous + 1);
    setScreen("play");
    playSound("win");
    emitJuice("win");
  }, [emitJuice]);

  const restartShift = useCallback(() => {
    startShift();
  }, [startShift]);

  const goTitle = useCallback(() => {
    clearRunState();
    setOverlay(null);
    setScreen("start");
    activeRef.current = false;
    playSound("click");
  }, []);

  const toggleSound = useCallback(() => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundMuted(!next);
    if (next) playSound("click");
  }, [soundOn]);

  const goChapter = useCallback(
    (next: number) => {
      const safe = Math.min(4, Math.max(1, next));
      setChapter(safe);
      setCompleted((previous) => {
        const updated = new Set(previous);
        updated.add(safe);
        return updated;
      });
      setOverlay(null);
      playSound("click");
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    },
    []
  );

  const finishShift = useCallback(() => {
    closedRef.current = true;
    recordScore("Shift complete");
    setCompleted((previous) => {
      const updated = new Set(previous);
      updated.add(4);
      return updated;
    });
    setOverlay("complete");
    playSound("win");
    emitJuice("win");
  }, [recordScore, emitJuice]);

  useEffect(() => {
    if (screen !== "play") return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const key = event.key.toLowerCase();

      if (key === "escape" || key === "p") {
        event.preventDefault();
        if (overlay === "pause" || overlay === "complete") {
          setOverlay(null);
        } else if (overlay === null) {
          setOverlay("pause");
          playSound("click");
        }
        return;
      }
      if (key === "m") {
        event.preventDefault();
        toggleSound();
        return;
      }
      if (key === "r" && overlay) {
        event.preventDefault();
        restartShift();
        return;
      }
      if (overlay) return;
      if (event.key === "[") {
        event.preventDefault();
        goChapter(chapter - 1);
      }
      if (event.key === "]") {
        event.preventDefault();
        goChapter(chapter + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, overlay, chapter, goChapter, restartShift, toggleSound]);

  if (screen === "start") {
    return (
      <div
        onPointerDownCapture={(event) => {
          pointerRef.current = { x: event.clientX, y: event.clientY };
        }}
      >
        <StartScreen
          manager={manager}
          onManager={setManager}
          onStart={startShift}
          highScores={highScores}
          soundOn={soundOn}
          onToggleSound={toggleSound}
        />
        <ParticleLayer bursts={bursts} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      onPointerDownCapture={(event) => {
        pointerRef.current = { x: event.clientX, y: event.clientY };
      }}
    >
      <Header
        chapter={chapter}
        onChapter={goChapter}
        score={score}
        confidence={confidence}
        news={news}
        manager={manager}
        soundOn={soundOn}
        onToggleSound={toggleSound}
        onPause={() => {
          setOverlay("pause");
          playSound("click");
        }}
        completed={completed}
      />

      <div ref={stageRef} className="will-change-transform">
        <main className="mx-auto max-w-[1360px] px-3 pb-10 pt-3 sm:px-6 sm:pt-4">
          <div key={runKey}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-ink/25 py-2 md:hidden">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-ink bg-ink font-mono text-[10.5px] font-bold text-paper">
                {(manager || "M").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
                  On shift · ch. {String(chapter).padStart(2, "0")}
                </div>
                <div className="text-[12.5px] font-bold">{manager || "Pricing manager"}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
                  Score
                </div>
                <div className="num text-[12px] font-bold">{formatNumber(score)}</div>
              </div>
              <div className="w-[92px]">
                <div className="flex items-center justify-between font-mono text-[9.5px] font-bold uppercase tracking-wider text-muted">
                  <span className="flex items-center gap-0.5">
                    <HeartPulse size={8} /> Trust
                  </span>
                  <span className="text-ink">{confidence}</span>
                </div>
                <Meter
                  value={confidence}
                  tone={confidence <= 30 ? "quickbite" : confidence <= 60 ? "warn" : "peace"}
                  className="mt-1 h-1.5"
                  label="Board trust"
                />
              </div>
            </div>
          </div>

          <div className={chapter === 1 ? "block" : "hidden"}>
            <Guide chapter={1} />
            <OneShot
              active={chapter === 1 && overlay === null && !closedRef.current}
              feed={feed}
              onNext={() => goChapter(2)}
            />
          </div>

          <div className={chapter === 2 ? "block" : "hidden"}>
            <Guide chapter={2} />
            <Repeated
              active={chapter === 2 && overlay === null && !closedRef.current}
              feed={feed}
              onNext={() => goChapter(3)}
            />
          </div>

          <div className={chapter === 3 ? "block" : "hidden"}>
            <Guide chapter={3} />
            <Mixed
              active={chapter === 3 && overlay === null && !closedRef.current}
              feed={feed}
              onNext={() => goChapter(4)}
            />
          </div>

          <div className={chapter === 4 ? "block" : "hidden"}>
            <Summary onComplete={finishShift} onChapter={goChapter} score={score} />
          </div>
          </div>

          <div className="mt-7 grid gap-2 border-t-[1.5px] border-dashed border-ink/30 pt-3 sm:grid-cols-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <span className="flex items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted">
                <Keyboard size={12} /> Controls
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                {chapter === 2 ? (
                  <>
                    <Kbd>C</Kbd> hold <Kbd>U</Kbd> undercut
                  </>
                ) : chapter === 3 ? (
                  <>
                    <Kbd>W</Kbd>
                    <Kbd>S</Kbd> day <Kbd>F</Kbd> coin
                  </>
                ) : (
                  <>
                    <Kbd>1</Kbd>
                    <Kbd>2</Kbd> decisions
                  </>
                )}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                <Kbd>[</Kbd>
                <Kbd>]</Kbd> chapters
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-muted">
                <Kbd>Esc</Kbd> pause
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => goChapter(chapter - 1)}
                disabled={chapter === 1}
                className="flex items-center gap-1 text-[11px] font-bold text-muted hover:text-ink disabled:opacity-30"
              >
                <ArrowLeft size={11} /> Previous
              </button>
              <span className="font-mono text-[10.5px] uppercase tracking-wider text-muted">
                Chapter {chapter} / 4
              </span>
              {chapter < 4 ? (
                <button
                  type="button"
                  onClick={() => goChapter(chapter + 1)}
                  className="flex items-center gap-1 text-[11px] font-bold text-quickbite hover:text-ink"
                >
                  Next <ArrowRight size={11} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishShift}
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-bold",
                    savedRef.current ? "text-muted" : "text-quickbite hover:text-ink"
                  )}
                >
                  <RotateCcw size={10} /> File report
                </button>
              )}
            </div>
          </div>

        </main>
      </div>

      {!overlay ? (
        <button
          type="button"
          onClick={() => {
            setOverlay("pause");
            playSound("click");
          }}
          className="fixed bottom-3 right-3 z-40 flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-ink bg-paper text-ink shadow-[2px_2px_0_#16161A] md:hidden"
          aria-label="Pause game"
        >
          <Pause size={16} fill="currentColor" />
        </button>
      ) : null}

      {gain ? (
        <div
          key={gain.id}
          className="pointer-events-none fixed bottom-4 left-1/2 z-[65] -translate-x-1/2 pop-in"
          aria-live="polite"
        >
          <div className="flex items-center gap-1 rounded-lg border-[1.5px] border-ink bg-white px-2 py-1.5 shadow-[3px_3px_0_#16161A]">
            {gain.points !== 0 ? (
              <span className="num rounded bg-ink px-2 py-1 text-[13px] font-bold text-paper">
                {gain.points > 0 ? "+" : ""}
                {gain.points} PTS
              </span>
            ) : null}
            {gain.confidence !== 0 ? (
              <span
                className={cn(
                  "rounded border-[1.5px] px-2 py-1 font-mono text-[12.5px] font-bold",
                  gain.confidence > 0
                    ? "border-peace bg-peace-soft text-peace"
                    : "border-quickbite bg-quickbite-soft text-quickbite"
                )}
              >
                {gain.confidence > 0 ? "+" : ""}
                {gain.confidence} TRUST
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {overlay ? (
        <Overlays
          mode={overlay}
          manager={manager}
          score={score}
          confidence={confidence}
          chapter={chapter}
          highScores={highScores}
          lastEntryId={lastEntryId}
          onResume={() => setOverlay(null)}
          onRestart={restartShift}
          onTitle={goTitle}
        />
      ) : null}

      <ParticleLayer bursts={bursts} />
    </div>
  );
}
