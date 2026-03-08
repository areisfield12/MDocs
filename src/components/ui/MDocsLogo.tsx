import { cn } from "@/lib/utils";

interface MDocsLogoProps {
  size?: number;
  className?: string;
}

export function MDocsMark({ size = 44, className }: MDocsLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="44" height="44" rx="10" fill="#1f1f1f" />
      <rect x="8" y="11" width="28" height="3.5" rx="1.75" fill="white" />
      <rect x="8" y="20" width="21" height="3.5" rx="1.75" fill="white" />
      <rect x="8" y="29" width="24" height="3.5" rx="1.75" fill="#444" />
    </svg>
  );
}

interface MDocsWordmarkProps {
  size?: number;
  className?: string;
  variant?: "dark" | "light";
}

export function MDocsLogo({ size = 44, className, variant = "dark" }: MDocsWordmarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <MDocsMark size={size} />
      <span
        className={cn(
          "font-extrabold uppercase tracking-wide",
          variant === "dark" ? "text-white" : "text-gray-900"
        )}
        style={{ fontSize: size * 0.72 }}
      >
        Commit
      </span>
    </div>
  );
}
