'use client';

import { Button } from '@/components/ui/button';
import {
  Save,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Plus,
  Maximize,
  Menu,
  Trash2,
} from 'lucide-react';
import { useDeleteAllTableNodeByAreaMutation } from '@/app/queries/useTableNode';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'react-toastify';

interface ToolbarProps {
  onSave: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAddArea: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  canUndo: boolean;
  canRedo: boolean;
  areaId: number;
}

export default function Toolbar({
  onSave,
  onZoomIn,
  onZoomOut,
  onFitView,
  onUndo,
  onRedo,
  onAddArea,
  onToggleSidebar,
  isSidebarOpen,
  canUndo,
  canRedo,
  areaId,
}: ToolbarProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const deleteAllMutation = useDeleteAllTableNodeByAreaMutation();
  const handleDeleteAll = () => setOpenConfirm(true);
  const handleConfirmDelete = () => {
    const resuft = deleteAllMutation.mutate(areaId);
    toast.success(`Xóa thành công`);
    setOpenConfirm(false);
  };
  return (
    <>
      <div className="bg-white border-b p-2 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onToggleSidebar}>
          <Menu className="h-4 w-4" />
        </Button>

        <Button onClick={onSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Lưu
        </Button>

        <Button onClick={onAddArea} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Thêm khu vực
        </Button>

        <Button
          onClick={handleDeleteAll}
          variant="outline"
          size="sm"
          className="ml-2"
          disabled={deleteAllMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleteAllMutation.isPending ? 'Đang xóa...' : 'Xóa tất cả'}
        </Button>

        <div className="h-6 border-l mx-2"></div>

        <Button variant="outline" size="icon" onClick={onZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={onZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={onFitView}>
          <Maximize className="h-4 w-4" />
        </Button>

        <div className="h-6 border-l mx-2"></div>

        <Button
          variant="outline"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tất cả bàn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tất cả bàn trong khu vực này? Hành động
              này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenConfirm(false)}>
              Hủy
            </Button>
            <Button
              variant="outline"
              onClick={handleConfirmDelete}
              disabled={deleteAllMutation.isPending}
            >
              {deleteAllMutation.isPending ? 'Đang xóa...' : 'Xóa tất cả'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
