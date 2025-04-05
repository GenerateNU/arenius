"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContacts } from "@/context/ContactContext";
import { SimpleContact } from "@/types";
import { ChevronDown } from "lucide-react";

interface ContactSelectorProps {
  contact?: SimpleContact;
  setContact: (contact: SimpleContact) => void;
  variant?:
    | "link"
    | "secondary"
    | "destructive"
    | "outline"
    | "default"
    | "ghost"
    | null
    | undefined;
  className?: string;
}

export default function ContactSelector({
  contact,
  setContact,
  variant = "outline",
  className,
}: ContactSelectorProps) {
  const { data } = useContacts();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={className}>
          {contact && contact.name ? contact.name : "All Contacts"}
          <ChevronDown className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=" max-h-96 overflow-y-auto">
        {data?.contacts && data?.contacts.length > 0 ? (
          data.contacts.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setContact(c)}>
              {c.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No contacts available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
