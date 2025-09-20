'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableData, TableStatus } from './types/table';
import { TableStatusValues } from '@/app/constants/table.constant';
import { keyof } from 'zod';

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: TableData;
  onSave: (table: TableData) => void;
}

export default function TableDialog({
  open,
  onOpenChange,
  table,
  onSave,
}: TableDialogProps) {
  const [name, setName] = useState(table.name);
  const [seats, setSeats] = useState(table.seats.toString());
  const [status, setStatus] = useState(table.status || TableStatusValues[0]);

  const handleSave = () => {
    const updatedTable = {
      ...table,
      name: name.trim(),
      seats: parseInt(seats) || table.seats,
      status,
    };
    onSave(updatedTable);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bàn</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin chi tiết cho bàn này.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên bàn
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="seats" className="text-right">
              Số chỗ ngồi
            </Label>
            <Input
              id="seats"
              type="number"
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Trạng thái
            </Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TableStatus)}
              className="col-span-3 border rounded px-2 py-1"
            >
              {TableStatusValues.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Loại</Label>
            <div className="col-span-3 text-sm text-gray-500">{table.type}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
