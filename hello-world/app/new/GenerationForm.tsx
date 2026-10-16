'use client';
import { useEffect, useRef, useState, useTransition, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateCaptionOptions, publishCaptionChoice, type CaptionOptionsState } from './actions';
import { imageFileError } from '@/lib/ai/images';
const empty: CaptionOptionsState = { error: '', draftId: '', captions: [] };
export default function GenerationForm({ onPublished }: { onPublished?: () => void } = {}) {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [style, setStyle] = useState('dry');
  const [options, setOptions] = useState(empty);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [publishedId, setPublishedId] = useState('');
  const [generating, generateTransition] = useTransition();
  const [publishing, publishTransition] = useTransition();
  const busy = generating || publishing;
  const input = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function clearOptions() { setOptions(empty); setSelected(null); setPublishedId(''); setError(''); }
  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    clearOptions();
    const file = event.target.files?.[0];
    if (!file) { setImage(null); setPreview(''); return; }
    const issue = imageFileError(file.size, file.type);
    if (issue) { setImage(null); setPreview(''); event.target.value = ''; setError(issue); return; }
    setImage(file); setPreview(URL.createObjectURL(file));
  }
  function removeImage() { clearOptions(); setImage(null); setPreview(''); if (input.current) input.current.value = ''; }
  function generate() {
    if (inFlight.current) return;
    if (!image) { setError('Choose a photo first.'); return; }
    inFlight.current = true;
    clearOptions();
    const form = new FormData(); form.set('image', image); form.set('style', style);
    generateTransition(async () => {
      try { const result = await generateCaptionOptions(form); setOptions(result); setError(result.error); }
      catch { setError('Could not generate captions. Your photo is still selected—please try again.'); }
      finally { inFlight.current = false; }
    });
  }
  function publish() {
    if (inFlight.current || selected === null || !options.draftId || publishedId) return;
    inFlight.current = true;
    setError('');
    publishTransition(async () => {
      try {
        const result = await publishCaptionChoice(options.draftId, selected);
        setError(result.error);
        if (result.id) {
          setPublishedId(result.id);
          if (onPublished) onPublished();
          else router.replace('/');
        }
      }
      catch { setError('Could not confirm publication. Please retry; this will not create a duplicate post.'); }
      finally { inFlight.current = false; }
    });
  }
  return <div className="space-y-7">
    <section aria-labelledby="upload-title" className="app-surface space-y-5 rounded-2xl border border-[var(--border)] p-6">
      <h2 id="upload-title" className="text-xl font-bold">1. Pick your photo</h2>
      <label htmlFor="image" className="block font-semibold">Upload an image</label>
      <input ref={input} id="image" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={chooseImage} aria-describedby="image-help" className="block w-full rounded-lg border border-dashed border-[var(--border)] p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent)] file:px-3 file:py-2 file:font-semibold file:text-[#252923]"/>
      <p id="image-help" className="text-sm text-[var(--muted)]">JPEG, PNG, or WebP · up to 3 MB. Gemini will suggest captions based on what’s in the photo.</p>
      {preview && <div className="space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Photo selected for caption generation" onError={() => { removeImage(); setError('This photo could not be opened. Choose another file.'); }} className="max-h-80 w-full rounded-xl object-contain"/>
        <button type="button" onClick={removeImage} disabled={busy} className="min-h-11 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold disabled:opacity-50">Remove photo</button>
      </div>}
      <label htmlFor="style" className="block font-bold">Your flavor of funny</label>
      <select id="style" disabled={busy} value={style} onChange={event => { setStyle(event.target.value); clearOptions(); }} className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"><option value="dry">Dry — painfully relatable</option><option value="absurd">Absurd — a little unhinged</option><option value="wholesome">Wholesome — gentle chaos</option></select>
      <button type="button" onClick={generate} disabled={busy || !image} className="min-h-11 rounded-lg bg-[var(--foreground)] px-5 py-3 font-bold text-[var(--background)] disabled:opacity-50">{generating ? 'Thinking of three good ones…' : options.draftId ? 'Generate three more' : 'Generate caption options'}</button>
      <p className="text-sm text-[var(--muted)]">Your photo is sent to Gemini. Options stay private until you publish. Only successfully generated and saved sets count toward your 10 daily sets (UTC). Failed attempts do not count.</p>
    </section>
    {options.draftId && <section aria-labelledby="choice-title" className="app-surface space-y-5 rounded-2xl border border-[var(--border)] p-6">
      <h2 id="choice-title" className="text-xl font-bold">2. Pick the one that lands</h2>
      <fieldset disabled={busy || !!publishedId} className="space-y-3"><legend className="mb-3 text-sm text-[var(--muted)]">Choose a caption for your photo.</legend>{options.captions.map((caption, index) => <label key={index} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selected === index ? 'border-[var(--accent-strong)] bg-[var(--menu-hover)]' : 'border-[var(--border)]'}`}><input type="radio" name="caption-choice" value={index} checked={selected === index} onChange={() => setSelected(index)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent-strong)]"/><span className="text-lg leading-relaxed">{caption}</span></label>)}</fieldset>
      {!publishedId && <><button type="button" onClick={publish} disabled={busy || selected === null} className="min-h-11 rounded-lg bg-[var(--foreground)] px-5 py-3 font-bold text-[var(--background)] disabled:opacity-50">{publishing ? 'Publishing…' : 'Publish selected caption'}</button><p className="text-sm text-[var(--muted)]">Your photo and chosen caption will be visible in the feed for others to rate.</p></>}
      {publishedId && <div role="status"><p className="font-bold">Published. Let the people decide.</p><Link href={`/captions#caption-${publishedId}`} className="mt-3 inline-block underline">View your photo and caption</Link></div>}
    </section>}
    <p role="status" className="text-sm">{generating ? 'Generating three caption options…' : publishing ? 'Publishing your selected caption…' : error || (options.draftId && !publishedId ? 'Three caption options are ready. Choose your favorite.' : '')}</p>
  </div>;
}
