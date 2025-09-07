'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Upload, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isPast } from 'date-fns';
import MealScheduleModal from './MealScheduleModal';
import DayScheduleModal from './DayScheduleModal';
import ImportScheduleModal from './ImportScheduleModal';

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
      console.log(`Date ${dateStr} has series:`, matchingSeries.map(s => s.title));
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
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Calendar</h1>
          <p className="text-gray-600">Schedule and manage meal timing for games</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-[var(--md-sys-color-primary)] text-[var(--md-sys-color-primary)] rounded-lg hover:bg-[var(--md-sys-color-primary)]/10"
          >
            <Upload className="w-4 h-4" />
            Import Schedule
          </button>
          <button
            onClick={() => {
              // TODO: Add series creation modal
              alert('Series creation coming soon! For now, edit the code to add custom series.');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-lg hover:bg-[var(--md-sys-color-primary)]/90"
          >
            <Plus className="w-4 h-4" />
            Add Series/Trip
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('team-series');
              window.location.reload();
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Reset Demo Data
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 space-y-4">
        {/* Series Legend */}
        {series.length > 0 && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium mb-3">Current Series & Road Trips:</p>
            <div className="space-y-2">
              {series.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-3 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm">
                    <span className="font-medium">{s.title}</span> - {s.location} 
                    <span className="text-gray-600 ml-1">
                      ({format(new Date(s.startDate), 'MMM d')} - {format(new Date(s.endDate), 'MMM d')})
                    </span>
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/70 capitalize">
                    {s.type.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meal Timing Legend */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium mb-3">Meal Timing Options:</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm">✈️ Arrival</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm">🍽️ Pre-Game</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">🥤 Post-Game</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">✈️ Flight Out</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm">⏸️ Intermission</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] rounded-lg text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {getDaysInMonth().map((day, idx) => {
            const dayGames = getGamesForDay(day);
            const dayMeals = getMealsForDay(day);
            const daySeries = getSeriesForDay(day);
            const mealStatus = getMealStatusForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isPastDay = isPast(day) && !isToday(day);
            
            return (
              <div
                key={idx}
                onClick={() => !isPastDay && handleDayClick(day)}
                className={`min-h-[140px] p-2 border-r border-b transition-colors relative overflow-visible ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''} ${
                  isPastDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(day) ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] w-6 h-6 rounded-full flex items-center justify-center' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {!isPastDay && mealStatus !== 'none' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      mealStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {mealStatus === 'partial' ? 'Partial' : `${dayMeals.length} meals`}
                    </span>
                  )}
                </div>

                {/* Series bars spanning multiple days */}
                {daySeries.map((seriesItem, seriesIdx) => {
                  const spanInfo = getSeriesSpanInfo(day, seriesItem);
                  if (!spanInfo.isInSeries) return null;
                  
                  return (
                    <div
                      key={`series-${seriesItem.id}-${seriesIdx}`}
                      className="absolute left-1 right-1 h-3 z-20 opacity-80 hover:opacity-100 transition-opacity"
                      style={{ 
                        backgroundColor: seriesItem.color,
                        top: `${40 + seriesIdx * 12}px`,
                        borderTopLeftRadius: spanInfo.isStart ? '6px' : '0',
                        borderBottomLeftRadius: spanInfo.isStart ? '6px' : '0',
                        borderTopRightRadius: spanInfo.isEnd ? '6px' : '0',
                        borderBottomRightRadius: spanInfo.isEnd ? '6px' : '0',
                      }}
                      title={`${seriesItem.title} - ${seriesItem.location}`}
                    >
                      {spanInfo.isStart && (
                        <div className="absolute left-2 -top-5 text-xs font-medium text-white bg-gray-800/90 px-2 py-0.5 rounded-md whitespace-nowrap z-30">
                          {seriesItem.title}
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {/* Games for this day */}
                {dayGames.map((game, i) => (
                  <div
                    key={i}
                    className="text-xs p-1 bg-navy/10 rounded mb-1"
                  >
                    <div className="font-medium truncate">
                      {game.isHome ? 'vs' : '@'} {game.opponent}
                    </div>
                    <div className="text-gray-600">{game.time}</div>
                  </div>
                ))}
                
                {/* Meal indicators */}
                {dayMeals.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {dayMeals.map((meal, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          meal.timing === 'arrival' ? 'bg-purple-500' :
                          meal.timing === 'pre-game' ? 'bg-orange-500' :
                          meal.timing === 'post-game' ? 'bg-green-500' :
                          meal.timing === 'flight-out' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        }`}
                        title={meal.timing}
                      />
                    ))}
                  </div>
                )}
                
                {/* Quick add meal for empty days */}
                {!isPastDay && dayGames.length === 0 && dayMeals.length === 0 && (
                  <button 
                    className="mt-2 text-xs text-electric-blue hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day);
                    }}
                  >
                    + Schedule
                  </button>
                )}
              </div>
            );
          })}
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