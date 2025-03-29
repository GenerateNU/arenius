import React from "react";
import LineItemTable from "./LineItemTable";
import LineItemTableFilters from "./LineItemTableFilters";
import { recommendationColumns, unreconciledColumns } from "./columns";

const UnreconciledView = () => {
  return (
    <div>
      <LineItemTableFilters />
      <p className="text-xl font-bold py-2">Suggested reconciliations</p>
      <LineItemTable
        activePage={"unreconciled"}
        activeTableData="recommended"
        columns={recommendationColumns}
        paginated={false}
      />
      <p className="text-xl font-bold mt-6 py-2">
        All unreconciled reconciliations
      </p>

      <LineItemTable
        activePage={"unreconciled"}
        activeTableData="unreconciled"
        columns={unreconciledColumns}
      />
    </div>
  );
};

export default UnreconciledView;
