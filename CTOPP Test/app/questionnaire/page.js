"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function QuestionnaireIntroPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");

  function handleStart(e) {
    e.preventDefault();
    if (!firstName || !lastName || !age || !sex) return;
    const params = new URLSearchParams({
      first: firstName,
      last: lastName,
      age: String(age),
      sex,
    });
    router.push(`/questionnaire/questions?${params.toString()}`);
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Parent Questionnaire</h1>
      <p className="text-sm text-gray-600 mb-6">
        Please fill basic information to begin the questionnaire.
      </p>

      <form onSubmit={handleStart} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">First name</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Last name</label>
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Age</label>
            <input
              type="number"
              min={3}
              max={12}
              className="mt-1 w-full border rounded px-3 py-2"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Sex</label>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Start Questionnaire
        </button>
      </form>
    </div>
  );
}


