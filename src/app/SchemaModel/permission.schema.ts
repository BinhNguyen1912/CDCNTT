import { HTTPMethod } from '@/app/constants/role.constant';
import z from 'zod';

export const PermissionSchema = z
  .object({
    id: z.number(),
    name: z
      .string({ message: 'Error.NameMustBeString' })
      .min(3, { message: 'Error.TooShort' })
      .max(50, { message: 'Error.TooLong' }),
    description: z
      .string({ message: 'Error.DescriptionMustBeString' })
      .optional(),
    path: z.string({ message: 'Error.PathMustBeString' }),
    method: z.nativeEnum(HTTPMethod),
    module: z.string({ message: 'Error.ModuleMustBeString' }).max(100),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
  })
  .strict();

export type PermissionType = z.infer<typeof PermissionSchema>;

export const PermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
  module: true,
});

export const PermissionIncludeCreateByAndUpdateBySchema =
  PermissionSchema.extend({
    createdBy: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .nullable(),
    updatedBy: z
      .object({
        id: z.number(),
        name: z.string(),
      })
      .nullable(),
  });
export const PagitionQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, 'Page phải là số')
    .transform((val) => parseInt(val))
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/, 'Limit phải là số')
    .transform((val) => parseInt(val))
    .default(10),
  orderBy: z.enum(['createdAt', 'id']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
});
export const GetListPermissionQuerySchema = PagitionQuerySchema;
export const GetListPermissionsResSchema = z.object({
  data: z.array(PermissionSchema),
  totalItem: z.number(),
  totalPage: z.number(),
  page: z.number().nullable(),
  limit: z.number().nullable(),
});

export const getParamsPermissionSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'ID phải là số')
    .transform((val) => parseInt(val)),
});
export const PermissionBodyResSchema = PermissionSchema;
export type GetParamsPermissionType = z.infer<typeof getParamsPermissionSchema>;
export type PermissionBodyType = z.infer<typeof PermissionBodySchema>;
export type PermissionBodyResType = PermissionType;
export type PermissionIncludeCreateByAndUpdateByType = z.infer<
  typeof PermissionIncludeCreateByAndUpdateBySchema
>;
export type GetListPermissionQueryType = z.infer<
  typeof GetListPermissionQuerySchema
>;
export type GetListPermissionsResType = z.infer<
  typeof GetListPermissionsResSchema
>;
