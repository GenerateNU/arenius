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
import { Contact } from "@/types";
import { useContacts } from "@/context/ContactContext";
import { columns } from "./columns";
import { DataTablePagination } from "../ui/DataTablePagination";

export default function ContactTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { data, pagination, setPagination } = useContacts();

  const table = useReactTable({
    data: data.contacts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: data.total,
    onPaginationChange: setPagination,
    getRowId: (row: Contact) => row.id,
    state: {
      sorting,
      pagination,
    },
  });

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
      <DataTablePagination
        table={table}
        page={pagination.pageIndex}
        pageLimit={pagination.pageSize}
        total_count={data.total}
        setPage={(newPage) =>
          setPagination({ ...pagination, pageIndex: newPage })
        }
        setPageLimit={(newLimit) =>
          setPagination({ ...pagination, pageSize: newLimit })
        }
      />
      <br />
    </>
  );
}
