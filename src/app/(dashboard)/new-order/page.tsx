'use client';

import { useState } from 'react';
import { Plus, Search, Info } from 'lucide-react';
import { MEAL_TEMPLATES } from '@/lib/data/meal-templates';
import OptimalTemplateCard from '@/components/orders/OptimalTemplateCard';
import CreateTemplateModal from '@/components/templates/CreateTemplateModal';

export default function NewOrderPage() {
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  
  const cuisineTypes = ['all', ...Array.from(new Set(MEAL_TEMPLATES.map(t => t.cuisine_type)))];
  
  const filteredTemplates = MEAL_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || template.cuisine_type === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="min-h-screen bg-smoke/5 dark:bg-navy/95">
      {/* Sticky Header with Context */}
      <div className="bg-white dark:bg-navy border-b border-smoke dark:border-smoke/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-navy dark:text-white">New Order</h1>
              <p className="text-sm text-navy/60 dark:text-white/60 mt-0.5">
                {filteredTemplates.length + 1} templates available • Minimum order $500
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-navy/50" />
              <span className="text-navy/60 dark:text-white/60">All templates serve 60 people</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy border border-smoke dark:border-smoke/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition-all"
            />
          </div>
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-navy border border-smoke dark:border-smoke/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
          >
            {cuisineTypes.map(cuisine => (
              <option key={cuisine} value={cuisine}>
                {cuisine === 'all' ? 'All Cuisines' : cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Create Your Own - Always First */}
          <button
            onClick={() => setShowCreateTemplate(true)}
            className="aspect-[4/5] bg-white dark:bg-navy border-2 border-dashed border-electric-blue/50 hover:border-electric-blue rounded-xl hover:shadow-lg transition-all group"
          >
            <div className="h-full flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-electric-blue/20 transition-colors">
                <Plus className="w-8 h-8 text-electric-blue" />
              </div>
              <h3 className="font-semibold text-lg text-navy dark:text-white mb-2">
                Create Your Own
              </h3>
              <p className="text-sm text-navy/60 dark:text-white/60 text-center">
                Build a custom template from individual items
              </p>
            </div>
          </button>

          {/* Template Cards */}
          {filteredTemplates.map((template) => (
            <OptimalTemplateCard key={template.id} template={template} />
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-navy/60 dark:text-white/60">
              No templates found matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-electric-blue hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <CreateTemplateModal
          open={showCreateTemplate}
          onClose={() => setShowCreateTemplate(false)}
        />
      )}
    </div>
  );
}