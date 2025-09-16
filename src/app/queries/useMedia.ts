import { mediaApiRequest } from '@/apiRequest/media';
import { useMutation } from '@tanstack/react-query';

export const useMediaUpload = () => {
  return useMutation({
    mutationFn: mediaApiRequest.upload,
  });
};
