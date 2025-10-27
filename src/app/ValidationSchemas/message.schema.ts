import { z } from 'zod';

export const sendGuestMessageSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(1000, { message: 'Message too long' }),
  guestId: z.number().int().positive(),
});

export const sendUserMessageSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(1000, { message: 'Message too long' }),
  toUserId: z.number().int().positive(),
});

export const markAsReadSchema = z.object({
  messageIds: z.array(z.number().int().positive()),
});

export type SendGuestMessageType = z.infer<typeof sendGuestMessageSchema>;
export type SendUserMessageType = z.infer<typeof sendUserMessageSchema>;
export type MarkAsReadType = z.infer<typeof markAsReadSchema>;
