"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContacts } from "@/context/ContactsContext";
import { Contact } from "@/types";
import { ChevronDown } from "lucide-react";

interface ContactSelectorProps {
  contact?: Contact;
  setContact: (contact: Contact) => void;
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
  
    const { data: contacts } = useContacts();
  
    return (
      <div>        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={variant}>
              {contact ? contact.name : "Select Contact"}
              <ChevronDown className="ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            {contacts && contacts.length > 0 ? (
              contacts.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onClick={() => setContact(c)} 
                >
                  {c.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No contacts available</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }