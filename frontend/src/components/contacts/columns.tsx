import { ColumnDef } from "@tanstack/react-table";
import { ColumnHeader } from "@/components/ui/columnHeader";
import { Contact } from "@/types";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

// handler to copy the email to clipboard
const handleCopyClick = (text: string) => {
  navigator.clipboard.writeText(text);
};

// Function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

// Function to get avatar background color based on id or name
const getAvatarBgColor = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorOptions = [
    "77B257",
    "1B3520",
    "2B3E1B",
    "B9E89E",
    "2D7A14",
    "145C3E",
    "48894B",
    "152D1A",
    "578240",
    "AADDAA",
    "8ACB65",
  ];
  const colorIndex = Math.abs(hash) % colorOptions.length;
  return colorOptions[colorIndex];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const columns = (router: any): ColumnDef<Contact>[] => [
  {
    accessorKey: "initials",
    header: () => <></>,
    cell: ({ row }) => {
      const contact = row.original;
      const initials = getInitials(contact.name);
      const bgColor = getAvatarBgColor(contact.id || contact.name);

      return (
        <div
          className="h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: `#${bgColor}` }}
        >
          {initials}
        </div>
      );
    },
  },
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
      if (email !== "") {
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
      } else {
        <div></div>;
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
          {`${(createdAt.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${createdAt
            .getDate()
            .toString()
            .padStart(2, "0")}/${createdAt.getFullYear()}`}
        </div>
      );
    },
  },
  {
    accessorKey: "view",
    header: () => <></>,
    cell: ({ row }) => (
      <ChevronRight
        className="cursor-pointer"
        onClick={() =>
          router.push(`/contacts/details?contactId=${row.original.id}`)
        }
      />
    ),
  },
];
