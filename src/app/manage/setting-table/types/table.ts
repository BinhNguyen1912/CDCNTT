export interface TablePosition {
  x: number;
  y: number;
}
export type TableStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'OUT_OF_SERVICE'
  | 'RESERVED'
  | 'HIDE';
export type FurnitureType =
  | 'table'
  | 'door'
  | 'counter'
  | 'decoration'
  | 'wall';
export type TableCategory = {
  id: string;
  type: FurnitureType;
  name: string;
  items: TableData[];
};
export interface TableData {
  id: string;
  type: string;
  name: string;
  seats: number;
  position: TablePosition;
  rotation?: number;
  width: number;
  height: number;
  imageUrl: string;
  status: TableStatus;
  areaId: string;
}

export interface TableNodeData extends TableData {
  onRotate?: (id: string, rotation: number) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updated: Partial<TableData>) => void;
}

export interface FurnitureCategory {
  id: string;
  name: string;
  type: FurnitureType;
  items: TableData[];
}

export interface Area {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableLayout {
  id: string;
  name: string;
  areaId: string;
  tables: TableData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AreaMenuProps {
  area: Area;
  onEdit: (area: Area) => void;
  onDelete: (areaId: string) => void;
}
