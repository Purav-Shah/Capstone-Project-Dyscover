"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AGE_GROUPS, RESPONSE_POINTS, ageToGroup, categorizeRisk } from "../data";

export default function QuestionnaireQuestionsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const first = params.get("first") || "";
  const last = params.get("last") || "";
  const age = params.get("age") || "";
  const sex = params.get("sex") || "";

  const groupKey = useMemo(() => ageToGroup(age), [age]);
  const group = groupKey ? AGE_GROUPS[groupKey] : null;
  const [answers, setAnswers] = useState(() => Array(group?.questions.length || 0).fill(""));
  const [index, setIndex] = useState(0);

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-2">Unsupported age</h1>
        <p className="mb-4">Please enter an age between 3 and 12.</p>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded"
          onClick={() => router.push("/questionnaire")}
        >
          Go back
        </button>
      </div>
    );
  }

  function setAnswer(idx, value) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  }

  function handleSubmit() {
    // compute score
    const score = answers.reduce((sum, a) => sum + (RESPONSE_POINTS[a] ?? 0), 0);
    const result = categorizeRisk(groupKey, score);

    // persist to browser storage for later final computation
    try {
      const payload = {
        first,
        last,
        age: Number(age),
        sex,
        group: groupKey,
        score,
        level: result.level,
        answers,
        savedAt: new Date().toISOString(),
      };
      const key = 'questionnaireResult';
      window.localStorage.setItem(key, JSON.stringify(payload));
    } catch {}

    // proceed to next step (audio test prompt)
    const qp = new URLSearchParams({ first, last, age: String(age), sex });
    router.push(`/questionnaire/next-step?${qp.toString()}`);
  }

  const total = group.questions.length;
  const current = index + 1;
  const percent = Math.round(((answers.filter(Boolean).length) / total) * 100);

  function choose(option) {
    setAnswer(index, option);
    // auto-advance after a short delay for feedback
    setTimeout(() => {
      if (index < total - 1) setIndex((i) => i + 1);
      else handleSubmit();
    }, 200);
  }

  function next() {
    if (index < total - 1) setIndex(index + 1);
    else handleSubmit();
  }

  function prev() {
    if (index > 0) setIndex(index - 1);
  }

  const options = [
    { key: 'Yes', label: 'Yes 😊', color: 'bg-green-600 hover:bg-green-700' },
    { key: 'Sometimes', label: 'Sometimes 🤔', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { key: 'No', label: 'No 🙅', color: 'bg-red-600 hover:bg-red-700' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-3xl">
        <div className="mb-4">
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${Math.max(0, percent)}%` }} />
          </div>
          <div className="text-xs text-slate-600 mt-2 text-right">{answers.filter(Boolean).length} / {total} answered</div>
        </div>
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 text-center">
          <div className="text-sm text-slate-500 mb-2">{group.label} – Parent Questionnaire</div>
          <h1 className="text-2xl font-semibold mb-6">Question {current} of {total}</h1>

          <div className="space-y-6">
            <div className="text-lg md:text-xl font-medium text-slate-800">{group.questions[index]}</div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {options.map((o) => (
                <button
                  key={o.key}
                  className={`px-5 py-3 rounded-full text-white shadow transition-transform active:scale-95 ${o.color} ${answers[index] === o.key ? 'ring-4 ring-offset-2 ring-blue-300' : ''}`}
                  onClick={() => choose(o.key)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between max-w-3xl mx-auto">
          <button className="px-4 py-2 rounded bg-slate-200" onClick={prev} disabled={index === 0}>Back</button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={next}
            disabled={!answers[index]}
          >
            {index === total - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}


