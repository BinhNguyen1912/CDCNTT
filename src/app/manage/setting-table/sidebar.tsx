'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, X } from 'lucide-react';
import { Area, FurnitureType, TableData } from './types/table';
import { AreaType } from '@/app/ValidationSchemas/area.schema';
import AreaTags from '@/app/manage/setting-table/areaTags';
import { furnitureCategories } from '@/app/manage/setting-table/data/tables';

interface SidebarProps {
  onAddTable: (table: TableData) => void;
  currentArea: string;
  onAreaChange: (areaId: string) => void;
  onViewTableLayout: () => void;
  areas: AreaType[];
  onAddArea: () => void;
  onEditArea: (area: AreaType) => void;
  onDeleteArea: (areaId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  onAddTable,
  currentArea,
  onAreaChange,
  onViewTableLayout,
  areas,
  onAddArea,
  onEditArea,
  onDeleteArea,
  isOpen,
  onClose,
}: SidebarProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<FurnitureType>('table');

  const handleDragStart = (event: React.DragEvent, table: TableData) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(table));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className={`w-80 bg-gray-100 p-4 h-full flex flex-col overflow-y-auto fixed left-0 top-0 z-50 shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Thiết kế bàn ăn</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <AreaTags
        currentArea={currentArea}
        onAreaChange={onAreaChange}
        onAddArea={onAddArea}
      />

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Chọn nội thất</h3>
        <div className="flex flex-wrap gap-2">
          {furnitureCategories.map((category) => (
            <Button
              key={category.id}
              variant={
                selectedCategory === category.type ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => setSelectedCategory(category.type)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* <div className="mb-6">
        <Button className="w-full" onClick={onViewTableLayout}>
          <Eye className="h-4 w-4 mr-2" />
          Xem sơ đồ theo bàn
        </Button>
      </div> */}

      <div className="mb-6 flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Sắp xếp vị trí</h3>

        <div className="space-y-4">
          {furnitureCategories
            .filter((category) => category.type === selectedCategory)
            .map((category) => (
              <div key={category.id}>
                <h4 className="font-medium mb-2">{category.name}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {category.items.map((item: any) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      onClick={() => onAddTable(item)}
                    >
                      <CardContent className="p-3 flex flex-col items-center">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 mb-2 object-contain"
                        />
                        <div className="text-sm text-center">{item.name}</div>
                        {item.seats > 0 && (
                          <div className="text-xs text-gray-500">
                            {item.seats} chỗ
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
