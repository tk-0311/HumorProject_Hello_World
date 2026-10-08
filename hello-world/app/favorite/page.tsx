import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import NavBar from "../components/NavBar";

export const metadata: Metadata = {
  title: "Favorites | Humor Project",
};

export default async function FavoritePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const photoResult = user
    ? await supabase
        .from("profiles")
        .select("profile_image")
        .eq("user_id", user.id)
        .maybeSingle()
    : null;

  return (
    <>
      <NavBar />
      <main className="flex min-h-[calc(100svh-85px)] items-center justify-center bg-[var(--background)] px-5 py-12 text-[var(--foreground)] sm:min-h-[calc(100svh-104px)]">
        <section className="flex w-full max-w-[620px] flex-col items-center gap-6 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-6 py-10 text-center shadow-[0_16px_50px_rgba(37,41,35,0.07)] sm:px-10 sm:py-12">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
            <span aria-hidden="true" className="text-lg">✳</span> Keep the good ones close
          </p>
          {user && (photoResult?.data?.profile_image ? (
            // Public profile images are served from Supabase Storage.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoResult.data.profile_image}
              alt="Your profile"
              className="h-32 w-32 rounded-full border-4 border-[var(--accent)] object-cover sm:h-40 sm:w-40"
            />
          ) : (
            <div aria-label="No profile photo uploaded" className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[var(--accent)] bg-[var(--surface-raised)] text-5xl text-[var(--muted)] sm:h-40 sm:w-40">
              {Array.from(user.email?.trim() ?? "?")[0]?.toUpperCase() || "?"}
            </div>
          ))}
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">Your favorites</h1>
          <p className="max-w-md text-base leading-relaxed text-[var(--muted)]">
            {user ? "You’re logged in. Your favorite posts will be easy to find here." : "Favorites are available when you’re logged in."}
          </p>
          {!user && (
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-[9px] bg-[var(--foreground)] px-6 font-semibold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)]">
              Login
              <span aria-hidden="true" className="text-[var(--accent)]">✳</span>
            </Link>
          )}
        </section>
      </main>
    </>
  );
}
