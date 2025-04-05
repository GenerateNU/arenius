"use client";

import ContactsSelector from "./ContactsSelector";
import { useEffect, useState } from "react";
import { SimpleContact } from "@/types";
import { useTransactionsContext } from "@/context/TransactionContext";

export default function ContactFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [contact, setContact] = useState<SimpleContact | undefined>(undefined);
  const { filters, setFilters } = useTransactionsContext();

  useEffect(() => {
    if (contact) {
      setFilters({ ...filters, contact_id: contact.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contact]);

  return (
    <ContactsSelector
      contact={contact}
      setContact={setContact}
      variant="ghost"
      className={className}
    />
  );
}
