#!/usr/bin/env node

/**
 * Script to execute SQL in Supabase
 * This uses the Supabase Management API to execute SQL queries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execAsync = promisify(exec);

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'yydtsteyknbpfpxjtlxe';

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN not found in .env file');
  process.exit(1);
}

async function executeSQL() {
  const sqlFile = path.join(__dirname, 'supabase_setup_properties.sql');
  
  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ Error: SQL file not found: ${sqlFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('📋 Reading SQL file...');
  console.log(`📝 SQL file size: ${sql.length} characters`);
  console.log(`🔗 Project: ${SUPABASE_PROJECT_REF}`);
  console.log('');

  // Note: Supabase Management API doesn't directly support SQL execution
  // The recommended way is to use the Dashboard SQL Editor
  // However, we can provide instructions
  
  console.log('⚠️  Note: Supabase Management API doesn\'t support direct SQL execution.');
  console.log('📖 Please use one of these methods:\n');
  
  console.log('Method 1: Supabase Dashboard (Recommended)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Open: https://supabase.com/dashboard/project/' + SUPABASE_PROJECT_REF + '/sql/new');
  console.log('2. Copy the contents of: supabase_setup_properties.sql');
  console.log('3. Paste into SQL Editor');
  console.log('4. Click "Run"\n');
  
  console.log('Method 2: Using psql (if you have database password)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Get database password from Supabase Dashboard → Settings → Database');
  console.log('2. Run: psql "postgresql://postgres:[PASSWORD]@db.' + SUPABASE_PROJECT_REF + '.supabase.co:5432/postgres" < supabase_setup_properties.sql\n');
  
  console.log('✅ SQL file is ready at: ' + sqlFile);
  console.log('📋 Total lines: ' + sql.split('\n').length);
  
  // Try to open the file
  const platform = process.platform;
  
  if (platform === 'darwin') {
    exec(`open "${sqlFile}"`, (error) => {
      if (!error) {
        console.log('📂 Opened SQL file in default editor');
      }
    });
  } else if (platform === 'win32') {
    exec(`start "" "${sqlFile}"`, (error) => {
      if (!error) {
        console.log('📂 Opened SQL file in default editor');
      }
    });
  } else {
    exec(`xdg-open "${sqlFile}"`, (error) => {
      if (!error) {
        console.log('📂 Opened SQL file in default editor');
      }
    });
  }
}

executeSQL().catch(console.error);

