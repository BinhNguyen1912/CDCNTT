import { z } from 'zod';

export const MediaResSchema = z
  .object({
    data: z.array(
      z.object({
        url: z.string().url(),
        mimeType: z.string(),
        fileName: z.string(),
      }),
    ),
  })
  .strict();
export type MediaResType = z.infer<typeof MediaResSchema>;
