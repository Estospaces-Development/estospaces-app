
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yydtsteyknbpfpxjtlxe.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHRzdGV5a25icGZweGp0bHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3OTkzODgsImV4cCI6MjA3OTM3NTM4OH0.QTUVmTdtnoFhzZ0G6XjdzhFDxcFae0hDSraFhazdNsU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing Supabase INSERT...');
  
  // Random UUID for testing (this will likely fail RLS if enabled, but shouldn't timeout)
  const fakeUserId = '00000000-0000-0000-0000-000000000000'; 
  const fakePropertyId = '00000000-0000-0000-0000-000000000000';

  const payload = {
    user_id: fakeUserId,
    property_id: fakePropertyId,
    status: 'test_insert',
    application_data: { test: true }
  };

  console.log('Payload:', payload);

  const start = Date.now();
  const { data, error } = await supabase
    .from('applied_properties')
    .insert(payload)
    .select();
  
  const duration = Date.now() - start;
  console.log(`Request took ${duration}ms`);

  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success:', data);
  }
}

testInsert();
