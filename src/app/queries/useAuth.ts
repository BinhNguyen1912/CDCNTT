/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { authApiRequests } from '@/apiRequest/auth';
import { useMutation } from '@tanstack/react-query';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: authApiRequests.Login,
  });
};
export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: authApiRequests.register,
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: authApiRequests.logout,
  });
};

export const useSetTokenToCookie = () => {
  return useMutation({
    mutationFn: authApiRequests.setTokenToCookie,
  });
};

export const useSendOTPMutation = () => {
  return useMutation({
    mutationFn: authApiRequests.sentOtp,
  });
};
