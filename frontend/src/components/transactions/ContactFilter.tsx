"use client";

import { useLineItems } from "@/context/LineItemsContext";
import { cn } from "@/lib/utils";
import { Contact } from "@/types";
import { useEffect, useState } from "react";
import ContactsSelector from "./ContactsSelector";

export default function ContactFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [contact, setContact] = useState<Contact | undefined>(undefined);
  const { filters, setFilters } = useLineItems();

  useEffect(() => {
    if (contact) {
      setFilters({ ...filters, contactID: contact.id });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  return (
    <div className={cn("grid gap-2", className)}>
      <ContactsSelector
        contact={contact}
        setContact={setContact}
        variant="ghost"
      />
    </div>
  );
}