import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NavBar from "../components/NavBar";
import GoogleLoginForm from "../login/GoogleLoginForm";
import SignUpForm from "./SignUpForm";

export const metadata: Metadata = {
  title: "Sign Up | Humor Project",
};

export default async function SignUpPage() {
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
        <section aria-labelledby="signup-title" className="w-full max-w-[460px] border border-white/10 bg-[#12100e] p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ffda00]">Humor Project</p>
          <h1 id="signup-title" className="mt-3 text-3xl font-bold text-white sm:text-4xl">Create your account</h1>
          <p className="mt-3 text-base leading-relaxed text-neutral-400">Join the conversation.</p>
          <GoogleLoginForm label="Sign up with Google" />
          <div className="my-6 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.15em] text-neutral-500">
            <span className="h-px flex-1 bg-white/10" />
            or sign up with email
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <SignUpForm />
        </section>
      </main>
    </>
  );
}
