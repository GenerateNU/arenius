"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "@/components/ui/columnHeader";
import { Contact } from "@/types";

export const columns: ColumnDef<Contact>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return <ColumnHeader name="Contact" column={column} />;
    },
  },
  {
    accessorKey: "scope",
    header: ({ column }) => {
      return <ColumnHeader name="Scope" column={column} />;
    },
    cell: ({}) => {
        // TODO: un-hard code once scope is added to table?
        return <div className="font-medium">Scope 1</div>;
    },
  },

  {
    accessorKey: "industry",
    header: ({ column }) => {
      return <ColumnHeader name="Title" column={column} />;
    },cell: ({}) => {
        // TODO: un-hard code once scope is added to table?
        return <div className="font-medium">Industry/Title</div>;
    },
  },

  {
    accessorKey: "location",
    header: ({ column }) => {
      return <ColumnHeader name="Location" column={column} />;
    },
    cell: ({ row }) => {
        const city = String(row.getValue("city"))
        const state = String(row.getValue("state"))
        if (state && state !== "") {
            return <div className="font-medium">{city}, {state}</div>;
        } else {
            return <div className="font-medium">{city}</div>;
        }
    },
  },

  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <ColumnHeader name="Email" column={column} className="text-right" />
      );
    },
  },
];
