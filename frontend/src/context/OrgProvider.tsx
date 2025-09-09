// src/context/OrgProvider.tsx
import React, { useState, useEffect } from "react";
import type { ReactNode } from "react";
import API from "../lib/api";
import { OrgContext } from "./OrgContext";
import type { Org, User, OrgContextType } from "./OrgContext";

export const OrgProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeOrg, setActiveOrg] = useState<Org | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await API.get<User>("/auth/me");
        setCurrentUser(res.data);
      } catch (err) {
        console.error("[OrgProvider] failed to load current user", err);
        setCurrentUser(null);
      }
    }
    void fetchUser();
  }, []);

  const contextValue: OrgContextType = {
    activeOrg,
    setActiveOrg,
    currentUser,
    setCurrentUser,
  };

  return (
    <OrgContext.Provider value={contextValue}>
      {children}
    </OrgContext.Provider>
  );
};