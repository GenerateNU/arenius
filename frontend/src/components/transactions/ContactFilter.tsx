"use client";

import { cn } from "@/lib/utils";
import ContactsSelector from "./ContactsSelector";
import { useEffect, useState } from "react";
import { Contact } from "@/types";
import { useTransactionsContext } from "@/context/TransactionContext";
import { ContactProvider } from "@/context/ContactContext";

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
      <ContactProvider>
        <ContactsSelector
          contact={contact}
          setContact={setContact}
          variant="ghost"
        />
      </ContactProvider>
    </div>
  );
}
