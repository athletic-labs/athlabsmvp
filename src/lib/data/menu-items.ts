export interface MenuItem {
  id: string;
  name: string;
  category: 'protein' | 'starch' | 'vegetables' | 'breakfast' | 'also-available' | 'add-ons';
  priceHalf: number;
  priceFull: number;
  servingsHalf: number;
  servingsFull: number;
  unitPrice: number; // For backward compatibility
  description?: string;
  isPopular?: boolean;
  dietaryTags: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  // PROTEINS
  { id: 'p1', name: 'Grilled Chicken Breast', category: 'protein', priceHalf: 120, priceFull: 220, servingsHalf: 12, servingsFull: 24, unitPrice: 220, description: 'Lean grilled chicken breast, seasoned and cooked to perfection', isPopular: true, dietaryTags: ['high-protein', 'gluten-free'] },
  { id: 'p2', name: 'Herb Roasted Chicken Breast', category: 'protein', priceHalf: 120, priceFull: 220, servingsHalf: 12, servingsFull: 24, unitPrice: 220, description: 'Chicken breast roasted with fresh herbs and spices', dietaryTags: ['high-protein', 'gluten-free'] },
  { id: 'p3', name: 'BBQ Chicken Breast', category: 'protein', priceHalf: 120, priceFull: 220, servingsHalf: 12, servingsFull: 24, unitPrice: 220, description: 'Tender chicken breast with tangy BBQ glaze', dietaryTags: ['high-protein'] },
  { id: 'p4', name: 'Teriyaki Chicken Breast', category: 'protein', priceHalf: 125, priceFull: 230, servingsHalf: 12, servingsFull: 24, unitPrice: 230, description: 'Asian-inspired chicken with sweet teriyaki sauce', dietaryTags: ['high-protein'] },
  { id: 'p5', name: 'Chicken Tenders', category: 'protein', priceHalf: 110, priceFull: 200, servingsHalf: 12, servingsFull: 24, unitPrice: 200, description: 'Crispy breaded chicken tenders', dietaryTags: ['high-protein'] },
  { id: 'p6', name: 'Turkey Breast', category: 'protein', priceHalf: 130, priceFull: 240, servingsHalf: 12, servingsFull: 24, unitPrice: 240, description: 'Lean sliced turkey breast', dietaryTags: ['high-protein', 'low-fat'] },
  { id: 'p7', name: 'Turkey Meatballs', category: 'protein', priceHalf: 110, priceFull: 200, servingsHalf: 12, servingsFull: 24, unitPrice: 200, description: 'Seasoned ground turkey meatballs', dietaryTags: ['high-protein', 'low-fat'] },
  { id: 'p8', name: 'Herb Roasted Salmon', category: 'protein', priceHalf: 180, priceFull: 340, servingsHalf: 12, servingsFull: 24, unitPrice: 340, description: 'Fresh Atlantic salmon with herb seasoning', isPopular: true, dietaryTags: ['high-protein', 'omega-3', 'gluten-free'] },
  { id: 'p9', name: 'Teriyaki Salmon', category: 'protein', priceHalf: 185, priceFull: 350, servingsHalf: 12, servingsFull: 24, unitPrice: 350, description: 'Glazed salmon with teriyaki sauce', dietaryTags: ['high-protein', 'omega-3'] },
  { id: 'p10', name: 'Blackened Mahi Mahi', category: 'protein', priceHalf: 170, priceFull: 320, servingsHalf: 12, servingsFull: 24, unitPrice: 320, description: 'Spiced mahi mahi with Cajun seasoning', dietaryTags: ['high-protein', 'gluten-free'] },
  { id: 'p11', name: 'Grilled Shrimp', category: 'protein', priceHalf: 160, priceFull: 300, servingsHalf: 12, servingsFull: 24, unitPrice: 300, description: 'Large grilled shrimp with garlic seasoning', dietaryTags: ['high-protein', 'low-fat', 'gluten-free'] },
  { id: 'p12', name: 'Beef Tenderloin', category: 'protein', priceHalf: 220, priceFull: 420, servingsHalf: 12, servingsFull: 24, unitPrice: 420, description: 'Premium beef tenderloin, perfectly grilled', isPopular: true, dietaryTags: ['high-protein'] },
  { id: 'p13', name: 'Sliced Ribeye', category: 'protein', priceHalf: 210, priceFull: 400, servingsHalf: 12, servingsFull: 24, unitPrice: 400, description: 'Juicy ribeye steak, sliced and seasoned', dietaryTags: ['high-protein'] },
  { id: 'p14', name: 'Beef Short Ribs', category: 'protein', priceHalf: 200, priceFull: 380, servingsHalf: 12, servingsFull: 24, unitPrice: 380, description: 'Slow-cooked beef short ribs', dietaryTags: ['high-protein'] },
  { id: 'p15', name: 'Meatballs (Beef)', category: 'protein', priceHalf: 120, priceFull: 220, servingsHalf: 12, servingsFull: 24, unitPrice: 220, description: 'Classic beef meatballs in marinara sauce', dietaryTags: ['high-protein'] },
  { id: 'p16', name: 'Pulled Pork', category: 'protein', priceHalf: 140, priceFull: 260, servingsHalf: 12, servingsFull: 24, unitPrice: 260, description: 'Slow-cooked pulled pork with BBQ sauce', dietaryTags: ['high-protein'] },
  { id: 'p17', name: 'Pork Tenderloin', category: 'protein', priceHalf: 150, priceFull: 280, servingsHalf: 12, servingsFull: 24, unitPrice: 280, description: 'Lean pork tenderloin with herb seasoning', dietaryTags: ['high-protein'] },
  { id: 'p18', name: 'Italian Sausage', category: 'protein', priceHalf: 110, priceFull: 200, servingsHalf: 12, servingsFull: 24, unitPrice: 200, description: 'Seasoned Italian sausage links', dietaryTags: ['high-protein'] },
  { id: 'p19', name: 'Tofu (Grilled)', category: 'protein', priceHalf: 80, priceFull: 150, servingsHalf: 12, servingsFull: 24, unitPrice: 150, description: 'Marinated and grilled tofu steaks', dietaryTags: ['vegan', 'high-protein', 'gluten-free'] },
  { id: 'p20', name: 'Black Bean Patties', category: 'protein', priceHalf: 90, priceFull: 170, servingsHalf: 12, servingsFull: 24, unitPrice: 170, description: 'Plant-based black bean protein patties', dietaryTags: ['vegan', 'high-protein', 'high-fiber'] },

  // STARCHES
  { id: 's1', name: 'White Rice', category: 'starch', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Fluffy steamed white rice', dietaryTags: ['gluten-free', 'vegan'] },
  { id: 's2', name: 'Brown Rice', category: 'starch', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Nutritious whole grain brown rice', isPopular: true, dietaryTags: ['gluten-free', 'vegan', 'high-fiber'] },
  { id: 's3', name: 'Wild Rice Blend', category: 'starch', priceHalf: 85, priceFull: 160, servingsHalf: 12, servingsFull: 24, unitPrice: 160, description: 'Mix of wild and brown rice with herbs', dietaryTags: ['gluten-free', 'vegan', 'high-fiber'] },
  { id: 's4', name: 'Quinoa', category: 'starch', priceHalf: 80, priceFull: 150, servingsHalf: 12, servingsFull: 24, unitPrice: 150, description: 'Protein-rich quinoa grain', isPopular: true, dietaryTags: ['gluten-free', 'vegan', 'high-protein'] },
  { id: 's5', name: 'Couscous', category: 'starch', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Light and fluffy couscous', dietaryTags: ['vegan'] },
  { id: 's6', name: 'Orzo', category: 'starch', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Rice-shaped pasta with herbs', dietaryTags: ['vegan'] },
  { id: 's7', name: 'Sweet Potato (Roasted)', category: 'starch', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Roasted sweet potato cubes', isPopular: true, dietaryTags: ['gluten-free', 'vegan', 'high-fiber'] },
  { id: 's8', name: 'Sweet Potato (Mashed)', category: 'starch', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Creamy mashed sweet potatoes', dietaryTags: ['gluten-free', 'vegetarian'] },
  { id: 's9', name: 'Red Potatoes (Roasted)', category: 'starch', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Herb-roasted red potato wedges', dietaryTags: ['gluten-free', 'vegan'] },
  { id: 's10', name: 'Garlic Mashed Potatoes', category: 'starch', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Creamy mashed potatoes with roasted garlic', dietaryTags: ['gluten-free', 'vegetarian'] },
  { id: 's11', name: 'Penne Pasta', category: 'starch', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Al dente penne pasta', dietaryTags: ['vegan'] },
  { id: 's12', name: 'Bowtie Pasta', category: 'starch', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Farfalle pasta with olive oil', dietaryTags: ['vegan'] },
  { id: 's13', name: 'Angel Hair Pasta', category: 'starch', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Delicate angel hair pasta', dietaryTags: ['vegan'] },
  { id: 's14', name: 'Whole Wheat Pasta', category: 'starch', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Healthy whole wheat pasta', dietaryTags: ['vegan', 'high-fiber'] },
  { id: 's15', name: 'Mac & Cheese', category: 'starch', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Classic macaroni and cheese', dietaryTags: ['vegetarian'] },
  { id: 's16', name: 'Black Beans', category: 'starch', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Seasoned black beans', dietaryTags: ['vegan', 'high-protein', 'high-fiber'] },
  { id: 's17', name: 'Pinto Beans', category: 'starch', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Seasoned pinto beans', dietaryTags: ['vegan', 'high-protein', 'high-fiber'] },
  { id: 's18', name: 'Chickpeas', category: 'starch', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Roasted chickpeas with spices', dietaryTags: ['vegan', 'high-protein', 'high-fiber'] },
  { id: 's19', name: 'Corn Tortillas', category: 'starch', priceHalf: 40, priceFull: 75, servingsHalf: 12, servingsFull: 24, unitPrice: 75, description: 'Fresh corn tortillas', dietaryTags: ['gluten-free', 'vegan'] },
  { id: 's20', name: 'Flour Tortillas', category: 'starch', priceHalf: 40, priceFull: 75, servingsHalf: 12, servingsFull: 24, unitPrice: 75, description: 'Soft flour tortillas', dietaryTags: ['vegan'] },

  // VEGETABLES
  { id: 'v1', name: 'Roasted Vegetables', category: 'vegetables', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Seasonal vegetables roasted with herbs', isPopular: true, dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v2', name: 'Steamed Broccoli', category: 'vegetables', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Fresh steamed broccoli florets', dietaryTags: ['vegan', 'gluten-free', 'high-fiber'] },
  { id: 'v3', name: 'Grilled Asparagus', category: 'vegetables', priceHalf: 80, priceFull: 150, servingsHalf: 12, servingsFull: 24, unitPrice: 150, description: 'Grilled asparagus spears with lemon', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v4', name: 'Green Beans', category: 'vegetables', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Fresh green beans with almonds', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v5', name: 'Brussels Sprouts', category: 'vegetables', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Roasted Brussels sprouts with bacon', dietaryTags: ['gluten-free'] },
  { id: 'v6', name: 'Carrots (Roasted)', category: 'vegetables', priceHalf: 50, priceFull: 95, servingsHalf: 12, servingsFull: 24, unitPrice: 95, description: 'Honey-glazed roasted carrots', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v7', name: 'Zucchini & Squash', category: 'vegetables', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Grilled zucchini and yellow squash', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v8', name: 'Cauliflower (Roasted)', category: 'vegetables', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Roasted cauliflower with herbs', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v9', name: 'Spinach (Sautéed)', category: 'vegetables', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Sautéed spinach with garlic', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v10', name: 'Kale (Sautéed)', category: 'vegetables', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Sautéed kale with lemon', dietaryTags: ['vegan', 'gluten-free', 'high-fiber'] },
  { id: 'v11', name: 'Caesar Salad', category: 'vegetables', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Classic Caesar salad with croutons', isPopular: true, dietaryTags: ['vegetarian'] },
  { id: 'v12', name: 'Garden Salad', category: 'vegetables', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Mixed greens with vegetables', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v13', name: 'Greek Salad', category: 'vegetables', priceHalf: 80, priceFull: 150, servingsHalf: 12, servingsFull: 24, unitPrice: 150, description: 'Traditional Greek salad with feta', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'v14', name: 'Spinach Salad', category: 'vegetables', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Fresh spinach with strawberries', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'v15', name: 'Arugula Salad', category: 'vegetables', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Peppery arugula with balsamic', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'v16', name: 'Coleslaw', category: 'vegetables', priceHalf: 50, priceFull: 95, servingsHalf: 12, servingsFull: 24, unitPrice: 95, description: 'Creamy coleslaw with cabbage', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'v17', name: 'Caprese Salad', category: 'vegetables', priceHalf: 85, priceFull: 160, servingsHalf: 12, servingsFull: 24, unitPrice: 160, description: 'Fresh mozzarella, tomato, and basil', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'v18', name: 'Corn on the Cob', category: 'vegetables', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Grilled corn with butter', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'v19', name: 'Edamame', category: 'vegetables', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Steamed edamame with sea salt', dietaryTags: ['vegan', 'gluten-free', 'high-protein'] },
  { id: 'v20', name: 'Bell Peppers (Roasted)', category: 'vegetables', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Colorful roasted bell peppers', dietaryTags: ['vegan', 'gluten-free'] },

  // BREAKFAST ITEMS
  { id: 'b1', name: 'Scrambled Eggs', category: 'breakfast', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Fluffy scrambled eggs', dietaryTags: ['vegetarian', 'high-protein', 'gluten-free'] },
  { id: 'b2', name: 'Egg Whites', category: 'breakfast', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Pure egg whites for lean protein', dietaryTags: ['vegetarian', 'high-protein', 'low-fat', 'gluten-free'] },
  { id: 'b3', name: 'Hard Boiled Eggs', category: 'breakfast', priceHalf: 50, priceFull: 95, servingsHalf: 12, servingsFull: 24, unitPrice: 95, description: 'Perfect hard boiled eggs', dietaryTags: ['vegetarian', 'high-protein', 'gluten-free'] },
  { id: 'b4', name: 'Veggie Omelet', category: 'breakfast', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Fluffy omelet with fresh vegetables', dietaryTags: ['vegetarian', 'high-protein', 'gluten-free'] },
  { id: 'b5', name: 'Bacon', category: 'breakfast', priceHalf: 80, priceFull: 150, servingsHalf: 12, servingsFull: 24, unitPrice: 150, description: 'Crispy bacon strips', dietaryTags: ['high-protein', 'gluten-free'] },
  { id: 'b6', name: 'Turkey Bacon', category: 'breakfast', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Lean turkey bacon', dietaryTags: ['high-protein', 'low-fat', 'gluten-free'] },
  { id: 'b7', name: 'Breakfast Sausage', category: 'breakfast', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Seasoned breakfast sausage links', dietaryTags: ['high-protein', 'gluten-free'] },
  { id: 'b8', name: 'Turkey Sausage', category: 'breakfast', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Lean turkey breakfast sausage', dietaryTags: ['high-protein', 'low-fat'] },
  { id: 'b9', name: 'Pancakes', category: 'breakfast', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Fluffy buttermilk pancakes', dietaryTags: ['vegetarian'] },
  { id: 'b10', name: 'French Toast', category: 'breakfast', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Golden French toast with syrup', dietaryTags: ['vegetarian'] },
  { id: 'b11', name: 'Waffles', category: 'breakfast', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Crispy Belgian waffles', dietaryTags: ['vegetarian'] },
  { id: 'b12', name: 'Oatmeal', category: 'breakfast', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Steel-cut oatmeal with toppings', dietaryTags: ['vegan', 'high-fiber'] },
  { id: 'b13', name: 'Greek Yogurt Parfait', category: 'breakfast', priceHalf: 85, priceFull: 160, servingsHalf: 12, servingsFull: 24, unitPrice: 160, description: 'Greek yogurt with granola and berries', dietaryTags: ['vegetarian', 'high-protein'] },
  { id: 'b14', name: 'Breakfast Burrito', category: 'breakfast', priceHalf: 90, priceFull: 170, servingsHalf: 12, servingsFull: 24, unitPrice: 170, description: 'Eggs, cheese, and veggies in tortilla', dietaryTags: ['vegetarian', 'high-protein'] },
  { id: 'b15', name: 'Bagels & Cream Cheese', category: 'breakfast', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Fresh bagels with cream cheese', dietaryTags: ['vegetarian'] },
  { id: 'b16', name: 'English Muffins', category: 'breakfast', priceHalf: 50, priceFull: 95, servingsHalf: 12, servingsFull: 24, unitPrice: 95, description: 'Toasted English muffins', dietaryTags: ['vegetarian'] },
  { id: 'b17', name: 'Hash Browns', category: 'breakfast', priceHalf: 55, priceFull: 100, servingsHalf: 12, servingsFull: 24, unitPrice: 100, description: 'Crispy golden hash browns', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'b18', name: 'Breakfast Potatoes', category: 'breakfast', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Seasoned breakfast potato cubes', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'b19', name: 'Granola', category: 'breakfast', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'House-made granola with nuts', dietaryTags: ['vegetarian', 'high-fiber'] },
  { id: 'b20', name: 'Fresh Fruit Bowl', category: 'breakfast', priceHalf: 95, priceFull: 180, servingsHalf: 12, servingsFull: 24, unitPrice: 180, description: 'Seasonal fresh fruit medley', dietaryTags: ['vegan', 'gluten-free'] },

  // ALSO AVAILABLE
  { id: 'aa1', name: 'Fruit Platter', category: 'also-available', priceHalf: 95, priceFull: 180, servingsHalf: 12, servingsFull: 24, unitPrice: 180, description: 'Assorted fresh fruit platter', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'aa2', name: 'Cheese & Crackers', category: 'also-available', priceHalf: 85, priceFull: 160, servingsHalf: 12, servingsFull: 24, unitPrice: 160, description: 'Artisan cheese with crackers', dietaryTags: ['vegetarian'] },
  { id: 'aa3', name: 'Hummus & Veggies', category: 'also-available', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'House-made hummus with fresh vegetables', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'aa4', name: 'Guacamole & Chips', category: 'also-available', priceHalf: 80, priceFull: 150, servingsHalf: 12, servingsFull: 24, unitPrice: 150, description: 'Fresh guacamole with tortilla chips', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'aa5', name: 'Salsa & Chips', category: 'also-available', priceHalf: 60, priceFull: 110, servingsHalf: 12, servingsFull: 24, unitPrice: 110, description: 'Fresh salsa with tortilla chips', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'aa6', name: 'Spinach Artichoke Dip', category: 'also-available', priceHalf: 75, priceFull: 140, servingsHalf: 12, servingsFull: 24, unitPrice: 140, description: 'Creamy spinach artichoke dip', dietaryTags: ['vegetarian'] },
  { id: 'aa7', name: 'Buffalo Chicken Dip', category: 'also-available', priceHalf: 80, priceFull: 150, servingsHalf: 12, servingsFull: 24, unitPrice: 150, description: 'Spicy buffalo chicken dip', dietaryTags: ['high-protein'] },
  { id: 'aa8', name: 'Bruschetta', category: 'also-available', priceHalf: 70, priceFull: 130, servingsHalf: 12, servingsFull: 24, unitPrice: 130, description: 'Toasted bread with tomato basil topping', dietaryTags: ['vegetarian'] },
  { id: 'aa9', name: 'Caprese Skewers', category: 'also-available', priceHalf: 85, priceFull: 160, servingsHalf: 12, servingsFull: 24, unitPrice: 160, description: 'Mozzarella, tomato, and basil skewers', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'aa10', name: 'Deviled Eggs', category: 'also-available', priceHalf: 65, priceFull: 120, servingsHalf: 12, servingsFull: 24, unitPrice: 120, description: 'Classic deviled eggs', dietaryTags: ['vegetarian', 'high-protein', 'gluten-free'] },
  { id: 'aa11', name: 'Pita Bread', category: 'also-available', priceHalf: 40, priceFull: 75, servingsHalf: 12, servingsFull: 24, unitPrice: 75, description: 'Warm pita bread triangles', dietaryTags: ['vegetarian'] },
  { id: 'aa12', name: 'Naan Bread', category: 'also-available', priceHalf: 45, priceFull: 85, servingsHalf: 12, servingsFull: 24, unitPrice: 85, description: 'Soft Indian naan bread', dietaryTags: ['vegetarian'] },
  { id: 'aa13', name: 'Garlic Bread', category: 'also-available', priceHalf: 50, priceFull: 95, servingsHalf: 12, servingsFull: 24, unitPrice: 95, description: 'Buttery garlic bread slices', dietaryTags: ['vegetarian'] },
  { id: 'aa14', name: 'Dinner Rolls', category: 'also-available', priceHalf: 40, priceFull: 75, servingsHalf: 12, servingsFull: 24, unitPrice: 75, description: 'Fresh baked dinner rolls', dietaryTags: ['vegetarian'] },
  { id: 'aa15', name: 'Tzatziki Sauce', category: 'also-available', priceHalf: 35, priceFull: 65, servingsHalf: 12, servingsFull: 24, unitPrice: 65, description: 'Greek yogurt cucumber sauce', dietaryTags: ['vegetarian', 'gluten-free'] },

  // ADD-ONS
  { id: 'ao1', name: 'Extra Protein', category: 'add-ons', priceHalf: 50, priceFull: 95, servingsHalf: 12, servingsFull: 24, unitPrice: 95, description: 'Additional protein portion', dietaryTags: ['high-protein'] },
  { id: 'ao2', name: 'Avocado', category: 'add-ons', priceHalf: 40, priceFull: 75, servingsHalf: 12, servingsFull: 24, unitPrice: 75, description: 'Fresh sliced avocado', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'ao3', name: 'Extra Sauce', category: 'add-ons', priceHalf: 20, priceFull: 35, servingsHalf: 12, servingsFull: 24, unitPrice: 35, description: 'Additional sauce portion', dietaryTags: [] },
  { id: 'ao4', name: 'Cheese', category: 'add-ons', priceHalf: 30, priceFull: 55, servingsHalf: 12, servingsFull: 24, unitPrice: 55, description: 'Shredded cheese blend', dietaryTags: ['vegetarian', 'high-protein', 'gluten-free'] },
  { id: 'ao5', name: 'Sour Cream', category: 'add-ons', priceHalf: 25, priceFull: 45, servingsHalf: 12, servingsFull: 24, unitPrice: 45, description: 'Fresh sour cream', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'ao6', name: 'Salsa Verde', category: 'add-ons', priceHalf: 25, priceFull: 45, servingsHalf: 12, servingsFull: 24, unitPrice: 45, description: 'Green tomatillo salsa', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'ao7', name: 'BBQ Sauce', category: 'add-ons', priceHalf: 20, priceFull: 35, servingsHalf: 12, servingsFull: 24, unitPrice: 35, description: 'Tangy BBQ sauce', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'ao8', name: 'Ranch Dressing', category: 'add-ons', priceHalf: 20, priceFull: 35, servingsHalf: 12, servingsFull: 24, unitPrice: 35, description: 'Creamy ranch dressing', dietaryTags: ['vegetarian', 'gluten-free'] },
  { id: 'ao9', name: 'Balsamic Vinaigrette', category: 'add-ons', priceHalf: 20, priceFull: 35, servingsHalf: 12, servingsFull: 24, unitPrice: 35, description: 'Balsamic vinaigrette dressing', dietaryTags: ['vegan', 'gluten-free'] },
  { id: 'ao10', name: 'Caesar Dressing', category: 'add-ons', priceHalf: 20, priceFull: 35, servingsHalf: 12, servingsFull: 24, unitPrice: 35, description: 'Classic Caesar dressing', dietaryTags: ['vegetarian'] },
];

export const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    protein: 'red',
    starch: 'yellow', 
    vegetables: 'green',
    breakfast: 'blue',
    'also-available': 'purple',
    'add-ons': 'indigo'
  };
  return colors[category] || 'gray';
};

export const getCategoryIcon = (category: string) => {
  // You can add icons for each category if needed
  return null;
};