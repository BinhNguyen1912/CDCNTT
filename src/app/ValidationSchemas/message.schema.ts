import { guestSchema } from '@/app/ValidationSchemas/guest.schema';
import { tableNodeSchema } from '@/app/ValidationSchemas/table-node.schema';
import { UserSchema } from '@/app/ValidationSchemas/user.schema';
import { z } from 'zod';
export const MessageSchema = z.object({
  id: z.number(),
  fromUserId: z.number().nullable(),
  toUserId: z.number().nullable(),
  content: z.string(),
  readAt: z.string().nullable(),
  updatedAt: z.string(),
  createdAt: z.string(),
  fromGuestId: z.number().nullable(),
});
export type MessageType = z.infer<typeof MessageSchema>;
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
  senderId: z.number().int().positive(),
});

export const markAsReadSchema = z.object({
  messageIds: z.array(z.number().int().positive()),
});

export const sendAdminReplyToGuestSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(1000, { message: 'Message too long' }),
  guestId: z.number().int().positive(),
});

export const sendAdminToGuestMessageSchema = z.object({
  content: z
    .string()
    .min(1, { message: 'Content is required' })
    .max(1000, { message: 'Message too long' }),
  guestId: z.number().int().positive(),
});

export const MessageResSchema = z.object({
  message: z.string(),
});

// User info cho tin nhắn (pick từ UserSchema)
const UserInfoSchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
  avatar: true,
});

// Guest với TableNode (extends từ guestSchema)
const GuestWithTableNodeSchema = guestSchema.extend({
  tableNode: tableNodeSchema.nullable(),
});

// Message response schema với relations (extends từ MessageSchema)
export const MessageWithRelationsSchema = MessageSchema.extend({
  fromGuest: GuestWithTableNodeSchema.nullable(),
  fromUser: UserInfoSchema.nullable(),
  toUser: UserInfoSchema.nullable(),
});

export const ConversationResponseSchema = MessageWithRelationsSchema.array();

export type SendGuestMessageType = z.infer<typeof sendGuestMessageSchema>;
export type SendUserMessageType = z.infer<typeof sendUserMessageSchema>;
export type MarkAsReadType = z.infer<typeof markAsReadSchema>;
export type SendAdminReplyToGuestType = z.infer<
  typeof sendAdminReplyToGuestSchema
>;
export type SendAdminToGuestMessageType = z.infer<
  typeof sendAdminToGuestMessageSchema
>;
export type MessageResType = z.infer<typeof MessageResSchema>;
export type MessageWithRelationsType = z.infer<
  typeof MessageWithRelationsSchema
>;
export type ConversationResponseType = z.infer<
  typeof ConversationResponseSchema
>;
