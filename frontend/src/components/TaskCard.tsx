import React from "react";
import type { Task } from "../types";
import { motion } from "framer-motion";

interface TaskCardProps {
  task: Task;
}

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-600",
  medium: "bg-yellow-100 text-yellow-600",
  low: "bg-green-100 text-green-600",
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const priority = task.priority?.toLowerCase() || "medium";

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 hover:shadow-lg cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-gray-800">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${priorityColors[priority]}`}
        >
          {priority}
        </span>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        {/* Assignee */}
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-semibold text-blue-700 shadow-sm">
              {task.assignee.name
                ?.split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
            <span className="truncate max-w-[100px]">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="italic text-gray-400">Unassigned</span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-gray-600 font-medium">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(TaskCard);
