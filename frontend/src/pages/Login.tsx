import { useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../lib/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== Google OAuth Login =====
  const handleGoogleLogin = () => {
    // Redirect to your Render backend Google OAuth route
    window.location.href = `${import.meta.env.VITE_API_BASE}/api/auth/google`;
  };

  // ===== Guest Login =====
  const handleGuest = async () => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        email: "guest@worknest.com",
        password: "guest123",
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error("Guest login failed", err);
      alert("Guest login failed. Ensure guest user exists in DB.");
    } finally {
      setLoading(false);
    }
  };

  // ===== Manual Login =====
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error("Manual login failed", err);
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6 transition">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow">
            WN
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
            Sign in to WorkNest
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Organize work. Empower your team.
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium shadow transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        {/* Guest login */}
        <button
          onClick={handleGuest}
          disabled={loading}
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? "Loading guest…" : "Continue as Guest"}
        </button>

        {/* Divider */}
        <div className="flex items-center">
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
          <span className="mx-2 text-xs text-gray-400">OR</span>
          <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        </div>

        {/* Manual login */}
        <form onSubmit={handleManualLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium shadow transition"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Register */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
