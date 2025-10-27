import { RoleType } from '@/app/ValidationSchemas/role.schema';

export const REQUEST_ROLE_KEY = 'role';
export const roleName = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  GUEST: 'GUEST',
  USER: 'USER',
} as const;

export function getVietNameseRole(role: keyof typeof roleName) {
  switch (role) {
    case roleName.ADMIN:
      return 'Chủ cửa hàng';
    case roleName.STAFF:
      return 'Nhân viên';
    case roleName.GUEST:
      return 'Khách hàng';
    default:
      return 'Người dùng';
  }
}

export const HTTPMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export type roleNameType = (typeof roleName)[keyof typeof roleName];
