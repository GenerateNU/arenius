"use client";

import Image from "next/image";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { fetchUser } from "@/services/user";
import { User } from "@/types";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export function ProfileDropdown() {

    const router = useRouter();
    const [profilePhoto, setPhoto] = useState(""); // Store profile photo URL

    const handleClick = () => {
        router.push(`/profile`);
    };

    const { userId } = useAuth();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Create an async function inside useEffect
        const fetchData = async () => {
            if (userId) {
                const fetchedUser = await fetchUser(userId);
                setUser(fetchedUser);
                console.log("----", fetchedUser);
                setPhoto(fetchedUser.photo_url); // Assuming response.photo_url contains the URL
            }
        };

        fetchData(); // Call the async function inside useEffect
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>;
    }

    console.log("*****", profilePhoto)
    return (
        <div className="z-1 relative">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {/* Use the profile photo or fallback to default */}
                    <Image
                        src={profilePhoto || "/user_profile.svg"} // Fallback image if no photo is available
                        alt="User Profile"
                        width={30}
                        height={30}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white border shadow-lg rounded-lg">
                    <div className="bg-gray-100 p-6 rounded-lg shadow-md max-w-xs mx-auto">
                        <div className="text-center mt-4">
                            <div className="mt-4">
                                <p className="text-lg font-medium">{user.first_name} {user.last_name}</p>
                                <p className="text-sm text-gray-600">dessy@dessy.com</p>
                            </div>
                            <div className="mt-4">
                                {/* Profile photo in the dropdown */}
                                <Image
                                    src={profilePhoto || "/user_profile.svg"} // Fallback image if no photo is available
                                    alt="Profile"
                                    width={180}
                                    height={180}
                                    className="rounded-full border border-gray-300 shadow-md"
                                />
                            </div>
                            <div className="mt-4">
                                <Link href="/profile">
                                    <button onClick={handleClick} className="w-full h-10 bg-moss text-white text-sm font-semibold rounded-md flex items-center space-x-2 justify-center">
                                        Member Profile
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
