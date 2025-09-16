import { TypeOfVerification, UserStatus } from '@/app/constants/auth.constant';
import { Role } from '@/app/constants/type';
import z from 'zod';
export const UserSchema = z.object({
  id: z.number().positive(),
  email: z
    .string()
    .email({ message: 'Invalid email address' })
    .trim()
    .min(5)
    .max(64),
  password: z.string({ message: 'Password must be string' }).min(6).max(32),
  name: z.string({ message: 'Name must be string' }).min(2).max(32),
  avatar: z.string().url().nullable().optional(),
  phoneNumber: z.string().min(10).max(15).nullable().optional(),
  status: z
    .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED])
    .default(UserStatus.INACTIVE),
  roleId: z.number().positive(),
  totpSecret: z.string().nullable().optional(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const verificationCodeSchema = UserSchema.pick({ email: true }).extend({
  code: z
    .string({ message: 'Error.CodeMustBeString' })
    .min(6, { message: 'Error.TooShort' })
    .max(6, { message: 'Error.TooLong' }),
  type: z.enum(
    [
      TypeOfVerification.REGISTER,
      TypeOfVerification.FORGOT_PASSWORD,
      TypeOfVerification.LOGIN,
      TypeOfVerification.DISABLE_2FA,
    ],
    {
      message: 'Error.InvalidVerificationCodeType',
    }
  ),
  id: z.number().optional(),
  expiresAt: z.date(),
  createdAt: z.date().optional(),
});

export const otpBodySchema = verificationCodeSchema.pick({
  email: true,
  type: true,
});
export type OtpBodyType = z.TypeOf<typeof otpBodySchema>;
export const otpResSchema = verificationCodeSchema;
export const LoginBody = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  })
  .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    account: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      role: z.enum([Role.Owner, Role.Employee]),
    }),
  }),
  message: z.string(),
});

export type LoginResType = z.TypeOf<typeof LoginRes>;

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>;

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  message: z.string(),
});

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>;

export const LogoutBody = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>;

export const LoginGoogleQuery = z.object({
  code: z.string(),
});

export type LoginGoogleQueryType = z.TypeOf<typeof LoginGoogleQuery>;
