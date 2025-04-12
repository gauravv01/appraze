-- PerformAI Database Implementation in Supabase
-- This script creates all necessary tables, types, functions, triggers, and policies

-- =====================
-- SETUP CUSTOM TYPES
-- =====================

-- Employee status type
CREATE TYPE employee_status AS ENUM ('Active', 'On Leave', 'Inactive');

-- Review status type
CREATE TYPE review_status AS ENUM ('Draft', 'In Progress', 'Completed', 'Archived');

-- Field type for custom review fields
CREATE TYPE field_type AS ENUM ('text', 'textarea', 'number', 'select', 'radio', 'checkbox');

-- Invoice status type
CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'uncollectible', 'void');

-- =====================
-- CREATE FUNCTIONS
-- =====================

-- Function to update timestamp on record modification
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- CREATE TABLES
-- =====================

-- 1. Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  subscription_plan TEXT DEFAULT 'starter',
  subscription_status TEXT DEFAULT 'active',
  subscription_period_end TIMESTAMP WITH TIME ZONE,
  payment_method_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Employees table
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status employee_status NOT NULL DEFAULT 'Active',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- 3. Review templates table
CREATE TABLE review_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  template_id UUID REFERENCES review_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  review_type TEXT NOT NULL, -- e.g., "Annual Review", "Quarterly Check-in"
  status review_status NOT NULL DEFAULT 'Draft',
  progress INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  content TEXT, -- Stores the generated review content
  strengths TEXT,
  improvements TEXT,
  overall_rating INTEGER, -- 1-5 scale
  tone_preference TEXT,
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Review fields table
CREATE TABLE review_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type field_type NOT NULL,
  options JSONB, -- For select, radio, checkbox types
  required BOOLEAN NOT NULL DEFAULT false,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Review field values table
CREATE TABLE review_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  field_id UUID REFERENCES review_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, field_id)
);

-- 7. Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status invoice_status NOT NULL,
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. User settings table
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_review_template UUID REFERENCES review_templates(id) ON DELETE SET NULL,
  review_reminder_days INTEGER DEFAULT 7, -- Days before due date to send reminder
  review_notification_enabled BOOLEAN DEFAULT true,
  theme_color TEXT,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- CREATE INDEXES
-- =====================

-- Employees table indexes
CREATE INDEX idx_employees_user ON employees(user_id);

-- Review templates table indexes
CREATE INDEX idx_review_templates_user ON review_templates(user_id);

-- Reviews table indexes
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_employee ON reviews(employee_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_due_date ON reviews(due_date);

-- Invoices table indexes
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- =====================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- =====================
-- CREATE RLS POLICIES
-- =====================

-- Profiles table policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Employees table policies
CREATE POLICY "Users can access their own employees"
  ON employees FOR ALL
  USING (user_id = auth.uid());

-- Review templates table policies
CREATE POLICY "Users can access their own templates"
  ON review_templates FOR ALL
  USING (user_id = auth.uid());

-- Reviews table policies
CREATE POLICY "Users can access their own reviews"
  ON reviews FOR ALL
  USING (user_id = auth.uid());

-- Review fields table policies
CREATE POLICY "Users can access fields for their templates"
  ON review_fields FOR ALL
  USING (template_id IN (
    SELECT id FROM review_templates WHERE user_id = auth.uid()
  ));

-- Review field values table policies
CREATE POLICY "Users can access field values for their reviews"
  ON review_field_values FOR ALL
  USING (review_id IN (
    SELECT id FROM reviews WHERE user_id = auth.uid()
  ));

-- Invoices table policies
CREATE POLICY "Users can access their own invoices"
  ON invoices FOR ALL
  USING (user_id = auth.uid());

-- User settings table policies
CREATE POLICY "Users can access their own settings"
  ON user_settings FOR ALL
  USING (user_id = auth.uid());

-- =====================
-- CREATE TRIGGERS
-- =====================

-- Trigger to create user profile and settings on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Timestamp update triggers for each table with updated_at column
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_employees_timestamp
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_review_templates_timestamp
  BEFORE UPDATE ON review_templates
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_reviews_timestamp
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_review_field_values_timestamp
  BEFORE UPDATE ON review_field_values
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_invoices_timestamp
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- =====================
-- CREATE SAMPLE DATA (OPTIONAL)
-- =====================

-- You can uncomment this section to populate some sample data
/*
-- Insert a sample review template
INSERT INTO review_templates (user_id, name, description)
VALUES 
  ('REPLACE_WITH_YOUR_USER_ID', 'Annual Performance Review', 'Comprehensive review of employee performance over the past year');

-- Insert sample review fields for the template
INSERT INTO review_fields (template_id, name, label, type, required, order_position)
VALUES 
  ((SELECT id FROM review_templates WHERE name = 'Annual Performance Review' LIMIT 1), 'goals_achievement', 'Goals Achievement', 'textarea', true, 1),
  ((SELECT id FROM review_templates WHERE name = 'Annual Performance Review' LIMIT 1), 'strengths', 'Key Strengths', 'textarea', true, 2),
  ((SELECT id FROM review_templates WHERE name = 'Annual Performance Review' LIMIT 1), 'improvements', 'Areas for Improvement', 'textarea', true, 3),
  ((SELECT id FROM review_templates WHERE name = 'Annual Performance Review' LIMIT 1), 'overall_rating', 'Overall Rating', 'select', true, 4);

-- Insert options for the overall_rating field
UPDATE review_fields 
SET options = '[
  {"value": "5", "label": "Exceptional"},
  {"value": "4", "label": "Exceeds Expectations"},
  {"value": "3", "label": "Meets Expectations"},
  {"value": "2", "label": "Needs Improvement"},
  {"value": "1", "label": "Unsatisfactory"}
]'::jsonb
WHERE name = 'overall_rating';
*/ 