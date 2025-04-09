import React, { useState } from "react";
import { Table } from "@tanstack/react-table";

import { useTransactionsContext } from "@/context/TransactionContext";
import { reconcileBatch, reconcileBatchOffset } from "@/services/lineItems";
import { EmissionsFactor, LineItem, ReconcileBatchRequest } from "@/types";
import EmissionsFactorSelector from "./CategorySelector";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type LineItemTableActionsProps = {
  table: Table<LineItem>;
};

export function LineItemTableActions({ table }: LineItemTableActionsProps) {
  const [scope, setScope] = useState("");
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();
  const [carbon, setCarbon] = useState<number>();
  const { fetchTableData } = useTransactionsContext();

  async function handleReconciliation() {
    if (scope === "0") {
      if (!carbon || carbon <= 0) {
        alert("Please enter a valid carbon offset amount.");
        return;
      }
      await handleCarbonOffsetReconciliation();
    } else {
      if (!emissionsFactor) {
        alert("Please select an emissions factor.");
        return;
      }
      await handleLineItemReconciliation();
    }

    resetState();
    fetchTableData("unreconciled", {});
  }

  async function handleCarbonOffsetReconciliation() {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id);

    const request: ReconcileBatchRequest = {
      lineItemIds: selectedIds,
      ...(scope && { scope: Number(scope) }),
      co2: carbon ?? 0,
      co2_unit: "kg",
    };
    console.log("Reconcile request:", request);

    await reconcileBatchOffset(request);
    fetchTableData("offsets", {});
  }

  async function handleLineItemReconciliation() {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id);

    const request: ReconcileBatchRequest = {
      lineItemIds: selectedIds,
      scope: Number(scope),
      ...(emissionsFactor && {
        emissionsFactorId: emissionsFactor.activity_id,
      }),
    };

    await reconcileBatch(request);
    fetchTableData("reconciled", {});
  }

  function resetState() {
    table.resetRowSelection();
    setScope("");
    setEmissionsFactor(undefined);
    setCarbon(0);
  }

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-2 z-50 transition-all duration-200 ease-in-out w-3/4 max-w-4xl">
      <div className="flex items-center gap-4 justify-between">
        <div className="bg-gray-100 rounded-lg px-4 py-2">
          <span className="font-medium">{selectedCount} Selected</span>
        </div>

        <ScopeSelector setScope={setScope} />

        {scope !== "0" ? (
          <EmissionsFactorSelector
            emissionsFactor={emissionsFactor}
            setEmissionsFactor={setEmissionsFactor}
            className="w-64 font-semibold"
          />
        ) : (
          <Input
            type="number"
            className="bg-white max-w-48"
            value={Number(carbon) ?? "0"}
            onChange={(e) => setCarbon(parseFloat(e.target.value))}
            placeholder="Carbon offset (kg)"
            min="0"
          />
        )}

        <Button
          onClick={handleReconciliation}
          disabled={
            scope === "" ||
            selectedCount === 0 ||
            (scope !== "0" && !emissionsFactor) ||
            (scope === "0" && !carbon)
          }
          className="bg-deepwood hover:bg-green-700 text-white px-6"
        >
          Reconcile Items
        </Button>
      </div>
    </div>
  );
}

function ScopeSelector({ setScope }: { setScope: (value: string) => void }) {
  return (
    <div>
      <Select onValueChange={(value) => setScope(value)}>
        <SelectTrigger className="w-[180px] bg-white font-semibold justify-center gap-2">
          <SelectValue placeholder="Select scope" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex flex-col gap-1">
            {[1, 2, 3].map((value) => (
              <SelectItem
                key={value}
                value={String(value)}
                className={styles.selectItem}
              >
                Scope {value}
              </SelectItem>
            ))}
            <SelectItem value="0" className={styles.selectItem}>
              Offset
            </SelectItem>
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}

export default LineItemTableActions;

const styles = {
  selectItem: "h-12 border border-black justify-center font-semibold",
  button: "flex gap-8 text-wrap text-left py-2 h-full w-full font-semibold",
  chevronDown: "h-4 w-4 opacity-50",
};
