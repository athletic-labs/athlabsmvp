'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Upload, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isPast } from 'date-fns';
import MealScheduleModal from './MealScheduleModal';
import DayScheduleModal from './DayScheduleModal';
import ImportScheduleModal from './ImportScheduleModal';
import { toast } from 'sonner';

// Specific meal timing types for sports teams
type MealTiming = 'arrival' | 'pre-game' | 'post-game' | 'flight-out' | 'intermission';

interface GameEvent {
  id: string;
  date: string;
  opponent: string;
  time: string;
  location: string;
  isHome: boolean;
  seriesId?: string; // Links multiple games in a series
}

interface TripSeries {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  type: 'road-trip' | 'home-series' | 'tournament' | 'camp';
  color: string; // hex color for the bar
  games: GameEvent[];
  description?: string;
}

interface MealSchedule {
  id: string;
  timing: MealTiming;
  scheduledTime: string;
  templateId?: string;
  templateName?: string;
  servings?: number;
  status: 'pending' | 'ordered' | 'delivered';
}

export default function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [games, setGames] = useState<GameEvent[]>([]);
  const [series, setSeries] = useState<TripSeries[]>([]);
  const [meals, setMeals] = useState<Map<string, MealSchedule[]>>(new Map());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    // Load saved games, series, and meals
    const savedGames = localStorage.getItem('team-games');
    const savedSeries = localStorage.getItem('team-series');
    const savedMeals = localStorage.getItem('team-meals');
    
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
    
    if (savedSeries) {
      setSeries(JSON.parse(savedSeries));
    } else {
      // Add example series data with current dates for visibility
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const exampleSeries: TripSeries[] = [
        {
          id: 'series-1',
          title: 'California Road Trip',
          startDate: format(new Date(currentYear, currentMonth, 15), 'yyyy-MM-dd'),
          endDate: format(new Date(currentYear, currentMonth, 18), 'yyyy-MM-dd'),
          location: 'California',
          type: 'road-trip',
          color: '#3B82F6', // blue
          games: [],
          description: '4-day road trip to California - USC and UCLA games'
        },
        {
          id: 'series-2',
          title: 'Big Ten Tournament',
          startDate: format(new Date(currentYear, currentMonth, 22), 'yyyy-MM-dd'),
          endDate: format(new Date(currentYear, currentMonth, 26), 'yyyy-MM-dd'),
          location: 'Chicago, IL',
          type: 'tournament',
          color: '#10B981', // green
          games: [],
          description: 'Big Ten Conference Tournament in Chicago'
        },
        {
          id: 'series-3',
          title: 'Florida Series',
          startDate: format(new Date(currentYear, currentMonth + 1, 5), 'yyyy-MM-dd'),
          endDate: format(new Date(currentYear, currentMonth + 1, 7), 'yyyy-MM-dd'),
          location: 'Gainesville, FL',
          type: 'road-trip',
          color: '#8B5CF6', // purple
          games: [],
          description: 'Weekend series against Florida Gators'
        }
      ];
      setSeries(exampleSeries);
      localStorage.setItem('team-series', JSON.stringify(exampleSeries));
    }
    
    if (savedMeals) {
      const mealsData = JSON.parse(savedMeals);
      setMeals(new Map(mealsData));
    }
  }, []);

  const saveMeals = (updatedMeals: Map<string, MealSchedule[]>) => {
    setMeals(updatedMeals);
    localStorage.setItem('team-meals', JSON.stringify(Array.from(updatedMeals.entries())));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getGamesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return games.filter(game => game.date === dateStr);
  };

  const getMealsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return meals.get(dateStr) || [];
  };

  const getMealStatusForDay = (date: Date) => {
    const dayMeals = getMealsForDay(date);
    const dayGames = getGamesForDay(date);
    
    if (dayMeals.length === 0) return 'none';
    
    // Check if essential meals are covered
    const hasPreGame = dayMeals.some(m => m.timing === 'pre-game');
    const hasPostGame = dayMeals.some(m => m.timing === 'post-game');
    
    if (dayGames.length > 0 && (!hasPreGame || !hasPostGame)) {
      return 'partial';
    }
    
    return dayMeals.length > 0 ? 'scheduled' : 'none';
  };

  const handleDayClick = (date: Date) => {
    const dayGames = getGamesForDay(date);
    
    if (dayGames.length > 0) {
      // If there's a game, open game-specific meal modal
      setSelectedGame(dayGames[0]);
    } else {
      // No game - open general day schedule modal
      setSelectedDay(date);
    }
  };

  const handleSaveDayMeals = (date: Date, dayMeals: MealSchedule[]) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const updatedMeals = new Map(meals);
    updatedMeals.set(dateStr, dayMeals);
    saveMeals(updatedMeals);
  };

  const getSeriesForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const matchingSeries = series.filter(s => dateStr >= s.startDate && dateStr <= s.endDate);
    
    // Debug logging
    if (matchingSeries.length > 0) {

    }
    
    return matchingSeries;
  };

  const isSeriesStartDate = (date: Date, seriesItem: TripSeries) => {
    return format(date, 'yyyy-MM-dd') === seriesItem.startDate;
  };

  const isSeriesEndDate = (date: Date, seriesItem: TripSeries) => {
    return format(date, 'yyyy-MM-dd') === seriesItem.endDate;
  };

  const getSeriesSpanInfo = (date: Date, seriesItem: TripSeries) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isStart = dateStr === seriesItem.startDate;
    const isEnd = dateStr === seriesItem.endDate;
    const isMiddle = dateStr > seriesItem.startDate && dateStr < seriesItem.endDate;
    
    return { isStart, isEnd, isMiddle, isInSeries: isStart || isEnd || isMiddle };
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface)]">
      {/* Google Calendar Style Header */}
      <div className="border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Title and view controls */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <Calendar className="w-6 h-6 text-[#1a2332]" />
              <h1 className="text-[22px] font-[400] text-[var(--md-sys-color-on-surface)] leading-[28px]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Team Calendar
              </h1>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-200"
              >
                <ChevronLeft className="w-5 h-5 text-[var(--md-sys-color-on-surface)]" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-200"
              >
                <ChevronRight className="w-5 h-5 text-[var(--md-sys-color-on-surface)]" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="ml-2 px-4 py-2 text-[14px] font-[500] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline)] rounded-[4px] hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-200"
                style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                Today
              </button>
            </div>

            {/* Month/Year display */}
            <h2 className="text-[22px] font-[400] text-[var(--md-sys-color-on-surface)]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-[14px] font-[500] text-[#3b82f6] border border-[#3b82f6] rounded-[4px] hover:bg-[#3b82f6]/10 transition-colors duration-200"
              style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
            <button
              onClick={() => {
                // TODO: Add series creation modal
                toast.info('Series creation coming soon! For now, edit the code to add custom series.');
              }}
              className="flex items-center space-x-2 px-4 py-2 text-[14px] font-[500] text-white bg-[#3b82f6] rounded-[4px] hover:bg-[#2563eb] transition-colors duration-200 shadow-sm"
              style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-6">

        {/* Clean Legend Section */}
        <div className="mb-6 space-y-3">
          {/* Series Legend - Google Calendar style */}
          {series.length > 0 && (
            <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[8px] p-4">
              <h3 className="text-[16px] font-[500] text-[var(--md-sys-color-on-surface)] mb-3" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                Active Series & Road Trips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {series.map(s => (
                  <div key={s.id} className="flex items-center space-x-3 p-2 rounded-[4px] hover:bg-[var(--md-sys-color-surface-container)] transition-colors duration-200">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-[500] text-[var(--md-sys-color-on-surface)] truncate" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        {s.title}
                      </div>
                      <div className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        {s.location} • {format(new Date(s.startDate), 'MMM d')}–{format(new Date(s.endDate), 'MMM d')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meal Timing Legend - Streamlined */}
          <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[8px] p-4">
            <h3 className="text-[16px] font-[500] text-[var(--md-sys-color-on-surface)] mb-3" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
              Meal Schedule Types
            </h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#9333ea]" />
                <span className="text-[14px] text-[var(--md-sys-color-on-surface)]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Arrival</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#ea580c]" />
                <span className="text-[14px] text-[var(--md-sys-color-on-surface)]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Pre-Game</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#059669]" />
                <span className="text-[14px] text-[var(--md-sys-color-on-surface)]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Post-Game</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                <span className="text-[14px] text-[var(--md-sys-color-on-surface)]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Departure</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                <span className="text-[14px] text-[var(--md-sys-color-on-surface)]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>Intermission</span>
              </div>
            </div>
          </div>
        </div>


        {/* Google Calendar Style Grid */}
        <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-[8px] overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="px-4 py-3 text-center border-r border-[var(--md-sys-color-outline-variant)] last:border-r-0">
                <span className="text-[11px] font-[500] text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-[0.8px]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                  {day}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7">
            {getDaysInMonth().map((day, idx) => {
              const dayGames = getGamesForDay(day);
              const dayMeals = getMealsForDay(day);
              const daySeries = getSeriesForDay(day);
              const mealStatus = getMealStatusForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isPastDay = isPast(day) && !isToday(day);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              
              return (
                <div
                  key={idx}
                  onClick={() => !isPastDay && handleDayClick(day)}
                  className={`min-h-[120px] border-r border-b border-[var(--md-sys-color-outline-variant)] last:border-r-0 transition-colors duration-200 relative overflow-visible group ${
                    !isCurrentMonth ? 'bg-[var(--md-sys-color-surface-container-lowest)]' : 
                    isWeekend ? 'bg-[var(--md-sys-color-surface-container-lowest)]/50' : 'bg-[var(--md-sys-color-surface)]'
                  } ${
                    isToday(day) ? 'bg-[#e3f2fd]' : ''
                  } ${
                    isPastDay ? 'opacity-60' : 'cursor-pointer hover:bg-[var(--md-sys-color-surface-container-lowest)] hover:shadow-sm'
                  }`}
                >
                  {/* Day number and status */}
                  <div className="flex justify-between items-start p-2 pb-1">
                    <div className="flex items-center">
                      {isToday(day) ? (
                        <div className="w-7 h-7 bg-[#3b82f6] text-white rounded-full flex items-center justify-center">
                          <span className="text-[13px] font-[500]" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                            {format(day, 'd')}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-[14px] font-[400] ${
                          !isCurrentMonth ? 'text-[var(--md-sys-color-on-surface-variant)]' : 'text-[var(--md-sys-color-on-surface)]'
                        }`} style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                          {format(day, 'd')}
                        </span>
                      )}
                    </div>
                    {!isPastDay && mealStatus !== 'none' && (
                      <div className={`text-[10px] px-2 py-0.5 rounded-full font-[500] ${
                        mealStatus === 'partial' ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#dcfce7] text-[#166534]'
                      }`} style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                        {mealStatus === 'partial' ? 'Partial' : `${dayMeals.length}`}
                      </div>
                    )}
                  </div>

                  {/* Google Calendar style series bars */}
                  <div className="px-2">
                    {daySeries.map((seriesItem, seriesIdx) => {
                      const spanInfo = getSeriesSpanInfo(day, seriesItem);
                      if (!spanInfo.isInSeries) return null;
                      
                      return (
                        <div
                          key={`series-${seriesItem.id}-${seriesIdx}`}
                          className="mb-1 relative group"
                        >
                          <div
                            className="h-[16px] text-white text-[11px] font-[500] flex items-center px-1 transition-opacity duration-200 hover:opacity-90 cursor-pointer"
                            style={{ 
                              backgroundColor: seriesItem.color,
                              borderRadius: spanInfo.isStart && spanInfo.isEnd ? '2px' :
                                          spanInfo.isStart ? '2px 0 0 2px' :
                                          spanInfo.isEnd ? '0 2px 2px 0' : '0'
                            }}
                            title={`${seriesItem.title} - ${seriesItem.location}`}
                          >
                            {spanInfo.isStart && (
                              <span className="truncate" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                                {seriesItem.title}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Games - Google Calendar event style */}
                  <div className="px-2 space-y-1">
                    {dayGames.map((game, i) => (
                      <div
                        key={i}
                        className="bg-[#1a2332] text-white text-[11px] font-[500] rounded-[2px] p-1 cursor-pointer hover:shadow-sm transition-shadow duration-200"
                      >
                        <div className="truncate" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                          {game.isHome ? 'vs' : '@'} {game.opponent}
                        </div>
                        <div className="text-white/80 text-[10px] truncate" style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                          {game.time}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Meal indicators - Clean dots */}
                  {dayMeals.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-2 mt-1">
                      {dayMeals.map((meal, idx) => (
                        <div
                          key={idx}
                          className={`w-2 h-2 rounded-full ${
                            meal.timing === 'arrival' ? 'bg-[#9333ea]' :
                            meal.timing === 'pre-game' ? 'bg-[#ea580c]' :
                            meal.timing === 'post-game' ? 'bg-[#059669]' :
                            meal.timing === 'flight-out' ? 'bg-[#3b82f6]' :
                            'bg-[#eab308]'
                          }`}
                          title={meal.timing}
                        />
                      ))}
                    </div>
                  )}
                  {/* Quick add button - Google Calendar style */}
                  {!isPastDay && dayGames.length === 0 && dayMeals.length === 0 && (
                    <div className="px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button 
                        className="text-[11px] text-[#3b82f6] hover:text-[#2563eb] font-[500] transition-colors duration-200"
                        style={{ fontFamily: 'Google Sans, -apple-system, BlinkMacSystemFont, sans-serif' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(day);
                        }}
                      >
                        + Add
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedDay && (
        <DayScheduleModal
          date={selectedDay}
          meals={getMealsForDay(selectedDay)}
          onClose={() => setSelectedDay(null)}
          onSave={(meals) => handleSaveDayMeals(selectedDay, meals)}
        />
      )}

      {selectedGame && (
        <MealScheduleModal
          game={selectedGame}
          meals={getMealsForDay(new Date(selectedGame.date))}
          onClose={() => setSelectedGame(null)}
          onSave={(meals) => handleSaveDayMeals(new Date(selectedGame.date), meals)}
        />
      )}

      {showImportModal && (
        <ImportScheduleModal
          onClose={() => setShowImportModal(false)}
          onImport={(importedGames) => {
            setGames([...games, ...importedGames]);
            localStorage.setItem('team-games', JSON.stringify([...games, ...importedGames]));
          }}
        />
      )}
    </div>
  );
}