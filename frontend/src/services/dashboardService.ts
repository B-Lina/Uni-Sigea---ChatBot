/**
 * Servicio para estadísticas del Dashboard y salud de la API.
 * Endpoints: GET /api/dashboard/stats/ · GET /api/health/
 */
import { apiClient } from "@/lib/api";
import type { DashboardStats, ApiHealth } from "@/types/api";

export const dashboardService = {
    /**
     * Obtiene las estadísticas agregadas para el dashboard.
     * GET /api/dashboard/stats/
     */
    getStats: (): Promise<DashboardStats> =>
        apiClient.get<DashboardStats>("/dashboard/stats/"),

    /**
     * Verifica que la API está operativa.
     * GET /api/health/
     */
    getHealth: (): Promise<ApiHealth> =>
        apiClient.get<ApiHealth>("/health/"),
};
