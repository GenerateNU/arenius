"use client";

import { useState } from "react";

import {
  ColumnDef,
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
import { Input } from "../ui/input";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  getRowId: (row: TData) => string;
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [scope, setScope] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getRowId,
    state: {
      sorting,
    },
  });

  function reconcileItems() {
    const selectedIds = table.getSelectedRowModel().rows.map((row) => row.id);
    reconcileBatch(selectedIds, Number(scope));
  }

  return (
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <br />

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          className="w-16"
          type="number"
          placeholder="Scope"
          onChange={(e) => setScope(e.target.value)}
        />
        <Button onClick={reconcileItems}>Set scope</Button>
      </div>
    </div>
  );
}
