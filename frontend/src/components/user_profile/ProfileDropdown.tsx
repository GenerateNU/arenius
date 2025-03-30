"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { fetchUser } from "@/services/user";
import { User } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

export function ProfileDropdown() {

    const router = useRouter();
    const [profilePhoto, setPhoto] = useState("user_profile.svg"); // Store profile photo URL

    const handleClick = () => {
        router.push(`/profile`);
    };

    const { userId } = useAuth();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (userId) {
            const fetchData = async () => {
                if (userId) {
                    const fetchedUser = await fetchUser(userId);
                    setUser(fetchedUser);
                    console.log("----", fetchedUser);
                    if (fetchedUser && fetchedUser.photo_url) {
                        setPhoto(fetchedUser.photo_url); // Safely access photo_url
                    }
                }
            };
            fetchData();
            console.log(user)
        }
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>; 
    }

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
                            <div className="mt-4 flex flex-col space-y-4">
                                <Link href="/user-profile">
                                    <button 
                                        onClick={handleClick} 
                                        className="w-full h-8 border border-gray-700 text-gray-800 text-sm font-semibold rounded-full flex items-center justify-center bg-white mx-auto"
                                    >
                                        Member Profile
                                    </button>
                                </Link>
                                <Link href="/user-profile">
                                    <button 
                                        onClick={handleClick} 
                                        className="w-full h-10 bg-moss text-white text-sm font-semibold rounded-md flex items-center justify-center"
                                    >
                                        Sign out
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

