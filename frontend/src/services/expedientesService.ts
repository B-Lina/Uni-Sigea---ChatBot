/**
 * Servicio para Expedientes.
 * Endpoints: GET /api/expedientes/ · GET /api/expedientes/{id}/
 */
import { apiClient } from "@/lib/api";
import type { Expediente, PaginatedResponse } from "@/types/api";

export interface ExpedientesFiltros {
    postulante?: number;
    convocatoria?: number;
    estado?: string;
}

export const expedientesService = {
    /**
     * Lista expedientes con filtros opcionales.
     * GET /api/expedientes/?postulante=&convocatoria=&estado=
     */
    getAll: (filtros?: ExpedientesFiltros): Promise<PaginatedResponse<Expediente>> => {
        const params = new URLSearchParams();
        if (filtros?.postulante) params.append("postulante", String(filtros.postulante));
        if (filtros?.convocatoria) params.append("convocatoria", String(filtros.convocatoria));
        if (filtros?.estado) params.append("estado", filtros.estado);
        const query = params.toString();
        return apiClient.get<PaginatedResponse<Expediente>>(
            `/expedientes/${query ? `?${query}` : ""}`
        );
    },

    /**
     * Obtiene un expediente por ID.
     * GET /api/expedientes/{id}/
     */
    getById: (id: number): Promise<Expediente> =>
        apiClient.get<Expediente>(`/expedientes/${id}/`),

    /**
     * Crea un nuevo expediente (normalmente usado tras registrar un postulante).
     * POST /api/expedientes/
     */
    create: (data: { postulante: number; convocatoria: number }): Promise<Expediente> =>
        apiClient.post<Expediente>(`/expedientes/`, data),
};
