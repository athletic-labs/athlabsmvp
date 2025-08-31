'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, Calendar, ChevronRight, Clock, MapPin, Users, Trophy, Target, AlertCircle, Star, Utensils } from 'lucide-react';
import { useSupabase } from '@/lib/supabase/client';
import { format, subDays, subMonths } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    activeOrders: 0,
    monthlySpend: 0,
    monthlyTrend: 0,
    totalTeamMembers: 0,
    averageOrderValue: 0,
    customerSatisfaction: 0,
    upcomingDeliveries: [] as any[],
    recentOrders: [] as any[],
    upcomingGames: [] as any[],
    teamNutrition: { protein: 0, carbs: 0, fats: 0 },
    popularItems: [] as any[],
    weeklyOrders: [] as any[],
    alerts: [] as any[],
    achievements: [] as any[]
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock enhanced analytics data
      setAnalytics({
        activeOrders: 7,
        monthlySpend: 18750,
        monthlyTrend: 15.3,
        totalTeamMembers: 28,
        averageOrderValue: 945,
        customerSatisfaction: 4.8,
        upcomingDeliveries: [
          {
            id: '1',
            date: new Date(),
            items: ['Team Breakfast Package', 'Recovery Smoothies'],
            location: 'Athletic Training Center',
            status: 'confirmed'
          },
          {
            id: '2', 
            date: subDays(new Date(), -2),
            items: ['Pre-Game Fuel Package'],
            location: 'Stadium East',
            status: 'preparing'
          }
        ],
        recentOrders: [
          {
            id: 'ord_001',
            date: subDays(new Date(), 1),
            total: 1250.50,
            items: 4,
            status: 'delivered'
          },
          {
            id: 'ord_002',
            date: subDays(new Date(), 3),
            total: 890.00,
            items: 3,
            status: 'delivered'
          }
        ],
        upcomingGames: [
          {
            id: 'game_1',
            opponent: 'State University',
            date: subDays(new Date(), -3),
            location: 'Home Stadium',
            type: 'Conference'
          }
        ],
        teamNutrition: { protein: 35, carbs: 45, fats: 20 },
        popularItems: [
          { name: 'Power Smoothie Bowl', orders: 24, trend: '+12%' },
          { name: 'Protein Recovery Bars', orders: 18, trend: '+8%' },
          { name: 'Pre-Workout Fuel', orders: 15, trend: '+5%' }
        ],
        weeklyOrders: [
          { day: 'Mon', orders: 3 },
          { day: 'Tue', orders: 5 },
          { day: 'Wed', orders: 2 },
          { day: 'Thu', orders: 7 },
          { day: 'Fri', orders: 4 },
          { day: 'Sat', orders: 1 },
          { day: 'Sun', orders: 0 }
        ],
        alerts: [
          {
            type: 'info',
            message: 'New seasonal menu items available for spring training'
          },
          {
            type: 'warning', 
            message: 'Delivery address verification required for next order'
          }
        ],
        achievements: [
          { name: 'Consistent Nutrition', description: '7 days of consistent team ordering', icon: Trophy },
          { name: 'Budget Champion', description: 'Stayed under budget 3 months in a row', icon: Target }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white">Team Dashboard</h1>
          <p className="text-navy/60 dark:text-white/60 mt-1">
            Monitor your team's nutrition performance and ordering analytics
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <span className="text-sm text-navy/60 dark:text-white/60">Last updated:</span>
          <span className="text-sm font-medium">{format(new Date(), 'MMM d, h:mm a')}</span>
        </div>
      </motion.div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {analytics.alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg flex items-start gap-3 ${
                alert.type === 'warning'
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <div className="md-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-2xl font-bold">{analytics.activeOrders}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Active Orders</h3>
        </div>

        <div className="md-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-xl font-bold">${analytics.monthlySpend.toLocaleString()}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Monthly Spend</h3>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500">+{analytics.monthlyTrend}%</span>
          </div>
        </div>

        <div className="md-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-2xl font-bold">{analytics.totalTeamMembers}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Team Members</h3>
        </div>

        <div className="md-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-xl font-bold">${analytics.averageOrderValue}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Avg Order</h3>
        </div>

        <div className="md-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-2xl font-bold">{analytics.customerSatisfaction}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Satisfaction</h3>
        </div>

        <div className="md-card">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Utensils className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xl font-bold">{analytics.recentOrders.length}</span>
          </div>
          <h3 className="text-sm font-medium text-navy/60 dark:text-white/60">Recent Orders</h3>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md-card"
        >
          <h3 className="text-lg font-semibold mb-4">Weekly Order Trends</h3>
          <div className="space-y-3">
            {analytics.weeklyOrders.map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <span className="text-sm text-navy/60 dark:text-white/60">{day.day}</span>
                <div className="flex items-center gap-2 flex-1 mx-3">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(day.orders / 7) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-6">{day.orders}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team Nutrition Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md-card"
        >
          <h3 className="text-lg font-semibold mb-4">Team Nutrition Profile</h3>
          <div className="space-y-4">
            {Object.entries(analytics.teamNutrition).map(([macro, value]) => (
              <div key={macro}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="capitalize font-medium">{macro}</span>
                  <span className="font-bold">{value}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ delay: 0.5 + Object.keys(analytics.teamNutrition).indexOf(macro) * 0.1, duration: 0.8 }}
                    className={`h-full transition-all ${
                      macro === 'protein' ? 'bg-red-500' :
                      macro === 'carbs' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Popular Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md-card"
        >
          <h3 className="text-lg font-semibold mb-4">Most Popular Items</h3>
          <div className="space-y-3">
            {analytics.popularItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-navy/60 dark:text-white/60">{item.orders} orders</p>
                </div>
                <span className="text-xs font-medium text-green-600">{item.trend}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="md-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Deliveries</h3>
            <Link href="/order-history" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {analytics.upcomingDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{format(delivery.date, 'MMM d, h:mm a')}</p>
                  <p className="text-xs text-navy/60 dark:text-white/60 mb-1">
                    {delivery.items.join(', ')}
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-navy/40" />
                    <span className="text-xs text-navy/60 dark:text-white/60">{delivery.location}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  delivery.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                }`}>
                  {delivery.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="md-card"
        >
          <h3 className="text-lg font-semibold mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {analytics.achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Icon className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{achievement.name}</p>
                    <p className="text-xs text-navy/60 dark:text-white/60">{achievement.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Link href="/new-order" className="md-filled-button text-center">
          Place New Order
        </Link>
        <Link href="/saved-templates" className="md-outlined-button text-center">
          Use Saved Template
        </Link>
        <Link href="/calendar" className="md-outlined-button text-center">
          View Team Calendar
        </Link>
        <Link href="/order-history" className="md-outlined-button text-center">
          Order History
        </Link>
      </motion.div>
    </div>
  );
}