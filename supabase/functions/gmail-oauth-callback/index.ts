import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const GOOGLE_REDIRECT_URI =
  "https://dafqbhphoeblxpfrizwx.supabase.co/functions/v1/gmail-oauth-callback";

function html(body: string, status = 200) {
  return new Response(
    `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Gmail OAuth</title>
        <style>
          body {
            margin: 0;
            padding: 32px;
            font-family: Arial, sans-serif;
            background: #0b0b0d;
            color: #f5efe6;
          }
          main {
            max-width: 760px;
            margin: 0 auto;
            background: #171115;
            border: 1px solid rgba(255,255,255,.08);
            border-radius: 18px;
            padding: 24px;
          }
          h1 { margin-top: 0; color: #dbff4a; }
          code, pre {
            display: block;
            white-space: pre-wrap;
            word-break: break-word;
            background: #0f0b0e;
            color: #7ce7ff;
            border-radius: 12px;
            padding: 14px;
          }
          .error { color: #ff8a80; }
        </style>
      </head>
      <body>
        <main>${body}</main>
      </body>
    </html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        ...corsHeaders,
      },
    },
  );
}

function requireEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return html("<h1 class=\"error\">Method not allowed</h1>", 405);
  }

  try {
    const clientId = requireEnv("GMAIL_CLIENT_ID");
    const clientSecret = requireEnv("GMAIL_CLIENT_SECRET");
    const url = new URL(request.url);
    const code = url.searchParams.get("code") || "";
    const error = url.searchParams.get("error") || "";

    if (error) {
      return html(`<h1 class="error">Google OAuth failed</h1><p>${error}</p>`, 400);
    }
    if (!code) {
      return html("<h1 class=\"error\">Missing code</h1><p>No authorization code was returned.</p>", 400);
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });
    const tokenJson = await tokenResponse.json().catch(() => ({}));

    if (!tokenResponse.ok) {
      return html(
        `<h1 class="error">Token exchange failed</h1><pre>${JSON.stringify(tokenJson, null, 2)}</pre>`,
        400,
      );
    }

    const refreshToken = String(tokenJson.refresh_token || "");
    if (!refreshToken) {
      return html(
        `<h1 class="error">No refresh token returned</h1><p>Google may have already granted this app. Revoke the app and retry, or force consent again.</p><pre>${JSON.stringify(tokenJson, null, 2)}</pre>`,
        400,
      );
    }

    return html(
      `<h1>Gmail refresh token generated</h1>
       <p>Copy this refresh token and send it back here. I will store it as a Supabase secret.</p>
       <pre>${refreshToken}</pre>`,
      200,
    );
  } catch (error) {
    return html(`<h1 class="error">OAuth callback failed</h1><pre>${error instanceof Error ? error.message : "Unknown error"}</pre>`, 500);
  }
});
