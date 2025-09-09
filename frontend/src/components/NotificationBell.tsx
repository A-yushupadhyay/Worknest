import React, { useEffect, useState } from "react";
import API from "../lib/api";
import type { AppNotification } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { getSocket, onNotification } from "../lib/socket";

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load(unreadOnly = true) {
    try {
      const res = await API.get<AppNotification[]>(
        `/notifications?unread=${unreadOnly ? 1 : 0}`
      );
      const data = res.data || [];
      setItems(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }

  useEffect(() => {
    void load(true);

    const sock = getSocket();
    if (sock) {
      onNotification((n: AppNotification) => {
        setItems((prev) => [n, ...prev]);
        setUnreadCount((c) => c + 1);
      });
    }
  }, []);

  async function markRead(id: string) {
    try {
      await API.put(`/notifications/${id}/read`);
      await load(false);
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }

  function renderMessage(n: AppNotification) {
    switch (n.type) {
      case "comment":
        return "New comment on a task";
      case "assignment":
        return n.payload?.assignedByName
          ? `${n.payload.assignedByName} assigned you the task "${n.payload.taskTitle}"`
          : "You were assigned a task";
      case "invite":
        return n.payload?.invitedByName
          ? `${n.payload.invitedByName} invited you to join "${n.payload.orgName}" as ${n.payload.role}`
          : "You were invited to an organization";
      default:
        return "You have a new notification";
    }
  }

  function renderIcon(n: AppNotification) {
    switch (n.type) {
      case "comment":
        return "💬";
      case "assignment":
        return "✅";
      case "invite":
        return "📩";
      default:
        return "🔔";
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load(false);
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full px-1.5 py-0.5 shadow">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200/70 dark:border-gray-700/70 z-50"
          >
            <div className="p-2">
              {items.length === 0 ? (
                <div className="p-6 text-sm text-gray-500 text-center">
                  No notifications
                </div>
              ) : (
                <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((n) => (
                    <li
                      key={n._id}
                      className="p-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <div className="text-lg">{renderIcon(n)}</div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 dark:text-gray-100">
                          {renderMessage(n)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                          onClick={() => void markRead(n._id)}
                        >
                          Mark read
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
