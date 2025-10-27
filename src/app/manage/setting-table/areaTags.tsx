'use client';

import { useState } from 'react';
import { useListArea, useDeleteAreaMutation } from '@/app/queries/useArea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'react-toastify';
import { AreaType } from '@/app/ValidationSchemas/area.schema';
import EditAreaDialog from '@/app/manage/setting-table/editAreaDialog';

interface AreaTagsProps {
  currentArea: string;
  onAreaChange: (areaId: string) => void;
  onAddArea: () => void;
}

export default function AreaTags({
  currentArea,
  onAreaChange,
  onAddArea,
}: AreaTagsProps) {
  const { data, isLoading, isError, refetch } = useListArea();
  const deleteAreaMutation = useDeleteAreaMutation();
  const [hoveredArea, setHoveredArea] = useState<number | null>(null);
  const [areaToDelete, setAreaToDelete] = useState<AreaType | null>(null);
  const [areaToEdit, setAreaToEdit] = useState<AreaType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const areaTags = data?.payload?.data || [];
  if (isLoading) {
    return <div>Đang tải khu vực...</div>;
  }

  if (isError) {
    return <div>Error loading areas</div>;
  }

  const handleDelete = async () => {
    if (!areaToDelete) return;

    try {
      await deleteAreaMutation.mutateAsync(areaToDelete.id);
      toast.success('Xóa khu vực thành công');
      setDeleteDialogOpen(false);
      setAreaToDelete(null);
    } catch (error) {
      toast.error('Xóa khu vực thất bại');
      console.error('Delete area error:', error);
    }
  };

  const handleEdit = (area: AreaType) => {
    setAreaToEdit(area);
    setEditDialogOpen(true);
  };

  const handleUpdateArea = () => {
    // Refresh list after editing
    refetch();
    setEditDialogOpen(false);
    setAreaToEdit(null);
  };

  return (
    <>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Khu vực</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddArea}
            className="h-8 px-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Thêm
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {areaTags?.map((area) => (
            <div
              key={area.id}
              className="relative group"
              onMouseEnter={() => setHoveredArea(area.id)}
              onMouseLeave={() => setHoveredArea(null)}
            >
              <button
                className="rounded-full text-sm font-medium transition-colors"
                onClick={() => onAreaChange(area.id.toString())}
              >
                <Badge
                  variant={'outline'}
                  className={`px-4 py-2 rounded-md transition-all ${
                    currentArea === area.id.toString()
                      ? 'bg-black/80 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {area.name}
                </Badge>
              </button>

              {/* Hover actions */}
              {hoveredArea === area.id && (
                <div className="absolute -top-6 -right-6 flex gap-1 bg-white rounded-full shadow-md p-1 border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(area);
                    }}
                  >
                    <Edit className="h-3 w-3 text-blue-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAreaToDelete(area);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <EditAreaDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        area={areaToEdit}
        onUpdateArea={handleUpdateArea}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa khu vực "{areaToDelete?.name}"? Hành
              động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteAreaMutation.isPending}
            >
              {deleteAreaMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
