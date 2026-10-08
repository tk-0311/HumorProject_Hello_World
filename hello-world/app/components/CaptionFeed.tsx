import { CAPTION_IMAGE_BUCKET } from '@/lib/ai/images';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import CaptionCard, { type Caption } from './CaptionCard';
export default async function CaptionFeed({ canVote }: { canVote: boolean }) {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.from('ai_generations').select('id,situation,caption,style,created_at,image_path').order('created_at', { ascending: false }).limit(30);
  if (error) return <p role="status" className="rounded-lg border border-[var(--border)] p-5">Captions are unavailable right now. Please try again later.</p>;
  const captions: Caption[] = data ?? [];
  if (!captions.length) return <div className="app-surface rounded-2xl border border-[var(--border)] p-6"><h3 className="text-xl font-bold">Be the first bad influence.</h3><p className="my-3 text-[var(--muted)]">No AI captions yet. Turn a campus or NYC moment into the first one.</p><Link href={canVote ? '/new' : '/login'} className="font-bold underline">{canVote ? 'Generate a caption' : 'Log in to generate'}</Link></div>;
  const imagePaths = captions.flatMap(c => c.image_path ? [c.image_path] : []);
  const { data: imageLinks } = imagePaths.length ? await supabase.storage.from(CAPTION_IMAGE_BUCKET).createSignedUrls(imagePaths, 3600) : { data: [] };
  const imageMap = new Map((imageLinks ?? []).map(image => [image.path, image.signedUrl]));
  const ids = captions.map(c => c.id);
  const { data: scores, error: scoreError } = await supabase.rpc('caption_scores', { generation_ids: ids });
  const { data: votes, error: voteError } = canVote ? await supabase.from('caption_votes').select('generation_id,value').in('generation_id',ids) : { data: [], error: null };
  if (scoreError || voteError) return <p role="status">Voting information could not be loaded. Please refresh before rating.</p>;
  const scoreMap = new Map<string,number>((scores ?? []).map((r: {generation_id:string;score:number}) => [r.generation_id,Number(r.score)]));
  const voteMap = new Map<string,number>((votes ?? []).map((r: {generation_id:string;value:number}) => [r.generation_id,r.value]));
  return <div className="space-y-5">{captions.map(c => <CaptionCard key={`${c.id}-${scoreMap.get(c.id)}-${voteMap.get(c.id)}`} caption={c} imageUrl={c.image_path ? imageMap.get(c.image_path) ?? undefined : undefined} score={scoreMap.get(c.id) ?? 0} myVote={voteMap.get(c.id) ?? 0} canVote={canVote}/>)}</div>;
}
