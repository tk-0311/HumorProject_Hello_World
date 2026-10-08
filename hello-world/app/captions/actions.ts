'use server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { parseVote } from '@/lib/ai/captions';
export async function voteCaption(id: string, value: number): Promise<{ error: string; score?: number; value?: number }> {
  const input = parseVote(id, value);
  if (!input) return { error: 'Invalid vote.' };
  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: 'Please log in before voting.' };
  const query = input.value === 0
    ? supabase.from('caption_votes').delete().eq('user_id', user.id).eq('generation_id', input.id)
    : supabase.from('caption_votes').upsert({ user_id: user.id, generation_id: input.id, value: input.value }, { onConflict: 'user_id,generation_id' });
  const { error } = await query;
  if (error) return { error: 'Your vote could not be saved. Please try again.' };
  // CaptionCard updates from this result; refreshing the routes would reload the feed.
  const { data } = await supabase.rpc('caption_scores', { generation_ids: [input.id] });
  return { error: '', value: input.value, score: data?.[0]?.score === undefined ? undefined : Number(data[0].score) };
}
