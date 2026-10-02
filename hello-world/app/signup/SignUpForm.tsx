"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type SignUpState } from "./actions";

const initialState: SignUpState = { error: "", success: "" };

export default function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-semibold text-neutral-300">Name</label>
        <input id="name" name="name" type="text" autoComplete="name" required maxLength={100}
          className="h-14 w-full border border-white/15 bg-[#0c0a09] px-4 text-base text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#ffda00] focus:ring-1 focus:ring-[#ffda00]"
          placeholder="Your name" />
      </div>

      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-semibold text-neutral-300">Username <span className="font-normal text-neutral-500">(optional)</span></label>
        <input id="username" name="username" type="text" autoComplete="username" maxLength={30}
          className="h-14 w-full border border-white/15 bg-[#0c0a09] px-4 text-base text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#ffda00] focus:ring-1 focus:ring-[#ffda00]"
          placeholder="Choose a username" />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-neutral-300">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254}
          className="h-14 w-full border border-white/15 bg-[#0c0a09] px-4 text-base text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#ffda00] focus:ring-1 focus:ring-[#ffda00]"
          placeholder="you@example.com" />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-neutral-300">Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8}
          className="h-14 w-full border border-white/15 bg-[#0c0a09] px-4 text-base text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#ffda00] focus:ring-1 focus:ring-[#ffda00]"
          placeholder="At least 8 characters" />
      </div>

      {state.error && <p role="alert" className="border-l-2 border-[#ffda00] bg-[#ffda00]/10 px-4 py-3 text-sm text-[#ffe56b]">{state.error}</p>}
      {state.success && <p role="status" className="border-l-2 border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{state.success}</p>}

      <button type="submit" disabled={pending}
        className="flex h-14 w-full items-center justify-center bg-[#ffda00] px-5 text-lg font-bold text-[#17120a] transition-colors hover:bg-[#ffe54d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60">
        {pending ? "Creating account..." : "Create account"}
      </button>

      <p className="pt-2 text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link href="/login-with-email" className="font-semibold text-[#ffda00] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00]">Log in</Link>
      </p>
    </form>
  );
}
