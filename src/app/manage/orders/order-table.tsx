/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AddOrder from '@/app/manage/orders/add-order';
import EditOrder from '@/app/manage/orders/edit-order';
import { createContext, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AutoPagination from '@/components/auto-pagination';
import { getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils';
import OrderStatics from '@/app/manage/orders/order-statics';
import orderTableColumns from '@/app/manage/orders/order-table-columns';
import { useOrderService } from '@/app/manage/orders/order.service';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { endOfDay, format, startOfDay } from 'date-fns';
import { OrderStatusValues } from '@/app/constants/type';
import {
  GetOrdersResType,
  PayGuestOrdersResType,
  UpdateOrderResType,
} from '@/app/schemaValidations/order.schema';
import { Popover } from '@radix-ui/react-popover';
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  useGetOrderListQuery,
  useUpdateOrderMutation,
} from '@/app/queries/useOrder';
import { useListTable } from '@/app/queries/useTable';
import { toast } from 'react-toastify';
import {
  GuestCreateOrdersBodyType,
  GuestCreateOrdersResType,
} from '@/app/schemaValidations/guest.schema';
import TableSkeleton from '@/app/manage/orders/table-skeleton';
import { useAppStore } from '@/components/app-provider';
import NewOrderSound from '@/components/newOrderSound';

export const OrderTableContext = createContext({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setOrderIdEdit: (value: number | undefined) => {},
  orderIdEdit: undefined as number | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeStatus: (payload: {
    orderId: number;
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID,
});

export type StatusCountObject = Record<
  (typeof OrderStatusValues)[number],
  number
>;
export type Statics = {
  status: StatusCountObject;
  table: Record<number, Record<number, StatusCountObject>>;
};
export type OrderObjectByGuestID = Record<number, GetOrdersResType['data']>;
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>;

//Hàm khởi tạo
const PAGE_SIZE = 10;
const initFromDate = startOfDay(new Date());
const initToDate = endOfDay(new Date());
export default function OrderTable() {
  const searchParam = useSearchParams();
  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [fromDate, setFromDate] = useState(initFromDate);
  const [toDate, setToDate] = useState(initToDate);
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1;
  const pageIndex = page - 1;
  const [orderIdEdit, setOrderIdEdit] = useState<number | undefined>();
  const orderListData = useGetOrderListQuery({
    fromDate,
    toDate,
  });
  const refetchOrderList = orderListData.refetch;
  const orderList = orderListData.data?.payload.data || [];
  const tableListData = useListTable();
  const tableList = tableListData.data?.payload.data || [];
  const tableListSortedByNumber = tableList.sort(
    (a: any, b: any) => a.number - b.number
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE, //default page size
  });

  const [hasNewOrder, setHasNewOrder] = useState(false);

  //SOCKET
  const socket = useAppStore((state) => state.socket);

  const { statics, orderObjectByGuestId, servingGuestByTableNumber } =
    useOrderService(orderList);
  const updateOrderMutation = useUpdateOrderMutation();
  const changeStatus = async (body: {
    orderId: number;
    dishId: number;
    status: (typeof OrderStatusValues)[number];
    quantity: number;
  }) => {
    try {
      await updateOrderMutation.mutateAsync(body);
      refetchOrderList();
    } catch (error) {
      handleErrorApi({
        error,
      });
    }
  };

  const table = useReactTable({
    data: orderList,
    columns: orderTableColumns,
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

  const resetDateFilter = () => {
    setFromDate(initFromDate);
    setToDate(initToDate);
  };
  useEffect(() => {
    if (socket?.connected) {
      onConnect();
    }
    function refetch() {
      const now = new Date();
      if (now >= fromDate && now <= toDate) {
        refetchOrderList();
      }
    }
    function onConnect() {
      console.log('connected', socket?.id);
    }
    function onDisconnect() {}
    function onUpdateOrder(data: UpdateOrderResType['data']) {
      console.log('data', data);
      toast.success(
        `Món ăn ${data.dishSnapshot.name} - SL: ${
          data.quantity
        } đã được chuyển sang trạng thái ${getVietnameseOrderStatus(
          data.status
        )}`,
        {
          hideProgressBar: true,
          autoClose: 2000,
          icon: false,
        }
      );
      refetch();
    }
    function onNewOrder(data: GuestCreateOrdersResType['data']) {
      const guest = data[0].guest;
      // báo âm thanh
      setHasNewOrder(true);

      setTimeout(() => setHasNewOrder(false), 1000); // reset để lần sau phát lại

      toast.success(
        `Khách hàng ${guest?.name} vừa đặt ${data.length} món mới tại bàn ${guest?.tableNumber} `,
        {
          hideProgressBar: true,
          autoClose: 2000,
          icon: false,
        }
      );
      refetch();
    }
    function onPayment(data: PayGuestOrdersResType['data']) {
      const guest = data[0].guest;
      toast.success(
        `Khách hàng ${guest?.name} vừa thanh toán ${data.length} món tại bàn ${guest?.tableNumber} `
      );
      refetch();
    }

    socket?.on('new-order', onNewOrder);
    socket?.on('payment', onPayment);
    //lang nghe
    socket?.on('connect', onConnect);
    //huy lang nghe
    socket?.on('disconnect', onDisconnect);

    // socket?.on('update-order', onUpdateOrder);
    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('payment', onPayment);

      // socket?.off('update-order', onUpdateOrder);
      socket?.off('new-order', onNewOrder);
    };
  }, [fromDate, toDate, refetchOrderList, socket]);
  return (
    <OrderTableContext.Provider
      value={{
        orderIdEdit,
        setOrderIdEdit,
        changeStatus,
        orderObjectByGuestId,
      }}
    >
      <div className="w-full">
        <NewOrderSound hasNewOrder={hasNewOrder} />
        <EditOrder
          id={orderIdEdit}
          setId={setOrderIdEdit}
          onSubmitSuccess={() => {
            refetchOrderList();
          }}
        />
        <div className=" flex items-center">
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
            <Button className="" variant={'outline'} onClick={resetDateFilter}>
              Reset
            </Button>
          </div>
          <div className="ml-auto">
            <AddOrder />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 py-4">
          <Input
            placeholder="Tên khách"
            value={
              (table.getColumn('guestName')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('guestName')?.setFilterValue(event.target.value)
            }
            className="max-w-[100px]"
          />
          <Input
            placeholder="Số bàn"
            value={
              (table.getColumn('tableNumber')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('tableNumber')?.setFilterValue(event.target.value)
            }
            className="max-w-[80px]"
          />
          <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStatusFilter}
                className="w-[150px] text-sm justify-between"
              >
                {table.getColumn('status')?.getFilterValue()
                  ? getVietnameseOrderStatus(
                      table
                        .getColumn('status')
                        ?.getFilterValue() as (typeof OrderStatusValues)[number]
                    )
                  : 'Trạng thái'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandGroup>
                  <CommandList>
                    {OrderStatusValues.map((status) => (
                      <CommandItem
                        key={status}
                        value={status}
                        onSelect={(currentValue) => {
                          table
                            .getColumn('status')
                            ?.setFilterValue(
                              currentValue ===
                                table.getColumn('status')?.getFilterValue()
                                ? ''
                                : currentValue
                            );
                          setOpenStatusFilter(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            table.getColumn('status')?.getFilterValue() ===
                              status
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {getVietnameseOrderStatus(status)}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
          dataOrder={orderList}
        />
        {!table && <TableSkeleton />}
        {table && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
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
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={orderTableColumns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="text-xs text-muted-foreground py-4 flex-1 ">
            Hiển thị{' '}
            <strong>{table.getPaginationRowModel().rows.length}</strong> trong{' '}
            <strong>{orderList.length}</strong> kết quả
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname="/manage/orders"
            />
          </div>
        </div>
      </div>
    </OrderTableContext.Provider>
  );
}
