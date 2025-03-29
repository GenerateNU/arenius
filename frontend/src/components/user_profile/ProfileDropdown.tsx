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

    const handleClick = () => {
        router.push(`/user_profile`);
    };

    const { userId } = useAuth();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (userId) {
            const fetchData = async () => {
                const fetchedUser = await fetchUser(userId);
                setUser(fetchedUser)
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
                    <Image
                        src="/user_profile.svg"
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
                                <Image
                                    src="/user_profile.svg"
                                    alt="Profile"
                                    width={180}
                                    height={180}
                                    className="rounded-full border border-gray-300 shadow-md"
                                />
                            </div>
                            <div className="mt-4">
                                <Link href="/user-profile">
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

const styles = {
  chevronDown: "h-4 w-4 opacity-50",
};
