// src/components/Layout.tsx
import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:block md:w-[264px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200/70 dark:border-gray-800/70">
          <div className="sticky top-0 h-[100dvh] overflow-y-auto px-4 py-6">
            <Sidebar />
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
              {children}
            </div>
          </main>

          <Footer />
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 overflow-x-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 shadow-2xl"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>
              <Sidebar onLinkClick={() => setSidebarOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
