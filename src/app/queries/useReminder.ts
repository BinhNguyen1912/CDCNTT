import { reminderRequestApi } from '@/apiRequest/reminder';
import {
  CreateReminderType,
  UpdateReminderType,
} from '@/app/ValidationSchemas/reminder.schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query hooks
export const useGetReminderList = () => {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: reminderRequestApi.list,
  });
};

export const useGetRemindersByRole = (
  roleId: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['reminders', 'role', roleId],
    queryFn: () => reminderRequestApi.getByRole(roleId),
    enabled,
  });
};

export const useGetReminderDetail = ({
  id,
  enabled,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['reminders', id],
    queryFn: () => reminderRequestApi.getDetail(id),
    enabled,
  });
};

export const useGetReminderLogs = ({
  id,
  enabled,
}: {
  id: number;
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ['reminders', id, 'logs'],
    queryFn: () => reminderRequestApi.getLogs(id),
    enabled,
  });
};

// Mutation hooks
export const useCreateReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReminderType) => reminderRequestApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reminders'],
      });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateReminderType & { id: number }) =>
      reminderRequestApi.update(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reminders'],
      });
      queryClient.invalidateQueries({
        queryKey: ['reminders', variables.id],
      });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reminderRequestApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reminders'],
      });
    },
  });
};

export const useCompleteReminderLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, logId }: { id: number; logId: number }) =>
      reminderRequestApi.completeLog(id, logId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['reminders', variables.id, 'logs'],
      });
      queryClient.invalidateQueries({
        queryKey: ['reminders', variables.id],
      });
    },
  });
};
