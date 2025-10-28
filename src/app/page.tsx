"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hello");
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
          SolaCheck
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AWP Projekt für das Zukunftsforum Nachhaltigkeit
        </p>

        <div className="space-y-4">
          <button
            onClick={fetchData}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? "Loading..." : "Test API Call"}
          </button>

          {message && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-center">{message}</p>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold text-gray-800 mb-2">Features:</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>Next.js App Router</li>
            <li>Progressive Web App (PWA) support</li>
            <li>Tailwind CSS for styling</li>
            <li>API routes for backend functionality</li>
            <li>TypeScript for type safety</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
