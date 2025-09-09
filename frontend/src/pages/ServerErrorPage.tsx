import { useNavigate } from "react-router-dom";

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">500</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        Something went wrong on our end. Please try again later.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default ServerErrorPage;
