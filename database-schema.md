# PerformAI Database Schema

This document outlines the database schema for the PerformAI application, a performance review management system built on Supabase.

## Overview

The application requires several interconnected tables to manage users, employees, reviews, and subscription information. The schema is designed to support the following key features:

1. User authentication and management
2. Employee profiles and management
3. Performance review creation and tracking
4. Review templates and custom fields
5. Subscription and billing management
6. User settings and preferences

## Authentication System

Supabase Auth will be used for user authentication. The system will include:

1. Email/password sign up and login
2. Email verification
3. Password reset (forgot password)
4. Protected routes requiring authentication

### Auth Implementation

```javascript
// Example implementation for auth functionality with Supabase

// 1. Sign Up
const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });
  
  if (error) throw error;
  return data;
};

// 2. Sign In
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

// 3. Sign Out
const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// 4. Password Reset
const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://yourapp.com/reset-password',
  });
  
  if (error) throw error;
};

// 5. Update Password
const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) throw error;
};

// 6. Get Current User
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// 7. Auth State Change Listener
const subscribeToAuthChanges = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session)
  );
  
  return subscription;
};
```

### Protected Routes Implementation

```jsx
// Example of a React component for protecting dashboard routes
const AuthGuard = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (!session) {
        navigate('/auth/login', { replace: true });
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (!session) navigate('/auth/login', { replace: true });
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : null;
};
```

## Tables

### 1. profiles
Stores extended user profile information beyond what Supabase Auth provides.

```sql
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

### 2. employees
Stores employee information for performance reviews.

```sql
CREATE TYPE employee_status AS ENUM ('Active', 'On Leave', 'Inactive');

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

-- Index for faster employee lookup by user
CREATE INDEX idx_employees_user ON employees(user_id);

-- Enable Row Level Security
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their own employees"
  ON employees FOR ALL
  USING (user_id = auth.uid());
```

### 3. review_templates
Stores reusable review templates.

```sql
CREATE TABLE review_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster template lookup by user
CREATE INDEX idx_review_templates_user ON review_templates(user_id);

-- Enable Row Level Security
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their own templates"
  ON review_templates FOR ALL
  USING (user_id = auth.uid());
```

### 4. reviews
Stores performance review instances.

```sql
CREATE TYPE review_status AS ENUM ('Draft', 'In Progress', 'Completed', 'Archived');

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

-- Indexes
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_employee ON reviews(employee_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_due_date ON reviews(due_date);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their own reviews"
  ON reviews FOR ALL
  USING (user_id = auth.uid());
```

### 5. review_fields
Stores custom fields for review templates.

```sql
CREATE TYPE field_type AS ENUM ('text', 'textarea', 'number', 'select', 'radio', 'checkbox');

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

-- Enable Row Level Security
ALTER TABLE review_fields ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access fields for their templates"
  ON review_fields FOR ALL
  USING (template_id IN (
    SELECT id FROM review_templates WHERE user_id = auth.uid()
  ));
```

### 6. review_field_values
Stores the values of custom fields for individual reviews.

```sql
CREATE TABLE review_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  field_id UUID REFERENCES review_fields(id) ON DELETE CASCADE,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, field_id)
);

-- Enable Row Level Security
ALTER TABLE review_field_values ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access field values for their reviews"
  ON review_field_values FOR ALL
  USING (review_id IN (
    SELECT id FROM reviews WHERE user_id = auth.uid()
  ));
```

### 7. invoices
Stores billing and invoice information.

```sql
CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'uncollectible', 'void');

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

-- Indexes
CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their own invoices"
  ON invoices FOR ALL
  USING (user_id = auth.uid());
```

### 8. user_settings
Stores user-specific settings and preferences.

```sql
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

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can access their own settings"
  ON user_settings FOR ALL
  USING (user_id = auth.uid());
```

## Row Level Security (RLS) Policies

For proper data isolation and security, appropriate RLS policies have been added to each table. The key principles are:

1. Users can only access their own data
2. All tables have RLS enabled with specific policies

## Functions and Triggers

### 1. User Creation Trigger
Automatically create a profile entry when a new user signs up.

```sql
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 2. Update Timestamps Trigger
Automatically update the `updated_at` timestamp when a record is modified.

```sql
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Repeat for other tables
```

## Indexing Strategy

1. Foreign keys should be indexed for faster joins
2. Frequent filter conditions (status, due_date, etc.) should be indexed
3. Text columns used in search should have GIN indexes for full-text search

## Initial Setup

When setting up the application with a new Supabase instance:

1. Create all tables in the correct order (respecting foreign key constraints)
2. Set up RLS policies for each table
3. Create necessary functions and triggers
4. Configure Supabase Auth settings:
   - Enable email auth
   - Configure email templates for confirmation and password reset
   - Set up redirect URLs for auth flows

### Supabase Auth Configuration

1. **Enable Email Auth**:
   - In the Supabase dashboard, go to Authentication > Providers
   - Enable Email provider
   - Configure settings (confirm email, secure email change, etc.)

2. **Email Templates**:
   - Customize the email templates for:
     - Confirmation emails
     - Magic link emails
     - Reset password emails
     - Change email address notifications

3. **URL Configuration**:
   - Set the Site URL (your production domain)
   - Configure redirect URLs for successful authentication
   - Configure redirect URLs for password recovery

4. **CORS Settings**:
   - Configure allowed origins for your development and production environments

## Authentication Flow Implementation

### 1. Sign Up Flow

1. User enters email, password, and profile details
2. Call `supabase.auth.signUp()` with user credentials
3. User receives confirmation email (if enabled)
4. Upon confirmation, user is redirected to dashboard
5. `handle_new_user` trigger creates profile and settings records

### 2. Sign In Flow

1. User enters email and password
2. Call `supabase.auth.signInWithPassword()`
3. Redirect to dashboard on success

### 3. Password Reset Flow

1. User clicks "Forgot Password" link
2. User enters email address
3. Call `supabase.auth.resetPasswordForEmail()`
4. User receives password reset email
5. User clicks link in email and sets new password
6. Call `supabase.auth.updateUser()` with new password

### 4. Protected Routes

1. Implement an AuthGuard component that checks for valid session
2. Wrap protected routes with AuthGuard
3. Redirect to login if no valid session exists

## Notes on Implementation

1. Use Supabase's built-in Auth for user authentication
2. Leverage PostgreSQL's JSON capabilities for flexible data storage where appropriate
3. Implement proper cascading deletes to maintain referential integrity
4. Consider using Supabase's realtime features for collaborative review editing

## Future Considerations

1. Implement review versioning for audit trail
2. Add analytics tables to track review completion rates and other metrics
3. Implement scheduled functions for reminders and report generation
4. Consider adding a feedback collection system for 360-degree reviews 