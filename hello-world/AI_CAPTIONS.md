# AI captions and voting (assignment steps 1–5)

## Product choice

Sam wants relatable campus and NYC humor with little effort. The app turns one situation into a short caption in a selected humor style. Fresh captions provide a reason to return; visible scores let the community signal what lands. Style control, publishing, and community voting improve the creation-to-feedback loop. Existing community posts remain available. No uploads, comments, notifications, or unrelated features were added.

## Included

- `/new`: authenticated creation form, three styles, situation suggestions, loading/error/result states.
- `/captions`: newest 30 saved captions, aggregate scores, sign-in prompt for visitors.
- `/`: logged-out landing page; signed-in real feed with AI captions and creation links. Apply `database/ranked-caption-feed.sql` after the caption/image migrations: posts from the last 72 hours appear first, ranked by positive votes (likes), with newer posts breaking ties. Older posts follow newest-first, up to 30 posts total. Ranking happens before the limit; downvotes affect displayed scores but not the likes ranking. `/captions` remains newest-first. If the ranking function is missing (`PGRST202` or `42883`), the homepage temporarily falls back to newest-first and logs a migration reminder. Other query failures log their error code on the server and keep the unavailable message.
- Server-side Gemini calls, 25-second timeout, structured JSON output validation.
- Stored situation, full provider prompt, model, creator, caption, and timestamp.
- One vote per user/caption; changing a vote updates it, clicking the selected vote removes it.
- Limit of ten successfully generated and saved caption sets per user per UTC day. Failed calls do not count. Apply `database/successful-caption-quota.sql` after `database/caption-choices.sql` to enable this policy on existing databases. It counts saved drafts (including existing drafts), ignores historical failed attempts, and serializes draft inserts to enforce the limit under concurrent requests. Provider-level limits still need configuration for aggregate usage across users.

## Installation

The connected Supabase migration `ai_captions_votes_and_strict_rls` has already been applied. Do not run its creation SQL again. `database/ai-captions.sql` records its exact source for review/history.

Apply the supplied source patch from the `hello-world` folder, then add these server environment variables to `.env.local`:

```
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3.8-flash
```

Choose a model available to your Gemini key that supports the generateContent structured-output API. The key must never use a `NEXT_PUBLIC_` prefix. Restart the app after changing environment variables. Add these same values in Vercel later; deployment is outside steps 1–5.

No new npm dependencies are required. Generation is real; there is no mock fallback. Missing provider settings produce an explicit unavailable message without consuming a database attempt.

Official API reference: https://ai.google.dev/gemini-api/docs/generate-content/structured-output

## Security decisions

New generations can only be inserted with the signed-in user's ID. Prompt, model, and creator columns are not readable by public clients; displayed situation/caption fields are public. Existing posts/profiles require authentication, and existing private profile column grants are retained. Votes are readable/mutable only by their owners; a unique key and value constraint enforce valid single votes. Arbitrary raw vote mutations cannot alter another user's vote.

`caption_scores` deliberately uses SECURITY DEFINER to return only aggregate scores for at most 100 captions while keeping individual votes private. After the successful-caption-quota migration, `claim_caption_attempt` checks the saved-draft count without reserving an attempt; `enforce_successful_caption_quota` enforces the limit under a per-user advisory lock when a draft is saved. Both fix their search path, use qualified table names, and restrict execution grants. The existing private profile-details function remains owner-scoped. The security advisor flags these deliberate function boundaries for review. Existing leaked-password protection is disabled; enable it in Supabase Auth settings when available.

The legacy anonymous profile-picture write policies were removed; the app's owner-folder profile-photo upload/update/delete policies remain. Public avatar reads remain intentional. All public application tables have RLS enabled. Supabase-managed internal schemas are not modified.

## Verification

TypeScript and four validation/prompt tests passed. Live transaction tests passed for inserts, unique votes, vote updates, two-user ownership, private votes/prompts, aggregate scores, anonymous denial, and the daily quota. All test data was rolled back. RLS is enabled on all five public application tables. Real provider generation still requires a Gemini key. Production build was blocked by this environment's inability to reach Google Fonts for the app's existing Geist imports. Test accounts should confirm creation, reload persistence, voting changes/removal, and logged-out denial before submission.

The quota protects server-side provider calls. Authenticated clients can insert their own caption records under RLS; provenance is not cryptographically guaranteed. Do not present the AI label as verified provenance in a higher-trust product without moving creation behind a server-only database capability.
