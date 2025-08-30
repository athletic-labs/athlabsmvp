'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-white">Team Calendar</h1>
        <p className="text-navy/60 dark:text-white/60 mt-1">
          View upcoming games and scheduled deliveries
        </p>
      </div>

      <div className="md-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-smoke/20 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-smoke/20 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-8 h-8 text-electric-blue" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No scheduled games</h3>
          <p className="text-navy/60 dark:text-white/60">
            Game schedule will appear here once your team data is configured
          </p>
        </div>
      </div>
    </div>
  );
}