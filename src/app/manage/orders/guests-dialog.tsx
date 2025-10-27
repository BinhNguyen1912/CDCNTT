'use client';
import { useEffect, useState } from 'react';
import { endOfDay, format, startOfDay } from 'date-fns';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import AutoPagination from '@/components/auto-pagination';

// Utils and Services
import { formatDateTimeToLocaleString, simpleMatchText } from '@/lib/utils';
import { GuestListType } from '@/app/ValidationSchemas/guest.schema';
import { useGetGuestListQuery } from '@/app/queries/useAccount';

type GuestItem = GuestListType['data'][0];

// Constants
const PAGE_SIZE = 10;
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());

// Table columns definition
export const columns: ColumnDef<GuestItem>[] = [
  {
    accessorKey: 'name',
    header: 'Tên khách',
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue('name')} | (#{row.original.id})
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(
        row.original.name + String(row.original.id),
        String(filterValue),
      );
    },
  },
  {
    accessorKey: 'tableNode',
    header: 'Bàn',
    cell: ({ row }) => (
      <div className="capitalize">{row.original.tableNode?.name || 'N/A'}</div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(
        String(row.original.tableNode?.name || ''),
        String(filterValue),
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Ngày tạo',
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDateTimeToLocaleString(row.getValue('createdAt'))}
      </div>
    ),
  },
];

export default function GuestsDialog({
  onChoose,
}: {
  onChoose: (guest: GuestItem) => void;
}) {
  // State management
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);

  // API call
  const { data: dataGuests, isLoading } = useGetGuestListQuery({
    limit: 10,
    page: 1,
  });

  // Data processing
  const data: GuestItem[] = dataGuests?.payload?.data || [];

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  // Table setup
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  // Effects
  useEffect(() => {
    table.setPagination({
      pageIndex: 0,
      pageSize: PAGE_SIZE,
    });
  }, [table]);

  // Utility functions
  const choose = (guest: GuestItem) => {
    onChoose(guest);
    setOpen(false);
  };

  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Chọn khách</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>Chọn khách hàng</DialogTitle>
        </DialogHeader>

        <div className="w-full">
          {/* Date Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center">
              <span className="mr-2">Từ</span>
              <Input
                type="datetime-local"
                placeholder="Từ ngày"
                className="text-sm"
                value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setFromDate(new Date(event.target.value))}
              />
            </div>
            <div className="flex items-center">
              <span className="mr-2">Đến</span>
              <Input
                type="datetime-local"
                placeholder="Đến ngày"
                value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setToDate(new Date(event.target.value))}
              />
            </div>
            <Button variant="outline" onClick={resetDateFilter}>
              Reset
            </Button>
          </div>

          {/* Table Filters */}
          <div className="flex items-center py-4 gap-2">
            <Input
              placeholder="Tên hoặc ID"
              value={
                (table.getColumn('name')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className="w-[170px]"
            />
            <Input
              placeholder="Tên bàn"
              value={
                (table.getColumn('tableNode')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('tableNode')?.setFilterValue(event.target.value)
              }
              className="w-[120px]"
            />
          </div>
          {/* Guests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => choose(row.original)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Không có khách hàng nào.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* Pagination */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="text-xs text-muted-foreground py-4 flex-1">
              Hiển thị{' '}
              <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
              <strong>{data.length}</strong> kết quả
            </div>
            <div>
              <AutoPagination
                page={table.getState().pagination.pageIndex + 1}
                pageSize={table.getPageCount()}
                onClick={(pageNumber) => {
                  table.setPagination({
                    pageIndex: pageNumber - 1,
                    pageSize: PAGE_SIZE,
                  });
                }}
                isLink={false}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
