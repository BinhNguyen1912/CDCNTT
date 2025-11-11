export const RepeatModeType = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  ONCE: 'ONCE',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  NONE: 'NONE',
} as const;

export const StatusReminder = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  MISSED: 'MISSED',
} as const;
export const RepeatModeTypeValues = Object.values(RepeatModeType);
export type RepeatModeType =
  (typeof RepeatModeType)[keyof typeof RepeatModeType];
export type StatusReminder =
  (typeof StatusReminder)[keyof typeof StatusReminder];
