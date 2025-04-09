"use client";

import { useAuth } from "@/context/AuthContext";
import apiClient from "@/services/apiClient";
import { updateUserProfile } from "@/services/user";
import { UpdateUserProfileRequest, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from '@supabase/supabase-js';
import { Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add error handling to prevent build failures
if (!supabaseUrl) {
  // During static build, provide a fallback for prerendering
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    console.warn('Supabase URL not found during build. Using placeholder for static generation.');
  } else {
    console.error('Supabase URL is required. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.');
  }
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder-for-static-build.supabase.co',
  supabaseAnonKey || 'placeholder-key-for-static-build'
);

const formSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  city: z.string(),
  state: z.string(),
});

export default function UserProfileContent() {

  const [message, setMessage] = useState<string | null>(null);
  const { user, setUser, userId } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      city: user?.city ?? "",
      state: user?.state ?? "",
    },
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleEditPasswordClick = async () => {
    try {
      await apiClient.post('/auth/forgot-password', { email: user?.email });
      setMessage("Password reset email sent! Please check your inbox.");
    } catch (error) {
      setMessage("Failed to send reset email. Please try again.");
      console.error(error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {

    if (!userId) {
      console.error("UserID is null.");
      return;
    }

    const getFallbackValue = (
      value: string | undefined | null,
      fallback: string | undefined | null
    ): string | null => {
      return value && value.trim() !== "" ? value : fallback ?? null;
    };

    const req: UpdateUserProfileRequest = {
      first_name: getFallbackValue(values.first_name, user?.first_name),
      last_name: getFallbackValue(values.last_name, user?.last_name),
      city: getFallbackValue(values.city, user?.city),
      state: getFallbackValue(values.state, user?.state),
    };

    try {
      const response = await updateUserProfile(userId, req);
      if (response) {
        setUser(response);
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];
  
    if (!file) {
      return;
    }
  
    try {
      const { data, error } = await supabase.storage
        .from('profile-photos') // The bucket name in Supabase
        .upload(`profile-photo-${Date.now()}`, file); // Use `file` instead of `imageFile`
  
      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }
    
      const publicUrl = supabase
        .storage
        .from('profile-photos')
        .getPublicUrl(data.path).data.publicUrl;
  
      await apiClient.patch(`/user/${userId}`, {
        photo_url: publicUrl,
      });
  
      const updatedUser: User = {
        ...user,
        photo_url: publicUrl,
      };
      setUser(updatedUser);
      console.log("we are here and why are we redirecting")
  
    } catch (error: unknown) {
      console.error('Error during upload:', error);
    }

  };

  return (
    <div className="sm:p-20 w-4/5 mx-auto flex-1">
      {message && <div className={styles.message}>{message}</div>}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start">
          <div className="relative mr-6">
            <UserProfilePicture photoUrl={user?.photo_url} size={80}/>
            <button
              type="button"
              title="Edit Photo"
              className="w-6 h-6 absolute bottom-0 right-0 bg-white rounded-full shadow-md border border-gray-300 flex items-center justify-center"
              onClick={handleUploadClick}
            >
              <Image
                src="/edit.svg"
                alt="Edit"
                width={10}
                height={10}
              />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">
              {user.first_name} {user.last_name}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>
                  {user.city}, {user.state}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="py-4 flex space-x-8"
        >
          <div className="w-1/4">
            <h2 className="text-xl font-semibold mb-4">General</h2>
            <div className="flex flex-col space-y-4">
              <span
                className="text-gray-800 font-semibold cursor-pointer"
                onClick={handleEditPasswordClick}
              >
                Edit Password
              </span>
              <span className="text-gray-800 font-semibold cursor-pointer">
                Notifications
              </span>
              <span className="text-gray-800 font-semibold cursor-pointer">
                Billing
              </span>
              <hr className="border-t border-gray-300 my-4" />
              <DeleteAccountButton />
            </div>
          </div>

          <div className="w-2/3 flex flex-col space-y-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={user?.first_name ?? "First Name"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={user?.last_name ?? "Last Name"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder={user?.city ?? "City"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder={user?.state ?? "State"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center mt-4">
              <Button type="submit" className="w-[150px]">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

const styles = {
  message: "mt-4 text-center text-green-500",
};
