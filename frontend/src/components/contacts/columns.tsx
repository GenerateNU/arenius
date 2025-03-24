"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "@/components/ui/columnHeader";
import { Contact } from "@/types";
import Image from "next/image";

// handler to copy the email to clipboard
const handleCopyClick = (text: string) => {
  navigator.clipboard.writeText(text)
};

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
    accessorKey: "industry",
    header: ({ column }) => {
      return <ColumnHeader name="Title" column={column} />;
    },cell: ({}) => {
        // TODO: un-hard code once industry is added to table?
        return <div className="font-medium">Industry/Title</div>;
    },
  },

  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <ColumnHeader name="Phone" column={column} />
      );
    },
  },

  {
    accessorKey: "city",
    header: ({ column }) => {
      return <ColumnHeader name="Location" column={column} />;
    },
    cell: ({ row }) => {
        const city = String(row.getValue("city"))
        const state = row.getValue("state")
        if (state !== undefined) {
            return <div className="font-medium">{city}, {String(state)}</div>;
        } else {
            return <div className="font-medium">{city}</div>;
        }
    },
  },

  {
    accessorKey: "state",
    header: ({}) => {
      // This is so that the above location column can see the state column in the database
      return <></>;
    },
    cell: ({}) => {
      return <></>
    }
  },

  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <ColumnHeader name="Email" column={column} />
      );
    },
    cell: ({ row }) => {
      const email = String(row.getValue("email"))
      return <div className="font-medium">
        <span>{email}</span>
        <button onClick={ () => handleCopyClick(email) } className='ml-1'>
          <Image
              src="/copy.svg"
              alt=""
              width={12}
              height={12}
          />
        </button>
      </div>;
  },
  },

  {
    accessorKey: "action",
    header: ({ column }) => {
      return <ColumnHeader name="Action" column={column} />;
    },cell: ({}) => {
        // TODO: add link to edit contacts modal
        return <div className="font-medium flex items-center space-x-2">
          <span>Edit</span>
          <Image
              src="/edit2.svg"
              alt=""
              width={12}
              height={12}
          />
        </div>;
    },
  },
];
