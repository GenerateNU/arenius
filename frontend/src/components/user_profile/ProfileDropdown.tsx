"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserProfilePicture } from "@/components/user_profile/ProfilePicture";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SignOutButton from "../auth/signOut";
import { useEffect, useState } from "react";
import LoadingSpinner from "../ui/loading-spinner";

export function ProfileDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  const { user } = useAuth();

  // Monitor path changes to detect when navigation completes
  useEffect(() => {
    if (targetPath && pathname === targetPath) {
      setLoading(false);
      setTargetPath(null);
    }
  }, [pathname, targetPath]);

  const handleClick = () => {
    const profilePath = "/user-profile";
    if (pathname !== profilePath) {
      setLoading(true);
      setTargetPath(profilePath);
      router.push(profilePath);
      
      // Fallback timeout in case navigation takes too long
      const fallbackTimer = setTimeout(() => {
        setLoading(false);
      }, 5000);
      
      return () => clearTimeout(fallbackTimer);
    }
  };

  return (
    <div className="z-1 relative">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50">
          <LoadingSpinner size={60} className="opacity-80" />
        </div>
      )}
      
      <DropdownMenu>
        {user && (
          <>
            <DropdownMenuTrigger>
              <UserProfilePicture photoUrl={user?.photo_url} size={36}/>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border shadow-lg rounded-lg">
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
                    <UserProfilePicture photoUrl={user?.photo_url} size={120}/>
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
