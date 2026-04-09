import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
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
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const serviceRole = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const serviceClient = createClient(supabaseUrl, serviceRole);

    const body = await request.json().catch(() => ({}));
    const users = Array.isArray(body?.users) ? body.users : [];
    const password = String(body?.password || "");
    if (!users.length || !password) {
      return json({ error: "users and password are required" }, { status: 400 });
    }

    const results: unknown[] = [];
    for (const raw of users) {
      const username = String(raw?.username || "").trim();
      const email = String(raw?.email || "").trim().toLowerCase();
      if (!username || !email) {
        results.push({ username, email, ok: false, error: "Missing username or email" });
        continue;
      }
      const { data, error } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          username,
          admin_alias: username,
        },
      });
      if (error) {
        results.push({ username, email, ok: false, error: error.message });
      } else {
        results.push({ username, email, ok: true, userId: data.user?.id || null });
      }
    }

    return json({ ok: true, results });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Failed to create admin users" }, { status: 500 });
  }
});
