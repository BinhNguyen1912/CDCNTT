/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'react-toastify';
import {
  useDeleteReminder,
  useGetReminderList,
} from '@/app/queries/useReminder';
import { ReminderResType } from '@/app/ValidationSchemas/reminder.schema';
import { Bell, Clock, Calendar, User, Edit, Trash2, Eye } from 'lucide-react';
import EditReminder from '@/app/manage/reminders/edit-reminder';
import { QuickReminderDialog } from '@/components/reminderDialog';
import { RepeatModeType } from '@/app/constants/reminder.constant';
import { useGetRoleListQuery } from '@/app/queries/useRole';

type ReminderItem = ReminderResType;

const ReminderTableContext = createContext<{
  setReminderIdEdit: (value: number) => void;
  reminderIdEdit: number | undefined;
  reminderDelete: ReminderItem | null;
  setReminderDelete: (value: ReminderItem | null) => void;
  reminderViewLogs: ReminderItem | null;
  setReminderViewLogs: (value: ReminderItem | null) => void;
}>({
  setReminderIdEdit: () => {},
  reminderIdEdit: undefined,
  reminderDelete: null,
  setReminderDelete: () => {},
  reminderViewLogs: null,
  setReminderViewLogs: () => {},
});

const getRepeatModeLabel = (mode: string) => {
  const labels: Record<string, string> = {
    [RepeatModeType.ONCE]: 'Một lần',
    [RepeatModeType.DAILY]: 'Hàng ngày',
    [RepeatModeType.WEEKLY]: 'Hàng tuần',
    [RepeatModeType.MONTHLY]: 'Hàng tháng',
    [RepeatModeType.YEARLY]: 'Hàng năm',
    [RepeatModeType.NONE]: 'Không lặp lại',
  };
  return labels[mode] || mode;
};

export const columns: ColumnDef<ReminderItem>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
  },
  {
    accessorKey: 'title',
    header: 'Tiêu đề',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.getValue('title')}</span>
      </div>
    ),
  },
  {
    accessorKey: 'time_to_remind',
    header: 'Thời gian',
    cell: ({ row }) => {
      const time = row.getValue('time_to_remind') as string;
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'repeat_mode',
    header: 'Lặp lại',
    cell: ({ row }) => {
      const reminder = row.original;
      const mode = reminder?.repeat_mode;

      if (!mode) {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">-</Badge>
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary">
            {getRepeatModeLabel(mode as string)}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'assigned_role',
    header: 'Người nhận',
    cell: ({ row, table }) => {
      const reminder = row.original;
      const roles = (table.options.meta as any)?.roles || [];

      // API có thể trả về assignedRole (mảng objects) hoặc assigned_role (mảng numbers)
      const assignedRoleObjects = (reminder as any).assignedRole || [];
      const assignedRoleIds = reminder.assigned_role || [];

      // Ưu tiên sử dụng assignedRole nếu có (đầy đủ thông tin)
      if (assignedRoleObjects && assignedRoleObjects.length > 0) {
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-1">
              {assignedRoleObjects.map((role: any) => (
                <Badge key={role.id} variant="outline">
                  {role.name || `Role ${role.id}`}
                </Badge>
              ))}
            </div>
          </div>
        );
      }

      // Fallback về assigned_role nếu không có assignedRole
      if (!assignedRoleIds || assignedRoleIds.length === 0) {
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">Tất cả</Badge>
          </div>
        );
      }

      // Debug: Log để kiểm tra
      if (
        process.env.NODE_ENV !== 'production' &&
        assignedRoleIds.length > 0 &&
        roles.length === 0
      ) {
        console.warn(
          'Roles list is empty but assigned_roleIds exist:',
          assignedRoleIds,
        );
      }

      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {assignedRoleIds.map((roleId: number) => {
              const role = roles.find((r: any) => r.id === roleId);
              // Nếu không tìm thấy role trong list, hiển thị ID
              const roleName = role?.name || `Role ${roleId}`;
              return (
                <Badge key={roleId} variant="outline">
                  {roleName}
                </Badge>
              );
            })}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Hoạt động' : 'Tắt'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row, table }) => {
      const reminder = row.original;
      const { setReminderIdEdit, setReminderDelete, setReminderViewLogs } =
        useContext(ReminderTableContext);

      const openEdit = () => {
        setReminderIdEdit(reminder.id);
      };

      const openDelete = () => {
        setReminderDelete(reminder);
      };

      const openViewLogs = () => {
        setReminderViewLogs(reminder);
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openViewLogs}>
              <Eye className="mr-2 h-4 w-4" />
              Xem logs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function AlertDialogDeleteReminder({
  reminderDelete,
  setReminderDelete,
}: {
  reminderDelete: ReminderItem | null;
  setReminderDelete: (value: ReminderItem | null) => void;
}) {
  const { mutateAsync } = useDeleteReminder();

  const deleteReminder = async () => {
    if (reminderDelete) {
      try {
        await mutateAsync(reminderDelete.id);
        setReminderDelete(null);
        toast.success('Xóa lời nhắc thành công', {
          hideProgressBar: true,
          autoClose: 1000,
        });
      } catch (error: any) {
        toast.error(
          error?.payload?.message || 'Có lỗi xảy ra khi xóa lời nhắc',
        );
      }
    }
  };

  return (
    <AlertDialog
      open={Boolean(reminderDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setReminderDelete(null);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa lời nhắc?</AlertDialogTitle>
          <AlertDialogDescription>
            Lời nhắc{' '}
            <span className="bg-foreground text-primary-foreground rounded px-1">
              {reminderDelete?.title}
            </span>{' '}
            sẽ bị xóa vĩnh viễn. Bạn có chắc chắn muốn tiếp tục?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteReminder}
            className="bg-destructive text-destructive-foreground"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const PAGE_SIZE = 10;

export default function ReminderTable() {
  const [reminderIdEdit, setReminderIdEdit] = useState<number | undefined>();
  const [reminderDelete, setReminderDelete] = useState<ReminderItem | null>(
    null,
  );
  const [reminderViewLogs, setReminderViewLogs] = useState<ReminderItem | null>(
    null,
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data: remindersData, isLoading } = useGetReminderList();
  const { data: rolesData } = useGetRoleListQuery();
  const roles = rolesData?.payload?.data || [];

  // API có thể trả về:
  // 1. payload là mảng trực tiếp
  // 2. payload.data là mảng
  // 3. payload.data là object (single item) - wrap thành mảng
  const payload = remindersData?.payload;
  let data: ReminderItem[] = [];

  if (Array.isArray(payload)) {
    data = payload;
  } else if (payload && typeof payload === 'object') {
    if (Array.isArray((payload as any).data)) {
      data = (payload as any).data;
    } else if (
      (payload as any).data &&
      typeof (payload as any).data === 'object'
    ) {
      // Nếu data là object, wrap thành mảng
      data = [(payload as any).data];
    }
  }

  // Debug log để kiểm tra cấu trúc dữ liệu (chỉ ở môi trường dev)
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!remindersData) return;

    console.log('Reminders data structure:', remindersData);
    console.log('Payload:', payload);
    console.log('Data array:', data);
    console.log('Data length:', data.length);
    console.log('Roles from query:', roles);
    console.log('Roles length:', roles.length);
    if (data.length > 0) {
      const firstReminder = data[0];
      console.log('First reminder:', firstReminder);
      console.log('First reminder repeat_mode:', firstReminder?.repeat_mode);
      console.log(
        'First reminder assignedRole:',
        (firstReminder as any)?.assignedRole,
      );
      console.log(
        'First reminder assigned_role:',
        firstReminder?.assigned_role,
      );
      if (
        firstReminder?.assigned_role &&
        firstReminder.assigned_role.length > 0
      ) {
        const roleId = firstReminder.assigned_role[0];
        const foundRole = roles.find((r: any) => r.id === roleId);
        console.log(`Looking for role ID ${roleId}:`, foundRole);
      }
    }
  }, [remindersData, payload, data, roles]);

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
    meta: {
      roles,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <ReminderTableContext.Provider
      value={{
        reminderDelete,
        setReminderDelete,
        reminderIdEdit,
        setReminderIdEdit,
        reminderViewLogs,
        setReminderViewLogs,
      }}
    >
      <div className="w-full">
        <EditReminder id={reminderIdEdit} setId={setReminderIdEdit} />
        <AlertDialogDeleteReminder
          reminderDelete={reminderDelete}
          setReminderDelete={setReminderDelete}
        />
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Lọc theo tiêu đề..."
            value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('title')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <QuickReminderDialog />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
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
                    Không có lời nhắc nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} lời nhắc
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </Button>
          </div>
        </div>
      </div>
    </ReminderTableContext.Provider>
  );
}
