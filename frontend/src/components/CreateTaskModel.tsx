// src/components/CreateTaskModal.tsx
import React, { useState, useEffect } from "react";
import API from "../lib/api";
import type { Task, User } from "../types";
import { motion, AnimatePresence } from "framer-motion";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultColumnId: string;
  onCreated?: (task: Task) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  onClose,
  projectId,
  defaultColumnId,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch suggestions when typing email
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (assigneeEmail.length > 2) {
        try {
          const res = await API.get<User[]>(`/users/search?query=${assigneeEmail}`);
          setSuggestions(res.data || []);
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [assigneeEmail]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title required");
    setLoading(true);
    try {
      const res = await API.post<Task>("/tasks", {
        projectId,
        title: title.trim(),
        description,
        columnId: defaultColumnId,
        assigneeEmail: assigneeEmail || undefined, // ✅ use email
        priority,
      });
      onCreated?.(res.data);
      setTitle("");
      setDescription("");
      setAssigneeEmail("");
      setPriority("medium");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Could not create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.form
            onSubmit={submit}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-xl sm:rounded-xl p-6 space-y-4 shadow-xl z-10"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Create Task
            </h3>

            <input
              className="w-full border border-gray-200/60 dark:border-gray-700/60 p-2 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="w-full border border-gray-200/60 dark:border-gray-700/60 p-2 rounded-lg h-24 text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="relative flex gap-2">
              <input
                className="flex-1 border border-gray-200/60 dark:border-gray-700/60 p-2 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Assignee (email)"
                value={assigneeEmail}
                onChange={(e) => setAssigneeEmail(e.target.value)}
                onFocus={() => assigneeEmail && setShowSuggestions(true)}
              />
              <select
                className="w-36 border border-gray-200/60 dark:border-gray-700/60 p-2 rounded-lg text-sm bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  {suggestions.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => {
                        setAssigneeEmail(u.email);
                        setShowSuggestions(false);
                      }}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="font-medium">{u.name}</span>{" "}
                      <span className="text-gray-500">({u.email})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
