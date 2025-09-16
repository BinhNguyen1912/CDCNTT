// export const UPLOAD_DIR = path.resolve('upload')
export const GetAllLanguages = 'all';

export const OrderBy = {
  Asc: 'asc',
  Desc: 'desc',
} as const;
export const SortBy = {
  CreatedAt: 'createdAt',
  Sale: 'sale',
  Price: 'price',
} as const;

export const PREFIX_PAYMENT_CODE = 'DH';
export type OrderByType = (typeof OrderBy)[keyof typeof OrderBy];
export type SortByType = (typeof SortBy)[keyof typeof SortBy];
