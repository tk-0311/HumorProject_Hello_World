"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-10 space-y-8">
      <div className="space-y-3">
        <label htmlFor="email" className="block text-[20px] font-medium text-white sm:text-[24px]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-[68px] w-full border border-white/15 bg-[#0c0a09] px-5 text-lg text-white outline-none transition-colors placeholder:text-[#aaa6a3] focus:border-[#ffda00] focus:ring-1 focus:ring-[#ffda00] sm:text-[24px]"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-3">
        <label htmlFor="password" className="block text-[20px] font-medium text-white sm:text-[24px]">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-[68px] w-full border border-white/15 bg-[#0c0a09] px-5 pr-14 text-lg text-white outline-none transition-colors placeholder:text-[#aaa6a3] focus:border-[#ffda00] focus:ring-1 focus:ring-[#ffda00] sm:text-[24px]"
            placeholder="Your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-3 flex w-10 items-center justify-center text-[#aaa6a3] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00]"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
              {showPassword ? (
                <>
                  <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.3 4.2 9 7-.3 1.2-1.2 2.6-2.5 3.8M6.2 6.2C3.8 7.7 2.4 9.9 2 12c.7 2.8 4 7 10 7 1 0 1.9-.1 2.8-.4" />
                </>
              ) : (
                <>
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
        <Link href="/forgot-password" className="inline-flex text-base text-white underline underline-offset-4 hover:text-[#ffda00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00]">
          Forgot Password?
        </Link>
      </div>

      {state.error && (
        <p role="alert" className="border-l-2 border-[#ffda00] bg-[#ffda00]/10 px-4 py-3 text-sm text-[#ffe56b]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
          className="flex h-[68px] w-full items-center justify-center bg-[#ffda00] px-5 text-xl font-bold text-[#17120a] transition-colors hover:bg-[#ffe54d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60 sm:text-[24px]"
      >
          {pending ? "Signing in..." : "Login"}
      </button>

      <p className="pt-7 text-center text-lg text-white sm:text-[24px]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4 hover:text-[#ffda00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffda00]">
          Sign up
        </Link>
      </p>
    </form>
  );
}
