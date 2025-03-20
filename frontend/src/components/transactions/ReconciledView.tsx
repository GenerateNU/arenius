import React, { useState } from "react";
import { GetLineItemResponse } from "@/types";
import { reconciledColumns } from "./columns";
import { HelpCircle, ArrowRight } from "lucide-react";
import LineItemTable from "./LineItemTable";
import { useLineItems } from "@/context/LineItemsContext";

const ReconciledView = () => {
  const [seeScope, setSeeScope] = useState<number | undefined>();

  const { data } = useLineItems();

  return (
    <div>
      {!seeScope &&
        [1, 2, 3].map((scope) => (
          <ScopeTablePreview
            key={scope}
            data={data}
            scope={scope}
            handleClick={() => setSeeScope(scope)}
          />
        ))}

      {seeScope && (
        <ScopeReconciledView
          data={data}
          scope={seeScope}
          handleClick={() => setSeeScope(undefined)}
        />
      )}
    </div>
  );
};

const ScopeTablePreview = ({
  data,
  scope,
  handleClick,
}: {
  data: GetLineItemResponse;
  scope?: number;
  handleClick?: () => void;
}) => {
  const filteredData = data.line_items
    .filter((item) => item.scope === scope)
    .slice(0, 5);

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
        columns={reconciledColumns}
        data={filteredData}
        rowCount={filteredData.length}
        paginated={false}
      />
    </div>
  );
};

const ScopeReconciledView = ({
  data,
  scope,
  handleClick,
}: {
  data: GetLineItemResponse;
  scope?: number;
  handleClick: () => void;
}) => {
  const filteredData = data.line_items.filter((item) => item.scope === scope);

  return (
    <div className="mt-4 mb-8">
      <div className="flex justify-between">
        <p className="font-bold text-lg mb-2">All Scope {scope} Transactions</p>
        <p className="cursor-pointer" onClick={handleClick}>
          See all scopes
        </p>
      </div>
      <LineItemTable
        columns={reconciledColumns}
        data={filteredData}
        rowCount={filteredData.length}
      />
    </div>
  );
};

export default ReconciledView;
