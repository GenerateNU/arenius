import React, { useState } from "react";
import { reconciledColumns } from "./columns";
import { HelpCircle, ArrowRight } from "lucide-react";
import LineItemTable from "./LineItemTable";
import { useTransactionsContext } from "@/context/TransactionContext";

export type ReconciledViewProps = {
  viewMode: "paginated" | "scoped";
};

const ReconciledView = ({ viewMode }: ReconciledViewProps) => {
  const [seeScope, setSeeScope] = useState<number | undefined>();

  const { tableData } = useTransactionsContext();

  console.log("tableData: ", tableData);

  if (viewMode == "paginated") {
    return (
      <div>
        <p className="font-bold text-lg py-4">All reconciled transactions</p>
        <LineItemTable
          activePage={"reconciled"}
          activeTableData="reconciled"
          columns={reconciledColumns}
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
          <div className="flex items-center space-x-2 mb-2">
            <p className="font-bold text-lg">Scope {scope}</p>
            <HelpCircle className="w-4" />
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
        activePage="reconciled"
        activeTableData={`scope${scope}`}
        columns={reconciledColumns}
        paginated={false}
      />
    </div>
  );
};

const ScopeReconciledView = ({
  scope,
  handleClick,
}: {
  scope?: number;
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
        activePage="reconciled"
        activeTableData="reconciled"
        columns={reconciledColumns}
      />
    </div>
  );
};

export default ReconciledView;
