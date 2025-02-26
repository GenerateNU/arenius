"use client";

import ContactTable from "@/components/contacts/ContactTable";
import { ContactsProvider } from "@/context/ContactsContext";
import { fetchContacts } from "@/services/contacts";

export default function Contacts() {
  return (
    <ContactsProvider fetchFunction={fetchContacts}>
      <div className={styles.container}>
        <div>
          <p className={styles.formTitle}>Contacts</p>
          <ContactTable />
        </div>
      </div>
    </ContactsProvider>
  );
}

const styles = {
  container:
    "p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1",
  formTitle: "font-bold text-xl",
  spacer: "mb-4 border border-black-100",
};
