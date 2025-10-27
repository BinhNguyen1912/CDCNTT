import {
  GetRolesResType,
  RoleBodyResType,
} from '@/app/ValidationSchemas/role.schema';
import {
  CreateTableBodyType,
  TableDetailResType,
  TableListResType,
  UpdateTableBodyType,
} from '@/app/ValidationSchemas/table.schema';

import http from '@/lib/http';

const prefix = '/role';
export const roleRequestApi = {
  list: () => http.get<GetRolesResType>(`${prefix}`),
  //   getDetail: (id: number) =>
  //     http.get<TableDetailResType>(`${prefix}/getTableDetail/${id}`),
  //   create: (data: CreateTableBodyType) =>
  //     http.post<TableDetailResType>(`${prefix}`, data),
  //   put: (id: number, data: UpdateTableBodyType) =>
  //     http.put<TableDetailResType>(`${prefix}/${id}`, data),
  //   delete: (id: number) => http.delete<TableDetailResType>(`${prefix}/${id}`),
};
