import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function seedDatabase() {
  try {
    // Read and execute each seed file
    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Running seed file: ${file}`);
      const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
      
      const { error } = await supabase.rpc('run_sql', { sql });
      
      if (error) {
        throw error;
      }
      
      console.log(`Seed file ${file} executed successfully`);
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase(); 