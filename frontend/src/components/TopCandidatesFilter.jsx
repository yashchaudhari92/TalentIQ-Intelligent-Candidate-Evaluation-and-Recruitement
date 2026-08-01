import React, { useState } from "react";
import API from "../api/axios";

export default function TopCandidatesFilter({
    applications,
    finalScores,
    rankMap,
    onFilter, // optional callback (safe, non-breaking)
}) {
    const [topCount, setTopCount] = useState("");
    const [filteredApps, setFilteredApps] = useState(null);

    const handleFilter = () => {
        if (!topCount || topCount <= 0) {
            alert("Please enter valid number");
            return;
        }

        if (topCount > applications.length) {
            alert("⚠️ Requested candidates exceed total applicants");
            return;
        }

        // ✅ Combine score (Final Score + Rank Score logic ready)

        const processed = [...applications]
            .map((app) => {
                const candidateId = String(app.candidate?._id || "");
                const emailKey = app.candidate?.email?.toLowerCase() || "";

                if (!candidateId) return null;

                const finalScore = finalScores?.[candidateId]?.finalScore ?? 0;
                const aiRankScore = rankMap?.[emailKey] ?? 0;

                const combinedScore = finalScore * 0.7 + aiRankScore * 0.3;

                console.log("ID:", candidateId, "Final:", finalScore, "Rank:", aiRankScore);

                return {
                    ...app,
                    score: combinedScore,
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score);

        const topCandidates = processed.slice(0, Number(topCount));

        setFilteredApps(topCandidates);

        // ✅ optional parent callback (safe)
        if (onFilter) {
            onFilter(topCandidates);
        }
    };

    const resetFilter = () => {
        setFilteredApps(null);
        setTopCount("");

        if (onFilter) {
            onFilter(null);
        }
    };

    return (
        <div className="mb-8 p-4 bg-white rounded-xl shadow-md border">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                🎯 Top Candidates Filter
            </h3>

            <div className="flex flex-wrap gap-3 items-center">
                <input
                    type="number"
                    placeholder="Enter number of candidates"
                    value={topCount}
                    onChange={(e) => setTopCount(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                />

                <button
                    onClick={handleFilter}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                    Show Top
                </button>

                <button
                    onClick={resetFilter}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                    Reset
                </button>
            </div>

            {/* RESULT PREVIEW */}
            {filteredApps && (
                <div className="mt-4 text-sm text-gray-700 space-y-1">
                    <div>
                        Showing top <b>{filteredApps.length}</b> candidates
                    </div>

                    {/* OPTIONAL PREVIEW LIST */}
                    <div className="text-xs text-gray-500">
                        {filteredApps.map((app, i) => (
                            <div key={i}>
                                #{i + 1} - {app.candidate?.name || "Candidate"} (
                                {Math.round(app.score)})
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}