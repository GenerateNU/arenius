"use client";

import ContactsSelector from "./ContactsSelector";
import { useEffect, useState } from "react";
import { SimpleContact } from "@/types";
import { useTransactionsContext } from "@/context/TransactionContext";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (!filters.contact_id) {
      setContact(undefined);
    }
  }, [filters]);

  return (
    <ContactsSelector
      contact={contact}
      setContact={setContact}
      variant="ghost"
      className={className}
    />
  );
}
