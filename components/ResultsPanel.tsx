"use client";
import { VerificationResult } from "@/types";
import { GOVERNMENT_WARNING } from "@/lib/verify";

interface Props {
    result: VerificationResult;
}

const statusConfig = {
    pass: { bg: "bg-green-50", border: "border-green-200", badge: "bg-green-100 text-green-800", icon: "✓", label: "PASS" },
    fail: { bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", icon: "✗", label: "FAIL" },
    warning: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800", icon: "⚠", label: "REVIEW" },
    missing: { bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700", icon: "?", label: "MISSING" },
};

export default function ResultsPanel({ result }: Props) {
    const passCount = result.fields.filter((f) => f.status === "pass").length;
    const failCount = result.fields.filter((f) => f.status === "fail" || f.status === "missing").length;

    return (
        <div className="space-y-6">
            {/* Overall verdict */}
            <div className={`rounded-xl p-6 border-2 text-center ${result.overallPass
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}>
                <div className="text-4xl mb-2">{result.overallPass ? "✅" : "❌"}</div>
                <div className={`text-2xl font-bold ${result.overallPass ? "text-green-700" : "text-red-700"}`}>
                    {result.overallPass ? "APPROVED" : "REJECTED"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    {passCount} of {result.fields.length} fields passed ·{" "}
                    {result.processingTimeMs}ms processing time
                </div>
            </div>

            {/* Field results */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Field-by-Field Results</h3>
                {result.fields.map((field) => {
                    const config = statusConfig[field.status];
                    const isWarning = field.label === "Government Warning";
                    return (
                        <div
                            key={field.label}
                            className={`rounded-lg border p-4 ${config.bg} ${config.border}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-800 text-sm">{field.label}</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${config.badge}`}>
                                    {config.icon} {config.label}
                                </span>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div>
                                    <span className="text-gray-500 font-medium">Expected: </span>
                                    <span className="text-gray-700">
                                        {isWarning && field.status !== "pass"
                                            ? GOVERNMENT_WARNING
                                            : field.expected || "—"}
                                    </span>
                                </div>
                                {field.status !== "pass" && (
                                    <div>
                                        <span className="text-gray-500 font-medium">Found: </span>
                                        <span className="text-gray-700">{field.extracted || "Not found"}</span>
                                    </div>
                                )}
                                {field.note && (
                                    <div className="mt-1 text-red-600 font-medium">{field.note}</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}