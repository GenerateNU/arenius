"use client";

import { useRef } from "react";
import Image from "next/image";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Control, useForm } from "react-hook-form";
import { Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { useProfilePhotoUpload } from "@/hooks/useProfilePhotoUpload";
import apiClient from "@/services/apiClient";
import { updateUserProfile } from "@/services/user";
import DeleteAccountButton from "../auth/deleteAccount";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { UserProfilePicture } from "./ProfilePicture";
import LoadingSpinner from "../ui/loading-spinner";
import CustomAlert from "../ui/CustomAlert";
import { UpdateUserProfileRequest } from "@/types";
import XeroSSOButton from "../onboarding/xero-button";

const formSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  city: z.string(),
  state: z.string(),
});

const formFields = [
  { name: "first_name" as const, label: "First Name" },
  { name: "last_name" as const, label: "Last Name" },
  { name: "city" as const, label: "City" },
  { name: "state" as const, label: "State" },
];

export default function UserProfileContent() {
  const { user, setUser, userId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { uploadPhoto, loading, error, setError } = useProfilePhotoUpload(
    user,
    setUser
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      city: user?.city || "",
      state: user?.state || "",
    },
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleEditPasswordClick = async () => {
    try {
      await apiClient.post("/auth/forgot-password", { email: user?.email });
      toast("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setError("Failed to send reset email. Please try again.");
      console.error(error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!userId) {
      console.error("UserID is null.");
      return;
    }

    const req: UpdateUserProfileRequest = {
      first_name: values.first_name,
      last_name: values.last_name,
      city: values.city,
      state: values.state,
    };

    try {
      const response = await updateUserProfile(userId, req);
      if (response) {
        setUser(response);
        toast("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      toast.error("Error updating user profile: " + error);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadPhoto(file);
    }
  };

  return (
    <div className={styles.container}>
      {error && (
        <CustomAlert
          variant="destructive"
          title="Error uploading photo"
          description="Please try re-uploading."
          onClose={() => setError("")}
        />
      )}

      <div className={styles.profileCard.wrapper}>
        <div className="flex items-start">
          <div
            className={styles.profileCard.photoSection}
            onClick={() => fileInputRef.current?.click()}
          >
            {loading && (
              <div className={styles.profileCard.loadingOverlay}>
                <LoadingSpinner size={30} className="opacity-80" />
              </div>
            )}
            <UserProfilePicture photoUrl={user?.photo_url} size={80} />
            <Button
              title="Edit Photo"
              className={styles.profileCard.editButton}
            >
              <Image src="/edit.svg" alt="Edit" width={10} height={10} />
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={styles.profileCard.hiddenInput}
            />
          </div>

          <div className={styles.userInfo.container}>
            <h2 className={styles.userInfo.name}>
              {user.first_name} {user.last_name}
            </h2>
            <div className={styles.userInfo.detailsGrid}>
              {(user.city || user.state) && (
                <div className={styles.userInfo.detailItem}>
                  <MapPin className={styles.userInfo.icon} />
                  <span>
                    {user.city}
                    {user.city && user.state && ", "} {user.state}
                  </span>
                </div>
              )}
              <div className={styles.userInfo.detailItem}>
                <Mail className={styles.userInfo.icon} />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={styles.form.container}
        >
          <div className={styles.form.sidebar.wrapper}>
            <h2 className={styles.form.sidebar.heading}>General</h2>
            <div className={styles.form.sidebar.linksList}>
              <span
                className={styles.form.sidebar.link}
                onClick={handleEditPasswordClick}
              >
                Edit Password
              </span>
              <span className={styles.form.sidebar.link}>Notifications</span>
              <span className={styles.form.sidebar.link}>Billing</span>
              <hr className={styles.form.sidebar.divider} />
              <div className="w-full">
                <div className="p-0 flex justify-start items-start" style={{ padding: '0 !important' }}>
                    <XeroSSOButton />
                </div>
                </div>
              <DeleteAccountButton />
            </div>
          </div>

          <div className={styles.form.main.wrapper}>
            {formFields.map((field) => (
              <ProfileFormField
                key={field.name}
                control={form.control}
                name={field.name}
                label={field.label}
              />
            ))}

            <div className={styles.form.main.buttonContainer}>
              <Button type="submit" className={styles.form.main.submitButton}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

interface ProfileFormFieldProps {
  control: Control<z.infer<typeof formSchema>>;
  name: "first_name" | "last_name" | "city" | "state";
  label: string;
}

export function ProfileFormField({
  control,
  name,
  label,
}: ProfileFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value || "")}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

const styles = {
  container: "sm:px-20 py-6 w-4/5 mx-auto flex-1 space-y-4",
  message: "mt-4 text-center text-green-500",
  profileCard: {
    wrapper: "bg-white rounded-lg shadow-sm p-6",
    photoSection: "relative mr-6 cursor-pointer",
    loadingOverlay:
      "absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10 rounded-full",
    editButton:
      "w-6 h-6 absolute bottom-0 right-0 bg-white rounded-full shadow-md border border-gray-300 flex items-center justify-center z-20",
    hiddenInput: { display: "none" },
  },
  userInfo: {
    container: "flex-1",
    name: "text-2xl font-bold mb-4",
    detailsGrid: "grid grid-cols-1 gap-3 md:grid-cols-3",
    detailItem: "flex items-center gap-2 text-gray-600",
    icon: "h-4 w-4 text-gray-400",
  },
  form: {
    container: "py-4 flex space-x-8",
    sidebar: {
      wrapper: "w-1/4",
      heading: "text-xl font-semibold mb-4",
      linksList: "flex flex-col space-y-4",
      link: "text-gray-800 font-semibold cursor-pointer",
      divider: "border-t border-gray-300 my-4",
    },
    main: {
      wrapper: "w-2/3 flex flex-col space-y-4",
      buttonContainer: "flex justify-between items-center mt-4",
      submitButton: "w-[150px]",
    },
  },
};
