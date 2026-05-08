/**
 * Servicio para Convocatorias.
 * Endpoints: GET /api/convocatorias/ · POST /api/convocatorias/ · GET /api/convocatorias/{id}/
 */
import { apiClient } from "@/lib/api";
import type {
    Convocatoria,
    ConvocatoriaCreate,
    PaginatedResponse,
} from "@/types/api";

export const convocatoriasService = {
    /**
     * Lista todas las convocatorias (paginado).
     * GET /api/convocatorias/
     */
    getAll: (filtros?: { estado?: string; archivado?: boolean }): Promise<PaginatedResponse<Convocatoria>> => {
        const params = new URLSearchParams();
        if (filtros?.estado) params.append('estado', filtros.estado);
        if (filtros?.archivado !== undefined) {
            // some backends expect 1/0 for boolean filters, so send numeric
            params.append('archivado', filtros.archivado ? '1' : '0');
        }
        const query = params.toString();
        return apiClient.get<PaginatedResponse<Convocatoria>>(
            `/convocatorias/${query ? `?${query}` : ''}`
        );
    },

    /**
     * Obtiene una convocatoria por ID.
     * GET /api/convocatorias/{id}/
     */
    getById: (id: number): Promise<Convocatoria> =>
        apiClient.get<Convocatoria>(`/convocatorias/${id}/`),

    /**
     * Recupera todos los detalles (incluye requisitos y postulantes) mediante
     * el endpoint especial /convocatorias/{id}/detalles/.
     */
    getDetails: (id: number): Promise<Convocatoria> =>
        apiClient.get<Convocatoria>(`/convocatorias/${id}/detalles/`),

    /**
     * Crea una nueva convocatoria.
     * POST /api/convocatorias/
     */
    create: (data: ConvocatoriaCreate): Promise<Convocatoria> =>
        apiClient.post<Convocatoria>("/convocatorias/", data),

    /**
     * Actualiza parcialmente una convocatoria.
     * PATCH /api/convocatorias/{id}/
     */
    // Partial ConvocatoriaCreate already includes archivado now
    update: (id: number, data: Partial<ConvocatoriaCreate>): Promise<Convocatoria> =>
        apiClient.patch<Convocatoria>(`/convocatorias/${id}/`, data),
};
