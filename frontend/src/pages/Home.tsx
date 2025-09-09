// src/pages/Home.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLayout, FiUsers, FiSearch, FiShield } from "react-icons/fi";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="flex-1 flex items-center justify-center px-6 py-20 text-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
            Organize work. Boost collaboration. <br />
            <span className="text-blue-600">Welcome to WorkNest</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Manage projects, track progress, and collaborate with your team —
            all in one place.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
            Why teams choose WorkNest
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl shadow-sm border bg-gray-50 hover:shadow-md transition">
              <FiLayout className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800">Project Boards</h3>
              <p className="text-sm text-gray-600 mt-2">
                Organize tasks visually with Kanban-style boards and drag &
                drop.
              </p>
            </div>
            <div className="p-6 rounded-xl shadow-sm border bg-gray-50 hover:shadow-md transition">
              <FiUsers className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800">
                Real-time Collaboration
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Work together with instant updates and in-app comments.
              </p>
            </div>
            <div className="p-6 rounded-xl shadow-sm border bg-gray-50 hover:shadow-md transition">
              <FiSearch className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800">Smart Search</h3>
              <p className="text-sm text-gray-600 mt-2">
                Quickly find tasks, projects, and team members across your org.
              </p>
            </div>
            <div className="p-6 rounded-xl shadow-sm border bg-gray-50 hover:shadow-md transition">
              <FiShield className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-800">Secure Access</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enterprise-grade authentication with role-based access control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 bg-gray-100 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} WorkNest — Built for modern teams
      </footer>
    </div>
  );
};

export default Home;
