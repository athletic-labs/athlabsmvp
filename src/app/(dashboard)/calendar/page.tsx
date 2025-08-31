'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Users, Trophy, Utensils, Truck, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'game' | 'practice' | 'delivery' | 'meal' | 'meeting';
  date: Date;
  startTime: string;
  endTime?: string;
  location?: string;
  description?: string;
  attendees?: number;
  color: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['game', 'practice', 'delivery', 'meal', 'meeting']);

  // Mock events data
  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'vs State University',
      type: 'game',
      date: new Date(2024, 2, 15), // March 15
      startTime: '7:00 PM',
      location: 'Memorial Stadium',
      attendees: 28,
      color: 'bg-red-500'
    },
    {
      id: '2',
      title: 'Team Practice',
      type: 'practice',
      date: new Date(2024, 2, 13),
      startTime: '4:00 PM',
      endTime: '6:00 PM',
      location: 'Training Complex',
      attendees: 28,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      title: 'Pre-Game Meal Delivery',
      type: 'delivery',
      date: new Date(2024, 2, 15),
      startTime: '3:00 PM',
      location: 'Team Facility',
      description: 'Mediterranean Power Bowls + Recovery Smoothies',
      color: 'bg-green-500'
    },
    {
      id: '4',
      title: 'Post-Workout Nutrition',
      type: 'meal',
      date: new Date(2024, 2, 13),
      startTime: '6:30 PM',
      location: 'Nutrition Center',
      description: 'Protein shakes and recovery snacks',
      color: 'bg-orange-500'
    },
    {
      id: '5',
      title: 'Team Meeting',
      type: 'meeting',
      date: new Date(2024, 2, 12),
      startTime: '10:00 AM',
      endTime: '11:00 AM',
      location: 'Conference Room A',
      attendees: 32,
      color: 'bg-purple-500'
    },
    {
      id: '6',
      title: 'vs Tech College',
      type: 'game',
      date: new Date(2024, 2, 22),
      startTime: '2:00 PM',
      location: 'Away - Tech Stadium',
      attendees: 28,
      color: 'bg-red-500'
    }
  ];

  const eventTypes = [
    { value: 'game', label: 'Games', icon: Trophy, color: 'bg-red-500' },
    { value: 'practice', label: 'Practice', icon: Users, color: 'bg-blue-500' },
    { value: 'delivery', label: 'Deliveries', icon: Truck, color: 'bg-green-500' },
    { value: 'meal', label: 'Meals', icon: Utensils, color: 'bg-orange-500' },
    { value: 'meeting', label: 'Meetings', icon: Clock, color: 'bg-purple-500' }
  ];

  const filteredEvents = events.filter(event => selectedTypes.includes(event.type));

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  }, [currentDate]);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  const toggleEventType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white">Team Calendar</h1>
          <p className="text-navy/60 dark:text-white/60 mt-1">
            View games, practices, deliveries, and team events
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setView('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Week
          </button>
          <button className="md-outlined-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="md-card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium">Filter Events</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {eventTypes.map(type => (
            <button
              key={type.value}
              onClick={() => toggleEventType(type.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTypes.includes(type.value)
                  ? `${type.color} text-white`
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <type.icon className="w-4 h-4" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="md-card">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-sm font-medium text-gray-500 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isDayToday = isToday(day);

            return (
              <motion.div
                key={index}
                onClick={() => setSelectedDate(day)}
                className={`min-h-32 p-2 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    isDayToday
                      ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                      : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Events for this day */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                      title={`${event.title} - ${event.startTime}`}
                    >
                      {event.title}
                    </motion.div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Events for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                ×
              </button>
            </div>

            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No events scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getEventsForDate(selectedDate).map(event => {
                  const TypeIcon = eventTypes.find(type => type.value === event.type)?.icon || Clock;
                  
                  return (
                    <div key={event.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${event.color}`}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{event.title}</h4>
                            <span className="text-sm font-medium text-blue-600">
                              {event.startTime}
                              {event.endTime && ` - ${event.endTime}`}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </div>
                          )}
                          
                          {event.attendees && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <Users className="w-4 h-4" />
                              {event.attendees} attendees
                            </div>
                          )}
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Events */}
      <div className="md-card">
        <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {filteredEvents
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 5)
            .map(event => {
              const TypeIcon = eventTypes.find(type => type.value === event.type)?.icon || Clock;
              
              return (
                <div key={event.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                  <div className={`p-2 rounded ${event.color}`}>
                    <TypeIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <span className="text-sm text-gray-500">
                        {format(event.date, 'MMM d')} at {event.startTime}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}