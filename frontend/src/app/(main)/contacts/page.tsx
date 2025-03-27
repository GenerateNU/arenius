"use client";

import ContactTable from "@/components/contacts/ContactTable";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactProvider, useContacts } from "@/context/ContactContext";
import { fetchContacts } from "@/services/contacts";
import Link from "next/link";
import { useEffect } from "react";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import ExportContactsButton from "@/components/contacts/ExportContacts";
import Image from "next/image";

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

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      search_term: debouncedTerm,
    }));
  }, [debouncedTerm, setFilters]);

  return (
    <div className={styles.container}>
      <div className="flex items-center mb-4">
        <p className={styles.formTitle}>Contacts</p>
        <div className="relative w-80 justify-start mb-4">
          <Search className={styles.searchIcon} />
          <Input
            placeholder="Search your contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className="flex space-x-4 mb-4 ml-auto">
          <Link href="/contacts/new" className="mr-4">
            <button className="w-56 h-10 bg-moss text-white text-sm font-semibold rounded-md flex items-center space-x-2 justify-center">
              <Image
                src="/plus_1.svg"
                alt=""
                width={13}
                height={13}
                className="mr-1"
              />
              <span>Add Contact</span>
            </button>
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
    "p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1",
  formTitle: "font-bold text-3xl mb-4 mr-4",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  spacer: "mb-4 border border-black-100",
  input:
    "pl-10 py-2 rounded-full bg-gray-100 border-none focus:ring-0 w-full shadow-sm",
};
