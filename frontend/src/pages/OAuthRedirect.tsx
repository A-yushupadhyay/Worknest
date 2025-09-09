// src/pages/OAuthRedirect.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../lib/api";

const OAuthRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);

      // Fetch user info to save
      API.get("/auth/me")
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/dashboard", { replace: true });
        })
        .catch((err) => {
          console.error("OAuth redirect failed:", err);
          navigate("/login?error=session", { replace: true });
        });
    } else {
      navigate("/login?error=missing_token", { replace: true });
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
      Finalizing login…
    </div>
  );
};

export default OAuthRedirect;
