import { Role } from '@/app/constants/type';
import {
  Home,
  LineChart,
  ShoppingCart,
  Users2,
  Salad,
  Table,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Đơn hàng',
    Icon: ShoppingCart,
    href: '/manage/orders',
    roles: [Role.STAFF, Role.ADMIN],
  },
  {
    title: 'Bàn ăn',
    Icon: Table,
    href: '/manage/tables',
    roles: [Role.ADMIN, Role.STAFF],
  },
  {
    title: 'Món ăn',
    Icon: Salad,
    href: '/manage/products',
    roles: [Role.ADMIN, Role.STAFF],
  },

  {
    title: 'Phân tích',
    Icon: LineChart,
    href: '/manage/analytics',
    roles: [Role.ADMIN],
  },
  {
    title: 'Nhân viên',
    Icon: Users2,
    href: '/manage/accounts',
    roles: [Role.STAFF],
  },
];

export default menuItems;
