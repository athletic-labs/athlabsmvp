'use client';

import { memo } from 'react';
import { Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, Button } from '@/lib/design-system/components';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TeamNutritionPanelProps {
  nutrition: { protein: number; carbs: number; fats: number };
  balance: {
    isBalanced: boolean;
    recommendations: string[];
  };
  loading: boolean;
}

const TeamNutritionPanel = memo(function TeamNutritionPanel({ 
  nutrition, 
  balance, 
  loading 
}: TeamNutritionPanelProps) {
  
  if (loading) {
    return (
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4" aria-hidden="true">
            <div className="h-6 bg-[var(--md-sys-color-surface-container)] rounded w-2/3"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-[var(--md-sys-color-surface-container)] rounded w-1/2"></div>
                  <div className="h-3 bg-[var(--md-sys-color-surface-container)] rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const macroData = [
    { name: 'Protein', value: nutrition.protein, color: 'var(--md-sys-color-primary)', target: 30 },
    { name: 'Carbs', value: nutrition.carbs, color: '#1a2332', target: 40 }, // Navy for brand emphasis
    { name: 'Fats', value: nutrition.fats, color: 'var(--md-sys-color-secondary)', target: 30 }
  ];

  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="md3-title-large font-semibold text-[var(--md-sys-color-on-surface)]">
            Nutrition Balance
          </h3>
          <div className="flex items-center gap-2">
            {balance.isBalanced ? (
              <CheckCircle className="w-5 h-5 text-[var(--md-saas-color-success)]" aria-label="Nutrition is balanced" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[var(--md-saas-color-warning)]" aria-label="Nutrition needs attention" />
            )}
            <span className={`md3-body-small font-medium ${
              balance.isBalanced 
                ? 'text-[var(--md-saas-color-success)]' 
                : 'text-[var(--md-saas-color-warning)]'
            }`}>
              {balance.isBalanced ? 'Optimal' : 'Review Needed'}
            </span>
          </div>
        </div>

        <div className="space-y-4" role="img" aria-labelledby="nutrition-description">
          <div id="nutrition-description" className="sr-only">
            Team nutrition breakdown showing protein at {nutrition.protein}%, 
            carbohydrates at {nutrition.carbs}%, and fats at {nutrition.fats}%
          </div>
          
          {macroData.map((macro, index) => {
            const isOnTarget = Math.abs(macro.value - macro.target) <= 5;
            
            return (
              <div key={macro.name}>
                <div className="flex justify-between md3-body-small mb-2">
                  <div className="flex items-center gap-2">
                    <span className="capitalize font-medium text-[var(--md-sys-color-on-surface)]">
                      {macro.name}
                    </span>
                    {!isOnTarget && (
                      <AlertTriangle 
                        className="w-3 h-3 text-[var(--md-saas-color-warning)]" 
                        aria-label={`${macro.name} not on target`}
                      />
                    )}
                  </div>
                  <span className="font-bold text-[var(--md-sys-color-on-surface)]">
                    {macro.value}%
                    <span className="text-[var(--md-sys-color-on-surface-variant)] font-normal ml-1">
                      (target: {macro.target}%)
                    </span>
                  </span>
                </div>
                <div 
                  className="h-3 bg-[var(--md-sys-color-surface-container-highest)] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-label={`${macro.name} percentage: ${macro.value}% of recommended ${macro.target}%`}
                  aria-valuenow={macro.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${macro.value}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                    className="h-full"
                    style={{ backgroundColor: macro.color }}
                  />
                  {/* Target indicator */}
                  <div 
                    className="absolute top-0 w-0.5 h-full bg-[var(--md-sys-color-on-surface)] opacity-60"
                    style={{ left: `${macro.target}%`, transform: 'translateX(-50%)' }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        {balance.recommendations.length > 0 && (
          <div className="mt-4 p-3 bg-[var(--md-saas-color-info-container)] rounded-lg">
            <h4 className="md3-body-medium font-medium text-[var(--md-saas-color-on-info-container)] mb-2">
              Recommendations
            </h4>
            <ul className="space-y-1" role="list">
              {balance.recommendations.map((rec, index) => (
                <li key={index} className="md3-body-small text-[var(--md-saas-color-on-info-container)]">
                  • {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <Button 
            variant="outlined" 
            size="small" 
            fullWidth
            asChild
          >
            <Link href="/nutrition-goals">Adjust Nutrition Goals</Link>
          </Button>
        </div>

        {/* Accessible data table for screen readers */}
        <table className="sr-only" aria-label="Nutrition breakdown data">
          <thead>
            <tr>
              <th>Macronutrient</th>
              <th>Current %</th>
              <th>Target %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {macroData.map(macro => {
              const isOnTarget = Math.abs(macro.value - macro.target) <= 5;
              return (
                <tr key={`table-${macro.name}`}>
                  <td>{macro.name}</td>
                  <td>{macro.value}%</td>
                  <td>{macro.target}%</td>
                  <td>{isOnTarget ? 'On target' : 'Needs adjustment'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
});

export default TeamNutritionPanel;