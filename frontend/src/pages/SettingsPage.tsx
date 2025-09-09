// src/pages/SettingsPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import API from "../lib/api";
import { motion } from "framer-motion";
import { useOrg } from "../context/OrgContext";
import type { Membership } from "../types";

type UserSuggestion = {
  _id: string;
  name: string;
  email: string;
};

type Role = "org_admin" | "member" | "viewer";

const MEMBER_PAGE_LIMIT = 10;

const SettingsPage: React.FC = () => {
  const { activeOrg, currentUser } = useOrg();

  // members pagination state
  const [members, setMembers] = useState<Membership[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  // invite state + autocomplete
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [role, setRole] = useState<Role>("member");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

//   // find membership of current user in active org
// const myMembership = members.find((m) => m.userId?._id === currentUser?._id);


  // derived permission
const canManageOrg =
  currentUser?.role === "super_admin" ||
  activeOrg?.owner === currentUser?._id ||
  members.some(
    (m) => String(m.userId?._id || m.userId) === String(currentUser?._id) && m.role === "org_admin"
  );
  // load members (with pagination + optional search)
  const loadMembers = useCallback(
    async (orgId: string, p = 1, q = "") => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("orgId", orgId);
        params.append("page", String(p));
        params.append("limit", String(MEMBER_PAGE_LIMIT));
        if (q) params.append("q", q);

        const res = await API.get<{ results: Membership[]; total: number }>(
          `/api/members?${params.toString()}`
        );

        setMembers(res.data.results || []);
        setTotal(res.data.total ?? res.data.results?.length ?? null);
      } catch (err) {
        console.error("load members failed", err);
        setMembers([]);
        setTotal(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!activeOrg?._id) {
      setMembers([]);
      setTotal(null);
      setPage(1);
      return;
    }
    void loadMembers(activeOrg._id, page, searchQ);
  }, [activeOrg?._id, page, searchQ, loadMembers]);

  // invite UI: autocomplete for users
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!inviteEmail || inviteEmail.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await API.get<UserSuggestion[]>(
          `/api/members/search-users?query=${encodeURIComponent(inviteEmail)}`
        );
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("autocomplete error", err);
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [inviteEmail]);

  async function invite() {
    if (!activeOrg?._id) return alert("Select an organization first.");
    if (!inviteEmail.trim()) return alert("Enter email to invite.");

    setInviting(true);
    setInviteError(null);
    try {
      await API.post("/api/members/invite", {
        orgId: activeOrg._id,
        email: inviteEmail.trim(),
        role,
      });
      setInviteEmail("");
      setSuggestions([]);
      setShowSuggestions(false);
      setPage(1);
      await loadMembers(activeOrg._id, 1, searchQ);
      alert("Invite sent.");
    } catch (err: unknown) {
      console.error("invite failed", err);
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 404
      ) {
        setInviteError("This email is not registered yet.");
      } else {
        setInviteError("Could not send invite. Try again.");
      }
    } finally {
      setInviting(false);
    }
  }

  async function changeRole(memberId: string, newRole: Role) {
    if (!canManageOrg) return alert("Not authorized.");
    try {
      await API.put(`/api/members/${memberId}/role`, { role: newRole });
      if (activeOrg?._id) await loadMembers(activeOrg._id, page, searchQ);
    } catch (err) {
      console.error("change role failed", err);
      alert("Could not change role.");
    }
  }

  async function removeMember(memberId: string) {
    if (!canManageOrg) return alert("Not authorized.");
    if (!confirm("Remove member from organization?")) return;
    try {
      await API.delete(`/api/members/${memberId}`);
      const nextPage = members.length === 1 && page > 1 ? page - 1 : page;
      setPage(nextPage);
      if (activeOrg?._id) await loadMembers(activeOrg._id, nextPage, searchQ);
    } catch (err) {
      console.error("remove member failed", err);
      alert("Could not remove member.");
    }
  }

  const totalPages = total ? Math.ceil(total / MEMBER_PAGE_LIMIT) : null;

  return (
    <div className="min-h-[calc(100dvh-64px)] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organization Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage roles, invite members, and configure organization access.
          </p>
          {activeOrg && (
            <p className="text-xs text-gray-400 mt-1">
              Active Org: <strong>{activeOrg.name}</strong>{" "}
              <span className="text-xs text-gray-500 ml-2">
                ({activeOrg._id})
              </span>
            </p>
          )}
        </div>

        {/* Invite Member */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-5 shadow-sm relative"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Invite Member
            </h2>
            <div className="text-xs text-gray-500">Only admins can invite</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Search user by email or type a new email"
                className="border px-3 py-2 rounded-lg w-full bg-white dark:bg-gray-800 text-sm"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onFocus={() => inviteEmail && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                disabled={!activeOrg}
                aria-label="Invite email"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {suggestions.map((s) => (
                    <li
                      key={s._id}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setInviteEmail(s.email);
                        setShowSuggestions(false);
                      }}
                    >
                      <span className="font-medium">{s.name}</span>{" "}
                      <span className="text-gray-500">({s.email})</span>
                    </li>
                  ))}
                </ul>
              )}
              {inviteError && (
                <div className="text-xs text-red-500 mt-1">{inviteError}</div>
              )}
            </div>

            <select
              className="border px-3 py-2 rounded-lg bg-white dark:bg-gray-800 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={!activeOrg}
            >
              <option value="org_admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>

            <button
              className={`px-4 py-2 rounded-lg ${
                canManageOrg
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white transition text-sm`}
              onClick={() => void invite()}
              disabled={!activeOrg || !canManageOrg || inviting || !inviteEmail.trim()}
            >
              {inviting ? "Inviting…" : "Invite"}
            </button>
          </div>
        </motion.div>

        {/* Members list */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Members
            </h2>
            <div className="flex items-center gap-2">
              <input
                placeholder="Search members..."
                value={searchQ}
                onChange={(e) => {
                  setSearchQ(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800"
              />
              <div className="text-xs text-gray-500">
                {total !== null ? `${total} total` : ""}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500">Loading…</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-8">
              No members yet. Invite teammates to get started.
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {members.map((m) => (
                  <li
                    key={m._id}
                    className="py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/60 px-2 rounded-lg transition"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {m.userId?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {m.userId?.email}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Role: <strong>{m.role}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManageOrg ? (
                        <>
                          <select
                            className="border px-2 py-1 rounded bg-white dark:bg-gray-800 text-sm"
                            value={m.role as Role}
                            onChange={(e) =>
                              void changeRole(m._id, e.target.value as Role)
                            }
                          >
                            <option value="org_admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm"
                            onClick={() => void removeMember(m._id)}
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="text-xs text-gray-500 italic">
                          View only
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {total !== null
                    ? `Showing ${members.length} of ${total}`
                    : `Showing ${members.length}`}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Prev
                  </button>
                  <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    {page}
                  </div>
                  <button
                    className="px-3 py-1 border rounded"
                    onClick={() => {
                      if (!totalPages || page < totalPages) setPage((p) => p + 1);
                    }}
                    disabled={totalPages ? page >= totalPages : false}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
