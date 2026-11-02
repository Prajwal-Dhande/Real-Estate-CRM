import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-slate-50">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <span className="text-xl font-bold font-mono text-slate-700">404</span>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1">Page Not Found</h2>
      <p className="text-xs text-slate-500 mb-5 max-w-sm">
        The requested resource or endpoint could not be found.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors font-mono"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

