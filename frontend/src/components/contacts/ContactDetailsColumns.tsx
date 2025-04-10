import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { LineItem } from "@/types";

const dateColumn: ColumnDef<LineItem> = {
  accessorKey: "date",
  header: ({ column }) => (
    <Button
      variant="ghost"
      size="sm"
      className=""
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Date
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </Button>
  ),
  cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
};

const descriptionColumn: ColumnDef<LineItem> = {
  accessorKey: "description",
  header: ({ column }) => (
    <Button
      variant="ghost"
      size="sm"
      className=""
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Description
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </Button>
  ),
};

const emissionFactorColumn: ColumnDef<LineItem> = {
  accessorKey: "emission_factor_name",
  header: ({ column }) => (
    <Button
      variant="ghost"
      size="sm"
      className=""
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Emissions Factor
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </Button>
  ),
};

const scopeColumn: ColumnDef<LineItem> = {
  accessorKey: "scope",
  header: ({ column }) => (
    <Button
      variant="ghost"
      size="sm"
      className=""
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Scope
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </Button>
  ),
};

const co2Column: ColumnDef<LineItem> = {
  accessorKey: "co2",
  header: ({ column }) => (
    <Button
      variant="ghost"
      size="sm"
      className=""
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <p>
        CO<sub>2</sub>e
      </p>
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </Button>
  ),
  cell: ({ getValue }) => {
    const value = getValue();
    return value !== undefined && value !== null ? `${value} Kg` : "";
  },
};

const totalAmountColumn: ColumnDef<LineItem> = {
  accessorKey: "total_amount",
  header: ({ column }) => (
    <Button
      variant="ghost"
      size="sm"
      className=""
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Amount
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </Button>
  ),
  cell: ({ getValue }) => `${(getValue() as number).toFixed(2)}`,
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
