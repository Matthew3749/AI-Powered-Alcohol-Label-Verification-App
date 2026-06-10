"use client";
import { useState } from "react";
import DropZone from "@/components/DropZone";
import ApplicationForm from "@/components/ApplicationForm";
import ResultsPanel from "@/components/ResultsPanel";
import { ApplicationData, VerificationResult } from "@/types";

const emptyApplication: ApplicationData = {
  brandName: "",
  classType: "",
  alcoholContent: "",
  netContents: "",
  bottlerName: "",
  bottlerAddress: "",
  countryOfOrigin: "",
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [application, setApplication] = useState<ApplicationData>(emptyApplication);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");

  const handleVerify = async () => {
    if (!file) return setError("Please upload a label image.");
    const missing = Object.entries(application).filter(([k, v]) => k !== "countryOfOrigin" && !v.trim());
    if (missing.length > 0) return setError("Please fill in all required application fields.");

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("application", JSON.stringify(application));

      const res = await fetch("/api/verify", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Verification failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setApplication(emptyApplication);
    setResult(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-700 text-white p-2 rounded-lg">
              <span className="text-xl">🏛️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                TTB Label Verification
              </h1>
              <p className="text-xs text-gray-500">
                Alcohol Beverage Label Compliance Tool
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-400 hidden sm:block">
            Powered by AI · Sub-5s processing
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["single", "batch"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                ? "bg-blue-700 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300"
                }`}
            >
              {tab === "single" ? "Single Label" : "Batch Upload"}
            </button>
          ))}
        </div>

        {activeTab === "single" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Label Image
                </h2>
                <DropZone file={file} onFileSelect={setFile} />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ApplicationForm data={application} onChange={setApplication} />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all shadow
                  ${loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-700 hover:bg-blue-800 active:scale-95"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing Label...
                  </span>
                ) : (
                  "Verify Label"
                )}
              </button>

              {result && (
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition"
                >
                  Start New Verification
                </button>
              )}
            </div>

            {/* Right column */}
            <div>
              {result ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <ResultsPanel result={result} />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex items-center justify-center">
                  <div className="text-center text-gray-400 space-y-3">
                    <div className="text-6xl">📋</div>
                    <p className="text-lg font-medium">Results will appear here</p>
                    <p className="text-sm">
                      Upload a label and fill in the application data, then click Verify Label
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "batch" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Batch Upload
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Upload a CSV file with application data alongside multiple label images to verify them all at once.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              <span>🚧</span> Coming in next update
            </div>
          </div>
        )}
      </div>
    </main>
  );
}