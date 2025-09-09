// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import API from "../lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function verify() {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        setValid(false);
        return;
      }

      try {
        const res = await API.get("/auth/me");
        if (res.data?.user) {
          setValid(true);
        } else {
          setValid(false);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        setValid(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }

    void verify();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking session…
      </div>
    );
  }

  if (!valid) {
    // prevent infinite loop by not redirecting if already on login/register
    if (location.pathname === "/login" || location.pathname === "/register") {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
