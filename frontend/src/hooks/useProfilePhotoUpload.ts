import { useState } from "react";
import { User } from "@/types";
import apiClient from "@/services/apiClient";
import { supabaseClient } from "@/services/supabaseClient";

export function useProfilePhotoUpload(
  user: User | null,
  setUser: (user: User) => void
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const uploadPhoto = async (file: File) => {
    setLoading(true);
    if (!user) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabaseClient.storage
        .from("profile-photos")
        .upload(`profile-photo-${Date.now()}`, file);

      if (error) throw error;

      const publicUrl = supabaseClient.storage
        .from("profile-photos")
        .getPublicUrl(data.path).data.publicUrl;

      await apiClient.patch(`/user/${user.id}`, {
        photo_url: publicUrl,
      });

      setUser({ ...user, photo_url: publicUrl });
    } catch (err) {
      setError("Error uploading photo. Please try again.");
      console.error("Error during upload:", err);
    } finally {
      setLoading(false);
    }
  };

  return { uploadPhoto, loading, error, setError };
}
