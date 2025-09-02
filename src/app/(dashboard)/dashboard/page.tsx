'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, Calendar, ChevronRight, Clock, MapPin, Users, Trophy, Target, AlertCircle, Star, Utensils } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/lib/design-system/components';
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
                  ? 'bg-[var(--md-saas-color-warning-container)] text-[var(--md-saas-color-on-warning-container)]'
                  : 'bg-[var(--md-saas-color-info-container)] text-[var(--md-saas-color-on-info-container)]'
              }`}
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="md3-body-medium">
                <span className="sr-only">{alert.type === 'warning' ? 'Warning: ' : 'Information: '}</span>
                {alert.message}
              </span>
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
        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-primary-container)] rounded-lg">
              <Package className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            </div>
            <span className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">{analytics.activeOrders}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Active Orders</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-saas-color-success-container)] rounded-lg">
              <DollarSign className="w-5 h-5 text-[var(--md-saas-color-success)]" />
            </div>
            <span className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">${analytics.monthlySpend.toLocaleString()}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Monthly Spend</h3>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-[var(--md-saas-color-success)]" />
            <span className="md3-body-small text-[var(--md-saas-color-success)]">+{analytics.monthlyTrend}%</span>
          </div>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-secondary-container)] rounded-lg">
              <Users className="w-5 h-5 text-[var(--md-sys-color-secondary)]" />
            </div>
            <span className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">{analytics.totalTeamMembers}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Team Members</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-saas-color-warning-container)] rounded-lg">
              <Target className="w-5 h-5 text-[var(--md-saas-color-warning)]" />
            </div>
            <span className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">${analytics.averageOrderValue}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Avg Order</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-tertiary-container)] rounded-lg">
              <Star className="w-5 h-5 text-[var(--md-sys-color-tertiary)]" />
            </div>
            <span className="md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">{analytics.customerSatisfaction}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Satisfaction</h3>
        </Card>

        <Card variant="elevated" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-[var(--md-sys-color-error-container)] rounded-lg">
              <Utensils className="w-5 h-5 text-[var(--md-sys-color-error)]" />
            </div>
            <span className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">{analytics.recentOrders.length}</span>
          </div>
          <h3 className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface-variant)]">Recent Orders</h3>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Weekly Order Trends</h3>
              <div className="space-y-3">
                {analytics.weeklyOrders.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{day.day}</span>
                    <div className="flex items-center gap-2 flex-1 mx-3">
                      <div 
                        className="flex-1 h-2 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden"
                        role="progressbar"
                        aria-label={`${day.day} orders`}
                        aria-valuenow={day.orders}
                        aria-valuemin={0}
                        aria-valuemax={7}
                      >
                        <div
                          className="h-full bg-[var(--md-sys-color-primary)] transition-all duration-500"
                          style={{ width: `${(day.orders / 7) * 100}%` }}
                        />
                      </div>
                      <span className="md3-body-small font-medium w-6 text-[var(--md-sys-color-on-surface)]">{day.orders}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Nutrition Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Team Nutrition Profile</h3>
              <div className="space-y-4">
                {Object.entries(analytics.teamNutrition).map(([macro, value]) => (
                  <div key={macro}>
                    <div className="flex justify-between md3-body-small mb-2">
                      <span className="capitalize font-medium text-[var(--md-sys-color-on-surface)]">{macro}</span>
                      <span className="font-bold text-[var(--md-sys-color-on-surface)]">{value}%</span>
                    </div>
                    <div 
                      className="h-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label={`${macro} percentage`}
                      aria-valuenow={value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ delay: 0.5 + Object.keys(analytics.teamNutrition).indexOf(macro) * 0.1, duration: 0.8 }}
                        className={`h-full transition-all ${
                          macro === 'protein' ? 'bg-[var(--md-sys-color-error)]' :
                          macro === 'carbs' ? 'bg-[var(--md-saas-color-success)]' : 'bg-[var(--md-saas-color-warning)]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Most Popular Items</h3>
              <div className="space-y-3">
                {analytics.popularItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg">
                    <div>
                      <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">{item.name}</p>
                      <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{item.orders} orders</p>
                    </div>
                    <span className="md3-body-small font-medium text-[var(--md-saas-color-success)]">{item.trend}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deliveries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="md3-title-large font-semibold text-[var(--md-sys-color-on-surface)]">Upcoming Deliveries</h3>
                <Button 
                  variant="text" 
                  size="small" 
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  asChild
                >
                  <Link href="/order-history">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {analytics.upcomingDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-start gap-3 p-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-lg">
                    <div className="p-2 bg-[var(--md-sys-color-primary-container)] rounded-lg">
                      <Clock className="w-4 h-4 text-[var(--md-sys-color-primary)]" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">{format(delivery.date, 'MMM d, h:mm a')}</p>
                      <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mb-1">
                        {delivery.items.join(', ')}
                      </p>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-[var(--md-sys-color-on-surface-variant)]" aria-hidden="true" />
                        <span className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{delivery.location}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full md3-label-small font-medium ${
                      delivery.status === 'confirmed' 
                        ? 'bg-[var(--md-saas-color-success-container)] text-[var(--md-saas-color-on-success-container)]'
                        : 'bg-[var(--md-saas-color-warning-container)] text-[var(--md-saas-color-on-warning-container)]'
                    }`}>
                      {delivery.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card variant="elevated">
            <CardContent className="p-6">
              <h3 className="md3-title-large font-semibold mb-4 text-[var(--md-sys-color-on-surface)]">Recent Achievements</h3>
              <div className="space-y-3">
                {analytics.achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 bg-[var(--md-sys-color-tertiary-container)] rounded-lg">
                      <div className="p-2 bg-[var(--md-saas-color-warning-container)] rounded-lg">
                        <Icon className="w-5 h-5 text-[var(--md-saas-color-warning)]" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="md3-body-medium font-semibold text-[var(--md-sys-color-on-surface)]">{achievement.name}</p>
                        <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">{achievement.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Button variant="filled" fullWidth asChild>
          <Link href="/new-order">Place New Order</Link>
        </Button>
        <Button variant="outlined" fullWidth asChild>
          <Link href="/saved-templates">Use Saved Template</Link>
        </Button>
        <Button variant="outlined" fullWidth asChild>
          <Link href="/calendar">View Team Calendar</Link>
        </Button>
        <Button variant="outlined" fullWidth asChild>
          <Link href="/order-history">Order History</Link>
        </Button>
      </motion.div>
    </div>
  );
}