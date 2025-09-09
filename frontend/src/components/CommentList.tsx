// src/components/CommentList.tsx
import React from "react";
import type { Comment } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface CommentListProps {
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {comments.map((c) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex gap-3"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
              {c.author.name?.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>

            {/* Comment Card */}
            <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-3 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                  {c.author.name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleString([], {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-snug">
                {c.text}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {comments.length === 0 && (
        <div className="text-center text-sm text-gray-400 italic py-4">
          No comments yet. Be the first to share!
        </div>
      )}
    </div>
  );
};

export default React.memo(CommentList);
