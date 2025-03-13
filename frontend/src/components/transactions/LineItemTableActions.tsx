import React, { useState } from "react";
import { Table } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import EmissionsFactorSelector from "./CategorySelector";
import { EmissionsFactor, ReconcileBatchRequest } from "@/types";
import { useLineItems } from "@/context/LineItemsContext";
import { reconcileBatch } from "@/services/lineItems";

type LineItemTableActionsProps<LineItem> = {
  table: Table<LineItem>;
};

export function LineItemTableActions<LineItem>({
  table,
}: LineItemTableActionsProps<LineItem>) {
  const [scope, setScope] = useState("");
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();

  const { fetchData } = useLineItems();

  async function reconcileItems() {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id);
    const request: ReconcileBatchRequest = {
      lineItemIds: selectedIds,
      ...(scope && { scope: Number(scope) }),
      ...(emissionsFactor && {
        emissionsFactorId: emissionsFactor.activity_id,
      }),
    };

    await reconcileBatch(request);
    table.resetRowSelection();
    setScope("");
    setEmissionsFactor(undefined);
    fetchData();
  }

  return (
    <div className="flex w-full space-x-2 px-2 py-2 mt-4">
      <Select onValueChange={(value) => setScope(value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select scope" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Scope 1</SelectItem>
          <SelectItem value="2">Scope 2</SelectItem>
          <SelectItem value="3">Scope 3</SelectItem>
        </SelectContent>
      </Select>

      <EmissionsFactorSelector
        emissionsFactor={emissionsFactor}
        setEmissionsFactor={setEmissionsFactor}
      />
      <Button onClick={reconcileItems}>Reconcile</Button>
    </div>
  );
}

export default LineItemTableActions;
