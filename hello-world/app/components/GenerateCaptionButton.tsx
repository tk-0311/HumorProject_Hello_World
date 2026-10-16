'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function GenerateCaptionButton() {
  const primaryLink = useRef<HTMLAnchorElement>(null);
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const link = primaryLink.current;
    if (!link) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowFloating(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
    }, { threshold: 0 });
    observer.observe(link);
    return () => observer.disconnect();
  }, []);

  return <>
    <Link ref={primaryLink} href="/new" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--foreground)] px-5 py-3 font-bold text-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]">
      Generate a caption
    </Link>
    {showFloating && <Link
      href="/new"
      aria-label="Generate a new caption"
      title="Generate a new caption"
      className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full border border-[#252923]/20 bg-[var(--accent)] text-[#252923] shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transition-none sm:right-8 sm:bottom-8 sm:h-16 sm:w-16"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-7 w-7"><path d="M12 5v14M5 12h14" /></svg>
    </Link>}
  </>;
}
