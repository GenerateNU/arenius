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
import { DataTablePagination } from "../ui/DataTablePagination";

export type LineItemTableProps = {
  columns: ColumnDef<LineItem>[];
  data: LineItem[];
  rowCount: number;
  paginated?: boolean;
};

export default function LineItemTable({
  columns,
  data,
  rowCount,
  paginated = true,
}: LineItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { fetchData, pagination, setPagination } = useLineItems();

  const [selectedRowData, setSelectedRowData] = useState<Row<LineItem> | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount,
    onPaginationChange: setPagination,
    getRowId: (row: LineItem) => row.id,
    state: {
      sorting,
      pagination,
    },
  });

  const rowIsSelected = table
    .getRowModel()
    .rows.some((row) => row.getIsSelected());

  const openEditDialog = (row: Row<LineItem>) => {
    setSelectedRowData(row);
    setIsDialogOpen(true);
  };

  const handleReconcileSuccess = () => {
    fetchData();
    setIsDialogOpen(false);
  };

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

      {paginated && (
        <DataTablePagination
          table={table}
          pagination={pagination}
          total_count={rowCount}
        />
      )}

      {selectedRowData && (
        <ModalDialog
          selectedRowData={selectedRowData}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onReconcileSuccess={handleReconcileSuccess}
        />
      )}

      <br />
      {rowIsSelected && <LineItemTableActions table={table} />}
    </>
  );
}
