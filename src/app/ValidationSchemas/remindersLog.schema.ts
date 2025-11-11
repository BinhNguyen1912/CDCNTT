import { StatusReminder } from '@/app/constants/reminder.constant';
import {
  dateSchema,
  nullableDateSchema,
} from '@/app/ValidationSchemas/reminder.schema';
import z from 'zod';

export const ReminderLogsSchema = z.object({
  id: z.number().int().positive().optional(),
  reminder_id: z.number().int().positive(),
  scheduled_at: dateSchema,
  completed_at: nullableDateSchema.optional(),
  status: z.enum([
    StatusReminder.PENDING,
    StatusReminder.COMPLETED,
    StatusReminder.MISSED,
  ]),
  completedById: z.number().int().positive().nullable().optional(),
  createdAt: dateSchema.optional(),
  updatedAt: dateSchema.optional(),
});
export const CreateReminderLogSchema = ReminderLogsSchema.pick({
  id: true,
  completedById: true,
  completed_at: true,
  reminder_id: true,
  scheduled_at: true,
  status: true,
});
export const UpdateReminderLogSchema = ReminderLogsSchema.partial().omit({
  id: true,
  reminder_id: true,
});
export type CreateReminderLogType = z.infer<typeof CreateReminderLogSchema>;
export type UpdateReminderLogType = z.infer<typeof UpdateReminderLogSchema>;
export type ReminderLogsType = z.infer<typeof ReminderLogsSchema>;
