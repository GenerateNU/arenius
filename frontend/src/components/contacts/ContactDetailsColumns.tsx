import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "../ui/columnHeader";
import { LineItem } from "@/types";
import { formatNumber } from "@/lib/utils";

const dateColumn: ColumnDef<LineItem> = {
  accessorKey: "date",
  header: ({ column }) => {
    return <ColumnHeader name="Date" column={column} />;
  },
  cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
};

const descriptionColumn: ColumnDef<LineItem> = {
  accessorKey: "description",
  header: ({ column }) => {
    return <ColumnHeader name="Description" column={column} />;
  },
};

const emissionFactorColumn: ColumnDef<LineItem> = {
  accessorKey: "emission_factor_name",
  header: ({ column }) => {
    return <ColumnHeader name="Emissions Factor" column={column} />;
  },
};

const scopeColumn: ColumnDef<LineItem> = {
  accessorKey: "scope",
  header: ({ column }) => {
    return <ColumnHeader name="Scope" column={column} />;
  },
};

const co2Column: ColumnDef<LineItem> = {
  accessorKey: "co2",
  header: ({ column }) => {
    return <ColumnHeader name="CO₂e" column={column} />;
  },
  cell: ({ row }) => {
    const value = row.getValue("co2") as number;
    return value ? `${formatNumber(value)} kg` : "";
  },
};

const totalAmountColumn: ColumnDef<LineItem> = {
  accessorKey: "total_amount",
  header: ({ column }) => {
    return (
      <ColumnHeader name="Amount" column={column} className="text-right" />
    );
  },
  cell: ({ row }) => (
    <p className="text-right px-2">{`$${row.original.total_amount.toFixed(
      2
    )}`}</p>
  ),
};

// Reconciled transaction columns (scope 1-3)
export const reconciledColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn,
  emissionFactorColumn,
  scopeColumn,
  co2Column,
  totalAmountColumn,
];

// Offset columns (scope 0)
export const offsetColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn,
  co2Column,
  totalAmountColumn,
];

// Unreconciled columns (no scope)
export const unreconciledColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn,
  totalAmountColumn,
];
