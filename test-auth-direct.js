/**
 * Direct Authentication API Test Script
 * Tests authentication without interacting with React forms
 * Run with: node test-auth-direct.js
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
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false,
    },
});

// Test credentials
const TEST_EMAIL = 'estospacessolutions@gmail.com';
const TEST_PASSWORD = 'Estospaces@123';

/**
 * Get user role from user metadata or profile
 */
async function getUserRole(user) {
    if (!user) return 'user';
    
    // Check user_metadata first
    const metadataRole = user.user_metadata?.role;
    if (metadataRole) {
        console.log('   📌 Role from user_metadata:', metadataRole);
        return metadataRole;
    }
    
    // Check profile table
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
        if (!error && profile?.role) {
            console.log('   📌 Role from profiles table:', profile.role);
            return profile.role;
        }
    } catch (err) {
        console.log('   ⚠️  Could not fetch profile:', err.message);
    }
    
    console.log('   ⚠️  No role found, defaulting to "user"');
    return 'user';
}

/**
 * Get redirect path based on role
 */
function getRedirectPath(role, fromPath = null) {
    if (fromPath && fromPath !== '/auth/login' && fromPath !== '/auth/sign-in-email') {
        return fromPath;
    }
    
    switch (role) {
        case 'manager':
            return '/manager/dashboard';
        case 'admin':
            return '/admin/dashboard';
        case 'user':
        default:
            return '/user/dashboard';
    }
}

async function testAuthentication() {
    console.log('\n' + '='.repeat(60));
    console.log('🧪 DIRECT AUTHENTICATION API TEST');
    console.log('='.repeat(60));
    
    // Test 1: Sign In
    console.log('\n📝 Test 1: Sign In');
    console.log('   Email:', TEST_EMAIL);
    console.log('   Password: ' + '*'.repeat(TEST_PASSWORD.length));
    
    const startTime = Date.now();
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });
        
        const duration = Date.now() - startTime;
        
        if (error) {
            console.log(`\n   ❌ Sign-in FAILED in ${duration}ms`);
            console.log('   Error:', error.message);
            console.log('   Error code:', error.status || 'N/A');
            
            if (error.message.includes('Invalid login credentials')) {
                console.log('\n   💡 Interpretation: Wrong credentials OR user doesn\'t exist');
                console.log('   💡 Check: Does this user exist in Supabase Auth > Users?');
            } else if (error.message.includes('Email not confirmed')) {
                console.log('\n   💡 Interpretation: Email needs to be confirmed');
                console.log('   💡 Check: Confirm email in Supabase Auth > Users');
            }
            
            return { success: false, error };
        }
        
        console.log(`\n   ✅ Sign-in SUCCESS in ${duration}ms`);
        console.log('   User ID:', data.user?.id);
        console.log('   Email:', data.user?.email);
        console.log('   Has session:', !!data.session);
        console.log('   Session expires:', data.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'N/A');
        
        // Test 2: Get User Role
        console.log('\n📝 Test 2: Get User Role');
        const roleStartTime = Date.now();
        const role = await getUserRole(data.user);
        const roleDuration = Date.now() - roleStartTime;
        
        console.log(`   ✅ Role retrieved in ${roleDuration}ms`);
        console.log('   Final role:', role);
        
        // Test 3: Get Redirect Path
        console.log('\n📝 Test 3: Get Redirect Path');
        const redirectPath = getRedirectPath(role, null);
        console.log('   ✅ Redirect path:', redirectPath);
        
        // Test 4: Verify Session
        console.log('\n📝 Test 4: Verify Session');
        const sessionStartTime = Date.now();
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const sessionDuration = Date.now() - sessionStartTime;
        
        if (sessionError) {
            console.log(`   ❌ Session check FAILED in ${sessionDuration}ms`);
            console.log('   Error:', sessionError.message);
        } else {
            console.log(`   ✅ Session check SUCCESS in ${sessionDuration}ms`);
            console.log('   Has session:', !!sessionData.session);
            console.log('   Session user:', sessionData.session?.user?.email || 'N/A');
        }
        
        // Test 5: Get Profile (if exists)
        console.log('\n📝 Test 5: Get User Profile');
        const profileStartTime = Date.now();
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
            const profileDuration = Date.now() - profileStartTime;
            
            if (profileError) {
                console.log(`   ⚠️  Profile check in ${profileDuration}ms`);
                if (profileError.code === 'PGRST116') {
                    console.log('   💡 Profile does not exist (this is OK if role is in user_metadata)');
                } else {
                    console.log('   Error:', profileError.message);
                }
            } else {
                console.log(`   ✅ Profile retrieved in ${profileDuration}ms`);
                console.log('   Profile role:', profile?.role || 'N/A');
                console.log('   Full name:', profile?.full_name || 'N/A');
            }
        } catch (err) {
            console.log(`   ❌ Profile check exception:`, err.message);
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log('✅ Authentication: SUCCESS');
        console.log('✅ User Role:', role);
        console.log('✅ Redirect Path:', redirectPath);
        console.log('✅ Session Valid:', !!data.session);
        console.log('\n⏱️  Performance:');
        console.log('   Sign-in:', duration + 'ms');
        console.log('   Role fetch:', (Date.now() - roleStartTime) + 'ms');
        console.log('   Session check:', sessionDuration + 'ms');
        
        console.log('\n💡 Expected Browser Behavior:');
        console.log('   1. User enters credentials');
        console.log('   2. signInWithPassword() is called');
        console.log('   3. getUserRole() determines role:', role);
        console.log('   4. getRedirectPath() returns:', redirectPath);
        console.log('   5. Browser navigates to:', redirectPath);
        
        return { success: true, data: { user: data.user, role, redirectPath, session: data.session } };
        
    } catch (err) {
        const duration = Date.now() - startTime;
        console.log(`\n   ❌ Sign-in EXCEPTION in ${duration}ms`);
        console.log('   Error:', err.message);
        console.log('   Stack:', err.stack);
        
        if (err.message.includes('fetch')) {
            console.log('\n   💡 Network error - Supabase may be unreachable');
            console.log('   💡 Check: Is the VITE_SUPABASE_URL correct?');
            console.log('   💡 Check: Is the Supabase project paused?');
        }
        
        return { success: false, error: err };
    }
}

// Run the test
testAuthentication().then((result) => {
    console.log('\n' + '='.repeat(60));
    if (result.success) {
        console.log('✅ ALL TESTS PASSED!');
        console.log('💡 Authentication API is working correctly.');
        console.log('💡 The login form should work in the browser.');
    } else {
        console.log('❌ TESTS FAILED');
        console.log('💡 Fix the authentication issue before testing in browser.');
    }
    console.log('='.repeat(60));
    process.exit(result.success ? 0 : 1);
}).catch(err => {
    console.error('\n❌ Test script failed:', err);
    process.exit(1);
});
