'use server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { parseVote } from '@/lib/ai/captions';
import { recordTelemetry } from '@/lib/telemetry';
export async function voteCaption(id: string, value: number): Promise<{ error: string; likes?: number; dislikes?: number; value?: number }> {
  const startedAt = Date.now();
  const finish = async (result: { error: string; likes?: number; dislikes?: number; value?: number }, success: boolean, errorCategory?: string) => {
    await recordTelemetry({ route: 'vote.submit', method: 'SERVER_ACTION', success, durationMs: Date.now() - startedAt, errorCategory });
    return result;
  };
  const input = parseVote(id, value);
  if (!input) return finish({ error: 'Invalid vote.' }, false, 'validation');
  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return finish({ error: 'Please log in before voting.' }, false, 'authentication');
  const query = input.value === 0
    ? supabase.from('caption_votes').delete().eq('user_id', user.id).eq('generation_id', input.id)
    : supabase.from('caption_votes').upsert({ user_id: user.id, generation_id: input.id, value: input.value }, { onConflict: 'user_id,generation_id' });
  const { error } = await query;
  if (error) return finish({ error: 'Your vote could not be saved. Please try again.' }, false, 'database');
  // CaptionCard updates from this result; refreshing the routes would reload the feed.
  const { data } = await supabase.rpc('caption_vote_counts', { generation_ids: [input.id] });
  return finish({ error: '', value: input.value,
    likes: data?.[0]?.likes === undefined ? undefined : Number(data[0].likes),
    dislikes: data?.[0]?.dislikes === undefined ? undefined : Number(data[0].dislikes),
  }, true);
}
