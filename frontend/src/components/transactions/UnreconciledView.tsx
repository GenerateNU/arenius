import React from "react";
import LineItemTable from "./LineItemTable";
import LineItemTableFilters from "./LineItemTableFilters";
import { recommendationColumns, unreconciledColumns } from "./columns";

const UnreconciledView = () => {
  return (
    <div>
      <LineItemTableFilters />
      <LineItemTable
        activePage={"unreconciled"}
        activeTableData="recommended"
        columns={recommendationColumns}
      />

      <LineItemTable
        activePage={"unreconciled"}
        activeTableData="unreconciled"
        columns={unreconciledColumns}
      />
    </div>
  );
};

export default UnreconciledView;
