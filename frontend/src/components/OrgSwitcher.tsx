// src/components/OrgSwitcher.tsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../lib/api";
import { useOrg } from "../context/OrgContext"; // ✅ import OrgContext

type Org = {
  _id: string;
  name: string;
  slug?: string;
  owner?: string;
};

const ORG_STORAGE_KEY = "worknest:lastOrgId";

const OrgSwitcher: React.FC = () => {
  const { activeOrg, setActiveOrg } = useOrg(); // ✅ use context

  const [orgs, setOrgs] = useState<Org[]>([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  // Load orgs from API
  const loadOrgs = useCallback(async () => {
    try {
      const res = await API.get<Org[]>("/orgs");
      const list = res.data || [];
      setOrgs(list);

      if (list.length > 0) {
        const lastOrgId = localStorage.getItem(ORG_STORAGE_KEY);
        const restored = list.find((o) => o._id === lastOrgId);
        const initialOrg = restored || list[0];

        if (!activeOrg || activeOrg._id !== initialOrg._id) {
          setActiveOrg(initialOrg);
          localStorage.setItem(ORG_STORAGE_KEY, initialOrg._id);
          console.debug("[OrgSwitcher] initial selected org:", initialOrg);
        }
      } else {
        if (activeOrg !== null) {
          setActiveOrg(null);
        }
      }
    } catch (err) {
      console.error("Failed load orgs", err);
      alert("Could not load organizations. Please login again.");
    }
  }, [activeOrg, setActiveOrg]);

  useEffect(() => {
    void loadOrgs();
  }, [loadOrgs]);

  async function createOrg() {
    if (!newName.trim()) return alert("Organization name is required");

    const slugToSend = newSlug
      ? newSlug.trim().toLowerCase().replace(/\s+/g, "-")
      : newName.trim().toLowerCase().replace(/\s+/g, "-");

    setCreating(true);
    try {
      const res = await API.post<Org>("/orgs", {
        name: newName.trim(),
        slug: slugToSend,
      });

      setOrgs((s) => [res.data, ...s]);

      if (!activeOrg || activeOrg._id !== res.data._id) {
        setActiveOrg(res.data);
        localStorage.setItem(ORG_STORAGE_KEY, res.data._id);
      }

      setNewName("");
      setNewSlug("");
      setOpen(false);
    } catch (err) {
      console.error("create org failed", err);
      alert("Could not create org. Try different slug/name.");
    } finally {
      setCreating(false);
    }
  }

  function selectOrg(org: Org) {
    if (activeOrg && activeOrg._id === org._id) {
      setOpen(false);
      return;
    }
    setActiveOrg(org);
    setOpen(false);
    localStorage.setItem(ORG_STORAGE_KEY, org._id);
    console.debug("[OrgSwitcher] switched org:", org);
  }

  return (
    <div className="relative inline-block text-left">
      {/* Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition"
      >
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 flex items-center justify-center text-sm font-semibold">
          {activeOrg ? activeOrg.name.slice(0, 2).toUpperCase() : "WN"}
        </div>
        <div className="text-left">
          <div className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-[120px]">
            {activeOrg?.name || "Select Org"}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {activeOrg?.slug || ""}
          </div>
        </div>
        <motion.svg
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute right-2 mt-2 w-[20rem] md:w-[23rem] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50"
          >
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Organizations
              </div>

              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {orgs.length === 0 && (
                  <div className="text-sm text-gray-400 dark:text-gray-400">
                    No organizations yet.
                  </div>
                )}
                {orgs.map((o) => (
                  <button
                    key={o._id}
                    onClick={() => selectOrg(o)}
                    className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-center gap-3 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 flex items-center justify-center text-xs font-semibold">
                      {o.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-gray-800 dark:text-gray-100">{o.name}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-400">{o.slug}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Create new */}
              <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Create new</div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg text-sm px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <input
                    className="w-32 border border-gray-300 dark:border-gray-700 rounded-lg text-sm px-2 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="slug (optional)"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                  />
                </div>
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setNewName("");
                      setNewSlug("");
                    }}
                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition"
                  >
                    Clear
                  </button>
                  <button
                    onClick={createOrg}
                    disabled={creating}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrgSwitcher;
