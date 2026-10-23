<div align="center">

# 🍕 Pricing the Game — QuickBite vs Yummly
### *An Interactive Game-Theory Simulation of a Delivery-Fee Duopoly Price War*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Vitest-21_Passed-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](src/lib/game.test.ts)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kirtankumarsanghi/Pricing-the-Game)

<p align="center">
  <strong>Put yourself in the shoes of a food delivery platform executive. Learn why intuition fails, why price wars destroy profits, and how mathematical game theory governs real-world pricing battles.</strong>
</p>

[Quick Start](#-quick-start) • [Deploy on Vercel](#-deploy-to-vercel) • [The Story](#-the-story) • [Game Theory Chapters](#-game-theory-chapters) • [System Architecture](#-system-architecture) • [Keyboard Controls](#-gameplay-controls)

---

</div>

## 📌 Executive Overview

In the platform economy, **pricing is not an optimization problem—it is a game**. Your profits depend not only on what you charge, but on how your competitor responds.

**Pricing the Game** is a narrative-driven, hands-on simulation featuring two duopolistic food delivery platforms: **QuickBite** (the player) and **Yummly** (the algorithm-driven rival). Through 3 playable chapters and an executive debrief, players experience firsthand the fundamental concepts of game theory:

1. **The Prisoner's Dilemma & Nash Equilibrium** (Why rational choices lead to collective destruction).
2. **Repeated Games, Grim Trigger & The Folk Theorem** (Why patience and credible threats sustain cooperation).
3. **Matching Pennies & Mixed-Strategy Nash Equilibrium** (Why predictability is fatal and how randomization protects you).

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20+ recommended)
- **npm**: v9.0.0 or later

### Installation & Execution

```bash
# 1. Clone the repository
git clone https://github.com/kirtankumarsanghi/Pricing-the-Game.git
cd Pricing-the-Game

# 2. Install dependencies (including devDependencies)
npm install --include=dev

# 3. Launch local development server with hot-reload
npm run dev
# -> Local server available at http://localhost:5173

# 4. Run test suite
npm test

# 5. Typecheck TypeScript sources
npm run typecheck

# 6. Build production bundle (self-contained single-file HTML bundle)
npm run build
```

---

## 🌐 Deploy to Vercel

This repository is pre-configured with a zero-config [`vercel.json`](vercel.json) build profile. You can deploy it using either method:

### Option A: One-Click Deploy via Vercel Dashboard (Recommended)

1. Click the button below:

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/kirtankumarsanghi/Pricing-the-Game)

2. Sign in to your Vercel account and link your GitHub.
3. Select your repository `Pricing-the-Game`.
4. Vercel automatically detects the Vite framework settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Your site will be live on a `*.vercel.app` domain with automatic HTTPS and instant CI/CD on every git push!

### Option B: Deploy via Vercel CLI

```bash
# 1. Install or authenticate with Vercel
npx vercel login

# 2. Deploy preview build
npx vercel

# 3. Deploy directly to production
npx vercel --prod
```

---

## 📖 The Story

The year is 2026. The metropolitan food delivery market is dominated by two titans: **QuickBite** and **Yummly**. Both platforms connect millions of hungry diners with thousands of restaurants.

You have just been appointed **Head of Revenue & Monetization** at QuickBite. Your rival, Yummly, is aggressive, data-driven, and hyper-reactive. Every quarter, boardroom pressure mounts to slash delivery fees to acquire market share. 

Will you plunge the market into a race to the bottom, or can you navigate the delicate mathematics of tacit collusion and strategic equilibrium?

---

## 🧠 Game Theory Chapters & Mathematical Foundations

### Chapter 1: The One-Shot Fee Game
#### *Dominance, Strategic Defection & The Nash Equilibrium*

Two platforms independently choose their delivery fee for the upcoming cycle:
- **Standard Fee**: ₹49
- **Discount Fee**: ₹19

#### The Payoff Matrix (₹ Lakhs per quarter):
```
                       Yummly (Rival)
                   Standard (₹49)   Discount (₹19)
QuickBite  Standard   [ 80, 80 ]       [ 25, 110 ]
 (Player)  Discount   [ 110, 25 ]      [ 40, 40 ]
```
*(Payoffs format: [ QuickBite Profit, Yummly Profit ] in ₹ Lakh)*

#### Mathematical Breakdown:
- **Best Response Analysis**:
  - If Yummly plays **Standard**, QuickBite compares:
    $$\text{Discount (110)} > \text{Standard (80)} \implies \text{Best response is Discount}$$
  - If Yummly plays **Discount**, QuickBite compares:
    $$\text{Discount (40)} > \text{Standard (25)} \implies \text{Best response is Discount}$$
- **Strict Dominance**: Playing **Discount** strictly dominates **Standard** for QuickBite under *every possible action* of Yummly ($110 > 80$ and $40 > 25$). By symmetry, Discount is also strictly dominant for Yummly.
- **The Unique Nash Equilibrium**: $(Discount, Discount) \rightarrow (40, 40)$. Neither platform has any unilateral incentive to deviate.
- **The Pareto Paradox**: The cooperative outcome $(Standard, Standard) \rightarrow (80, 80)$ generates ₹160 Lakh total surplus, whereas the Nash equilibrium yields only ₹80 Lakh total surplus. Rational self-interest burns 50% of industry profit—the quintessential **Prisoner's Dilemma**.

---

### Chapter 2: The Ten-Week Repeated War
#### *The Folk Theorem, Grim Trigger & The Discount Factor ($\delta$)*

In real markets, pricing is rarely a one-shot game. QuickBite and Yummly compete week after week. This repeated interaction introduces the possibility of **punishment** and **cooperation**.

In this chapter, Yummly employs the famous **Grim Trigger strategy**:
> *"I will charge the Standard ₹49 fee as long as you do. The very first week you undercut me with ₹19, I will slash my fee to ₹19 for all remaining weeks without mercy."*

#### The Game Variables:
- **Cooperation Reward ($R$)**: ₹80 Lakh (both play ₹49)
- **Temptation to Cheat ($T$)**: ₹110 Lakh (you play ₹19 while rival plays ₹49)
- **Punishment Payoff ($P$)**: ₹40 Lakh (both play ₹19)
- **Sucker's Payoff ($S$)**: ₹25 Lakh (you play ₹49 while rival plays ₹19)
- **Discount Factor ($\delta \in [0, 1]$)**: The manager's future-focus or patience parameter (also interpreted as the probability that the business relationship persists into the next period).

#### Mathematical Derivation of the Collusion Threshold:
Suppose QuickBite considers defecting in period $t$:
1. **Immediate Gain from Defection**:
   $$\Delta \text{Gain} = T - R = 110 - 80 = 30\text{ Lakh}$$
2. **Present Value of Future Loss under Grim Trigger Punishment**:
   $$\Delta \text{Loss} = \sum_{k=1}^{\infty} \delta^k (R - P) = \frac{\delta}{1 - \delta}(R - P) = \frac{\delta}{1 - \delta}(80 - 40) = \frac{40\delta}{1 - \delta}$$
3. **Condition for Sustainable Cooperation**:
   $$\frac{\delta}{1 - \delta}(R - P) \ge T - R \iff \delta \ge \frac{T - R}{(T - R) + (R - P)} = \frac{T - R}{T - P}$$
   $$\delta^* = \frac{110 - 80}{110 - 40} = \frac{30}{70} = \frac{3}{7} \approx 42.86\%$$

#### Strategic Takeaway:
If your discount factor $\delta \ge 43\%$, cooperation at $(80, 80)$ is a subgame perfect Nash equilibrium sustained by the threat of grim punishment. If $\delta < 43\%$ (short-termism / extreme impatience), cooperation unravels and the price war is inevitable.

---

### Chapter 3: Flash-Sale Timing
#### *Matching Pennies, Mixed Strategies & The Adversary Pattern Reader*

Both platforms launch weekly flash sales to stimulate order volume. Each platform must choose between two days:
- **Wednesday** (Mid-week slump booster)
- **Saturday** (Weekend peak demand)

#### Payoff Matrix (% Market Share):
```
                       Yummly (Rival)
                    Wednesday        Saturday
QuickBite  Wednesday [ 30%, 70% ]    [ 70%, 30% ]
 (Player)  Saturday  [ 70%, 30% ]    [ 30%, 70% ]
```

- **Conflict Dynamics**: QuickBite wins 70% share when sale days **differ** (capturing unchallenged demand). Yummly wins 70% share when sale days **coincide** (crushing QuickBite with scale and exclusive partner deals).
- **No Pure Strategy Nash Equilibrium**: If QuickBite picks Wednesday, Yummly wants Wednesday. But if Yummly picks Wednesday, QuickBite wants Saturday. If QuickBite picks Saturday, Yummly wants Saturday... The cycle never rests.
- **Mixed Strategy Nash Equilibrium**:
  Let QuickBite play Wednesday with probability $p$ and Saturday with $1-p$.
  Yummly's expected payoff from Wednesday:
  $$E[U_Y(\text{Wed})] = 70p + 30(1-p)$$
  Yummly's expected payoff from Saturday:
  $$E[U_Y(\text{Sat})] = 30p + 70(1-p)$$
  In mixed equilibrium, QuickBite must make Yummly indifferent between choices:
  $$70p + 30(1-p) = 30p + 70(1-p) \implies 40p = 40(1-p) \implies p^* = 0.50\ (50\%)$$

#### The AI Pattern Reader:
Humans are notoriously bad at being random. Yummly deploys a real-time pattern-recognition bot that monitors your sliding window of the last 6 decisions:
1. **Alternation Tracker**: If you alternate 3 or more times (W-S-W-S), it predicts you will toggle again and counters your next move.
2. **Streak Exploiter**: If you repeat the same day 2 or more times, it copies your choice.
3. **Frequency Bias**: If $\ge 67\%$ of your recent picks favor one day, it aligns with that day.
4. **Fallback**: If no readable bias exists, it flips a fair coin.

**The Maximin Defense**: Randomizing 50/50 using an unbiased generator (or the in-game `[F]` Fair Coin key) guarantees you an expected 50% market share against any adversarial prediction model.

---

### Chapter 4: Executive Debrief
A comprehensive review comparing your decisions across all chapters against game theory benchmarks, evaluating your total platform revenue, trust score, and strategic persona.

---

## 🎮 Gameplay Controls

The entire simulation is fully playable with mouse clicks or high-speed keyboard shortcuts:

| Key | Context | Action |
| :---: | :--- | :--- |
| <kbd>1</kbd> | Chapters 1 & 2 | Select **Standard Fee (₹49)** |
| <kbd>2</kbd> | Chapters 1 & 2 | Select **Discount Fee (₹19)** |
| <kbd>C</kbd> | Chapter 2 | Cooperate (Standard ₹49) |
| <kbd>U</kbd> | Chapter 2 | Undercut / Defect (Discount ₹19) |
| <kbd>W</kbd> | Chapter 3 | Pick **Wednesday** Flash Sale |
| <kbd>S</kbd> | Chapter 3 | Pick **Saturday** Flash Sale |
| <kbd>F</kbd> | Chapter 3 | Flip **Fair Coin** (50/50 Randomizer) |
| <kbd>[</kbd> | Global | Navigate to **Previous Chapter** |
| <kbd>]</kbd> | Global | Navigate to **Next Chapter** |
| <kbd>Esc</kbd> / <kbd>P</kbd> | Global | **Pause / Resume** Simulation |
| <kbd>M</kbd> | Global | Toggle **Sound FX (Audio Mute)** |
| <kbd>R</kbd> | Overlay | **Restart / Resume** Shift |

---

## 🛠 System Architecture

### Directory & File Guide

```
food-delivery-pricing-game/
├── .github/
│   ├── workflows/
│   │   └── ci.yml               # Automated GitHub Actions CI (Typecheck, Test, Build)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md        # Bug reporting template
│   │   └── feature_request.md   # Feature request template
│   └── PULL_REQUEST_TEMPLATE.md # Pull request guidelines & validation checklist
├── src/
│   ├── main.tsx                 # React DOM root entry point
│   ├── App.tsx                  # Core app state, routing, persistence, keyboard listener
│   ├── index.css                # Tailwind CSS v4 design system, paper/ink tokens
│   ├── lib/
│   │   ├── game.ts              # Payoff matrices, Folk theorem math, rival AI logic
│   │   ├── game.test.ts         # 21 comprehensive Vitest unit tests
│   │   └── sound.ts             # Web Audio API procedural sound synthesizer
│   ├── components/
│   │   ├── StartScreen.tsx      # Landing view, executive credentials, high scores
│   │   ├── Header.tsx           # Chapter navigation tabs, score ticker, trust meter
│   │   ├── Guide.tsx            # Contextual chapter guide & theoretical briefing
│   │   ├── OneShot.tsx          # Chapter 1: 2x2 fee matrix, dominance visualizer
│   │   ├── Repeated.tsx         # Chapter 2: 10-week repeated campaign, live log, δ slider
│   │   ├── Mixed.tsx            # Chapter 3: Flash-sale matching pennies, pattern meter
│   │   ├── Summary.tsx          # Chapter 4: Executive debrief, performance scorecard
│   │   ├── Overlays.tsx         # Pause overlay, game over modal, shift complete
│   │   ├── Effects.tsx          # Canvas confetti & particle celebration effects
│   │   └── ui.tsx               # Reusable tactile UI primitives (cards, stamps, badges)
│   └── utils/
│       └── cn.ts                # Tailwind merge and clsx class utility
├── index.html                   # HTML5 shell with Google typography fonts
├── package.json                 # Project dependencies, scripts, and repository metadata
├── tsconfig.json                # TypeScript strict configuration
└── vite.config.ts               # Vite configuration with single-file bundler plugin
```

### State Management & Persistence

Game progress automatically persists in browser `localStorage`, allowing players to refresh mid-shift without losing progress:

| Storage Key | Data Structure | Purpose |
| :--- | :--- | :--- |
| `pricing-the-game:run:v2` | `ActiveRun` | Current chapter, total revenue, trust index, completed chapters |
| `pricing-the-game:repeated:v2` | `RepeatedState` | Round-by-round history of Chapter 2, discount factor $\delta$ |
| `pricing-the-game:mixed:v2` | `MixedState` | Decisions in Chapter 3, market share distributions, mix ratio |
| `pricing-the-game:high-scores:v1`| `HighScore[]` | Local leaderboard of top managerial performances |
| `pricing-the-game:manager` | `string` | Executive manager handle |
| `pricing-the-game:sfx` | `boolean` | Audio mute / un-mute preference |

---

## 🧪 Testing & Verification

The mathematical models and game logic are covered by **21 Vitest unit tests** located in `src/lib/game.test.ts`:

- **Payoff Matrix Accuracy**: Verifies all payoffs match theoretical models in both chapters.
- **Strict Dominance Tests**: Validates that undercutting is identified as dominant.
- **Nash Equilibrium Verification**: Validates unique Nash points and Pareto superiority checks.
- **Folk Theorem Threshold**: Confirms cooperation threshold calculation $\delta^* = 3/7$.
- **Adversary Pattern Reader**:
  - Tests alternation detection (e.g., W $\rightarrow$ S $\rightarrow$ W $\rightarrow$ S).
  - Tests repeat bias detection (e.g., S $\rightarrow$ S).
  - Tests window frequency bias ($\ge 67\%$).
  - Validates coin toss behavior when window size $< 3$.
- **Score & Trust Calculations**: Ensures trust penalties and payoffs calculate without floating-point drift.

```bash
# Run Vitest test suite once
npm test

# Run tests in watch mode
npx vitest

# Check TypeScript static types
npm run typecheck
```

---

## 🎨 Visual Design Philosophy

The application employs an editorial **"Paper & Ink"** aesthetic inspired by financial gazettes and strategy memos:
- **Typography**: Space Grotesk for bold headers, Plus Jakarta Sans for executive copy, and JetBrains Mono for monetary values and matrices.
- **Color Palette**: Warm parchment canvas (`#F5F2EB`), crisp ink (`#16161A`), vermillion crimson (`#E54826`), and deep forest green (`#1B4332`).
- **Tactile Feedback**: Subtle drop shadows, postal stamps, ink badges, and Web Audio click synthesizers provide physical presence to every managerial decree.

---

## 🤝 Contributing

Contributions, feedback, and educational adaptations are welcome! Please review:
- [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, branching, and pull request procedures.
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.
- [SECURITY.md](SECURITY.md) for reporting security vulnerabilities.

---

## 📄 License

This project is licensed under the terms of the [MIT License](LICENSE).

Copyright &copy; 2026 **Kirtan Kumar Sanghi**. All rights reserved.
