"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type ProfilePhotoFormProps = {
  currentPhoto: string | null;
  displayName: string;
};

export default function ProfilePhotoForm({ currentPhoto, displayName }: ProfilePhotoFormProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const photo = formData.get("photo");
    if (!(photo instanceof File) || photo.size === 0) {
      setErrorMessage("Choose an image to upload.");
      return;
    }

    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const extension = extensions[photo.type];
    if (!extension) {
      setErrorMessage("Choose a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (photo.size > 5 * 1024 * 1024) {
      setErrorMessage("The image must be 5 MB or smaller.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    let objectPath: string | null = null;

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setErrorMessage("Please sign in again before uploading a photo.");
        return;
      }

      objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(objectPath, photo, {
          cacheControl: "3600",
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Profile photo upload failed:", uploadError.message);
        setErrorMessage(
          uploadError.message.toLowerCase().includes("bucket")
            ? "The profile photo storage bucket is not set up yet. Apply the profile photo Storage migration."
            : `Upload failed: ${uploadError.message}`,
        );
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(objectPath);

      const { data: savedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({
          profile_image: publicUrl.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select("user_id")
        .maybeSingle();

      if (profileError || !savedProfile) {
        console.error("Profile photo URL save failed:", profileError?.message ?? "Profile row not found");
        await supabase.storage.from("profile-photos").remove([objectPath]);
        objectPath = null;
        setErrorMessage(
          profileError
            ? `The image uploaded but the profile could not be updated: ${profileError.message}`
            : "No profile row was found for your account. Sign out and back in, then try again.",
        );
        return;
      }

      setSuccessMessage("Profile photo updated.");
      router.refresh();
    } catch (uploadError) {
      console.error("Profile photo upload failed:", uploadError);
      setErrorMessage("The photo could not be uploaded. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="mt-8 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4">
        {currentPhoto ? (
          // Profile images are stored in a public Supabase Storage bucket.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentPhoto} alt={`${displayName}'s profile`} className="h-24 w-24 rounded-full border border-white/15 object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/5 text-3xl font-semibold text-[#ffda00]">
            {Array.from(displayName.trim())[0]?.toUpperCase() || "?"}
          </span>
        )}
        <div>
          <p className="text-lg font-semibold">Profile photo</p>
          <p className="mt-1 text-sm text-[var(--muted)]">JPEG, PNG, WebP, or GIF. Maximum 5 MB.</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 sm:items-end">
        <label htmlFor="profile-photo" className="sr-only">Choose profile photo</label>
        <input
          id="profile-photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          className="block w-full text-sm text-[var(--muted)] file:mr-4 file:border file:border-white/20 file:bg-transparent file:px-4 file:py-3 file:font-semibold file:text-[var(--foreground)] hover:file:bg-white/5 sm:max-w-md"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-12 items-center justify-center bg-[#ffda00] px-6 font-semibold text-[#17120a] transition-colors hover:bg-[#ffe54d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Upload photo"}
        </button>
      </div>

      {errorMessage && <p role="alert" className="text-sm text-[#ffe56b] sm:basis-full">{errorMessage}</p>}
      {successMessage && <p role="status" className="text-sm text-emerald-300 sm:basis-full">{successMessage}</p>}
    </form>
  );
}
