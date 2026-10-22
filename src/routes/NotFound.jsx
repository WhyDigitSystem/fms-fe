import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8">
      {/* Background decorations */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md text-center">
        {/* Error code */}
        <h2 className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
          404
        </h2>

        {/* Message */}
        <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-800 dark:text-white">
          Oops! Page not found
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or return to your dashboard.
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link
            to="/"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/15 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Home size={16} />
            Back to Dashboard
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-900"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        {/* Footer */}
      </div>
    </div>
  );
}
