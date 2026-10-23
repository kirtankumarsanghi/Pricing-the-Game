# Contributing to Pricing the Game

Thank you for your interest in contributing to **Pricing the Game**! We welcome contributions ranging from bug fixes and gameplay balance improvements to documentation polish and new game-theoretic chapters.

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (Node 20+ LTS recommended)
- **npm**: v9.0.0 or higher
- **Git**

### Local Setup

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/Pricing-the-Game.git
   cd Pricing-the-Game
   ```
3. **Install dependencies**:
   ```bash
   npm install --include=dev
   ```
4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Development Workflow

1. Create a new branch with a descriptive name:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```
2. Make your changes adhering to existing design tokens, typography, and mathematical models.
3. Validate your changes locally:
   ```bash
   # Run TypeScript typechecker
   npm run typecheck

   # Run Vitest test suite
   npm test

   # Verify production bundle build
   npm run build
   ```
4. Commit your changes using clear, concise commit messages following conventional commit principles (e.g., `feat: ...`, `fix: ...`, `docs: ...`).
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request against the `main` branch.

---

## Coding Guidelines

- **TypeScript**: Ensure strict typing without bypassing type safety (`any` should be avoided).
- **Styling**: Use the existing Tailwind CSS 4 theme variables defined in `src/index.css`. Maintain the editorial "paper & ink" aesthetic with tactile feedback.
- **Game Theory Models**: All mathematical models, payoff calculations, and rival AI heuristics must reside in `src/lib/game.ts` and have matching test coverage in `src/lib/game.test.ts`.
- **Clean Architecture**: Decouple game logic from UI components to keep the code testable and predictable.

---

## Submitting Pull Requests

- Keep PRs focused on a single concern or feature.
- Ensure all CI checks (typecheck, tests, build) pass.
- Include a descriptive summary of what was changed and why.
- If fixing an issue, reference it using `Fixes #<issue-number>`.

---

## Reporting Issues

If you find a bug or have a suggestion:
- Check existing issues first to avoid duplicates.
- Use our [Issue Templates](https://github.com/kirtankumarsanghi/Pricing-the-Game/issues/new/choose) to report bugs or propose features.
- Provide clear steps to reproduce any unexpected behavior, including browser version and OS.
