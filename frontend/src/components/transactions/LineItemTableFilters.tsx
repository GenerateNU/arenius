import React, { useState } from "react";
import { DatePickerWithRange } from "./DatePicker";
import CategorySelector from "./CategorySelector";
import { EmissionsFactor } from "@/types";

export default function LineItemTableFilters() {
  const [selectedFactor, setSelectedFactorState] = useState<EmissionsFactor | undefined>(undefined);

  const handleSelectFactor = (factor: EmissionsFactor) => {
    setSelectedFactorState(factor);
    setSelectedFactor(factor); // Pass to parent
  };

  return (
    <div className={styles.container}>
      <DatePickerWithRange />
      <CategorySelector
        emissionsFactor={selectedFactor}
        setEmissionsFactor={handleSelectFactor}
      />
    </div>
  );
}

const styles = {
  container: "flex gap-4 my-4",
};
