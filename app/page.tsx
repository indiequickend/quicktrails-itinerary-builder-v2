import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
      <main className="flex w-full max-w-md flex-col items-center justify-center p-10 bg-white shadow-xl rounded-sm border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-500">

        {/* Branding */}
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
          QuickTrails
        </h1>
        <p className="text-xs uppercase tracking-widest text-amber-600 mb-8 font-semibold">
          Agent Workspace
        </p>

        <p className="text-gray-500 mb-8 leading-relaxed text-sm">
          Welcome to the internal portal. Build, manage, and export premium tour packages and B2B itineraries.
        </p>

        {/* Navigation Actions */}
        <div className="flex flex-col w-full gap-3">
          <Link
            href="/builder"
            className="flex h-12 w-full items-center justify-center rounded bg-gray-900 px-5 text-white transition-colors hover:bg-gray-800 font-medium shadow-sm"
          >
            Open Itinerary Builder
          </Link>
          <Link
            href="/catalog"
            className="flex h-12 w-full items-center justify-center rounded border border-gray-200 px-5 text-gray-700 transition-colors hover:bg-gray-50 font-medium"
          >
            Manage Master Catalog
          </Link>
        </div>

      </main>
    </div>
  );
}