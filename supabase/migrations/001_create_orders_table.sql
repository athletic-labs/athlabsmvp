-- Create orders table for Athletic Labs
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  
  -- Order details
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL, -- in cents
  tax INTEGER NOT NULL, -- in cents
  total INTEGER NOT NULL, -- in cents
  
  -- Delivery information
  delivery_date DATE NOT NULL,
  delivery_timing TEXT NOT NULL, -- arrival, pre-game, post-game, etc.
  delivery_time TEXT, -- specific time like "14:00"
  delivery_location TEXT,
  
  -- Additional info
  notes TEXT,
  special_instructions TEXT,
  
  -- Order status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_intent_id TEXT, -- Stripe payment intent ID
  
  -- User information (for when authentication is added)
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own orders)
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow anonymous for now

CREATE POLICY "Users can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow anonymous for now

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create templates table for saved meal templates
CREATE TABLE IF NOT EXISTS meal_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL,
  total_servings INTEGER,
  estimated_cost INTEGER, -- in cents
  
  -- Categorization
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre-game', 'post-game')),
  dietary_tags TEXT[], -- vegetarian, vegan, gluten-free, etc.
  
  -- User information
  user_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for templates
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON meal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_meal_type ON meal_templates(meal_type);
CREATE INDEX IF NOT EXISTS idx_templates_public ON meal_templates(is_public);

-- RLS for templates
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates and public ones" 
  ON meal_templates FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true OR auth.uid() IS NULL);

CREATE POLICY "Users can create templates" 
  ON meal_templates FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own templates" 
  ON meal_templates FOR UPDATE 
  USING (auth.uid() = user_id);

-- Trigger for templates updated_at
CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON meal_templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();