"use client";

import { useSearchParams } from "next/navigation";

export default function ReadingResultsPage() {
  const params = useSearchParams();
  const first = params.get("first") || "";
  const last = params.get("last") || "";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-3">Calculating Results...</h1>
        <p className="text-slate-700 mb-6">Thank you, {first} {last}, for giving the test.</p>
        <p className="text-slate-600 text-sm">Do not close this window. Your results will be available shortly.</p>
      </div>
    </div>
  );
}




