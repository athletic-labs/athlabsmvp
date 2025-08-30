'use client';

import { useState } from 'react';
import { Search, Heart, Star, Clock } from 'lucide-react';

export default function SavedTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-navy dark:text-white">Saved Templates</h1>
        <p className="text-navy/60 dark:text-white/60 mt-1">
          Your frequently used meal combinations
        </p>
      </div>

      <div className="md-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/50 dark:text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search saved templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md-text-field pl-10"
          />
        </div>
      </div>

      <div className="text-center py-12">
        <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-electric-blue" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No saved templates yet</h3>
        <p className="text-navy/60 dark:text-white/60 mb-6">
          Create your first template by placing an order and saving it for future use
        </p>
        <button className="md-filled-button">Create New Order</button>
      </div>
    </div>
  );
}