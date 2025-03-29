import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnHeader } from "@/components/ui/columnHeader";
import { Contact } from "@/types";
import Image from "next/image";

// handler to copy the email to clipboard
const handleCopyClick = (text: string) => {
  navigator.clipboard.writeText(text);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns = (router: any): ColumnDef<Contact>[] => [
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
    header: ({ column }) => <ColumnHeader name="Contact" column={column} />,
  },
  {
    accessorKey: "industry",
    header: ({ column }) => <ColumnHeader name="Title" column={column} />,
    cell: () => <div className="font-medium">Industry/Title</div>,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => <ColumnHeader name="Phone" column={column} />,
  },
  {
    accessorKey: "city",
    header: ({ column }) => <ColumnHeader name="Location" column={column} />,
    cell: ({ row }) => {
      const city = String(row.getValue("city"));
      const state = row.getValue("state");
      return (
        <div className="font-medium">
          {city}
          {state ? `, ${String(state)}` : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "state",
    header: () => <></>,
    cell: () => <></>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <ColumnHeader name="Email" column={column} />,
    cell: ({ row }) => {
      const email = String(row.getValue("email"));
      return (
        <div className="font-medium">
          <span>{email}</span>
          <button
            onClick={() => handleCopyClick(email)}
            className="ml-1"
            title="Copy email to clipboard"
          >
            <Image src="/copy.svg" alt="" width={12} height={12} />
          </button>
        </div>
      );
    },
  },
  {
    accessorKey: "view",
    header: ({ column }) => <ColumnHeader name="View" column={column} />,
    cell: ({ row }) => (
      <Image
        src="/arrow.svg"
        alt="View Contact"
        width={24}
        height={24}
        onClick={() => router.push(`/contacts/details?contactId=${row.original.id}`)}
        style={{ cursor: "pointer" }}
      />
    ),
  },
];
