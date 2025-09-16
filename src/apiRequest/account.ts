import {
  ChangePasswordBodyType,
  UpdateMeBodyType,
} from '@/app/SchemaModel/profile.schema';
import {
  getProfileDetailResType,
  UpdateProfileResType,
} from '@/app/SchemaModel/user.schema';
import {
  AccountListResType,
  AccountResType,
  CreateEmployeeAccountBodyType,
  CreateGuestBodyType,
  CreateGuestResType,
  GetGuestListQueryParamsType,
  GetListGuestsResType,
  UpdateEmployeeAccountBodyType,
} from '@/app/schemaValidations/account.schema';
import http from '@/lib/http';
import queryString from 'query-string';
const prefix = '/profile';
export const accountApiRequests = {
  me: () => http.get<getProfileDetailResType>(`${prefix}`),
  update: (data: UpdateMeBodyType) => {
    console.log('data', data);
    return http.put<UpdateProfileResType>(`${prefix}/update-profile`, data);
  },
  changePassword: (body: ChangePasswordBodyType) =>
    http.put<UpdateProfileResType>(`${prefix}/ChangePassword`, body),
  sme: (accessToken: string) =>
    http.get<getProfileDetailResType>(`${prefix}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  list: () => http.get<AccountListResType>(`${prefix}`, {}),
  addEmployee: (body: CreateEmployeeAccountBodyType) =>
    http.post<AccountResType>(`${prefix}`, body),
  updateEmployee: (id: number, body: UpdateEmployeeAccountBodyType) =>
    http.put<AccountResType>(`${prefix}/detail/${id}`, body),
  getEmployee: (id: number) =>
    http.get<AccountResType>(`${prefix}/detail/${id}`),
  deleteEmployee: (id: number) =>
    http.delete<AccountResType>(`${prefix}/detail/${id}`),

  guestList: (queryParams: GetGuestListQueryParamsType) =>
    http.get<GetListGuestsResType>(
      `${prefix}/guests?` +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        }),
    ),
  createGuest: (body: CreateGuestBodyType) =>
    http.post<CreateGuestResType>(`${prefix}/guests`, body),
};
