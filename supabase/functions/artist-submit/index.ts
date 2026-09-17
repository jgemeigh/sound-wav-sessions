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
    const payload = {
      name: String(body?.name || "").trim(),
      email: String(body?.email || "").trim().toLowerCase(),
      phone: String(body?.phone || "").trim(),
      city: String(body?.city || "").trim(),
      genre: String(body?.genre || "").trim(),
      links: String(body?.links || "").trim(),
      pitch: String(body?.pitch || "").trim(),
      status: "New",
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.city || !payload.genre || !payload.pitch) {
      return json({ error: "Missing required submission fields." }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email) || payload.email.length > 254) {
      return json({ error: "A valid email is required." }, { status: 400 });
    }
    if (payload.name.length > 160 || payload.phone.length > 40 || payload.city.length > 160 || payload.genre.length > 160 || payload.links.length > 2000 || payload.pitch.length > 5000) {
      return json({ error: "One or more fields are too long." }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const result = await admin.from("artist_submissions").insert(payload).select("*").single();
    if (result.error) {
      return json({ error: "Could not save submission." }, { status: 400 });
    }

    return json({ ok: true, submissionId: result.data?.id || null });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error." }, { status: 500 });
  }
});
