import http from '@/lib/http';

export const revalidateApiRequest = (tag: string) => {
  return http.get(`/api/revalidate?tag=${tag}`, {
    baseUrl: '',
  });
};
