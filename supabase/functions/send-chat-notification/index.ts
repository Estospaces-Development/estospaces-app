import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "contact@estospaces.com";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { name, email, conversationId, visitorId } = await req.json();

        if (!RESEND_API_KEY) {
            console.error("RESEND_API_KEY is not set");
            return new Response(
                JSON.stringify({ error: "Server configuration error: Missing API Key" }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        console.log(`Sending email notification for new chat from ${name} (${email})`);

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Estospaces Chatbot <contact@estospaces.com>",
                to: [ADMIN_EMAIL],
                subject: `New Chat Request from ${name}`,
                html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Chat Request</h2>
            <p><strong>${name}</strong> has started a new conversation.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Visitor ID:</strong> ${visitorId}</p>
              <p><strong>Conversation ID:</strong> ${conversationId}</p>
            </div>
            
            <a href="https://estospaces-app.vercel.app/admin/chat" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Conversation
            </a>
          </div>
        `,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Resend API error:", data);
            throw new Error(data.message || "Failed to send email");
        }

        console.log("Email sent successfully:", data);

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
