export const ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  HIDDEN: 'HIDDEN',
} as const;

export type ProductStatusValues =
  (typeof ProductStatus)[keyof typeof ProductStatus];
