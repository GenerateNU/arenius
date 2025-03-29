import { ColumnDef } from "@tanstack/react-table";
import { LineItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "../ui/columnHeader";
import { Check, X } from "lucide-react";
import { handleRecommendation } from "@/services/lineItems";

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
    const date = new Date(row.getValue("date"));
    const formattedDate = date.getMonth() + 1 + "/" + date.getDate();
    return <div className="font-medium">{formattedDate}</div>;
  },
  size: 75,
};

const descriptionColumn: ColumnDef<LineItem> = {
  accessorKey: "description",
  header: ({ column }) => {
    return <ColumnHeader name="Description" column={column} />;
  },
  size: 200,
};

const emissionFactorColumn: ColumnDef<LineItem> = {
  accessorKey: "emission_factor_name",
  header: ({ column }) => {
    return <ColumnHeader name="Emissions Factor" column={column} />;
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

const acceptRecommendationButton: ColumnDef<LineItem> = {
  id: "actions",
  header: "",
  cell: ({ row }) => {
    const lineItem = row.original;

    const handleAccept = async () => {
      await handleRecommendation(lineItem.id, true);
      window.location.reload();
    };

    const handleReject = async () => {
      await handleRecommendation(lineItem.id, false);
      window.location.reload();
    };

    return (
      <div className="flex gap-2 justify-center items-center">
        <button onClick={handleReject} className="text-red-600 hover:text-red-800">
          <X size={18} />
        </button>
        <button onClick={handleAccept} className="text-green-600 hover:text-green-800">
          <Check size={18} />
        </button>
      </div>
    );
  },
  size: 100,
};

const contactColumn: ColumnDef<LineItem> = {
  accessorKey: "contact_name",
  header: ({ column }) => {
    return <ColumnHeader name="Contact" column={column} />;
  },
  size: 150,
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

export const recommendationColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn,
  recommendedEmissionFactorColumn,
  recommendedScope,
  contactColumn,
  amountColumn,
  acceptRecommendationButton,
];

export const offsetColumns: ColumnDef<LineItem>[] = [
  dateColumn,
  descriptionColumn, // Not on carbon offsets table
  co2Column, // We have a total_amount_kg field instead, this needs its own column
  contactColumn, // Not on carbon offsets table (there is a source field though)
  amountColumn // Not on carbon offets table 
];
