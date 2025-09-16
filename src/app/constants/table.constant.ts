export const TableStatus = {
  AVAILABLE: 'AVAILABLE', // Bàn trống
  OCCUPIED: 'OCCUPIED', // Bàn đang có khách
  RESERVED: 'RESERVED', // Bàn đã được đặt trước
  OUT_OF_SERVICE: 'OUT_OF_SERVICE', // Bàn hỏng hoặc không sử dụng được
  HIDE: 'HIDE', //Bàn ẩn
} as const;
export const TableStatusValues = [
  TableStatus.AVAILABLE,
  TableStatus.OCCUPIED,
  TableStatus.OUT_OF_SERVICE,
  TableStatus.RESERVED,
  TableStatus.HIDE,
] as const;
