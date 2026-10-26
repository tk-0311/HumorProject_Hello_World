'use server';
import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { CAPTION_IMAGE_BUCKET, imageFileError, imageExtension, matchesImageSignature, type ImageType } from '@/lib/ai/images';
import { buildImageCaptionPrompt, parseCaptionOptions, parseStyle, validCaptionSelection } from '@/lib/ai/caption-options';
import { describeGeminiError, shouldFallbackGeminiModel } from '@/lib/ai/gemini-error';
import { recordTelemetry } from '@/lib/telemetry';

export type CaptionOptionsState = { error: string; draftId: string; captions: string[] };
export async function generateCaptionOptions(form: FormData): Promise<CaptionOptionsState> {
  const startedAt = Date.now();
  let telemetryRecorded = false;
  let telemetryModel: string | undefined;
  let telemetryProviderStatus: number | undefined;
  const finish = async (state: CaptionOptionsState, success: boolean, errorCategory?: string): Promise<CaptionOptionsState> => {
    if (!telemetryRecorded) {
      telemetryRecorded = true;
      await recordTelemetry({ route: 'caption.generate', method: 'SERVER_ACTION', success, durationMs: Date.now() - startedAt, errorCategory, providerStatus: telemetryProviderStatus, model: telemetryModel });
    }
    return state;
  };
  const failure = (error: string, category = 'validation'): Promise<CaptionOptionsState> => finish({ error, draftId: '', captions: [] }, false, category);
  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return failure('Please log in before generating captions.');
  const image = form.get('image');
  if (!(image instanceof File) || !image.size) return failure('Choose a photo first.');
  const fileError = imageFileError(image.size, image.type);
  if (fileError) return failure(fileError);
  const imageBytes = Buffer.from(await image.arrayBuffer());
  if (!matchesImageSignature(imageBytes, image.type)) return failure('This file does not match its image format. Choose another photo.');
  const style = parseStyle(form.get('style'));
  if (!style) return failure('Choose a humor style.');
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!key || !model || !/^[a-zA-Z0-9.-]+$/.test(model)) return failure('Caption generation is not configured yet. Please try again later.');
  const { data: allowed, error: limitError } = await supabase.rpc('claim_caption_attempt');
  if (limitError) return failure('Could not check your generation allowance. Please try again.');
  if (!allowed) return failure('You’ve generated your 10 caption sets for today. Come back tomorrow (UTC).');
  const prompt = buildImageCaptionPrompt(style);
  const fallbackModel = 'gemini-3.1-flash-lite';
  const requestBody = JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: image.type, data: imageBytes.toString('base64') } }] }],
    generationConfig: { maxOutputTokens: 2048, responseFormat: { text: { mimeType: 'APPLICATION_JSON', schema: { type: 'object', properties: { captions: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 } }, required: ['captions'], additionalProperties: false } } } },
  });
  const requestGemini = (modelName: string) => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(25000),
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: requestBody,
  });
  const logGeminiRejection = async (modelName: string, response: Response) => {
    const errorBody: unknown = await response.json().catch(() => null);
    telemetryProviderStatus = response.status;
    const { message, diagnostic } = describeGeminiError(response.status, errorBody, key);
    // Detailed provider messages stay in local development logs. Production
    // logs contain only codes, and the browser never receives raw details.
    console.error('[caption-generation] Gemini rejected request ' + JSON.stringify({
      model: modelName, httpStatus: diagnostic.httpStatus,
      googleStatus: diagnostic.googleStatus, reason: diagnostic.reason,
      ...(process.env.NODE_ENV === 'development' ? { detail: diagnostic.detail } : {}),
    }));
    const code = process.env.NODE_ENV === 'development'
      ? ` (HTTP ${diagnostic.httpStatus}${diagnostic.googleStatus ? ` / ${diagnostic.googleStatus}` : ''})`
      : '';
    return { message: message + code, diagnostic };
  };
  let captions: string[];
  let modelUsed = model;
  telemetryModel = model;
  try {
    let response = await requestGemini(modelUsed);
    if (!response.ok) {
      const primaryFailure = await logGeminiRejection(modelUsed, response);
      if (!shouldFallbackGeminiModel(primaryFailure.diagnostic.httpStatus, primaryFailure.diagnostic.googleStatus)
        || modelUsed === fallbackModel) {
        return failure(primaryFailure.message, 'provider');
      }
      console.warn(`[caption-generation] ${modelUsed} is unavailable; retrying once with ${fallbackModel}.`);
      modelUsed = fallbackModel;
      telemetryModel = modelUsed;
      response = await requestGemini(modelUsed);
      if (!response.ok) {
        const fallbackFailure = await logGeminiRejection(modelUsed, response);
        return failure(fallbackFailure.message, 'provider');
      }
    }
    const body = await response.json();
    const candidate = body.candidates?.[0];
    if (candidate?.finishReason !== 'STOP') return failure('Gemini could not finish these captions. Try again or choose another photo.');
    const text = candidate.content?.parts?.filter((part: { text?: string; thought?: boolean }) => !part.thought).map((part: { text?: string }) => part.text ?? '').join('');
    captions = parseCaptionOptions(text ?? '');
  } catch { return failure('Generation timed out or returned unusable captions. Please try again.', 'provider_or_response'); }
  const imagePath = `${user.id}/${randomUUID()}.${imageExtension(image.type as ImageType)}`;
  const { error: uploadError } = await supabase.storage.from(CAPTION_IMAGE_BUCKET).upload(imagePath, imageBytes, { contentType: image.type, upsert: false });
  if (uploadError) return failure('Your photo could not be saved. Please try again.');
  // Options, prompt, and image stay private until the owner chooses a caption.
  const { data, error } = await supabase.from('caption_drafts').insert({ user_id: user.id, image_path: imagePath, prompt, style, model: modelUsed, captions }).select('id').single();
  if (error || !data) {
    await supabase.storage.from(CAPTION_IMAGE_BUCKET).remove([imagePath]);
    return failure(error?.code === 'P0001'
      ? 'You’ve generated your 10 caption sets for today. Come back tomorrow (UTC).'
      : 'Your caption options could not be saved. Please try again.');
  }
  return finish({ error: '', draftId: data.id, captions }, true);
}

export async function publishCaptionChoice(draftId: string, index: number): Promise<{ error: string; id: string }> {
  const startedAt = Date.now();
  const finish = async (result: { error: string; id: string }, success: boolean, errorCategory?: string) => {
    await recordTelemetry({ route: 'caption.publish', method: 'SERVER_ACTION', success, durationMs: Date.now() - startedAt, errorCategory });
    return result;
  };
  if (!validCaptionSelection(draftId, index)) return finish({ error: 'Choose one of the generated captions.', id: '' }, false, 'validation');
  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return finish({ error: 'Please log in before publishing.', id: '' }, false, 'authentication');
  // Atomic owner check + row lock + insert. A repeated request returns the same post.
  const { data: id, error } = await supabase.rpc('publish_caption_choice', { draft_id: draftId, choice_index: index });
  if (error || !id) return finish({ error: 'Your caption could not be published. Please try again.', id: '' }, false, 'database');
  revalidatePath('/'); revalidatePath('/captions');
  return finish({ error: '', id }, true);
}
