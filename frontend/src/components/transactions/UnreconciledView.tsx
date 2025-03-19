import { GetLineItemResponse, LineItem } from "@/types";
import React from "react";
import LineItemTable from "./LineItemTable";
import LineItemTableFilters from "./LineItemTableFilters";
import { unreconciledColumns } from "./columns";

export type UnreconciledViewProps = {
  data: GetLineItemResponse;
};

const UnreconciledView = ({ data }: UnreconciledViewProps) => {
  console.log("data in unreconciled view: ", data);

  return (
    <div>
      <LineItemTableFilters />
      <LineItemTable
        columns={unreconciledColumns}
        data={data.line_items}
        total={data.total}
        paginated={true}
      />
    </div>
  );
};

export default UnreconciledView;
