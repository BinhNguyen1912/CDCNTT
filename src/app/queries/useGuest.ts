/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { guestApiRequests } from '@/apiRequest/guest';
import { useMutation, useQuery } from '@tanstack/react-query';

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

export const useGetGuestOrderListMutation = () => {
  return useQuery({
    queryKey: ['guest-orders'],
    queryFn: guestApiRequests.getGuestOrderList,
  });
};
