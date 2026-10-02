import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import NavBar from "../components/NavBar";
import ProfileForm from "./ProfileForm";
import ProfilePhotoForm from "./ProfilePhotoForm";

export const metadata: Metadata = {
  title: "Your Profile | Humor Project",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profileData, error: profileError } = await supabase.rpc("get_my_profile_details");

  if (profileError) {
    console.error("Profile load failed:", profileError.message);
  }

  const { data: photoProfile, error: photoError } = await supabase
    .from("profiles")
    .select("profile_image")
    .eq("user_id", user.id)
    .maybeSingle();

  if (photoError) {
    console.error("Profile photo load failed:", photoError.message);
  }

  const profile = profileData as {
    f_name?: string | null;
    l_name?: string | null;
    address?: string | null;
    email?: string | null;
  } | null;

  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string"
    ? metadata.full_name
    : typeof metadata.name === "string"
      ? metadata.name
      : "";
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  return (
    <>
      <NavBar />
      <main className="min-h-[calc(100svh-112px)] bg-[#0c0a09] px-5 py-10 text-white sm:min-h-[calc(100svh-148px)] sm:px-8 sm:py-12 lg:px-[max(64px,calc((100vw-1800px)/2))]">
        <section aria-labelledby="profile-heading" className="mx-auto w-full max-w-[1900px]">
          <h1 id="profile-heading" className="text-3xl font-bold sm:text-[42px]">Your Profile</h1>
          <ProfilePhotoForm
            currentPhoto={photoProfile?.profile_image ?? null}
            displayName={`${profile?.f_name ?? ""} ${profile?.l_name ?? ""}`.trim() || nameParts.join(" ") || "Your profile"}
          />
          <ProfileForm
            firstName={profile?.f_name ?? nameParts[0] ?? ""}
            lastName={profile?.l_name ?? nameParts.slice(1).join(" ")}
            email={profile?.email ?? user.email ?? ""}
            address={profile?.address ?? ""}
          />
        </section>
      </main>
    </>
  );
}
