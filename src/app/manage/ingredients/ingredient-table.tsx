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
import {
  useDeleteIngredientMutation,
  useGetListIngredientMutation,
} from '@/app/queries/useIngredient';
import { GetAllIngredientResType } from '@/app/ValidationSchemas/ingredient.model';
import { Badge } from '@/components/ui/badge';
import AddIngredient from '@/app/manage/ingredients/add-ingredient';
import EditIngredient from '@/app/manage/ingredients/edit-ingredient';

type ingredientItem = GetAllIngredientResType['data'][0];

const ingredientTableContext = createContext<{
  setIngredientIdEdit: (value: number) => void;
  ingredientIdEdit: number | undefined;
  ingredientDelete: ingredientItem | null;
  setIngredientDelete: (value: ingredientItem | null) => void;
}>({
  setIngredientIdEdit: (value: number | undefined) => {},
  ingredientIdEdit: undefined,
  ingredientDelete: null,
  setIngredientDelete: (value: ingredientItem | null) => {},
});

export const columns: ColumnDef<GetAllIngredientResType['data'][0]>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'image',
    header: 'Ảnh',

    cell: ({ row }) => (
      <div>
        <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
          <AvatarImage src={row.original.image || ''} />
          <AvatarFallback className="rounded-none">
            {row.original.name}
          </AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Tên nguyên liệu',
    cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'stock',
    header: 'SL Còn Lại',
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue('stock')}</div>
    ),
  },
  {
    accessorKey: 'unit',
    header: 'Đơn vị tính',
    cell: ({ row }) => (
      <div className="capitalize">
        {
          (row.getValue('unit') as GetAllIngredientResType['data'][0]['unit'])
            .name
        }
      </div>
    ),
  },
  {
    accessorKey: 'isActive',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const publishedAt = row.getValue('isActive');
      const isPublic = Boolean(publishedAt);

      return (
        <span
          className={`px-2 py-1 flex items-center justify-center rounded-full text-center text-xs font-semibold `}
        >
          {isPublic ? (
            <Badge>Đang hoạt động</Badge>
          ) : (
            <Badge>Chưa hoạt động</Badge>
          )}
        </span>
      );
    },
  },

  {
    accessorKey: 'minStock',
    header: 'Mức Cảnh Báo',
    cell: ({ row }) => {
      return (
        <div className="capitalize">{`${row.getValue('minStock')} ${row.original.unit.name}`}</div>
      );
      // const isPublic = Boolean(publishedAt);

      // return (
      //   <span
      //     className={`px-2 py-1 flex items-center justify-center rounded-full text-center text-xs font-semibold `}
      //   >
      //     {isPublic ? <LockKeyholeOpen /> : <LockKeyhole />}
      //   </span>
      // );
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
      const { setIngredientIdEdit, setIngredientDelete } = useContext(
        ingredientTableContext,
      );
      const openEditIngredient = () => {
        setIngredientIdEdit(row.original.id);
      };

      const openDeleteIngredient = () => {
        setIngredientDelete(row.original);
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
            <DropdownMenuItem onClick={openEditIngredient}>
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteIngredient}>
              Xóa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteIngredient}>
              Xem chi tiết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function AlertDialogDeleteDish({
  ingredientDelete,
  setIngredientDelete,
}: {
  ingredientDelete: ingredientItem | null;
  setIngredientDelete: (value: ingredientItem | null) => void;
}) {
  const { mutateAsync } = useDeleteIngredientMutation();
  const deleteIngredientDelete = async () => {
    console.log('hihi');

    if (ingredientDelete) {
      try {
        await mutateAsync(ingredientDelete.id);
        setIngredientDelete(null);
        toast.success('Xóa nguyên liệu thành công', {
          hideProgressBar: true,
          autoClose: 1000,
        });
      } catch (error) {
        throw error;
      }
    }
  };
  return (
    <AlertDialog
      open={Boolean(ingredientDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setIngredientDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa nguyên liệu?</AlertDialogTitle>
          <AlertDialogDescription>
            Món{' '}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {ingredientDelete && ingredientDelete?.name}
            </span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteIngredientDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10;
export default function IngredientTable() {
  const searchParam = useSearchParams();
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1;
  const pageIndex = page - 1;
  const [ingredientIdEdit, setIngredientIdEdit] = useState<
    number | undefined
  >();
  const [ingredientDelete, setIngredientDelete] =
    useState<ingredientItem | null>(null);
  let data: any = [];
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  // const dataProducts = useGetProductListManager({
  //   limit: PAGE_SIZE,
  //   page: pageIndex + 1,
  //   orderBy: 'desc',
  //   sortBy: 'createdAt',
  // });
  // data = dataProducts.data?.payload?.data || [];

  const dataIngredients = useGetListIngredientMutation();
  data = dataIngredients.data?.payload?.data || [];
  const table = useReactTable({
    data: data || [],
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
    <ingredientTableContext.Provider
      value={{
        ingredientDelete,
        setIngredientDelete,
        ingredientIdEdit,
        setIngredientIdEdit,
      }}
    >
      <div className="w-full">
        <EditIngredient id={ingredientIdEdit} setId={setIngredientIdEdit} />
        <AlertDialogDeleteDish
          ingredientDelete={ingredientDelete}
          setIngredientDelete={setIngredientDelete}
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
            <AddIngredient />
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
            <strong>{dataIngredients.data?.payload?.data.length}</strong> kết
            quả
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
    </ingredientTableContext.Provider>
  );
}
