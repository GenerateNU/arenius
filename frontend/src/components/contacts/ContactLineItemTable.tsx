// "use client";

// import React, { useState } from "react";
// import {
//   flexRender,
//   getCoreRowModel,
//   useReactTable,
//   getSortedRowModel,
//   SortingState,
//   ColumnDef,
//   Row,
// } from "@tanstack/react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { ArrowUpDown } from "lucide-react";
// import { LineItem } from "@/types";
// import Image from "next/image";
// import { ModalDialog } from "@/components/transactions/ModalDialog";

// interface ContactLineItemTableProps {
//   data: LineItem[];
//   tableType: "reconciled" | "unreconciled" | "offsets";
// }

// export function ContactLineItemTable({ data, tableType }: ContactLineItemTableProps) {
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [selectedRow, setSelectedRow] = useState<Row<LineItem> | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const openEditDialog = (row: Row<LineItem>) => {
//     setSelectedRow(row);
//     setIsDialogOpen(true);
//   };

//   const table = useReactTable({
//     data,
//     columns: contactDetailsColumns,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     onSortingChange: setSorting,
//     state: { sorting },
//   });

//   return (
//     <>
//       <div className="rounded-md border">
//         <Table>
//           <TableHeader>
//             {table.getHeaderGroups().map((headerGroup) => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <TableHead key={header.id}>
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map((row) => (
//                 <TableRow key={row.id}>
//                   {row.getVisibleCells().map((cell) => (
//                     <TableCell key={cell.id}>
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                   <TableCell>
//                     <Image
//                       src="/arrow.svg"
//                       alt="Edit"
//                       width={20}
//                       height={20}
//                       onClick={() => openEditDialog(row)}
//                       style={{ cursor: "pointer" }}
//                     />
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={contactDetailsColumns.length}
//                   className="h-24 text-center"
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {selectedRow && (
//         <ModalDialog
//           selectedRowData={selectedRow.original}
//           isDialogOpen={isDialogOpen}
//           setIsDialogOpen={setIsDialogOpen}
//           onReconcileSuccess={() => setIsDialogOpen(false)}
//           type={tableType}
//         />
//       )}
//     </>
//   );
// }

// // export const contactDetailsColumns: ColumnDef<LineItem>[] = [
// //   {
// //     accessorKey: "date",
// //     header: ({ column }) => (
// //       <Button
// //         variant="ghost"
// //         onClick={() =>
// //           column.toggleSorting(column.getIsSorted() ? undefined : true)
// //         }
// //       >
// //         Date <ArrowUpDown className="ml-2 h-4 w-4" />
// //       </Button>
// //     ),
// //     cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
// //   },
// //   {
// //     accessorKey: "contact_name",
// //     header: ({ column }) => (
// //       <Button
// //         variant="ghost"
// //         onClick={() =>
// //           column.toggleSorting(column.getIsSorted() ? undefined : true)
// //         }
// //       >
// //         Description <ArrowUpDown className="ml-2 h-4 w-4" />
// //       </Button>
// //     ),
// //   },
// //   {
// //     accessorKey: "emission_factor_name",
// //     header: "Emissions Factor",
// //   },
// //   {
// //     accessorKey: "co2",
// //     header: "CO2",
// //   },
// //   {
// //     accessorKey: "total_amount",
// //     header: ({ column }) => (
// //       <Button
// //         variant="ghost"
// //         onClick={() =>
// //           column.toggleSorting(column.getIsSorted() ? undefined : true)
// //         }
// //       >
// //         Amount <ArrowUpDown className="ml-2 h-4 w-4" />
// //       </Button>
// //     ),
// //     cell: ({ getValue }) => `$${(getValue() as number).toFixed(2)}`,
// //   },
// // ];

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
import { reconciledColumns, offsetColumns, unreconciledColumns } from "./contactDetailedColumns";

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