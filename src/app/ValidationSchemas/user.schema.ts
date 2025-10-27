import { UserStatus } from '@/app/constants/auth.constant';
import {
  PermissionSchema,
  PermissionType,
} from '@/app/ValidationSchemas/permission.schema';
import { RoleSchema } from '@/app/ValidationSchemas/role.schema';
import { RoleType } from '@/types/jwt.types';
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
  avatar: z.string().nullable().optional(),
  phoneNumber: z.string().min(10).max(15).nullable().optional(),
  status: z
    .enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED])
    .default(UserStatus.INACTIVE),
  roleId: z.number().positive(),
  totpSecret: z.string().nullable().optional(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
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

export const UserBodySchema = UserSchema.pick({
  email: true,
  password: true,
  phoneNumber: true,
  name: true,
  avatar: true,
  roleId: true,
  status: true,
})
  .extend({
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
      .default('ACTIVE')
      .optional(),
  })
  .strict();
export const UpdateUserBodySchema = UserBodySchema.omit({
  password: true,
})
  .extend({
    changePassword: z.boolean(),
    newPassword: z.string().nullable().optional(),
    confirmNewPassword: z.string().nullable().optional(),
    status: z
      .enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
      .default('ACTIVE')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.changePassword) {
      if (!data.newPassword || !data.confirmNewPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Vui lòng nhập đầy đủ mật khẩu mới và xác nhận.',
          path: ['newPassword'],
        });
      } else if (data.newPassword !== data.confirmNewPassword) {
        ctx.addIssue({
          code: 'custom',
          message: 'Mật khẩu xác nhận không khớp.',
          path: ['confirmNewPassword'],
        });
      }
    }
  });
export const UserResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});
export const GetParamsUserSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const GetUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});
export const getListUsersSchema = z.object({
  data: z.array(
    UserSchema.omit({
      password: true,
      totpSecret: true,
    }).extend({
      role: RoleSchema.pick({
        name: true,
        id: true,
      }),
    }),
  ),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type UserResType = z.infer<typeof UserResSchema>;
export type UserBodyType = z.infer<typeof UserBodySchema>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;
export type GetParamsUserType = z.infer<typeof GetParamsUserSchema>;
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>;
export type getListUsersType = z.infer<typeof getListUsersSchema>;
export type UserTypeWithRolePermissions = UserType & {
  role: RoleType & { permissions: PermissionType[] };
};
