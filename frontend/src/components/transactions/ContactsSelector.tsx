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
import { ChevronDown, Search } from "lucide-react";
import { Input } from "../ui/input";

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

      <DropdownMenuContent className="max-h-[300px] overflow-y-auto p-0">
        <div className="px-2 py-1 bg-white z-10 flex space-x-2 items-center border-b">
          <Search />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDownCapture={(e) => e.stopPropagation()}
            className="w-full border-none shadow-none px-2 py-1 rounded text-sm"
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
