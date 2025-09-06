export interface MealTemplate {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  bundle_price: number;
  serves_count: number;
  min_order_hours: number;
  display_order: number;
  includedItems?: TemplateItem[];
  substitutableItems?: string[]; // Items in red from Excel
}

export interface TemplateItem {
  name: string;
  quantity: string;
  canSubstitute: boolean;
}

export const MEAL_TEMPLATES: MealTemplate[] = [
  // Main Meal Templates (1-7)
  {
    id: 'template-1',
    name: 'BYO MED BOWL',
    description: 'Build your own Mediterranean bowl with fresh ingredients',
    cuisine_type: 'Mediterranean',
    bundle_price: 2940.00,
    serves_count: 60,
    min_order_hours: 72,
    display_order: 1,
    substitutableItems: ['Grilled Chicken Breast', 'Quinoa'], // Items in red
    includedItems: [
      { name: 'Grilled Chicken Breast', quantity: '2 FP', canSubstitute: true },
      { name: 'Quinoa', quantity: '2 FP', canSubstitute: true },
      { name: 'Roasted Vegetables', quantity: '2 FP', canSubstitute: false },
      { name: 'Greek Salad', quantity: '1 FP', canSubstitute: false },
      { name: 'Hummus', quantity: '60 servings', canSubstitute: false },
      { name: 'Pita Bread', quantity: '60 servings', canSubstitute: false }
    ]
  },
  {
    id: 'template-2',
    name: 'BYO BURRITO BOWL',
    description: 'Customizable Mexican-style burrito bowls',
    cuisine_type: 'Mexican',
    bundle_price: 2400.00,
    serves_count: 60,
    min_order_hours: 72,
    display_order: 2,
    substitutableItems: ['Grilled Chicken Breast', 'Rice', 'Black Beans'],
    includedItems: [
      { name: 'Grilled Chicken Breast', quantity: '2 FP', canSubstitute: true },
      { name: 'Rice', quantity: '2 FP', canSubstitute: true },
      { name: 'Black Beans', quantity: '1 FP', canSubstitute: true },
      { name: 'Corn Salsa', quantity: '60 servings', canSubstitute: false },
      { name: 'Cheese', quantity: '60 servings', canSubstitute: false },
      { name: 'Sour Cream', quantity: '60 servings', canSubstitute: false },
      { name: 'Guacamole', quantity: '60 servings', canSubstitute: false }
    ]
  },
  {
    id: 'template-3',
    name: 'BYO ASIAN BOWL',
    description: 'Asian-inspired customizable bowls',
    cuisine_type: 'Asian',
    bundle_price: 2600.00,
    serves_count: 60,
    min_order_hours: 72,
    display_order: 3,
    substitutableItems: ['Teriyaki Chicken', 'Brown Rice'],
    includedItems: [
      { name: 'Teriyaki Chicken', quantity: '2 FP', canSubstitute: true },
      { name: 'Brown Rice', quantity: '2 FP', canSubstitute: true },
      { name: 'Stir-Fried Vegetables', quantity: '2 FP', canSubstitute: false },
      { name: 'Edamame', quantity: '60 servings', canSubstitute: false },
      { name: 'Asian Slaw', quantity: '1 FP', canSubstitute: false }
    ]
  },
  {
    id: 'template-4',
    name: 'BYO PASTA BOWL',
    description: 'Italian pasta bar with multiple options',
    cuisine_type: 'Italian',
    bundle_price: 2200.00,
    serves_count: 60,
    min_order_hours: 72,
    display_order: 4,
    substitutableItems: ['Pasta Type', 'Protein Choice'],
    includedItems: [
      { name: 'Penne Pasta', quantity: '2 FP', canSubstitute: true },
      { name: 'Grilled Chicken', quantity: '2 FP', canSubstitute: true },
      { name: 'Marinara Sauce', quantity: '60 servings', canSubstitute: false },
      { name: 'Alfredo Sauce', quantity: '60 servings', canSubstitute: false },
      { name: 'Caesar Salad', quantity: '2 FP', canSubstitute: false },
      { name: 'Garlic Bread', quantity: '60 servings', canSubstitute: false }
    ]
  },
  {
    id: 'template-5',
    name: 'TASTE OF MIAMI',
    description: 'Latin-inspired feast with vibrant flavors',
    cuisine_type: 'Latin',
    bundle_price: 2840.00,
    serves_count: 60,
    min_order_hours: 72,
    display_order: 5,
    substitutableItems: ['Mojo Chicken', 'Yellow Rice'],
    includedItems: [
      { name: 'Mojo Chicken', quantity: '2 FP', canSubstitute: true },
      { name: 'Pulled Pork', quantity: '2 FP', canSubstitute: false },
      { name: 'Yellow Rice', quantity: '2 FP', canSubstitute: true },
      { name: 'Black Beans', quantity: '1 FP', canSubstitute: false },
      { name: 'Sweet Plantains', quantity: '2 FP', canSubstitute: false },
      { name: 'Cuban Bread', quantity: '60 servings', canSubstitute: false }
    ]
  },
  {
    id: 'template-6',
    name: 'LITTLE ITALY',
    description: 'Classic Italian favorites',
    cuisine_type: 'Italian',
    bundle_price: 3200.00,
    serves_count: 60,
    min_order_hours: 72,
    display_order: 6,
    substitutableItems: ['Chicken Parmesan'],
    includedItems: [
      { name: 'Chicken Parmesan', quantity: '2 FP', canSubstitute: true },
      { name: 'Beef Meatballs', quantity: '2 FP', canSubstitute: false },
      { name: 'Spaghetti', quantity: '2 FP', canSubstitute: false },
      { name: 'Marinara Sauce', quantity: '60 servings', canSubstitute: false },
      { name: 'Caesar Salad', quantity: '2 FP', canSubstitute: false },
      { name: 'Garlic Bread', quantity: '60 servings', canSubstitute: false },
      { name: 'Tiramisu', quantity: '60 servings', canSubstitute: false }
    ]
  },
  {
    id: 'template-7',
    name: 'THE CHOPHOUSE',
    description: 'Premium steakhouse experience',
    cuisine_type: 'American',
    bundle_price: 3800.00,
    serves_count: 60,
    min_order_hours: 72,
    display_order: 7,
    substitutableItems: ['Beef Tenderloin'],
    includedItems: [
      { name: 'Beef Tenderloin', quantity: '3 FP', canSubstitute: true },
      { name: 'Garlic Mashed Potatoes', quantity: '2 FP', canSubstitute: false },
      { name: 'Grilled Asparagus', quantity: '2 FP', canSubstitute: false },
      { name: 'Caesar Salad', quantity: '2 FP', canSubstitute: false },
      { name: 'Dinner Rolls', quantity: '60 servings', canSubstitute: false }
    ]
  },

  // Premium Template (8)
  {
    id: 'template-8',
    name: 'CHEF ADAM EXPERIENCE',
    description: 'Premium chef-curated multi-course experience',
    cuisine_type: 'Premium',
    bundle_price: 4590.00,
    serves_count: 60,
    min_order_hours: 96, // Requires 4 days notice
    display_order: 8,
    substitutableItems: [],
    includedItems: [
      { name: 'Chef\'s Selection Appetizer', quantity: '60 servings', canSubstitute: false },
      { name: 'Premium Protein Trio', quantity: '3 FP', canSubstitute: false },
      { name: 'Seasonal Vegetables', quantity: '2 FP', canSubstitute: false },
      { name: 'Artisan Sides', quantity: '3 FP', canSubstitute: false },
      { name: 'Gourmet Salad', quantity: '2 FP', canSubstitute: false },
      { name: 'Chef\'s Dessert Selection', quantity: '60 servings', canSubstitute: false }
    ]
  },

  // Breakfast Templates (9-11)
  {
    id: 'template-9',
    name: 'BREAKFAST ESSENTIALS',
    description: 'Classic breakfast favorites',
    cuisine_type: 'Breakfast',
    bundle_price: 1800.00,
    serves_count: 60,
    min_order_hours: 48,
    display_order: 9,
    substitutableItems: ['Scrambled Eggs'],
    includedItems: [
      { name: 'Scrambled Eggs', quantity: '2 FP', canSubstitute: true },
      { name: 'Bacon', quantity: '60 servings', canSubstitute: false },
      { name: 'Breakfast Sausage', quantity: '60 servings', canSubstitute: false },
      { name: 'Hash Browns', quantity: '2 FP', canSubstitute: false },
      { name: 'Fresh Fruit', quantity: '60 servings', canSubstitute: false },
      { name: 'Orange Juice', quantity: '60 servings', canSubstitute: false }
    ]
  },
  {
    id: 'template-10',
    name: 'BREAKFAST ESSENTIALS',
    description: 'Elevated brunch experience',
    cuisine_type: 'Breakfast',
    bundle_price: 2200.00,
    serves_count: 60,
    min_order_hours: 48,
    display_order: 10,
    substitutableItems: ['French Toast', 'Veggie Omelet'],
    includedItems: [
      { name: 'French Toast', quantity: '60 servings', canSubstitute: true },
      { name: 'Veggie Omelet', quantity: '2 FP', canSubstitute: true },
      { name: 'Turkey Bacon', quantity: '60 servings', canSubstitute: false },
      { name: 'Breakfast Potatoes', quantity: '2 FP', canSubstitute: false },
      { name: 'Greek Yogurt Parfait', quantity: '60 servings', canSubstitute: false },
      { name: 'Assorted Pastries', quantity: '60 servings', canSubstitute: false }
    ]
  },
  {
    id: 'template-11',
    name: 'BREAKFAST MENU (Specials)',
    description: 'Premium breakfast selection with specialty items',
    cuisine_type: 'Breakfast',
    bundle_price: 2400.00,
    serves_count: 60,
    min_order_hours: 48,
    display_order: 11,
    substitutableItems: ['Eggs Benedict', 'Pancakes'],
    includedItems: [
      { name: 'Eggs Benedict', quantity: '60 servings', canSubstitute: true },
      { name: 'Pancakes', quantity: '60 servings', canSubstitute: true },
      { name: 'Applewood Bacon', quantity: '60 servings', canSubstitute: false },
      { name: 'Chicken Sausage', quantity: '60 servings', canSubstitute: false },
      { name: 'Roasted Potatoes', quantity: '2 FP', canSubstitute: false },
      { name: 'Fresh Fruit Platter', quantity: '2 FP', canSubstitute: false },
      { name: 'Smoothie Bar', quantity: '60 servings', canSubstitute: false }
    ]
  }
];