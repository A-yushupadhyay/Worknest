// src/pages/BoardPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../lib/api';
import KanbanBoard from '../components/KanbanBoard';
import type { Project } from '../types';
import { motion } from 'framer-motion';

const BoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await API.get<Project>(`/projects/${projectId}`);
        setProject(res.data);
      } catch (err) {
        console.error(err);
        alert('Could not load project');
        navigate('/');
      } finally {
        setLoading(false);
      }
    }
    if (projectId) load();
  }, [projectId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading project…
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Project not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700"
        >
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {project.name}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {project.description}
          </p>
        </motion.header>

        {/* Kanban Board */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700"
        >
          <KanbanBoard
            project={project}
            projectId={project._id}
            orgId={project.orgId}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default BoardPage;
