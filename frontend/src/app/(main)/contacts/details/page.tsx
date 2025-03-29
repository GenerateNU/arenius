"use client";

import React, { Suspense } from "react";
import ContactDetailsContent from "@/components/contacts/ContactDetailsContent";

export default function ContactDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactDetailsContent />
    </Suspense>
  );
}
