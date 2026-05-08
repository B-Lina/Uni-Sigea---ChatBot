/**
 * Hook React Query para estadísticas del Dashboard.
 * Usa dashboardService.getStats() → GET /api/dashboard/stats/
 */
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboardService";
import type { DashboardStats } from "@/types/api";

export const DASHBOARD_STATS_KEY = ["dashboard", "stats"] as const;

export function useDashboardStats() {
    return useQuery<DashboardStats, Error>({
        queryKey: DASHBOARD_STATS_KEY,
        queryFn: dashboardService.getStats,
        // Refrescar cada 60 segundos en la pantalla del dashboard
        refetchInterval: 60_000,
        staleTime: 30_000,
    });
}
