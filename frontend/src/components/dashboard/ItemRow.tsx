import React from "react";
import { Item } from "@/app/types";

type ItemTableRowProps = Item;

export default function ItemTableRow({
  name,
  description,
  price,
}: ItemTableRowProps) {
  return (
    <div className={styles.container}>
      <p>{name}</p>
      <p>{description}</p>
      <p>{price}</p>
    </div>
  );
}

const styles = {
  container: "grid grid-cols-3 gap-2",
};
