'use client';

import { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch'; // Import Switch component
import { useUpdateAreaMutation } from '@/app/queries/useArea';
import { toast } from 'react-toastify';
import { AreaType } from '@/app/ValidationSchemas/area.schema';

interface EditAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area: AreaType | null;
  onUpdateArea?: (name: string) => void;
}

export default function EditAreaDialog({
  open,
  onOpenChange,
  area,
  onUpdateArea,
}: EditAreaDialogProps) {
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const updateAreaMutation = useUpdateAreaMutation();

  useEffect(() => {
    if (area) {
      setName(area.name);
      setIsActive(area.isActive);
    }
  }, [area]);

  const handleUpdate = async () => {
    if (!name.trim() || !area) return;

    try {
      await updateAreaMutation.mutateAsync({
        id: area.id,
        name: name.trim(),
        isActive: isActive, // Sử dụng giá trị từ switch
      });

      toast.success('Cập nhật khu vực thành công');
      setName('');
      onOpenChange(false);

      if (onUpdateArea) {
        onUpdateArea(name);
      }
    } catch (error) {
      toast.error('Cập nhật khu vực thất bại');
      console.error('Update area error:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && updateAreaMutation.isPending) {
      return;
    }
    onOpenChange(newOpen);
    if (!newOpen) {
      setName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khu vực</DialogTitle>
          <DialogDescription>Cập nhật thông tin khu vực này.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Tên khu vực
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Tên khu vực"
              disabled={updateAreaMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="text-right">
              Trạng thái
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={updateAreaMutation.isPending}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateAreaMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={!name.trim() || updateAreaMutation.isPending}
          >
            {updateAreaMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
