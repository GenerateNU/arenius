"use client";


import { cn } from "@/lib/utils";
import ContactsSelector from "./ContactsSelector";
import { useEffect, useState } from "react";
import { useLineItems } from "@/context/LineItemsContext";
import { Contact } from "@/types";

export default function ContactFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [contact, setContact] = useState<Contact | undefined>(undefined);
  const { filters, setFilters } = useLineItems();

  useEffect(() => {
    if (contact) {
      setFilters({ ...filters, contact_id: contact.id });
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

const styles = {
  chevronDown: "h-4 w-4 opacity-50",
};
