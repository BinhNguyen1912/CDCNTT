// components/QuickReminderDialog.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Calendar,
  User,
  Save,
  ClipboardClock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useCreateReminder } from '@/app/queries/useReminder';
import { useGetRoleListQuery } from '@/app/queries/useRole';
import { toast } from 'react-toastify';
import { RepeatModeType } from '@/app/constants/reminder.constant';
import type { CreateReminderType } from '@/app/ValidationSchemas/reminder.schema';
import { RoleValues } from '@/app/constants/type';
import { roleName } from '@/app/constants/role.constant';
import { getVietnameseRoleStatus } from '@/lib/utils';

type QuickReminderDialogProps = {
  triggerVariant?: 'default' | 'icon';
};

export const QuickReminderDialog: React.FC<QuickReminderDialogProps> = ({
  triggerVariant = 'default',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateReminderType>({
    title: '',
    time_to_remind: '',
    scheduled_date: null,
    repeat_mode: RepeatModeType.ONCE,
    assigned_role: [],
    description: '',
    repeat_days: [],
    is_active: true,
  });

  const createReminderMutation = useCreateReminder();
  const { data: rolesData } = useGetRoleListQuery();
  const roles =
    rolesData?.payload?.data.filter((role) => role.name !== roleName.GUEST) ||
    [];

  const getDefaultTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toTimeString().slice(0, 5);
  };

  const handleOpen = () => {
    setFormData({
      title: '',
      time_to_remind: getDefaultTime(),
      scheduled_date: null,
      repeat_mode: RepeatModeType.ONCE,
      assigned_role: [],
      description: '',
      repeat_days: [],
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Chuyển đổi scheduled_date thành date string (YYYY-MM-DD) nếu có
      const submitData: CreateReminderType = {
        ...formData,
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
          : null,
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending reminder create data:', submitData);
      }
      await createReminderMutation.mutateAsync(submitData);
      toast.success('Đã tạo lời nhắc thành công!');
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent('reminderCreated'));
    } catch (error: any) {
      console.error('Error creating reminder:', error);
      const errorMessage =
        error?.payload?.message ||
        error?.message ||
        'Có lỗi xảy ra khi tạo lời nhắc!';
      toast.error(errorMessage);
    }
  };

  const handleChange = (field: keyof CreateReminderType, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRepeatDayToggle = (day: number) => {
    setFormData((prev) => {
      const newRepeatDays = prev.repeat_days.includes(day)
        ? prev.repeat_days.filter((d) => d !== day)
        : [...prev.repeat_days, day];

      return {
        ...prev,
        repeat_days: newRepeatDays,
      };
    });
  };

  // Reset repeat_days khi chuyển sang chế độ không cần chọn ngày
  useEffect(() => {
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
  }, [formData.repeat_mode]);

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerVariant === 'icon' ? (
          <Button
            onClick={handleOpen}
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            aria-label="Tạo lời nhắc"
            title="Tạo lời nhắc"
          >
            <ClipboardClock size={16} />
          </Button>
        ) : (
          <Button
            onClick={handleOpen}
            className="flex items-center gap-2"
            variant="default"
            size="sm"
          >
            <Bell size={16} />
            <span className="hidden sm:inline">Tạo lời nhắc</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tạo lời nhắc mới
          </DialogTitle>
          <DialogDescription>
            Thiết lập công việc cần nhắc nhở cho nhân viên
          </DialogDescription>
        </DialogHeader>

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
                    <Label htmlFor="title">Tiêu đề lời nhắc *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Nhập tiêu đề lời nhắc..."
                    />
                  </div>

                  {/* Thời gian */}
                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Thời gian *
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      required
                      value={formData.time_to_remind}
                      onChange={(e) =>
                        handleChange('time_to_remind', e.target.value)
                      }
                    />
                  </div>

                  {/* Ngày nhắc (optional) */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="scheduled_date"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4" />
                      Ngày nhắc (tùy chọn)
                    </Label>
                    <Input
                      id="scheduled_date"
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
                      htmlFor="repeat_mode"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4" />
                      Lặp lại
                    </Label>
                    <Select
                      value={formData.repeat_mode}
                      onValueChange={(value) =>
                        handleChange(
                          'repeat_mode',
                          value as (typeof RepeatModeType)[keyof typeof RepeatModeType],
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                      htmlFor="assigned_role"
                      className="flex items-center gap-1"
                    >
                      <User className="h-4 w-4" />
                      Giao cho
                    </Label>
                    <Select
                      value={
                        formData.assigned_role &&
                        formData.assigned_role.length > 0
                          ? formData.assigned_role[0].toString()
                          : ''
                      }
                      onValueChange={(value) => {
                        const roleId = parseInt(value);
                        handleChange(
                          'assigned_role',
                          roleId === 0 ? [] : [roleId],
                        );
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tất cả</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {getVietnameseRoleStatus(
                              role.name as (typeof roleName)[keyof typeof roleName],
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                            return timeStr ? `${dateStr} ${timeStr}` : dateStr;
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
                    <span className="font-medium">Người nhận:</span>
                    <span>
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
                  {showRepeatDays && formData.repeat_days.length > 0 && (
                    <div className="flex justify-between">
                      <span className="font-medium">Ngày lặp lại:</span>
                      <span className="text-right">
                        {formData.repeat_mode === RepeatModeType.WEEKLY
                          ? formData.repeat_days
                              .map(
                                (d) =>
                                  daysOfWeek.find((day) => day.id === d)?.name,
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
                            formData.repeat_days.includes(day.id)
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
                        {formData.repeat_days.length} ngày
                      </Badge>
                      {formData.repeat_days.length > 0 && (
                        <span>
                          {formData.repeat_days
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
                            formData.repeat_days.includes(day)
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
                        {formData.repeat_days.length} ngày
                      </Badge>
                      {formData.repeat_days.length > 0 && (
                        <span>{formData.repeat_days.join(', ')}</span>
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
              onClick={() => setIsOpen(false)}
              disabled={createReminderMutation.isPending}
              className="flex-1"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={
                createReminderMutation.isPending ||
                !formData.title ||
                !formData.time_to_remind ||
                (showRepeatDays && formData.repeat_days.length === 0)
              }
              className="flex-1 gap-2"
            >
              {createReminderMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Tạo lời nhắc
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
