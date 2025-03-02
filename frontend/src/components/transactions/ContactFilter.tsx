"use client";

import { ContactsProvider } from "@/context/ContactsContext";
import { useLineItems } from "@/context/LineItemsContext";
import { cn } from "@/lib/utils";
import { fetchContacts } from "@/services/contacts";
import { Contact } from "@/types";
import { useEffect, useState } from "react";
import ContactsSelector from "./ContactsSelector";

export default function ContactFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [contact, setContact] = useState<Contact>();
  const { filters, setFilters } = useLineItems();

  useEffect(() => {
    if (contact) {
      setFilters({ ...filters, contactID: contact.id });
    }
  }, [contact, filters]);

  return (
    <div className={cn("grid gap-2", className)}>
      <ContactsProvider fetchFunction={fetchContacts}>
        <ContactsSelector
          contact={contact}
          setContact={setContact}
          variant="ghost"
        />
      </ContactsProvider>
    </div>
  );
}
