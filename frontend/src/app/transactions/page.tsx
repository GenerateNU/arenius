import ItemForm from "@/components/transactions/ItemForm";
import LineItemTable from "@/components/transactions/LineItemTable";
import { LineItemsProvider } from "@/context/LineItemsContext";

export default function Transactions() {
  return (
    <LineItemsProvider>
      <div className={styles.container}>
        <div>
          <p className={styles.formTitle}>Add a new line item</p>
          <ItemForm />
        </div>
        <hr className={styles.spacer} />
        <LineItemTable />
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
