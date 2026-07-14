import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const supabaseUrl = requireEnv("SUPABASE_URL");
    const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const client = createClient(supabaseUrl, serviceRoleKey);

    const [siteCopyRes, showsRes, subscribersRes] = await Promise.all([
      client.from("site_copy").select("id").limit(1),
      client.from("shows").select("id", { count: "exact", head: true }),
      client.from("subscribers").select("id", { count: "exact", head: true }),
    ]);

    if (siteCopyRes.error) throw siteCopyRes.error;
    if (showsRes.error) throw showsRes.error;
    if (subscribersRes.error) throw subscribersRes.error;

    return json({
      ok: true,
      checkedAt: new Date().toISOString(),
      counts: {
        shows: showsRes.count ?? 0,
        subscribers: subscribersRes.count ?? 0,
      },
    });
  } catch (error) {
    return json(
      { ok: false, error: error instanceof Error ? error.message : "Health check failed" },
      { status: 500 },
    );
  }
});
