/**
 * Test Supabase Connection Script
 * Run with: node test-supabase.js
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
const envPath = path.resolve(__dirname, '.env');
console.log('📁 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Error loading .env:', result.error);
    process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n📊 Environment Variables:');
console.log('  VITE_SUPABASE_URL:', supabaseUrl ? supabaseUrl.substring(0, 40) + '...' : '❌ NOT SET');
console.log('  VITE_SUPABASE_ANON_KEY:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : '❌ NOT SET');

if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing Supabase credentials in .env file!');
    process.exit(1);
}

console.log('\n🔌 Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('\n🧪 Test 1: Basic Connection Test (getSession)');
    console.log('   This should be fast (~100-500ms)...');
    
    const startTime = Date.now();
    try {
        const { data, error } = await supabase.auth.getSession();
        const duration = Date.now() - startTime;
        
        if (error) {
            console.log(`   ❌ Failed in ${duration}ms:`, error.message);
        } else {
            console.log(`   ✅ Success in ${duration}ms`);
            console.log('   Has session:', !!data.session);
        }
    } catch (err) {
        const duration = Date.now() - startTime;
        console.log(`   ❌ Exception in ${duration}ms:`, err.message);
    }

    console.log('\n🧪 Test 2: Sign In Test');
    console.log('   Testing with: estospacessolutions@gmail.com');
    
    const startTime2 = Date.now();
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'estospacessolutions@gmail.com',
            password: 'Estospaces@123'
        });
        const duration = Date.now() - startTime2;
        
        if (error) {
            console.log(`   ❌ Failed in ${duration}ms:`, error.message);
            
            // Common error interpretations
            if (error.message.includes('Invalid login credentials')) {
                console.log('   💡 This means: User doesn\'t exist OR wrong password');
                console.log('   💡 Check: Does this user exist in Supabase Auth > Users?');
            }
        } else {
            console.log(`   ✅ Success in ${duration}ms`);
            console.log('   User ID:', data.user?.id);
            console.log('   Email:', data.user?.email);
            console.log('   Role:', data.user?.user_metadata?.role || 'not set');
        }
    } catch (err) {
        const duration = Date.now() - startTime2;
        console.log(`   ❌ Exception in ${duration}ms:`, err.message);
        
        if (err.message.includes('fetch')) {
            console.log('   💡 Network error - Supabase may be unreachable');
            console.log('   💡 Check: Is the VITE_SUPABASE_URL correct?');
            console.log('   💡 Check: Is the Supabase project paused? (free tier pauses after inactivity)');
        }
    }

    console.log('\n🧪 Test 3: Database Connection Test');
    console.log('   Testing profiles table query...');
    
    const startTime3 = Date.now();
    try {
        const { data, error, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        const duration = Date.now() - startTime3;
        
        if (error) {
            console.log(`   ❌ Failed in ${duration}ms:`, error.message);
            
            if (error.message.includes('does not exist')) {
                console.log('   💡 The profiles table doesn\'t exist');
            } else if (error.message.includes('permission denied')) {
                console.log('   💡 RLS is blocking access');
            }
        } else {
            console.log(`   ✅ Success in ${duration}ms`);
            console.log('   Profiles count:', count);
        }
    } catch (err) {
        const duration = Date.now() - startTime3;
        console.log(`   ❌ Exception in ${duration}ms:`, err.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📋 Summary:');
    console.log('='.repeat(50));
    console.log('If all tests passed quickly (<1s), Supabase is working.');
    console.log('If tests are slow (>5s) or fail, there\'s a connection issue.');
    console.log('\nPossible issues:');
    console.log('1. Wrong VITE_SUPABASE_URL in .env');
    console.log('2. Wrong VITE_SUPABASE_ANON_KEY in .env');
    console.log('3. Supabase project is paused (free tier)');
    console.log('4. Network/firewall blocking Supabase');
    console.log('5. User doesn\'t exist in Supabase Auth');
}

testConnection().then(() => {
    console.log('\n✅ Tests complete!');
    process.exit(0);
}).catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
});
