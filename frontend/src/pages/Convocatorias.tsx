
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Users, FileText, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useConvocatorias } from "@/hooks/useConvocatorias";
import type { Convocatoria } from "@/types/api";


export default function Convocatorias() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useConvocatorias({ archivado: false });
  const convocatorias = data?.results ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Convocatorias</h1>
          <p className="text-sm text-muted-foreground">Gestión de convocatorias de vinculación</p>
        </div>
        <Button onClick={() => navigate("/convocatorias/nueva")}>
          <Plus className="mr-2 h-4 w-4" />Nueva Convocatoria
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Cargando convocatorias...</span>
        </div>
      ) : isError ? (
        <p className="py-16 text-center text-sm text-destructive">
          Error al cargar. ¿Está el backend corriendo?
        </p>
      ) : convocatorias.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">No hay convocatorias aún</p>
          <p className="mt-1 text-xs text-muted-foreground">Crea la primera desde el botón "Nueva Convocatoria"</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {convocatorias.map((c) => (
            <ConvocatoriaCard key={c.id} convocatoria={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConvocatoriaCard({ convocatoria }: { convocatoria: Convocatoria }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/convocatorias/${convocatoria.id}`)}
      className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md cursor-pointer hover:border-primary/50"
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge variant={convocatoria.estado === "abierta" ? "default" : "secondary"}>
          {convocatoria.estado === "abierta" ? "Abierta" : "Cerrada"}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-card-foreground">{convocatoria.titulo}</h3>
      <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{convocatoria.descripcion}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {convocatoria.fecha_inicio}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {convocatoria.postulantes_count}
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {convocatoria.documentos_requeridos.length} docs
        </span>
      </div>
    </div>
  );
}
