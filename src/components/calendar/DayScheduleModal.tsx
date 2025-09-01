'use client';

import { useState } from 'react';
import { X, Plus, Clock, Check, Trash2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

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

interface DayScheduleModalProps {
  date: Date;
  meals: MealSchedule[];
  onClose: () => void;
  onSave: (meals: MealSchedule[]) => void;
}

export default function DayScheduleModal({ date, meals, onClose, onSave }: DayScheduleModalProps) {
  const router = useRouter();
  const [dayMeals, setDayMeals] = useState<MealSchedule[]>(meals);
  
  const MEAL_TIMINGS = [
    { id: 'arrival', label: 'Arrival', icon: '✈️', description: 'Team arrival meals', defaultTime: '6:00 PM' },
    { id: 'pre-game', label: 'Pre-Training', icon: '🍽️', description: 'Before practice/training', defaultTime: '12:00 PM' },
    { id: 'post-game', label: 'Post-Training', icon: '🥤', description: 'After practice/training', defaultTime: '6:00 PM' },
    { id: 'flight-out', label: 'Travel', icon: '✈️', description: 'Travel day meals', defaultTime: '8:00 AM' },
    { id: 'intermission', label: 'Meeting', icon: '⏸️', description: 'Team meetings/events', defaultTime: '11:00 AM' },
  ];

  const addMealTiming = (timingId: string) => {
    const timing = MEAL_TIMINGS.find(t => t.id === timingId);
    if (!timing) return;

    const newMeal: MealSchedule = {
      id: `meal-${Date.now()}`,
      timing: timingId as MealTiming,
      status: 'pending',
      scheduledTime: timing.defaultTime
    };

    setDayMeals([...dayMeals, newMeal]);
  };

  const removeMeal = (mealId: string) => {
    setDayMeals(dayMeals.filter(m => m.id !== mealId));
  };

  const updateMealTime = (mealId: string, time: string) => {
    setDayMeals(dayMeals.map(m => 
      m.id === mealId ? { ...m, scheduledTime: time } : m
    ));
  };

  const handleOrderMeal = (mealId: string) => {
    const meal = dayMeals.find(m => m.id === mealId);
    if (!meal) return;

    // Navigate to order page with context
    const dateStr = format(date, 'yyyy-MM-dd');
    router.push(`/new-order?date=${dateStr}&timing=${meal.timing}&time=${meal.scheduledTime}`);
  };

  const handleSave = () => {
    onSave(dayMeals);
    onClose();
  };

  const getAvailableTimings = () => {
    const usedTimings = dayMeals.map(m => m.timing);
    return MEAL_TIMINGS.filter(t => !usedTimings.includes(t.id as MealTiming));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Schedule Meals - {format(date, 'EEEE, MMMM d')}
            </h2>
            <p className="text-sm text-gray-600">
              Plan meals for practice, meetings, or team events
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scheduled Meals */}
        <div className="space-y-3 mb-6">
          {dayMeals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No meals scheduled for this day</p>
              <p className="text-sm">Add meal timings below</p>
            </div>
          ) : (
            dayMeals.map((meal) => {
              const timing = MEAL_TIMINGS.find(t => t.id === meal.timing);
              const isOrdered = meal.status === 'ordered';
              
              return (
                <div
                  key={meal.id}
                  className={`border rounded-lg p-4 ${
                    isOrdered ? 'border-green-300 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1">{timing?.icon}</span>
                      <div>
                        <h3 className="font-medium">{timing?.label}</h3>
                        <p className="text-sm text-gray-600">{timing?.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <input
                            type="time"
                            value={meal.scheduledTime}
                            onChange={(e) => updateMealTime(meal.id, e.target.value)}
                            className="text-sm border rounded px-2 py-1"
                            disabled={isOrdered}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isOrdered ? (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Check className="w-4 h-4" />
                          Ordered
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleOrderMeal(meal.id)}
                            className="px-3 py-1.5 bg-electric-blue text-white rounded-lg text-sm hover:bg-electric-blue/90"
                          >
                            Order Now
                          </button>
                          <button
                            onClick={() => removeMeal(meal.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add New Meal Timing */}
        {getAvailableTimings().length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Add Meal Timing:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {getAvailableTimings().map((timing) => (
                <button
                  key={timing.id}
                  onClick={() => addMealTiming(timing.id)}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-electric-blue hover:bg-electric-blue/5 text-left"
                >
                  <span className="text-xl">{timing.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{timing.label}</div>
                    <div className="text-xs text-gray-600">{timing.description}</div>
                  </div>
                  <Plus className="w-4 h-4 text-electric-blue ml-auto" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
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