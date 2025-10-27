'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowInstance,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  useListTableNode,
  useCreateTableNodeMutation,
  useDeleteTableNodeMutation,
  useUpdateTableNodeMutation,
} from '@/app/queries/useTableNode';
import {
  TableNodeBodyType,
  UpdateTableNodeBodyType,
} from '@/app/ValidationSchemas/table-node.schema';
import { toast } from 'react-toastify';
import EditAreaDialog from '@/app/manage/setting-table/editAreaDialog';
import TableNode from '@/app/manage/setting-table/tableNode';
import { AreaType } from '@/app/ValidationSchemas/area.schema';
import { useListArea } from '@/app/queries/useArea';
import { TableData } from '@/app/manage/setting-table/types/table';
import Sidebar from '@/app/manage/setting-table/sidebar';
import Toolbar from '@/app/manage/setting-table/toolbar';
import AddAreaDialog from '@/app/manage/setting-table/addAreaDialog';

const nodeTypes: NodeTypes = {
  table: TableNode,
};

export default function TableManagementPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [currentArea, setCurrentArea] = useState<number>(1);
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>(
    [],
  );
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAddAreaDialogOpen, setIsAddAreaDialogOpen] = useState(false);
  const [isEditAreaDialogOpen, setIsEditAreaDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaType | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { data } = useListArea();
  const { data: tableNodesData, refetch: refetchTableNodes } = useListTableNode(
    currentArea ? { areaId: currentArea } : undefined,
  );
  const createTableNodeMutation = useCreateTableNodeMutation();
  const updateTableNodeMutation = useUpdateTableNodeMutation();
  const deleteTableNodeMutation = useDeleteTableNodeMutation();
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const mockAreas = data?.payload?.data || [];
        setAreas(mockAreas);
        if (mockAreas.length > 0) {
          setCurrentArea(mockAreas[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch areas:', error);
      }
    };
    fetchAreas();
  }, []);

  useEffect(() => {
    if (currentArea) {
      loadTableLayout(currentArea);
    }
  }, [currentArea, tableNodesData]);

  const loadTableLayout = async (areaId: number) => {
    try {
      const apiTables = tableNodesData?.payload?.data || [];
      if (apiTables.length) {
        const newNodes: Node[] = apiTables.map((t: any) => ({
          id: String(t.id),
          type: 'table',
          position: { x: t.positionX, y: t.positionY },
          data: {
            id: String(t.id),
            type: String(t.type).toLowerCase(),
            name: t.name,
            seats: t.seats,
            position: { x: t.positionX, y: t.positionY },
            rotation: t.rotation || 0,
            width: t.width,
            height: t.height,
            imageUrl: t.imageUrl,
            status: 'available',
            areaId: String(t.areaId),
            onRotate: handleRotateTable,
            onDelete: handleDeleteTable,
            onEdit: handleEditTable,
          },
        }));
        setNodes(newNodes);
      } else {
        setNodes([]);
      }
      saveHistory();
    } catch (error) {
      console.error('Failed to load table layout:', error);
      toast.error('Lỗi khi tải bố cục bàn');
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    saveHistory();
  }, []);

  const saveHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [nodes, edges, history, historyIndex]);

  const handleRotateTable = useCallback(
    (tableId: string, rotation: number) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === tableId) {
            return {
              ...node,
              data: {
                ...node.data,
                rotation,
              },
            };
          }
          return node;
        }),
      );
      saveHistory();
    },
    [setNodes, saveHistory],
  );

  const handleEditTable = useCallback(
    async (tableId: string, updated: Partial<TableData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === tableId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...updated,
                },
              }
            : node,
        ),
      );
      saveHistory();

      if (!tableId.startsWith('table-')) {
        try {
          const target = nodes.find((n) => n.id === tableId);
          const payload: UpdateTableNodeBodyType & { id: number } = {
            id: parseInt(tableId),
            type: String(
              (updated.type ?? target?.data.type) || 'TABLE',
            ).toUpperCase() as any,
            name: updated.name ?? (target?.data as any)?.name,
            seats: updated.seats ?? (target?.data as any)?.seats,
            positionX: target?.position.x || 0,
            positionY: target?.position.y || 0,
            rotation:
              (updated as any)?.rotation ??
              ((target?.data as any)?.rotation || 0),
            width: updated.width ?? (target?.data as any)?.width,
            height: updated.height ?? (target?.data as any)?.height,
            imageUrl: updated.imageUrl ?? (target?.data as any)?.imageUrl,
            status: 'AVAILABLE' as any,
            areaId: currentArea,
            changeToken: false,
          } as any;
          if ((payload as any).layoutId === null)
            delete (payload as any).layoutId;
          await updateTableNodeMutation.mutateAsync(payload);
          toast.success('Đã cập nhật bàn');
        } catch (error) {
          console.error('Update table error', error);
          toast.error(
            (error as any)?.payload?.message || 'Cập nhật bàn thất bại',
          );
        }
      }
    },
    [setNodes, saveHistory, updateTableNodeMutation, currentArea, nodes],
  );

  const handleDeleteTable = useCallback(
    async (tableId: string) => {
      if (tableId.startsWith('table-')) {
        setNodes((nds) => nds.filter((node) => node.id !== tableId));
        saveHistory();
        return;
      }
      try {
        await deleteTableNodeMutation.mutateAsync(parseInt(tableId));
        setNodes((nds) => nds.filter((node) => node.id !== tableId));
        saveHistory();
        toast.success('Đã xóa bàn');
      } catch (error) {
        console.error('Failed to delete table:', error);
        toast.error('Xóa bàn thất bại');
      }
    },
    [setNodes, saveHistory, deleteTableNodeMutation],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const tableData = event.dataTransfer.getData('application/reactflow');
      if (!tableData) return;

      const table: TableData = JSON.parse(tableData);
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: `table-${Date.now()}`,
        type: 'table',
        position,
        data: {
          ...table,
          id: `table-${Date.now()}`,
          position,
          areaId: currentArea,
          onRotate: handleRotateTable,
          onDelete: handleDeleteTable,
          onEdit: handleEditTable,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      saveHistory();
    },
    [
      reactFlowInstance,
      currentArea,
      setNodes,
      saveHistory,
      handleRotateTable,
      handleDeleteTable,
    ],
  );

  const handleAddTable = useCallback(
    (table: TableData) => {
      const centerX = window.innerWidth / 2 - 100;
      const centerY = window.innerHeight / 2 - 100;

      const newNode: Node = {
        id: `table-${Date.now()}`,
        type: 'table',
        position: { x: centerX, y: centerY },
        data: {
          ...table,
          id: `table-${Date.now()}`,
          position: { x: centerX, y: centerY },
          areaId: currentArea,
          onRotate: handleRotateTable,
          onDelete: handleDeleteTable,
          onEdit: handleEditTable,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      saveHistory();
    },
    [setNodes, saveHistory, currentArea, handleRotateTable, handleDeleteTable],
  );

  const handleAddArea = useCallback(async (name: string) => {
    try {
      const newArea: AreaType = {
        id: Date.now(),
        name,
        isActive: true, // hoặc false
        createdById: null,
        updatedById: null,
        deletedById: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAreas((prev) => [...prev, newArea]);
      setCurrentArea(newArea.id);
    } catch (error) {
      console.error('Failed to add area:', error);
    }
  }, []);

  const handleEditArea = useCallback((area: AreaType) => {
    setEditingArea(area);
    setIsEditAreaDialogOpen(true);
  }, []);

  const handleUpdateArea = useCallback(
    (name: string) => {
      if (!editingArea) return;

      setAreas((prev) =>
        prev.map((area) =>
          area.id === editingArea.id
            ? { ...area, name, updatedAt: new Date() }
            : area,
        ),
      );
      setIsEditAreaDialogOpen(false);
      setEditingArea(null);
    },
    [editingArea],
  );

  const handleDeleteArea = useCallback(
    (areaId: number) => {
      if (areas.length <= 1) {
        alert('Không thể xóa khu vực cuối cùng!');
        return;
      }

      if (window.confirm('Bạn có chắc muốn xóa khu vực này?')) {
        setAreas((prev) => prev.filter((area) => area.id !== areaId));
        if (currentArea === areaId) {
          setCurrentArea(areas[0].id);
        }
      }
    },
    [areas, currentArea],
  );

  const handleSave = useCallback(async () => {
    try {
      const savePromises = nodes.map((node) => {
        const body: TableNodeBodyType = {
          type: String(node.data.type).toUpperCase() as any,
          name: node.data.name,
          seats: node.data.seats,
          positionX: node.position.x,
          positionY: node.position.y,
          rotation: node.data.rotation || 0,
          width: node.data.width,
          height: node.data.height,
          imageUrl: node.data.imageUrl,
          status: 'AVAILABLE' as any,
          areaId: currentArea,
          layoutId: null,
        };
        // Omit layoutId if null to avoid backend rejecting explicit nulls
        if (body.layoutId === null) delete (body as any).layoutId;
        if (!node.id.startsWith('table-')) {
          const payload: UpdateTableNodeBodyType & { id: number } = {
            id: parseInt(node.id),
            ...body,
            changeToken: false,
          } as any;
          return updateTableNodeMutation.mutateAsync(payload);
        }
        return createTableNodeMutation.mutateAsync(body);
      });
      await Promise.all(savePromises);
      await refetchTableNodes();
      toast.success('Đã lưu bố cục bàn!');
    } catch (error) {
      console.error('Failed to save layout:', error);
      const message =
        (error as any)?.payload?.message ||
        (error as any)?.message ||
        'Lưu bố cục thất bại';
      toast.error(message);
    }
  }, [
    nodes,
    currentArea,
    updateTableNodeMutation,
    createTableNodeMutation,
    refetchTableNodes,
  ]);

  const handleViewTableLayout = useCallback(() => {
    alert('Chức năng xem sơ đồ theo bàn');
  }, []);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView();
  }, [reactFlowInstance]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex, setNodes, setEdges]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen">
      {/* Overlay for closing sidebar when clicking outside */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/0"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar với width cố định */}
      <div
        className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden z-50 fixed left-0 top-0 h-full`}
      >
        <Sidebar
          onAddTable={handleAddTable}
          currentArea={currentArea.toString()}
          onAreaChange={(areaId) => setCurrentArea(Number(areaId))}
          onViewTableLayout={handleViewTableLayout}
          areas={areas}
          onAddArea={() => setIsAddAreaDialogOpen(true)}
          onEditArea={handleEditArea}
          onDeleteArea={(areaId) => handleDeleteArea(Number(areaId))}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
      {/* Nội dung chính */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'flex-1' : 'flex-1'
        }`}
      >
        <Toolbar
          onSave={handleSave}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAddArea={() => setIsAddAreaDialogOpen(true)}
          onToggleSidebar={toggleSidebar}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          isSidebarOpen={isSidebarOpen}
          areaId={currentArea}
        />
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            translateExtent={[
              [0, 0],
              [1000, 600],
            ]}
            nodeExtent={[
              [0, 0],
              [1000, 600],
            ]}
          >
            <Background gap={20} color="#e2e8f0" />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
      <AddAreaDialog
        open={isAddAreaDialogOpen}
        onOpenChange={setIsAddAreaDialogOpen}
      />
      <EditAreaDialog
        open={isEditAreaDialogOpen}
        onOpenChange={setIsEditAreaDialogOpen}
        area={editingArea}
        onUpdateArea={handleUpdateArea}
      />
    </div>
  );
}
