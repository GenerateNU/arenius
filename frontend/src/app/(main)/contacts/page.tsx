"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search } from "lucide-react";

import { ContactProvider, useContacts } from "@/context/ContactContext";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import ExportContactsButton from "@/components/contacts/ExportContacts";
import ContactTable from "@/components/contacts/ContactTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Link from "next/link";

export default function Contacts() {
  return (
    <ContactProvider>
      <ContactsContent />
    </ContactProvider>
  );
}

function ContactsContent() {
  const { filters, setFilters } = useContacts();
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    filters.search_term
  );
  const [isNavigating, setIsNavigating] = useState(false);


  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search_term: debouncedTerm,
    }));
  }, [debouncedTerm, setFilters]);

  return (
    <div className={styles.container}>
      {isNavigating && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="rounded-full p-6">
            <LoadingSpinner size={60} className="text-white" />
          </div>
        </div>
      )}

      <div className="flex items-center mb-4">
        <p className={styles.pageTitle}>Contacts</p>
        <div className="relative w-80 justify-start mb-4 ml-6">
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Search your contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className="flex space-x-4 mb-4 ml-auto">
          <Link 
            href="/contacts/new" 
            className="mr-4"
            onClick={() => setIsNavigating(true)}
          >
            <Button 
              size="lg" 
              className="font-semibold space-x-2"
              disabled={isNavigating}
            >
              <Image
                src="/plus_1.svg"
                alt=""
                width={13}
                height={13}
                className="mr-1"
              />
              <span>{isNavigating ? "Loading..." : "Add Contact"}</span>
            </Button>
          </Link>
          <ExportContactsButton />
        </div>
      </div>
      <ContactTable />
    </div>
  );
}

const styles = {
  container:
    "pt-8 pb-20 gap-16 font-[family-name:var(--font-montserrat)] flex-1",
  pageTitle: "font-header font-bold text-4xl mb-4 mr-4",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  input:
    "pl-10 py-2 rounded-md bg-gray-100 border-none focus:ring-0 w-full shadow-md bg-white",
};
