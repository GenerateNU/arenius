"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
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
import { LineItem } from "@/types";
import { useLineItems } from "@/context/LineItemsContext";
import { columns } from "./columns";
import LineItemTableActions from "./LineItemTableActions";
import  { ModalDialog } from "./ModalDialog";
import Image from "next/image"
import { DataTablePagination } from "../ui/DataTablePagination";

export default function LineItemTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: items, fetchData, pagination, setPagination } = useLineItems();

  const [selectedRowData, setSelectedRowData] = useState<Row<LineItem> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const table = useReactTable({
    data: items.line_items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: items.total,
    onPaginationChange: setPagination,
    getRowId: (row: LineItem) => row.id,
    state: {
      sorting,
      pagination,
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

  return (
    <div>
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
      <DataTablePagination
        table={table}
        pagination={pagination}
        total_count={items.total}
      />

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
    </div>
  );
}

