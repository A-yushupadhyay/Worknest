// src/pages/ProjectsPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import API from "../lib/api";
import ProjectCard from "../components/ProjectCard";
import OrgSwitcher from "../components/OrgSwitcher";
import { motion } from "framer-motion";
import type { Project } from "../types";
import { useOrg } from "../context/OrgContext";

const ORG_STORAGE_KEY = "worknest:lastOrgId";

const ProjectsPage: React.FC = () => {
  const { activeOrg } = useOrg(); // ✅ use OrgContext directly
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load projects for org
  const loadProjects = useCallback(async (orgId: string) => {
    console.debug("[ProjectsPage] loadProjects orgId:", orgId);
    setError(null);
    setLoading(true);
    try {
      const res = await API.get(`/projects?orgId=${orgId}`);
      console.debug("[ProjectsPage] raw response:", res);
      console.debug("[ProjectsPage] response data:", res.data);

      const data = res.data;
      const arr = Array.isArray(data) ? data : (data?.projects ?? []);
      console.debug("[ProjectsPage] normalized projects array:", arr);

      setProjects(arr);
    } catch (err: unknown) {
      console.error("[ProjectsPage] load projects failed", err);
      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosErr = err as { response?: { data?: { msg?: string } } };
        setError(axiosErr.response?.data?.msg || "Failed to load projects");
      } else {
        setError("Failed to load projects");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load projects when org changes
  useEffect(() => {
    if (activeOrg?._id) {
      void loadProjects(activeOrg._id);
      localStorage.setItem(ORG_STORAGE_KEY, activeOrg._id);
    }
  }, [activeOrg, loadProjects]);

  async function createProject() {
    if (!activeOrg) return alert("Select an organization first");
    if (!newName.trim()) return alert("Enter project name");

    setCreating(true);
    try {
      const res = await API.post<Project>("/projects", {
        orgId: activeOrg._id,
        name: newName.trim(),
      });
      console.debug("[ProjectsPage] created project:", res.data);
      setProjects((s) => [res.data, ...s]);
      setNewName("");
    } catch (err) {
      console.error("create project failed", err);
      alert("Could not create project — check console/network tab");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            {/* ✅ OrgSwitcher now handles org switching via context */}
            <OrgSwitcher />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Projects
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select a project to work on your boards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              className="border rounded-md px-3 py-2 w-64 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              placeholder="New project name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
              onClick={createProject}
              disabled={creating}
            >
              {creating ? "Creating…" : "New Project"}
            </button>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 flex items-center justify-between">
            <div>
              <strong className="block">Error loading projects</strong>
              <div className="text-sm mt-1">{error}</div>
            </div>
            <button
              className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
              onClick={() => {
                setError(null);
                if (activeOrg) void loadProjects(activeOrg._id);
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">
            Loading projects…
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {projects.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400">
                No projects yet
              </div>
            ) : (
              projects.map((p) => (
                <motion.div
                  key={p._id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProjectCard project={p} />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
