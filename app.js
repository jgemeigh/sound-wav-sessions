const OWNER_SESSION_KEY = "soundwav-owner-session";
const PUBLIC_STATE_CACHE_KEY = "soundwav-public-state";
const OWNER_DATA_CACHE_KEY = "soundwav-owner-data";
const APP_PAGE_MODE = document.body?.dataset?.appPage || "public";
const isEnhancedAdminForm = (id) => Boolean(document.getElementById(id)?.dataset.enhancedAdmin);
const isEnhancedAdminRegion = (id) => Boolean(document.getElementById(id)?.dataset.enhancedAdmin);
const NEWSLETTER_EMAIL_FOOTER = {
  signature: "Thanks!\n-sound.wav",
  disclaimer: "You are receiving this because you signed up for updates from SOUND.WAV SESSIONS.",
  unsubscribeLabel: "Unsubscribe from these emails"
};
const FUNCTION_BASE_URL = window.SUPABASE_URL ? `${window.SUPABASE_URL}/functions/v1` : "";

const fallbackData = {
  siteCopy: {
    name: "SOUND.WAV SESSIONS",
    eyebrow: "Noise / art / underground / late city",
    tagline: "DIY nights for blown speakers, raw sets, and the people still building scenes by hand.",
    hero_eyebrow: "Omaha underground after dark",
    hero_title: "Basement energy, projector light, and rooms that move.",
    hero_text: "SOUND.WAV SESSIONS brings together live music, experimental sets, visual artists, and scene documentation in one living archive. Pull up for the next one, catch the flyers from past nights, and tap in if your project belongs in the room.",
    newsletter_title: "Stay on the list",
    newsletter_copy: "Lineup drops, flyer releases, venue updates, and last-minute location notes land here first.",
    archive_title: "Past sessions",
    archive_copy: "Flyers, photos, and footage from the nights already burned into the wall.",
    artists_title: "Current rotation",
    artists_copy: "Artists moving through the room right now, with photos and direct links into their worlds.",
    affiliates_title: "Affiliates + scene love",
    affiliates_copy: "Friends, contributors, and collectives helping the Omaha underground stay loud.",
    support_title: "Keep the room alive",
    support_copy: "Donations help cover artist support, gear, flyers, documentation, and future drops.",
    footer_copy: "",
    footer_link_label: ""
  },
  upcomingShow: {
    title: "SOUND.WAV 08: STATIC SOUL / GUTTERGLOW / PROJECT PROJECT",
    date: "2026-06-27",
    dateLabel: "Saturday, June 27, 2026 Doors 8 PM",
    venue: "The Union Basement",
    address: "Benson, Omaha, Nebraska",
    artists: ["Static Soul", "Gutterglow", "Project Project"],
    description: "A humid room, layered visuals, heavy low-end, and a late set from Static Soul with guest projections from Project Project.",
    link: "",
    banner: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
    bannerPath: ""
  },
  donations: [
    { id: "fallback-donation-1", label: "Venmo", handle: "@soundwavsessions", url: "https://venmo.com/soundwavsessions", note: "Direct support for artists and room costs." },
    { id: "fallback-donation-2", label: "Cash App", handle: "$soundwavsessions", url: "https://cash.app/$soundwavsessions", note: "Help fund flyers, visuals, and backline." },
    { id: "fallback-donation-3", label: "PayPal", handle: "paypal.me/soundwavsessions", url: "https://paypal.me/soundwavsessions", note: "One-time support from near or far." },
    { id: "fallback-donation-4", label: "Zelle", handle: "soundwavsessions@email.com", url: "mailto:soundwavsessions@email.com", note: "Direct transfer for community support." }
  ],
  artists: [
    { id: "fallback-1", name: "Static Soul", genre: "Noise rap / live electronics", bio: "Cracked speaker low-end, live vocal processing, and set builds that feel like the walls are breathing.", images: ["https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80"], links: { instagram: "https://instagram.com/", spotify: "", soundcloud: "", bandcamp: "https://bandcamp.com/", website: "", linktree: "" } },
    { id: "fallback-2", name: "Gutterglow", genre: "Dream punk / projector wash", bio: "Fuzzy guitars, reverb-heavy vocals, and visual loops cut from streetlight footage and analog scans.", images: ["https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80"], links: { instagram: "https://instagram.com/", spotify: "https://spotify.com/", soundcloud: "https://soundcloud.com/", bandcamp: "", website: "", linktree: "" } }
  ],
  shows: [
    { id: "fallback-show-1", title: "SOUND.WAV 07: LOST COMPANY NITE", date: "2026-02-21", venue: "The Union Basement", description: "A packed February session with wall-to-wall projections, a surprise collab set, and one of the loudest encores so far.", banner: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80", bannerPath: "", artists: ["Lost Company", "Static Soul", "Neon Chapel"], gallery: ["https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80"], videos: ["https://vimeo.com/"] },
    { id: "fallback-show-2", title: "SOUND.WAV 06: SNARE DUST / PROJECT PROJECT", date: "2025-12-13", venue: "Slowdown Back Room", description: "A colder night, bright stencil flyers, and a stacked lineup that shifted from noise to spoken word to blown-out dance music.", banner: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80", bannerPath: "", artists: ["Snare Dust", "Project Project", "Gutterglow"], gallery: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80"], videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"] }
  ],
  affiliates: [
    { id: "fallback-aff-1", name: "Static Soul", blurb: "Family in the mix with us on sound, flyers, and lineup energy.", url: "https://instagram.com/" },
    { id: "fallback-aff-2", name: "Project Project", blurb: "Visual collaboration, documentation, and scene-building support.", url: "https://instagram.com/" },
    { id: "fallback-aff-3", name: "Omaha Underground Scene", blurb: "The rooms, basements, collectives, promoters, and artists keeping the city alive after dark.", url: "https://example.com/" }
  ],
  newsletters: [
    { id: "fallback-news-1", subject: "SOUND.WAV 08 lineup drop", body: "Static Soul, Gutterglow, and Project Project hit the room June 27. Flyer is live and the RSVP link is up.", created_at: new Date().toISOString(), sent_at: new Date().toISOString(), recipients_count: 2 }
  ]
};
window.__soundwavFallbackDonations = fallbackData.donations;

const hasSupabaseConfig = !!(window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
const supabase = hasSupabaseConfig ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY) : null;
window.__soundwavSupabaseClient = supabase;
const BUCKET = "soundwav-media";
const ARTIST_PLACEHOLDER_KEY = "placeholder://artist";
const ARTIST_PLACEHOLDER = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="#1c1417"/><rect x="24" y="24" width="752" height="752" rx="28" fill="#2b1f23" stroke="#52d6ff" stroke-opacity=".28"/><circle cx="400" cy="270" r="118" fill="#ff8a3d"/><path d="M190 648c54-122 131-183 210-183s156 61 210 183" fill="none" stroke="#fff4e8" stroke-width="58" stroke-linecap="round"/><text x="400" y="730" text-anchor="middle" fill="#dbff4a" font-size="54" font-family="Arial,sans-serif">NO IMAGE</text></svg>');
let artistCarouselTimers = [];

const state = {
  siteCopy: fallbackData.siteCopy,
  upcomingShow: fallbackData.upcomingShow,
  featuredUpcomingShows: [],
  donations: fallbackData.donations,
  artists: fallbackData.artists,
  shows: fallbackData.shows,
  affiliates: fallbackData.affiliates,
  newsletters: fallbackData.newsletters,
  subscribers: [],
  submissions: [],
  selectedShowId: null,
  ownerLoggedIn: false,
  ownerAuthMode: null,
  ownerShellOpen: false,
  ownerView: "site-copy"
};

function initSoundwaveBackground() {
  const canvas = document.getElementById("soundwave-bg");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  if (!context) return;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrame = 0;
  let phase = 0;

  const resize = () => {
    dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    width = Math.max(window.innerWidth, 1);
    height = Math.max(window.innerHeight, 1);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawPixel = (x, y, size, alpha, color) => {
    context.fillStyle = color.replace("ALPHA", String(alpha));
    context.fillRect(Math.round(x), Math.round(y), size, size);
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    const bandCount = width < 700 ? 3 : 4;
    const pixelSize = width < 700 ? 8 : 10;
    const columns = Math.ceil(width / pixelSize) + 2;
    const spacing = height / (bandCount + 1);

    for (let band = 0; band < bandCount; band += 1) {
      const baseY = spacing * (band + 1);
      const amplitude = 26 + band * 12;
      const frequency = 0.016 + band * 0.0035;
      const speed = 0.028 + band * 0.012;
      const offset = phase * speed + band * 1.7;

      for (let i = -1; i < columns; i += 1) {
        const x = i * pixelSize;
        const wave = Math.sin(x * frequency + offset);
        const wobble = Math.cos(x * (frequency * 0.45) - offset * 1.2) * amplitude * 0.35;
        const y = baseY + wave * amplitude + wobble;
        const glowAlpha = 0.07 + ((wave + 1) / 2) * 0.08;
        const coreAlpha = 0.5 + ((wave + 1) / 2) * 0.3;

        drawPixel(x - pixelSize * 0.5, y - pixelSize * 0.5, pixelSize * 2, glowAlpha, "rgba(255,120,30,ALPHA)");
        drawPixel(x, y, pixelSize, coreAlpha, "rgba(255,155,70,ALPHA)");

        if (band === 1 || band === 2) {
          drawPixel(x, y + pixelSize, pixelSize, coreAlpha * 0.45, "rgba(255,96,18,ALPHA)");
        }
      }
    }

    context.fillStyle = "rgba(0, 0, 0, 0.18)";
    context.fillRect(0, 0, width, height);

    phase += 1;
    animationFrame = window.requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  if (animationFrame) window.cancelAnimationFrame(animationFrame);
  draw();
}

const q = (id) => document.getElementById(id);
const splitLines = (value) => String(value || "").split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
const setMessage = (id, text, tone = "") => { const node = q(id); if (!node) return; node.textContent = text; node.style.color = tone === "error" ? "#ff8a80" : tone === "success" ? "#dbff4a" : ""; };
const formatUpcomingDateLabel = (value) => value ? new Date(value + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "";
const requireSupabase = (messageId = "login-message") => {
  if (supabase) return true;
  setMessage(messageId, "Live data is unavailable until the Supabase script loads. The sample site is still usable locally.", "error");
  return false;
};
const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
function mergeTextContent(base, incoming) {
  const merged = { ...base };
  Object.entries(incoming || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && String(value).trim() !== "") merged[key] = value;
  });
  return merged;
}
function normalizeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw) || /^tel:/i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
}
function formatPhoneInput(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 10);
  if (!digits) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
function normalizeCityState(value) {
  const raw = String(value || "").trim().replace(/\s+/g, " ");
  if (!raw) return "";
  const parts = raw.split(",").map((item) => item.trim()).filter(Boolean);
  if (parts.length < 2) return raw;
  const city = parts[0];
  const stateCode = parts[1].slice(0, 2).toUpperCase();
  return `${city}, ${stateCode}`;
}
function mergeUpcomingContent(base, incoming, artistNames = []) {
  const merged = {
    ...base,
    title: incoming?.title && String(incoming.title).trim() ? incoming.title : base.title,
    date: incoming?.show_date || base.date,
    dateLabel: incoming?.show_date ? formatUpcomingDateLabel(incoming.show_date) : (incoming?.date_label && String(incoming.date_label).trim() ? incoming.date_label : base.dateLabel),
    venue: incoming?.venue && String(incoming.venue).trim() ? incoming.venue : base.venue,
    address: incoming?.address && String(incoming.address).trim() ? incoming.address : base.address,
    description: incoming?.description && String(incoming.description).trim() ? incoming.description : base.description,
    link: "",
    bannerPath: incoming?.banner_path || base.bannerPath || ""
  };
  merged.banner = merged.bannerPath ? publicUrl(merged.bannerPath) : base.banner;
  merged.artists = artistNames.length ? artistNames : base.artists;
  return merged;
}
function publicUrl(path) {
  if (!path) return "";
  if (path === ARTIST_PLACEHOLDER_KEY || /placehold\.co\/900x900\/1c1417\/dbff4a\?text=SOUND\.WAV\+ARTIST/i.test(path)) return ARTIST_PLACEHOLDER;
  if (/^data:/i.test(path) || path.startsWith("http")) return path;
  if (!supabase) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
async function invokePublicFunction(name, payload) {
  if (!FUNCTION_BASE_URL || !window.SUPABASE_ANON_KEY) {
    throw new Error("Public API is not available on this page.");
  }
  const response = await fetch(`${FUNCTION_BASE_URL}/${name}`, {
    method: "POST",
    headers: {
      apikey: window.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${window.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload || {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || "Request failed.");
  return data;
}
function artistImagesOrPlaceholder(images) {
  const normalized = Array.isArray(images)
    ? images.map((image) => String(image || "").trim()).filter(Boolean)
    : [];
  return normalized.length ? normalized : [ARTIST_PLACEHOLDER];
}
function persistPublicState() {
  try {
    localStorage.setItem(PUBLIC_STATE_CACHE_KEY, JSON.stringify({
      siteCopy: state.siteCopy,
      upcomingShow: state.upcomingShow,
      featuredUpcomingShows: state.featuredUpcomingShows,
      donations: state.donations,
      artists: state.artists,
      shows: state.shows,
      affiliates: state.affiliates,
      newsletters: state.newsletters
    }));
  } catch (error) {
    console.error(error);
  }
}
function persistOwnerData() {
  try {
    localStorage.setItem(OWNER_DATA_CACHE_KEY, JSON.stringify({
      subscribers: state.subscribers,
      submissions: state.submissions
    }));
  } catch (error) {
    console.error(error);
  }
}
function loadCachedPublicState() {
  try {
    const cached = JSON.parse(localStorage.getItem(PUBLIC_STATE_CACHE_KEY) || "null");
    if (!cached) return;
    state.siteCopy = mergeTextContent(fallbackData.siteCopy, cached.siteCopy || {});
    if (cached.upcomingShow) {
      state.upcomingShow = mergeUpcomingContent(fallbackData.upcomingShow, {
        title: cached.upcomingShow.title,
        show_date: cached.upcomingShow.date,
        date_label: cached.upcomingShow.dateLabel,
        venue: cached.upcomingShow.venue,
        address: cached.upcomingShow.address,
        description: cached.upcomingShow.description,
        rsvp_link: "",
        banner_path: cached.upcomingShow.bannerPath
      }, cached.upcomingShow.artists || []);
    }
    if (Array.isArray(cached.featuredUpcomingShows) && cached.featuredUpcomingShows.length) state.featuredUpcomingShows = cached.featuredUpcomingShows;
    if (Array.isArray(cached.donations) && cached.donations.length) state.donations = cached.donations;
    if (Array.isArray(cached.artists) && cached.artists.length) {
      state.artists = cached.artists.map((artist) => ({
        ...artist,
        images: artistImagesOrPlaceholder(artist.images)
      }));
    }
    if (Array.isArray(cached.shows) && cached.shows.length) state.shows = cached.shows;
    if (Array.isArray(cached.affiliates) && cached.affiliates.length) state.affiliates = cached.affiliates;
    if (Array.isArray(cached.newsletters) && cached.newsletters.length) state.newsletters = cached.newsletters;
  } catch (error) {
    console.error(error);
  }
}
async function filePaths(prefix, files) {
  if (!requireSupabase()) throw new Error("Supabase is not available for uploads.");
  const uploads = [];
  for (const file of Array.from(files || [])) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (error) throw error;
    uploads.push(path);
  }
  return uploads;
}
async function loadPublicData() {
  const [siteRes, upcomingRes, upcomingArtistsRes, donationsRes, upcomingDraftsRes, upcomingDraftArtistsRes, artistsRes, artistImagesRes, showsRes, showArtistsRes, showMediaRes, affiliatesRes, newslettersRes] = await Promise.all([
    supabase.from("site_copy").select("*").eq("id", 1).maybeSingle(),
    supabase.from("upcoming_show").select("*").eq("id", 1).maybeSingle(),
    supabase.from("upcoming_show_artists").select("*").eq("upcoming_show_id", 1).order("sort_order"),
    supabase.from("donation_methods").select("*").order("sort_order").then((res) => res).catch(() => ({ data: [], error: null })),
    supabase.from("upcoming_drafts").select("*").order("show_date", { ascending: true }),
    supabase.from("upcoming_draft_artists").select("*").order("sort_order"),
    supabase.from("artists").select("*").order("created_at", { ascending: false }),
    supabase.from("artist_images").select("*").order("sort_order"),
    supabase.from("shows").select("*").order("show_date", { ascending: false }),
    supabase.from("show_artists").select("*").order("sort_order"),
    supabase.from("show_media").select("*").order("sort_order"),
    supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
    supabase.from("newsletters").select("*").order("created_at", { ascending: false })
  ]);
  if (siteRes.error) throw siteRes.error;
  if (upcomingRes.error) throw upcomingRes.error;
  if (upcomingDraftsRes.error) throw upcomingDraftsRes.error;
  if (upcomingDraftArtistsRes.error) throw upcomingDraftArtistsRes.error;
  state.siteCopy = mergeTextContent(fallbackData.siteCopy, siteRes.data || {});
  state.upcomingShow = mergeUpcomingContent(fallbackData.upcomingShow, upcomingRes.data || {}, (upcomingArtistsRes.data || []).map((item) => item.artist_name));
  state.donations = (donationsRes.data || []).length ? (donationsRes.data || []) : fallbackData.donations;
  const artistsByDraft = new Map();
  (upcomingDraftArtistsRes.data || []).forEach((item) => { if (!artistsByDraft.has(item.upcoming_draft_id)) artistsByDraft.set(item.upcoming_draft_id, []); artistsByDraft.get(item.upcoming_draft_id).push(item.artist_name); });
  state.featuredUpcomingShows = state.upcomingShow?.title ? [state.upcomingShow] : [];
  const imagesByArtist = new Map();
  (artistImagesRes.data || []).forEach((item) => {
    if (!imagesByArtist.has(item.artist_id)) imagesByArtist.set(item.artist_id, []);
    imagesByArtist.get(item.artist_id).push(publicUrl(item.storage_path));
  });
  state.artists = (artistsRes.data || []).map((artist) => ({
    id: artist.id,
    name: artist.name,
    genre: artist.genre,
    bio: artist.bio,
    images: artistImagesOrPlaceholder(imagesByArtist.get(artist.id) || []),
    links: { instagram: artist.instagram_url, spotify: artist.spotify_url, soundcloud: artist.soundcloud_url, bandcamp: artist.bandcamp_url, website: artist.website_url, linktree: artist.linktree_url }
  }));
  if (!state.artists.length) state.artists = fallbackData.artists.map((artist) => ({ ...artist, images: artistImagesOrPlaceholder(artist.images) }));
  const artistsByShow = new Map();
  (showArtistsRes.data || []).forEach((item) => { if (!artistsByShow.has(item.show_id)) artistsByShow.set(item.show_id, []); artistsByShow.get(item.show_id).push(item.artist_name); });
  const mediaByShow = new Map();
  (showMediaRes.data || []).forEach((item) => { if (!mediaByShow.has(item.show_id)) mediaByShow.set(item.show_id, { images: [], videos: [] }); const bucket = mediaByShow.get(item.show_id); if (item.media_kind === "image") bucket.images.push(publicUrl(item.storage_path)); else bucket.videos.push(item.external_url); });
  state.shows = (showsRes.data || []).map((show) => ({ id: show.id, title: show.title, date: show.show_date, venue: show.venue, address: show.address || "", description: show.description, banner: publicUrl(show.banner_path), bannerPath: show.banner_path, artists: artistsByShow.get(show.id) || [], gallery: mediaByShow.get(show.id)?.images || [], videos: mediaByShow.get(show.id)?.videos || [] }));
  if (!state.shows.length) state.shows = fallbackData.shows;
  state.affiliates = (affiliatesRes.data || []).length ? affiliatesRes.data : fallbackData.affiliates;
  state.newsletters = (newslettersRes.data || []).length
    ? [...newslettersRes.data].sort((left, right) => {
        if (left.is_current && !right.is_current) return -1;
        if (right.is_current && !left.is_current) return 1;
        return new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime();
      })
    : fallbackData.newsletters;
  persistPublicState();
  window.dispatchEvent(new CustomEvent("soundwav:public-state-updated"));
}
async function loadOwnerData() {
  const [subscribersRes, submissionsRes] = await Promise.all([
    supabase.from("subscribers").select("*").order("email"),
    supabase.from("artist_submissions").select("*").order("created_at", { ascending: false })
  ]);
  if (subscribersRes.error) throw subscribersRes.error;
  if (submissionsRes.error) throw submissionsRes.error;
  state.subscribers = subscribersRes.data || [];
  state.submissions = submissionsRes.data || [];
  persistOwnerData();
}
function renderSiteCopy() {
  const c = state.siteCopy;
  document.title = c.name || "SOUND.WAV SESSIONS";
  q("brand-eyebrow").textContent = c.eyebrow || "";
  q("brand-name").textContent = c.name || "SOUND.WAV SESSIONS";
  q("brand-tagline").textContent = c.tagline || "";
  q("hero-eyebrow").textContent = c.hero_eyebrow || "";
  q("hero-title").textContent = c.hero_title || "";
  q("hero-text").textContent = c.hero_text || "";
  q("newsletter-title").textContent = c.newsletter_title || "";
  q("newsletter-copy").textContent = c.newsletter_copy || "";
  q("archive-title").textContent = c.archive_title || "";
  q("archive-copy").textContent = c.archive_copy || "";
  q("artists-title").textContent = c.artists_title || "";
  q("artists-copy").textContent = c.artists_copy || "";
  q("affiliates-title").textContent = c.affiliates_title || "";
  q("affiliates-copy").textContent = c.affiliates_copy || "";
  q("support-title").textContent = c.support_title || "";
  q("support-copy").textContent = c.support_copy || "";
  if (q("footer-copy")) q("footer-copy").textContent = c.footer_copy || "";
  if (q("footer-link-label")) q("footer-link-label").textContent = c.footer_link_label || "";
  const footer = document.querySelector(".site-footer");
  if (footer) {
    const hasFooterText = Boolean(String(c.footer_copy || "").trim() || String(c.footer_link_label || "").trim());
    footer.classList.toggle("is-empty", !hasFooterText);
    if (q("footer-copy")) q("footer-copy").classList.toggle("hidden", !String(c.footer_copy || "").trim());
    if (q("footer-link-label")) q("footer-link-label").classList.toggle("hidden", !String(c.footer_link_label || "").trim());
  }
}
function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function renderUpcomingArtistLinks(artists) {
  return (artists || []).map((artist) => {
    const match = state.artists.find((entry) => String(entry.name || "").trim().toLowerCase() === String(artist || "").trim().toLowerCase());
    if (match) return `<a class="social-link" href="#artist-${slugify(match.name)}">${artist}</a>`;
    return `<span class="social-link">${artist}</span>`;
  }).join("");
}
function renderUpcomingShow() {
  const featured = state.featuredUpcomingShows?.length ? state.featuredUpcomingShows : (state.upcomingShow?.title ? [state.upcomingShow] : []);
  const s = featured[0] || { title: "", dateLabel: "", venue: "", address: "", description: "", artists: [], banner: "" };
  q("upcoming-title-hero").textContent = s.title || "Next show coming soon";
  q("upcoming-meta-hero").textContent = s.dateLabel ? `${s.dateLabel}${s.venue ? ` / ${s.venue}` : ""}` : (s.venue || "");
  if (q("upcoming-address-hero")) q("upcoming-address-hero").textContent = s.address || "";
  q("upcoming-blurb-hero").textContent = s.description || "";
  if (q("upcoming-artists-hero")) q("upcoming-artists-hero").innerHTML = renderUpcomingArtistLinks(s.artists || []);
  q("upcoming-title").textContent = s.title || "Next show coming soon";
  q("upcoming-description").textContent = s.description || "";
  q("upcoming-date").textContent = s.dateLabel ? `Date: ${s.dateLabel}` : "";
  q("upcoming-venue").textContent = s.venue || "";
  q("upcoming-address").textContent = s.address || "";
  q("upcoming-artists").innerHTML = renderUpcomingArtistLinks(s.artists || []);
  q("upcoming-image").src = s.banner || ""; q("upcoming-hero-image").src = s.banner || "";
  q("upcoming-image").classList.toggle("hidden", !s.banner); q("upcoming-hero-image").classList.toggle("hidden", !s.banner);
  const stack = q("featured-upcoming-list");
  if (stack) {
    stack.innerHTML = "";
    stack.classList.add("hidden");
  }
}
function renderDonations() { const items = (state.donations && state.donations.length) ? state.donations : fallbackData.donations; q("donation-links").innerHTML = items.map((item) => `<article class="donation-card"><h3>${item.label}</h3><p>${item.note}</p><p><strong>${item.handle}</strong></p><a href="${item.url}" target="_blank" rel="noreferrer">Open ${item.label}</a></article>`).join(""); }
function renderArchive() {
  q("archive-grid").innerHTML = state.shows.map((show) => `<article class="archive-card" data-show-id="${show.id}" tabindex="0" role="button" aria-label="Open ${show.title}"><img src="${show.banner || ''}" alt="${show.title} flyer"><div class="archive-copy"><p class="eyebrow">${formatDate(show.date)}</p><h3>${show.title}</h3><p>${show.venue}</p></div></article>`).join("");
  const selected = state.shows.find((show) => String(show.id) === String(state.selectedShowId || "")) || state.shows[0];
  const detail = q("show-detail");
  if (!selected) { detail.classList.add("hidden"); detail.classList.add("mobile-collapsed"); return; }
  const hideMobileDetail = window.innerWidth <= 640 && !state.selectedShowId;
  if (hideMobileDetail) {
    detail.classList.add("mobile-collapsed");
    detail.classList.add("hidden");
    return;
  }
  state.selectedShowId = selected.id;
  detail.classList.remove("mobile-collapsed");
  detail.classList.remove("hidden");
  detail.innerHTML = `<div class="detail-layout"><img src="${selected.banner || ''}" alt="${selected.title} banner"><div><p class="eyebrow">${formatDate(selected.date)}</p><h3>${selected.title}</h3><p>${selected.description}</p><ul class="meta-list"><li>${selected.venue}</li>${selected.address ? `<li>${selected.address}</li>` : ""}${selected.artists.map((artist) => `<li>${artist}</li>`).join("")}</ul><div class="gallery-grid">${selected.gallery.map((image) => `<img src="${image}" alt="${selected.title} photo">`).join("")}</div><div class="video-grid">${selected.videos.map((url) => `<a class="social-link" href="${url}" target="_blank" rel="noreferrer">Video link</a>`).join("")}</div></div></div>`;
}
function platformLinks(links) {
  const defs = [["instagram", "IG"], ["spotify", "SP"], ["soundcloud", "SC"], ["bandcamp", "BC"], ["website", "SITE"], ["linktree", "LT"]];
  return defs
    .filter(([key]) => links && links[key])
    .map(([key, icon]) => `<a class="social-link social-icon" href="${links[key]}" target="_blank" rel="noreferrer" aria-label="${key}" title="${key}"><span class="icon">${icon}</span></a>`)
    .join("");
}
function cycleArtistImage(card, direction = 1) {
  if (!card) return;
  let images = [];
  try {
    images = JSON.parse(card.dataset.artistImages || "[]");
  } catch (_) {
    images = [];
  }
  if (images.length < 2) return;
  const img = card.querySelector(".artist-main-image");
  if (!img) return;
  const currentIndex = Number(card.dataset.artistImageIndex || 0);
  const nextIndex = (currentIndex + direction + images.length) % images.length;
  card.dataset.artistImageIndex = String(nextIndex);
  img.src = images[nextIndex];
  card.querySelectorAll("[data-artist-thumb-index]").forEach((thumb) => {
    thumb.classList.toggle("active", Number(thumb.dataset.artistThumbIndex || 0) === nextIndex);
  });
}
function startArtistCarousels() {
  artistCarouselTimers.forEach((timer) => clearInterval(timer)); artistCarouselTimers = [];
  document.querySelectorAll("[data-artist-images]").forEach((card) => {
    const images = JSON.parse(card.dataset.artistImages || "[]");
    card.dataset.artistImageIndex = "0";
    if (images.length < 2) return;
    artistCarouselTimers.push(setInterval(() => { if (card.dataset.artistLocked === "true") return; cycleArtistImage(card, 1); }, 2400));
  });
}
function renderArtists() { q("artist-grid").innerHTML = state.artists.map((artist) => { const images = artistImagesOrPlaceholder(artist.images); return `<article class="artist-card" id="artist-${slugify(artist.name)}" data-artist-images='${JSON.stringify(images).replace(/'/g, "&apos;")}'><img class="artist-main-image" src="${images[0] || ''}" alt="${artist.name}"><div class="artist-copy"><p class="eyebrow">${artist.genre}</p><h3>${artist.name}</h3><p>${artist.bio}</p><div class="artist-thumbs">${images.slice(0, 4).map((image, index) => `<img src="${image}" alt="${artist.name} photo" data-artist-thumb-index="${index}"${index === 0 ? ' class="active"' : ""}>`).join("")}</div><div class="platform-links">${platformLinks(artist.links)}</div></div></article>`; }).join(""); startArtistCarousels(); }
function renderAffiliates() { q("affiliate-grid").innerHTML = state.affiliates.map((item) => `<article class="affiliate-card"><h3>${item.name}</h3><p>${item.blurb}</p><a href="${item.url}" target="_blank" rel="noreferrer">Visit link</a></article>`).join(""); }
function renderNewsletters() {
  const latest = state.newsletters.find((item) => item?.is_current) || state.newsletters[0];
  if (q("latest-newsletter-subject")) {
    q("latest-newsletter-subject").textContent = latest ? latest.subject : "No newsletter saved yet";
    q("latest-newsletter-body").textContent = latest ? latest.body : "Save a newsletter in admin mode and it will appear here.";
    q("latest-newsletter-meta").textContent = latest ? (latest.sent_at ? `Broadcast ${formatDate(latest.sent_at)}.` : `Saved ${formatDate(latest.created_at)}.`) : "";
  }
  if (!isEnhancedAdminRegion("campaign-log") && q("campaign-log")) q("campaign-log").innerHTML = state.newsletters.map((item, index) => `<article class="admin-list-item"><p><strong>${item.subject}</strong></p><p>${item.body}</p><p>${item.sent_at ? `Broadcast ${formatDate(item.sent_at)} to ${item.recipients_count} subscribers.` : "Saved draft."}</p><div class="list-actions"><button class="mini-button" type="button" data-edit-newsletter-id="${item.id}">Edit</button>${index === 0 ? `<button class="mini-button ghost" type="button" data-broadcast-newsletter-id="${item.id}">${item.sent_at ? "Broadcast again" : "Broadcast"}</button>` : ""}<button class="mini-button danger" type="button" data-delete-newsletter-id="${item.id}">Delete</button></div></article>`).join("");
}
function renderSubscribers() { if (!isEnhancedAdminRegion("subscriber-list") && q("subscriber-list")) q("subscriber-list").innerHTML = state.subscribers.map((item) => `<article class="admin-list-item"><p><strong>${item.name}</strong></p><p>${item.email}</p><p>${item.active ? "Subscribed" : "Opted out"}</p><div class="list-actions"><button class="mini-button danger" type="button" data-delete-subscriber-id="${item.id}">Remove</button></div></article>`).join(""); }
function renderSubmissions() { if (q("submission-list")) q("submission-list").innerHTML = state.submissions.map((item) => `<article class="admin-list-item"><p><strong>${item.name}</strong> <span class="eyebrow">${item.status}</span></p><p>${item.genre} / ${item.city}</p><p>${item.email} / ${item.phone}</p><p>${item.links || "No links provided"}</p><p>${item.pitch}</p><div class="list-actions"><button class="mini-button" type="button" data-submission-id="${item.id}" data-status="Reviewed">Mark reviewed</button><button class="mini-button ghost" type="button" data-submission-id="${item.id}" data-status="Booked">Mark booked</button><button class="mini-button danger" type="button" data-delete-submission-id="${item.id}">Delete</button></div></article>`).join(""); }
function renderOwnerLists() {
  if (!isEnhancedAdminRegion("artist-admin-list")) {
    q("artist-admin-list").innerHTML = state.artists.map((item) => `<article class="admin-list-item"><p><strong>${item.name}</strong></p><p>${item.genre}</p><div class="list-actions"><button class="mini-button" type="button" data-edit-artist-id="${item.id}">Edit</button><button class="mini-button danger" type="button" data-delete-artist-id="${item.id}">Delete</button></div></article>`).join("");
  }
  if (!isEnhancedAdminRegion("show-admin-list")) {
    q("show-admin-list").innerHTML = state.shows.map((item) => `<article class="admin-list-item"><p><strong>${item.title}</strong></p><p>${formatDate(item.date)} / ${item.venue}</p><div class="list-actions"><button class="mini-button" type="button" data-edit-show-id="${item.id}">Edit</button><button class="mini-button ghost" type="button" data-view-show-id="${item.id}">Open in archive</button><button class="mini-button danger" type="button" data-delete-show-id="${item.id}">Delete</button></div></article>`).join("");
  }
  if (!isEnhancedAdminRegion("affiliate-admin-list")) {
    q("affiliate-admin-list").innerHTML = state.affiliates.map((item) => `<article class="admin-list-item"><p><strong>${item.name}</strong></p><p>${item.blurb}</p><div class="list-actions"><button class="mini-button" type="button" data-edit-affiliate-id="${item.id}">Edit</button><button class="mini-button danger" type="button" data-delete-affiliate-id="${item.id}">Delete</button></div></article>`).join("");
  }
}
function fillOwnerForms() {
  const c = state.siteCopy; const site = q("site-copy-form");
  if (site) Object.entries({ name: c.name || "", eyebrow: c.eyebrow || "", tagline: c.tagline || "", heroEyebrow: c.hero_eyebrow || "", heroTitle: c.hero_title || "", heroText: c.hero_text || "", newsletterTitle: c.newsletter_title || "", newsletterCopy: c.newsletter_copy || "", archiveTitle: c.archive_title || "", archiveCopy: c.archive_copy || "", artistsTitle: c.artists_title || "", artistsCopy: c.artists_copy || "", affiliatesTitle: c.affiliates_title || "", affiliatesCopy: c.affiliates_copy || "", supportTitle: c.support_title || "", supportCopy: c.support_copy || "", footerCopy: c.footer_copy || "", footerLinkLabel: c.footer_link_label || "" }).forEach(([k, v]) => site.elements[k].value = v);
  const u = state.upcomingShow; const upcoming = q("upcoming-form");
  if (upcoming) Object.entries({ title: u.title || "", date: u.date || "", venue: u.venue || "", address: u.address || "", artists: (u.artists || []).join("\n"), description: u.description || "" }).forEach(([k, v]) => { if (upcoming.elements[k]) upcoming.elements[k].value = v; });
}
function renderOwnerPanels() { document.querySelectorAll(".owner-tab").forEach((button) => button.classList.toggle("active", button.dataset.ownerView === state.ownerView)); document.querySelectorAll("[data-owner-panel]").forEach((panel) => panel.classList.toggle("hidden", panel.dataset.ownerPanel !== state.ownerView)); }
function forceOwnerShell(isOpen) {
  state.ownerShellOpen = isOpen;
  q("public-shell")?.classList.toggle("hidden", isOpen);
  q("owner-shell")?.classList.toggle("hidden", !isOpen);
}function renderShells() { forceOwnerShell(state.ownerShellOpen); }
function showOwnerWorkspace() {
  forceOwnerShell(true);
  q("owner-login-panel").classList.add("hidden");
  q("owner-dashboard").classList.remove("hidden");
  q("logout-button").classList.remove("hidden");
}
function renderOwnerMode() {
  renderShells();
  q("owner-login-panel").classList.toggle("hidden", state.ownerLoggedIn);
  q("owner-dashboard").classList.toggle("hidden", !state.ownerLoggedIn);
  q("logout-button").classList.toggle("hidden", !state.ownerLoggedIn);
  if (state.ownerLoggedIn) { fillOwnerForms(); renderNewsletters(); renderSubscribers(); renderSubmissions(); renderOwnerLists(); renderOwnerPanels(); }
}
function renderAll() { renderSiteCopy(); renderUpcomingShow(); renderDonations(); renderArchive(); renderArtists(); renderAffiliates(); renderNewsletters(); renderOwnerMode(); }
function applySiteCopyToDom(copy) {
  state.siteCopy = mergeTextContent(state.siteCopy, copy || {});
  persistPublicState();
  renderSiteCopy();
}
function forceOwnerDomOpen() {
  state.ownerShellOpen = true;
  state.ownerLoggedIn = true;
  q("public-shell")?.classList.add("hidden");
  q("owner-shell")?.classList.remove("hidden");
  q("owner-login-panel")?.classList.add("hidden");
  q("owner-dashboard")?.classList.remove("hidden");
  q("logout-button")?.classList.remove("hidden");
}
function stayInOwnerWorkspace() {
  state.ownerShellOpen = true;
  if (state.ownerLoggedIn) {
    q("owner-login-panel").classList.add("hidden");
    q("owner-dashboard").classList.remove("hidden");
    q("logout-button").classList.remove("hidden");
  }
}
async function refreshPublicState(renderSelectedShowId = null) {
  try {
    await loadPublicData();
    if (renderSelectedShowId) state.selectedShowId = renderSelectedShowId;
    window.dispatchEvent(new CustomEvent("soundwav:public-state-updated"));
  } catch (error) {
    console.error(error);
  }
}
function loadCachedOwnerData() {
  try {
    const cached = JSON.parse(localStorage.getItem(OWNER_DATA_CACHE_KEY) || "null");
    if (!cached) return;
    if (Array.isArray(cached.subscribers)) state.subscribers = cached.subscribers;
    if (Array.isArray(cached.submissions)) state.submissions = cached.submissions;
  } catch (error) {
    console.error(error);
  }
}
function openOwnerMode() { forceOwnerShell(true); }
function closeOwnerMode() {
  forceOwnerShell(false);
  renderAll();
  window.dispatchEvent(new CustomEvent("soundwav:show-public-site"));
}
function clearNewsletterForm() { const form = q("campaign-form"); form.reset(); form.elements.newsletterId.value = ""; setMessage("campaign-message", ""); }
function loadNewsletterIntoForm(id) { const item = state.newsletters.find((entry) => entry.id === id); if (!item) return; const form = q("campaign-form"); form.elements.newsletterId.value = item.id; form.elements.subject.value = item.subject; form.elements.body.value = item.body; setMessage("campaign-message", "Editing " + item.subject + ".", "success"); }
function getNewsletterUnsubscribeUrl() {
  try {
    const url = new URL(window.location.href);
    url.hash = "newsletter";
    return url.toString();
  } catch (_error) {
    return "#newsletter";
  }
}
function buildNewsletterEmailPayload(newsletter) {
  const unsubscribeUrl = getNewsletterUnsubscribeUrl();
  const subject = String(newsletter?.subject || "").trim();
  const body = String(newsletter?.body || "").trim();
  return {
    subject,
    body,
    unsubscribeUrl,
    footerText: [
      "",
      NEWSLETTER_EMAIL_FOOTER.disclaimer,
      `${NEWSLETTER_EMAIL_FOOTER.unsubscribeLabel}: ${unsubscribeUrl}`,
      "",
      NEWSLETTER_EMAIL_FOOTER.signature
    ].join("\n"),
    footerHtml:
      '<hr style="border:none;border-top:1px solid #333;margin:24px 0;">' +
      '<p style="margin:0 0 10px;color:#bfb4a6;font-size:14px;">' + NEWSLETTER_EMAIL_FOOTER.disclaimer + "</p>" +
      '<p style="margin:0 0 14px;font-size:14px;"><a href="' + unsubscribeUrl + '" style="color:#ff9b3f;">' + NEWSLETTER_EMAIL_FOOTER.unsubscribeLabel + "</a></p>" +
      '<p style="margin:0;white-space:pre-line;">' + NEWSLETTER_EMAIL_FOOTER.signature + "</p>"
  };
}
function openTestNewsletterBroadcast(newsletter, recipients = []) {
  const payload = buildNewsletterEmailPayload(newsletter);
  const emails = recipients.map((item) => String(item || "").trim()).filter(Boolean);
  if (!emails.length) throw new Error("No test recipients configured.");
  const body = [payload.body, payload.footerText].filter(Boolean).join("\n\n");
  const composeUrl =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(emails.join(","))}` +
    `&su=${encodeURIComponent(payload.subject)}` +
    `&body=${encodeURIComponent(body)}`;
  window.open(composeUrl, "_blank", "noopener,noreferrer");
  return { composeUrl, recipients: emails };
}
function clearArtistForm() { const form = q("artist-profile-form"); form.reset(); form.elements.artistId.value = ""; setMessage("artist-profile-message", ""); }
function loadArtistIntoForm(id) { const item = state.artists.find((entry) => entry.id === id); if (!item) return; const form = q("artist-profile-form"); form.elements.artistId.value = item.id; form.elements.name.value = item.name; form.elements.genre.value = item.genre; form.elements.bio.value = item.bio; ["instagram","spotify","soundcloud","bandcamp","website","linktree"].forEach((key) => form.elements[key].value = item.links[key] || ""); setMessage("artist-profile-message", "Editing " + item.name + ".", "success"); }
function clearShowForm() { const form = q("show-form"); form.reset(); form.elements.showId.value = ""; form.classList.add("hidden"); q("show-new-toggle")?.classList.remove("hidden"); setMessage("show-message", ""); }
function loadShowIntoForm(id) { const item = state.shows.find((entry) => entry.id === id); if (!item) return; const form = q("show-form"); form.elements.showId.value = item.id; form.elements.title.value = item.title; form.elements.date.value = item.date; form.elements.venue.value = item.venue; form.elements.artists.value = item.artists.join("\n"); form.elements.description.value = item.description; form.elements.videos.value = item.videos.join("\n"); setMessage("show-message", "Editing " + item.title + ".", "success"); }
function clearAffiliateForm() { const form = q("affiliate-form"); form.reset(); form.elements.affiliateId.value = ""; setMessage("affiliate-message", ""); }
function loadAffiliateIntoForm(id) { const item = state.affiliates.find((entry) => entry.id === id); if (!item) return; const form = q("affiliate-form"); form.elements.affiliateId.value = item.id; form.elements.name.value = item.name; form.elements.blurb.value = item.blurb; form.elements.url.value = item.url; setMessage("affiliate-message", "Editing " + item.name + ".", "success"); }
async function replaceUpcomingArtists(names) { await supabase.from("upcoming_show_artists").delete().eq("upcoming_show_id", 1); if (!names.length) return; await supabase.from("upcoming_show_artists").insert(names.map((artist_name, index) => ({ upcoming_show_id: 1, artist_name, sort_order: index }))); }
async function replaceShowArtists(showId, names) { await supabase.from("show_artists").delete().eq("show_id", showId); if (!names.length) return; await supabase.from("show_artists").insert(names.map((artist_name, index) => ({ show_id: showId, artist_name, sort_order: index }))); }
async function replaceShowVideos(showId, urls) { await supabase.from("show_media").delete().eq("show_id", showId).eq("media_kind", "video"); if (!urls.length) return; await supabase.from("show_media").insert(urls.map((external_url, index) => ({ show_id: showId, media_kind: "video", external_url, sort_order: index }))); }
async function initialize() {
  const savedOwnerSession = localStorage.getItem(OWNER_SESSION_KEY);
  state.ownerShellOpen = APP_PAGE_MODE === "admin";
  loadCachedPublicState();
  loadCachedOwnerData();
  if (savedOwnerSession === "demo") {
    state.ownerLoggedIn = true;
    state.ownerAuthMode = "demo";
  }
  if (savedOwnerSession === "supabase") {
    state.ownerLoggedIn = true;
    state.ownerAuthMode = "supabase";
  }
  if (supabase) {
    try {
      await loadPublicData();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        state.ownerLoggedIn = true;
        state.ownerAuthMode = "supabase";
        localStorage.setItem(OWNER_SESSION_KEY, "supabase");
        await loadOwnerData();
        window.dispatchEvent(new CustomEvent("soundwav:owner-authenticated"));
      } else if (savedOwnerSession === "supabase") {
        state.ownerLoggedIn = false;
        state.ownerAuthMode = null;
        localStorage.removeItem(OWNER_SESSION_KEY);
      }
    } catch (error) {
      console.error(error);
    }
  }
  if (APP_PAGE_MODE === "admin" && !state.ownerLoggedIn) state.ownerShellOpen = true;
  renderAll();
}
document.getElementById("owner-toggle")?.addEventListener("click", (event) => {
  if (APP_PAGE_MODE === "public") return;
  event.preventDefault();
  openOwnerMode();
});
if (supabase) {
  supabase.auth.onAuthStateChange(async (eventName, session) => {
    if (!session && eventName === "INITIAL_SESSION" && localStorage.getItem(OWNER_SESSION_KEY) === "supabase") {
      return;
    }
    state.ownerLoggedIn = !!session;
    state.ownerAuthMode = session ? "supabase" : null;
    if (session) {
      state.ownerShellOpen = true;
      try {
        await loadOwnerData();
      } catch (error) {
        console.error(error);
      }
    }
    renderOwnerMode();
  });
}
document.getElementById("back-to-site")?.addEventListener("click", (event) => {
  if (APP_PAGE_MODE === "admin") return;
  event.preventDefault();
  closeOwnerMode();
});
document.querySelectorAll(".owner-tab").forEach((button) => button.addEventListener("click", async () => {
  state.ownerView = button.dataset.ownerView;
  if (state.ownerLoggedIn && state.ownerAuthMode === "supabase" && (state.ownerView === "newsletter" || state.ownerView === "submissions")) {
    try {
      await loadOwnerData();
      renderAll();
    } catch (error) {
      console.error(error);
    }
  }
  renderOwnerPanels();
}));
document.getElementById("newsletter-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email")).trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  state.subscribers = [{ id: "temp-public-" + crypto.randomUUID(), email, name, active: true }, ...state.subscribers.filter((item) => item.email !== email)];
  persistOwnerData();
  renderSubscribers();
  try {
    await invokePublicFunction("newsletter-signup", { email, name });
    event.currentTarget.reset();
    if (state.ownerLoggedIn) {
      await loadOwnerData();
      renderAll();
      renderSubscribers();
    }
    setMessage("newsletter-message", "You are on the SOUND.WAV list.", "success");
  } catch (error) {
    setMessage("newsletter-message", error.message || "Could not join the list.", "error");
  }
});
document.getElementById("optout-form").addEventListener("submit", async (event) => { event.preventDefault(); const email = String(new FormData(event.currentTarget).get("email")).trim().toLowerCase(); state.subscribers = state.subscribers.map((item) => item.email === email ? { ...item, active: false } : item); persistOwnerData(); renderSubscribers(); const { error } = await supabase.from("subscribers").update({ active: false }).eq("email", email); if (error) return setMessage("optout-message", error.message, "error"); event.currentTarget.reset(); if (state.ownerLoggedIn) await loadOwnerData(); renderSubscribers(); setMessage("optout-message", "You have been unsubscribed.", "success"); });
const artistSubmissionForm = document.getElementById("artist-submission-form");
const artistSubmissionPhone = artistSubmissionForm?.elements?.phone;
const artistSubmissionCity = artistSubmissionForm?.elements?.city;
artistSubmissionPhone?.addEventListener("input", () => {
  artistSubmissionPhone.value = formatPhoneInput(artistSubmissionPhone.value);
});
artistSubmissionCity?.addEventListener("blur", () => {
  artistSubmissionCity.value = normalizeCityState(artistSubmissionCity.value);
});
artistSubmissionForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const formData = new FormData(event.currentTarget);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    phone: formatPhoneInput(formData.get("phone")),
    city: normalizeCityState(formData.get("city")),
    genre: String(formData.get("genre") || "").trim(),
    links: String(formData.get("links") || "").trim(),
    pitch: String(formData.get("pitch") || "").trim()
  };
  const tempId = "temp-submission-" + crypto.randomUUID();
  state.submissions = [{ id: tempId, ...payload, status: "New", created_at: new Date().toISOString() }, ...state.submissions.filter((item) => item.id !== tempId)];
  if (window.__soundwavState) window.__soundwavState.submissions = state.submissions;
  persistOwnerData();
  renderSubmissions();
  try {
    const result = await invokePublicFunction("artist-submit", payload);
    const data = result?.submission;
    state.submissions = [data, ...state.submissions.filter((item) => item.id !== tempId)];
    if (window.__soundwavState) window.__soundwavState.submissions = state.submissions;
    persistOwnerData();
    if (state.ownerLoggedIn) {
      await loadOwnerData();
      renderAll();
    }
    renderSubmissions();
    event.currentTarget.reset();
    setMessage("artist-message", "Submission received. We will hit you back soon.", "success");
  } catch (error) {
    state.submissions = state.submissions.filter((item) => item.id !== tempId);
    if (window.__soundwavState) window.__soundwavState.submissions = state.submissions;
    persistOwnerData();
    renderSubmissions();
    setMessage("artist-message", error.message || "Could not submit artist info.", "error");
  }
});

window.handleOwnerLogin = async function handleOwnerLogin() {
  const form = document.getElementById("login-form");
  if (!form) return false;
  const formData = new FormData(form);
  const rawLogin = String(formData.get("email") || "").trim().toLowerCase();
  const email = rawLogin.includes("@") ? rawLogin : `${rawLogin}@soundwav-admin.example.com`;
  const password = String(formData.get("password") || "");
  if (!rawLogin || !password) {
    setMessage("login-message", "Enter your email or username and password.", "error");
    return false;
  }
  if (email === "owner@soundwav.local" && password === "project2") {
    state.ownerLoggedIn = true;
    state.ownerAuthMode = "demo";
    forceOwnerShell(true);
    localStorage.setItem(OWNER_SESSION_KEY, "demo");
    renderOwnerMode();
    window.dispatchEvent(new CustomEvent("soundwav:owner-authenticated"));
    form.reset();
    setMessage("login-message", "Local admin unlocked.", "success");
    return false;
  }
  if (!supabase) {
    setMessage("login-message", "Supabase is not available on this page yet.", "error");
    return false;
  }
  setMessage("login-message", "Signing in...", "");
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("login-message", error.message, "error");
      return false;
    }
    if (!data.session) {
      setMessage("login-message", "Login returned no active session.", "error");
      return false;
    }
    state.ownerLoggedIn = true;
    state.ownerAuthMode = "supabase";
    localStorage.setItem(OWNER_SESSION_KEY, "supabase");
    forceOwnerShell(true);
    try {
      await loadPublicData();
      await loadOwnerData();
    } catch (loadError) {
      console.error(loadError);
    }
    renderOwnerMode();
    window.dispatchEvent(new CustomEvent("soundwav:owner-authenticated"));
    form.reset();
    setMessage("login-message", "Supabase login successful.", "success");
    return false;
  } catch (loginError) {
    console.error(loginError);
    setMessage("login-message", loginError.message || "Login failed.", "error");
    return false;
  }
}
document.getElementById("login-form").addEventListener("submit", (event) => { event.preventDefault(); handleOwnerLogin(); });
document.getElementById("login-button").addEventListener("click", handleOwnerLogin);
document.getElementById("logout-button").addEventListener("click", async () => { if (state.ownerAuthMode === "supabase" && supabase) await supabase.auth.signOut(); state.ownerLoggedIn = false; state.ownerAuthMode = null; localStorage.removeItem(OWNER_SESSION_KEY); forceOwnerShell(true); renderOwnerMode(); setMessage("login-message", "Logged out.", ""); });
document.getElementById("site-copy-form").addEventListener("submit", async (event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); const payload = { id: 1, name: formData.get("name"), eyebrow: formData.get("eyebrow"), tagline: formData.get("tagline"), hero_eyebrow: formData.get("heroEyebrow"), hero_title: formData.get("heroTitle"), hero_text: formData.get("heroText"), newsletter_title: formData.get("newsletterTitle"), newsletter_copy: formData.get("newsletterCopy"), archive_title: formData.get("archiveTitle"), archive_copy: formData.get("archiveCopy"), artists_title: formData.get("artistsTitle"), artists_copy: formData.get("artistsCopy"), affiliates_title: formData.get("affiliatesTitle"), affiliates_copy: formData.get("affiliatesCopy"), support_title: formData.get("supportTitle"), support_copy: formData.get("supportCopy"), footer_copy: formData.get("footerCopy"), footer_link_label: formData.get("footerLinkLabel") }; state.ownerView = "site-copy"; applySiteCopyToDom(payload); renderAll(); forceOwnerDomOpen(); renderOwnerPanels(); const { error } = await supabase.from("site_copy").upsert(payload); if (error) return setMessage("site-copy-message", error.message, "error"); await refreshPublicState(); applySiteCopyToDom(state.siteCopy); renderAll(); forceOwnerDomOpen(); renderOwnerPanels(); setMessage("site-copy-message", "Visitor-facing site text updated.", "success"); });
if (!isEnhancedAdminForm("upcoming-form")) document.getElementById("upcoming-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); let bannerPath = state.upcomingShow.bannerPath || ""; const uploads = await filePaths("upcoming", form.elements.bannerUpload.files); if (uploads[0]) bannerPath = uploads[0]; const payload = { id: 1, title: formData.get("title"), show_date: formData.get("date"), date_label: formatUpcomingDateLabel(String(formData.get("date") || "")), venue: formData.get("venue"), address: formData.get("address"), description: formData.get("description"), rsvp_link: "", banner_path: bannerPath }; const { error } = await supabase.from("upcoming_show").upsert(payload); if (error) return setMessage("upcoming-message", error.message, "error"); await replaceUpcomingArtists(splitLines(formData.get("artists"))); await refreshPublicState(); forceOwnerDomOpen(); renderAll(); setMessage("upcoming-message", "Upcoming banner updated.", "success"); form.elements.bannerUpload.value = ""; });
document.getElementById("archive-current-show")?.addEventListener("click", async () => { const u = state.upcomingShow; if (!u.title || !u.date) return setMessage("upcoming-message", "Save the upcoming show first, then archive it.", "error"); const { data, error } = await supabase.from("shows").insert({ title: u.title, show_date: u.date, venue: u.venue, address: u.address || "", description: u.description, banner_path: u.bannerPath || "" }).select("id").single(); if (error) return setMessage("upcoming-message", error.message, "error"); await replaceShowArtists(data.id, u.artists || []); if (u.bannerPath) await supabase.from("show_media").insert({ show_id: data.id, media_kind: "image", storage_path: u.bannerPath, sort_order: 0 }); await supabase.from("upcoming_show").upsert({ id: 1, title: "", show_date: null, date_label: "", venue: "", address: "", description: "", rsvp_link: "", banner_path: "" }); await supabase.from("upcoming_show_artists").delete().eq("upcoming_show_id", 1); await refreshPublicState(); forceOwnerDomOpen(); renderAll(); setMessage("upcoming-message", "Current show archived and banner cleared for the next one.", "success"); });
document.getElementById("clear-newsletter-form")?.addEventListener("click", clearNewsletterForm);
if (!isEnhancedAdminForm("campaign-form")) document.getElementById("campaign-form").addEventListener("submit", async (event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); const id = String(formData.get("newsletterId") || ""); const payload = { subject: formData.get("subject"), body: formData.get("body") }; let result; if (id) result = await supabase.from("newsletters").update(payload).eq("id", id); else result = await supabase.from("newsletters").insert(payload); if (result.error) return setMessage("campaign-message", result.error.message, "error"); await refreshPublicState(); forceOwnerDomOpen(); renderAll(); clearNewsletterForm(); setMessage("campaign-message", "Newsletter saved.", "success"); });
document.getElementById("subscriber-form").addEventListener("submit", async (event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); const { error } = await supabase.from("subscribers").upsert({ email: String(formData.get("email")).trim().toLowerCase(), name: formData.get("name"), active: true }, { onConflict: "email" }); if (error) return setMessage("subscriber-message", error.message, "error"); await loadOwnerData(); renderSubscribers(); event.currentTarget.reset(); setMessage("subscriber-message", "Subscriber saved.", "success"); });
if (!isEnhancedAdminForm("artist-profile-form")) document.getElementById("artist-profile-form").addEventListener("submit", async (event) => { event.preventDefault(); event.stopPropagation(); const form = event.currentTarget; const formData = new FormData(form); const id = String(formData.get("artistId") || ""); const payload = { name: formData.get("name"), genre: formData.get("genre"), bio: formData.get("bio"), instagram_url: normalizeUrl(formData.get("instagram")), spotify_url: normalizeUrl(formData.get("spotify")), soundcloud_url: normalizeUrl(formData.get("soundcloud")), bandcamp_url: normalizeUrl(formData.get("bandcamp")), website_url: normalizeUrl(formData.get("website")), linktree_url: normalizeUrl(formData.get("linktree")) }; state.ownerView = "artists"; forceOwnerDomOpen(); renderOwnerPanels(); let artistId = id; if (id) { const { error } = await supabase.from("artists").update(payload).eq("id", id); if (error) return setMessage("artist-profile-message", error.message, "error"); } else { const { data, error } = await supabase.from("artists").insert(payload).select("id").single(); if (error) return setMessage("artist-profile-message", error.message, "error"); artistId = data.id; } const uploads = await filePaths(`artists/${artistId}`, form.elements.photos.files); if (uploads.length) await supabase.from("artist_images").insert(uploads.map((storage_path, index) => ({ artist_id: artistId, storage_path, sort_order: index }))); await refreshPublicState(); persistPublicState(); renderAll(); clearArtistForm(); state.ownerView = "artists"; forceOwnerDomOpen(); renderOwnerPanels(); setMessage("artist-profile-message", id ? "Artist updated." : "Artist added.", "success"); });
document.getElementById("clear-artist-form").addEventListener("click", clearArtistForm);
if (!isEnhancedAdminForm("show-form")) document.getElementById("show-form").addEventListener("submit", async (event) => { event.preventDefault(); const form = event.currentTarget; const formData = new FormData(form); const id = String(formData.get("showId") || ""); const existing = state.shows.find((item) => item.id === id); let bannerPath = existing?.bannerPath || ""; const bannerUpload = await filePaths(`shows/${id || crypto.randomUUID()}/banner`, form.elements.bannerUpload.files); if (bannerUpload[0]) bannerPath = bannerUpload[0]; const payload = { title: formData.get("title"), show_date: formData.get("date"), venue: formData.get("venue"), address: formData.get("address") || "", description: formData.get("description"), banner_path: bannerPath }; let showId = id; if (id) { const { error } = await supabase.from("shows").update(payload).eq("id", id); if (error) return setMessage("show-message", error.message, "error"); } else { const { data, error } = await supabase.from("shows").insert(payload).select("id").single(); if (error) return setMessage("show-message", error.message, "error"); showId = data.id; } await replaceShowArtists(showId, splitLines(formData.get("artists"))); await replaceShowVideos(showId, splitLines(formData.get("videos"))); const galleryUploads = await filePaths(`shows/${showId}/gallery`, form.elements.galleryUpload.files); if (galleryUploads.length) await supabase.from("show_media").insert(galleryUploads.map((storage_path, index) => ({ show_id: showId, media_kind: "image", storage_path, sort_order: index }))); await refreshPublicState(showId); forceOwnerDomOpen(); renderAll(); clearShowForm(); setMessage("show-message", id ? "Archive post updated." : "Archive post added.", "success"); });
document.getElementById("clear-show-form").addEventListener("click", clearShowForm);
if (!isEnhancedAdminForm("affiliate-form")) document.getElementById("affiliate-form").addEventListener("submit", async (event) => { event.preventDefault(); const formData = new FormData(event.currentTarget); const id = String(formData.get("affiliateId") || ""); const payload = { name: formData.get("name"), blurb: formData.get("blurb"), url: formData.get("url") }; const result = id ? await supabase.from("affiliates").update(payload).eq("id", id) : await supabase.from("affiliates").insert(payload); if (result.error) return setMessage("affiliate-message", result.error.message, "error"); await refreshPublicState(); forceOwnerDomOpen(); renderAll(); clearAffiliateForm(); setMessage("affiliate-message", id ? "Affiliate updated." : "Affiliate added.", "success"); });
document.getElementById("clear-affiliate-form").addEventListener("click", clearAffiliateForm);
document.getElementById("archive-grid").addEventListener("click", (event) => { const card = event.target.closest("[data-show-id]"); if (!card) return; state.selectedShowId = card.dataset.showId; renderArchive(); q("show-detail").scrollIntoView({ behavior: "smooth", block: "start" }); });
document.getElementById("archive-grid").addEventListener("keydown", (event) => { if (event.key !== "Enter" && event.key !== " ") return; const card = event.target.closest("[data-show-id]"); if (!card) return; event.preventDefault(); state.selectedShowId = card.dataset.showId; renderArchive(); });
if (!isEnhancedAdminRegion("submission-list")) document.getElementById("submission-list").addEventListener("click", async (event) => { const statusButton = event.target.closest("[data-submission-id]"); if (statusButton) { const result = await supabase.from("artist_submissions").update({ status: statusButton.dataset.status }).eq("id", statusButton.dataset.submissionId); if (!result.error) { await loadOwnerData(); renderSubmissions(); } return; } const deleteButton = event.target.closest("[data-delete-submission-id]"); if (!deleteButton) return; const result = await supabase.from("artist_submissions").delete().eq("id", deleteButton.dataset.deleteSubmissionId); if (!result.error) { await loadOwnerData(); renderSubmissions(); } });
if (!isEnhancedAdminRegion("artist-admin-list")) document.getElementById("artist-admin-list").addEventListener("click", async (event) => { const editButton = event.target.closest("[data-edit-artist-id]"); if (editButton) return loadArtistIntoForm(editButton.dataset.editArtistId); const deleteButton = event.target.closest("[data-delete-artist-id]"); if (!deleteButton) return; const result = await supabase.from("artists").delete().eq("id", deleteButton.dataset.deleteArtistId); if (!result.error) { await loadPublicData(); renderAll(); } });
if (!isEnhancedAdminRegion("show-admin-list")) document.getElementById("show-admin-list").addEventListener("click", async (event) => { const editButton = event.target.closest("[data-edit-show-id]"); if (editButton) return loadShowIntoForm(editButton.dataset.editShowId); const viewButton = event.target.closest("[data-view-show-id]"); if (viewButton) { state.selectedShowId = viewButton.dataset.viewShowId; renderArchive(); closeOwnerMode(); return q("archive").scrollIntoView({ behavior: "smooth", block: "start" }); } const deleteButton = event.target.closest("[data-delete-show-id]"); if (!deleteButton) return; const result = await supabase.from("shows").delete().eq("id", deleteButton.dataset.deleteShowId); if (!result.error) { await loadPublicData(); renderAll(); } });
if (!isEnhancedAdminRegion("affiliate-admin-list")) document.getElementById("affiliate-admin-list").addEventListener("click", async (event) => { const editButton = event.target.closest("[data-edit-affiliate-id]"); if (editButton) return loadAffiliateIntoForm(editButton.dataset.editAffiliateId); const deleteButton = event.target.closest("[data-delete-affiliate-id]"); if (!deleteButton) return; const result = await supabase.from("affiliates").delete().eq("id", deleteButton.dataset.deleteAffiliateId); if (!result.error) { await loadPublicData(); renderAll(); } });
if (!isEnhancedAdminRegion("campaign-log")) document.getElementById("campaign-log").addEventListener("click", async (event) => { const editButton = event.target.closest("[data-edit-newsletter-id]"); if (editButton) return loadNewsletterIntoForm(editButton.dataset.editNewsletterId); const deleteButton = event.target.closest("[data-delete-newsletter-id]"); if (deleteButton) { const result = await supabase.from("newsletters").delete().eq("id", deleteButton.dataset.deleteNewsletterId); if (!result.error) { await loadPublicData(); renderAll(); clearNewsletterForm(); } return; } const broadcastButton = event.target.closest("[data-broadcast-newsletter-id]"); if (!broadcastButton) return; const recipients_count = state.subscribers.filter((item) => item.active).length; const result = await supabase.from("newsletters").update({ sent_at: new Date().toISOString(), recipients_count }).eq("id", broadcastButton.dataset.broadcastNewsletterId); if (!result.error) { await loadPublicData(); renderAll(); setMessage("campaign-message", `Broadcast sent to ${recipients_count} active subscriber(s).`, "success"); } });
if (!isEnhancedAdminRegion("subscriber-list")) document.getElementById("subscriber-list").addEventListener("click", async (event) => { const deleteButton = event.target.closest("[data-delete-subscriber-id]"); if (!deleteButton) return; const result = await supabase.from("subscribers").delete().eq("id", deleteButton.dataset.deleteSubscriberId); if (!result.error) { await loadOwnerData(); renderSubscribers(); } });
window.__soundwavState = state;
window.__soundwavRenderSiteCopy = renderSiteCopy;
window.__soundwavRenderAll = renderAll;
window.__soundwavArtistPlaceholder = ARTIST_PLACEHOLDER;
window.__soundwavArtistPlaceholderKey = ARTIST_PLACEHOLDER_KEY;
window.__soundwavBuildNewsletterEmailPayload = buildNewsletterEmailPayload;
window.__soundwavNewsletterEmailFooter = NEWSLETTER_EMAIL_FOOTER;
window.__soundwavOpenTestNewsletterBroadcast = openTestNewsletterBroadcast;
initSoundwaveBackground();
renderAll();
initialize().catch((error) => { console.error(error); setMessage("login-message", error.message || "Setup error", "error"); });



































