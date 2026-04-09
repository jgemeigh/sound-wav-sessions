# SOUND.WAV SESSIONS

SOUND.WAV SESSIONS is a static public site plus an admin interface backed by Supabase.

## Structure

- [index.html](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\index.html): public site
- [admin.html](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\admin.html): admin interface
- [app.js](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\app.js): shared client-side rendering and state
- [styles.css](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\styles.css): shared styles
- [config.js](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\config.js): public Supabase client config
- [supabase](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\supabase): Supabase config and Edge Functions

## Current backend

- Supabase database for content and admin data
- Supabase Storage bucket: `soundwav-media`
- Supabase Edge Functions for newsletter delivery and Gmail OAuth callback
- Gmail API newsletter delivery from `sound.wavsessions@gmail.com`

## Main content areas

- Site text
- Donation methods
- Upcoming show manager
- Newsletter drafts and subscriber list
- Artists
- Archive
- Affiliates
- Performer submissions

## Local use

Open:

- [index.html](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\index.html)
- [admin.html](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\admin.html)

The site expects [config.js](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\config.js) to load before the main scripts.

## Deployment notes

- The frontend uses the public Supabase URL and anon key from [config.js](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\config.js)
- Gmail secrets are stored only in Supabase secrets
- After hosting, set the live site URL in the broadcast function environment as `SITE_URL`
- Netlify publish directory is the project root: `.`
- [netlify.toml](C:\Users\jgeme\OneDrive\Desktop\PROJECT 2\netlify.toml) includes the static publish config and an `/admin` -> `/admin.html` route

## Not in git

The following should stay out of version control:

- `node_modules/`
- local CLI caches
- any future private env files
