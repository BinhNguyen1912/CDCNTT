/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useContext } from 'react';
import {
  formatCurrency,
  formatDateTimeToLocaleString,
  getVietnameseOrderStatus,
  simpleMatchText,
} from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { OrderTableContext } from '@/app/manage/orders/order-table';
import OrderGuestDetail from '@/app/manage/orders/order-guest-detail';
import {
  OrderStatus,
  OrderStatusValues,
  OrderType,
} from '@/app/constants/type';
import { OrdersListResType } from '@/app/ValidationSchemas/order.schema';

type OrderItem = OrdersListResType['data'][0];
const orderTableColumns: ColumnDef<OrderItem>[] = [
  {
    accessorKey: 'tableNodeId',
    header: 'Bàn',
    cell: ({ row }) => <div>{row.getValue('tableNodeId')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(
        String(row.getValue(columnId)),
        String(filterValue),
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Loại',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const getTypeLabel = (type: string) => {
        switch (type) {
          case OrderType.AT_TABLE:
            return 'Tại bàn';
          case OrderType.ONLINE:
            return 'Online';
          case OrderType.RESERVATION:
            return 'Đặt trước';
          default:
            return type;
        }
      };

      const getTypeVariant = (type: string) => {
        switch (type) {
          case OrderType.AT_TABLE:
            return 'default';
          case OrderType.ONLINE:
            return 'secondary';
          case OrderType.RESERVATION:
            return 'outline';
          default:
            return 'default';
        }
      };

      return <Badge variant={getTypeVariant(type)}>{getTypeLabel(type)}</Badge>;
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(
        String(row.getValue(columnId)),
        String(filterValue),
      );
    },
  },
  {
    id: 'guestName',
    header: 'Khách hàng',
    cell: function Cell({ row }) {
      const { orderObjectByGuestId, refetchOrderList } =
        useContext(OrderTableContext);
      const guest = row.original.guest;
      return (
        <div>
          {!guest && (
            <div>
              <span>Đã bị xóa</span>
            </div>
          )}
          {guest && (
            <Popover>
              <PopoverTrigger>
                <div>
                  <span>{guest.name}</span>
                  <span className="font-semibold">(#{guest.id})</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] sm:w-[440px]">
                <OrderGuestDetail
                  guest={guest}
                  orders={orderObjectByGuestId[guest.id]}
                  refetch={refetchOrderList}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true;
      return simpleMatchText(
        row.original.guest?.name ?? 'Đã bị xóa',
        String(filterValue),
      );
    },
  },
  {
    id: 'dishName',
    header: 'Món ăn',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Image
              src={row.original.items[0].product.images[0]}
              alt={row.original.items[0].productName}
              width={50}
              height={50}
              className="rounded-md object-cover w-[50px] h-[50px] cursor-pointer"
            />
          </PopoverTrigger>
          <PopoverContent>
            <div className="flex flex-wrap gap-2">
              <Image
                src={row.original.items[0].product.images[0]}
                alt={row.original.items[0].productName}
                width={100}
                height={100}
                className="rounded-md object-cover w-[100px] h-[100px]"
              />
              <div className="space-y-1 text-sm">
                <h3 className="font-semibold">
                  {row.original.items[0].productName}-
                  {row.original.items[0].skuValue}
                </h3>
                <div className="italic">
                  {formatCurrency(row.original.items[0].skuPrice)}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span>
              {' '}
              {row.original.items[0].productName}-
              {row.original.items[0].skuValue}
            </span>
            <Badge className="px-1" variant={'secondary'}>
              x{row.original.items[0].quantity}
            </Badge>
          </div>
          <span className="italic">
            {formatCurrency(
              row.original.items[0].skuPrice * row.original.items[0].quantity,
            )}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: function Cell({ row }) {
      const { changeStatus } = useContext(OrderTableContext);
      const changeOrderStatus = async (
        status: (typeof OrderStatusValues)[number],
      ) => {
        changeStatus({
          orderId: row.original.id,
          dishId: row.original.items[0].skuId,
          status: status,
          quantity: row.original.items[0].quantity,
        });
      };
      return (
        <Select
          onValueChange={(value: (typeof OrderStatusValues)[number]) => {
            changeOrderStatus(value);
          }}
          defaultValue={OrderStatus.PENDING}
          value={row.getValue('status')}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            {OrderStatusValues.map((status) => (
              <SelectItem key={status} value={status}>
                {getVietnameseOrderStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },
  {
    id: 'orderHandlerName',
    header: 'Người xử lý',
    cell: ({ row }) => <div>{row.original.createdBy?.name}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: () => <div>Tạo/Cập nhật</div>,
    cell: ({ row }) => (
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-4">
          {formatDateTimeToLocaleString(row.getValue('createdAt'))}
        </div>
        <div className="flex items-center space-x-4">
          {formatDateTimeToLocaleString(
            row.original.updatedAt as unknown as string,
          )}
        </div>
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setOrderIdEdit } = useContext(OrderTableContext);
      const openEditOrder = () => {
        setOrderIdEdit(row.original.id);
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
            <DropdownMenuItem onClick={openEditOrder}>Sửa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default orderTableColumns;
