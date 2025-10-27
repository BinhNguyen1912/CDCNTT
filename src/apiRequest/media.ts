import { MediaResType } from '@/app/ValidationSchemas/media.schema';
import { UploadImageResType } from '@/app/ValidationSchemas/media.schema';
import http from '@/lib/http';

export const mediaApiRequest = {
  upload: (formData: FormData) => {
    return http.post<MediaResType>('/media/image/upload', formData);
  },
};
