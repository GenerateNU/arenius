"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SignOutButton from "../auth/signOut";

export function ProfileDropdown() {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/profile`);
  };

  const { user } = useAuth();

  return (
    <div className="z-1 relative">
      <DropdownMenu>
        {user && (
          <>
            <DropdownMenuTrigger>
              <Image
                src={user?.photo_url || ""}
                alt="User Profile"
                width={36}
                height={36}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border shadow-lg rounded-lg">
              <div className="bg-gray-100 p-6 rounded-lg shadow-md max-w-xs mx-auto">
                <div className="text-center mt-4">
                  <div className="mt-4">
                    <p className="text-lg font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="mt-4">
                    {/* Profile photo in the dropdown */}
                    <Image
                      src={user.photo_url || "/user_profile.svg"} // Fallback image if no photo is available
                      alt="Profile"
                      width={180}
                      height={180}
                      className="rounded-full border border-gray-300 shadow-md"
                    />
                  </div>
                  <div className="mt-4 flex flex-col space-y-4">
                    <Link href="/user-profile">
                      <button
                        onClick={handleClick}
                        className="w-full h-8 border border-gray-700 text-gray-800 text-sm font-semibold rounded-full flex items-center justify-center bg-white mx-auto"
                      >
                        Member Profile
                      </button>
                    </Link>
                    <SignOutButton />
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </>
        )}
      </DropdownMenu>
    </div>
  );
}
