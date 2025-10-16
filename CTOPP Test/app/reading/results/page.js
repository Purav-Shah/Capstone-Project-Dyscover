"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReadingResultsPage() {
  const params = useSearchParams();
  const router = useRouter();

  const first = params.get("first") || "";
  const last = params.get("last") || "";
  const age = params.get("age") || "";
  const sex = params.get("sex") || "";

  const [readingResult, setReadingResult] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem("readingResult");
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.wpm !== undefined) {
          setReadingResult(parsed);
        }
      }
    } catch (e) {
      // noop: keep empty state
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleGoToComprehensive = () => {
    const query = new URLSearchParams({ first, last, age, sex }).toString();
    router.push(`/results?${query}`);
  };

  const handleGoHome = () => router.push("/");

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-3 text-center">Reading Results</h1>
        <p className="text-slate-700 mb-6 text-center">
          Thank you, {first} {last}.
        </p>

        {!loaded && (
          <p className="text-slate-600 text-sm text-center">Loading your results…</p>
        )}

        {loaded && !readingResult && (
          <div className="text-center">
            <p className="text-slate-700 mb-4">No reading results were found on this device.</p>
            <p className="text-slate-600 text-sm mb-6">
              Please complete the reading task first, then return here.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleGoHome}
                className="px-5 py-2 rounded-xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
              >
                Go to Home
              </button>
              <button
                onClick={handleGoToComprehensive}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition"
              >
                View Comprehensive Results
              </button>
            </div>
          </div>
        )}

        {loaded && readingResult && (
          <div>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 rounded-2xl bg-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Words per Minute (WPM)</span>
                  <span className="font-semibold">{readingResult.wpm}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Correct Words</span>
                  <span className="font-semibold text-green-700">{readingResult.correctWords ?? 0}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Errors</span>
                  <span className="font-semibold text-red-700">{readingResult.errorCount ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={handleGoToComprehensive}
                className="px-6 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                View Comprehensive Results
              </button>
              <button
                onClick={handleGoHome}
                className="px-6 py-2 rounded-2xl bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
              >
                Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
