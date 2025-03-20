import { GetLineItemResponse } from "@/types";
import React from "react";
import LineItemTable from "./LineItemTable";
import LineItemTableFilters from "./LineItemTableFilters";
import { unreconciledColumns } from "./columns";
import { useLineItems } from "@/context/LineItemsContext";

const UnreconciledView = () => {
  const { data } = useLineItems();
  console.log("cols: ", unreconciledColumns);
  return (
    <div>
      <LineItemTableFilters />
      <LineItemTable
        columns={unreconciledColumns}
        data={data.line_items}
        rowCount={data.total}
      />
    </div>
  );
};

export default UnreconciledView;
