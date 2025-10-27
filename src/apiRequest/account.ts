import {
  ChangePasswordBodyType,
  UpdateMeBodyType,
} from '@/app/ValidationSchemas/profile.schema';
import {
  getListUsersType,
  getProfileDetailResType,
  UpdateProfileResType,
  UpdateUserBodyType,
  UserBodyType,
  UserType,
  UserTypeWithRolePermissions,
} from '@/app/ValidationSchemas/user.schema';
import {
  GuestListQueryType,
  GuestListType,
  CreateGuestType,
  GuestType,
  CallStaffType,
} from '@/app/ValidationSchemas/guest.schema';

import http from '@/lib/http';
import queryString from 'query-string';
const prefix = '/profile';
const userProfix = '/users';
export const accountApiRequests = {
  me: () => http.get<getProfileDetailResType>(`${prefix}`),
  update: (data: UpdateMeBodyType) => {
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
  list: () => http.get<getListUsersType>(`${userProfix}`, {}),
  addUser: (body: UserBodyType) => http.post<UserType>(`${userProfix}`, body),
  updateUser: (id: number, body: UpdateUserBodyType) =>
    http.put<UpdateProfileResType>(`${userProfix}/${id}`, body),
  getUser: (id: number) =>
    http.get<UserTypeWithRolePermissions>(`${userProfix}/${id}`),
  deleteUser: (id: number) => http.delete<UserType>(`${userProfix}/${id}`),
  guestList: (queryParams: GuestListQueryType) =>
    http.get<GuestListType>(
      `/guest/listGuests?` +
        queryString.stringify({
          page: queryParams.page,
          limit: queryParams.limit,
        }),
    ),
  createGuest: (data: CreateGuestType) =>
    http.post<GuestType>(`${userProfix}/create-guest`, data),
  callStaff: (data: CallStaffType) => http.post(`/guest/call-staff`, data),
};
