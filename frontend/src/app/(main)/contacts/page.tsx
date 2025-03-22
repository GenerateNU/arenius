"use client";

import ContactTable from "@/components/contacts/ContactTable";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactsProvider, useContacts } from "@/context/ContactsContext";
import { fetchContacts } from "@/services/contacts";
import Link from "next/link";
import { useEffect } from "react";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";

export default function Contacts() {
  return (
    <ContactsProvider fetchFunction={fetchContacts}>
      <ContactsContent />
    </ContactsProvider>
  );
}

function ContactsContent() {
  const { filters, setFilters } = useContacts();
  const { searchTerm, setSearchTerm, debouncedTerm } = useDebouncedSearch(
    filters.search_term
  );

  useEffect(() => {
    setFilters({ ...filters, search_term: debouncedTerm });
  }, [debouncedTerm, setFilters]);

  return (
    <div className={styles.container}>
      <div className="flex items-center justify-between mb-4">
        <p className={styles.formTitle}>Contacts</p>
        <div className="flex space-x-8">
          <div className="relative w-80">
            <Search className={styles.searchIcon} />
            <Input
              placeholder="Search your contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.input}
            />
          </div>
          <Link href="/contacts/new">
            <button className="w-40 h-10 bg-moss text-white text-sm font-semibold rounded-md">
              New Contact
            </button>
          </Link>
        </div>
      </div>
      <ContactTable />
    </div>
  );
}

const styles = {
  container:
    "p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1",
  formTitle: "font-bold text-xl mb-4",
  searchIcon:
    "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500",
  spacer: "mb-4 border border-black-100",
  input:
    "pl-10 py-2 rounded-full bg-gray-100 border-none focus:ring-0 w-full shadow-sm",
};
