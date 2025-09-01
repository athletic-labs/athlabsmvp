'use client';

import { useState } from 'react';
import { X, Plus, Clock, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

type MealTiming = 'arrival' | 'pre-game' | 'post-game' | 'flight-out' | 'intermission';

interface MealSchedule {
  id: string;
  timing: MealTiming;
  scheduledTime: string;
  templateId?: string;
  templateName?: string;
  servings?: number;
  status: 'pending' | 'ordered' | 'delivered';
}

interface GameEvent {
  id: string;
  date: string;
  opponent: string;
  time: string;
  location: string;
  isHome: boolean;
  meals: MealSchedule[];
}

interface MealScheduleModalProps {
  game: GameEvent;
  onClose: () => void;
  onSave: (meals: MealSchedule[]) => void;
}

export default function MealScheduleModal({ game, onClose, onSave }: MealScheduleModalProps) {
  const router = useRouter();
  const [meals, setMeals] = useState(game.meals || []);
  
  const MEAL_TIMINGS = [
    { id: 'arrival', label: 'Arrival', icon: '✈️', description: 'Team arrival meal (typically day before)' },
    { id: 'pre-game', label: 'Pre-Game', icon: '🍽️', description: '3-4 hours before game time' },
    { id: 'post-game', label: 'Post-Game', icon: '🥤', description: 'Immediately after game' },
    { id: 'flight-out', label: 'Flight Out', icon: '✈️', description: 'Before departure (away games)' },
    { id: 'intermission', label: 'Intermission', icon: '⏸️', description: 'Halftime/between periods' },
  ];

  const toggleMealTiming = (timingId: string) => {
    const existingMeal = meals.find((m: MealSchedule) => m.timing === timingId);
    if (existingMeal) {
      setMeals(meals.filter((m: MealSchedule) => m.timing !== timingId));
    } else {
      setMeals([...meals, {
        id: `meal-${Date.now()}`,
        timing: timingId as MealTiming,
        status: 'pending' as const,
        scheduledTime: getDefaultTime(timingId)
      }]);
    }
  };

  const getDefaultTime = (timing: string) => {
    // Calculate default times based on game time
    const gameTime = new Date(`${game.date} ${game.time}`);
    switch(timing) {
      case 'arrival': return '6:00 PM'; // Day before
      case 'pre-game': return '3:00 PM'; // 3 hours before
      case 'post-game': return '10:30 PM'; // After game
      case 'flight-out': return '11:30 PM'; // Late night
      case 'intermission': return game.time; // During game
      default: return '12:00 PM';
    }
  };

  const handleOrderMeal = (mealTiming: string) => {
    // Navigate to order page with pre-filled game/timing info
    router.push(`/orders/new?gameId=${game.id}&timing=${mealTiming}&date=${game.date}`);
  };

  const handleSave = () => {
    onSave(meals);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {game.isHome ? 'vs' : '@'} {game.opponent}
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(game.date).toLocaleDateString()} • {game.time}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {MEAL_TIMINGS.map((timing) => {
            const meal = meals.find(m => m.timing === timing.id);
            const isScheduled = !!meal;
            const isOrdered = meal?.status === 'ordered';
            
            return (
              <div
                key={timing.id}
                className={`border rounded-lg p-4 ${
                  isScheduled ? 'border-electric-blue bg-electric-blue/5' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">{timing.icon}</span>
                    <div>
                      <h3 className="font-medium">{timing.label}</h3>
                      <p className="text-sm text-gray-600">{timing.description}</p>
                      {meal && (
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <input
                            type="time"
                            value={meal.scheduledTime}
                            onChange={(e) => {
                              const updated = meals.map((m: MealSchedule) => 
                                m.timing === timing.id 
                                  ? { ...m, scheduledTime: e.target.value }
                                  : m
                              );
                              setMeals(updated);
                            }}
                            className="text-sm border rounded px-2 py-1"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isOrdered ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <Check className="w-4 h-4" />
                        Ordered
                      </span>
                    ) : isScheduled ? (
                      <button
                        onClick={() => handleOrderMeal(timing.id)}
                        className="px-3 py-1.5 bg-electric-blue text-white rounded-lg text-sm hover:bg-electric-blue/90"
                      >
                        Order Now
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleMealTiming(timing.id)}
                        className="px-3 py-1.5 border border-electric-blue text-electric-blue rounded-lg text-sm hover:bg-electric-blue/10"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Schedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}