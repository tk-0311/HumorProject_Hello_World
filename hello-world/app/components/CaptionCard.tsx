'use client';
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { voteCaption } from '@/app/captions/actions';
export type Caption = { id: string; situation: string; caption: string; style: string; created_at: string; image_path?: string | null };
export default function CaptionCard({ caption, score, myVote, canVote, imageUrl }: { caption: Caption; score: number; myVote: number; canVote: boolean; imageUrl?: string }) {
  const [current, setCurrent] = useState({ score, vote: myVote });
  const [imageFailed, setImageFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  function cast(value: -1 | 1) {
    if (!canVote || inFlight.current) return;
    inFlight.current = true;
    const previous = current;
    const next = current.vote === value ? 0 : value;
    const optimistic = { vote: next, score: current.score - current.vote + next };
    // Show the vote immediately while the authenticated action saves it.
    setCurrent(optimistic);
    startTransition(async () => {
      try {
        const result = await voteCaption(caption.id, next);
        if (result.error) {
          setCurrent(previous);
          return;
        }
        setCurrent({ vote: result.value ?? next, score: result.score ?? optimistic.score });
      } catch {
        setCurrent(previous);
      } finally {
        inFlight.current = false;
      }
    });
  }
  return <article id={`caption-${caption.id}`} className="app-surface w-full scroll-mt-6 rounded-2xl border border-[var(--border)] p-5 sm:p-6"><div className="flex justify-between gap-3 text-sm text-[var(--muted)]"><span>AI caption · {caption.style}</span><time dateTime={caption.created_at}>{new Date(caption.created_at).toISOString().slice(0,10)}</time></div>{caption.situation !== 'A photo shared for a caption.' && <p className="mt-4 text-sm text-[var(--muted)]">{caption.situation}</p>}{caption.image_path && <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">{imageUrl && !imageFailed ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="User-uploaded photo for this AI caption" loading="lazy" onError={() => setImageFailed(true)} className="max-h-[480px] w-full object-contain"/>
  ) : <p className="p-4 text-sm text-[var(--muted)]">Photo unavailable. Refresh the page to try again.</p>}</div>}<h3 className="my-5 whitespace-pre-wrap break-words text-2xl font-semibold leading-relaxed">{caption.caption}</h3><div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-4">{canVote ? <>{([1,-1] as const).map(value => <button key={value} disabled={pending} aria-pressed={current.vote === value} aria-label={`${value === 1 ? 'Upvote' : 'Downvote'} caption`} onClick={() => cast(value)} className={`min-h-11 rounded-lg border px-4 py-2 text-sm font-bold ${current.vote === value ? 'border-[var(--accent-strong)] bg-[var(--accent)] text-[#252923]' : 'border-[var(--border)]'}`}>{value === 1 ? '↑ Funny' : '↓ Try again'}</button>)}</> : <Link href="/login" className="rounded-lg border border-[var(--border)] px-4 py-3 text-sm font-bold">Log in to rate</Link>}<span className="ml-auto text-sm tabular-nums" aria-label={`Score ${current.score}`}>Score {current.score}</span></div></article>;
}
