"use client";

import { cn } from "@/lib/utils";
import ContactsSelector from "./ContactsSelector";
import { useEffect, useState } from "react";
import { Contact } from "@/types";
import { ContactsProvider } from "@/context/ContactsContext";
import { fetchContacts } from "@/services/contacts";
import { useTransactionsContext } from "@/context/TransactionsContext";

export default function ContactFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [contact, setContact] = useState<Contact | undefined>(undefined);
  const { filters, setFilters } = useTransactionsContext();

  useEffect(() => {
    if (contact) {
      setFilters({ ...filters, contact_id: contact.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

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
