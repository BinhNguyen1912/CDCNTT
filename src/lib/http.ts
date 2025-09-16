/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoginResType } from '@/app/SchemaModel/auth.schema';
import envConfig from '@/config';
import {
  getAccessTokenFormLocalStorage,
  normalizePath,
  removeTokensFormLocalStorage,
  setAccessTokenFormLocalStorage,
  setRefreshTokenFormLocalStorage,
} from '@/lib/utils';
import { redirect } from 'next/navigation';

//KHI ỬU DỤNG COOKIE , ACCESS TOKEN HẾT HẠN , SẼ TỰ ĐỘNG XÓA RA KHỎI COOKIE
type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string | undefined; // baseUrl = '' => gửi lên server của NextJsa
};

const ENTITY_ERROR_STATUS = 422;
const AUTHENTICATION_ERROR_STATUS = 401;

type EntityErrorPayload = {
  message: string;
  errors: {
    path: string;
    message: string;
  }[];
};

export class HttpError extends Error {
  status: number;
  payload: {
    message: string;
    [key: string]: any;
  };
  constructor({
    status,
    payload,
    message = 'Lỗi',
  }: {
    status: number;
    payload: any;
    message?: string;
  }) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.message = message;
  }
}

export class EntityError extends HttpError {
  status: typeof ENTITY_ERROR_STATUS;
  payload: EntityErrorPayload;
  constructor({
    status,
    payload,
  }: {
    status: typeof ENTITY_ERROR_STATUS;
    payload: EntityErrorPayload;
  }) {
    super({ status, payload, message: 'Lỗi thực thể' });
    this.status = status;
    this.payload = payload;
  }
}

let clientLogoutRequest: null | Promise<any> = null;
const isClient = typeof window !== 'undefined';
const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options?: CustomOptions | undefined,
) => {
  let body: FormData | string | undefined = undefined;
  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body) {
    body = JSON.stringify(options.body);
  }
  const baseHeaders: {
    [key: string]: string;
  } =
    body instanceof FormData
      ? {}
      : {
          'Content-Type': 'application/json',
        };
  if (isClient) {
    const accessToken = getAccessTokenFormLocalStorage();

    if (accessToken) {
      baseHeaders.authorization = `Bearer ${accessToken}`;
    }
    // if (url !== '/auth/logout' && url !== '/auth/login') {
    //   throw Error('accessToken bị thiếu ở http nè cha');
    // }
  }
  // Nếu không truyền baseUrl (hoặc baseUrl = undefined) thì lấy từ envConfig.NEXT_PUBLIC_API_ENDPOINT
  // Nếu truyền baseUrl thì lấy giá trị truyền vào, truyền vào '' thì đồng nghĩa với việc chúng ta gọi API đến Next.js Server

  const baseUrl =
    options?.baseUrl === undefined
      ? envConfig.NEXT_PUBLIC_API_ENDPOINT
      : options.baseUrl;

  const fullUrl = `${baseUrl}/${normalizePath(url)}`;

  const res = await fetch(fullUrl, {
    ...options,
    headers: {
      ...baseHeaders,
      ...options?.headers,
    } as any,
    body,
    method,
  });

  const payload: Response = await res.json();
  const data = {
    status: res.status,
    payload,
  };
  // Interceptor là nời chúng ta xử lý request và response trước khi trả về cho phía component
  if (!res.ok) {
    if (res.status === ENTITY_ERROR_STATUS) {
      throw new EntityError(
        data as {
          status: 422;
          payload: EntityErrorPayload;
        },
      );
    } else if (res.status === AUTHENTICATION_ERROR_STATUS) {
      if (isClient) {
        if (!clientLogoutRequest) {
          clientLogoutRequest = fetch('/api/auth/logout', {
            method: 'POST',
            body: null, //logout mình sẽ cho phép luôn luôn thành công , nếu accessToken hết hạn -> vẫn cho logout bằng các xóa access trong cookie và localStorage , vì nếu token hết hạn sao logout để login lại
            headers: {
              ...baseHeaders,
            } as any,
          });
          try {
            await clientLogoutRequest;
          } catch (error: any) {
          } finally {
            //VỪA THAY 2 DÒNG CHỖ NÀY (X)
            removeTokensFormLocalStorage();
            clientLogoutRequest = null;
            //Redirect về login có thể loop vô hạn nếu không được xử lý đúng cách
            //nếu rơi vào trường hợp tại trang login , Chúng ta có gọi các API cần ACCESS_TOKEN
            //Mà access token bị xóa , thì nó nhảy vào đây , và cứ thế sẽ bị lặp
            location.href = '/auth/login';
          }
        }
      } else {
        const accessToken = (options?.headers as any)?.Authorization.split(
          'Bearer ',
        )[1];

        redirect(`/auth/logout?accessToken=${accessToken}`);
      }
    } else {
      throw new HttpError({
        payload: data.payload,
        status: data.status,
        message: (data.payload as any).message,
      });
    }
  }

  // Đảm bảo logic dưới đây chỉ chạy ở phía client (browser)
  if (isClient) {
    const normalizeUrl = normalizePath(url);

    if (
      //   ['auth/login', 'auth/register'].some(
      //     (item) => item === normalizePath(url)
      //   )
      ['api/auth/login', 'api/guest/auth/login'].includes(normalizeUrl)
    ) {
      const { accessToken, refreshToken } = payload as LoginResType;
      setAccessTokenFormLocalStorage(accessToken);
      setRefreshTokenFormLocalStorage(refreshToken);
    } else if ('api/auth/token'.includes(normalizeUrl)) {
      const { accessToken, refreshToken } = payload as LoginResType;
      setAccessTokenFormLocalStorage(accessToken);
      setRefreshTokenFormLocalStorage(refreshToken);
    } else if (
      ['api/auth/logout', 'api/guest/auth/logout'].includes(normalizeUrl)
    ) {
      removeTokensFormLocalStorage();
    }
  }
  return data;
};

const http = {
  get<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined,
  ) {
    return request<Response>('GET', url, options);
  },
  post<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, 'body'> | undefined,
  ) {
    return request<Response>('POST', url, { ...options, body });
  },
  put<Response>(
    url: string,
    body: any,
    options?: Omit<CustomOptions, 'body'> | undefined,
  ) {
    return request<Response>('PUT', url, { ...options, body });
  },
  delete<Response>(
    url: string,
    options?: Omit<CustomOptions, 'body'> | undefined,
  ) {
    return request<Response>('DELETE', url, { ...options });
  },
};

export default http;
