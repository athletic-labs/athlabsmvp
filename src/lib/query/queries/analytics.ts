import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-client';

// Types
interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentOrders: Array<{
    id: string;
    order_number: string;
    contact_name: string;
    delivery_date: string;
    total_amount: number;
    status: string;
  }>;
  monthlyData: Array<{
    month: string;
    orders: number;
    revenue: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

interface TeamAnalytics {
  teamId: string;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  rushOrders: number;
  lastOrderDate: string;
  analyticsMonth: string;
}

// API functions
const analyticsApi = {
  async getDashboardMetrics(teamId?: string): Promise<DashboardMetrics> {
    const params = new URLSearchParams();
    if (teamId) params.append('teamId', teamId);

    const response = await fetch(`/api/analytics/dashboard?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  async getTeamAnalytics(teamId: string): Promise<TeamAnalytics> {
    const response = await fetch(`/api/analytics/team/${teamId}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch team analytics: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },

  async getOrderTrends(days: number = 30): Promise<Array<{
    date: string;
    orders: number;
    revenue: number;
  }>> {
    const response = await fetch(`/api/analytics/trends?days=${days}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order trends: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  },
};

// Query hooks
export function useDashboardMetrics(teamId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboardMetrics(teamId),
    queryFn: () => analyticsApi.getDashboardMetrics(teamId),
    staleTime: 1000 * 60 * 2, // Dashboard data refreshes every 2 minutes
    gcTime: 1000 * 60 * 10, // Keep for 10 minutes
    refetchOnWindowFocus: true, // Refresh when user comes back
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}

export function useTeamAnalytics(teamId: string) {
  return useQuery({
    queryKey: queryKeys.ordersAnalytics(teamId),
    queryFn: () => analyticsApi.getTeamAnalytics(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // Team analytics are less volatile
    gcTime: 1000 * 60 * 15,
  });
}

export function useOrderTrends(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'trends', days],
    queryFn: () => analyticsApi.getOrderTrends(days),
    staleTime: 1000 * 60 * 10, // Trends data is fairly stable
    gcTime: 1000 * 60 * 30,
  });
}

// Real-time updates for critical metrics
export function useRealtimeDashboard(teamId?: string) {
  return useQuery({
    queryKey: [...queryKeys.dashboardMetrics(teamId), 'realtime'],
    queryFn: () => analyticsApi.getDashboardMetrics(teamId),
    staleTime: 1000 * 30, // Realtime updates - 30 seconds
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60, // Refresh every minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}