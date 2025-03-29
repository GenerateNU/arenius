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
import LineItemTableActions from "./LineItemTableActions";
import { ModalDialog } from "./ModalDialog";
import Image from "next/image";
import { DataTablePagination } from "../ui/DataTablePagination";
import { useTransactionsContext } from "@/context/TransactionContext";

export type LineItemTableProps = {
  activePage: "reconciled" | "unreconciled" | "offsets";
  activeTableData:
    | "reconciled"
    | "scope1"
    | "scope2"
    | "scope3"
    | "unreconciled"
    | "offsets";
  columns: ColumnDef<LineItem>[];
  paginated?: boolean;
};

export default function LineItemTable({
  columns,
  activePage,
  activeTableData,
  paginated = true,
}: LineItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const {
    tableData,
    fetchTableData,
    pageIndex,
    pageSize,
    setPage,
    setPageSize,
  } = useTransactionsContext();

  // object and boolean to handle clicking a row's action button
  const [clickedRowData, setClickedRowData] = useState<Row<LineItem> | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const table = useReactTable({
    data: tableData[activeTableData].line_items || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: tableData[activeTableData].total,
    getRowId: (row: LineItem) => row.id,
    state: {
      sorting,
    },
  });

  const { fetchAllData } = useTransactionsContext();

  // boolean determining if any row is selected
  const rowIsSelected = table
    .getRowModel()
    .rows.some((row) => row.getIsSelected());

  const openEditDialog = (row: Row<LineItem>) => {
    setClickedRowData(row);
    setIsDialogOpen(true);
  };

  const handleReconcileSuccess = () => {
    fetchAllData();
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
          page={pageIndex[activePage]}
          pageLimit={pageSize[activePage]}
          total_count={tableData[activePage].total}
          setPage={(newPage) => setPage(activePage, newPage)}
          setPageLimit={(newLimit) => setPageSize(activePage, newLimit)}
        />
      )}

      {isDialogOpen && clickedRowData && (
        <ModalDialog
          selectedRowData={clickedRowData.original}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          onReconcileSuccess={handleReconcileSuccess}
        />
      )}

      {rowIsSelected && <LineItemTableActions table={table} />}
    </>
  );
}
