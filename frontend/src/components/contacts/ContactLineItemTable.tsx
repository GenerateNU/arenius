"use client";

import React, { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight } from "lucide-react";
import { LineItem } from "@/types";
import { ModalDialog } from "@/components/transactions/ModalDialog";
import { reconciledColumns, offsetColumns, unreconciledColumns } from "./ContactDetailsColumns";

interface ContactLineItemTableProps {
  data: LineItem[];
  tableType: "reconciled" | "unreconciled" | "offsets";
}

export function ContactLineItemTable({ data, tableType }: ContactLineItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedRow, setSelectedRow] = useState<Row<LineItem> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openEditDialog = (row: Row<LineItem>) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  // Get columns based on tableType
  const getColumns = () => {
    switch (tableType) {
      case "reconciled":
        return reconciledColumns;
      case "offsets":
        return offsetColumns;
      case "unreconciled":
        return unreconciledColumns;
      default:
        return reconciledColumns;
    }
  };

  const table = useReactTable({
    data,
    columns: getColumns(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
                <TableHead key="actions"></TableHead>{/* Empty header for action column */}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                  <TableCell key={`${row.id}-actions`} className="text-right">
                    <ChevronRight
                      className="h-5 w-5 text-gray-400 inline-block cursor-pointer"
                      onClick={() => openEditDialog(row)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={getColumns().length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedRow && (
        <ModalDialog
          selectedRowData={selectedRow.original}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onReconcileSuccess={() => setIsDialogOpen(false)}
          type={tableType}
        />
      )}
    </>
  );
}