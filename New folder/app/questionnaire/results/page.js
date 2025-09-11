"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { AGE_GROUPS } from "../data";

export default function QuestionnaireResultsPage() {
  const params = useSearchParams();
  const router = useRouter();
  const first = params.get("first") || "";
  const last = params.get("last") || "";
  const age = params.get("age") || "";
  const sex = params.get("sex") || "";
  const group = params.get("group") || "";
  const score = Number(params.get("score") || 0);
  const level = params.get("level") || "Unknown";

  const maxPoints = AGE_GROUPS[group]?.maxPoints ?? 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Questionnaire Results</h1>
      <div className="border rounded p-4 space-y-2">
        <div>
          <span className="font-medium">Name:</span> {first} {last}
        </div>
        <div>
          <span className="font-medium">Age:</span> {age}
        </div>
        <div>
          <span className="font-medium">Sex:</span> {sex}
        </div>
        <div>
          <span className="font-medium">Age Group:</span> {group}
        </div>
        {/* Intentionally hide numerical score */}
        <div>
          <span className="font-medium">Risk Level:</span> {level}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          className="px-4 py-2 rounded bg-gray-200"
          onClick={() => router.push("/questionnaire")}
        >
          New Questionnaire
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white"
          onClick={() => router.push(`/questionnaire/next-step?${new URLSearchParams({ first, last, age, sex, group, score: String(score), level }).toString()}`)}
        >
          Continue to next step
        </button>
      </div>
    </div>
  );
}


