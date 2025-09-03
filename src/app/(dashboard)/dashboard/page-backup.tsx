'use client';

import { memo, Suspense, lazy } from 'react';
import { TrendingUp, AlertTriangle, Package, DollarSign, Calendar, ChevronRight, Clock, MapPin, Users, Trophy, Target, AlertCircle, Star, Utensils, Activity, Zap } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/lib/design-system/components';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCriticalMetrics, useAnalyticsData, useStaticData, useUpcomingDeliveries, CriticalMetrics } from '@/lib/hooks/useDashboardData';
import { usePerformanceMonitor } from '@/lib/design-system/performance/performance-utils';
import { useResponsiveLayout } from '@/lib/hooks/useResponsiveLayout';
import { useKeyboardNavigation, useLiveRegion, useScreenReaderOptimization, useHighContrast } from '@/lib/hooks/useAccessibility';
import { useEffect } from 'react';

// This is the backup of the full-featured dashboard