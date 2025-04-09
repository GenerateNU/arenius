"use client";

import ContactsFilterSelector from "./ContactsFilterSelector";
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

  useEffect(() => {
    if (!filters.contact_id) {
      setContact(undefined);
    }
  }, [filters]);

  return (
    <ContactsFilterSelector
      filters={filters}
      setFilters={setFilters}
      variant="ghost"
      className={className}
    />
  );
}
