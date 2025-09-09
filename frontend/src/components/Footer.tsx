// src/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-gray-200/70 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow">
                WN
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  WorkNest
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Project workspace
                </div>
              </div>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Plan, track, and deliver. WorkNest brings your team’s work into
              one modern, elegant place.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  to="/projects"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  to="/search"
                >
                  Search
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  to="/settings"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  href="https://your-docs.example"
                  target="_blank"
                  rel="noreferrer"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  href="https://support.example"
                  target="_blank"
                  rel="noreferrer"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Company
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} WorkNest. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {/* Socials */}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              aria-label="Twitter"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.633 7.997c.013.18.013.36.013.54 0 5.49-4.179 11.82-11.82 11.82-2.35 0-4.532-.69-6.37-1.87.328.038.644.05.985.05 1.946 0 3.737-.664 5.162-1.79-1.82-.038-3.354-1.236-3.882-2.89.253.038.506.063.772.063.372 0 .744-.05 1.09-.14-1.898-.38-3.328-2.06-3.328-4.07v-.05c.556.31 1.2.5 1.884.526-1.114-.744-1.846-2.01-1.846-3.45 0-.76.203-1.46.556-2.07 2.03 2.5 5.063 4.14 8.48 4.32-.064-.304-.102-.62-.102-.935 0-2.28 1.846-4.127 4.127-4.127 1.19 0 2.266.5 3.021 1.302.935-.177 1.82-.525 2.614-.997-.304.947-.947 1.744-1.796 2.25.834-.102 1.63-.32 2.37-.64-.556.82-1.25 1.542-2.056 2.123z" />
              </svg>
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              aria-label="GitHub"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 .5a11.5 11.5 0 00-3.637 22.418c.575.106.787-.25.787-.556 0-.275-.012-1.184-.018-2.148-3.2.697-3.876-1.54-3.876-1.54-.523-1.33-1.277-1.685-1.277-1.685-1.044-.714.08-.699.08-.699 1.155.082 1.764 1.186 1.764 1.186 1.027 1.76 2.695 1.252 3.35.957.106-.744.402-1.252.73-1.54-2.554-.287-5.238-1.277-5.238-5.683 0-1.255.45-2.28 1.186-3.084-.12-.288-.515-1.45.11-3.022 0 0 .969-.31 3.175 1.178a10.98 10.98 0 015.784 0c2.206-1.487 3.175-1.178 3.175-1.178.625 1.572.23 2.734.113 3.022.742.804 1.183 1.83 1.183 3.084 0 4.418-2.69 5.39-5.257 5.673.41.35.793 1.052.793 2.126 0 1.54-.014 2.78-.014 3.16 0 .31.206.67.793.554A11.5 11.5 0 0012 .5z"
                />
              </svg>
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
              aria-label="LinkedIn"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zM8 8h3.83v2.05h.05C12.53 8.89 14.1 8 16.2 8 20.52 8 21 10.52 21 14.13V23h-4v-7.78c0-1.86-.03-4.26-2.6-4.26-2.6 0-3 2.03-3 4.12V23H8V8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
