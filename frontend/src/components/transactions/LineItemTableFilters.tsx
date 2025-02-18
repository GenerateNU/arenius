import React from "react";
import { DatePickerWithRange } from "./DatePicker";

export default function LineItemTableFilters() {
  return (
    <div className={styles.container}>
      <DatePickerWithRange />
    </div>
  );
}

const styles = {
  container: "flex gap-4 my-4",
};
