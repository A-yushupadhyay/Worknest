// src/components/Sidebar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  // HomeIcon,
  Squares2X2Icon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  onLinkClick?: () => void;
}

const links = [
  { name: "Projects", to: "/projects", icon: Squares2X2Icon },
  // { name: "Board", to: "/board", icon: HomeIcon },
  { name: "Dashboard", to: "/dashboard", icon: ChartBarIcon },
  { name: "Search", to: "/search", icon: MagnifyingGlassIcon },
  { name: "Settings", to: "/settings", icon: Cog6ToothIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ onLinkClick }) => {
  const location = useLocation();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  return (
    <nav className="flex flex-col h-full py-6 text-sm font-medium">
      {/* Workspace Section */}
      <div className="px-4">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="flex items-center justify-between w-full mb-3 text-gray-500 uppercase text-xs tracking-wide"
        >
          <span>Workspace</span>
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform ${
              workspaceOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <div className="space-y-1">
          {workspaceOpen &&
            links.map((l) => {
              const Icon = l.icon;
              const active =
                location.pathname === l.to ||
                (l.to === "/" && location.pathname.startsWith("/board"));
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={onLinkClick}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    active
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  {l.name}
                </Link>
              );
            })}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="px-4 mt-auto">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Shortcuts
        </h4>
        <div className="flex flex-col gap-1">
          <a
            href="https://your-docs.example"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            📘 Docs
          </a>
          <a
            href="https://support.example"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
          >
            💬 Support
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
