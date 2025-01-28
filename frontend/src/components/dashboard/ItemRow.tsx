import React from "react";
import { Item } from "@/types";

type ItemTableRowProps = Item;

export default function ItemTableRow({
  description,
  quantity,
  unit_amount,
}: ItemTableRowProps) {
  return (
    <div className={styles.container}>
      <p>{description}</p>
      <p>{quantity}</p>
      <p>{unit_amount}</p>
    </div>
  );
}

const styles = {
  container: "grid grid-cols-4 gap-2",
};
