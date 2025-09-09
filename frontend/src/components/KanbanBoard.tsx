// src/components/KanbanBoard.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import API from "../lib/api";
import TaskCard from "./TaskCard";
import { initSocket, joinRooms, leaveRooms } from "../lib/socket";
import CreateTaskModal from "./CreateTaskModel";
import type { Project, Task } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface KanbanBoardProps {
  project: Project;
  projectId: string;
  orgId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  project,
  projectId,
  orgId,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Load tasks initially
  useEffect(() => {
    async function load() {
      if (!projectId) return;
      setLoading(true);
      try {
        const res = await API.get<Task[]>(`/tasks?projectId=${projectId}&limit=500`);
        setTasks(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // Socket listeners
  useEffect(() => {
    const socket = initSocket();
    joinRooms({ orgId, projectId });

    const onCreated = (t: Task) =>
      setTasks((prev) => {
        if (!t || prev.some((p) => p._id === t._id)) return prev; // ✅ dedupe
        return [t, ...prev];
      });

    const onUpdated = (t: Task) =>
      setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x)));

    const onDeleted = ({ id }: { id: string }) =>
      setTasks((prev) => prev.filter((x) => x._id !== id));

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:deleted", onDeleted);

    return () => {
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:deleted", onDeleted);
      leaveRooms({ orgId, projectId });
    };
  }, [orgId, projectId]);

  // Group tasks by column
  const grouped = project.columns.reduce<Record<string, Task[]>>((acc, col) => {
    acc[col._id] = tasks.filter((t) => t.columnId === col._id);
    return acc;
  }, {});

  // Drag end → update columnId
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = String(active.id);
    const newColumnId = String(over.id);

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, columnId: newColumnId } : t))
    );

    try {
      await API.put(`/tasks/${taskId}`, { columnId: newColumnId });
    } catch (err) {
      console.error("Failed persist move", err);
    }
  }, []);

  // Local optimistic creation
  const handleCreated = (task: Task) => {
    setTasks((prev) => {
      if (!task || prev.some((t) => t._id === task._id)) return prev; // ✅ dedupe
      return [task, ...prev];
    });
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        {/* ❌ Removed extra project heading here */}
        <button
          onClick={() => setOpenCreate(true)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition shadow-sm"
        >
          + New Task
        </button>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-500 text-sm">
          Loading tasks...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            // ✅ Removed restrictToVerticalAxis so tasks can move between columns
          >
            {project.columns.map((col) => (
              <motion.div
                key={col._id}
                layout
                className="w-full sm:w-80 shrink-0 bg-white dark:bg-gray-900 rounded-xl p-3 shadow border border-gray-200/70 dark:border-gray-700/70"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {col.title}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {grouped[col._id]?.length || 0}
                  </span>
                </div>

                <SortableContext
                  items={(grouped[col._id] || []).map((t) => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div id={col._id} className="space-y-3">
                    <AnimatePresence>
                      {grouped[col._id]?.map((task) => (
                        <motion.div
                          key={task._id}
                          id={task._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TaskCard task={task} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </SortableContext>
              </motion.div>
            ))}
          </DndContext>
        </div>
      )}

      {/* Modal */}
      <CreateTaskModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        projectId={projectId}
        defaultColumnId={project.columns?.[0]?._id || ""}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default KanbanBoard;
