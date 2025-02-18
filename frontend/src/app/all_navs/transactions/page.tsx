"use client";

import ItemForm from "@/components/transactions/ItemForm";
import { useEffect, useState } from "react";
import { fetchLineItems } from "@/services/lineItems";
import { LineItem } from "@/types";
import { LineItemTable } from "@/components/transactions/LineItemTable";
import { columns} from "@/components/transactions/columns";

export default function Transactions() {
  const [data, setData] = useState<LineItem[]>([]);

  const getItems = async () => {
    const items = await fetchLineItems();
    setData(items);
  };

  useEffect(() => {
    getItems();
  }, []);

  return (
    <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex-1">
      <div>
        <p className="font-bold text-xl">Add a new line item</p>
        <ItemForm handleSubmit={getItems} />
      </div>
      <hr className="mb-4 border border-black-100" />

      <LineItemTable
        columns={columns}
        data={data}
        getRowId={(row) => row.id}
        onReconcile={getItems}
      />
    </div>
  );
}
