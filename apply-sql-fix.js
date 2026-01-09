/**
 * Apply SQL fix using Supabase Management API
 */

import fs from 'fs';
import fetch from 'node-fetch';

const SUPABASE_ACCESS_TOKEN = 'sbp_aa7e18b6759fab96eb05bd8711784e2c4559dc1f';
const PROJECT_REF = 'yydtsteyknbpfpxjtlxe';
const SQL_FILE = 'supabase_fix_rls_properties.sql';

async function applySQLFix() {
  try {
    // Read SQL file
    const sql = fs.readFileSync(SQL_FILE, 'utf8');
    
    console.log('📄 Reading SQL file:', SQL_FILE);
    console.log('📝 SQL length:', sql.length, 'characters');
    
    // Use Supabase Management API to execute SQL
    const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
    
    console.log('🔗 Connecting to Supabase API...');
    console.log('📍 Project:', PROJECT_REF);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sql,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      
      // Try alternative: Use Supabase REST API
      console.log('\n🔄 Trying alternative method: Supabase REST API...');
      return await tryAlternativeMethod(sql);
    }
    
    const result = await response.json();
    console.log('✅ SQL executed successfully!');
    console.log('📊 Result:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

async function tryAlternativeMethod(sql) {
  // Alternative: Use Supabase REST API with direct SQL execution
  // This requires the database password, which we don't have
  // So we'll use the Management API approach
  
  console.log('💡 Note: If Management API fails, you can:');
  console.log('1. Run the SQL manually in Supabase Dashboard SQL Editor');
  console.log('2. Or use psql with database connection string');
  console.log('\n📋 SQL to execute:');
  console.log('─'.repeat(50));
  console.log(sql.substring(0, 500) + '...');
  console.log('─'.repeat(50));
  
  throw new Error('Management API method not available. Please use Supabase Dashboard SQL Editor or psql.');
}

// Run
applySQLFix()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });

