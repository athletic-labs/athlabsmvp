'use client';

import { memo } from 'react';
import { Trophy, Target, ChevronRight } from 'lucide-react';
import { Card, CardContent, Button } from '@/lib/design-system/components';
import { Achievement } from '@/lib/hooks/useDashboardData';
import Link from 'next/link';

interface AchievementsSectionProps {
  achievements: Achievement[];
  loading: boolean;
}

const AchievementsSection = memo(function AchievementsSection({ 
  achievements, 
  loading 
}: AchievementsSectionProps) {
  
  if (loading) {
    return (
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4" aria-hidden="true">
            <div className="h-6 bg-[var(--md-sys-color-surface-container)] rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 bg-[var(--md-sys-color-surface-container)] rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Icon mapping for achievements
  const iconMap = {
    'Trophy': Trophy,
    'Target': Target
  };

  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="md3-title-large font-semibold text-[var(--md-sys-color-on-surface)]">
            Recent Achievements
          </h3>
          <Button 
            variant="text" 
            size="small"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            asChild
          >
            <Link href="/team/achievements">View All</Link>
          </Button>
        </div>
        
        {achievements.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="w-8 h-8 text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-2" aria-hidden="true" />
            <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              No recent achievements
            </p>
            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mt-1">
              Keep up the great work to unlock achievements
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Recent team achievements">
            {achievements.slice(0, 3).map((achievement) => {
              const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
              
              return (
                <div 
                  key={achievement.id} 
                  className="flex items-start gap-3 p-3 bg-[var(--md-sys-color-tertiary-container)] rounded-lg hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors cursor-pointer"
                  role="listitem"
                  tabIndex={0}
                  aria-label={`Achievement: ${achievement.name} - ${achievement.description}`}
                >
                  <div className="p-2 bg-[var(--md-saas-color-warning-container)] rounded-lg">
                    <IconComponent 
                      className="w-5 h-5 text-[var(--md-saas-color-warning)]" 
                      aria-hidden="true" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="md3-body-medium font-semibold text-[var(--md-sys-color-on-surface)]">
                      {achievement.name}
                    </p>
                    <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                      {achievement.description}
                    </p>
                    <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Accessible achievements table for screen readers */}
        <table className="sr-only" aria-label="Team achievements data">
          <thead>
            <tr>
              <th>Achievement</th>
              <th>Description</th>
              <th>Date Earned</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map(achievement => (
              <tr key={`table-${achievement.id}`}>
                <td>{achievement.name}</td>
                <td>{achievement.description}</td>
                <td>{new Date(achievement.earnedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
});

export default AchievementsSection;