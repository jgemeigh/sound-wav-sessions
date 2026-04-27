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

async function logSignupEvent(
  admin: ReturnType<typeof createClient>,
  payload: { email: string; name: string; status: string; error?: string | null; source?: string },
) {
  const { error } = await admin.from("newsletter_signup_events").insert({
    email: payload.email,
    name: payload.name || null,
    status: payload.status,
    error: payload.error || null,
    source: payload.source || "website",
  });
  if (error) console.error("newsletter_signup_events log failed:", error.message);
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Server configuration is incomplete." }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const rawName = String(body?.name || "").trim();
    const fallbackName = email.includes("@") ? email.split("@")[0] : "Subscriber";
    const name = rawName || fallbackName;

    if (!email) return json({ error: "Email is required." }, { status: 400 });

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    await logSignupEvent(admin, { email, name, status: "received" });

    let result = await admin.from("subscribers").insert({ email, name, active: true });
    if (result.error && (result.error.code === "23505" || /duplicate key/i.test(result.error.message || ""))) {
      const updatePayload = rawName ? { name: rawName, active: true } : { active: true };
      result = await admin.from("subscribers").update(updatePayload).eq("email", email);
    }
    if (result.error) {
      await logSignupEvent(admin, {
        email,
        name,
        status: "failed",
        error: result.error.message || "Could not save subscriber.",
      });
      return json({ error: result.error.message || "Could not save subscriber." }, { status: 400 });
    }

    await logSignupEvent(admin, { email, name, status: "stored" });

    return json({ ok: true, email, name });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error." }, { status: 500 });
  }
});
