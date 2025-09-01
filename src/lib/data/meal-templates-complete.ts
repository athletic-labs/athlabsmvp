export interface BundleItem {
  section: 'Base' | 'Add-Ons / Alternatives';
  name: string;
  notes: string; // "2 FP", "1 HP", "60", etc.
  includedInBundle: boolean;
  priceIfAddOn?: number; // Price if adding as extra
}

export interface MealTemplateComplete {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  bundlePrice: number;
  servesCount: number;
  min_order_hours: number;
  display_order: number;
  items: BundleItem[];
}

export const COMPLETE_TEMPLATES: MealTemplateComplete[] = [
  {
    id: 'template-1',
    name: 'BYO MED BOWL',
    description: 'Build your own Mediterranean bowl with fresh ingredients',
    cuisine_type: 'Mediterranean',
    bundlePrice: 2940,
    servesCount: 60,
    min_order_hours: 72,
    display_order: 1,
    items: [
      // Base items (included)
      { section: 'Base', name: 'Fresh Baked Pita', notes: '60', includedInBundle: true },
      { section: 'Base', name: 'Saffron Basmati Rice', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Chicken Shawarma', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Steak Souvlaki', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Tahini Roasted Cauliflower', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Cucumber Tomato Salad', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Fresh Hummus', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Fresh Tzatziki', notes: '1 HP', includedInBundle: true },
      // Add-ons (not included, can be added)
      { section: 'Add-Ons / Alternatives', name: 'Jasmine Rice', notes: '', includedInBundle: false, priceIfAddOn: 110 },
      { section: 'Add-Ons / Alternatives', name: 'Baja Shrimp', notes: '', includedInBundle: false, priceIfAddOn: 300 },
      { section: 'Add-Ons / Alternatives', name: 'Shredded Beef', notes: '', includedInBundle: false, priceIfAddOn: 220 },
      { section: 'Add-Ons / Alternatives', name: 'Blackened Mahi Bites', notes: '', includedInBundle: false, priceIfAddOn: 320 },
      { section: 'Add-Ons / Alternatives', name: 'Fajita Pepper Mix', notes: '', includedInBundle: false, priceIfAddOn: 95 },
      { section: 'Add-Ons / Alternatives', name: 'QuesaRibeye Street Tacos', notes: '', includedInBundle: false, priceIfAddOn: 280 },
      { section: 'Add-Ons / Alternatives', name: 'Mexican Street Corn', notes: '', includedInBundle: false, priceIfAddOn: 110 },
      { section: 'Add-Ons / Alternatives', name: 'Signature Corn Salsa', notes: '', includedInBundle: false, priceIfAddOn: 75 }
    ]
  },
  {
    id: 'template-2',
    name: 'BYO BURRITO BOWL',
    description: 'Customizable Mexican-style burrito bowls',
    cuisine_type: 'Mexican',
    bundlePrice: 2400,
    servesCount: 60,
    min_order_hours: 72,
    display_order: 2,
    items: [
      // Base items (included)
      { section: 'Base', name: 'Cilantro Lime Rice', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Grilled Chicken Breast', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Black Beans', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Corn Salsa', notes: '60 servings', includedInBundle: true },
      { section: 'Base', name: 'Shredded Cheese', notes: '60 servings', includedInBundle: true },
      { section: 'Base', name: 'Sour Cream', notes: '60 servings', includedInBundle: true },
      { section: 'Base', name: 'Fresh Guacamole', notes: '60 servings', includedInBundle: true },
      // Add-ons
      { section: 'Add-Ons / Alternatives', name: 'Carnitas', notes: '', includedInBundle: false, priceIfAddOn: 250 },
      { section: 'Add-Ons / Alternatives', name: 'Steak Fajitas', notes: '', includedInBundle: false, priceIfAddOn: 320 },
      { section: 'Add-Ons / Alternatives', name: 'Pinto Beans', notes: '', includedInBundle: false, priceIfAddOn: 85 },
      { section: 'Add-Ons / Alternatives', name: 'Jalapeños', notes: '', includedInBundle: false, priceIfAddOn: 45 },
      { section: 'Add-Ons / Alternatives', name: 'Pico de Gallo', notes: '', includedInBundle: false, priceIfAddOn: 65 },
      { section: 'Add-Ons / Alternatives', name: 'Queso Blanco', notes: '', includedInBundle: false, priceIfAddOn: 95 }
    ]
  },
  {
    id: 'template-3',
    name: 'BYO ASIAN BOWL',
    description: 'Asian-inspired customizable bowls',
    cuisine_type: 'Asian',
    bundlePrice: 2600,
    servesCount: 60,
    min_order_hours: 72,
    display_order: 3,
    items: [
      // Base items (included)
      { section: 'Base', name: 'Jasmine Rice', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Teriyaki Chicken', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Stir-Fried Vegetables', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Edamame', notes: '60 servings', includedInBundle: true },
      { section: 'Base', name: 'Asian Slaw', notes: '1 FP', includedInBundle: true },
      // Add-ons
      { section: 'Add-Ons / Alternatives', name: 'Orange Chicken', notes: '', includedInBundle: false, priceIfAddOn: 280 },
      { section: 'Add-Ons / Alternatives', name: 'Beef & Broccoli', notes: '', includedInBundle: false, priceIfAddOn: 320 },
      { section: 'Add-Ons / Alternatives', name: 'Fried Rice', notes: '', includedInBundle: false, priceIfAddOn: 130 },
      { section: 'Add-Ons / Alternatives', name: 'Spring Rolls', notes: '', includedInBundle: false, priceIfAddOn: 180 },
      { section: 'Add-Ons / Alternatives', name: 'Sesame Noodles', notes: '', includedInBundle: false, priceIfAddOn: 145 }
    ]
  },
  {
    id: 'template-4',
    name: 'BYO PASTA BOWL',
    description: 'Italian pasta bar with multiple options',
    cuisine_type: 'Italian',
    bundlePrice: 2200,
    servesCount: 60,
    min_order_hours: 72,
    display_order: 4,
    items: [
      // Base items (included)
      { section: 'Base', name: 'Penne Pasta', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Grilled Chicken', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Marinara Sauce', notes: '60 servings', includedInBundle: true },
      { section: 'Base', name: 'Alfredo Sauce', notes: '60 servings', includedInBundle: true },
      { section: 'Base', name: 'Caesar Salad', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Garlic Bread', notes: '60 servings', includedInBundle: true },
      // Add-ons
      { section: 'Add-Ons / Alternatives', name: 'Italian Sausage', notes: '', includedInBundle: false, priceIfAddOn: 240 },
      { section: 'Add-Ons / Alternatives', name: 'Shrimp Scampi', notes: '', includedInBundle: false, priceIfAddOn: 350 },
      { section: 'Add-Ons / Alternatives', name: 'Fettuccine', notes: '', includedInBundle: false, priceIfAddOn: 120 },
      { section: 'Add-Ons / Alternatives', name: 'Pesto Sauce', notes: '', includedInBundle: false, priceIfAddOn: 85 },
      { section: 'Add-Ons / Alternatives', name: 'Meatballs', notes: '', includedInBundle: false, priceIfAddOn: 180 }
    ]
  },
  {
    id: 'template-5',
    name: 'TASTE OF MIAMI',
    description: 'Latin-inspired feast with vibrant flavors',
    cuisine_type: 'Latin',
    bundlePrice: 2840,
    servesCount: 60,
    min_order_hours: 72,
    display_order: 5,
    items: [
      // Base items (included)
      { section: 'Base', name: 'Yellow Rice', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Mojo Chicken', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Pulled Pork', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Black Beans', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Sweet Plantains', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Cuban Bread', notes: '60 servings', includedInBundle: true },
      // Add-ons
      { section: 'Add-Ons / Alternatives', name: 'Ropa Vieja', notes: '', includedInBundle: false, priceIfAddOn: 290 },
      { section: 'Add-Ons / Alternatives', name: 'Grilled Fish', notes: '', includedInBundle: false, priceIfAddOn: 340 },
      { section: 'Add-Ons / Alternatives', name: 'Yuca Fries', notes: '', includedInBundle: false, priceIfAddOn: 125 },
      { section: 'Add-Ons / Alternatives', name: 'Moros y Cristianos', notes: '', includedInBundle: false, priceIfAddOn: 110 }
    ]
  }
];