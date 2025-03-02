"use client";
import { useLineItems } from "@/context/LineItemsContext";
import { Button } from "../ui/button";
import ContactFilter from "./ContactFilter";
import { DatePickerWithRange } from "./DatePicker";
import EmissionsFactorFilter from "./EmissionsFactorFilter";
import PriceFilter from "./PriceFilter";
import { fetchContacts } from "@/services/contacts";
import { ContactsProvider } from "@/context/ContactsContext";

export default function LineItemTableFilters() {
  const { setFilters } = useLineItems();

  return (
    <div className="flex flex-col my-2">
      <div className={styles.container}>
        <DatePickerWithRange className={styles.filter} />
        <EmissionsFactorFilter className={styles.filter} />
        <ContactsProvider fetchFunction={fetchContacts}>
          <ContactFilter className={styles.filter} />
        </ContactsProvider>
        <PriceFilter className={styles.filter} />
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => setFilters({})}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}

const styles = {
  container: "flex gap-4 mt-4 p-4 bg-gray-100 rounded-lg w-full",
  filter: "flex-1 min-w-0 bg-gray-100",
};
