export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price?: number; // For add-ons only
}

export interface MealTemplateComplete {
  id: string;
  name: string;
  description: string;
  cuisine_type: string;
  bundle_price: number;
  serves_count: number;
  min_order_hours: number;
  image_url: string;
  items: MenuItem[]; // Base items included in template
  addOns: MenuItem[]; // Optional add-on items with pricing
}

export const TEMPLATES_WITH_FULL_DATA: MealTemplateComplete[] = [
  {
    id: 'mediterranean-feast',
    name: 'Mediterranean Feast',
    description: 'Fresh flavors from the Mediterranean with grilled meats, fresh vegetables, and authentic sides',
    cuisine_type: 'Mediterranean',
    bundle_price: 1125,
    serves_count: 60,
    min_order_hours: 48,
    image_url: '/images/templates/mediterranean.jpg',
    items: [
      { id: 'chicken-shawarma', name: 'Chicken Shawarma', category: 'Proteins' },
      { id: 'beef-kabobs', name: 'Beef Kabobs', category: 'Proteins' },
      { id: 'hummus', name: 'Hummus', category: 'Appetizers' },
      { id: 'tabbouleh', name: 'Tabbouleh', category: 'Salads' },
      { id: 'greek-salad', name: 'Greek Salad', category: 'Salads' },
      { id: 'pita-bread', name: 'Pita Bread', category: 'Sides' },
      { id: 'rice-pilaf', name: 'Rice Pilaf', category: 'Sides' },
      { id: 'tzatziki', name: 'Tzatziki', category: 'Sauces' }
    ],
    addOns: [
      { id: 'lamb-kabobs', name: 'Lamb Kabobs', category: 'Proteins', price: 85 },
      { id: 'falafel', name: 'Falafel', category: 'Proteins', price: 45 },
      { id: 'baba-ganoush', name: 'Baba Ganoush', category: 'Appetizers', price: 35 },
      { id: 'stuffed-grape-leaves', name: 'Stuffed Grape Leaves', category: 'Appetizers', price: 40 },
      { id: 'mediterranean-pasta', name: 'Mediterranean Pasta Salad', category: 'Salads', price: 55 },
      { id: 'roasted-vegetables', name: 'Roasted Mediterranean Vegetables', category: 'Sides', price: 50 },
      { id: 'baklava', name: 'Baklava', category: 'Desserts', price: 60 }
    ]
  },
  {
    id: 'mexican-fiesta',
    name: 'Mexican Fiesta',
    description: 'Vibrant Mexican flavors with fresh salsas, authentic proteins, and traditional accompaniments',
    cuisine_type: 'Mexican',
    bundle_price: 975,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/mexican.jpg',
    items: [
      { id: 'carnitas', name: 'Slow-Cooked Carnitas', category: 'Proteins' },
      { id: 'chicken-fajitas', name: 'Chicken Fajitas', category: 'Proteins' },
      { id: 'guacamole', name: 'Fresh Guacamole', category: 'Appetizers' },
      { id: 'pico-de-gallo', name: 'Pico de Gallo', category: 'Salsas' },
      { id: 'mexican-rice', name: 'Mexican Rice', category: 'Sides' },
      { id: 'refried-beans', name: 'Refried Beans', category: 'Sides' },
      { id: 'flour-tortillas', name: 'Flour Tortillas', category: 'Sides' },
      { id: 'corn-tortillas', name: 'Corn Tortillas', category: 'Sides' }
    ],
    addOns: [
      { id: 'steak-fajitas', name: 'Steak Fajitas', category: 'Proteins', price: 95 },
      { id: 'al-pastor', name: 'Al Pastor', category: 'Proteins', price: 75 },
      { id: 'queso-blanco', name: 'Queso Blanco', category: 'Appetizers', price: 40 },
      { id: 'elote', name: 'Mexican Street Corn (Elote)', category: 'Sides', price: 55 },
      { id: 'churros', name: 'Churros with Chocolate', category: 'Desserts', price: 65 },
      { id: 'tres-leches', name: 'Tres Leches Cake', category: 'Desserts', price: 70 },
      { id: 'horchata', name: 'Horchata', category: 'Beverages', price: 45 }
    ]
  },
  {
    id: 'asian-fusion',
    name: 'Asian Fusion',
    description: 'Modern Asian cuisine blending traditional flavors with contemporary cooking techniques',
    cuisine_type: 'Asian',
    bundle_price: 1225,
    serves_count: 60,
    min_order_hours: 48,
    image_url: '/images/templates/asian.jpg',
    items: [
      { id: 'teriyaki-chicken', name: 'Teriyaki Chicken', category: 'Proteins' },
      { id: 'beef-broccoli', name: 'Beef and Broccoli', category: 'Proteins' },
      { id: 'vegetable-spring-rolls', name: 'Vegetable Spring Rolls', category: 'Appetizers' },
      { id: 'fried-rice', name: 'Fried Rice', category: 'Sides' },
      { id: 'lo-mein', name: 'Lo Mein Noodles', category: 'Sides' },
      { id: 'steamed-vegetables', name: 'Steamed Mixed Vegetables', category: 'Vegetables' },
      { id: 'asian-salad', name: 'Asian Cucumber Salad', category: 'Salads' },
      { id: 'soy-ginger-sauce', name: 'Soy Ginger Sauce', category: 'Sauces' }
    ],
    addOns: [
      { id: 'orange-chicken', name: 'Orange Chicken', category: 'Proteins', price: 80 },
      { id: 'kung-pao-chicken', name: 'Kung Pao Chicken', category: 'Proteins', price: 75 },
      { id: 'pork-dumplings', name: 'Pork Dumplings', category: 'Appetizers', price: 65 },
      { id: 'pad-thai', name: 'Pad Thai', category: 'Sides', price: 70 },
      { id: 'sesame-noodles', name: 'Cold Sesame Noodles', category: 'Sides', price: 60 },
      { id: 'miso-soup', name: 'Miso Soup', category: 'Soups', price: 35 },
      { id: 'fortune-cookies', name: 'Fortune Cookies', category: 'Desserts', price: 25 }
    ]
  },
  {
    id: 'italian-classic',
    name: 'Italian Classic',
    description: 'Traditional Italian comfort food featuring homemade pasta, fresh sauces, and classic sides',
    cuisine_type: 'Italian',
    bundle_price: 1050,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/italian.jpg',
    items: [
      { id: 'chicken-parmigiana', name: 'Chicken Parmigiana', category: 'Proteins' },
      { id: 'lasagna', name: 'Meat Lasagna', category: 'Pasta' },
      { id: 'penne-marinara', name: 'Penne Marinara', category: 'Pasta' },
      { id: 'caesar-salad', name: 'Caesar Salad', category: 'Salads' },
      { id: 'garlic-bread', name: 'Garlic Bread', category: 'Sides' },
      { id: 'caprese-salad', name: 'Caprese Salad', category: 'Salads' },
      { id: 'marinara-sauce', name: 'Marinara Sauce', category: 'Sauces' },
      { id: 'parmesan-cheese', name: 'Grated Parmesan', category: 'Toppings' }
    ],
    addOns: [
      { id: 'eggplant-parmigiana', name: 'Eggplant Parmigiana', category: 'Proteins', price: 70 },
      { id: 'fettuccine-alfredo', name: 'Fettuccine Alfredo', category: 'Pasta', price: 75 },
      { id: 'antipasto-platter', name: 'Antipasto Platter', category: 'Appetizers', price: 85 },
      { id: 'tiramisu', name: 'Tiramisu', category: 'Desserts', price: 80 },
      { id: 'bruschetta', name: 'Bruschetta', category: 'Appetizers', price: 45 },
      { id: 'italian-wedding-soup', name: 'Italian Wedding Soup', category: 'Soups', price: 60 },
      { id: 'gelato', name: 'Assorted Gelato', category: 'Desserts', price: 55 }
    ]
  },
  {
    id: 'southern-comfort',
    name: 'Southern Comfort',
    description: 'Hearty Southern cuisine with comfort foods that bring warmth and satisfaction to any gathering',
    cuisine_type: 'American',
    bundle_price: 925,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/southern.jpg',
    items: [
      { id: 'fried-chicken', name: 'Southern Fried Chicken', category: 'Proteins' },
      { id: 'pulled-pork', name: 'BBQ Pulled Pork', category: 'Proteins' },
      { id: 'mac-and-cheese', name: 'Mac and Cheese', category: 'Sides' },
      { id: 'coleslaw', name: 'Creamy Coleslaw', category: 'Salads' },
      { id: 'cornbread', name: 'Buttermilk Cornbread', category: 'Sides' },
      { id: 'baked-beans', name: 'BBQ Baked Beans', category: 'Sides' },
      { id: 'potato-salad', name: 'Southern Potato Salad', category: 'Salads' },
      { id: 'bbq-sauce', name: 'House BBQ Sauce', category: 'Sauces' }
    ],
    addOns: [
      { id: 'ribs', name: 'BBQ Ribs', category: 'Proteins', price: 120 },
      { id: 'catfish', name: 'Fried Catfish', category: 'Proteins', price: 90 },
      { id: 'collard-greens', name: 'Collard Greens', category: 'Vegetables', price: 45 },
      { id: 'sweet-potato-casserole', name: 'Sweet Potato Casserole', category: 'Sides', price: 55 },
      { id: 'hush-puppies', name: 'Hush Puppies', category: 'Sides', price: 35 },
      { id: 'peach-cobbler', name: 'Peach Cobbler', category: 'Desserts', price: 75 },
      { id: 'sweet-tea', name: 'Sweet Tea', category: 'Beverages', price: 30 }
    ]
  },
  {
    id: 'latin-fusion',
    name: 'Latin Fusion',
    description: 'Contemporary Latin American dishes with bold flavors and fresh tropical ingredients',
    cuisine_type: 'Latin',
    bundle_price: 1175,
    serves_count: 60,
    min_order_hours: 48,
    image_url: '/images/templates/latin.jpg',
    items: [
      { id: 'mojo-chicken', name: 'Mojo Marinated Chicken', category: 'Proteins' },
      { id: 'ropa-vieja', name: 'Ropa Vieja', category: 'Proteins' },
      { id: 'plantains', name: 'Sweet Plantains', category: 'Sides' },
      { id: 'black-beans-rice', name: 'Black Beans and Rice', category: 'Sides' },
      { id: 'yuca-fries', name: 'Yuca Fries', category: 'Sides' },
      { id: 'tropical-salad', name: 'Tropical Fruit Salad', category: 'Salads' },
      { id: 'chimichurri', name: 'Chimichurri Sauce', category: 'Sauces' },
      { id: 'garlic-sauce', name: 'Garlic Mojo Sauce', category: 'Sauces' }
    ],
    addOns: [
      { id: 'churrasco-steak', name: 'Churrasco Steak', category: 'Proteins', price: 110 },
      { id: 'empanadas', name: 'Beef Empanadas', category: 'Appetizers', price: 65 },
      { id: 'ceviche', name: 'Shrimp Ceviche', category: 'Appetizers', price: 85 },
      { id: 'tres-leches-cake', name: 'Tres Leches Cake', category: 'Desserts', price: 70 },
      { id: 'flan', name: 'Traditional Flan', category: 'Desserts', price: 65 },
      { id: 'agua-fresca', name: 'Agua Fresca', category: 'Beverages', price: 40 },
      { id: 'coconut-rice', name: 'Coconut Rice', category: 'Sides', price: 50 }
    ]
  },
  {
    id: 'asian-bbq',
    name: 'Asian BBQ',
    description: 'Grilled Asian specialties with sweet and savory glazes, perfect for outdoor events',
    cuisine_type: 'Asian',
    bundle_price: 1275,
    serves_count: 60,
    min_order_hours: 48,
    image_url: '/images/templates/asian-bbq.jpg',
    items: [
      { id: 'korean-bbq-beef', name: 'Korean BBQ Beef', category: 'Proteins' },
      { id: 'teriyaki-salmon', name: 'Teriyaki Glazed Salmon', category: 'Proteins' },
      { id: 'chicken-satay', name: 'Chicken Satay', category: 'Proteins' },
      { id: 'kimchi', name: 'Kimchi', category: 'Vegetables' },
      { id: 'jasmine-rice', name: 'Jasmine Rice', category: 'Sides' },
      { id: 'asian-slaw', name: 'Asian Slaw', category: 'Salads' },
      { id: 'edamame', name: 'Steamed Edamame', category: 'Appetizers' },
      { id: 'peanut-sauce', name: 'Peanut Dipping Sauce', category: 'Sauces' }
    ],
    addOns: [
      { id: 'miso-glazed-cod', name: 'Miso Glazed Cod', category: 'Proteins', price: 125 },
      { id: 'pork-belly-bao', name: 'Pork Belly Bao Buns', category: 'Appetizers', price: 90 },
      { id: 'ramen-noodles', name: 'Ramen Noodle Salad', category: 'Salads', price: 60 },
      { id: 'mochi-ice-cream', name: 'Mochi Ice Cream', category: 'Desserts', price: 55 },
      { id: 'sake', name: 'Sake Selection', category: 'Beverages', price: 120 },
      { id: 'gyoza', name: 'Pork Gyoza', category: 'Appetizers', price: 50 },
      { id: 'seaweed-salad', name: 'Seaweed Salad', category: 'Salads', price: 40 }
    ]
  },
  {
    id: 'breakfast-brunch',
    name: 'Breakfast & Brunch',
    description: 'Perfect morning spread with both sweet and savory options for any time of day',
    cuisine_type: 'Breakfast',
    bundle_price: 825,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/breakfast.jpg',
    items: [
      { id: 'scrambled-eggs', name: 'Fluffy Scrambled Eggs', category: 'Proteins' },
      { id: 'bacon', name: 'Crispy Bacon', category: 'Proteins' },
      { id: 'breakfast-sausage', name: 'Breakfast Sausage', category: 'Proteins' },
      { id: 'hash-browns', name: 'Golden Hash Browns', category: 'Sides' },
      { id: 'pancakes', name: 'Buttermilk Pancakes', category: 'Sweet' },
      { id: 'fresh-fruit', name: 'Fresh Seasonal Fruit', category: 'Fruit' },
      { id: 'orange-juice', name: 'Fresh Orange Juice', category: 'Beverages' },
      { id: 'coffee', name: 'Freshly Brewed Coffee', category: 'Beverages' }
    ],
    addOns: [
      { id: 'belgian-waffles', name: 'Belgian Waffles', category: 'Sweet', price: 60 },
      { id: 'french-toast', name: 'French Toast', category: 'Sweet', price: 55 },
      { id: 'smoked-salmon', name: 'Smoked Salmon Platter', category: 'Proteins', price: 95 },
      { id: 'bagels-cream-cheese', name: 'Bagels with Cream Cheese', category: 'Breads', price: 45 },
      { id: 'yogurt-parfait', name: 'Greek Yogurt Parfait', category: 'Healthy', price: 50 },
      { id: 'breakfast-burrito', name: 'Breakfast Burritos', category: 'Wraps', price: 70 },
      { id: 'mimosas', name: 'Mimosa Bar', category: 'Beverages', price: 85 }
    ]
  },
  {
    id: 'premium-gourmet',
    name: 'Premium Gourmet',
    description: 'Elevated dining experience with premium ingredients and sophisticated flavors',
    cuisine_type: 'Premium',
    bundle_price: 1675,
    serves_count: 60,
    min_order_hours: 72,
    image_url: '/images/templates/premium.jpg',
    items: [
      { id: 'filet-mignon', name: 'Herb-Crusted Filet Mignon', category: 'Proteins' },
      { id: 'lobster-tails', name: 'Butter Poached Lobster Tails', category: 'Seafood' },
      { id: 'truffle-risotto', name: 'Truffle Mushroom Risotto', category: 'Sides' },
      { id: 'arugula-salad', name: 'Arugula and Pear Salad', category: 'Salads' },
      { id: 'roasted-asparagus', name: 'Roasted Asparagus', category: 'Vegetables' },
      { id: 'dinner-rolls', name: 'Artisan Dinner Rolls', category: 'Breads' },
      { id: 'chocolate-mousse', name: 'Dark Chocolate Mousse', category: 'Desserts' },
      { id: 'wine-pairing', name: 'Wine Pairing Selection', category: 'Beverages' }
    ],
    addOns: [
      { id: 'oysters', name: 'Fresh Oysters on Half Shell', category: 'Seafood', price: 140 },
      { id: 'foie-gras', name: 'Seared Foie Gras', category: 'Appetizers', price: 180 },
      { id: 'wagyu-beef', name: 'Wagyu Beef Tenderloin', category: 'Proteins', price: 250 },
      { id: 'caviar-service', name: 'Caviar Service', category: 'Appetizers', price: 300 },
      { id: 'champagne', name: 'Premium Champagne', category: 'Beverages', price: 200 },
      { id: 'cheese-course', name: 'Artisan Cheese Course', category: 'Cheese', price: 95 },
      { id: 'dessert-tasting', name: 'Dessert Tasting Platter', category: 'Desserts', price: 110 }
    ]
  },
  {
    id: 'healthy-mediterranean',
    name: 'Healthy Mediterranean',
    description: 'Light and nutritious Mediterranean options focusing on fresh vegetables and lean proteins',
    cuisine_type: 'Mediterranean',
    bundle_price: 1075,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/healthy-med.jpg',
    items: [
      { id: 'grilled-salmon', name: 'Grilled Mediterranean Salmon', category: 'Proteins' },
      { id: 'chicken-souvlaki', name: 'Chicken Souvlaki', category: 'Proteins' },
      { id: 'quinoa-salad', name: 'Mediterranean Quinoa Salad', category: 'Salads' },
      { id: 'grilled-vegetables', name: 'Grilled Seasonal Vegetables', category: 'Vegetables' },
      { id: 'lemon-herb-rice', name: 'Lemon Herb Rice', category: 'Sides' },
      { id: 'mixed-olives', name: 'Marinated Mixed Olives', category: 'Appetizers' },
      { id: 'whole-wheat-pita', name: 'Whole Wheat Pita', category: 'Breads' },
      { id: 'olive-oil-herbs', name: 'Extra Virgin Olive Oil with Herbs', category: 'Condiments' }
    ],
    addOns: [
      { id: 'grilled-halibut', name: 'Grilled Halibut', category: 'Proteins', price: 135 },
      { id: 'stuffed-peppers', name: 'Quinoa Stuffed Peppers', category: 'Vegetables', price: 65 },
      { id: 'lentil-soup', name: 'Mediterranean Lentil Soup', category: 'Soups', price: 45 },
      { id: 'fruit-platter', name: 'Fresh Mediterranean Fruit Platter', category: 'Fruit', price: 55 },
      { id: 'herb-tea', name: 'Mediterranean Herb Tea', category: 'Beverages', price: 25 },
      { id: 'protein-bowls', name: 'Build-Your-Own Protein Bowls', category: 'Healthy', price: 80 },
      { id: 'greek-yogurt', name: 'Greek Yogurt with Honey', category: 'Desserts', price: 40 }
    ]
  },
  {
    id: 'bbq-smokehouse',
    name: 'BBQ Smokehouse',
    description: 'Authentic barbecue with slow-smoked meats and traditional Southern sides',
    cuisine_type: 'American',
    bundle_price: 1150,
    serves_count: 60,
    min_order_hours: 48,
    image_url: '/images/templates/bbq.jpg',
    items: [
      { id: 'smoked-brisket', name: 'Smoked Brisket', category: 'Proteins' },
      { id: 'pulled-chicken', name: 'Pulled BBQ Chicken', category: 'Proteins' },
      { id: 'smoked-ribs', name: 'Smoked Pork Ribs', category: 'Proteins' },
      { id: 'cornbread-muffins', name: 'Cornbread Muffins', category: 'Breads' },
      { id: 'coleslaw-tangy', name: 'Tangy Coleslaw', category: 'Salads' },
      { id: 'baked-beans-smokehouse', name: 'Smokehouse Baked Beans', category: 'Sides' },
      { id: 'potato-salad-bbq', name: 'BBQ Potato Salad', category: 'Salads' },
      { id: 'bbq-sauces', name: 'Assorted BBQ Sauces', category: 'Sauces' }
    ],
    addOns: [
      { id: 'smoked-turkey', name: 'Smoked Turkey Breast', category: 'Proteins', price: 95 },
      { id: 'burnt-ends', name: 'Burnt Ends', category: 'Proteins', price: 85 },
      { id: 'jalapeno-poppers', name: 'Bacon-Wrapped Jalapeño Poppers', category: 'Appetizers', price: 60 },
      { id: 'corn-casserole', name: 'Corn Casserole', category: 'Sides', price: 50 },
      { id: 'banana-pudding', name: 'Banana Pudding', category: 'Desserts', price: 65 },
      { id: 'beer-selection', name: 'Craft Beer Selection', category: 'Beverages', price: 90 },
      { id: 'pickle-platter', name: 'Pickle and Onion Platter', category: 'Sides', price: 30 }
    ]
  },
  {
    id: 'seafood-coastal',
    name: 'Seafood Coastal',
    description: 'Fresh coastal flavors featuring the finest seafood with complementary sides and sauces',
    cuisine_type: 'American',
    bundle_price: 1425,
    serves_count: 60,
    min_order_hours: 72,
    image_url: '/images/templates/seafood.jpg',
    items: [
      { id: 'grilled-shrimp', name: 'Grilled Jumbo Shrimp', category: 'Seafood' },
      { id: 'fish-tacos', name: 'Blackened Fish Tacos', category: 'Seafood' },
      { id: 'crab-cakes', name: 'Maryland Crab Cakes', category: 'Seafood' },
      { id: 'corn-chowder', name: 'New England Corn Chowder', category: 'Soups' },
      { id: 'cilantro-lime-rice', name: 'Cilantro Lime Rice', category: 'Sides' },
      { id: 'tropical-slaw', name: 'Tropical Coleslaw', category: 'Salads' },
      { id: 'dinner-rolls-coastal', name: 'Coastal Dinner Rolls', category: 'Breads' },
      { id: 'tartar-sauce', name: 'House Tartar Sauce', category: 'Sauces' }
    ],
    addOns: [
      { id: 'lobster-roll', name: 'Maine Lobster Roll', category: 'Seafood', price: 160 },
      { id: 'oyster-bar', name: 'Raw Oyster Bar', category: 'Seafood', price: 140 },
      { id: 'clam-chowder', name: 'New England Clam Chowder', category: 'Soups', price: 75 },
      { id: 'shrimp-cocktail', name: 'Jumbo Shrimp Cocktail', category: 'Appetizers', price: 95 },
      { id: 'key-lime-pie', name: 'Key Lime Pie', category: 'Desserts', price: 60 },
      { id: 'white-wine', name: 'Coastal White Wine Selection', category: 'Beverages', price: 110 },
      { id: 'stuffed-clams', name: 'Stuffed Clams', category: 'Appetizers', price: 70 }
    ]
  },
  {
    id: 'comfort-classics',
    name: 'Comfort Classics',
    description: 'All-American comfort foods that everyone loves, perfect for casual gatherings and team events',
    cuisine_type: 'American',
    bundle_price: 875,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/comfort.jpg',
    items: [
      { id: 'meatloaf', name: 'Classic Meatloaf', category: 'Proteins' },
      { id: 'fried-chicken-comfort', name: 'Fried Chicken', category: 'Proteins' },
      { id: 'mashed-potatoes', name: 'Creamy Mashed Potatoes', category: 'Sides' },
      { id: 'green-bean-casserole', name: 'Green Bean Casserole', category: 'Vegetables' },
      { id: 'dinner-rolls-comfort', name: 'Homestyle Dinner Rolls', category: 'Breads' },
      { id: 'garden-salad', name: 'Garden Salad', category: 'Salads' },
      { id: 'gravy', name: 'Country Gravy', category: 'Sauces' },
      { id: 'butter', name: 'Whipped Butter', category: 'Condiments' }
    ],
    addOns: [
      { id: 'pot-roast', name: 'Slow-Cooked Pot Roast', category: 'Proteins', price: 85 },
      { id: 'chicken-pot-pie', name: 'Chicken Pot Pie', category: 'Entrees', price: 75 },
      { id: 'corn-on-cob', name: 'Buttered Corn on the Cob', category: 'Vegetables', price: 40 },
      { id: 'apple-pie', name: 'Homemade Apple Pie', category: 'Desserts', price: 65 },
      { id: 'chocolate-cake', name: 'Chocolate Layer Cake', category: 'Desserts', price: 70 },
      { id: 'iced-tea', name: 'Fresh Iced Tea', category: 'Beverages', price: 25 },
      { id: 'biscuits-honey', name: 'Buttermilk Biscuits with Honey', category: 'Breads', price: 35 }
    ]
  },
  {
    id: 'vegetarian-garden',
    name: 'Vegetarian Garden',
    description: 'Plant-based paradise with creative vegetarian dishes full of flavor and nutrition',
    cuisine_type: 'Mediterranean',
    bundle_price: 925,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/vegetarian.jpg',
    items: [
      { id: 'stuffed-portobello', name: 'Stuffed Portobello Mushrooms', category: 'Proteins' },
      { id: 'vegetable-lasagna', name: 'Roasted Vegetable Lasagna', category: 'Pasta' },
      { id: 'quinoa-stuffed-peppers', name: 'Quinoa Stuffed Bell Peppers', category: 'Vegetables' },
      { id: 'mediterranean-orzo', name: 'Mediterranean Orzo Salad', category: 'Salads' },
      { id: 'roasted-root-vegetables', name: 'Roasted Root Vegetables', category: 'Vegetables' },
      { id: 'focaccia-bread', name: 'Herb Focaccia Bread', category: 'Breads' },
      { id: 'tahini-dressing', name: 'Lemon Tahini Dressing', category: 'Dressings' },
      { id: 'fresh-herbs', name: 'Fresh Herb Mix', category: 'Garnishes' }
    ],
    addOns: [
      { id: 'grilled-halloumi', name: 'Grilled Halloumi Cheese', category: 'Proteins', price: 65 },
      { id: 'eggplant-moussaka', name: 'Vegetarian Moussaka', category: 'Entrees', price: 80 },
      { id: 'falafel-platter', name: 'Falafel Platter', category: 'Proteins', price: 55 },
      { id: 'vegetable-soup', name: 'Roasted Vegetable Soup', category: 'Soups', price: 40 },
      { id: 'vegan-dessert', name: 'Vegan Chocolate Avocado Mousse', category: 'Desserts', price: 50 },
      { id: 'kombucha', name: 'Craft Kombucha Selection', category: 'Beverages', price: 45 },
      { id: 'hummus-trio', name: 'Hummus Trio (Classic, Red Pepper, Olive)', category: 'Appetizers', price: 40 }
    ]
  },
  {
    id: 'taco-bar',
    name: 'Build-Your-Own Taco Bar',
    description: 'Interactive taco station with multiple proteins, fresh toppings, and authentic salsas',
    cuisine_type: 'Mexican',
    bundle_price: 1025,
    serves_count: 60,
    min_order_hours: 24,
    image_url: '/images/templates/taco-bar.jpg',
    items: [
      { id: 'seasoned-ground-beef', name: 'Seasoned Ground Beef', category: 'Proteins' },
      { id: 'grilled-chicken-strips', name: 'Grilled Chicken Strips', category: 'Proteins' },
      { id: 'carnitas-taco', name: 'Slow-Cooked Carnitas', category: 'Proteins' },
      { id: 'hard-taco-shells', name: 'Hard Taco Shells', category: 'Shells' },
      { id: 'soft-flour-tortillas', name: 'Soft Flour Tortillas', category: 'Shells' },
      { id: 'taco-toppings', name: 'Taco Toppings Bar', category: 'Toppings' },
      { id: 'salsa-verde', name: 'Salsa Verde', category: 'Salsas' },
      { id: 'salsa-roja', name: 'Salsa Roja', category: 'Salsas' }
    ],
    addOns: [
      { id: 'fish-tacos-addon', name: 'Grilled Fish for Tacos', category: 'Proteins', price: 85 },
      { id: 'chorizo', name: 'Mexican Chorizo', category: 'Proteins', price: 70 },
      { id: 'queso-fundido', name: 'Queso Fundido', category: 'Toppings', price: 50 },
      { id: 'mexican-street-corn', name: 'Mexican Street Corn Salad', category: 'Sides', price: 45 },
      { id: 'churros-cinnamon', name: 'Churros with Cinnamon Sugar', category: 'Desserts', price: 60 },
      { id: 'margarita-mix', name: 'Margarita Mix (Non-Alcoholic)', category: 'Beverages', price: 40 },
      { id: 'jalapeno-poppers-taco', name: 'Jalapeño Poppers', category: 'Appetizers', price: 55 }
    ]
  }
];

