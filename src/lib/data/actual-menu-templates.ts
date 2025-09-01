export interface TemplateItem {
  section: 'Base' | 'Add-Ons / Alternatives';
  name: string;
  notes: string;
  includedInBundle: boolean;
  priceIfAddOn?: number; // in cents
}

export interface MealTemplate {
  id: string;
  name: string;
  bundlePrice: number; // in cents
  servesCount: number;
  minOrderHours: number;
  cuisineType: string;
  description: string;
  items: TemplateItem[];
}

export const ACTUAL_MENU_TEMPLATES: MealTemplate[] = [
  {
    id: 'byo-med-bowl',
    name: 'BYO MED BOWL',
    bundlePrice: 294000, // $2,940
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Mediterranean',
    description: 'Build your own Mediterranean bowl with fresh ingredients',
    items: [
      // BASE ITEMS
      { section: 'Base', name: 'Fresh Baked Pita', notes: '60', includedInBundle: true },
      { section: 'Base', name: 'Saffron Basmati Rice', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Chicken Shawarma', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Steak Souvlaki', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Tahini Roasted Cauliflower', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Cucumber Tomato Salad', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Fresh Hummus', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Fresh Tzatziki', notes: '1 HP', includedInBundle: true },
      // ADD-ONS
      { section: 'Add-Ons / Alternatives', name: 'Jasmine Rice', notes: '', includedInBundle: false, priceIfAddOn: 11000 },
      { section: 'Add-Ons / Alternatives', name: 'Baja Shrimp', notes: '', includedInBundle: false, priceIfAddOn: 30000 },
      { section: 'Add-Ons / Alternatives', name: 'Shredded Beef', notes: '', includedInBundle: false, priceIfAddOn: 22000 },
      { section: 'Add-Ons / Alternatives', name: 'Blackened Mahi Bites', notes: '', includedInBundle: false, priceIfAddOn: 32000 },
      { section: 'Add-Ons / Alternatives', name: 'Fajita Pepper Mix', notes: '', includedInBundle: false, priceIfAddOn: 9500 },
      { section: 'Add-Ons / Alternatives', name: 'QuesaRibeye Street Tacos', notes: '', includedInBundle: false, priceIfAddOn: 28000 },
      { section: 'Add-Ons / Alternatives', name: 'Mexican Street Corn', notes: '', includedInBundle: false, priceIfAddOn: 11000 },
      { section: 'Add-Ons / Alternatives', name: 'Signature Corn Salsa', notes: '', includedInBundle: false, priceIfAddOn: 7500 }
    ]
  },
  {
    id: 'byo-burrito-bowl',
    name: 'BYO BURRITO BOWL',
    bundlePrice: 288000, // $2,880
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Mexican',
    description: 'Customizable Mexican-style burrito bowls',
    items: [
      { section: 'Base', name: 'Flour Tortillas', notes: '60', includedInBundle: true },
      { section: 'Base', name: 'Cilantro Lime Rice', notes: '3 FP', includedInBundle: true },
      { section: 'Base', name: 'Dominican Black Beans', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Grass-Fed Steak', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Chipotle Chicken Thighs', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Fresh Lettuce', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Fresh Pico', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Crispy Tortilla Strips', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Monterey Jack Cheese', notes: '1 HP', includedInBundle: true },
      { section: 'Add-Ons / Alternatives', name: 'Mediterranean Pearled Couscous', notes: '', includedInBundle: false, priceIfAddOn: 12000 },
      { section: 'Add-Ons / Alternatives', name: 'Chicken Feta Meatballs', notes: '', includedInBundle: false, priceIfAddOn: 20000 },
      { section: 'Add-Ons / Alternatives', name: 'Green Goddess Chicken', notes: '', includedInBundle: false, priceIfAddOn: 22000 },
      { section: 'Add-Ons / Alternatives', name: 'Lemon Garlic Shrimp', notes: '', includedInBundle: false, priceIfAddOn: 30000 },
      { section: 'Add-Ons / Alternatives', name: 'Traditional Greek Salad', notes: '', includedInBundle: false, priceIfAddOn: 14000 },
      { section: 'Add-Ons / Alternatives', name: 'Garlic Dip', notes: '', includedInBundle: false, priceIfAddOn: 6500 }
    ]
  },
  {
    id: 'byo-asian-bowl',
    name: 'BYO ASIAN BOWL',
    bundlePrice: 286000, // $2,860
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Asian',
    description: 'Asian-inspired customizable bowls',
    items: [
      { section: 'Base', name: 'Udon Teriyaki Noodles', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Hibachi Fried Rice', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Chicken Teriyaki', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Sweet Chili Shrimp', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Honey Garlic Carrots', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Garlic Sauteed Green Beans', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Ginger Salad', notes: '1 FP', includedInBundle: true },
      { section: 'Add-Ons / Alternatives', name: 'Jasmine Rice', notes: '', includedInBundle: false, priceIfAddOn: 11000 },
      { section: 'Add-Ons / Alternatives', name: 'Asian Braised Salmon', notes: '', includedInBundle: false, priceIfAddOn: 34000 },
      { section: 'Add-Ons / Alternatives', name: 'Mongolian Beef', notes: '', includedInBundle: false, priceIfAddOn: 38000 },
      { section: 'Add-Ons / Alternatives', name: 'Hibachi Zucchini Mix', notes: '', includedInBundle: false, priceIfAddOn: 11000 },
      { section: 'Add-Ons / Alternatives', name: 'Sweet Chili Crispy Brussels', notes: '', includedInBundle: false, priceIfAddOn: 13000 },
      { section: 'Add-Ons / Alternatives', name: 'Miso Charred Baby Bok Choy', notes: '', includedInBundle: false, priceIfAddOn: 12000 },
      { section: 'Add-Ons / Alternatives', name: 'Toro Tartare Sushi Nachos', notes: '', includedInBundle: false, priceIfAddOn: 45000 },
      { section: 'Add-Ons / Alternatives', name: 'Butter Krab Poke Bowls', notes: '', includedInBundle: false, priceIfAddOn: 38000 }
    ]
  },
  {
    id: 'byo-pasta-bowl',
    name: 'BYO PASTA BOWL',
    bundlePrice: 292000, // $2,920
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Italian',
    description: 'Italian pasta bar with multiple options',
    items: [
      { section: 'Base', name: 'Penne', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Fettucine', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Chicken Tortellini', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Alfredo Sauce', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Vodka Sauce', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Marinara Sauce', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Diced Grilled Chicken', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Grass-Fed Beef Meatballs', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Roasted Zucchini', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Steamed Broccoli', notes: '1 HP', includedInBundle: true },
      { section: 'Base', name: 'Raw Spinach', notes: '1 FP', includedInBundle: true },
      { section: 'Add-Ons / Alternatives', name: 'Various Pasta Shapes', notes: '', includedInBundle: false, priceIfAddOn: 12000 },
      { section: 'Add-Ons / Alternatives', name: 'Chopped Bacon', notes: '', includedInBundle: false, priceIfAddOn: 15000 },
      { section: 'Add-Ons / Alternatives', name: 'Sundried Tomato Cream Sauce', notes: '', includedInBundle: false, priceIfAddOn: 8500 },
      { section: 'Add-Ons / Alternatives', name: 'Roasted Cauliflower', notes: '', includedInBundle: false, priceIfAddOn: 12000 },
      { section: 'Add-Ons / Alternatives', name: 'Scratch Caesar Salad', notes: '', includedInBundle: false, priceIfAddOn: 14000 },
      { section: 'Add-Ons / Alternatives', name: 'Grilled Asparagus', notes: '', includedInBundle: false, priceIfAddOn: 15000 },
      { section: 'Add-Ons / Alternatives', name: 'Prosciutto Caprese Baguettes', notes: '', includedInBundle: false, priceIfAddOn: 18000 }
    ]
  },
  {
    id: 'taste-of-miami',
    name: 'TASTE OF MIAMI',
    bundlePrice: 284000, // $2,840
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Latin',
    description: 'Latin-inspired feast with vibrant flavors',
    items: [
      { section: 'Base', name: 'Jasmine Rice', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Peruvian Potatoes', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Dominican Black Beans', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Pollo a la Plancha', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Chimichurri Steak', notes: '1.5 FP', includedInBundle: true },
      { section: 'Base', name: 'Roasted Sweet Plantains', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Fajita Pepper Mix', notes: '1 HP', includedInBundle: true },
      { section: 'Add-Ons / Alternatives', name: 'Cuban Sandwiches', notes: '', includedInBundle: false, priceIfAddOn: 28000 },
      { section: 'Add-Ons / Alternatives', name: 'Spanish Shrimp Paella', notes: '', includedInBundle: false, priceIfAddOn: 36000 },
      { section: 'Add-Ons / Alternatives', name: 'Churrasco Steak', notes: '', includedInBundle: false, priceIfAddOn: 42000 },
      { section: 'Add-Ons / Alternatives', name: 'Congri', notes: '', includedInBundle: false, priceIfAddOn: 11000 },
      { section: 'Add-Ons / Alternatives', name: 'Cilantro Lime Rice', notes: '', includedInBundle: false, priceIfAddOn: 11000 },
      { section: 'Add-Ons / Alternatives', name: 'Chicken & Cheese Empanadas', notes: '', includedInBundle: false, priceIfAddOn: 18000 }
    ]
  },
  {
    id: 'little-italy',
    name: 'LITTLE ITALY',
    bundlePrice: 358000, // $3,580
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Italian',
    description: 'Classic Italian favorites',
    items: [
      { section: 'Base', name: 'Fettucine Alfredo', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Rigatoni Vodka', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Chicken alla Vodka', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Shrimp Oreganata', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'House Italian Meatballs', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Scratch Caesar Salad', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Charred Broccolini', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Lemon Ricotta Cheesecake', notes: '50 pcs.', includedInBundle: true },
      { section: 'Add-Ons / Alternatives', name: 'Brown Butter Risotto', notes: '', includedInBundle: false, priceIfAddOn: 18000 },
      { section: 'Add-Ons / Alternatives', name: 'Sicilian Charcuterie', notes: '', includedInBundle: false, priceIfAddOn: 32000 },
      { section: 'Add-Ons / Alternatives', name: 'Spaghetti Marinara', notes: '', includedInBundle: false, priceIfAddOn: 12000 },
      { section: 'Add-Ons / Alternatives', name: 'Chicken Parm', notes: '', includedInBundle: false, priceIfAddOn: 24000 },
      { section: 'Add-Ons / Alternatives', name: 'Chicken Francese', notes: '', includedInBundle: false, priceIfAddOn: 26000 },
      { section: 'Add-Ons / Alternatives', name: 'Chicken Marsala', notes: '', includedInBundle: false, priceIfAddOn: 26000 },
      { section: 'Add-Ons / Alternatives', name: 'Italian Steak', notes: '', includedInBundle: false, priceIfAddOn: 42000 },
      { section: 'Add-Ons / Alternatives', name: 'Chicken Vodka Sliders', notes: '', includedInBundle: false, priceIfAddOn: 18000 }
    ]
  },
  {
    id: 'the-chophouse',
    name: 'THE CHOPHOUSE',
    bundlePrice: 385000, // $3,850
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'American',
    description: 'Premium steakhouse experience',
    items: [
      { section: 'Base', name: 'Loaded Mashed Potatoes', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Signature Mac', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Chophouse NY Strip (Prime)', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Garlic Parm Lobster Tail', notes: '50 tails', includedInBundle: true },
      { section: 'Base', name: 'Reggiano Brussels', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Cobb Salad', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Chocolate Cake', notes: '50 pcs.', includedInBundle: true },
      { section: 'Add-Ons / Alternatives', name: 'Truffle Fries', notes: '', includedInBundle: false, priceIfAddOn: 16000 },
      { section: 'Add-Ons / Alternatives', name: 'Garlic Rosemary Reds', notes: '', includedInBundle: false, priceIfAddOn: 13000 },
      { section: 'Add-Ons / Alternatives', name: 'Montreal Chicken Thighs', notes: '', includedInBundle: false, priceIfAddOn: 22000 },
      { section: 'Add-Ons / Alternatives', name: "Mama's Baby Back Ribs", notes: '', includedInBundle: false, priceIfAddOn: 38000 },
      { section: 'Add-Ons / Alternatives', name: 'Prime Top Sirloin', notes: '', includedInBundle: false, priceIfAddOn: 36000 },
      { section: 'Add-Ons / Alternatives', name: 'Grilled Asparagus', notes: '', includedInBundle: false, priceIfAddOn: 15000 },
      { section: 'Add-Ons / Alternatives', name: 'Honey Roasted Carrots', notes: '', includedInBundle: false, priceIfAddOn: 11000 }
    ]
  },
  {
    id: 'chef-adam-experience',
    name: 'CHEF ADAM EXPERIENCE',
    bundlePrice: 459000, // $4,590
    servesCount: 60,
    minOrderHours: 96,
    cuisineType: 'Premium',
    description: 'Premium chef-curated multi-course experience',
    items: [
      { section: 'Base', name: 'Smashed Reggiano Fingerlings', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Lobster Risotto', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Wagyu Denvers', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Miso Glazed Chilean Sea Bass', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Rosemary Dijon Lamb Chops', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Crispy Thai Brussels', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Mexican Street Corn', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Cajeta Churros', notes: '75 pcs.', includedInBundle: true },
      { section: 'Add-Ons / Alternatives', name: 'Signature Golden Sushi Roll', notes: '', includedInBundle: false, priceIfAddOn: 48000 },
      { section: 'Add-Ons / Alternatives', name: 'House Dumplings (wagyu/shrimp/chicken)', notes: '', includedInBundle: false, priceIfAddOn: 28000 },
      { section: 'Add-Ons / Alternatives', name: "Adam's Signature Sushi Boat", notes: '', includedInBundle: false, priceIfAddOn: 85000 },
      { section: 'Add-Ons / Alternatives', name: 'Butter Krab Roll', notes: '', includedInBundle: false, priceIfAddOn: 38000 },
      { section: 'Add-Ons / Alternatives', name: 'Home Fries', notes: '', includedInBundle: false, priceIfAddOn: 11000 },
      { section: 'Add-Ons / Alternatives', name: 'Garlic Parm Lobster Tails', notes: '', includedInBundle: false, priceIfAddOn: 45000 },
      { section: 'Add-Ons / Alternatives', name: 'Montreal Chicken Thighs', notes: '', includedInBundle: false, priceIfAddOn: 22000 },
      { section: 'Add-Ons / Alternatives', name: 'Smashed Wagyu Sliders', notes: '', includedInBundle: false, priceIfAddOn: 32000 },
      { section: 'Add-Ons / Alternatives', name: 'Toro Tartare Sushi Nachos', notes: '', includedInBundle: false, priceIfAddOn: 45000 },
      { section: 'Add-Ons / Alternatives', name: 'Chilled Lobster Toast', notes: '', includedInBundle: false, priceIfAddOn: 38000 }
    ]
  },
  {
    id: 'breakfast-specials',
    name: 'BREAKFAST SPECIALS / GO-TO BRUNCH',
    bundlePrice: 309000, // $3,090
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Breakfast',
    description: 'Complete breakfast and brunch spread',
    items: [
      { section: 'Base', name: 'Fluffy Scrambled Eggs', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Home Fries', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Frosted Chicken & Waffles', notes: '2 FP', includedInBundle: true },
      { section: 'Base', name: 'Thick Cut Bacon', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Chicken Sausage', notes: '1 FP', includedInBundle: true },
      { section: 'Base', name: 'Yogurt Fruit Parfaits', notes: '25', includedInBundle: true },
      { section: 'Base', name: 'Seasonal Fruit Medley', notes: '1 FP', includedInBundle: true }
    ]
  },
  {
    id: 'breakfast-essentials',
    name: 'BREAKFAST ESSENTIALS',
    bundlePrice: 270000, // $2,700 starting price
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Breakfast',
    description: 'Customizable breakfast essentials - mix and match',
    items: [
      { section: 'Base', name: 'Fluffy Scrambled Eggs', notes: '', includedInBundle: false, priceIfAddOn: 18000 },
      { section: 'Base', name: 'Sunny Side-Up Eggs', notes: '', includedInBundle: false, priceIfAddOn: 18000 },
      { section: 'Base', name: 'Hard-Boiled Eggs', notes: '', includedInBundle: false, priceIfAddOn: 15000 },
      { section: 'Base', name: 'Egg Bites', notes: 'customizable', includedInBundle: false, priceIfAddOn: 22000 },
      { section: 'Base', name: 'Omelettes', notes: 'customizable', includedInBundle: false, priceIfAddOn: 25000 },
      { section: 'Base', name: 'Home Fries', notes: '', includedInBundle: false, priceIfAddOn: 12000 },
      { section: 'Base', name: 'Multigrain Toast', notes: '', includedInBundle: false, priceIfAddOn: 8000 },
      { section: 'Base', name: 'English Muffins', notes: '', includedInBundle: false, priceIfAddOn: 9000 },
      { section: 'Base', name: 'Sweet Potato Hash', notes: '', includedInBundle: false, priceIfAddOn: 14000 },
      { section: 'Base', name: 'Buttermilk Pancakes', notes: '', includedInBundle: false, priceIfAddOn: 16000 },
      { section: 'Base', name: 'Chicken Sausage', notes: '', includedInBundle: false, priceIfAddOn: 18000 },
      { section: 'Base', name: 'Thick Cut Bacon', notes: '', includedInBundle: false, priceIfAddOn: 20000 },
      { section: 'Base', name: 'Uncured Turkey Bacon', notes: '', includedInBundle: false, priceIfAddOn: 18000 },
      { section: 'Base', name: 'Picanha Steak', notes: '', includedInBundle: false, priceIfAddOn: 35000 },
      { section: 'Base', name: 'Sliced Avocado', notes: '', includedInBundle: false, priceIfAddOn: 15000 },
      { section: 'Base', name: 'Seasonal Fruit Medley', notes: '', includedInBundle: false, priceIfAddOn: 14000 },
      { section: 'Base', name: 'Clementines', notes: '', includedInBundle: false, priceIfAddOn: 10000 },
      { section: 'Base', name: 'Lemon Dijon Spring Salad', notes: '', includedInBundle: false, priceIfAddOn: 16000 }
    ]
  },
  {
    id: 'breakfast-menu-specials',
    name: 'BREAKFAST MENU (Specials)',
    bundlePrice: 270000, // $2,700 starting price
    servesCount: 60,
    minOrderHours: 72,
    cuisineType: 'Breakfast',
    description: 'Specialty breakfast items available',
    items: [
      { section: 'Add-Ons / Alternatives', name: 'Breakfast Burritos', notes: '', includedInBundle: false, priceIfAddOn: 28000 },
      { section: 'Add-Ons / Alternatives', name: 'Almond na Tigela Acai Bowls', notes: '', includedInBundle: false, priceIfAddOn: 32000 },
      { section: 'Add-Ons / Alternatives', name: 'Yogurt Fruit Parfaits', notes: '', includedInBundle: false, priceIfAddOn: 18000 },
      { section: 'Add-Ons / Alternatives', name: 'Frosted Chicken & Waffles', notes: '', includedInBundle: false, priceIfAddOn: 35000 },
      { section: 'Add-Ons / Alternatives', name: 'Breakfast Quesadillas', notes: '', includedInBundle: false, priceIfAddOn: 25000 },
      { section: 'Add-Ons / Alternatives', name: 'Sweet Cream Pancakes', notes: '', includedInBundle: false, priceIfAddOn: 18000 },
      { section: 'Add-Ons / Alternatives', name: 'Southern Biscuits & Sausage Gravy', notes: '', includedInBundle: false, priceIfAddOn: 22000 },
      { section: 'Add-Ons / Alternatives', name: 'Breakfast Tacos', notes: '', includedInBundle: false, priceIfAddOn: 24000 },
      { section: 'Add-Ons / Alternatives', name: 'American Eggs Benedict', notes: '', includedInBundle: false, priceIfAddOn: 38000 },
      { section: 'Add-Ons / Alternatives', name: 'Banana Chocolate Chip Muffins', notes: '', includedInBundle: false, priceIfAddOn: 12000 }
    ]
  }
];