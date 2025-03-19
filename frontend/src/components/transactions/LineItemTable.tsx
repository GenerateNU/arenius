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
import { DataTablePagination } from "../ui/DataTablePagination";

export type LineItemTableProps = {
  columns: ColumnDef<LineItem>[];
  data: LineItem[];
};

export default function LineItemTable({ columns, data }: LineItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: items, fetchData, pagination, setPagination } = useLineItems();

  // object and boolean to handle clicking a row's action button
  const [clickedRowData, setClickedRowData] = useState<Row<LineItem> | null>(
    null
  );
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

  // boolean determining if any row is selected
  const rowIsSelected = table
    .getRowModel()
    .rows.some((row) => row.getIsSelected());

  const openEditDialog = (row: Row<LineItem>) => {
    setClickedRowData(row);
    setIsDialogOpen(true);
  };

  const handleReconcileSuccess = () => {
    fetchData();
    setIsDialogOpen(false);
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="rounded-md  bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        minWidth: header.column.columnDef.size,
                        maxWidth: header.column.columnDef.size,
                      }}
                    >
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
                  className="border-none"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        minWidth: cell.column.columnDef.size,
                        maxWidth: cell.column.columnDef.size,
                      }}
                    >
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
                      onClick={() => openEditDialog(row)}
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

      {clickedRowData && (
        <ModalDialog
          selectedRowData={clickedRowData}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onReconcileSuccess={handleReconcileSuccess}
        />
      )}

      {rowIsSelected && <LineItemTableActions table={table} />}
    </>
  );
}
