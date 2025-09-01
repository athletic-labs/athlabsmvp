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
  const [meals, setMeals] = useState<Map<string, MealSchedule[]>>(new Map());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    // Load saved games and meals
    const savedGames = localStorage.getItem('team-games');
    const savedMeals = localStorage.getItem('team-meals');
    
    if (savedGames) setGames(JSON.parse(savedGames));
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
            className="flex items-center gap-2 px-4 py-2 border border-electric-blue text-electric-blue rounded-lg hover:bg-electric-blue/10"
          >
            <Upload className="w-4 h-4" />
            Import Schedule
          </button>
        </div>
      </div>

      {/* Meal Timing Legend */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
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
            className="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm"
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
            const mealStatus = getMealStatusForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isPastDay = isPast(day) && !isToday(day);
            
            return (
              <div
                key={idx}
                onClick={() => !isPastDay && handleDayClick(day)}
                className={`min-h-[120px] p-2 border-r border-b transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''} ${
                  isPastDay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(day) ? 'bg-electric-blue text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
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