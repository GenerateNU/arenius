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
}

export default function ContactSelector({
  contact,
  setContact,
  variant = "outline",
}: ContactSelectorProps) {
  const { data: contactResponse } = useContacts();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant}>
          {contact ? contact.name : "All Contacts"}
          <ChevronDown className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
        {contactResponse?.contacts && contactResponse?.contacts.length > 0 ? (
          contactResponse.contacts.map((c) => (
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
