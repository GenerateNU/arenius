import React from "react";
import { ColumnObject } from "@/types";
import { Column } from "@tanstack/react-table";
import { Button } from "./button";
import Image from "next/image";

type ColumnHeaderProps = {
  column: Column<Object>;
  name: string;
  className?: string;
};

function SortIcon() {
  return <Image src={"sort.svg"} width={20} height={20} alt="Sort column" />;
}

const ColumnHeader = ({ column, name, className }: ColumnHeaderProps) => {
  return (
    <div className={className}>
      <Button
        className="font-bold"
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {name}
        <SortIcon />
      </Button>
    </div>
  );
};

export { ColumnHeader };
