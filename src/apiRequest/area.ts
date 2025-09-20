import {
  AreaBodyType,
  AreaResType,
  GetListAreaResType,
  UpdateAreaBodyType,
} from '@/app/SchemaModel/area.schema';
import http from '@/lib/http';
const prefix = '/area';
export const areaRequestApi = {
  list: () => http.get<GetListAreaResType>(`${prefix}`),
  getDetail: (id: number) => http.get<AreaResType>(`${prefix}/${id}`),
  create: (data: AreaBodyType) => http.post<AreaResType>(`${prefix}`, data),
  put: (id: number, data: UpdateAreaBodyType) =>
    http.put<AreaResType>(`${prefix}/${id}`, data),
  delete: (id: number) => http.delete<AreaResType>(`${prefix}/${id}`),
};
