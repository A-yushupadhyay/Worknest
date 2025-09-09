// src/pages/SearchPage.tsx
import React, { useEffect, useState } from "react";
import API from "../lib/api";
import type { Task, Project } from "../types";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useOrg } from "../context/OrgContext";

type SearchResult = {
  page: number;
  limit: number;
  results: Task[];
};

const STATUS_OPTIONS = [
  { id: "", label: "All statuses" },
  { id: "col_todo", label: "Todo" },
  { id: "col_inprogress", label: "In Progress" },
  { id: "col_done", label: "Done" },
];

const SearchPage: React.FC = () => {
  const { activeOrg } = useOrg(); // may be null
  const orgId = activeOrg ? activeOrg._id : null;

  const [q, setQ] = useState("");
  const [assignee, setAssignee] = useState(""); // new: assignee name/email filter
  const [status, setStatus] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Task[]>([]);
  const [totalFetched, setTotalFetched] = useState(0);
  const navigate = useNavigate();

  // Load org projects when active org changes
  useEffect(() => {
    if (!orgId) {
      setProjects([]);
      setProjectId("");
      setResults([]);
      setTotalFetched(0);
      return;
    }

    async function loadProjects() {
      try {
        const res = await API.get<Project[]>(`/projects?orgId=${orgId}`);
        setProjects(res.data || []);
      } catch (err) {
        console.error("Failed to load projects", err);
        setProjects([]);
      }
    }

    void loadProjects();
    setPage(1);
    // run initial search when org changes (optional)
    void doSearch(orgId, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  // Run search when page changes
  useEffect(() => {
    if (!orgId) return;
    void doSearch(orgId, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // doSearch accepts an explicit orgId (so we avoid TS "possibly null")
  async function doSearch(explicitOrgId?: string, explicitPage?: number) {
    const oid = explicitOrgId ?? orgId;
    const p = explicitPage ?? page;

    if (!oid) {
      // safe-guard: no active org selected
      alert("Please select an organization from the navbar to search.");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      params.append("orgId", oid);
      if (status) params.append("status", status);
      if (projectId) params.append("projectId", projectId);
      if (assignee) params.append("assignee", assignee); // new: pass assignee filter
      params.append("page", String(p));
      params.append("limit", String(limit));

      const res = await API.get<SearchResult>(`/search/tasks?${params.toString()}`);
      setResults(res.data.results || []);
      setTotalFetched(res.data.results?.length || 0);
    } catch (err) {
      console.error("search error", err);
      setResults([]);
      setTotalFetched(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-64px)] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Find tasks across your organization
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Keyword */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Search by title/description/assignee"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    void doSearch(orgId ?? undefined, 1);
                  }
                }}
              />
            </div>

            {/* Assignee (name or email) */}
            <input
              placeholder="Assignee name or email"
              className="border px-3 py-2 rounded-lg flex-1 bg-white dark:bg-gray-800 text-sm"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  void doSearch(orgId ?? undefined, 1);
                }
              }}
            />

            {/* Project dropdown */}
            <select
              className="border px-3 py-2 rounded-lg flex-1 bg-white dark:bg-gray-800 text-sm"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Search button */}
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
              onClick={() => {
                setPage(1);
                void doSearch(orgId ?? undefined, 1);
              }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-5 shadow-sm"
        >
          {!orgId ? (
            <div className="text-center py-8 text-gray-400">
              Select an organization in the navbar to start searching.
            </div>
          ) : loading ? (
            <div className="text-sm text-gray-500">Searching…</div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No results found. Try adjusting your filters.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {results.map((t) => (
                <div
                  key={t._id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 px-2 rounded-lg transition"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {t.title}
                    </div>
                    <div className="text-xs text-gray-500">{t.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {t.assignee?.name || t.assignee?.email || "Unassigned"}
                    </div>
                  </div>
                  <button
                    className="text-sm px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                    onClick={() => navigate(`/board/${t.projectId}`)}
                  >
                    Open Board
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Showing {totalFetched} results</div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </button>
              <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded">{page}</div>
              <button className="px-2 py-1 border rounded" onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchPage;
