import { Fragment, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  OrderStatusIcon,
  cn,
  formatCurrency,
  getVietnameseOrderStatus,
} from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import {
  ServingGuestByTableNumber,
  Statics,
  StatusCountObject,
} from '@/app/manage/orders/order-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import OrderGuestDetail from '@/app/manage/orders/order-guest-detail';
import { TableNodeType } from '@/app/ValidationSchemas/table-node.schema';
import { OrderStatus, OrderStatusValues } from '@/app/constants/type';
import { useListTableNode } from '@/app/queries/useTableNode';
import { OrdersListResType } from '@/app/ValidationSchemas/order.schema';
import { useGetOrderListQuery } from '@/app/queries/useOrder';
import { endOfDay, startOfDay } from 'date-fns';

export default function OrderStatics({
  statics,
  tableNodeList,
  servingGuestByTableNumber = {},
  dataOrder,
}: {
  statics?: Statics;
  tableNodeList?: TableNodeType[];
  servingGuestByTableNumber?: ServingGuestByTableNumber;
  dataOrder?: OrdersListResType['data'];
}) {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  // Query để lấy đơn hàng theo tableNodeId
  const { data: tableOrdersData, isLoading: isLoadingTableOrders } =
    useGetOrderListQuery(
      selectedTableId
        ? {
            tableNodeId: selectedTableId,
            page: 1,
            limit: 100,
            fromDate: startOfDay(new Date()),
            toDate: endOfDay(new Date()),
          }
        : undefined,
    );

  // Fetch tableNode data nếu không được truyền vào
  const { data: fetchedTableNodeData, isLoading, error } = useListTableNode();
  const tableList = tableNodeList || fetchedTableNodeData?.payload?.data || [];

  // console.log('OrderStatics Render Debug:', {
  //   tableListLength: tableList.length,
  //   tableList: tableList.map((t) => ({ id: t.id, name: t.name, type: t.type })),
  //   filteredTables: tableList.filter((table) =>
  //     ['TABLE', 'SQUARE', 'ROUND'].includes(table.type),
  //   ),
  //   statics,
  //   servingGuestByTableNumber,
  //   dataOrderLength: dataOrder?.length || 0,
  // });

  const toatalRevenue = useMemo(() => {
    return (
      dataOrder?.reduce((acc, order) => {
        if (
          order.status === OrderStatus.COMPLETED ||
          order.status === OrderStatus.PAID
        ) {
          const orderTotal = order.items.reduce((itemAcc, item) => {
            return itemAcc + item.skuPrice * item.quantity;
          }, 0);
          return acc + orderTotal;
        }
        return acc;
      }, 0) || 0
    );
  }, [dataOrder]);

  const getTableNumber = (tableName: string): number => {
    const match = tableName.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Helper function để nhóm đơn hàng theo guestId
  const groupOrdersByGuest = (orders: any[]) => {
    return orders.reduce((acc: any, order: any) => {
      // Kiểm tra xem order có guestId không
      if (order.guestId) {
        if (!acc[order.guestId]) {
          acc[order.guestId] = [];
        }
        acc[order.guestId].push(order);
      } else if (order.guest?.id) {
        // Nếu guestId không có nhưng có guest object
        const guestId = order.guest.id;
        if (!acc[guestId]) {
          acc[guestId] = [];
        }
        acc[guestId].push(order);
      }
      return acc;
    }, {});
  };

  return (
    <Fragment>
      <Dialog
        open={Boolean(selectedTableId)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTableId(null);
          }
        }}
      >
        <DialogContent className="max-h-full overflow-auto">
          {selectedTableId && (
            <DialogHeader>
              <DialogTitle>Đơn hàng tại bàn {selectedTableId}</DialogTitle>
            </DialogHeader>
          )}
          <div>
            {isLoadingTableOrders ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-sm text-muted-foreground">
                  Đang tải đơn hàng...
                </div>
              </div>
            ) : tableOrdersData?.payload?.data?.length ? (
              (() => {
                const orders = tableOrdersData.payload.data;

                // Debug log để kiểm tra cấu trúc dữ liệu
                console.log('Full API response:', tableOrdersData);
                console.log('Orders array:', orders);

                if (!orders || orders.length === 0) {
                  return (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Không có đơn hàng
                    </div>
                  );
                }

                const groupedOrders = groupOrdersByGuest(orders);
                const guestOrderGroups = Object.values(groupedOrders);

                // Debug log
                console.log('Grouped orders:', groupedOrders);
                console.log('Guest order groups:', guestOrderGroups);

                if (guestOrderGroups.length === 0) {
                  return (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      Không tìm thấy thông tin khách hàng trong đơn hàng
                    </div>
                  );
                }

                return guestOrderGroups.map(
                  (guestOrders: any, index: number) => {
                    const ordersArray = guestOrders as any[];
                    console.log('Processing guest orders:', ordersArray);

                    if (!ordersArray || ordersArray.length === 0) return null;

                    const firstOrder = ordersArray[0];

                    return (
                      <div
                        key={`guest-${firstOrder.guestId || firstOrder.guest?.id || index}`}
                      >
                        <OrderGuestDetail
                          guest={firstOrder.guest as any}
                          orders={ordersArray as any}
                          refetch={() => {
                            // Refetch orders by table
                            window.location.reload();
                          }}
                        />
                        {index !== guestOrderGroups.length - 1 && (
                          <Separator className="my-5" />
                        )}
                      </div>
                    );
                  },
                );
              })()
            ) : (
              <div className="flex justify-center items-center py-8">
                <div className="text-sm text-muted-foreground">
                  Không có đơn hàng nào tại bàn này
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-muted-foreground">
            Đang tải danh sách bàn...
          </div>
        </div>
      ) : tableList.length === 0 ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-muted-foreground">Không có bàn nào</div>
        </div>
      ) : (
        <div className="flex justify-start items-stretch gap-4 flex-wrap py-4">
          {tableList
            .filter((table) =>
              ['TABLE', 'SQUARE', 'ROUND'].includes(table.type),
            )
            .map((table) => {
              const tableNumber: number = getTableNumber(table.name);
              const tableStatics:
                | Record<number, StatusCountObject>
                | undefined = statics?.table?.[tableNumber];
              let isEmptyTable = true;
              let countObject: StatusCountObject = {
                PENDING: 0,
                CONFIRMED: 0,
                PREPARING: 0,
                COMPLETED: 0,
                CANCELLED: 0,
                READY: 0,
              } as any;
              const servingGuestCount = Object.values(
                servingGuestByTableNumber[tableNumber] ?? [],
              ).length;

              if (tableStatics) {
                for (const guestId in tableStatics) {
                  const guestStatics = tableStatics[Number(guestId)] as any;
                  if (
                    [
                      guestStatics.PENDING,
                      guestStatics.CONFIRMED,
                      guestStatics.PREPARING,
                    ].some(
                      (status: number | undefined) =>
                        status !== 0 && status !== undefined,
                    )
                  ) {
                    isEmptyTable = false;
                  }
                  countObject = {
                    PENDING: countObject.PENDING + (guestStatics.PENDING ?? 0),
                    CONFIRMED:
                      countObject.CONFIRMED + (guestStatics.CONFIRMED ?? 0),
                    PREPARING:
                      countObject.PREPARING + (guestStatics.PREPARING ?? 0),
                    COMPLETED:
                      countObject.COMPLETED + (guestStatics.COMPLETED ?? 0),
                    CANCELLED:
                      countObject.CANCELLED + (guestStatics.CANCELLED ?? 0),
                    READY: countObject.READY + (guestStatics.READY ?? 0),
                  } as any;
                }
              }

              return (
                <div
                  key={table.id}
                  className={cn(
                    'text-sm flex items-stretch gap-2 border p-2 rounded-md cursor-pointer transition-colors',
                    {
                      'bg-secondary': !isEmptyTable,
                      'border-transparent': !isEmptyTable,
                      'hover:bg-muted/50': true,
                    },
                  )}
                  onClick={() => {
                    setSelectedTableId(table.id);
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="font-semibold text-center text-lg">
                      {table.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {table.seats} chỗ
                    </div>
                    {/* <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{servingGuestCount}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Đang phục vụ: {servingGuestCount} khách
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider> */}
                  </div>
                  <Separator
                    orientation="vertical"
                    className={cn('flex-shrink-0 flex-grow h-auto', {
                      'bg-muted-foreground': !isEmptyTable,
                    })}
                  />
                  {isEmptyTable && (
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-xs text-muted-foreground">
                          Trạng thái
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {table.status === 'AVAILABLE'
                            ? 'Trống'
                            : table.status === 'OCCUPIED'
                              ? 'Có khách'
                              : table.status === 'RESERVED'
                                ? 'Đã đặt'
                                : 'Khác'}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {!isEmptyTable && (
                    <div className="flex flex-col gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex gap-2 items-center">
                              <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
                              <span>
                                {countObject[OrderStatus.PENDING] ?? 0}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getVietnameseOrderStatus(OrderStatus.PENDING)}:{' '}
                            {countObject[OrderStatus.PENDING] ?? 0} đơn
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex gap-2 items-center">
                              <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
                              <span>
                                {countObject[OrderStatus.CONFIRMED] ?? 0}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getVietnameseOrderStatus(OrderStatus.CONFIRMED)}:{' '}
                            {countObject[OrderStatus.CONFIRMED] ?? 0} đơn
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="flex gap-2 items-center">
                              <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                              <span>
                                {countObject[OrderStatus.PREPARING] ?? 0}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {getVietnameseOrderStatus(OrderStatus.PREPARING)}:{' '}
                            {countObject[OrderStatus.PREPARING] ?? 0} đơn
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <div className="flex justify-between items-center gap-4 flex-wrap py-4">
        <div>
          {' '}
          {OrderStatusValues.map((status) => (
            <Badge variant="secondary" key={status} className="mr-2">
              {getVietnameseOrderStatus(status)}:{' '}
              {statics?.status?.[status] ?? 0}
            </Badge>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
