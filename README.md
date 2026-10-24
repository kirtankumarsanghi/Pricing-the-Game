<div align="center">

# 🍕 Pricing the Game

### QuickBite vs Yummly: a playable game-theory simulation of a delivery-fee price war

**[▶ Play it live: pricing-the-game.vercel.app](https://pricing-the-game.vercel.app/)**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?logo=vercel&logoColor=white)](https://pricing-the-game.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-21_tests-6E9F18?logo=vitest&logoColor=white)](src/lib/game.test.ts)

</div>

---

## Table of Contents

1. [Overview](#overview)
2. [How to Play](#how-to-play)
3. [The Chapters in Detail](#the-chapters-in-detail)
4. [Scoring and Board Confidence](#scoring-and-board-confidence)
5. [Controls](#controls)
6. [Getting Started (Run Locally)](#getting-started-run-locally)
7. [Project Structure](#project-structure)
8. [How the Code Works](#how-the-code-works)
9. [Data and Persistence](#data-and-persistence)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Tech Stack](#tech-stack)
13. [Visual Design](#visual-design)
14. [Contributing](#contributing)
15. [Security](#security)
16. [License](#license)

---

## Overview

When a competitor can react to your price, pricing stops being a calculation and becomes a **game**. Your profit depends on what *you* charge **and** what *they* charge in response.

**Pricing the Game** puts you in the role of **Head of Revenue at QuickBite**, a food delivery platform in a two-company market. Your only rival is **Yummly**. Over three short, playable chapters and a final debrief, you experience three of the most important ideas in game theory by making real decisions, not by reading definitions.

| # | Chapter | Core idea | What you will feel |
| :-: | :-- | :-- | :-- |
| 1 | The One-Shot Fee | Prisoner's Dilemma, dominant strategy, Nash equilibrium | Why discounting looks "obviously right" yet leaves both firms worse off |
| 2 | The 10-Week War | Repeated games, Grim Trigger, Folk Theorem | Why a single tempting betrayal can be a disaster, and why patience pays |
| 3 | Flash-Sale Timing | Matching Pennies, mixed-strategy equilibrium | Why being predictable gets exploited, and why randomizing protects you |
| 4 | Executive Debrief | Review | A scorecard tying your choices back to the theory |

**Who is it for?** Students of economics, strategy, or business; instructors who want an interactive classroom demo; and anyone curious about why competing companies so often end up in price wars. No prior game-theory knowledge is needed.

**Live demo:** <https://pricing-the-game.vercel.app/>

---

## How to Play

1. Open the [live game](https://pricing-the-game.vercel.app/) (or [run it locally](#getting-started-run-locally)).
2. Enter your manager name on the start screen (up to 22 characters).
3. Work through Chapters 1 to 3 in order. Each chapter opens with a short briefing, then lets you play.
4. Watch two meters as you go: your **score** (points) and your **board confidence** (starts at 100). See [Scoring](#scoring-and-board-confidence).
5. Finish on Chapter 4 to save your score to the local leaderboard.

You can play with the mouse or entirely from the keyboard (see [Controls](#controls)). Progress is saved automatically, so you can refresh or come back later.

---

## The Chapters in Detail

### Chapter 1: The One-Shot Fee Game

*Concepts: strict dominance, best response, Nash equilibrium, Pareto efficiency.*

Both platforms choose a delivery fee **once**:

- **Standard: ₹49** (protect the margin)
- **Discount: ₹19** (buy the market)

Payoffs are quarterly profit in ₹ lakh, written `(QuickBite, Yummly)`:

|  | Yummly: Standard | Yummly: Discount |
| :-- | :--: | :--: |
| **QuickBite: Standard** | **80, 80** | 25, 110 |
| **QuickBite: Discount** | 110, 25 | **40, 40** |

**Why this is a trap**

- If Yummly holds ₹49, you earn more by discounting (110 vs 80).
- If Yummly discounts, you *still* earn more by discounting (40 vs 25).
- So **Discount strictly dominates Standard** for you, whatever Yummly does. The same logic applies to Yummly.
- Both players discount, and the unique **Nash equilibrium** is *(Discount, Discount) = 40, 40*.
- Yet *(Standard, Standard) = 80, 80* would leave **both** better off. Combined profit falls from 160 to 80 lakh, so rational self-interest destroys half of the industry's profit. This is the **Prisoner's Dilemma**.

**In the game:** click through all four outcomes in the payoff table, then switch on the "X-ray" overlays (best responses, dominance elimination, Pareto vs Nash) to see the proof drawn on the matrix.

---

### Chapter 2: The Ten-Week Repeated War

*Concepts: repeated games, Grim Trigger, discount factor δ, the Folk Theorem.*

Real competitors meet again next week. In this chapter the same fee game is played for **10 weeks**, and Yummly uses a **Grim Trigger** strategy:

> "I will charge ₹49 as long as you do. The first time you undercut me, I will charge ₹19 for every week after that. No forgiveness."

**The four payoffs** (all in ₹ lakh):

| Symbol | Meaning | Value |
| :-: | :-- | :-: |
| R | **Reward:** both hold ₹49 | 80 |
| T | **Temptation:** you undercut a rival who holds ₹49 | 110 |
| P | **Punishment:** both at ₹19 | 40 |
| S | **Sucker:** you hold ₹49, rival undercuts | 25 |

**The key question: is cheating worth it?** Cheating once gains `T − R = 30` lakh today. But it triggers permanent punishment, which costs `R − P = 40` lakh *every* future week. How much that future loss matters depends on your patience, the **discount factor δ** (a number from 0 to 1):

```
Future loss from punishment  =  δ / (1 − δ) × (R − P)  =  δ / (1 − δ) × 40

Cooperation is stable when    δ / (1 − δ) × 40  ≥  30
                              ⇔  δ  ≥  (T − R) / (T − P)  =  30 / 70  =  3/7  ≈  42.9%
```

- **δ ≥ 3/7 (about 43%)**: you care enough about the future that cheating does not pay. Cooperation at 80, 80 is a stable equilibrium.
- **δ < 3/7**: you are too short-term. The one-week gain beats the long-run loss, and the price war becomes unavoidable.

This is the logic behind the **Folk Theorem**: when players are patient enough, cooperative outcomes that look impossible in a one-shot game become sustainable.

**In the game:**

- A **δ slider** (default 0.58, range 0 to 0.95) shows a balance scale comparing today's temptation to the discounted future punishment. Move it and watch the verdict flip around 43%.
- An **auto-projection** shows what happens over 10 weeks at your chosen δ: both hold ₹49 for ₹800L total when patient, or both discount for ₹400L total when impatient.
- Or **play the 10 weeks yourself** with *Cooperate* or *Undercut* each week. Yummly holds ₹49 until your first undercut, then discounts from that point on.

---

### Chapter 3: Flash-Sale Timing

*Concepts: Matching Pennies, no pure-strategy equilibrium, mixed-strategy Nash equilibrium, exploitability.*

Each week both platforms run one flash sale, on **Wednesday** or **Saturday**. Payoffs are market share, written `(QuickBite, Yummly)`:

|  | Yummly: Wednesday | Yummly: Saturday |
| :-- | :--: | :--: |
| **QuickBite: Wednesday** | 30%, 70% | 70%, 30% |
| **QuickBite: Saturday** | 70%, 30% | 30%, 70% |

- You win (70%) when the days **differ**. Yummly wins (70%) when they **match**.
- There is **no stable pure strategy**: whatever day you settle on, Yummly wants to copy it, and then you want to switch. The chase never ends.
- The only equilibrium is a **mixed strategy**. If you pick Wednesday with probability `p`, Yummly's expected share is `70p + 30(1−p)` for Wednesday and `30p + 70(1−p)` for Saturday. Setting them equal gives `p* = 0.5`.
- Playing a true **50/50** random mix guarantees you an expected **50% share** against *any* opponent, however clever.

**The rival is watching.** Yummly runs a simple pattern reader over your **last 6 picks** (it needs at least 3 to start). It checks, in this order:

1. **Alternation:** 3 or more alternating picks (W-S-W) → it predicts you will flip again and books that day.
2. **Repeat:** the same day 2 or more times in a row → it copies that day.
3. **Frequency lean:** at least two-thirds of recent picks on one day → it leans toward that day.
4. **Fallback:** no readable pattern (or fewer than 3 picks) → it flips a fair coin.

A live **pattern meter** shows how readable you are (Low, Medium, or High) and explains why.

**In the game:**

- **Manual mode:** pick a day each round and watch the rival react. After 6 rounds you receive a pattern report.
- **Fair-coin simulation:** set your Wednesday probability (0 to 100% in steps of 5) and simulate **60 weeks**. At exactly 50% you earn about 50% share; any bias is exploitable.

> **Takeaway:** humans are bad at being random. Use a coin.

---

### Chapter 4: Executive Debrief

A recap of all three lessons with a key statistic for each, links back to the relevant chapter, and your final shift score. Press **Finish shift and save score** to record it on the leaderboard.

---

## Scoring and Board Confidence

The game tracks two numbers.

- **Score (points):** how well you explored and applied the ideas. It only goes up.
- **Board confidence (0 to 100):** starts at **100** and rises or falls with your decisions. If it reaches **0**, you are **fired**, the run ends, and the score is recorded as "Fired".

Awards are given **once each**, so replaying a screen will not farm points.

| Where | Action | Points | Confidence |
| :-- | :-- | :-: | :-: |
| Ch. 1 | Discover a new payoff-table outcome | +25 | +1 |
| Ch. 1 | Discover the fourth and final outcome | +125 | +8 |
| Ch. 1 | Switch on each X-ray overlay (best responses, dominance, Pareto vs Nash) | +15 | n/a |
| Ch. 1 | Reveal the full dominance proof | +25 | n/a |
| Ch. 2 | Run the 10-week auto-projection | +120 | +6 if δ ≥ 3/7, else −12 |
| Ch. 2 | Each week played, both cooperate | +15 | +1 |
| Ch. 2 | Each week played otherwise | +5 | −6 if you undercut a cooperator, else −5 |
| Ch. 2 | Finish all 10 weeks with no undercut | +70, plus 6 per cooperative week | +6 |
| Ch. 2 | Finish all 10 weeks after an undercut | +20, plus 3 per cooperative week | −10 |
| Ch. 3 | Manual mode, 6 rounds, pattern stays Low | +90 | +4 |
| Ch. 3 | Manual mode, 6 rounds, pattern is readable | +65 | −8 |
| Ch. 3 | Simulate a perfectly balanced 50/50 mix | +130 | +5 |
| Ch. 3 | Simulate any other mix | +75 | −10 |

The incentives mirror the theory: exploring the matrix, staying patient, and mixing fairly are rewarded; undercutting a trusting rival and being predictable are penalized.

The leaderboard keeps the **top 8** scores locally on your device and the start screen shows the top 5.

---

## Controls

Everything works with the mouse, but the keyboard is faster.

| Key | Where | Action |
| :-: | :-- | :-- |
| `1` | Chapters 1 and 2 | Standard fee (₹49) |
| `2` | Chapters 1 and 2 | Discount fee (₹19) |
| `C` | Chapter 2 | Cooperate (hold ₹49) |
| `U` | Chapter 2 | Undercut (go ₹19) |
| `1` or `W` | Chapter 3 | Run the sale on Wednesday |
| `2` or `S` | Chapter 3 | Run the sale on Saturday |
| `F` | Chapter 3 | Flip a fair coin for me |
| `[` / `]` | Anywhere | Previous / next chapter |
| `Esc` or `P` | Anywhere | Pause / resume |
| `M` | Anywhere | Mute / unmute sound effects |
| `R` | When an overlay is open | Restart / resume the shift |

Shortcuts are ignored while you are typing in a text field.

---

## Getting Started (Run Locally)

### Prerequisites

- **Node.js** 18 or later (20 recommended)
- **npm** 9 or later

### Install and run

```bash
# 1. Clone the repository
git clone https://github.com/kirtankumarsanghi/Pricing-the-Game.git
cd Pricing-the-Game

# 2. Install dependencies
npm install

# 3. Start the dev server with hot reload
npm run dev
# → http://localhost:5173
```

### Scripts

| Command | What it does |
| :-- | :-- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` (a single self-contained HTML file) |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check the project with `tsc --noEmit` |
| `npm test` | Run the Vitest suite once |

---

## Project Structure

```
.
├── .github/
│   ├── workflows/ci.yml            # CI: typecheck → test → build
│   ├── ISSUE_TEMPLATE/             # Bug report and feature request templates
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Run state, chapter routing, persistence, global hotkeys
│   ├── index.css                   # Tailwind v4 theme and design tokens
│   ├── lib/
│   │   ├── game.ts                 # Payoff matrices, equilibrium math, pattern reader, rival AI,
│   │   │                           #   high-score and storage helpers
│   │   ├── game.test.ts            # 21 unit tests
│   │   └── sound.ts                # Web Audio sound effects
│   ├── components/
│   │   ├── StartScreen.tsx         # Landing page, name entry, leaderboard
│   │   ├── Header.tsx              # Chapter navigation, score and confidence display
│   │   ├── Guide.tsx               # Per-chapter theory briefing
│   │   ├── OneShot.tsx             # Chapter 1
│   │   ├── Repeated.tsx            # Chapter 2
│   │   ├── Mixed.tsx               # Chapter 3
│   │   ├── Summary.tsx             # Chapter 4
│   │   ├── Overlays.tsx            # Pause, game-over and shift-complete screens
│   │   ├── Effects.tsx             # Celebration effects
│   │   └── ui.tsx                  # Shared UI building blocks
│   └── utils/cn.ts                 # clsx + tailwind-merge helper
├── index.html
├── vite.config.ts                  # React + Tailwind + single-file bundling
├── vercel.json                     # Vercel build settings and security headers
├── tsconfig.json
├── package.json
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

---

## How the Code Works

**Game logic is separate from the UI.** Everything mathematical lives in `src/lib/game.ts` as plain, testable functions and constants, so the rules can be verified without rendering anything.

| Piece | Where | Purpose |
| :-- | :-- | :-- |
| `MATRIX`, `DAY_MATRIX` | `game.ts` | The fee-game and flash-sale payoff tables |
| `REPEATED` | `game.ts` | The R, T, P, S values for Chapter 2 |
| `COLLUSION_THRESHOLD` | `game.ts` | `(T − R) / (T − P)` = 3/7 |
| `cooperationIsStable(δ)` | `game.ts` | True when δ meets the threshold |
| `futurePunishment(δ)` | `game.ts` | `δ / (1 − δ) × (R − P)` |
| `readPattern(history)` | `game.ts` | Powers the on-screen pattern meter |
| `predictRivalDay(history)` | `game.ts` | Yummly's pick, using the same window and thresholds as the meter |

Because the meter and the rival use the same rules, what the UI warns you about is exactly what the bot exploits.

**State flow.** `App.tsx` owns the run-level state (chapter, score, confidence, awards). Each chapter component receives a `feed` callback to report points, confidence changes, and ticker news. `App.tsx` applies them, plays the matching sound, shows the floating gain indicator, and checks for the "fired" condition.

**Keyboard handling.** Global keys are registered once in `App.tsx`. Chapter-specific keys are only active while that chapter is on screen and no overlay is open.

---

## Data and Persistence

All data stays in your browser's `localStorage`. There is no backend, no account, and nothing is sent anywhere.

| Key | Contents |
| :-- | :-- |
| `pricing-the-game:run:v2` | Current chapter, score, confidence, awards earned |
| `pricing-the-game:repeated:v2` | Chapter 2 weeks played and your δ setting |
| `pricing-the-game:mixed:v2` | Chapter 3 rounds and history |
| `pricing-the-game:high-scores:v1` | Local leaderboard (top 8) |
| `pricing-the-game:manager` | Your manager name |
| `pricing-the-game:sfx` | Sound on or off |

Storage access is wrapped in `try/catch`, so the game still works in private browsing modes where storage is unavailable (it just will not remember progress). To reset everything, clear this site's data in your browser.

---

## Testing

The mathematical core is covered by **21 Vitest unit tests** in `src/lib/game.test.ts`, including:

- Payoff matrix values for both games
- Strict dominance and the unique Nash equilibrium
- Pareto comparison of cooperative vs equilibrium outcomes
- The collusion threshold equals 3/7
- Pattern detection: alternation, repeats, frequency lean, and the coin fallback with fewer than 3 picks
- Score and trust arithmetic

```bash
npm test             # run all tests once
npx vitest           # watch mode
npm run typecheck    # static type check
```

**Continuous integration:** GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, typecheck, tests, and the production build on Node 20 for every push and pull request to `main`.

---

## Deployment

The production build is a single self-contained HTML file, so it can be hosted on almost any static host. The project is configured for **Vercel** and is currently live at <https://pricing-the-game.vercel.app/>.

**Deploy your own copy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kirtankumarsanghi/Pricing-the-Game)

Or with the CLI:

```bash
npx vercel login
npx vercel          # preview deployment
npx vercel --prod   # production deployment
```

`vercel.json` sets the framework to Vite, the output directory to `dist`, rewrites all routes to `index.html`, and adds these security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Tech Stack

| Area | Technology |
| :-- | :-- |
| UI | React 19, TypeScript 5.9 |
| Build | Vite 7, `vite-plugin-singlefile` |
| Styling | Tailwind CSS v4 |
| Icons / utilities | lucide-react, clsx, tailwind-merge |
| Audio | Web Audio API (synthesized, no audio files) |
| Testing | Vitest |
| CI / Hosting | GitHub Actions, Vercel |

---

## Visual Design

The interface follows an editorial **"paper and ink"** style, like a financial gazette or strategy memo: a warm parchment background, ink-black text, and vermilion and forest-green accents. Headings use Space Grotesk, body copy uses Plus Jakarta Sans, and money values and matrices use JetBrains Mono. Stamps, badges, and small synthesized sounds make each decision feel tangible.

---

## Contributing

Contributions, bug reports, and classroom adaptations are welcome.

1. Fork the repo and create a branch with a descriptive name.
2. Make your changes, then run:
   ```bash
   npm run typecheck && npm test && npm run build
   ```
3. Open a pull request against `main`, using the PR template.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) first. Use the issue templates for bug reports and feature requests.

---

## Security

If you find a vulnerability, please follow the reporting process in [SECURITY.md](SECURITY.md) instead of opening a public issue.

---

## License

Released under the [MIT License](LICENSE).

© 2026 Kirtan Kumar Sanghi
