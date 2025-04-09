"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContacts } from "@/context/ContactContext";
import { cn } from "@/lib/utils";
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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = data?.contacts?.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={cn(className)}>
          {contact && contact.name ? contact.name : "All Contacts"}
          <ChevronDown className="ml-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="max-h-96 overflow-y-auto p-0">
        <div className="p-2 sticky top-0 bg-white z-10 border-b">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDownCapture={(e) => e.stopPropagation()} 
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>

        {filteredContacts && filteredContacts.length > 0 ? (
          filteredContacts.map((c) => (
            <DropdownMenuItem key={c.id} onClick={() => setContact(c)}>
              {c.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No contacts found</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
