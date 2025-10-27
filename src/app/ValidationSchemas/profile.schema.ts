import { UserSchema } from '@/app/ValidationSchemas/user.schema';
import z from 'zod';

export const UpdateMeBodySchema = UserSchema.pick({
  avatar: true,
  name: true,
  phoneNumber: true,
}).partial();
export const ChangePassWordBodySchema = UserSchema.pick({
  password: true,
})
  .extend({
    newPassword: z
      .string({ message: 'Error.PasswordMustBeString' })
      .min(6, { message: 'Error.TooShort' })
      .max(15, { message: 'Error.TooLong' }),
    confirmPassword: z
      .string({ message: 'Error.PasswordMustBeString' })
      .min(6, { message: 'Error.TooShort' })
      .max(15, { message: 'Error.TooLong' }),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword != data.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Error.PasswordNotMatch',
      });
    }
  });

export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>;
export type ChangePasswordBodyType = z.infer<typeof ChangePassWordBodySchema>;
