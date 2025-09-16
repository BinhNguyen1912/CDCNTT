import { MediaResType } from '@/app/SchemaModel/media.schema';
import { UploadImageResType } from '@/app/schemaValidations/media.schema';
import http from '@/lib/http';

export const mediaApiRequest = {
  upload: (formData: FormData) => {
    return http.post<MediaResType>('/media/image/upload', formData);
  },
};
