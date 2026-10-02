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
      <main className="flex min-h-[calc(100svh-112px)] items-center justify-center bg-[var(--background)] px-5 py-12 text-[var(--foreground)] sm:min-h-[calc(100svh-148px)]">
        <section className="flex flex-col items-center gap-6 text-center">
          {user && (photoResult?.data?.profile_image ? (
            // Public profile images are served from Supabase Storage.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoResult.data.profile_image}
              alt="Your profile"
              className="h-40 w-40 rounded-full border border-[var(--border)] object-cover sm:h-56 sm:w-56"
            />
          ) : (
            <div aria-label="No profile photo uploaded" className="flex h-40 w-40 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-5xl text-[var(--muted)] sm:h-56 sm:w-56">
              {Array.from(user.email?.trim() ?? "?")[0]?.toUpperCase() || "?"}
            </div>
          ))}
          <p className="text-xl font-medium text-[var(--foreground)]">Favorites will only show if you are logged in.</p>
          {!user && (
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center bg-[#ffda00] px-6 font-semibold text-[#17120a] transition-colors hover:bg-[#ffe54d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
              Login
            </Link>
          )}
        </section>
      </main>
    </>
  );
}
