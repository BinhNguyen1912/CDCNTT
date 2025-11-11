'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, User, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown } from 'lucide-react';
import {
  useGetReminderDetail,
  useUpdateReminder,
} from '@/app/queries/useReminder';
import { useGetRoleListQuery } from '@/app/queries/useRole';
import { toast } from 'react-toastify';
import { RepeatModeType } from '@/app/constants/reminder.constant';
import type { UpdateReminderType } from '@/app/ValidationSchemas/reminder.schema';
import { roleName } from '@/app/constants/role.constant';
import { getVietnameseRoleStatus } from '@/lib/utils';

export default function EditReminder({
  id,
  setId,
}: {
  id?: number;
  setId: (value: number | undefined) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateReminderType>({
    title: '',
    time_to_remind: '',
    scheduled_date: null,
    repeat_mode: RepeatModeType.ONCE,
    assigned_role: undefined,
    description: '',
    repeat_days: [],
    is_active: true,
  });

  const updateReminderMutation = useUpdateReminder();
  const { data: rolesData } = useGetRoleListQuery();
  const roles =
    rolesData?.payload?.data.filter((role) => role.name !== roleName.GUEST) ||
    [];

  const { data: reminderData, isLoading } = useGetReminderDetail({
    id: id as number,
    enabled: Boolean(id),
  });

  // Reset state khi id thay đổi
  useEffect(() => {
    if (id) {
      // Reset tất cả state và mở dialog
      setIsInitialLoad(true);
      setFormData({
        title: '',
        time_to_remind: '',
        scheduled_date: null,
        repeat_mode: RepeatModeType.ONCE,
        assigned_role: undefined,
        description: '',
        repeat_days: [],
        is_active: true,
      });
      setIsOpen(true);
    } else {
      // Đóng dialog và reset state
      setIsOpen(false);
      setIsInitialLoad(true);
      setFormData({
        title: '',
        time_to_remind: '',
        scheduled_date: null,
        repeat_mode: RepeatModeType.ONCE,
        assigned_role: undefined,
        description: '',
        repeat_days: [],
        is_active: true,
      });
    }
  }, [id]);

  useEffect(() => {
    if (reminderData?.payload) {
      const reminder = reminderData.payload;

      // Debug log
      console.log('Populating form with reminder data:', reminder);
      console.log('assigned_role from API:', reminder.assigned_role);
      console.log('repeat_mode from API:', reminder.repeat_mode);

      // Đảm bảo assigned_role là array hoặc undefined
      let assignedRole: number[] | undefined = undefined;
      if (reminder.assigned_role) {
        if (Array.isArray(reminder.assigned_role)) {
          assignedRole =
            reminder.assigned_role.length > 0
              ? reminder.assigned_role
              : undefined;
        } else {
          // Nếu không phải array, chuyển đổi thành array
          assignedRole = [reminder.assigned_role];
        }
      }

      // Validate và map repeat_mode về đúng giá trị trong enum
      let repeatMode: RepeatModeType = RepeatModeType.ONCE;
      if (reminder.repeat_mode) {
        const validModes = Object.values(RepeatModeType);
        if (validModes.includes(reminder.repeat_mode as any)) {
          repeatMode = reminder.repeat_mode as RepeatModeType;
        } else {
          console.warn(
            `Invalid repeat_mode from API: ${reminder.repeat_mode}, defaulting to ONCE`,
          );
        }
      }

      // Parse scheduled_date - chỉ lấy ngày, không quan tâm timezone
      let parsedScheduledDate: Date | null = null;
      if (reminder.scheduled_date) {
        const dateStr = String(reminder.scheduled_date).split('T')[0]; // Lấy phần YYYY-MM-DD
        if (dateStr) {
          const [year, month, day] = dateStr.split('-').map(Number);
          parsedScheduledDate = new Date(year, month - 1, day); // month là 0-indexed
          parsedScheduledDate.setHours(0, 0, 0, 0); // Đảm bảo không có giờ
        }
      }

      setFormData({
        title: reminder.title || '',
        time_to_remind: reminder.time_to_remind || '',
        scheduled_date: parsedScheduledDate,
        repeat_mode: repeatMode,
        assigned_role: assignedRole,
        description: reminder.description || '',
        repeat_days: reminder.repeat_days || [],
        is_active: reminder.is_active ?? true,
      });

      console.log('Form data after population:', {
        repeat_mode: repeatMode,
        assigned_role: assignedRole,
      });
    }
  }, [reminderData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    try {
      // Đảm bảo repeat_mode luôn có giá trị hợp lệ
      if (!formData.repeat_mode) {
        formData.repeat_mode = RepeatModeType.ONCE;
      }

      // Chuyển đổi scheduled_date thành date string (YYYY-MM-DD) nếu có
      const submitData: UpdateReminderType & { id: number } = {
        ...formData,
        id,
        repeat_mode: formData.repeat_mode, // Đảm bảo repeat_mode luôn có giá trị
        scheduled_date: formData.scheduled_date
          ? (() => {
              const date =
                formData.scheduled_date instanceof Date
                  ? formData.scheduled_date
                  : new Date(formData.scheduled_date);
              // Format YYYY-MM-DD từ local date, không dùng toISOString để tránh timezone issue
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              return `${year}-${month}-${day}` as any;
            })()
          : undefined,
      };

      // Remove các fields undefined để tránh gửi empty string (nhưng giữ lại repeat_mode)
      Object.keys(submitData).forEach((key) => {
        if (
          key !== 'repeat_mode' &&
          key !== 'id' &&
          submitData[key as keyof typeof submitData] === undefined
        ) {
          delete submitData[key as keyof typeof submitData];
        }
      });

      // Đảm bảo repeat_mode không phải undefined
      if (!submitData.repeat_mode) {
        submitData.repeat_mode = RepeatModeType.ONCE;
      }

      console.log('Sending reminder update data:', submitData);
      await updateReminderMutation.mutateAsync(submitData);
      toast.success('Đã cập nhật lời nhắc thành công!');

      // Reset state trước khi đóng dialog
      setId(undefined);

      // Delay để đảm bảo state reset xong trước khi đóng
      setTimeout(() => {
        setIsOpen(false);
      }, 50);
    } catch (error: any) {
      console.error('Error updating reminder:', error);
      const errorMessage =
        error?.payload?.message ||
        error?.message ||
        'Có lỗi xảy ra khi cập nhật lời nhắc!';
      toast.error(errorMessage);
    }
  };

  const handleChange = (field: keyof UpdateReminderType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRepeatDayToggle = (day: number) => {
    setFormData((prev) => {
      const newRepeatDays = (prev.repeat_days || []).includes(day)
        ? (prev.repeat_days || []).filter((d) => d !== day)
        : [...(prev.repeat_days || []), day];

      return {
        ...prev,
        repeat_days: newRepeatDays,
      };
    });
  };

  // Reset repeat_days khi chuyển sang chế độ không cần chọn ngày
  // Chỉ reset khi user thay đổi, không reset khi đang load dữ liệu
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (reminderData?.payload) {
      setIsInitialLoad(false);
    }
  }, [reminderData]);

  useEffect(() => {
    // Chỉ reset repeat_days khi không phải là lần load đầu tiên
    if (!isInitialLoad) {
      if (
        formData.repeat_mode === RepeatModeType.ONCE ||
        formData.repeat_mode === RepeatModeType.NONE ||
        formData.repeat_mode === RepeatModeType.DAILY
      ) {
        setFormData((prev) => ({
          ...prev,
          repeat_days: [],
        }));
      }
    }
  }, [formData.repeat_mode, isInitialLoad]);

  const repeatModes = [
    { value: RepeatModeType.ONCE, label: 'Một lần' },
    { value: RepeatModeType.DAILY, label: 'Hàng ngày' },
    { value: RepeatModeType.WEEKLY, label: 'Hàng tuần' },
    { value: RepeatModeType.MONTHLY, label: 'Hàng tháng' },
    { value: RepeatModeType.YEARLY, label: 'Hàng năm' },
    { value: RepeatModeType.NONE, label: 'Không lặp lại' },
  ];

  const daysOfWeek = [
    { id: 0, name: 'CN', fullName: 'Chủ Nhật' },
    { id: 1, name: 'T2', fullName: 'Thứ 2' },
    { id: 2, name: 'T3', fullName: 'Thứ 3' },
    { id: 3, name: 'T4', fullName: 'Thứ 4' },
    { id: 4, name: 'T5', fullName: 'Thứ 5' },
    { id: 5, name: 'T6', fullName: 'Thứ 6' },
    { id: 6, name: 'T7', fullName: 'Thứ 7' },
  ];

  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const showRepeatDays =
    formData.repeat_mode === RepeatModeType.WEEKLY ||
    formData.repeat_mode === RepeatModeType.MONTHLY;

  if (!id) return null;

  return (
    <Dialog
      key={id || 'closed'} // Force remount khi id thay đổi để reset hoàn toàn
      open={isOpen}
      onOpenChange={(open) => {
        // Chỉ cho phép đóng dialog từ UI (click outside, ESC, etc.)
        // Không cho phép mở dialog từ đây (chỉ mở từ id prop)
        if (!open) {
          // Đóng ngay lập tức và reset state
          setIsOpen(false);
          setId(undefined);
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Chỉnh sửa lời nhắc
          </DialogTitle>
          <DialogDescription>Cập nhật thông tin lời nhắc</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Đang tải...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột trái - Thông tin cơ bản */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tiêu đề */}
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Tiêu đề lời nhắc *</Label>
                      <Input
                        id="edit-title"
                        required
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Nhập tiêu đề lời nhắc..."
                      />
                    </div>

                    {/* Thời gian */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-time"
                        className="flex items-center gap-1"
                      >
                        <Clock className="h-4 w-4" />
                        Thời gian *
                      </Label>
                      <Input
                        id="edit-time"
                        type="time"
                        required
                        value={formData.time_to_remind || ''}
                        onChange={(e) =>
                          handleChange('time_to_remind', e.target.value)
                        }
                      />
                    </div>

                    {/* Ngày nhắc (optional) */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-scheduled_date"
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-4 w-4" />
                        Ngày nhắc (tùy chọn)
                      </Label>
                      <Input
                        id="edit-scheduled_date"
                        type="date"
                        value={
                          formData.scheduled_date
                            ? (() => {
                                const date = new Date(formData.scheduled_date);
                                // Format YYYY-MM-DD từ local date, không dùng toISOString để tránh timezone issue
                                const year = date.getFullYear();
                                const month = String(
                                  date.getMonth() + 1,
                                ).padStart(2, '0');
                                const day = String(date.getDate()).padStart(
                                  2,
                                  '0',
                                );
                                return `${year}-${month}-${day}`;
                              })()
                            : ''
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            // Chỉ lưu ngày (không có giờ)
                            const dateOnly = new Date(value);
                            dateOnly.setHours(0, 0, 0, 0);
                            handleChange('scheduled_date', dateOnly);
                          } else {
                            handleChange('scheduled_date', null);
                          }
                        }}
                        placeholder="Chọn ngày cụ thể"
                      />
                    </div>

                    {/* Lặp lại */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-repeat_mode"
                        className="flex items-center gap-1"
                      >
                        <Calendar className="h-4 w-4" />
                        Lặp lại
                      </Label>
                      <Select
                        value={formData.repeat_mode || RepeatModeType.ONCE}
                        onValueChange={(value) =>
                          handleChange(
                            'repeat_mode',
                            value as (typeof RepeatModeType)[keyof typeof RepeatModeType],
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chế độ lặp lại" />
                        </SelectTrigger>
                        <SelectContent>
                          {repeatModes.map((mode) => (
                            <SelectItem key={mode.value} value={mode.value}>
                              {mode.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Trạng thái */}
                    <div className="flex items-center justify-between space-x-2">
                      <Label
                        htmlFor="edit-is_active"
                        className="flex items-center gap-1"
                      >
                        <Bell className="h-4 w-4" />
                        Trạng thái
                      </Label>
                      <Switch
                        id="edit-is_active"
                        checked={formData.is_active ?? true}
                        onCheckedChange={(checked) =>
                          handleChange('is_active', checked)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Người nhận */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Phân công</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-assigned_role"
                        className="flex items-center gap-1"
                      >
                        <User className="h-4 w-4" />
                        Giao cho
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            <span className="truncate">
                              {!formData.assigned_role ||
                              formData.assigned_role.length === 0
                                ? 'Tất cả'
                                : formData.assigned_role.length === 1
                                  ? getVietnameseRoleStatus(
                                      (roles.find(
                                        (r) =>
                                          r.id === formData.assigned_role![0],
                                      )?.name ||
                                        '') as (typeof roleName)[keyof typeof roleName],
                                    )
                                  : `${formData.assigned_role.length} vai trò đã chọn`}
                            </span>
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
                            <div
                              className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                              onClick={() => {
                                handleChange('assigned_role', undefined);
                              }}
                            >
                              <Checkbox
                                checked={
                                  !formData.assigned_role ||
                                  formData.assigned_role.length === 0
                                }
                              />
                              <Label className="font-normal cursor-pointer flex-1">
                                Tất cả
                              </Label>
                            </div>
                            {roles.map((role) => {
                              const isSelected =
                                formData.assigned_role?.includes(role.id) ||
                                false;
                              return (
                                <div
                                  key={role.id}
                                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                  onClick={() => {
                                    const currentRoles =
                                      formData.assigned_role || [];
                                    let newRoles: number[];
                                    if (isSelected) {
                                      // Bỏ chọn role này
                                      newRoles = currentRoles.filter(
                                        (r) => r !== role.id,
                                      );
                                    } else {
                                      // Thêm role này
                                      newRoles = [...currentRoles, role.id];
                                    }
                                    handleChange(
                                      'assigned_role',
                                      newRoles.length > 0
                                        ? newRoles
                                        : undefined,
                                    );
                                  }}
                                >
                                  <Checkbox checked={isSelected} />
                                  <Label className="font-normal cursor-pointer flex-1">
                                    {getVietnameseRoleStatus(
                                      role.name as (typeof roleName)[keyof typeof roleName],
                                    )}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                      {formData.assigned_role &&
                        formData.assigned_role.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {formData.assigned_role.map((roleId) => {
                              const role = roles.find((r) => r.id === roleId);
                              return (
                                <Badge
                                  key={roleId}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {role
                                    ? getVietnameseRoleStatus(
                                        role.name as (typeof roleName)[keyof typeof roleName],
                                      )
                                    : `Role ${roleId}`}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Cột phải - Mô tả và Preview */}
              <div className="space-y-4">
                {/* Mô tả */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Mô tả chi tiết</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) =>
                        handleChange('description', e.target.value)
                      }
                      placeholder="Mô tả công việc cần thực hiện..."
                      rows={5}
                      className="resize-none"
                    />
                  </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Xem trước</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Tiêu đề:</span>
                      <span>{formData.title || 'Chưa có'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Thời gian:</span>
                      <span>{formData.time_to_remind || 'Chưa có'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ngày nhắc:</span>
                      <span>
                        {formData.scheduled_date
                          ? (() => {
                              const date = new Date(formData.scheduled_date);
                              // Format theo local date để tránh timezone issue
                              const dateStr = date.toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                timeZone: 'Asia/Ho_Chi_Minh', // Đảm bảo dùng timezone VN
                              });
                              const timeStr = formData.time_to_remind || '';
                              return timeStr
                                ? `${dateStr} ${timeStr}`
                                : dateStr;
                            })()
                          : 'Chưa có'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Lặp lại:</span>
                      <span>
                        {
                          repeatModes.find(
                            (m) => m.value === formData.repeat_mode,
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Trạng thái:</span>
                      <Badge
                        variant={formData.is_active ? 'default' : 'secondary'}
                      >
                        {formData.is_active ? 'Hoạt động' : 'Tắt'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Người nhận:</span>
                      <span className="text-right">
                        {!formData.assigned_role ||
                        formData.assigned_role.length === 0
                          ? 'Tất cả'
                          : formData.assigned_role
                              .map((roleId) => {
                                const role = roles.find((r) => r.id === roleId);
                                return role
                                  ? getVietnameseRoleStatus(
                                      role.name as (typeof roleName)[keyof typeof roleName],
                                    )
                                  : `Role ${roleId}`;
                              })
                              .join(', ')}
                      </span>
                    </div>
                    {showRepeatDays &&
                      formData.repeat_days &&
                      formData.repeat_days.length > 0 && (
                        <div className="flex justify-between">
                          <span className="font-medium">Ngày lặp lại:</span>
                          <span className="text-right">
                            {formData.repeat_mode === RepeatModeType.WEEKLY
                              ? formData.repeat_days
                                  .map(
                                    (d) =>
                                      daysOfWeek.find((day) => day.id === d)
                                        ?.name,
                                  )
                                  .join(', ')
                              : formData.repeat_days.join(', ')}
                          </span>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Chọn ngày lặp lại */}
            {showRepeatDays && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Chọn ngày lặp lại *</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.repeat_mode === RepeatModeType.WEEKLY && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map((day) => (
                          <Button
                            key={day.id}
                            type="button"
                            variant={
                              (formData.repeat_days || []).includes(day.id)
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => handleRepeatDayToggle(day.id)}
                            className="flex-1 min-w-[50px]"
                          >
                            {day.name}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {(formData.repeat_days || []).length} ngày
                        </Badge>
                        {(formData.repeat_days || []).length > 0 && (
                          <span>
                            {(formData.repeat_days || [])
                              .map(
                                (d) =>
                                  daysOfWeek.find((day) => day.id === d)
                                    ?.fullName,
                              )
                              .join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {formData.repeat_mode === RepeatModeType.MONTHLY && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-7 gap-2">
                        {daysOfMonth.map((day) => (
                          <Button
                            key={day}
                            type="button"
                            variant={
                              (formData.repeat_days || []).includes(day)
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => handleRepeatDayToggle(day)}
                            className="h-8"
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {(formData.repeat_days || []).length} ngày
                        </Badge>
                        {(formData.repeat_days || []).length > 0 && (
                          <span>{(formData.repeat_days || []).join(', ')}</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <CardFooter className="flex gap-3 px-0 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setId(undefined);
                  setIsOpen(false);
                }}
                disabled={updateReminderMutation.isPending}
                className="flex-1"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                disabled={
                  updateReminderMutation.isPending ||
                  !formData.title ||
                  !formData.time_to_remind ||
                  (showRepeatDays &&
                    (!formData.repeat_days ||
                      formData.repeat_days.length === 0))
                }
                className="flex-1 gap-2"
              >
                {updateReminderMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Cập nhật lời nhắc
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
