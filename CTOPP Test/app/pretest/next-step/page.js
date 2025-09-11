"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PretestNextStepPage() {
  const router = useRouter();
  const params = useSearchParams();
  const first = params.get("first") || "";
  const last = params.get("last") || "";
  const age = params.get("age") || "";
  const sex = params.get("sex") || "";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">Pretest Complete</h1>
        <p className="text-slate-600 mb-6">Thanks, {first} {last}. The pretest is saved.</p>
        <p className="text-slate-700 mb-6">Next, we will do a short phoneme blending test.</p>
        <div className="flex items-center justify-center gap-4">
          <button
            className="px-5 py-3 rounded-full bg-blue-600 text-white"
            onClick={() => router.push(`/phoneme?${new URLSearchParams({ first, last, age, sex }).toString()}`)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}







