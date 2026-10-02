"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileState } from "./actions";

const initialState: ProfileState = { error: "", success: "" };

type ProfileFormProps = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
};

const inputClassName = "h-[70px] w-full border border-white/15 bg-transparent px-5 text-lg text-white outline-none transition-colors focus:border-[#ffda00] focus:ring-1 focus:ring-[#ffda00] sm:text-[24px]";
const labelClassName = "mb-4 block text-lg font-medium text-white sm:text-[24px]";

export default function ProfileForm({ firstName, lastName, email, address }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  return (
    <form action={formAction} className="mt-10 space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <label htmlFor="first_name" className={labelClassName}>First Name</label>
          <input id="first_name" name="first_name" type="text" autoComplete="given-name" required maxLength={100}
            defaultValue={firstName} className={inputClassName} />
        </div>
        <div>
          <label htmlFor="last_name" className={labelClassName}>Last Name</label>
          <input id="last_name" name="last_name" type="text" autoComplete="family-name" required maxLength={100}
            defaultValue={lastName} className={inputClassName} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClassName}>Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254}
          defaultValue={email} aria-describedby="email-help"
          className={inputClassName} />
        <p id="email-help" className="mt-2 text-sm text-[var(--muted)]">
          This updates your profile contact email, not your sign-in email.
        </p>
      </div>

      <div>
        <label htmlFor="address" className={labelClassName}>Address</label>
        <input id="address" name="address" type="text" autoComplete="street-address" maxLength={250}
          defaultValue={address} className={inputClassName} placeholder="Enter your address" />
      </div>

      {state.error && <p role="alert" className="border-l-2 border-[#ffda00] bg-[#ffda00]/10 px-4 py-3 text-sm text-[#ffe56b]">{state.error}</p>}
      {state.success && <p role="status" className="border-l-2 border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{state.success}</p>}

      <button type="submit" disabled={pending}
        className="flex h-[70px] w-full items-center justify-center bg-[#ffda00] px-5 text-xl font-semibold text-[#17120a] transition-colors hover:bg-[#ffe54d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60 sm:text-[24px]">
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
