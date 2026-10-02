import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NavBar from "../components/NavBar";
import GoogleLoginForm from "./GoogleLoginForm";

export const metadata: Metadata = {
  title: "Login | Humor Project",
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <>
      <NavBar />
      <main className="flex min-h-[calc(100svh-112px)] items-center justify-center bg-[#0c0a09] px-5 py-12 text-white sm:min-h-[calc(100svh-148px)] sm:py-16">
        <section aria-labelledby="login-title" className="w-full max-w-[460px] border border-white/10 bg-[#12100e] p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffda00]">
            Humor Project
          </p>
          <h1 id="login-title" className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Welcome back.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-neutral-400">
            Sign in to get back to the laughs.
          </p>
          <GoogleLoginForm />
          <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <Link href="/login-with-email" className="flex h-14 w-full items-center justify-center border border-white/20 px-5 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00]">
            Continue with Email
          </Link>
        </section>
      </main>
    </>
  );
}
