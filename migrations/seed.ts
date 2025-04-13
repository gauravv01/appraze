import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
  try {
    console.log('Starting to seed data...');

    // Seed demo team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([
        {
          name: 'Demo Team',
          slug: 'demo-team',
          organization_id: '00000000-0000-0000-0000-000000000000'
        }
      ])
      .select()
      .single();

    if (teamError) throw teamError;
    console.log('Demo team created:', team.id);

    // Seed demo profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .insert([
        {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@example.com',
          full_name: 'Demo Admin',
          role: 'admin',
          organization_id: '00000000-0000-0000-0000-000000000000'
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'member@example.com',
          full_name: 'Demo Member',
          role: 'member',
          organization_id: '00000000-0000-0000-0000-000000000000'
        }
      ])
      .select();

    if (profilesError) throw profilesError;
    console.log('Demo profiles created');

    // Add team members
    const { error: membersError } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: team.id,
          user_id: profiles[0].id,
          role: 'admin'
        },
        {
          team_id: team.id,
          user_id: profiles[1].id,
          role: 'member'
        }
      ]);

    if (membersError) throw membersError;
    console.log('Team members added');

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 