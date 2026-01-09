/**
 * Verify SQL fix was applied correctly
 */

import fetch from 'node-fetch';

const SUPABASE_ACCESS_TOKEN = 'sbp_aa7e18b6759fab96eb05bd8711784e2c4559dc1f';
const PROJECT_REF = 'yydtsteyknbpfpxjtlxe';

async function verifyFix() {
  try {
    const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;
    
    // Check RLS policies
    const policiesQuery = `
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd
      FROM pg_policies 
      WHERE tablename = 'properties'
      ORDER BY policyname;
    `;
    
    console.log('🔍 Checking RLS policies...');
    const policiesResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: policiesQuery }),
    });
    
    if (policiesResponse.ok) {
      const policies = await policiesResponse.json();
      console.log('✅ RLS Policies:');
      console.log(JSON.stringify(policies, null, 2));
    } else {
      console.error('❌ Failed to check policies:', await policiesResponse.text());
    }
    
    // Check status constraint
    const constraintQuery = `
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint
      WHERE conrelid = 'properties'::regclass
      AND conname = 'properties_status_check';
    `;
    
    console.log('\n🔍 Checking status constraint...');
    const constraintResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: constraintQuery }),
    });
    
    if (constraintResponse.ok) {
      const constraint = await constraintResponse.json();
      console.log('✅ Status Constraint:');
      console.log(JSON.stringify(constraint, null, 2));
    } else {
      console.error('❌ Failed to check constraint:', await constraintResponse.text());
    }
    
    // Check properties count by status
    const countQuery = `
      SELECT 
        status, 
        COUNT(*) as count 
      FROM properties 
      GROUP BY status 
      ORDER BY count DESC;
    `;
    
    console.log('\n🔍 Checking properties by status...');
    const countResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: countQuery }),
    });
    
    if (countResponse.ok) {
      const counts = await countResponse.json();
      console.log('✅ Properties by Status:');
      console.log(JSON.stringify(counts, null, 2));
    } else {
      console.error('❌ Failed to check counts:', await countResponse.text());
    }
    
    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyFix();

