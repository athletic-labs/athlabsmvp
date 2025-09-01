'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Upload, Plane, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import MealScheduleModal from './MealScheduleModal';
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
  meals: MealSchedule[];
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

const MEAL_TIMING_CONFIG = {
  arrival: {
    label: 'Arrival',
    color: 'bg-purple-500',
    icon: '✈️',
    defaultOffset: -24, // 24 hours before game
  },
  'pre-game': {
    label: 'Pre-Game',
    color: 'bg-orange-500',
    icon: '🍽️',
    defaultOffset: -3, // 3 hours before game
  },
  'post-game': {
    label: 'Post-Game',
    color: 'bg-green-500',
    icon: '🥤',
    defaultOffset: 1, // 1 hour after game
  },
  'flight-out': {
    label: 'Flight Out',
    color: 'bg-blue-500',
    icon: '✈️',
    defaultOffset: 4, // 4 hours after game
  },
  intermission: {
    label: 'Intermission',
    color: 'bg-yellow-500',
    icon: '⏸️',
    defaultOffset: 0, // During game
  },
};

export default function TeamCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [games, setGames] = useState<GameEvent[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameEvent | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const savedGames = localStorage.getItem('team-games');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
  }, []);

  const saveGames = (updatedGames: GameEvent[]) => {
    setGames(updatedGames);
    localStorage.setItem('team-games', JSON.stringify(updatedGames));
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

  const getMealStatusForDay = (date: Date) => {
    const dayGames = getGamesForDay(date);
    if (dayGames.length === 0) return null;

    const allMeals = dayGames.flatMap(game => game.meals || []);
    const orderedCount = allMeals.filter(m => m.status === 'ordered').length;
    const totalNeeded = dayGames.length * 2; // Minimum pre-game and post-game

    if (orderedCount === 0) return 'none';
    if (orderedCount < totalNeeded) return 'partial';
    return 'complete';
  };

  const handleUpdateGameMeals = (gameId: string, meals: MealSchedule[]) => {
    const updatedGames = games.map(game => 
      game.id === gameId ? { ...game, meals } : game
    );
    saveGames(updatedGames);
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
          {Object.entries(MEAL_TIMING_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${config.color}`} />
              <span className="text-sm">
                {config.icon} {config.label}
              </span>
            </div>
          ))}
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
            const mealStatus = getMealStatusForDay(day);
            
            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 border-r border-b ${
                  !isSameMonth(day, currentDate) ? 'bg-gray-50' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-medium ${
                    isToday(day) ? 'bg-electric-blue text-white w-6 h-6 rounded-full flex items-center justify-center' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {mealStatus && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      mealStatus === 'none' ? 'bg-red-100 text-red-700' :
                      mealStatus === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {mealStatus === 'none' ? 'No meals' :
                       mealStatus === 'partial' ? 'Partial' : 
                       'Complete'}
                    </span>
                  )}
                </div>
                
                {/* Games for this day */}
                <div className="space-y-1">
                  {dayGames.map((game, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedGame(game)}
                      className="text-xs p-1 bg-navy/10 rounded cursor-pointer hover:bg-navy/20"
                    >
                      <div className="font-medium truncate">
                        {game.isHome ? 'vs' : '@'} {game.opponent}
                      </div>
                      <div className="text-gray-600">{game.time}</div>
                      {/* Meal indicators */}
                      <div className="flex gap-0.5 mt-1">
                        {game.meals?.map((meal, idx) => (
                          <span
                            key={idx}
                            className={`w-2 h-2 rounded-full ${MEAL_TIMING_CONFIG[meal.timing].color}`}
                            title={MEAL_TIMING_CONFIG[meal.timing].label}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {selectedGame && (
        <MealScheduleModal
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onSave={(meals) => handleUpdateGameMeals(selectedGame.id, meals)}
        />
      )}

      {showImportModal && (
        <ImportScheduleModal
          onClose={() => setShowImportModal(false)}
          onImport={(importedGames) => {
            saveGames([...games, ...importedGames]);
          }}
        />
      )}
    </div>
  );
}