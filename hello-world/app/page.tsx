import { cookies } from 'next/headers';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import NavBar from './components/NavBar';
import CaptionFeed from './components/CaptionFeed';
import HumorLanding from './components/HumorLanding';

export default async function Page() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Login and OAuth callbacks return here; signed-in users go straight to captions.
  if (!user) return <HumorLanding />;

  return (
    <>
      <NavBar />
      <main className="min-h-[calc(100svh-85px)] bg-[var(--background)] px-5 py-10 text-[var(--foreground)] sm:min-h-[calc(100svh-104px)] sm:px-8 sm:py-14">
        <section aria-labelledby="feed-title" className="mx-auto max-w-[620px]">
          <div className="mb-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
              <span aria-hidden="true" className="text-lg">✳</span> Your daily dose of funny
            </p>
            <h1 id="feed-title" className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Fresh AI captions.</h1>
            <p className="mt-3 text-base text-[var(--muted)]">Real photos. AI punchlines. You decide what’s funny.</p>
            <Link href="/new" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--foreground)] px-5 py-3 font-bold text-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]">
              Generate a caption
            </Link>
          </div>
          <CaptionFeed canVote={true} />
        </section>
      </main>
    </>
  );
}
