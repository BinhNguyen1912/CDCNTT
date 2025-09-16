import { PermissionSchema } from '@/app/SchemaModel/permission.schema';
import { z } from 'zod';
const REQUEST_ROLE_KEY = 'role';
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
// export const RolePermissionsShema = RoleSchema.extend({
//   permission: z.array(PermissionSchema),
// })
export type RoleType = z.infer<typeof RoleSchema>;
// export type RolePermissionsType = z.infer<typeof RolePermissionsShema>

export const RoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).strict();
export const RoleBodyResSchema = RoleSchema;

export const GetRoleWithPermissonResSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
});
export const GetRolesResSchema = z.object({
  data: z.array(RoleSchema),
  totalItems: z.number(),
  totalPages: z.number(),
  page: z.number(),
  limit: z.number(),
});

//z.coerce giúp bạn chấp nhận đầu vào là string, number, Date... và tự ép về kiểu đúng.
//.positive()	Ràng buộc: phải là số dương (> 0)
export const getRoleQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict();
export const getRoleParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
  })
  .strict();

export const updateRoleBodySchema = RoleSchema.pick({
  isActive: true,
  name: true,
  description: true,
})
  .extend({
    permissionIds: z.array(z.number()),
  })
  .strict();

export type RoleBodyType = z.infer<typeof RoleBodySchema>;
export type RoleBodyResType = z.infer<typeof RoleBodyResSchema>;
export type GetRoleWithPermissionResType = z.infer<
  typeof GetRoleWithPermissonResSchema
>;
export type GetRolesResType = z.infer<typeof GetRolesResSchema>;
export type GetRoleQueryType = z.infer<typeof getRoleQuerySchema>;
export type GetRoleParamsType = z.infer<typeof getRoleParamsSchema>;
export type UpdateRoleBodyType = z.infer<typeof updateRoleBodySchema>;
