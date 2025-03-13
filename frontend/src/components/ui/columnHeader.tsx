import React from "react";
import { Column } from "@tanstack/react-table";
import { Button } from "./button";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";

type ColumnHeaderProps<T extends object> = {
  column: Column<T>;
  name: string;
  className?: string;
};

const ColumnHeader = <T extends object>({
  column,
  name,
  className,
}: ColumnHeaderProps<T>) => {
  return (
    <div className={className}>
      <Button
        className="font-bold"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {name}
        {column.getIsSorted() == "asc" ? <ChevronUp /> : <ChevronDown />}
      </Button>
    </div>
  );
};

export { ColumnHeader };
