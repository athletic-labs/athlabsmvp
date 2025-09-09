'use client';

import { useState, useMemo } from 'react';
import { X, Plus, Minus, Save, Search, ChevronRight, ShoppingCart, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/cart-store';
import { MENU_ITEMS, MenuItem, getCategoryColor } from '@/lib/data/menu-items';
import { TemplateService } from '@/lib/services/template-service';

interface SelectedItem extends MenuItem {
  panSize: 'half' | 'full';
  quantity: number;
  uniqueId: string; // Allow multiple instances of same item
}

interface CreateTemplateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateTemplateModal({ open, onClose }: CreateTemplateModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [templateName, setTemplateName] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [step, setStep] = useState(1);
  const [templateDescription, setTemplateDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const CATEGORIES = [
    { id: 'all', label: 'All Items', color: 'gray', count: MENU_ITEMS.length },
    { id: 'protein', label: 'Proteins', color: 'red', count: MENU_ITEMS.filter(i => i.category === 'protein').length },
    { id: 'starch', label: 'Starches', color: 'yellow', count: MENU_ITEMS.filter(i => i.category === 'starch').length },
    { id: 'vegetables', label: 'Vegetables', color: 'green', count: MENU_ITEMS.filter(i => i.category === 'vegetables').length },
    { id: 'breakfast', label: 'Breakfast', color: 'blue', count: MENU_ITEMS.filter(i => i.category === 'breakfast').length },
    { id: 'also-available', label: 'Also Available', color: 'purple', count: MENU_ITEMS.filter(i => i.category === 'also-available').length },
    { id: 'add-ons', label: 'Add-Ons', color: 'indigo', count: MENU_ITEMS.filter(i => i.category === 'add-ons').length }
  ];
  
  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);
  
  // Group items by category for better display
  const groupedItems = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);
  
  // Calculate estimated servings
  const estimatedServings = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      const servings = item.panSize === 'full' ? item.servingsFull : item.servingsHalf;
      return total + (servings * item.quantity);
    }, 0);
  }, [selectedItems]);

  const addMenuItem = (item: MenuItem) => {
    // Always create a new instance, even if the item already exists
    const uniqueId = `${item.id}-${Date.now()}-${Math.random()}`;
    setSelectedItems(prev => [...prev, { ...item, quantity: 1, panSize: 'full', uniqueId }]);
  };

  const updateItemQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(prev => prev.filter(item => item.uniqueId !== uniqueId));
    } else {
      setSelectedItems(prev => prev.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      ));
    }
  };

  const updatePanSize = (uniqueId: string, panSize: 'half' | 'full') => {
    setSelectedItems(prev => prev.map(item =>
      item.uniqueId === uniqueId ? { ...item, panSize } : item
    ));
  };

  const calculateTotalPrice = () => {
    return selectedItems.reduce((total, item) => {
      const price = item.panSize === 'full' ? item.priceFull : item.priceHalf;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleSaveTemplate = async () => {
    if (!templateName || selectedItems.length === 0) {
      setSaveError('Please provide a name and select at least one item');
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    
    try {
      await TemplateService.saveTemplate(templateName, selectedItems);
      
      setShowSaveConfirm(true);
      toast.success('Template saved successfully!');
      
      setTimeout(() => {
        setShowSaveConfirm(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to save template:', error);
      setSaveError(error.message || 'Failed to save template');
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) return;

    const templateItem = {
      type: 'template' as const,
      name: templateName || 'Custom Template',
      unitPrice: calculateTotalPrice(),
      quantity: 1,
      servings: estimatedServings,
      includedItems: selectedItems.map(item => ({
        name: item.name,
        quantity: `${item.quantity} ${item.panSize} pan${item.quantity > 1 ? 's' : ''}`
      })),
      notes: templateDescription
    };

    addItem(templateItem);
    onClose();
    
    // Reset state
    setSelectedItems([]);
    setStep(1);
    setTemplateName('');
    setTemplateDescription('');
    setSearchQuery('');
    setActiveCategory('all');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col max-h-screen"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold">Create Your Own Template</h2>
                <p className="md3-body-small text-gray-600 dark:text-gray-400 mt-1">
                  Step {step} of 3 - {
                    step === 1 ? 'Select Menu Items' :
                    step === 2 ? 'Configure Portions' : 'Review Template'
                  }
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {step === 1 && (
                <div className="p-6 space-y-6">
                  {/* Search and Filter */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 min-w-48"
                    >
                      {CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.label} ({category.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Items Summary */}
                  {selectedItems.length > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h3 className="font-medium mb-2">Selected Items ({selectedItems.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItems.map(item => (
                          <span key={item.uniqueId} className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full md3-body-small">
                            {item.name} ({item.quantity} {item.panSize})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menu Items Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredItems.map(item => (
                      <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="md3-body-small text-gray-600 dark:text-gray-400">{item.description}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {item.dietaryTags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 md3-label-small rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-lg">${item.unitPrice}</p>
                              <p className="md3-label-small text-gray-500">per full pan</p>
                            </div>
                            <button
                              onClick={() => addMenuItem(item)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Configure Portions & Details</h3>
                    <div className="space-y-4">
                      {selectedItems.map((item, index) => (
                        <div key={item.uniqueId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {item.name}
                                {/* Show instance number if there are multiple of the same item */}
                                {selectedItems.filter(si => si.id === item.id).length > 1 && (
                                  <span className="md3-label-small bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                    #{selectedItems.filter(si => si.id === item.id && si.uniqueId <= item.uniqueId).length}
                                  </span>
                                )}
                              </h4>
                              <p className="md3-body-small text-gray-600 dark:text-gray-400">{item.description}</p>
                            </div>
                            <button
                              onClick={() => updateItemQuantity(item.uniqueId, 0)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block md3-body-small font-medium mb-2">Quantity</label>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateItemQuantity(item.uniqueId, Math.max(1, item.quantity - 1))}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateItemQuantity(item.uniqueId, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block md3-body-small font-medium mb-2">Pan Size</label>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updatePanSize(item.uniqueId, 'half')}
                                  className={`px-3 py-2 rounded md3-body-small ${
                                    item.panSize === 'half'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  Half (12 servings)
                                </button>
                                <button
                                  onClick={() => updatePanSize(item.uniqueId, 'full')}
                                  className={`px-3 py-2 rounded md3-body-small ${
                                    item.panSize === 'full'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  Full (24 servings)
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block md3-body-small font-medium mb-2">Template Name *</label>
                      <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="e.g., Post-Workout Recovery Meal"
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                    
                    <div>
                      <label className="block md3-body-small font-medium mb-2">Description (Optional)</label>
                      <textarea
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        placeholder="Describe when this template should be used..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3">Template Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Items:</span>
                        <span>{selectedItems.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Servings:</span>
                        <span>{estimatedServings} people</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Total Price:</span>
                        <span>${calculateTotalPrice().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div>
                    <h4 className="font-medium mb-2">Included Items:</h4>
                    <div className="space-y-2">
                      {selectedItems.map(item => (
                        <div key={item.uniqueId} className="flex justify-between md3-body-small">
                          <span>
                            {item.name}
                            {selectedItems.filter(si => si.id === item.id).length > 1 && (
                              <span className="md3-label-small text-gray-500 ml-1">
                                (#{selectedItems.filter(si => si.id === item.id && si.uniqueId <= item.uniqueId).length})
                              </span>
                            )}
                          </span>
                          <span>{item.quantity} {item.panSize} pan{item.quantity > 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error message */}
                  {saveError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg md3-body-small text-red-700 dark:text-red-400">
                      {saveError}
                    </div>
                  )}
                  
                  {/* Success message */}
                  {showSaveConfirm && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg md3-body-small text-green-700 dark:text-green-400"
                    >
                      ✓ Template saved successfully!
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Back
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {step < 3 && selectedItems.length > 0 && (
                    <span className="md3-body-small text-gray-600 dark:text-gray-400">
                      {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                    </span>
                  )}
                  
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={selectedItems.length === 0}
                      className="md-filled-button disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {step === 1 ? 'Configure Portions' : 'Review Template'}
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTemplate}
                        disabled={selectedItems.length === 0 || !templateName || saving}
                        className="md-outlined-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Template
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleAddToCart}
                        disabled={!templateName || selectedItems.length === 0}
                        className="md-filled-button disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}