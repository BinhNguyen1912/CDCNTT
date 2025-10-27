import {
  CreateProductBodyType,
  GetListProductsResType,
  GetManageProductQueryType,
  GetProductDetailType,
  GetProductQuerySchema,
  UpdateProductBodyType,
} from '@/app/ValidationSchemas/product.schema';

import http from '@/lib/http';

const prefix = '/product';
const ManagerPrefix = '/manage-product/products';
export const productsApiRequest = {
  create: (data: CreateProductBodyType) =>
    http.post<GetProductDetailType>(`${ManagerPrefix}`, data),

  // Hàm lấy danh sách sản phẩm
  getProductList_Manage: (query: Partial<GetManageProductQueryType> = {}) => {
    // Validate query bằng Zod
    const validatedQuery = GetProductQuerySchema.parse(query);

    // Chuyển các param thành query string
    const params = new URLSearchParams();
    Object.entries(validatedQuery).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.append(key, String(value));
        }
      }
    });

    // Gọi API
    return http.get<GetListProductsResType>(
      `${ManagerPrefix}?${params.toString()}`,
    );
  },
  update: (id: number, data: UpdateProductBodyType) =>
    http.put<GetProductDetailType>(`${ManagerPrefix}/${id}`, data),
  //Mặc định Next15 thì fetch là {cache: 'no-cache' -> dynamic rendering}, hiện tại Next14 mặc định là {cache: 'force-cache'} nghĩa là cache static rendering

  //Bây giờ mình sẽ dùng tag để dùng Fn : RevalidateTag để nó Build cho những file Static Rendering
  getListProduct: () =>
    http.get<GetListProductsResType>(`${prefix}`, {
      next: { tags: ['dishes'] },
    }),

  delete: (id: number) =>
    http.delete<GetProductDetailType>(`${ManagerPrefix}/${id}`),

  getProduct: (id: number) =>
    http.get<GetProductDetailType>(`${prefix}/detail/${id}`),
};

export default productsApiRequest;
