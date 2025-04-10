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
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

interface ContactFilterSelectorProps {
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

export default function ContactFilterSelector({
  variant = "outline",
  className,
  filters,
  setFilters,
}: ContactFilterSelectorProps) {
  const { data } = useContacts();
  const [localContact, setLocalContact] = useState<SimpleContact | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = data?.contacts?.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!filters.contact_id) {
      setLocalContact(undefined);
    }
  }, [filters]);

  const handleApply = () => {
    if (localContact) {
      setFilters({
        ...filters,
        contact_id: localContact.id,
      });
    }
  };

  const handleClear = () => {
    setFilters({
      ...filters,
      contact_id: undefined,
    });
    setLocalContact(undefined);
    setSearchTerm("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className={cn(className)}>
          {localContact && localContact.name
            ? localContact.name
            : "All Contacts"}
          <ChevronDown className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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

        <div className="max-h-60 overflow-y-auto">
          {filteredContacts && filteredContacts.length > 0 ? (
            filteredContacts.map((c) => (
              <DropdownMenuItem
                key={c.id}
                onSelect={(e) => {
                  e.preventDefault();
                  setLocalContact(c);
                }}
              >
                {c.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>No contacts available</DropdownMenuItem>
          )}
        </div>
        <div className="flex justify-between">
          <Button
            onClick={handleClear}
            variant="ghost"
            className="text-xs underline text-gray-500"
          >
            Clear Filter
          </Button>
          <Button onClick={handleApply} className="text-xs">
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
