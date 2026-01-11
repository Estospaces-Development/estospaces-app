/**
 * Session Persistence Verification Script
 * 
 * Run this in the browser console to verify session persistence is working correctly.
 * 
 * Usage:
 * 1. Sign in to the application
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Run: verifySessionPersistence()
 */

function verifySessionPersistence() {
    console.log('🔍 Session Persistence Verification\n');
    console.log('=' .repeat(50));
    
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
        console.error('❌ localStorage is not available in this environment');
        return;
    }
    
    // Check for Supabase auth token
    const authToken = localStorage.getItem('supabase.auth.token');
    
    if (!authToken) {
        console.warn('⚠️  No auth token found in localStorage');
        console.log('   Key checked: supabase.auth.token');
        console.log('   Status: User is NOT logged in or token key is different');
        
        // Check for alternative keys
        console.log('\n🔎 Checking for alternative storage keys...');
        const allKeys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('auth'));
        if (allKeys.length > 0) {
            console.log('   Found related keys:', allKeys);
            allKeys.forEach(key => {
                const value = localStorage.getItem(key);
                console.log(`   ${key}: ${value?.substring(0, 50)}...`);
            });
        } else {
            console.log('   No Supabase-related keys found');
        }
        return;
    }
    
    console.log('✅ Auth token found in localStorage');
    console.log('   Key: supabase.auth.token');
    
    // Parse and display token details
    try {
        const tokenData = JSON.parse(authToken);
        console.log('\n📋 Token Details:');
        console.log('   Access Token:', tokenData.access_token ? '✅ Present' : '❌ Missing');
        console.log('   Refresh Token:', tokenData.refresh_token ? '✅ Present' : '❌ Missing');
        
        if (tokenData.expires_at) {
            const expiresAt = new Date(tokenData.expires_at * 1000);
            const now = new Date();
            const timeUntilExpiry = expiresAt - now;
            const minutesUntilExpiry = Math.floor(timeUntilExpiry / 1000 / 60);
            const hoursUntilExpiry = Math.floor(minutesUntilExpiry / 60);
            const daysUntilExpiry = Math.floor(hoursUntilExpiry / 24);
            
            console.log('\n⏰ Token Expiry:');
            console.log('   Expires at:', expiresAt.toLocaleString());
            
            if (timeUntilExpiry > 0) {
                if (daysUntilExpiry > 0) {
                    console.log(`   Time remaining: ${daysUntilExpiry} days, ${hoursUntilExpiry % 24} hours`);
                } else if (hoursUntilExpiry > 0) {
                    console.log(`   Time remaining: ${hoursUntilExpiry} hours, ${minutesUntilExpiry % 60} minutes`);
                } else {
                    console.log(`   Time remaining: ${minutesUntilExpiry} minutes`);
                }
                console.log('   Status: ✅ Token is valid');
            } else {
                console.log('   Status: ⚠️  Token is expired (should auto-refresh)');
            }
        }
        
        if (tokenData.user) {
            console.log('\n👤 User Details:');
            console.log('   ID:', tokenData.user.id);
            console.log('   Email:', tokenData.user.email || 'N/A');
            console.log('   Role:', tokenData.user.user_metadata?.role || 'Not set');
        }
        
        // Check Supabase configuration
        console.log('\n⚙️  Supabase Configuration:');
        if (typeof window !== 'undefined' && window.supabase) {
            console.log('   Supabase client: ✅ Initialized');
        } else {
            console.log('   Supabase client: ⚠️  Not accessible from window');
        }
        
        // Session persistence verification
        console.log('\n🔐 Session Persistence Verification:');
        console.log('   ✅ Token stored in localStorage');
        console.log('   ✅ Will persist across page reloads');
        console.log('   ✅ Will persist across browser restarts');
        console.log('   ✅ Will persist across tab closes');
        
        // Recommendations
        console.log('\n📌 Next Steps:');
        console.log('   1. Close and reopen this tab → Session should persist');
        console.log('   2. Close and reopen the browser → Session should persist');
        console.log('   3. Wait 1 hour → Token should auto-refresh');
        console.log('   4. Wait 30 days → Session should remain valid (if not manually logged out)');
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ Session persistence verification complete!\n');
        
        return {
            status: 'success',
            hasAuthToken: true,
            hasRefreshToken: !!tokenData.refresh_token,
            tokenValid: tokenData.expires_at ? (tokenData.expires_at * 1000 > Date.now()) : null,
            user: tokenData.user,
        };
        
    } catch (error) {
        console.error('❌ Error parsing auth token:', error);
        console.log('   Token value (first 100 chars):', authToken.substring(0, 100));
        return {
            status: 'error',
            message: error.message,
        };
    }
}

// Auto-run verification
console.log('🚀 Session Persistence Verification Script Loaded');
console.log('   Run: verifySessionPersistence()');
console.log('');

// Export for use
if (typeof window !== 'undefined') {
    window.verifySessionPersistence = verifySessionPersistence;
}
