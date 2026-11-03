import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-[#F8FAFC]">
      <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl font-black font-mono text-slate-800">404</span>
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Resource Not Found</h2>
      <p className="text-xs text-slate-500 mb-6 max-w-sm">
        The requested lead, property, or telemetry route could not be loaded.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 font-mono"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
