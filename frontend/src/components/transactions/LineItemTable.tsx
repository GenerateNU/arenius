"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { useTransactionsContext } from "@/context/TransactionContext";
import { handleRecommendation } from "@/services/lineItems";
import LineItemTableActions from "./LineItemTableActions";
import { DataTablePagination } from "../ui/DataTablePagination";
import LoadingSpinner from "../ui/loading-spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineItem } from "@/types";

export type LineItemTableProps = {
  activePage: "reconciled" | "unreconciled" | "offsets";
  activeTableData:
    | "reconciled"
    | "scope1"
    | "scope2"
    | "scope3"
    | "unreconciled"
    | "recommended"
    | "offsets";
  columns: ColumnDef<LineItem>[];
  paginated?: boolean;
  tableLimit?: number;
};

export default function LineItemTable({
  columns,
  activePage,
  activeTableData,
  paginated = true,
  tableLimit,
}: LineItemTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { tableData, loading } = useTransactionsContext();

  // Memoize the rows to avoid unnecessary recomputations
  const rows = useMemo(() => {
    const data = tableData[activeTableData] || [];
    if (tableLimit) {
      return data.slice(0, tableLimit); // Slice only when tableLimit is provided
    }
    return data;
  }, [tableData, activeTableData, tableLimit]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    rowCount: rows.length,
    getRowId: (row: LineItem) => row.id,
    state: {
      sorting,
    },
  });

  const { fetchAllData } = useTransactionsContext();

  const rowIsSelected = table
    .getRowModel()
    .rows.some((row) => row.getIsSelected());

  const handleAction = async (lineItem: LineItem, approved: boolean) => {
    await handleRecommendation(lineItem.id, approved);
    setTimeout(() => fetchAllData(), 1500);
  };

  const emptyRows = Array(3).fill(null); // array of empty rows for the skeleton when loading

  return (
    <>
      <div className="rounded-md bg-white">
        <Table>
          <TableHeader className="h-14">
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
            {loading ? (
              // Skeleton loading rows
              emptyRows.map((_, index) => (
                <TableRow key={`loading-${index}`} className="border-none">
                  <TableCell
                    colSpan={columns.length}
                    className="h-16 text-center"
                  >
                    {index === 1 && (
                      <div className="flex justify-center items-center">
                        <LoadingSpinner size={40} className="opacity-70" />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
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
                  {activeTableData === "recommended" && (
                    <TableCell
                      style={{
                        minWidth: 100,
                        maxWidth: 100,
                      }}
                    >
                      <div className="flex gap-2 justify-center items-center">
                        <button
                          onClick={() => handleAction(row.original, false)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={18} />
                        </button>
                        <button
                          onClick={() => handleAction(row.original, true)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    </TableCell>
                  )}
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
      {rowIsSelected && <LineItemTableActions table={table} />}

      {paginated && !loading && table.getRowModel().rows?.length > 0 && (
        <DataTablePagination
          page={table.getState().pagination.pageIndex}
          pageLimit={table.getState().pagination.pageSize}
          total_count={tableData[activePage].length}
          setPage={(newPage) => table.setPageIndex(newPage)}
          setPageLimit={(newLimit) => table.setPageSize(newLimit)}
        />
      )}
    </>
  );
}
