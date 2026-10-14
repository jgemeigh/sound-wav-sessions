# Staged cleanup baseline (2026-10-14)

## Stage 1

- Extract the newsletter markup into admin-newsletters.js; retain delegated handlers and the existing interface.
- Escape saved newsletter content and accept an empty database response instead of restoring stale cached newsletters.
- Reuse app.js's initial public-data request during admin startup.
- Permit the exact production image origin in CSP so saved absolute image URLs also work on preview deployments.
- No schema, authentication, show-management, font, or animation redesign.

## Repeatable checks

Run `npm ci`, `npm test`, and `npm run test:browser`. Browser tests use installed Chrome.
To test a draft deployment in PowerShell:

```powershell
$env:SOUNDWAV_TEST_URL='https://DEPLOY-ID--sound-wav-sessions.netlify.app'
npm run test:browser
Remove-Item Env:SOUNDWAV_TEST_URL
```

The browser suite intercepts Supabase traffic with in-memory fixtures. It checks public content, login/single-click logout, newsletter lock/unlock and independent current selection, newsletter editing, upcoming draft editing and image preview, and deleting the final newsletter. It cannot verify real credentials, RLS policies, actual storage uploads, or email delivery. Never use real broadcasts as regression fixtures.

Stage 1 result: 17 unit tests and 6 browser workflows passed locally and the 6 browser workflows passed on the hosted preview. A separate read-only preview check confirmed real content and sampled production-origin artist images loaded.

## Measurements

Read-only browser samples before cleanup: 11 public REST requests and 30 logged-out admin REST requests. After cleanup: 11 public and 22 admin requests. The admin reduction is 8 requests (about 27%), not a claim of 27% faster loading.

One public-load sample had REST durations around 3.7-3.9 seconds. This is not a controlled latency benchmark; network and backend cold-start effects remain unisolated.

## Release and rollback

Verify a Netlify draft first, then publish the same code. Pre-stage source anchor: commit `2295f5c`. Keep the previous production deploy available in Netlify's deploy history for immediate republishing. No database migration is required to roll back this stage. Do not reset the working tree or overwrite the user's .gitignore change.

## Next stages

Measure repeated cold/warm loads and request initiators, then consolidate remaining show/site-copy/upcoming loaders individually. Extract mutation handlers only after adding broadcast-button dispatch and error-state browser coverage. Add existing-image previews, actual storage integration in a dedicated test environment, and slow/failing request scenarios before widening the refactor. The large admin file and other fallback renderers remain; this stage is not a full architectural cleanup.
