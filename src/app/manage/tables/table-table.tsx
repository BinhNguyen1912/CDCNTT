/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
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
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createContext, useContext, useEffect, useState } from 'react';

import { getVietnameseTableStatus, handleErrorApi } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import AutoPagination from '@/components/auto-pagination';
import EditTable from '@/app/manage/tables/edit-table';
// import AddTable from '@/app/manage/tables/add-table';
import { TableNodeType } from '@/app/ValidationSchemas/table-node.schema';
import { useDeleteTableNodeMutation } from '@/app/queries/useTableNode';
import QrCodeTable from '@/components/qrcode-table';
import { toast } from 'react-toastify';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useListArea } from '@/app/queries/useArea';
import {
  useListTableNode,
  useUpdateTableNodeMutation,
} from '@/app/queries/useTableNode';
import { Wrench, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type TableItem = TableNodeType;

const TableTableContext = createContext<{
  setTableIdEdit: (value: number) => void;
  tableIdEdit: number | undefined;
  tableDelete: TableItem | null;
  setTableDelete: (value: TableItem | null) => void;
}>({
  setTableIdEdit: (value: number | undefined) => {},
  tableIdEdit: undefined,
  tableDelete: null,
  setTableDelete: (value: TableItem | null) => {},
});

export const columns: ColumnDef<TableItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div>{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Tên bàn',
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'seats',
    header: 'Số ghế',
    cell: ({ row }) => <div>{row.getValue('seats')}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => (
      <div>{getVietnameseTableStatus(row.getValue('status'))}</div>
    ),
  },
  {
    accessorKey: 'token',
    header: 'QR Code',
    cell: ({ row }) => (
      <QrCodeTable
        tableNumber={row.original.id}
        token={row.getValue('token')}
        tableName={row.original.name}
      />
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setTableIdEdit, setTableDelete } = useContext(TableTableContext);
      const openEditTable = () => {
        setTableIdEdit(row.original.id);
      };
      const openDeleteTable = () => {
        setTableDelete(row.original);
      };
      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditTable}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteTable}>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function AlertDialogDeleteTable({
  tableDelete,
  setTableDelete,
}: {
  tableDelete: TableItem | null;
  setTableDelete: (value: TableItem | null) => void;
}) {
  const { mutateAsync } = useDeleteTableNodeMutation();
  const deleteTable = async () => {
    if (tableDelete) {
      try {
        const result = await mutateAsync(tableDelete.id);
        setTableDelete(null);
        toast.success('Xóa bàn thành công', {
          hideProgressBar: true,
          autoClose: 1000,
        });
      } catch (error) {
        handleErrorApi({
          error,
        });
      }
    }
  };
  return (
    <AlertDialog
      open={Boolean(tableDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setTableDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa bàn ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Bàn{' '}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {tableDelete?.id}
            </span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteTable}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10;
export default function TableTable() {
  const searchParam = useSearchParams();
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1;
  const pageIndex = page - 1;
  const [tableIdEdit, setTableIdEdit] = useState<number | undefined>();
  const [tableDelete, setTableDelete] = useState<TableItem | null>(null);
  const [showChangeTokenDialog, setShowChangeTokenDialog] = useState(false);
  // --- Add area filter state ---
  const [areaId, setAreaId] = useState<number | undefined>(undefined);
  const areaListQuery = useListArea();
  // Use useListTableNode instead of useListTable
  const tableNodeQuery = useListTableNode(areaId ? { areaId } : undefined);
  const dataTableTable = tableNodeQuery.data?.payload?.data ?? [];
  const data = dataTableTable.filter(
    (item) => item.type == 'ROUND' || item.type == 'SQUARE',
  );

  // Mutation để update token
  const updateTableNodeMutation = useUpdateTableNodeMutation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });
  const route = useRouter();
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

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE,
    });
  }, [table, pageIndex]);

  // In the TableTable component, add a handler for row click to open edit dialog
  const handleRowClick = (row: TableItem) => {
    setTableIdEdit(row.id);
  };

  // Handler để đổi token cho tất cả các bàn
  const handleChangeAllTokens = async () => {
    try {
      // Lấy tất cả các bàn (không filter theo area)
      const allTables = tableNodeQuery.data?.payload?.data ?? [];
      const tablesToUpdate = allTables.filter(
        (item) => item.type == 'ROUND' || item.type == 'SQUARE',
      );

      if (tablesToUpdate.length === 0) {
        toast.warning('Không có bàn nào để cập nhật token', {
          hideProgressBar: true,
          autoClose: 2000,
        });
        return;
      }

      // Update từng bàn với changeToken: true
      const updatePromises = tablesToUpdate.map((table) =>
        updateTableNodeMutation.mutateAsync({
          id: table.id,
          changeToken: true,
          name: table.name, // Giữ nguyên name
          seats: table.seats, // Giữ nguyên seats
          areaId: table.areaId, // Giữ nguyên areaId
          status: table.status, // Giữ nguyên status
          type: table.type, // Giữ nguyên type
          positionX: table.positionX, // Giữ nguyên positionX
          positionY: table.positionY, // Giữ nguyên positionY
          width: table.width, // Giữ nguyên width
          height: table.height, // Giữ nguyên height
          rotation: table.rotation, // Giữ nguyên rotation
          imageUrl: table.imageUrl, // Giữ nguyên imageUrl
          layoutId: table.layoutId, // Giữ nguyên layoutId
        }),
      );

      await Promise.all(updatePromises);

      toast.success(
        `Đã cập nhật token cho ${tablesToUpdate.length} bàn thành công!`,
        {
          hideProgressBar: true,
          autoClose: 3000,
        },
      );
      setShowChangeTokenDialog(false);
    } catch (error) {
      handleErrorApi({ error });
    }
  };

  return (
    <TableTableContext.Provider
      value={{ tableIdEdit, setTableIdEdit, tableDelete, setTableDelete }}
    >
      <div className="w-full">
        <EditTable id={tableIdEdit} setId={setTableIdEdit} />
        <AlertDialogDeleteTable
          tableDelete={tableDelete}
          setTableDelete={setTableDelete}
        />
        {/* Dialog xác nhận đổi token */}
        <AlertDialog
          open={showChangeTokenDialog}
          onOpenChange={setShowChangeTokenDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Đổi token cho tất cả bàn?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn đổi token cho tất cả các bàn ăn? Hành động
                này sẽ làm vô hiệu tất cả các QR code hiện tại và tạo QR code
                mới cho tất cả các bàn.
                <br />
                <br />
                <strong>
                  Lưu ý: Khách hàng đang sử dụng QR code cũ sẽ không thể đặt món
                  được nữa.
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleChangeAllTokens}
                disabled={updateTableNodeMutation.isPending}
              >
                {updateTableNodeMutation.isPending
                  ? 'Đang xử lý...'
                  : 'Xác nhận'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center py-4 gap-4 justify-between">
          <div className="flex items-center gap-4 py-4">
            {' '}
            <Input
              placeholder="Lọc số bàn"
              value={
                (table.getColumn('name')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('name')?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
            {/* Area filter combobox */}
            <Select
              value={areaId?.toString() ?? 'all'}
              onValueChange={(v) =>
                setAreaId(v === 'all' ? undefined : Number(v))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                {areaListQuery.data?.payload?.data?.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowChangeTokenDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={updateTableNodeMutation.isPending}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  updateTableNodeMutation.isPending ? 'animate-spin' : ''
                }`}
              />
              Đổi Token
            </Button>
            <Link
              href="/manage/setting-table"
              className="flex items-center gap-2 bg-black/90 text-white border rounded-md px-4 py-2 hover:bg-gray-100 hover:text-black"
            >
              <Wrench className="w-4 h-4" /> Thiết kế bàn ăn
            </Link>
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-center">
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
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className="cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
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
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            Hiển thị{' '}
            <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
            <strong>{data.length}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/tables"
            />
          </div>
        </div>
      </div>
    </TableTableContext.Provider>
  );
}
