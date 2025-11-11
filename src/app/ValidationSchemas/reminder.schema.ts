import { RepeatModeType } from '@/app/constants/reminder.constant';
import z from 'zod';

// ========== BASE SCHEMA ==========
export const RemindersSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(255),
  time_to_remind: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Thời gian nhắc nhở phải ở định dạng HH:MM',
  }),
  scheduled_date: z
    .union([z.date(), z.string().date(), z.string()]) // Chỉ nhận ngày (YYYY-MM-DD)
    .nullable()
    .optional()
    .transform((val) => {
      if (!val) return null;
      if (val instanceof Date) return val;
      // Parse date string (YYYY-MM-DD) và set giờ là 00:00:00
      const dateStr = String(val).split('T')[0]; // Lấy phần date nếu có time
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // month là 0-indexed
    }), // Chỉ nhận ngày (YYYY-MM-DD), giờ sẽ lấy từ time_to_remind
  repeat_mode: z.enum([
    RepeatModeType.DAILY,
    RepeatModeType.WEEKLY,
    RepeatModeType.ONCE,
    RepeatModeType.MONTHLY,
    RepeatModeType.YEARLY,
    RepeatModeType.NONE,
  ]),
  repeat_days: z.array(z.number().int().min(0).max(6)).default([]),
  is_active: z.boolean().default(true),
  assigned_role: z.array(z.number().int().positive()),
  description: z.string().nullable().optional(),
  // Metadata fields
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
  createdById: z.number().int().positive().nullable().optional(),
  updatedById: z.number().int().positive().nullable().optional(),
  deletedById: z.number().int().positive().nullable().optional(),
});

export const CreateReminderSchema = RemindersSchema.pick({
  title: true,
  time_to_remind: true,
  scheduled_date: true,
  repeat_mode: true,
  repeat_days: true,
  is_active: true,
  assigned_role: true,
  description: true,
});

// ========== UPDATE SCHEMA ==========
export const UpdateReminderSchema = CreateReminderSchema.partial();

// ========== QUERY SCHEMA ==========
export const ReminderQuerySchema = z.object({
  is_active: z.boolean().optional(),
  assigned_role: z.array(z.number().int().positive()).optional(),
  repeat_mode: z
    .enum([
      RepeatModeType.DAILY,
      RepeatModeType.WEEKLY,
      RepeatModeType.ONCE,
      RepeatModeType.MONTHLY,
      RepeatModeType.YEARLY,
      RepeatModeType.NONE,
    ])
    .optional(),
  date: z.string().date().optional(),
});

// ========== RESPONSE SCHEMA ==========
export const ReminderResSchema = RemindersSchema;

// ========== TYPE EXPORTS ==========
export type CreateReminderType = z.infer<typeof CreateReminderSchema>;
export type UpdateReminderType = z.infer<typeof UpdateReminderSchema>;
export type ReminderQueryType = z.infer<typeof ReminderQuerySchema>;
export type ReminderResType = z.infer<typeof ReminderResSchema>;
export type ReminderType = z.infer<typeof RemindersSchema>;
