import { Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Pagination } from "@/types"
import { useEffect } from "react"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pagination: Pagination
  setPagination: (pag: Pagination) => void
  total_count: number
}

export function DataTablePagination<TData>({
  table,
  pagination,
  setPagination,
  total_count
}: DataTablePaginationProps<TData>) {
    useEffect(() => {
        setPagination({...pagination, page: table.getState().pagination.pageIndex});
    }, [table.getState().pagination.pageIndex]);

    useEffect(() => {
        setPagination({...pagination, limit: table.getState().pagination.pageSize})
    }, [table.getState().pagination.pageSize])

    return (
        <div className="flex items-center justify-end px-2">
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={`${pagination.limit}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pagination.limit} />
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
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {getNumberPages(pagination, total_count)}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Button>
                </div>
            </div>
        </div>
    )
}

function getNumberPages(pagination: Pagination, total_count: number) : number{
    if (pagination.limit <= 0) return 0;
    return Math.ceil(total_count / pagination.limit);
}

// TODO: add functions for canGetNextPage and canGetPreviousPage
