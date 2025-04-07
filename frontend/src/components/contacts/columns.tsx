import { ColumnDef } from "@tanstack/react-table";
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
    accessorKey: "name",
    header: ({ column }) => <ColumnHeader name="Contact" column={column} />,
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
      if(email !== ""){
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
    } else{
      <div></div>
    }
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <ColumnHeader name="Created At" column={column} />,
    cell: ({ row }) => {
      const createdAt = new Date(row.getValue("created_at"));
      return (
        <div className="font-medium">
          {`${(createdAt.getMonth() + 1).toString().padStart(2, '0')}/${
            createdAt.getDate().toString().padStart(2, '0')}/${
            createdAt.getFullYear()}`}
        </div>
      );
    },
  },
  {
    accessorKey: "view",
    header: () => <></>,
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
