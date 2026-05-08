/**
 * Hooks React Query para Convocatorias.
 *
 * useConvocatorias()     → lista todas las convocatorias (GET)
 * useConvocatoria(id)    → detalle de una convocatoria (GET)
 * useCrearConvocatoria() → mutation POST
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { convocatoriasService } from "@/services/convocatoriasService";
import type { Convocatoria, ConvocatoriaCreate } from "@/types/api";

export const CONVOCATORIAS_KEY = ["convocatorias"] as const;

// ── Lista ─────────────────────────────────────────────────────────────────────
export function useConvocatorias(filtros?: { estado?: string; archivado?: boolean }) {
    return useQuery({
        queryKey: [...CONVOCATORIAS_KEY, filtros],
        queryFn: () => convocatoriasService.getAll(filtros),
        staleTime: 30_000,
    });
}

// ── Detalle ───────────────────────────────────────────────────────────────────
export function useConvocatoria(id: number) {
    return useQuery({
        queryKey: [...CONVOCATORIAS_KEY, id],
        queryFn: () => convocatoriasService.getDetails(id),
        enabled: !!id,
    });
}

// ── Mutation: crear convocatoria ──────────────────────────────────────────────
export function useCrearConvocatoria() {
    const queryClient = useQueryClient();

    return useMutation<Convocatoria, Error, ConvocatoriaCreate>({
        mutationFn: convocatoriasService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CONVOCATORIAS_KEY });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}

// ── Mutation: actualizar convocatoria ───────────────────────────────────────────
export function useActualizarConvocatoria() {
    const queryClient = useQueryClient();

    return useMutation<Convocatoria, Error, {id: number; data: Partial<ConvocatoriaCreate>}>(
        {
            mutationFn: ({id,data}) => convocatoriasService.update(id,data),
            onSuccess: (_, datos) => {
                queryClient.invalidateQueries({ queryKey: CONVOCATORIAS_KEY });
                queryClient.invalidateQueries({ queryKey: [...CONVOCATORIAS_KEY, datos.id] });
                queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            },
        }
    );
}
