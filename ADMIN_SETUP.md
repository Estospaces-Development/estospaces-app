# Admin Chat Dashboard Setup Guide

## Prerequisites

You must have already completed the basic chat setup from `SUPABASE_SETUP.md`. This guide adds admin authentication and dashboard access.

## Step 1: Enable Email Authentication in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Authentication** in the left sidebar
4. Click **Providers** tab
5. Ensure **Email** is enabled (it should be by default)

## Step 2: Create an Admin User

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in the form:
   - **Email**: `admin@estospaces.com` (or your preferred admin email)
   - **Password**: Choose a secure password (minimum 6 characters)
   - **Auto Confirm User**: ✅ Check this box (so you don't need to verify email)
4. Click **Create user**

> **Note**: Save your admin credentials securely. You'll need them to log in to the admin dashboard.

## Step 3: Verify RLS Policies

The RLS policies from the basic chat setup already allow authenticated users (admins) to:
- View all conversations
- View all messages
- Send messages as admin

If you haven't run the SQL schema yet, go back to `SUPABASE_SETUP.md` and complete that first.

## Step 4: Access the Admin Dashboard

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin login page:
   ```
   http://localhost:5173/admin/login
   ```

3. Enter your admin credentials:
   - Email: `admin@estospaces.com`
   - Password: (the password you set in Step 2)

4. Click **Sign In**

5. You should be redirected to:
   ```
   http://localhost:5173/admin/chat
   ```

## Step 5: Test the Admin Dashboard

### Test Visitor → Admin Communication

1. **Open two browser windows**:
   - Window 1: `http://localhost:5173/` (visitor view)
   - Window 2: `http://localhost:5173/admin/chat` (admin dashboard)

2. **In Window 1 (Visitor)**:
   - Click the orange chat button
   - Fill in name and email
   - Click "Start Chat"
   - Send a message: "Hello, I need help!"

3. **In Window 2 (Admin)**:
   - You should see the new conversation appear in the left sidebar
   - Click on the conversation
   - You should see the visitor's message in real-time
   - Type a reply: "Hi! How can I help you?"
   - Click send

4. **Back in Window 1 (Visitor)**:
   - The admin's reply should appear instantly in the chat window

### Expected Behavior

- ✅ Visitor messages appear in admin dashboard in real-time
- ✅ Admin replies appear in visitor chat window in real-time
- ✅ Conversation list shows all active chats
- ✅ Messages are styled differently for visitor vs admin
- ✅ Timestamps show relative time (e.g., "2 minutes ago")

## Troubleshooting

### Cannot log in to admin dashboard

**Problem**: "Invalid login credentials" error

**Solution**:
1. Verify the email and password are correct
2. Check that the user was created in Supabase → Authentication → Users
3. Ensure "Auto Confirm User" was checked when creating the user

### Admin dashboard shows "No conversations yet"

**Problem**: Conversations don't appear even though visitors have chatted

**Solution**:
1. Check browser console for errors
2. Verify RLS policies are set correctly (run the SQL from `supabase_chat_schema.sql`)
3. Ensure you're logged in as an authenticated user (check Supabase → Authentication → Users)

### Messages don't appear in real-time

**Problem**: Need to refresh to see new messages

**Solution**:
1. Verify Supabase Realtime is enabled for the `messages` table
2. Check browser console for WebSocket connection errors
3. Ensure your Supabase project has Realtime enabled (it should be by default)

### "Supabase is not configured" error

**Problem**: Error when trying to log in

**Solution**:
1. Verify `.env.local` exists with correct credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Restart the dev server after adding environment variables

## Security Notes

> [!WARNING]
> **Production Considerations**
> - Change the default admin email and use a strong password
> - Consider implementing role-based access control (RBAC) for multiple admin levels
> - Add rate limiting to prevent brute-force login attempts
> - Enable two-factor authentication (2FA) for admin accounts
> - Use Supabase's built-in security features like email verification in production

## Next Steps

- Add admin user management (create/delete admins)
- Implement conversation search and filtering
- Add conversation status (active/closed)
- Create admin analytics dashboard
- Add file upload support for chat messages
