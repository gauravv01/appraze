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

async function runMigration() {
  try {
    // Create migrations table if it doesn't exist
    await supabase.rpc('create_migrations_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          version INTEGER NOT NULL,
          name TEXT NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    // Get applied migrations
    const { data: appliedMigrations, error } = await supabase
      .from('migrations')
      .select('version')
      .order('version', { ascending: true });

    if (error) {
      throw error;
    }

    const appliedVersions = new Set(appliedMigrations?.map(m => m.version) || []);

    // Read migration files
    const migrationsDir = path.join(__dirname, 'versions');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Run each migration
    for (const file of files) {
      const version = parseInt(file.split('_')[0]);
      if (appliedVersions.has(version)) {
        console.log(`Migration ${version} already applied, skipping...`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Applying migration ${version}...`);

      const { error: migrationError } = await supabase.rpc('run_migration', {
        sql,
        version,
        name: file
      });

      if (migrationError) {
        throw migrationError;
      }

      console.log(`Migration ${version} applied successfully`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 