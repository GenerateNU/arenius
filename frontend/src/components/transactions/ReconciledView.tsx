import React, { useState } from "react";
import { HelpCircle, ArrowRight } from "lucide-react";

import { scopeReconciledColumns, allReconciledColumns } from "./columns";
import LineItemTable from "./LineItemTable";
import { Tooltip } from "../ui/tooltip";
import { textConstants } from "@/lib/utils";

export type ReconciledViewProps = {
  viewMode: "paginated" | "scoped";
};

const ReconciledView = ({ viewMode }: ReconciledViewProps) => {
  const [seeScope, setSeeScope] = useState<1 | 2 | 3 | undefined>();

  if (viewMode == "paginated") {
    return (
      <div>
        <div className="flex items-center">
          <p className="font-bold text-lg py-4 mr-2">
            All Reconciled Transactions
          </p>
          <Tooltip textContent={textConstants.reconciled}>
            <HelpCircle className="w-4" />
          </Tooltip>
        </div>

        <LineItemTable
          activeTableData="reconciled"
          columns={allReconciledColumns}
        />
      </div>
    );
  }

  return (
    <div>
      {!seeScope &&
        ([1, 2, 3] as (1 | 2 | 3)[]).map((scope) => (
          <ScopeTablePreview
            key={scope}
            scope={scope}
            handleClick={() => setSeeScope(scope)}
          />
        ))}

      {seeScope && (
        <ScopeReconciledView
          scope={seeScope}
          handleClick={() => setSeeScope(undefined)}
        />
      )}
    </div>
  );
};

const getScopeText = (scope: 1 | 2 | 3) => {
  switch (scope) {
    case 1:
      return textConstants.scope1;
    case 2:
      return textConstants.scope2;
    case 3:
      return textConstants.scope3;
    default:
      return textConstants.scope;
  }
};

const ScopeTablePreview = ({
  scope,
  handleClick,
}: {
  scope: 1 | 2 | 3;
  handleClick?: () => void;
}) => {
  return (
    <div className="mt-4 mb-8">
      {scope && (
        <div className="flex justify-between ">
          <div className="flex items-center mb-2">
            <p className="font-bold text-lg mr-2">Scope {scope}</p>
            <Tooltip textContent={getScopeText(scope)}>
              <HelpCircle className="w-4" />
            </Tooltip>
          </div>
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={handleClick}
          >
            <p className="text-sm">See all</p>
            <ArrowRight className="w-4" />
          </div>
        </div>
      )}
      <LineItemTable
        activeTableData={`scope${scope}`}
        columns={scopeReconciledColumns}
        paginated={false}
        tableLimit={5}
      />
    </div>
  );
};

const ScopeReconciledView = ({
  scope,
  handleClick,
}: {
  scope: 1 | 2 | 3;
  handleClick: () => void;
}) => {
  return (
    <div className="mt-4 mb-8">
      <div className="flex justify-between">
        <p className="font-bold text-lg mb-2">All Scope {scope} Transactions</p>
        <p className="cursor-pointer" onClick={handleClick}>
          See all scopes
        </p>
      </div>
      <LineItemTable
        activeTableData={`scope${scope}`}
        columns={scopeReconciledColumns}
      />
    </div>
  );
};

export default ReconciledView;
