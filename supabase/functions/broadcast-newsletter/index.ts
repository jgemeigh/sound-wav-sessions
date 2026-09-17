import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RECIPIENT_CHUNK_SIZE = 50;
const GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

type Newsletter = {
  id: string;
  subject: string;
  body: string;
  is_current?: boolean;
  sent_at?: string | null;
  broadcast_locked_at?: string | null;
  broadcast_started_at?: string | null;
};

type UpcomingShowRow = {
  id: number;
  title: string | null;
  show_date: string | null;
  venue: string | null;
  address: string | null;
  description: string | null;
  banner_path: string | null;
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

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function formatShowDate(value: string | null) {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildStoragePublicUrl(supabaseUrl: string, bucket: string, path: string | null) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function getGmailAccessToken() {
  const clientId = requireEnv("GMAIL_CLIENT_ID");
  const clientSecret = requireEnv("GMAIL_CLIENT_SECRET");
  const refreshToken = requireEnv("GMAIL_REFRESH_TOKEN");
  const response = await fetch(GMAIL_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    const errorCode = String(payload?.error || "").trim();
    const errorDescription = String(payload?.error_description || "").trim();
    if (errorCode === "invalid_grant") {
      throw new Error("Gmail authorization expired or was revoked. Reconnect Gmail OAuth and store a new refresh token.");
    }
    throw new Error([errorCode, errorDescription].filter(Boolean).join(": ") || "Could not refresh Gmail access token.");
  }
  return String(payload.access_token);
}

async function sendGmailMessage(params: {
  accessToken: string;
  fromEmail: string;
  to: string[];
  subject: string;
  html: string;
}) {
  const { accessToken, fromEmail, to, subject, html } = params;
  const message = [
    `From: SOUND.WAV SESSIONS <${fromEmail}>`,
    `To: ${to.join(", ")}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  const response = await fetch(GMAIL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: encodeBase64Url(message),
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error?.message || payload?.error_description || "Gmail rejected the message.");
  }
  return payload;
}

function newsletterHtml(params: {
  newsletter: Newsletter;
  show: UpcomingShowRow | null;
  artistNames: string[];
  siteUrl: string;
  supabaseUrl: string;
}) {
  const { newsletter, show, artistNames, siteUrl, supabaseUrl } = params;
  const performUrl = `${siteUrl.replace(/\/+$/, "")}/#perform`;
  const unsubscribeUrl = `${siteUrl.replace(/\/+$/, "")}/#newsletter`;
  const bannerUrl = buildStoragePublicUrl(supabaseUrl, "soundwav-media", show?.banner_path || null);
  const showMeta = [
    formatShowDate(show?.show_date || null),
    show?.venue || "",
    show?.address || "",
  ].filter(Boolean).join(" / ");
  const artistMarkup = artistNames.length
    ? `<p style="margin:0 0 16px;color:#f7efe1;font-size:15px;">${artistNames.map(escapeHtml).join(" / ")}</p>`
    : "";

  return `
  <div style="margin:0;padding:0;background:#050505;background-image:linear-gradient(145deg,#160d12 0%,#050505 55%,#09131a 100%);font-family:Arial,sans-serif;color:#f7efe1;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:transparent;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;border-collapse:collapse;background:#171115;border:1px solid rgba(247,239,225,.12);border-radius:20px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;">
                <p style="margin:0 0 8px;color:#3fddff;letter-spacing:3px;text-transform:uppercase;font-size:12px;">SOUND.WAV SESSIONS</p>
                <h1 style="margin:0 0 14px;font-size:34px;line-height:1.05;color:#dbff4a;">${escapeHtml(newsletter.subject || "Newsletter")}</h1>
                <div style="font-size:16px;line-height:1.7;color:#f7efe1;white-space:pre-line;">${escapeHtml(newsletter.body || "")}</div>
              </td>
            </tr>
            ${show ? `
            <tr>
              <td style="padding:0 28px 28px;">
                <div style="border:2px dashed rgba(219,255,74,.42);border-radius:18px;padding:18px;background:linear-gradient(160deg, rgba(255,107,44,.18), transparent), linear-gradient(320deg, rgba(63,221,255,.18), transparent), rgba(255,255,255,.02);">
                  ${bannerUrl ? `<img src="${bannerUrl}" alt="${escapeHtml(show.title || "Upcoming show banner")}" style="display:block;width:100%;height:auto;max-height:300px;object-fit:cover;border-radius:14px;border:1px solid rgba(247,239,225,.12);margin:0 0 16px;">` : ""}
                  <p style="margin:0 0 8px;color:#dbff4a;letter-spacing:3px;text-transform:uppercase;font-size:12px;">Upcoming show</p>
                  <h2 style="margin:0 0 10px;font-size:28px;line-height:1.1;color:#f7efe1;">${escapeHtml(show.title || "")}</h2>
                  <p style="margin:0 0 12px;color:#d9cab7;font-size:15px;">${escapeHtml(showMeta)}</p>
                  ${artistMarkup}
                  <p style="margin:0;color:#f7efe1;font-size:15px;line-height:1.6;">${escapeHtml(show.description || "")}</p>
                </div>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:0 28px 28px;">
                <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="padding:0 12px 12px 0;">
                      <a href="${performUrl}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:linear-gradient(135deg,#ff6b2c,#ff9b3f);color:#170d0d;text-decoration:none;font-weight:700;">Sign up to perform</a>
                    </td>
                    <td style="padding:0 0 12px;">
                      <a href="${unsubscribeUrl}" style="display:inline-block;padding:14px 20px;border-radius:999px;border:1px solid rgba(247,239,225,.16);color:#f7efe1;text-decoration:none;">Unsubscribe</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;color:#bfb4a6;font-size:13px;line-height:1.6;">
                <p style="margin:0 0 8px;">You are receiving this because you signed up for updates from SOUND.WAV SESSIONS.</p>
                <p style="margin:0;">Thanks!<br>-sound.wav</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>`;
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
    const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
    const fromEmail = Deno.env.get("GMAIL_SENDER_EMAIL") || "sound.wavsessions@gmail.com";
    const authorization = request.headers.get("Authorization") || "";
    const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) return json({ error: "Authentication required" }, { status: 401 });

    const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userError } = await serviceClient.auth.getUser(accessToken);
    if (userError || userData.user?.app_metadata?.is_admin !== true) {
      return json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const mode = body?.mode === "test" ? "test" : "live";
    const newsletterId = String(body?.newsletterId || "").trim();
    const siteUrl = (Deno.env.get("SITE_URL") || "https://sound-wav-sessions.netlify.app").replace(/\/+$/, "");

    if (!newsletterId) {
      return json({ error: "newsletterId is required" }, { status: 400 });
    }

    const { data: newsletter, error: newsletterError } = await serviceClient
      .from("newsletters")
      .select("id, subject, body, is_current, sent_at, broadcast_locked_at, broadcast_started_at")
      .eq("id", newsletterId)
      .single<Newsletter>();
    if (newsletterError || !newsletter) {
      return json({ error: newsletterError?.message || "Newsletter not found" }, { status: 400 });
    }
    if (!newsletter.is_current) {
      return json({ error: "Only the current newsletter can be broadcast." }, { status: 400 });
    }
    if (newsletter.sent_at || newsletter.broadcast_locked_at || newsletter.broadcast_started_at) {
      return json({ error: "This newsletter is locked or has already been broadcast. Create a new newsletter to send another update." }, { status: 409 });
    }

    const { data: currentShow } = await serviceClient
      .from("upcoming_show")
      .select("id, title, show_date, venue, address, description, banner_path")
      .eq("id", 1)
      .maybeSingle<UpcomingShowRow>();

    const { data: showArtists } = await serviceClient
      .from("upcoming_show_artists")
      .select("artist_name")
      .eq("upcoming_show_id", 1)
      .order("sort_order");

    const testRecipients = (Deno.env.get("NEWSLETTER_TEST_RECIPIENTS") || fromEmail)
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    const allRecipients = mode === "test"
      ? testRecipients
      : ((await serviceClient.from("subscribers").select("email").eq("active", true)).data || [])
          .map((row) => String(row.email || "").trim().toLowerCase())
          .filter(Boolean);

    const uniqueRecipients = [...new Set(allRecipients)];
    if (!uniqueRecipients.length) {
      return json({ error: "No active recipients found." }, { status: 400 });
    }

    const html = newsletterHtml({
      newsletter,
      show: currentShow || null,
      artistNames: (showArtists || []).map((row) => row.artist_name).filter(Boolean),
      siteUrl,
      supabaseUrl,
    });

    const chunks = chunk(uniqueRecipients, RECIPIENT_CHUNK_SIZE);
    const responses: unknown[] = [];
    const gmailAccessToken = await getGmailAccessToken();

    // Claim before sending. Keep the claim after failures: Gmail may have accepted a partial send.
    if (mode === "live") {
      const claim = await serviceClient.from("newsletters")
        .update({ broadcast_started_at: new Date().toISOString() })
        .eq("id", newsletter.id).eq("is_current", true)
        .is("sent_at", null).is("broadcast_locked_at", null).is("broadcast_started_at", null)
        .select("id").maybeSingle();
      if (claim.error) throw claim.error;
      if (!claim.data) return json({ error: "This newsletter is locked or a broadcast has already started." }, { status: 409 });
    }

    for (const recipientChunk of chunks) {
      const responseBody = await sendGmailMessage({
        accessToken: gmailAccessToken,
        fromEmail,
        to: recipientChunk,
        subject: newsletter.subject,
        html,
      });
      responses.push(responseBody);
    }

    if (mode === "live") {
      const update = await serviceClient
        .from("newsletters")
        .update({
          sent_at: new Date().toISOString(),
          recipients_count: uniqueRecipients.length,
        })
        .eq("id", newsletter.id);
      if (update.error) {
        return json({ error: update.error.message }, { status: 500 });
      }
    }

    return json({
      ok: true,
      mode,
      recipientsCount: uniqueRecipients.length,
      recipients: uniqueRecipients,
      batches: chunks.length,
      providerResponses: responses,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Broadcast failed" }, { status: 500 });
  }
});
