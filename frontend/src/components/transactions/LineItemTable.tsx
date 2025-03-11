"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
  Row,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineItem } from "@/types";
import { useLineItems } from "@/context/LineItemsContext";
import LineItemTableActions from "./LineItemTableActions";
import { ModalDialog } from "./ModalDialog";
import Image from "next/image";
import { LoadingSpinner } from "../ui/loading";

export type LineItemTableProps = {
  columns: ColumnDef<LineItem>[];
};

export default function LineItemTable({ columns }: LineItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, loading } = useLineItems();

  const [selectedRowData, setSelectedRowData] = useState<Row<LineItem> | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { fetchData } = useLineItems();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row: LineItem) => row.id,
    state: {
      sorting,
    },
  });

  const openReconcileDialog = (row: Row<LineItem>) => {
    setSelectedRowData(row);
    setIsDialogOpen(true);
  };

  const handleReconcileSuccess = () => {
    fetchData();
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <LoadingSpinner />
      </div>
    );
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
                  <TableCell>
                    <Image
                      src="/arrow.svg"
                      alt="Reconcile"
                      width={24}
                      height={24}
                      onClick={() => openReconcileDialog(row)}
                      style={{ cursor: "pointer" }}
                    />
                  </TableCell>
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

      {selectedRowData && (
        <ModalDialog
          selectedRowData={selectedRowData}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onReconcileSuccess={handleReconcileSuccess}
        />
      )}

      <br />
      <LineItemTableActions table={table} />
    </>
  );
}
