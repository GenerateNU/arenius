"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "@/components/ui/columnHeader";
import { LineItem } from "@/types";

export const columns: ColumnDef<LineItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="ml-2"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return <ColumnHeader name="Date" column={column} />;
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      const formattedDate = date.getMonth() + 1 + "/" + date.getDate();
      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return <ColumnHeader name="Name" column={column} />;
    },
  },

  {
    accessorKey: "emission_factor_name",
    header: ({ column }) => {
      return <ColumnHeader name="Emissions factor" column={column} />;
    },
  },

  {
    accessorKey: "contact",
    header: ({ column }) => {
      return <ColumnHeader name="Contact" column={column} />;
    },
    cell: ({}) => {
      // TODO: un-hard-code after contacts table is created
      return <div className="font-medium">Contact name</div>;
    },
  },

  {
    accessorKey: "total_amount",
    header: ({ column }) => {
      return (
        <ColumnHeader name="Amount" column={column} className="text-right" />
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium pr-4">{formatted}</div>;
    },
  },
];
