"use client";

import UserProfileContent from "@/components/user_profile/UserProfileContent";
import { Suspense } from "react";

export default function UserProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfileContent />
    </Suspense>
  );
}