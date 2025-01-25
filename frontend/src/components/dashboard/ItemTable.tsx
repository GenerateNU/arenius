import React from "react";
import ItemRow from "./ItemRow";
import { fetchDashboardItems } from "@/services/dashboard";

export default async function ItemTable() {
  const data = await fetchDashboardItems();

  return (
    <div>
      <p className={styles.header}>Recent transactions</p>
      <div className={styles.container}>
        <p>Description</p>
        <p>Quantity</p>
        <p>Price</p>
      </div>
      {data.map((item) => (
        <ItemRow key={item.description} {...item} />
      ))}
    </div>
  );
}

const styles = {
  header: "text-xl font-bold mb-2",
  container: "grid grid-cols-3 gap-2 bg-gray-100 font-bold",
};
