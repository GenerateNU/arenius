"use client";

import ItemForm from "@/components/transactions/ItemForm";
import { useEffect, useState } from "react";
import { fetchLineItems } from "@/services/lineItems";
import { Item } from "@/types";
import { DataTable } from "../payments/data-table";
import { columns } from "../payments/columns";

export default function Transactions() {
  const [data, setData] = useState<Item[]>([]);

  // const [columns, setColumns] = useState<Payment[]>([]);

  const getItems = async () => {
    const items = await fetchLineItems();
    console.log(items);
    setData(items);
    // setColumns(items);
  };

  useEffect(() => {
    getItems();
  }, []);

  const addItem = async () => {
    getItems();
  };

  return (
    <div className="p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div>
        <p className="font-bold text-xl">Add a new line item</p>
        <ItemForm onSubmit={addItem} />
      </div>
      <hr className="mb-4 border border-black-100" />

      {/* <div className="container mx-auto py-10"> */}
      <DataTable columns={columns} data={data} />
      {/* </div> */}

      {/* <ItemTable items={data} /> */}
    </div>
  );
}
