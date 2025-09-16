import { Role, TokenType } from '@/app/constants/type';

export type TokenTypeValue = (typeof TokenType)[keyof typeof TokenType];
export type RoleType = (typeof Role)[keyof typeof Role];
export interface AccessTokenPayloadCreate {
  userId: number;
  roleId: number;
  roleName: RoleType;
}
export interface TokenPayload extends AccessTokenPayloadCreate {
  iat: number;
  exp: number;
}

export interface TableTokenPayload {
  iat: number;
  number: number;
  tokenType: (typeof TokenType)['TableToken'];
}
