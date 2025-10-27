import {
  CreateTableBodyType,
  TableDetailResType,
  TableListResType,
  UpdateTableBodyType,
} from '@/app/ValidationSchemas/table.schema';

import http from '@/lib/http';

const prefix = '/tables';
export const tableRequestApi = {
  list: (params?: { areaId?: number }) =>
    http.get<TableListResType>(`${prefix}`),
  getDetail: (id: number) =>
    http.get<TableDetailResType>(`${prefix}/getTableDetail/${id}`),
  create: (data: CreateTableBodyType) =>
    http.post<TableDetailResType>(`${prefix}`, data),
  put: (id: number, data: UpdateTableBodyType) =>
    http.put<TableDetailResType>(`${prefix}/${id}`, data),
  delete: (id: number) => http.delete<TableDetailResType>(`${prefix}/${id}`),
};
