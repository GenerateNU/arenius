import React, { useState } from "react";
import { Table } from "@tanstack/react-table";

import { useTransactionsContext } from "@/context/TransactionContext";
import { reconcileBatch, reconcileBatchOffset } from "@/services/lineItems";
import { EmissionsFactor, LineItem, ReconcileBatchRequest } from "@/types";
import EmissionsFactorSelector from "./CategorySelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type LineItemTableActionsProps = {
  table: Table<LineItem>;
};

export function LineItemTableActions({ table }: LineItemTableActionsProps) {
  const [scope, setScope] = useState("");
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();
  const [carbon, setCarbon] = useState<number>();
  // const { companyId } = useAuth();
  const { fetchTableData } = useTransactionsContext();

  async function handleReconciliation() {
    if (scope === "0") {
      if (!carbon || carbon <= 0) {
        alert("Please enter a valid carbon offset amount.");
        return;
      }
      await handleCarbonOffsetReconciliation();
    } else {
      await handleLineItemReconciliation();
    }

    resetState();
    fetchTableData("unreconciled", {});
  }

  // Handles reconciliation for carbon offsets
  async function handleCarbonOffsetReconciliation() {
    // const request: BatchCreateCarbonOffsetsRequest = {
    //   carbon_offsets: table.getSelectedRowModel().rows.map((row) => ({
    //     carbon_amount_kg: carbon ?? 0,
    //     company_id: companyId ?? "",
    //     source: row.original.description,
    //     purchase_date: row.original.date,
    //   })),
    // };
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id);

    const request: ReconcileBatchRequest = {
      lineItemIds: selectedIds,
      ...(scope && { scope: Number(scope) }),
    };

    await reconcileBatchOffset(request);
  }

  // Handles reconciliation for regular line items
  async function handleLineItemReconciliation() {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id);

    const request: ReconcileBatchRequest = {
      lineItemIds: selectedIds,
      ...(scope && { scope: Number(scope) }),
      ...(emissionsFactor && {
        emissionsFactorId: emissionsFactor.activity_id,
      }),
    };

    await reconcileBatch(request);
  }

  function resetState() {
    table.resetRowSelection();
    setScope("");
    setEmissionsFactor(undefined);
    setCarbon(0);
  }

  return (
    <div className="flex w-full items-end space-x-2 px-2 py-2">
      <ScopeSelector setScope={setScope} />
      {scope !== "0" ? (
        <EmissionsFactorSelector
          emissionsFactor={emissionsFactor}
          setEmissionsFactor={setEmissionsFactor}
        />
      ) : (
        <CarbonOffsetInput carbon={carbon} setCarbon={setCarbon} />
      )}
      <Button onClick={handleReconciliation}>Reconcile</Button>
    </div>
  );
}

function ScopeSelector({ setScope }: { setScope: (value: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium w-full">Scope</label>
      <Select onValueChange={(value) => setScope(value)}>
        <SelectTrigger className="w-[180px] bg-white">
          <SelectValue placeholder="Select scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Scope 1</SelectItem>
          <SelectItem value="2">Scope 2</SelectItem>
          <SelectItem value="3">Scope 3</SelectItem>
          <SelectItem value="0">Offset</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function CarbonOffsetInput({
  carbon,
  setCarbon,
}: {
  carbon: number | undefined;
  setCarbon: (value: number) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <label className="text-sm font-medium w-full">Carbon offset (kg)</label>
      <Input
        type="number"
        className="bg-white"
        value={carbon ?? "0"}
        onChange={(e) => setCarbon(parseFloat(e.target.value))}
        placeholder="10 kg"
        min="0"
      />
    </div>
  );
}

export default LineItemTableActions;
