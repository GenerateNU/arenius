"use client";

import ItemTable from "@/components/dashboard/ItemTable";
import ItemForm from "@/components/dashboard/ItemForm";
import { useEffect, useState } from "react";
import { fetchDashboardItems } from "@/services/dashboard";
import { Item } from "@/types";

export default function Dashboard() {
  const [data, setData] = useState<Item[]>([]);

  const getItems = async () => {
    const items = await fetchDashboardItems();
    setData(items);
  };

  useEffect(() => {
    getItems();
  }, []);

  const addItem = async () => {
    getItems();
  };

  return (
    <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ItemTable items={data} />
      <ItemForm onSubmit={addItem} />
    </div>
  );
}
