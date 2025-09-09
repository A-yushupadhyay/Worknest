// src/context/OrgContext.tsx
import { createContext, useContext } from "react";

export type Org = {
  _id: string;
  name: string;
  slug?: string;
  owner?: string; // ✅ optional so Navbar won’t break
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role?: string;
};

export type OrgContextType = {
  activeOrg: Org | null;
  setActiveOrg: (org: Org | null) => void;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
};

export const OrgContext = createContext<OrgContextType | undefined>(undefined);

export const useOrg = (): OrgContextType => {
  const context = useContext(OrgContext);
  if (!context) throw new Error("useOrg must be used within an OrgProvider");
  return context;
};