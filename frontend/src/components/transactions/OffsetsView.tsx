import React from "react";
import LineItemTable from "./LineItemTable";
import { offsetColumns } from "./columns";
import { HelpCircle } from "lucide-react";
import { Tooltip } from "../ui/tooltip";
import { textConstants } from "@/lib/utils";

const OffsetsView = () => {
  return (
    <div className="mt-4 mb-8">
      <div className="flex items-center space-x-2 mb-2">
        <p className="font-bold text-lg">Carbon offsets</p>
        <Tooltip textContent={textConstants.offset}>
          <HelpCircle className="w-4" />
        </Tooltip>
      </div>
      <LineItemTable
        activePage={"offsets"}
        activeTableData="offsets"
        columns={offsetColumns}
      />
    </div>
  );
};

export default OffsetsView;
