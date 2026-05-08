import { FolderCheck, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useExpedientes } from "@/hooks/useExpedientes";
import type { Expediente } from "@/types/api";

const statusConfig = {
  completo: { label: "Completo", icon: CheckCircle, className: "text-success" },
  en_proceso: { label: "En Proceso", icon: Clock, className: "text-info" },
  incompleto: { label: "Incompleto", icon: AlertCircle, className: "text-destructive" },
};

export default function Expedientes() {
  const { data, isLoading, isError } = useExpedientes();
  const expedientes = data?.results ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expedientes</h1>
        <p className="text-sm text-muted-foreground">Estado consolidado por postulante</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando expedientes...</span>
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-destructive">
          Error al cargar. ¿Está el backend corriendo?
        </p>
      ) : expedientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
          <FolderCheck className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">No hay expedientes aún</p>
          <p className="mt-1 text-xs text-muted-foreground">Los expedientes se crean cuando un postulante aplica a una convocatoria</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expedientes.map((exp) => (
            <ExpedienteCard key={exp.id} expediente={exp} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExpedienteCard({ expediente }: { expediente: Expediente }) {
  const progress = Math.round(expediente.progreso_porcentaje);
  const config = statusConfig[expediente.estado] ?? statusConfig["en_proceso"];
  const Icon = config.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FolderCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">
              {expediente.postulante_nombre} {expediente.postulante_apellidos}
            </h3>
            <p className="text-xs text-muted-foreground">{expediente.convocatoria_titulo}</p>
          </div>
        </div>
        <Icon className={cn("h-5 w-5", config.className)} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progreso</span>
          <span className="font-medium text-foreground">
            {expediente.documentos_aprobados_count}/{expediente.documentos_count}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className={cn("text-xs font-medium", config.className)}>{config.label}</p>
      </div>
    </div>
  );
}
