import React, { useEffect, useState } from "react";
import API from "../lib/api";
import type { Comment, Task } from "../types";
import CommentList from "./CommentList";
import { getSocket } from "../lib/socket";
import { motion, AnimatePresence } from "framer-motion";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ open, onClose, task }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!task?._id) return;
      try {
        const res = await API.get<Comment[]>(`/comments?taskId=${task._id}`);
        if (mounted) setComments(res.data || []);
      } catch (e) {
        console.error(e);
      }
    }
    if (open) load();

    const socket = getSocket();
    const handler = (c: Comment) => {
      if (c.taskId === task?._id) setComments((prev) => [...prev, c]);
    };
    socket?.on("comment:created", handler);

    return () => {
      mounted = false;
      socket?.off("comment:created", handler);
    };
  }, [open, task?._id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !task?._id) return;
    setLoading(true);
    try {
      await API.post<Comment>("/comments", { taskId: task._id, text });
      setText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl z-10"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition"
                onClick={onClose}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              {/* Comments */}
              <div className="lg:col-span-2">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Comments
                </h4>
                <CommentList comments={comments} />

                <form onSubmit={submit} className="mt-4 flex gap-2">
                  <input
                    className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a comment…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Comment
                  </button>
                </form>
              </div>

              {/* Details Sidebar */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Details</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>
                    <span className="text-gray-500">Priority:</span>{" "}
                    <span className="font-medium capitalize">
                      {task.priority || "medium"}
                    </span>
                  </div>
                  {task.dueDate && (
                    <div>
                      <span className="text-gray-500">Due:</span>{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Column:</span>{" "}
                    <span className="font-medium">{task.columnId}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailModal;
