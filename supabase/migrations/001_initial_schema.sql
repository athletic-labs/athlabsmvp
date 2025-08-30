-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Custom types
CREATE TYPE user_role AS ENUM ('team_staff', 'team_admin', 'athletic_labs_admin', 'athletic_labs_staff');
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded');
CREATE TYPE pan_size AS ENUM ('half', 'full');
CREATE TYPE item_category AS ENUM ('Protein', 'Starch', 'Vegetables', 'Breakfast', 'Also Available', 'Add-Ons / Alternatives');
CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'system');

-- Leagues table
CREATE TABLE leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  sport TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  roster_size INTEGER DEFAULT 60,
  protein_target INTEGER CHECK (protein_target BETWEEN 0 AND 100),
  carbs_target INTEGER CHECK (carbs_target BETWEEN 0 AND 100),
  fats_target INTEGER CHECK (fats_target BETWEEN 0 AND 100),
  nutritional_preset TEXT,
  CONSTRAINT nutrition_total CHECK (protein_target + carbs_target + fats_target = 100),
  stripe_customer_id TEXT UNIQUE,
  billing_email TEXT,
  tax_rate DECIMAL(5,4) DEFAULT 0.0875,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, name)
);

-- User profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'team_staff',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme_mode theme_mode DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team schedules
CREATE TABLE team_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME,
  is_home_game BOOLEAN DEFAULT TRUE,
  location TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, game_date, game_time)
);

-- Menu templates
CREATE TABLE menu_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT NOT NULL,
  bundle_price DECIMAL(10,2) NOT NULL,
  serves_count INTEGER DEFAULT 60,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  min_order_hours INTEGER DEFAULT 72,
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category item_category NOT NULL,
  price_per_person DECIMAL(10,2),
  price_half_pan DECIMAL(10,2),
  price_full_pan DECIMAL(10,2),
  servings_half_pan INTEGER DEFAULT 12,
  servings_full_pan INTEGER DEFAULT 24,
  pan_notation TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_add_on BOOLEAN DEFAULT FALSE,
  dietary_flags TEXT[],
  allergens TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  status order_status NOT NULL DEFAULT 'pending',
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_time TIME,
  delivery_address TEXT NOT NULL,
  delivery_instructions TEXT,
  estimated_guests INTEGER NOT NULL,
  game_id UUID REFERENCES team_schedules(id),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0875,
  tax_amount DECIMAL(10,2) NOT NULL,
  rush_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  is_rush_order BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('template', 'individual')),
  template_id UUID REFERENCES menu_templates(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  pan_size pan_size,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  substitutions JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved templates
CREATE TABLE saved_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- System settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial settings
INSERT INTO system_settings (key, value, description) VALUES
  ('ORDER_MINIMUM_HOURS', '72', 'Minimum hours for regular orders'),
  ('ORDER_RUSH_MINIMUM_HOURS', '24', 'Minimum hours for rush orders'),
  ('ORDER_RUSH_FEE_PERCENT', '25', 'Rush order fee percentage'),
  ('ORDER_MINIMUM_AMOUNT', '500', 'Minimum order amount in dollars'),
  ('TAX_RATE_DEFAULT', '8.75', 'Default tax rate percentage');

-- Seed initial leagues
INSERT INTO leagues (name, abbreviation, sport) VALUES
  ('National Football League', 'NFL', 'Football'),
  ('National Basketball Association', 'NBA', 'Basketball'),
  ('National Hockey League', 'NHL', 'Hockey'),
  ('Major League Baseball', 'MLB', 'Baseball'),
  ('Major League Soccer', 'MLS', 'Soccer'),
  ('Minor League Baseball', 'MiLB', 'Baseball'),
  ('National Women''s Soccer League', 'NWSL', 'Soccer'),
  ('Women''s National Basketball Association', 'WNBA', 'Basketball');

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view their team" ON teams FOR SELECT USING (id IN (SELECT team_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view their team's orders" ON orders FOR SELECT USING (team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can create orders for their team" ON orders FOR INSERT WITH CHECK (team_id IN (SELECT team_id FROM profiles WHERE id = auth.uid()));