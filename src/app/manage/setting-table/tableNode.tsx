'use client';

import { useState } from 'react';
import { Handle, Position, useUpdateNodeInternals } from 'reactflow';
import { Button } from '@/components/ui/button';
import { RotateCcw, X } from 'lucide-react';
import { TableNodeData, TableStatus } from './types/table';
import Image from 'next/image';
import TableDialog from '@/app/manage/setting-table/tableDialog';
import { TableStatusValues } from '@/app/constants/table.constant';
import { Badge } from '@/components/ui/badge';
import { getVietnameseTableStatus } from '@/lib/utils';

interface TableNodeProps {
  data: TableNodeData;
  selected?: boolean;
}

export default function TableNode({ data, selected }: TableNodeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const updateNodeInternals = useUpdateNodeInternals();

  const handleRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRotation = ((data.rotation || 0) + 45) % 360;
    data.onRotate?.(data.id, newRotation);
    updateNodeInternals(data.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete?.(data.id);
  };

  const handleNodeClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="relative" onClick={handleNodeClick}>
        <Handle
          type="target"
          position={Position.Top}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
        <div
          className={`rounded-lg ${selected ? 'border' : ''}  transition-all `}
        >
          <div className="flex flex-col items-center">
            <div className="relative">
              <Image
                src={data.imageUrl}
                alt={data.name}
                width={data.width}
                height={data.height}
                style={{
                  transform: `rotate(${data.rotation || 0}deg)`,
                  width: data.width,
                  height: data.height,
                }}
                className="transition-transform duration-200"
              />
              {data.type === 'square' || data.type === 'round' ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px]">
                  <div>
                    <div
                      className={`text-[12px] p-1 rounded-sm ${
                        data.status?.toUpperCase() === 'AVAILABLE'
                          ? 'bg-green-100 text-green-700'
                          : data.status?.toUpperCase() === 'OCCUPIED'
                            ? 'bg-yellow-100 text-yellow-700'
                            : data.status?.toUpperCase() === 'RESERVED'
                              ? 'bg-blue-100 text-blue-700'
                              : data.status?.toUpperCase() === 'OUT_OF_SERVICE'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {getVietnameseTableStatus(
                        data.status.toLocaleUpperCase(),
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
              {selected && (
                <div className="absolute -top-7 -right-7 flex items-center gap-3 ">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-2 w-2 text-black"
                    onClick={handleRotate}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 rounded-full text-red"
                    onClick={handleDelete}
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-1 text-xs font-medium">{data.name}</div>
            {data.type === 'square' || data.type === 'round' ? (
              <div className="text-xs text-gray-500">{data.seats} chỗ</div>
            ) : null}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
      </div>
      <TableDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        table={data}
        onSave={(updatedData) => {
          data.onEdit?.(data.id, updatedData);
        }}
      />
    </>
  );
}
