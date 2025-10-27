/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { guestApiRequests } from '@/apiRequest/guest';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GuestOrdersQueryType } from '@/app/ValidationSchemas/guest.schema';

export const useGuestLoginMutation = () => {
  return useMutation({
    mutationFn: guestApiRequests.Login,
  });
};

export const useGuestLogoutMutation = () => {
  return useMutation({
    mutationFn: guestApiRequests.logout,
  });
};

export const useGuestOrderMutation = () => {
  return useMutation({
    mutationFn: guestApiRequests.order,
  });
};

export const useGetGuestOrderList = (params?: GuestOrdersQueryType) => {
  return useQuery({
    queryKey: ['guest-orders', params],
    queryFn: () => guestApiRequests.getGuestOrderList(),
    enabled: true,
  });
};
