import React from "react";
import { Column } from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./button";

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
