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
        <p>Co2</p>
      </div>
      {data.map((item) => (
        <ItemRow key={item.id} {...item} />
      ))}
    </div>
  );
}


const styles = {
  header: "text-xl font-bold mb-2",
  container: "grid grid-cols-4 gap-2 bg-black-100 font-bold",
};
