// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import API from "../lib/api";
import { useNavigate } from "react-router-dom";
import type { Project } from "../types";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useOrg } from "../context/OrgContext";

// ---- Types ----
type MetricsResponse = {
  totals: number;
  byStatus: Record<string, number>;
  overdue: number;
  perUser: { userId: string | null; name?: string; count: number }[];
};

// ---- Status mapping ----
const STATUS_LABELS: Record<string, string> = {
  col_todo: "Todo",
  col_inprogress: "In Progress",
  col_done: "Done",
};

const STATUS_COLORS = ["#60A5FA", "#34D399", "#F59E0B", "#F97316", "#EF4444"];

// ---- Reusable StatCard ----
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  hint?: string;
  accent?: string;
}> = ({ icon, label, value, hint, accent }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 shadow-sm p-4 transition"
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
          accent || "bg-blue-50 dark:bg-blue-900/30"
        }`}
      >
        <div className="text-blue-600 dark:text-blue-400">{icon}</div>
      </div>
      <div className="flex-1">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </div>
        <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {value}
        </div>
        {hint && (
          <div className="text-xs text-gray-400 dark:text-gray-500">{hint}</div>
        )}
      </div>
    </div>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrg } = useOrg();
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (activeOrg?._id) {
      void loadMetrics(activeOrg._id);
      void loadProjects(activeOrg._id);
    } else {
      setMetrics(null);
      setProjects([]);
    }
  }, [activeOrg]);

  async function loadMetrics(id: string) {
    setLoading(true);
    try {
      const res = await API.get<MetricsResponse>(`/admin/metrics?orgId=${id}`);
      setMetrics(res.data);
    } catch (err) {
      console.error("load metrics", err);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects(id: string) {
    try {
      const res = await API.get<Project[]>(`/projects?orgId=${id}`);
      setProjects(res.data || []);
    } catch (err) {
      console.error("load projects", err);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          High-level metrics for your organization
        </p>
      </div>

      {/* Content */}
      {!activeOrg ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 bg-white/60 dark:bg-gray-900/60 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <ChartBarIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Select an organization</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Choose an organization from the navbar to load metrics.
          </p>
        </div>
      ) : loading && !metrics ? (
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          </div>
        </div>
      ) : metrics ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
              label="Total tasks"
              value={metrics.totals}
              hint="All tasks across projects"
            />
            <StatCard
              icon={<ExclamationTriangleIcon className="w-5 h-5" />}
              label="Overdue"
              value={metrics.overdue}
              hint="Needs attention"
              accent="bg-red-50 dark:bg-red-900/30"
            />
            <StatCard
              icon={<UsersIcon className="w-5 h-5" />}
              label="Assignees"
              value={metrics.perUser.length}
              hint="Active collaborators"
              accent="bg-emerald-50 dark:bg-emerald-900/30"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Charts + status */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bar chart */}
              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold">Tasks by Assignee</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {metrics.totals} total
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.perUser.map((p) => ({
                        name: p.name || "Unassigned",
                        count: p.count,
                      }))}
                    >
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#60A5FA" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status cards */}
              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 shadow-sm p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(metrics.byStatus).map(([col, cnt]) => (
                    <div
                      key={col}
                      className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/70"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {STATUS_LABELS[col] || "Unknown"}
                      </div>
                      <div className="text-xl font-semibold">{cnt}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pie + Projects */}
            <div className="space-y-6">
              {/* Pie chart */}
              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 shadow-sm p-4">
                <h3 className="text-sm font-semibold mb-2">Status Distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(metrics.byStatus).map(
                          ([key, value]) => ({
                            name: STATUS_LABELS[key] || "Unknown",
                            value,
                          })
                        )}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        innerRadius={32}
                        paddingAngle={3}
                        label
                      >
                        {Object.keys(metrics.byStatus).map((key, i) => (
                          <Cell key={key} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Projects */}
              <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 shadow-sm p-4">
                <h3 className="text-sm font-semibold mb-3">Projects</h3>
                <div className="space-y-2">
                  {projects.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No projects found.
                    </div>
                  ) : (
                    projects.map((p) => (
                      <motion.div
                        key={p._id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/70 transition"
                      >
                        <div className="text-sm font-medium">{p.name}</div>
                        <button
                          className="text-xs px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                          onClick={() => navigate(`/board/${p._id}`)}
                        >
                          Open
                        </button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-sm text-gray-400">No metrics available.</div>
      )}
    </div>
  );
};

export default DashboardPage;
