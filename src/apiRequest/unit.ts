import {
  unitBodyType,
  getAllUnitResType,
  unitResType,
} from '@/app/ValidationSchemas/unit.model';
import http from '@/lib/http';
const prefix = '/unit';
export const unitApiRequest = {
  list: () => http.get<getAllUnitResType>(`${prefix}`),
  create: (data: unitBodyType) => http.post<unitResType>(`${prefix}`, data),
  delete: (id: number) => http.delete<unitResType>(`${prefix}/${id}`),
  update: (id: number, data: unitBodyType) =>
    http.put<unitResType>(`${prefix}/${id}`, data),
};
