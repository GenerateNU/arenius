import { PaginationState, Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination: PaginationState;
  total_count: number;
}
import { useTransactionsContext } from "@/context/TableContext"; // Ensure correct path

export function DataTablePagination<TData>({
  table,
  total_count,
}: DataTablePaginationProps<TData>) {
  const {
    activePage: activeTable,
    pageIndex: page,
    pageSize: pageLimit,
    setPage,
  } = useTransactionsContext();

  return (
    <div className="flex items-center justify-end px-2 mt-4">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageLimit[activeTable]}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value)); // Update TanStack table state
              setPage(activeTable, 1); // Reset to first page
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageLimit[activeTable]} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100, 200].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {page[activeTable]} of{" "}
          {getNumberPages(pageLimit[activeTable], total_count)}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => setPage(activeTable, 1)}
            disabled={page[activeTable] === 1}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(activeTable, page[activeTable] - 1)}
            disabled={page[activeTable] === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setPage(activeTable, page[activeTable] + 1)}
            disabled={page[activeTable] * pageLimit[activeTable] >= total_count}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() =>
              setPage(
                activeTable,
                getNumberPages(pageLimit[activeTable], total_count)
              )
            }
            disabled={page[activeTable] * pageLimit[activeTable] >= total_count}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getNumberPages(pageSize: number, total_count: number): number {
  console.log("total_count", total_count);
  console.log("pageSize", pageSize);
  console.log("total_count / pageSize", total_count / pageSize);
  return Math.ceil(total_count / pageSize);
}
