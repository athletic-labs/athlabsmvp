import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/lib/supabase/client';
import { subDays, addDays } from 'date-fns';

// Split data by update frequency and criticality
export interface CriticalMetrics {
  activeOrdersCount: number;
  todayDeliveries: number;
  nextGameHours?: number;
  teamReadinessScore: number;
  criticalAlerts: Alert[];
}

export interface AnalyticsData {
  monthlySpend: number;
  monthlySpendBudget: number;
  monthlyTrend: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  teamNutrition: { protein: number; carbs: number; fats: number };
  weeklyOrderTrends: Array<{ day: string; orders: number }>;
}

export interface StaticData {
  totalTeamMembers: number;
  achievements: Achievement[];
  popularItems: PopularItem[];
  upcomingGames: GameInfo[];
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  actionRequired: boolean;
  href?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: any;
  earnedAt: string;
}

export interface PopularItem {
  name: string;
  orders: number;
  trend: string;
  category: string;
}

export interface GameInfo {
  id: string;
  opponent: string;
  date: Date;
  location: string;
  type: 'Conference' | 'Exhibition' | 'Tournament';
  isHome: boolean;
}

export interface UpcomingDelivery {
  id: string;
  date: Date;
  scheduledTime: string;
  items: string[];
  location: string;
  status: 'confirmed' | 'preparing' | 'in-transit' | 'delivered';
  estimatedTime?: string;
  recipients: number;
}

// Critical data hook - updates every 30 seconds for real-time awareness
export function useCriticalMetrics() {
  const [data, setData] = useState<CriticalMetrics>({
    activeOrdersCount: 0,
    todayDeliveries: 0,
    teamReadinessScore: 0,
    criticalAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCriticalData = async () => {
      try {
        // Simulate optimized critical data fetch
        const criticalData: CriticalMetrics = {
          activeOrdersCount: 7,
          todayDeliveries: 3,
          nextGameHours: 72, // 3 days until next game
          teamReadinessScore: 92, // Calculated score based on nutrition + order status
          criticalAlerts: [
            {
              id: '1',
              type: 'warning',
              message: 'Delivery address verification required for tomorrow\'s order',
              actionRequired: true,
              href: '/order-history?verify=pending'
            }
          ]
        };
        
        setData(criticalData);
        setError(null);
      } catch (err) {
        setError('Failed to load critical metrics');
        console.error('Critical metrics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCriticalData();
    
    // Update critical data every 30 seconds
    const interval = setInterval(fetchCriticalData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}

// Analytics data hook - cached for 5 minutes, non-blocking
export function useAnalyticsData() {
  const [data, setData] = useState<AnalyticsData>({
    monthlySpend: 18750,
    monthlySpendBudget: 25000,
    monthlyTrend: 15.3,
    averageOrderValue: 945,
    customerSatisfaction: 4.8,
    teamNutrition: { protein: 35, carbs: 45, fats: 20 },
    weeklyOrderTrends: [
      { day: 'Mon', orders: 3 },
      { day: 'Tue', orders: 5 },
      { day: 'Wed', orders: 2 },
      { day: 'Thu', orders: 7 },
      { day: 'Fri', orders: 4 },
      { day: 'Sat', orders: 1 },
      { day: 'Sun', orders: 0 }
    ]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check cache first
    const cached = sessionStorage.getItem('dashboard-analytics');
    const cacheTime = sessionStorage.getItem('dashboard-analytics-time');
    
    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime);
      if (age < 5 * 60 * 1000) { // 5 minutes
        setData(JSON.parse(cached));
        return;
      }
    }

    // Fetch fresh data
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100)); // Fast response
        
        sessionStorage.setItem('dashboard-analytics', JSON.stringify(data));
        sessionStorage.setItem('dashboard-analytics-time', Date.now().toString());
      } catch (err) {
        console.error('Analytics data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Memoized calculations for expensive operations
  const budgetUtilization = useMemo(() => 
    (data.monthlySpend / data.monthlySpendBudget) * 100, 
    [data.monthlySpend, data.monthlySpendBudget]
  );

  const nutritionBalance = useMemo(() => {
    const { protein, carbs, fats } = data.teamNutrition;
    const total = protein + carbs + fats;
    return {
      isBalanced: Math.abs(protein - 30) < 10 && Math.abs(carbs - 40) < 15,
      recommendations: total < 90 ? ['Increase overall nutrition tracking'] : []
    };
  }, [data.teamNutrition]);

  return { 
    data, 
    loading, 
    computed: { budgetUtilization, nutritionBalance }
  };
}

// Static data hook - loaded once and cached indefinitely
export function useStaticData() {
  const [data, setData] = useState<StaticData>({
    totalTeamMembers: 28,
    achievements: [
      { 
        id: '1',
        name: 'Consistent Nutrition', 
        description: '7 days of consistent team ordering',
        icon: 'Trophy',
        earnedAt: new Date().toISOString()
      }
    ],
    popularItems: [
      { name: 'Power Smoothie Bowl', orders: 24, trend: '+12%', category: 'Breakfast' },
      { name: 'Protein Recovery Bars', orders: 18, trend: '+8%', category: 'Snacks' }
    ],
    upcomingGames: [
      {
        id: 'game_1',
        opponent: 'State University',
        date: addDays(new Date(), 3),
        location: 'Home Stadium',
        type: 'Conference',
        isHome: true
      }
    ]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if data is already cached
    const cached = localStorage.getItem('dashboard-static-data');
    if (cached) {
      setData(JSON.parse(cached));
      return;
    }

    // Load static data once
    const fetchStaticData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 50));
        localStorage.setItem('dashboard-static-data', JSON.stringify(data));
      } finally {
        setLoading(false);
      }
    };

    fetchStaticData();
  }, []);

  return { data, loading };
}

// Upcoming deliveries with intelligent loading
export function useUpcomingDeliveries() {
  const [deliveries, setDeliveries] = useState<UpcomingDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // Mock enhanced delivery data with real-time status
        const mockDeliveries: UpcomingDelivery[] = [
          {
            id: '1',
            date: new Date(),
            scheduledTime: new Date().toISOString(),
            items: ['Team Breakfast Package', 'Recovery Smoothies'],
            location: 'Athletic Training Center',
            status: 'confirmed',
            estimatedTime: '8:00 AM',
            recipients: 28
          },
          {
            id: '2',
            date: addDays(new Date(), 2),
            scheduledTime: addDays(new Date(), 2).toISOString(),
            items: ['Pre-Game Fuel Package'],
            location: 'Stadium East',
            status: 'preparing',
            estimatedTime: '2:00 PM',
            recipients: 28
          }
        ];
        
        setDeliveries(mockDeliveries);
      } catch (error) {
        console.error('Error loading deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Only show today + next 7 days for cognitive load management
  const relevantDeliveries = useMemo(() => 
    deliveries.filter(delivery => {
      const now = new Date();
      const sevenDaysFromNow = addDays(new Date(), 7);
      return delivery.date >= now && delivery.date <= sevenDaysFromNow;
    }),
    [deliveries]
  );

  return { deliveries: relevantDeliveries, loading };
}