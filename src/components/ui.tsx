import type { HTMLAttributes, ReactNode } from "react";
import { Bike, CircleCheck, ReceiptText, Store, Utensils } from "lucide-react";
import { cn } from "../utils/cn";

export function Card({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card", className)} {...props}>
      {children}
    </div>
  );
}

export function PanelHead({
  kicker,
  title,
  meta,
  right,
  accent = "quickbite",
}: {
  kicker: string;
  title: string;
  meta?: string;
  right?: ReactNode;
  accent?: "quickbite" | "yummly" | "ink";
}) {
  const dot =
    accent === "yummly" ? "bg-yummly" : accent === "ink" ? "bg-ink" : "bg-quickbite";
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b-[1.5px] border-ink pb-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("inline-block h-2 w-2 rounded-full", dot)} />
          <span className="font-mono text-[12.5px] font-bold uppercase tracking-[0.17em] text-muted">
            {kicker}
          </span>
        </div>
        <h2 className="mt-1 font-display text-[clamp(1.15rem,2.1vw,1.5rem)] font-bold leading-tight">
          {title}
        </h2>
        {meta ? <p className="mt-1 text-[12px] leading-snug text-muted">{meta}</p> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

const stampTones: Record<string, string> = {
  ink: "border-ink bg-paper text-ink",
  peace: "border-peace bg-peace text-white",
  warn: "border-warn bg-warn text-white",
  war: "border-quickbite bg-quickbite text-white",
  yummly: "border-yummly bg-yummly text-white",
  muted: "border-muted bg-canvas text-ink",
};

export function Stamp({
  children,
  tone = "warn",
  className,
  animate = false,
}: {
  children: ReactNode;
  tone?: "ink" | "peace" | "warn" | "war" | "yummly" | "muted";
  className?: string;
  animate?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[4px] border-[1.5px] px-2 py-1 font-mono text-[12px] font-bold uppercase leading-none tracking-[0.13em]",
        stampTones[tone],
        animate && "stamp-in",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "quickbite" | "yummly" | "peace" | "warn";
  className?: string;
}) {
  const tones = {
    neutral: "border-ink/25 bg-canvas text-ink",
    quickbite: "border-quickbite/40 bg-quickbite-soft text-quickbite",
    yummly: "border-yummly/35 bg-yummly-soft text-yummly",
    peace: "border-peace/35 bg-peace-soft text-peace",
    warn: "border-warn/35 bg-warn-soft text-[#9a5705]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[12.5px] font-bold leading-tight",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Meter({
  value,
  tone = "quickbite",
  className,
  height = "h-2.5",
  label,
}: {
  value: number;
  tone?: "quickbite" | "yummly" | "peace" | "warn" | "ink";
  className?: string;
  height?: string;
  label?: string;
}) {
  const colors = {
    quickbite: "bg-quickbite",
    yummly: "bg-yummly",
    peace: "bg-peace",
    warn: "bg-warn",
    ink: "bg-ink",
  };
  return (
    <div
      className={cn("overflow-hidden rounded-full border-[1.5px] border-ink bg-canvas", height, className)}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Divider({ label }: { label?: string }) {
  if (!label) return <div className="my-3 border-t-[1.5px] border-dashed border-ink/25" />;
  return (
    <div className="my-3 flex items-center gap-2">
      <div className="h-px flex-1 border-t-[1.5px] border-dashed border-ink/25" />
      <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.16em] text-muted">
        {label}
      </span>
      <div className="h-px flex-1 border-t-[1.5px] border-dashed border-ink/25" />
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

export function KeyHint({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12.5px] font-bold text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}

export function BrandMark({
  who,
  size = "md",
}: {
  who: "quickbite" | "yummly";
  size?: "sm" | "md" | "lg";
}) {
  const isQ = who === "quickbite";
  const dims =
    size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "lg" ? 22 : size === "sm" ? 15 : 18;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border-[1.5px] border-ink shadow-[2px_2px_0_#16161A]",
        dims,
        isQ ? "bg-quickbite text-white" : "bg-yummly text-white"
      )}
      aria-hidden="true"
    >
      {isQ ? <Bike size={icon} strokeWidth={2.4} /> : <Utensils size={icon} strokeWidth={2.4} />}
    </span>
  );
}

export function PlatformLabel({
  who,
  detail,
}: {
  who: "quickbite" | "yummly";
  detail?: string;
}) {
  const isQ = who === "quickbite";
  return (
    <div className="flex items-center gap-2">
      <BrandMark who={who} size="sm" />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-[13px] font-bold leading-none">
            {isQ ? "QuickBite" : "Yummly"}
          </span>
          {isQ ? (
            <span className="rounded-[3px] border border-ink/30 bg-canvas px-1 py-[1px] font-mono text-[10px] font-bold uppercase tracking-wide">
              You
            </span>
          ) : (
            <Store size={10} className="text-yummly" />
          )}
        </div>
        {detail ? (
          <span className="mt-[2px] block font-mono text-[11.5px] uppercase tracking-wide text-muted">
            {detail}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function ReceiptHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <div className="flex items-center gap-1.5">
          <ReceiptText size={13} strokeWidth={2.4} />
          <span className="font-mono text-[12.5px] font-bold uppercase tracking-[0.14em]">
            {title}
          </span>
        </div>
        <p className="mt-1 max-w-[290px] font-mono text-[11.5px] leading-relaxed text-muted">
          {meta}
        </p>
      </div>
      <div className="paper-strip h-8 w-12 opacity-80" aria-hidden="true" />
    </div>
  );
}

export function ToastNote({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "peace" | "warn" | "quickbite" | "yummly";
  className?: string;
}) {
  const tones = {
    neutral: "border-l-ink bg-transparent",
    peace: "border-l-peace bg-transparent",
    warn: "border-l-warn bg-transparent",
    quickbite: "border-l-quickbite bg-transparent",
    yummly: "border-l-yummly bg-transparent",
  };
  return (
    <div
      className={cn(
        "flex items-start gap-2 border-l-[3px] px-3 py-2 text-[11.5px] font-semibold leading-relaxed",
        tones[tone],
        className
      )}
      role="status"
    >
      {children}
    </div>
  );
}

export function CheckMark({ done }: { done: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 items-center justify-center rounded-full border",
        done ? "border-peace bg-peace text-white" : "border-ink/20 bg-canvas text-transparent"
      )}
      aria-hidden="true"
    >
      <CircleCheck size={10} strokeWidth={3} />
    </span>
  );
}
