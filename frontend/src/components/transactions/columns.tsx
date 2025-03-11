"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "@/components/ui/columnHeader";
import { LineItem } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

const selectColumn: ColumnDef<LineItem> = {
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
};
const dateColumn: ColumnDef<LineItem> = {
  accessorKey: "date",
  header: ({ column }) => {
    return <ColumnHeader name="Date" column={column} />;
  },
  cell: ({ row }) => {
    const date = new Date(row.getValue("date"));
    const formattedDate = date.getMonth() + 1 + "/" + date.getDate();
    return <div className="font-medium">{formattedDate}</div>;
  },
};

const descriptionColumn: ColumnDef<LineItem> = {
  accessorKey: "description",
  header: ({ column }) => {
    return <ColumnHeader name="Name" column={column} />;
  },
};

const emissionFactorColumn: ColumnDef<LineItem> = {
  accessorKey: "emission_factor_name",
  header: ({ column }) => {
    return <ColumnHeader name="Emissions Factor" column={column} />;
  },
};
const contactColumn: ColumnDef<LineItem> = {
  accessorKey: "contact_name",
  header: ({ column }) => {
    return <ColumnHeader name="Contact" column={column} />;
  },
};
const co2Column: ColumnDef<LineItem> = {
  accessorKey: "co2",
  header: ({ column }) => {
    return <ColumnHeader name="CO2" column={column} />;
  },
  cell: ({ row }) => {
    const co2 = parseFloat(row.getValue("co2"));
    const formatted = !Number.isNaN(co2) ? `${co2} kg` : "";

    return <div className="font-medium">{formatted}</div>;
  },
};
const amountColumn: ColumnDef<LineItem> = {
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
};

export const unreconciledColumns: ColumnDef<LineItem>[] = [
  selectColumn,
  dateColumn,
  descriptionColumn,
  contactColumn,
  amountColumn,
];
export const reconciledColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn,
  emissionFactorColumn,
  co2Column,
  contactColumn,
  amountColumn,
];
