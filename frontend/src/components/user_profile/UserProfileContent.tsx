"use client";

import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/user";
import { UpdateUserProfileRequest } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

const formSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  city: z.string(),
  state: z.string(),
});

export default function UserProfileContent() {
  const { user, setUser, userId } = useAuth();

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
      photoUrl: "",
    };

    try {
      const response = await updateUserProfile(userId, req);
      if (response) {
        form.reset();
        setUser(response);
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  }

  return (
    <div className="sm:p-20 w-4/5 mx-auto flex-1">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start">
          <div className="mr-6">
            <Image
              src={user.photo_url || ""}
              alt="User Profile"
              width={60}
              height={60}
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
              <span className="text-gray-800 font-semibold cursor-pointer">
                Edit Password
              </span>
              <span className="text-gray-800 font-semibold cursor-pointer">
                Notifications
              </span>
              <span className="text-gray-800 font-semibold cursor-pointer">
                Billing
              </span>
              <hr className="border-t border-gray-300 my-4" />
              <span className="text-red-600 font-semibold cursor-pointer">
                Delete Account
              </span>
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
