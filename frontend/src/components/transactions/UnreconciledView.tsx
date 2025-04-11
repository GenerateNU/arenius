import React from "react";
import LineItemTable from "./LineItemTable";
import { recommendationColumns, unreconciledColumns } from "./columns";
import { Tooltip } from "../ui/tooltip";
import { HelpCircle } from "lucide-react";
import { textConstants } from "@/lib/utils";

const UnreconciledView = () => {
  return (
    <div>
      <div className="flex items-center">
        <p className="text-xl font-bold py-2 mr-2">Suggested Reconciliations</p>
        <Tooltip textContent={textConstants.recommendation}>
          <HelpCircle className="w-4" />
        </Tooltip>
      </div>
      <LineItemTable
        activeTableData="recommended"
        columns={recommendationColumns}
        paginated={false}
      />
      <div className="flex items-end">
        <p className="text-xl font-bold mt-6 py-2 mr-2">
          All Unreconciled Reconciliations
        </p>
        <Tooltip textContent={textConstants.unreconciled}>
          <HelpCircle className="w-4 mb-3" />
        </Tooltip>
      </div>

      <LineItemTable
        activeTableData="unreconciled"
        columns={unreconciledColumns}
      />
    </div>
  );
};

export default UnreconciledView;
