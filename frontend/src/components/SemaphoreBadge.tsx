import { cn } from "@/lib/utils";
import type { EstadoSemaforo } from "@/types/api";

const config: Record<EstadoSemaforo, { label: string; className: string }> = {
  verde: { label: "Vigente", className: "bg-semaphore-green text-success-foreground" },
  amarillo: { label: "Dudas", className: "bg-semaphore-yellow text-warning-foreground" },
  rojo: { label: "Vencido", className: "bg-semaphore-red text-destructive-foreground" },
};

export function SemaphoreBadge({ status, className }: { status: EstadoSemaforo; className?: string }) {
  const c = config[status] ?? config["amarillo"];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", c.className, className)}>
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {c.label}
    </span>
  );
}

