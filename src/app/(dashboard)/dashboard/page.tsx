'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, Calendar, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useSupabase } from '@/lib/supabase/client';
import { format } from 'date-fns';
import Link from 'next/link';

export default function DashboardPage() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    activeOrders: 0,
    monthlySpend: 0,
    monthlyTrend: 0,
    upcomingDeliveries: [],
    recentOrders: [],
    upcomingGames: [],
    teamNutrition: { protein: 0, carbs: 0, fats: 0 }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setAnalytics({
        activeOrders: 3,
        monthlySpend: 12450,
        monthlyTrend: 12,
        upcomingDeliveries: [],
        recentOrders: [],
        upcomingGames: [],
        teamNutrition: { protein: 40, carbs: 30, fats: 30 }
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-white">Dashboard</h1>
        <p className="text-navy/60 dark:text-white/60 mt-1">
          Welcome back! Here's your team's nutrition overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="md-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-electric-blue/10 rounded-lg">
              <Package className="w-6 h-6 text-electric-blue" />
            </div>
            <span className="text-2xl font-bold">{analytics.activeOrders}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Active Orders</h3>
          <p className="text-xs text-navy/50 dark:text-white/50 mt-1">Currently in progress</p>
        </div>

        <div className="md-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-2xl font-bold">${analytics.monthlySpend.toLocaleString()}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Monthly Spend</h3>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-navy/50 dark:text-white/50">
              {analytics.monthlyTrend}% vs last month
            </span>
          </div>
        </div>

        <div className="md-card lg:col-span-2">
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60 mb-4">Team Nutrition Profile</h3>
          <div className="space-y-3">
            {Object.entries(analytics.teamNutrition).map(([macro, value]) => (
              <div key={macro}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{macro}</span>
                  <span className="font-medium">{value}%</span>
                </div>
                <div className="h-2 bg-smoke dark:bg-smoke/30 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${
                    macro === 'protein' ? 'bg-red-500' :
                    macro === 'carbs' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/new-order" className="md-filled-button text-center">Place New Order</Link>
        <Link href="/saved-templates" className="md-outlined-button text-center">Use Saved Template</Link>
        <Link href="/calendar" className="md-outlined-button text-center">View Team Calendar</Link>
        <Link href="/order-history" className="md-outlined-button text-center">Order History</Link>
      </div>
    </div>
  );
}