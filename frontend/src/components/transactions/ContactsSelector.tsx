"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContacts } from "@/context/ContactContext";
import { cn } from "@/lib/utils";
import { LineItemFilters, SimpleContact } from "@/types";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface ContactSelectorProps {
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
  filters: LineItemFilters;
  setFilters: (filters: LineItemFilters) => void;
}

export default function ContactSelector({
  variant = "outline",
  className,
  filters,
  setFilters
}: ContactSelectorProps) {
  const { data } = useContacts();
  const [localContact, setLocalContact] = useState<SimpleContact | undefined>(undefined)

  useEffect(() => {
    if (!filters.contact_id) {
      setLocalContact(undefined);
    }
  }, [filters]);

  const handleApply = () => {
    if (localContact){
      setFilters({
        ...filters,
        contact_id: localContact.id
      });
    }
  }

  const handleClear = () => {
    setFilters({
      ...filters,
      contact_id: undefined
    });
    setLocalContact(undefined);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={cn(className)}>
          {localContact && localContact.name ? localContact.name : "All Contacts"}
          <ChevronDown className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-96 overflow-y-auto">
        {data?.contacts && data?.contacts.length > 0 ? (
          data.contacts.map((c) => (
            <DropdownMenuItem
              key={c.id}
              onSelect={(e) => {
                e.preventDefault();
                setLocalContact(c);
              }}>
              {c.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No contacts available</DropdownMenuItem>
        )}
        <div className="flex justify-between">
          <Button onClick={handleClear} variant="ghost" className="text-xs underline text-gray-500">Clear Filter</Button>
          <Button onClick={handleApply} className="text-xs">Apply</Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
