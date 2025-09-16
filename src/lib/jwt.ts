import { TokenPayload } from '@/types/jwt.types';
import jwt from 'jsonwebtoken';

export const decode = (accessToken: string) => {
  return jwt.decode(accessToken) as TokenPayload;
};
