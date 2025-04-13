import { SupabaseClient } from '@supabase/supabase-js';

export async function createTables(supabase: SupabaseClient) {
  try {
    console.log('Creating tables...');

    // Create all tables in a single SQL transaction
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        BEGIN;

        -- Create profiles table
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          avatar_url TEXT,
          organization_id UUID,
          role TEXT DEFAULT 'member',
          stripe_customer_id TEXT,
          subscription_status TEXT,
          subscription_period_end TIMESTAMP,
          last_payment_status TEXT,
          last_payment_date TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Create teams table
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          organization_id UUID NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Create team_members table
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
          user_id UUID REFERENCES profiles(id),
          role TEXT DEFAULT 'member',
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          UNIQUE(team_id, user_id)
        );

        -- Create reviews table
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
          employee_id UUID REFERENCES profiles(id),
          reviewer_id UUID REFERENCES profiles(id),
          review_period TEXT,
          status TEXT DEFAULT 'draft',
          content JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Create team_invitations table
        CREATE TABLE IF NOT EXISTS team_invitations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          role TEXT DEFAULT 'member',
          status TEXT DEFAULT 'pending',
          invite_token UUID DEFAULT uuid_generate_v4(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          UNIQUE(team_id, email)
        );

        -- Create subscriptions table
        CREATE TABLE IF NOT EXISTS subscriptions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES profiles(id),
          stripe_subscription_id TEXT UNIQUE,
          stripe_customer_id TEXT,
          status TEXT,
          plan_id TEXT,
          current_period_start TIMESTAMP,
          current_period_end TIMESTAMP,
          cancel_at_period_end BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Create audit_logs table
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES profiles(id),
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id UUID NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
        );

        -- Enable RLS on all tables
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
        ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
        ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        CREATE POLICY "Users can view own profile" 
          ON public.profiles 
          FOR SELECT 
          USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        CREATE POLICY "Users can update own profile" 
          ON public.profiles 
          FOR UPDATE 
          USING (auth.uid() = id);

        CREATE POLICY "Team members can view their teams" ON teams FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.team_id = teams.id 
            AND team_members.user_id = auth.uid()
          )
        );

        CREATE POLICY "Team members can view team members" ON team_members FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM team_members AS tm 
            WHERE tm.team_id = team_members.team_id 
            AND tm.user_id = auth.uid()
          )
        );

        COMMIT;
      `
    });

    if (error) {
      throw error;
    }

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
} 