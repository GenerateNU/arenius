"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { reconcileBatch } from "@/services/lineItems";
import { EmissionsFactor, LineItem, ReconcileBatchRequest } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CategorySelector from "./CategorySelector";
import { useLineItems } from "@/context/LineItemsContext";
import { columns } from "./columns";

export default function LineItemTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [scope, setScope] = useState("");
  const [emissionsFactor, setEmissionsFactor] = useState<EmissionsFactor>();
  const { items, fetchData } = useLineItems();

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row: LineItem) => row.id,
    state: {
      sorting,
    },
  });

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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <br />

      <div className="flex w-full space-x-2 px-2 py-2">
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

        <CategorySelector
          emissionsFactor={emissionsFactor}
          setEmissionsFactor={setEmissionsFactor}
        />
        <Button onClick={reconcileItems}>Reconcile</Button>
      </div>
    </>
  );
}
