"use client";

import { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Contact } from "@/types";
import { useContacts } from "@/context/ContactContext";
import { columns } from "./columns";
import { DataTablePagination } from "../ui/DataTablePagination";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../ui/loading-spinner";

export default function ContactTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, isLoading } = useContacts();
  const router = useRouter();

  // Track if we've ever successfully loaded data
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Determine if we're in a loading state
  const Loading = !data.contacts || !hasLoadedData;

  // Set hasLoadedData to true when we successfully get data
  useEffect(() => {
    if (data.contacts || !isLoading) {
      setHasLoadedData(true);
    }
  }, [data.contacts]);

  const table = useReactTable({
    data: data.contacts || [],
    columns: columns(router),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    rowCount: data.total,
    getRowId: (row: Contact) => row.id,
    state: {
      sorting,
    },
  });

  // Create an array of empty rows for the skeleton when loading
  const emptyRows = Array(3).fill(null);

  return (
    <>
      <div className="rounded-md border bg-white">
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
            {Loading ? (
              // Skeleton loading rows
              emptyRows.map((_, index) => (
                <TableRow key={`loading-${index}`} className="border-none">
                  <TableCell
                    colSpan={table.getAllColumns().length}
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
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && table.getRowModel().rows?.length > 0 && (
        <DataTablePagination
          page={table.getState().pagination.pageIndex}
          pageLimit={table.getState().pagination.pageSize}
          total_count={data.contacts?.length}
          setPage={(newPage) => table.setPageIndex(newPage)}
          setPageLimit={(newLimit) => table.setPageSize(newLimit)}
        />
      )}
      <br />
    </>
  );
}
