"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfilePicture } from "@/components/user_profile/ProfilePicture";
import SignOutButton from "../auth/signOut";
import { Button } from "../ui/button";

export function ProfileDropdown() {
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-center">
          {loading ? (
            <div className="w-9 h-9" />
          ) : (
            <UserProfilePicture photoUrl={user?.photo_url} size={36} />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-white border shadow-lg rounded-lg">
          {user && (
            <div className="bg-gray-100 p-6 rounded-lg shadow-md max-w-xs mx-auto">
              <div className="text-center mt-4">
                <div className="mt-4">
                  <p className="font-medium break-words whitespace-normal">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-gray-600 break-words whitespace-normal">
                    {user.email}
                  </p>
                </div>
                <div className="mt-4 flex justify-center">
                  <UserProfilePicture photoUrl={user?.photo_url} size={120} />
                </div>
                <div className="mt-4 flex flex-col space-y-4">
                  <Link href="/user-profile">
                    <Button className="w-full h-8 border border-gray-700 text-gray-800 text-sm font-semibold rounded-full flex items-center justify-center bg-white mx-auto">
                      User Profile
                    </Button>
                  </Link>
                  <SignOutButton />
                </div>
              </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
