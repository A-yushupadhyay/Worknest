// src/components/AdminPanel.tsx
import React, { useEffect, useState } from 'react';
import API from '../lib/api';
import type { Membership } from '../types';
import { motion } from 'framer-motion';
import { UserIcon } from '@heroicons/react/24/outline';

interface AdminPanelProps {
  orgId: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ orgId }) => {
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (orgId) void loadMembers(orgId);
  }, [orgId]);

  async function loadMembers(id: string) {
    setLoading(true);
    try {
      const res = await API.get<Membership[]>(`/members?orgId=${id}`);
      setMembers(res.data || []);

      // current user's role
      const me = localStorage.getItem('userId');
      const meMem = res.data?.find(
        (m) => m.userId?._id === me || m.userId?.email === me
      );
      setCurrentUserRole(meMem ? (meMem.role as string) : null);
    } catch (err) {
      console.error('load members', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }

  const changeRole = async (memberId: string, role: Membership['role']) => {
    try {
      await API.put(`/members/${memberId}/role`, { role });
      await loadMembers(orgId);
    } catch (err) {
      console.error('change role', err);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Remove member?')) return;
    try {
      await API.delete(`/members/${memberId}`);
      await loadMembers(orgId);
    } catch (err) {
      console.error('remove member', err);
    }
  };

  if (!orgId) {
    return (
      <div className="text-sm text-gray-400 italic">
        Select an organization to manage members.
      </div>
    );
  }

  const isAdmin = currentUserRole === 'org_admin';

  return (
    <motion.div
      layout
      className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Organization Members
      </h3>

      {loading ? (
        <div className="text-sm text-gray-500">Loading members…</div>
      ) : members.length === 0 ? (
        <div className="text-sm text-gray-400">No members found.</div>
      ) : (
        <ul className="space-y-4">
          {members.map((m) => (
            <motion.li
              key={m._id}
              layout
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition"
            >
              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {m.userId?.name || m.userId?.email}
                  </div>
                  <div className="text-xs text-gray-500">{m.userId?.email}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <select
                  className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  value={m.role}
                  onChange={(e) =>
                    void changeRole(m._id, e.target.value as Membership['role'])
                  }
                  disabled={!isAdmin}
                >
                  <option value="org_admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>

                <button
                  className="px-3 py-1 rounded-md bg-red-600 text-white text-xs hover:bg-red-700 transition disabled:opacity-50"
                  onClick={() => void removeMember(m._id)}
                  disabled={!isAdmin}
                >
                  Remove
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};

export default AdminPanel;
