import React from "react";
import { Item } from "@/types";

type ItemTableRowProps = Item;

export default function ItemTableRow({
  description,
  quantity,
  price
}: ItemTableRowProps) {
   return (
    <div className={styles.container}>
      <p>{description}</p>
      <p>{quantity}</p>
      <p>{price}</p>
    </div>
  );
}

const styles = {
  container: "grid grid-cols-4 gap-2",
};
