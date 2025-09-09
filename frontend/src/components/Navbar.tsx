// src/components/Navbar.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import OrgSwitcher from "./OrgSwitcher";
import NotificationBell from "./NotificationBell";
import { useOrg } from "../context/OrgContext";
import { motion, AnimatePresence } from "framer-motion";
import API from "../lib/api";

interface NavbarProps {
  onOpenSidebar?: () => void;
}

type SearchResult = {
  _id: string;
  name: string;
  type: "org" | "project";
  owner?: string; // ✅ include owner in search results
};

const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const { activeOrg, setActiveOrg } = useOrg();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ✅ Search API
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!searchQ.trim()) {
        setResults([]);
        return;
      }
      try {
        setSearching(true);
        const res = await API.get<{ orgs: SearchResult[]; projects: SearchResult[] }>(
          `/search?q=${encodeURIComponent(searchQ)}${
            activeOrg?._id ? `&orgId=${activeOrg._id}` : ""
          }`
        );

        const orgs = (res.data.orgs || []).map((o) => ({
          ...o,
          type: "org" as const,
        }));
        const projects = (res.data.projects || []).map((p) => ({
          ...p,
          type: "project" as const,
        }));
        setResults([...orgs, ...projects]);
      } catch (err) {
        console.error("search error", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQ, activeOrg?._id]);

  // ✅ Handle selecting a search result
  const handleSelect = (r: SearchResult) => {
    setSearchQ("");
    setResults([]);
    if (r.type === "org") {
      // ✅ Pass owner if available
      setActiveOrg({ _id: r._id, name: r.name, owner: r.owner });
    } else {
      navigate(`/board/${r._id}`);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200/70 dark:border-gray-800/70 shadow-sm relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 py-3 px-4">
        <div className="flex items-center gap-3">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              WN
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                WorkNest
              </div>
              <div className="text-xs text-gray-400">
                {activeOrg?.name || "Project workspace"}
              </div>
            </div>
          </Link>

          {/* Search */}
          <div className="hidden md:block ml-4 relative">
            <input
              placeholder="Search orgs, projects..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="w-72 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>

            {/* Results dropdown */}
            <AnimatePresence>
              {searchQ && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  {results.map((r) => (
                    <button
                      key={r._id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/60 flex justify-between"
                      onClick={() => handleSelect(r)}
                    >
                      <span className="font-medium">{r.name}</span>
                      <span className="text-xs text-gray-400">{r.type}</span>
                    </button>
                  ))}
                </motion.div>
              )}
              {searchQ && !searching && results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3 text-sm text-gray-500"
                >
                  No results found
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <OrgSwitcher />
          <NotificationBell />

          {/* Profile Menu */}
          <div className="relative">
            <button
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200 hover:ring-2 hover:ring-blue-500 transition"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {user?.name ? user.name[0]?.toUpperCase() : "ME"}
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                >
                  <div className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">
                    <div className="font-medium">{user?.name || "User"}</div>
                    <div className="text-xs text-gray-500">{user?.email || ""}</div>
                  </div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
