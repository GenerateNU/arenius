import { LineItem } from "@/types";
import React from "react";
import LineItemTable from "./LineItemTable";
import LineItemTableFilters from "./LineItemTableFilters";
import { unreconciledColumns } from "./columns";

export type UnreconciledViewProps = {
  data: LineItem[];
};

const UnreconciledView = ({ data }: UnreconciledViewProps) => {
  return (
    <div>
      <LineItemTableFilters />
      <LineItemTable columns={unreconciledColumns} data={data} />
    </div>
  );
};

export default UnreconciledView;
