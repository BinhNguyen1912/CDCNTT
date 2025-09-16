import { UserStatus } from '@/app/constants/auth.constant';
import { PermissionSchema } from '@/app/SchemaModel/permission.schema';
import { RoleSchema } from '@/app/SchemaModel/role.schema';
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

export const getProfileDetailResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
}).extend({
  role: RoleSchema.pick({ name: true, id: true }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        method: true,
        name: true,
        path: true,
        module: true,
      }).strip(),
    ),
  }),
});

export const UpdateProfileResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>;
export type UserType = z.infer<typeof UserSchema>;
export type getProfileDetailResType = z.infer<typeof getProfileDetailResSchema>;
