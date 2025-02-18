import ItemForm from "@/components/transactions/ItemForm";
<<<<<<< HEAD:frontend/src/app/all_navs/transactions/page.tsx
import { useEffect, useState } from "react";
import { fetchLineItems } from "@/services/lineItems";
import { LineItem } from "@/types";
import { LineItemTable } from "@/components/transactions/LineItemTable";
import { columns} from "@/components/transactions/columns";
=======
import LineItemTable from "@/components/transactions/LineItemTable";
import LineItemTableFilters from "@/components/transactions/LineItemTableFilters";
import { LineItemsProvider } from "@/context/LineItemsContext";
>>>>>>> 3688755bc32920b41d5872b5b8556947dd3436c8:frontend/src/app/transactions/page.tsx

export default function Transactions() {
  return (
    <LineItemsProvider>
      <div className={styles.container}>
        <div>
          <p className={styles.formTitle}>Add a new line item</p>
          <ItemForm />
        </div>
        <hr className={styles.spacer} />
        <div>
          <p className={styles.formTitle}>Transactions</p>
          <LineItemTableFilters />
          <LineItemTable />
        </div>
      </div>
    </LineItemsProvider>
  );
}

const styles = {
  container:
    "p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1",
  formTitle: "font-bold text-xl",
  spacer: "mb-4 border border-black-100",
};
