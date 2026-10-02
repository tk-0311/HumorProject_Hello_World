import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LoginForm from "../login/LoginForm";

export const metadata: Metadata = {
  title: "Login with Email | Humor Project",
};

export default async function LoginWithEmailPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[#0c0a09] px-4 py-8 text-white sm:px-8 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[8%] h-px bg-white/10" />
      <section aria-labelledby="email-login-title" className="relative w-full max-w-[774px] border border-white/15 bg-[#0c0a09] px-6 py-8 sm:px-[42px] sm:py-[42px]">
        <h1 id="email-login-title" className="text-[28px] font-semibold leading-tight sm:text-[36px]">
          Login with Email
        </h1>
        <LoginForm />
      </section>
    </main>
  );
}
