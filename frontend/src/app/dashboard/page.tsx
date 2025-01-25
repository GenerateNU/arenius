import ItemTable from "@/components/dashboard/ItemTable";
import ItemForm from "@/components/dashboard/ItemForm";

export default function Dashboard() {
  return (
    <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ItemTable />
      <ItemForm />
    </div>
  );
}
