import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-gray-800 dark:text-white">404</h1>

      <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
        Page not found
      </p>

      <Link
        to="/"
        className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
