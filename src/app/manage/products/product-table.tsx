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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createContext, useContext, useEffect, useState } from 'react';
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
import {
  formatCurrency,
  getVietnameseDishStatus,
  handleErrorApi,
} from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import AutoPagination from '@/components/auto-pagination';
import EditDish from '@/app/manage/products/edit-product';
import AddDish from '@/app/manage/products/add-product';
import { toast } from 'react-toastify';
import {
  useDeleteDishMutation,
  useDeleteProductMutation,
  useGetProductListManager,
} from '@/app/queries/useProducts';
import { GetListProductsResType } from '@/app/ValidationSchemas/product.schema';
import { LockKeyhole, LockKeyholeOpen } from 'lucide-react';

type ProductItem = GetListProductsResType['data'][0];

const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void;
  dishIdEdit: number | undefined;
  dishDelete: ProductItem | null;
  setDishDelete: (value: ProductItem | null) => void;
}>({
  setDishIdEdit: (value: number | undefined) => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: (value: ProductItem | null) => {},
});

export const columns: ColumnDef<GetListProductsResType['data'][0]>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'images',
    header: 'Ảnh',

    cell: ({ row }) => (
      <div>
        <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
          <AvatarImage src={row.original.images[0]} />
          <AvatarFallback className="rounded-none">
            {row.original.name}
          </AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Tên',
    cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'basePrice',
    header: 'Giá Gốc',
    cell: ({ row }) => (
      <div className="capitalize">
        {formatCurrency(row.getValue('basePrice'))}
      </div>
    ),
  },
  {
    accessorKey: 'virtualPrice',
    header: 'Giá Hiển Thị',
    cell: ({ row }) => (
      <div className="capitalize">
        {formatCurrency(row.getValue('virtualPrice'))}
      </div>
    ),
  },

  {
    accessorKey: 'publishedAt',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const publishedAt = row.getValue('publishedAt') as
        | string
        | null
        | undefined;
      const isPublic = Boolean(publishedAt);

      return (
        <span
          className={`px-2 py-1 flex items-center justify-center rounded-full text-center text-xs font-semibold `}
        >
          {isPublic ? <LockKeyholeOpen /> : <LockKeyhole />}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdBy',
    header: 'Người tạo',
    cell: ({ row }) => <div> {row.original.createdBy?.name}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setDishIdEdit, setDishDelete } = useContext(DishTableContext);
      const openEditDish = () => {
        setDishIdEdit(row.original.id);
      };

      const openDeleteDish = () => {
        setDishDelete(row.original);
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
            <DropdownMenuItem onClick={openEditDish}>Sửa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteDish}>Xóa</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteDish}>
              Xem chi tiết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete,
}: {
  dishDelete: ProductItem | null;
  setDishDelete: (value: ProductItem | null) => void;
}) {
  const { mutateAsync } = useDeleteProductMutation();
  const deleteDish = async () => {
    console.log('hihi');

    if (dishDelete) {
      try {
        await mutateAsync(dishDelete.id);
        setDishDelete(null);
        toast.success('Xóa món thành coong');
      } catch (error) {
        throw error;
      }
    }
  };
  return (
    <AlertDialog
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa món ăn?</AlertDialogTitle>
          <AlertDialogDescription>
            Món{' '}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {dishDelete && dishDelete?.name}
            </span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteDish}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10;
export default function DishTable() {
  const searchParam = useSearchParams();
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1;
  const pageIndex = page - 1;
  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>();
  const [dishDelete, setDishDelete] = useState<ProductItem | null>(null);
  // let data: GetListProductsResType = [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const dataProducts =
    useGetProductListManager({
      limit: PAGE_SIZE,
      page: pageIndex + 1,
      orderBy: 'desc',
      sortBy: 'createdAt',
    }).data?.payload.data || [];
  // data = dataProducts || [];

  const table = useReactTable({
    data: dataProducts || [],
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

  return (
    <DishTableContext.Provider
      value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}
    >
      <div className="w-full">
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish
          dishDelete={dishDelete}
          setDishDelete={setDishDelete}
        />
        <div className="flex items-center py-4">
          <Input
            placeholder="Lọc tên"
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="ml-auto flex items-center gap-2">
            <AddDish />
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
            <TableBody className="text-center">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
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
            <strong>{dataProducts?.length}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/dishes"
            />
          </div>
        </div>
      </div>
    </DishTableContext.Provider>
  );
}
