import { cn } from "../utils/cn";

const guides: Record<
  number,
  { label: string; title: string; concept?: string; story: string; steps: [string, string][]; color: string }
> = {
  1: {
    label: "Chapter 1 of 4",
    title: "One decision, two players",
    concept: "One-shot game · Dominant strategy · Nash equilibrium",
    story:
      "You set QuickBite’s delivery fee — and you also choose Yummly’s, so you can walk through all four outcomes yourself.",
    steps: [
      ["Set both fees", "Pick Yummly’s fee, then pick QuickBite’s."],
      ["Read the receipt", "See what both platforms earned this week."],
      ["Check the theory", "The table on the right shows why one fee always wins."],
    ],
    color: "bg-quickbite",
  },
  2: {
    label: "Chapter 2 of 4",
    title: "The same game, ten weeks in a row",
    concept: "Repeated Prisoner’s Dilemma · Grim trigger · Discount factor · Folk Theorem",
    story:
      "Now you meet Yummly every week, and the relationship continues past this 10-week window. If you undercut once, it punishes you from then on. Does that change your choice?",
    steps: [
      ["Set future-focus", "How much do you care about next week?"],
      ["Run ten weeks", "Or play them yourself, one at a time."],
      ["Watch the scale", "It tips when the future outweighs today’s gain."],
    ],
    color: "bg-peace",
  },
  3: {
    label: "Chapter 3 of 4",
    title: "Picking a sale day without being read",
    concept: "Matching Pennies · Mixed-strategy Nash equilibrium",
    story:
      "QuickBite and Yummly each run one flash sale a week. Yummly wins when you pick the same day. You win when the days differ.",
    steps: [
      ["Pick Wednesday or Saturday", "Yummly watches your recent choices."],
      ["Check predictability", "A pattern lets the rival match you."],
      ["Try the fair coin", "A 50–50 mix leaves the rival nothing to read."],
    ],
    color: "bg-yummly",
  },
};

export function Guide({ chapter }: { chapter: number }) {
  const guide = guides[chapter];
  if (!guide) return null;

  return (
    <section className="mb-5 border-b border-ink/25 pb-4" aria-label="What is happening">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="max-w-[640px]">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            <span className={cn("h-2 w-2 rounded-full", guide.color)} />
            {guide.label}
            {guide.concept ? (
              <>
                <span className="text-muted">/</span>
                <span className="text-ink">{guide.concept}</span>
              </>
            ) : null}
          </div>
          <h1 className="mt-1 font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-bold leading-tight">
            {guide.title}
          </h1>
          <p className="mt-1 text-[13.5px] font-semibold leading-relaxed text-muted">
            {guide.story}
          </p>
        </div>
        <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
          <span className="text-ink">Left</span> = you play · <span className="text-ink">Right</span> =
          the theory
        </div>
      </div>

      <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-3">
        {guide.steps.map(([title, text], index) => (
          <li key={title} className="flex items-start gap-2.5">
            <span className="num flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-paper">
              {index + 1}
            </span>
            <span className="text-[12.5px] leading-snug">
              <strong className="font-extrabold">{title}.</strong>{" "}
              <span className="font-semibold text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
