import React from "react";
import ItemRow from "./ItemRow";
import { Item } from "@/types";

type ItemTableProps = {
  items: Item[];
};

export default function ItemTable({ items }: ItemTableProps) {
  return (
    <div>
      <p className={styles.header}>Recent transactions</p>
      <div className={styles.container}>
        <p className="w-3/12">Description</p> {/* 40% width */}
        <p className="w-2/12">Price</p> {/* 20% width */}
        <p className="w-5/12">Emission factor</p> {/* 20% width */}
        <p className="w-2/12">CO2</p> {/* 20% width */}
      </div>
      {items.map((item) => (
        <ItemRow key={item.id} {...item} />
      ))}
    </div>
  );
}

const styles = {
  header: "text-xl font-bold mb-2",
  container: "flex gap-2 bg-black-100 font-bold text-wrap",
};
