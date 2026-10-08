# Image-first caption choices

Creation now requires a photo. There is no situation/context textbox or example situation picker. Users upload an image, optionally choose a humor style, and generate three distinct AI caption options based on the photo. They select one option and click **Publish selected caption**. Generating options does not publish anything. The selected photo is retained on errors and **Generate three more** requests a fresh set under the existing daily allowance.

Each generation set is saved to an owner-private `caption_drafts` row with the full prompt, model, three options, and stored image path. Publication passes only the draft ID and zero-based option index. The `publish_caption_choice` function authenticates the owner, locks the draft, inserts the stored selected caption into the existing `ai_generations` feed, and records the published ID. Repeated publication returns that ID, preventing duplicate posts. Direct client updates cannot change or reset a draft's publication. Published captions continue using the existing voting flow.

The database migration `private_caption_choices_and_publication` has already been applied. Its source is recorded in `database/caption-choices.sql`; do not rerun its creation SQL. Storage cleanup now protects photos referenced by a private draft as well as published captions. Abandoned drafts remain private in storage/database; this update does not add a retention job.

Apply `caption-choices.patch` from the `hello-world` folder and restart the app. No new dependencies or environment variables are needed. Continue using the existing image-capable Gemini model and server-only API key. This patch assumes the earlier caption/image patches are installed.

Verification: TypeScript and 11 validation tests passed. Live rollback tests verified draft ownership/privacy, invalid selection rejection, anonymous publication denial, exact selected-caption publication, idempotency, and immutable publication state. End-to-end Gemini image generation and browser interaction remain unverified in this chat. Prior build attempts were blocked by the environment's Google Fonts access.

The SECURITY DEFINER publication function intentionally crosses the private-draft/public-feed boundary; it has a fixed search path, fully qualified tables, explicit auth and ownership checks, and authenticated-only execution. The database advisor flags these executable functions for review: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
