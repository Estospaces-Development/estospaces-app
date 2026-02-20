# Supabase Edge Functions Setup

To enable email notifications for the chatbot, you need to deploy the `send-chat-notification` Edge Function.

## Prerequisites

1.  **Supabase CLI**: Ensure you have the Supabase CLI installed.
    ```bash
    npm install -g supabase
    ```
2.  **Resend API Key**: Sign up at [Resend.com](https://resend.com) and get an API Key.

## Deployment Steps

1.  **Login to Supabase** (if not logged in):
    ```bash
    supabase login
    ```

2.  **Link your project**:
    ```bash
    supabase link --project-ref yydtsteyknbpfpxjtlxe
    ```

3.  **Set the API Key Secret**:
    ```bash
    supabase secrets set RESEND_API_KEY=re_BAeSuAno_9sLaTnwVp4J5j7XPtCpNe1Kj
    ```

4.  **Deploy the Function**:
    ```bash
    supabase functions deploy send-chat-notification
    ```

## Testing

Once deployed, the chatbot will automatically trigger this function when a new user starts a conversation. You can check the Function logs in the Supabase Dashboard > Edge Functions.

## Note on Email Sender

By default, the code uses `onboarding@resend.dev` as the sender. This works for testing if you verify your own email on Resend. For production, you should verify your domain (`estospaces.com`) on Resend and update the `from` address in `supabase/functions/send-chat-notification/index.ts`.
