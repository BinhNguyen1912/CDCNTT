import {
  CreateReminderType,
  ReminderResType,
  UpdateReminderType,
} from '@/app/ValidationSchemas/reminder.schema';
import { ReminderLogsType } from '@/app/ValidationSchemas/remindersLog.schema';
import http from '@/lib/http';
const prefix = '/reminders';
export const reminderRequestApi = {
  // Lấy danh sách tất cả reminders đang active
  list: () => http.get<ReminderResType[]>(`${prefix}`),

  // Lấy reminders theo role ID
  getByRole: (roleId: number) =>
    http.get<ReminderResType[]>(`${prefix}/role/${roleId}`),

  // Lấy reminder theo ID
  getDetail: (id: number) => http.get<ReminderResType>(`${prefix}/${id}`),

  // Tạo reminder mới
  create: (data: CreateReminderType) =>
    http.post<ReminderResType>(`${prefix}`, data),

  // Cập nhật reminder
  update: (id: number, data: UpdateReminderType) =>
    http.patch<ReminderResType>(`${prefix}/${id}`, data),

  // Xóa reminder (soft delete)
  delete: (id: number) => http.delete<ReminderResType>(`${prefix}/${id}`),

  // Lấy logs của reminder
  getLogs: (id: number) => http.get<ReminderLogsType[]>(`${prefix}/${id}/logs`),

  // Đánh dấu reminder log đã hoàn thành
  completeLog: (id: number, logId: number) =>
    http.post<ReminderLogsType>(`${prefix}/${id}/logs/${logId}/complete`, null),
};
