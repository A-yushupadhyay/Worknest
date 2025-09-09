// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import BoardPage from "./pages/BoardPage";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import ProjectsPage from "./pages/ProjectsPage";
import SettingsPage from "./pages/SettingsPage";
import Register from "./pages/Register";

import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

import NotFoundPage from "./pages/NotFoundPage";
import ServerErrorPage from "./pages/ServerErrorPage";
import UnderConstructionPage from "./pages/UnderConstructionPage";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />

            {/* Protected Layout Routes */}
            <Route
              path="/board/:projectId"
              element={
                <Layout>
                  <ProtectedRoute>
                    <BoardPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/search"
              element={
                <Layout>
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/projects"
              element={
                <Layout>
                  <ProtectedRoute>
                    <ProjectsPage />
                  </ProtectedRoute>
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* Special Pages */}
            <Route path="/server-error" element={<ServerErrorPage />} />
            <Route path="/under-construction" element={<UnderConstructionPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
