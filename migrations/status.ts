import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment variables not found:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓' : '✗');
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStatus() {
  try {
    console.log('Checking database status...');

    const tables = [
      'profiles',
      'teams',
      'team_members',
      'reviews',
      'team_invitations',
      'subscriptions',
      'audit_logs'
    ];

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error(`Error checking ${table}: Table might not exist or insufficient permissions`);
          console.error('Details:', error.message || 'No error message provided');
        } else {
          console.log(`✓ ${table}: ${count} records`);
        }
      } catch (err) {
        console.error(`✗ Failed to check ${table}:`, err);
      }
    }

    console.log('\nStatus check completed');
  } catch (error) {
    console.error('Error checking status:', error);
    process.exit(1);
  }
}

checkStatus(); 