import { useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";

import { useTransactionsContext } from "@/context/TransactionContext";
import { ModalDialog } from "./ModalDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "../ui/columnHeader";
import { textConstants } from "@/lib/utils";
import { LineItem } from "@/types";

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
  size: 25,
};

const dateColumn: ColumnDef<LineItem> = {
  accessorKey: "date",
  header: ({ column }) => {
    return <ColumnHeader name="Date" column={column} />;
  },
  cell: ({ row }) => {
    const date: string = row.getValue("date");
    const dateStr = date.split("T")[0];
    const [, month, day] = dateStr.split("-");
    return <div className="font-medium">{`${month}/${day}`}</div>;
  },
  size: 75,
};

const scopeColumn: ColumnDef<LineItem> = {
  accessorKey: "scope",
  header: ({ column }) => {
    return (
      <ColumnHeader
        name="Scope"
        column={column}
        tooltipContent={textConstants.scope}
      />
    );
  },
  size: 60,
  cell: ({ row }) => {
    return (
      <div className="text-right font-medium pr-4">{row.getValue("scope")}</div>
    );
  },
};

const descriptionColumn: ColumnDef<LineItem> = {
  accessorKey: "description",
  header: ({ column }) => {
    return <ColumnHeader name="Description" column={column} />;
  },
  size: 150,
};

const emissionFactorColumn: ColumnDef<LineItem> = {
  accessorKey: "emission_factor_name",
  header: ({ column }) => {
    return (
      <ColumnHeader
        name="Emissions Factor"
        column={column}
        tooltipContent={textConstants.emissionsFactor}
      />
    );
  },
  size: 200,
};

const recommendedEmissionFactorColumn: ColumnDef<LineItem> = {
  accessorKey: "recommended_emission_factor_name",
  header: ({ column }) => {
    return <ColumnHeader name="Emissions Factor" column={column} />;
  },
  size: 200,
  cell: ({ row }) => {
    const value = row.getValue("recommended_emission_factor_name") as string;
    return (
      <span className="px-2 py-1 rounded-md bg-green-100 text-green-900 text-sm font-medium">
        {value}
      </span>
    );
  },
};

const recommendedScope: ColumnDef<LineItem> = {
  accessorKey: "recommended_scope",
  header: ({ column }) => {
    return <ColumnHeader name="Scope" column={column} />;
  },
  size: 100,
  cell: ({ row }) => {
    const value = row.getValue("recommended_scope") as number;
    return (
      <span className="px-2 py-1 rounded-md bg-green-100 text-green-900 text-sm font-medium">
        {value}
      </span>
    );
  },
};

const contactColumn: ColumnDef<LineItem> = {
  accessorKey: "contact_name",
  header: ({ column }) => {
    return (
      <ColumnHeader
        name="Contact"
        column={column}
        tooltipContent={textConstants.contact}
      />
    );
  },
  size: 150,
};
const co2Column: ColumnDef<LineItem> = {
  accessorKey: "co2",
  header: ({ column }) => {
    return (
      <ColumnHeader
        name="CO2e"
        column={column}
        tooltipContent={textConstants.carbonOffset}
      />
    );
  },
  cell: ({ row }) => {
    const co2 = parseFloat(row.getValue("co2"));
    const formatted = !Number.isNaN(co2) ? `${co2} kg` : "";

    return <div className="font-medium">{formatted}</div>;
  },
  size: 75,
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
  size: 80,
};

function ModalCell({
  row,
  type,
}: {
  row: Row<LineItem>;
  type: "offsets" | "reconciled" | "unreconciled";
}) {
  const { fetchAllData } = useTransactionsContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dataRow = row.original;

  return (
    <div className="flex justify-end">
      <ChevronRight
        className="cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      />
      <ModalDialog
        selectedRowData={dataRow}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        onReconcileSuccess={fetchAllData}
        type={type}
      />
    </div>
  );
}

function getModalColumn(type: "offsets" | "reconciled" | "unreconciled") {
  const modalColumn: ColumnDef<LineItem> = {
    id: "actions",
    cell: ({ row }) => <ModalCell row={row} type={type} />,
    size: 40,
  };
  return modalColumn;
}

export const unreconciledColumns: ColumnDef<LineItem>[] = [
  selectColumn,
  dateColumn,
  descriptionColumn,
  contactColumn,
  amountColumn,
  getModalColumn("unreconciled"),
];

export const baseColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn,
  emissionFactorColumn,
  co2Column,
  contactColumn,
  amountColumn,
];

export const scopeReconciledColumns: ColumnDef<LineItem>[] = [
  ...baseColumns,
  getModalColumn("reconciled"),
];

export const allReconciledColumns: ColumnDef<LineItem>[] = [
  ...baseColumns,
  scopeColumn,
  getModalColumn("reconciled"),
];

export const recommendationColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn,
  recommendedEmissionFactorColumn,
  recommendedScope,
  contactColumn,
  amountColumn,
];

export const offsetColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn, // Not on carbon offsets table
  co2Column, // We have a total_amount_kg field instead, this needs its own column
  contactColumn, // Not on carbon offsets table (there is a source field though)
  amountColumn, // Not on carbon offets table
  getModalColumn("offsets"),
];
