import React from "react";
import { Item } from "@/types";

type ItemTableRowProps = Item;

export default function ItemTableRow({
  description,
  quantity,
  price,
  co2,
  co2Unit,
}: ItemTableRowProps) {
   return (
    <div className={styles.container}>
      <p>{description}</p>
      <p>{quantity}</p>
      <p>{price}</p>
      <p>{co2}{co2Unit}</p>
    </div>
  );
}

const styles = {
  container: "grid grid-cols-4 gap-2",
};
