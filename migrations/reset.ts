import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDatabase() {
  try {
    console.log('Starting database reset...');

    // Drop all tables in reverse order of dependencies
    const tables = [
      'audit_logs',
      'subscriptions',
      'team_invitations',
      'reviews',
      'team_members',
      'teams',
      'profiles'
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete();
      if (error) throw error;
      console.log(`Cleared ${table} table`);
    }

    console.log('Database reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 