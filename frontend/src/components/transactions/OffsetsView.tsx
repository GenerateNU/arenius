import React from "react";
import LineItemTable from "./LineItemTable";
import LineItemTableFilters from "./LineItemTableFilters";
import { offsetColumns } from "./columns";

const OffsetsView = () => {
  return (
    <div>
      <LineItemTableFilters />
      <LineItemTable
        activePage={"offsets"}
        activeTableData="offsets"
        columns={offsetColumns}
      />
    </div>
  );
};

export default OffsetsView;
