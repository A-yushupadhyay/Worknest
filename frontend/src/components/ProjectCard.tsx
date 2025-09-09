// src/components/ProjectCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    columns?: { _id: string; title: string }[];
    createdAt?: string;
  };
  onOpen?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen }) => {
  const navigate = useNavigate();

  function openBoard() {
    if (onOpen) onOpen(project._id);
    navigate(`/board/${project._id}`);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col gap-3"
      onClick={openBoard}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Project info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        {/* Right: Columns count */}
        <div className="flex-shrink-0 text-xs text-gray-400 text-right">
          {project.columns?.length || 0} cols
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-semibold">
            {project.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="truncate">
            {project.createdAt
              ? new Date(project.createdAt).toLocaleDateString()
              : ""}
          </div>
        </div>
        <span className="text-blue-600 font-medium flex-shrink-0">
          Open →
        </span>
      </div>
    </motion.div>
  );
};

export default React.memo(ProjectCard);
