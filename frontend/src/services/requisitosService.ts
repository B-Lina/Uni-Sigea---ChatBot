
/**
 * Servicio mínimo para documentos requeridos (requisitos).
 * Endpoint utilizado principalmente para crear nuevos.
 */
import { apiClient } from "@/lib/api";
import type { DocumentoRequerido, DocumentoRequeridoCreate } from "@/types/api";

export const requisitosService = {
    /**
     * Crea un nuevo documento requerido.
     * POST /api/documentos-requeridos/
     */
    create: (data: DocumentoRequeridoCreate): Promise<DocumentoRequerido> =>
        apiClient.post<DocumentoRequerido>("/documentos-requeridos/", data),

    /**
     * Actualiza un requisito existente.
     * PATCH /api/documentos-requeridos/{id}/
     */
    update: (
        id: number,
        data: Partial<DocumentoRequeridoCreate>
    ): Promise<DocumentoRequerido> =>
        apiClient.patch<DocumentoRequerido>(`/documentos-requeridos/${id}/`, data),

    /**
     * Elimina un requisito.
     * DELETE /api/documentos-requeridos/{id}/
     */
    remove: (id: number): Promise<void> =>
        apiClient.delete<void>(`/documentos-requeridos/${id}/`),
};
