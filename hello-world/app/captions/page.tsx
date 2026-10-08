import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import NavBar from '@/app/components/NavBar';
import CaptionFeed from '@/app/components/CaptionFeed';
export default async function CaptionsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  return <><NavBar/><main className="mx-auto w-full max-w-2xl px-5 py-10"><div className="mb-7"><p className="text-sm font-bold uppercase tracking-widest text-[var(--accent-strong)]">The community decides</p><h1 className="my-3 text-4xl font-extrabold">Campus chaos, captioned.</h1><p className="mb-5 text-[var(--muted)]">Photos, AI captions, and the community’s favorite picks. Rate the ones that land.</p><Link href={user ? '/new' : '/login'} className="inline-block rounded-lg bg-[var(--foreground)] px-5 py-3 font-bold text-[var(--background)]">{user ? 'Generate a caption' : 'Log in to generate'}</Link></div><CaptionFeed canVote={!!user}/></main></>;
}
