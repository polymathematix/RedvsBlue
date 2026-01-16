import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
} from "recharts";
import { simulateGame } from "./GameSimulator";

const SPHERE_TYPES = {
  goldberg: { name: "Goldberg", hasDetail: true },
  triangular: { name: "Triangular", hasDetail: true },
  quad: { name: "Quad Sphere", hasDetail: true },
  dodecahedron: { name: "Dodecahedron", hasDetail: false },
  octahedron: { name: "Octahedron", hasDetail: true },
  icosahedron: { name: "Icosahedron", hasDetail: true },
  soccerball: { name: "Soccer Ball", hasDetail: false },
};

const AI_TYPES = {
  human: { name: "Human", disabled: true },
  computer: { name: "Computer" },
};

export default function Analyst({ onReturnToMenu }) {
  // Configuration state
  const [config, setConfig] = useState({
    sphereType: "goldberg",
    subdivisions: 2,
    startingTiles: 3,
    exactElimination: true,
    redPlayer: "computer",
    bluePlayer: "computer",
    numSimulations: 100,
    maxTurnsPerGame: 500,
  });

  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSimulation, setCurrentSimulation] = useState(0);
  const [results, setResults] = useState(null);
  const [currentGameData, setCurrentGameData] = useState(null);
  const [error, setError] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  const simulationRef = useRef({ cancelled: false });
  const scrollContainerRef = useRef(null);

  // Helper to yield control back to browser
  const yieldToMain = () => new Promise((resolve) => setTimeout(resolve, 0));

  // Handle scroll to hide/show scroll hint
  useEffect(() => {
    const handleScroll = (e) => {
      const element = e.target;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      // Hide hint if scrolled down or near bottom
      if (scrollTop > 100 || scrollTop + clientHeight >= scrollHeight - 100) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const runSimulations = async () => {
    // Validation
    if (config.numSimulations < 1) {
      setError("Number of simulations must be at least 1");
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setCurrentSimulation(0);
    setError(null);
    simulationRef.current.cancelled = false;

    const simulationResults = [];
    const startTime = Date.now();

    try {
      for (let i = 0; i < config.numSimulations; i++) {
        if (simulationRef.current.cancelled) break;

        setCurrentSimulation(i + 1);
        setProgress(((i + 1) / config.numSimulations) * 100);

        try {
          const result = await simulateGame(config);
          simulationResults.push(result);

          // Update current game data for live visualization
          setCurrentGameData({
            gameNumber: i + 1,
            ...result,
          });
        } catch (simError) {
          console.error(`Error in simulation ${i + 1}:`, simError);
          // Continue with other simulations
        }

        // Yield to browser to keep UI responsive
        await yieldToMain();
      }

      if (simulationResults.length === 0) {
        setError("No simulations completed successfully");
        setIsRunning(false);
        return;
      }

      const endTime = Date.now();
      const totalTime = (endTime - startTime) / 1000;

      // Calculate statistics
      const redWins = simulationResults.filter(
        (r) => r.winner === "red",
      ).length;
      const blueWins = simulationResults.filter(
        (r) => r.winner === "blue",
      ).length;
      const avgTurns =
        simulationResults.reduce((sum, r) => sum + r.turns, 0) /
        simulationResults.length;
      const avgMoves =
        simulationResults.reduce((sum, r) => sum + r.moves, 0) /
        simulationResults.length;
      const avgEliminations =
        simulationResults.reduce((sum, r) => sum + r.eliminations, 0) /
        simulationResults.length;
      const avgCaptures =
        simulationResults.reduce((sum, r) => sum + r.captures, 0) /
        simulationResults.length;

      const minTurns = Math.min(...simulationResults.map((r) => r.turns));
      const maxTurns = Math.max(...simulationResults.map((r) => r.turns));
      const medianTurns = simulationResults
        .map((r) => r.turns)
        .sort((a, b) => a - b)[Math.floor(simulationResults.length / 2)];

      setResults({
        simulationResults,
        summary: {
          totalGames: simulationResults.length,
          redWins,
          blueWins,
          redWinRate: (redWins / simulationResults.length) * 100,
          blueWinRate: (blueWins / simulationResults.length) * 100,
          avgTurns,
          avgMoves,
          avgEliminations,
          avgCaptures,
          minTurns,
          maxTurns,
          medianTurns,
          totalTime,
          avgTimePerGame: totalTime / simulationResults.length,
        },
      });
    } catch (error) {
      console.error("Simulation error:", error);
      setError(`Simulation failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const cancelSimulations = () => {
    simulationRef.current.cancelled = true;
    setIsRunning(false);
  };

  const exportToJSON = () => {
    if (!results) return;
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redvsblue-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!results) return;

    const headers = [
      "Game",
      "Winner",
      "Turns",
      "Moves",
      "Eliminations",
      "Captures",
      "Duration",
    ];
    const rows = results.simulationResults.map((r, i) => [
      i + 1,
      r.winner,
      r.turns,
      r.moves,
      r.eliminations,
      r.captures,
      r.duration.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const dataBlob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redvsblue-analysis-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const prepareWinRateData = () => {
    if (!results) return [];
    return [
      { name: "Red Wins", value: results.summary.redWins, color: "#ef4444" },
      { name: "Blue Wins", value: results.summary.blueWins, color: "#3b82f6" },
    ];
  };

  const prepareGameLengthDistribution = () => {
    if (!results) return [];

    const buckets = {};
    const bucketSize = 10;

    results.simulationResults.forEach((r) => {
      const bucket = Math.floor(r.turns / bucketSize) * bucketSize;
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });

    return Object.keys(buckets)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((bucket) => ({
        turns: `${bucket}-${parseInt(bucket) + bucketSize}`,
        count: buckets[bucket],
      }));
  };

  const prepareTrendData = () => {
    if (!results) return [];

    const bucketSize = Math.max(
      1,
      Math.floor(results.simulationResults.length / 20),
    );
    const buckets = [];

    for (let i = 0; i < results.simulationResults.length; i += bucketSize) {
      const slice = results.simulationResults.slice(i, i + bucketSize);
      const redWins = slice.filter((r) => r.winner === "red").length;
      const avgTurns =
        slice.reduce((sum, r) => sum + r.turns, 0) / slice.length;

      buckets.push({
        game: i + bucketSize / 2,
        redWinRate: (redWins / slice.length) * 100,
        avgTurns,
      });
    }

    return buckets;
  };

  const prepareScatterData = () => {
    if (!results) return [];
    return results.simulationResults.map((r, i) => ({
      game: i + 1,
      turns: r.turns,
      winner: r.winner,
    }));
  };

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-screen h-screen overflow-y-auto scroll-smooth bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6"
    >
      <style>{`
        /* Custom Scrollbar Styling */
        .min-h-screen::-webkit-scrollbar {
          width: 12px;
        }
        .min-h-screen::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 6px;
        }
        .min-h-screen::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 6px;
          border: 2px solid rgba(15, 23, 42, 0.5);
        }
        .min-h-screen::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #818cf8 0%, #a78bfa 100%);
        }

        /* Custom scrollbar for config panel */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }

        /* Scroll hint animation */
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm py-4 -mx-6 px-6 mb-8 border-b border-white/10">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                🔬 Game Analyst
              </h1>
              <p className="text-gray-400">
                Run simulations and analyze game statistics
              </p>
            </div>
            <button
              onClick={onReturnToMenu}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10 max-h-[calc(100vh-12rem)] overflow-y-auto scroll-smooth">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              ⚙️ Configuration
            </h2>

            <div className="space-y-4">
              {/* Sphere Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sphere Type
                </label>
                <select
                  value={config.sphereType}
                  onChange={(e) =>
                    setConfig({ ...config, sphereType: e.target.value })
                  }
                  disabled={isRunning}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {Object.entries(SPHERE_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subdivisions */}
              {SPHERE_TYPES[config.sphereType]?.hasDetail && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Subdivisions: {config.subdivisions}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={config.subdivisions}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        subdivisions: parseInt(e.target.value),
                      })
                    }
                    disabled={isRunning}
                    className="w-full"
                  />
                </div>
              )}

              {/* Starting Tiles */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Starting Tiles: {config.startingTiles}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={config.startingTiles}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      startingTiles: parseInt(e.target.value),
                    })
                  }
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              {/* Exact Elimination */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.exactElimination}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        exactElimination: e.target.checked,
                      })
                    }
                    disabled={isRunning}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Exact Elimination</span>
                </label>
              </div>

              {/* Red Player */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Red Player
                </label>
                <select
                  value={config.redPlayer}
                  onChange={(e) =>
                    setConfig({ ...config, redPlayer: e.target.value })
                  }
                  disabled={isRunning}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {Object.entries(AI_TYPES)
                    .filter(([, value]) => !value.disabled)
                    .map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Blue Player */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Blue Player
                </label>
                <select
                  value={config.bluePlayer}
                  onChange={(e) =>
                    setConfig({ ...config, bluePlayer: e.target.value })
                  }
                  disabled={isRunning}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {Object.entries(AI_TYPES)
                    .filter(([, value]) => !value.disabled)
                    .map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Number of Simulations */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Simulations: {config.numSimulations}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={config.numSimulations}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      numSimulations: parseInt(e.target.value) || 1,
                    })
                  }
                  disabled={isRunning}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Max Turns Per Game */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Turns Per Game: {config.maxTurnsPerGame}
                </label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={config.maxTurnsPerGame}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      maxTurnsPerGame: parseInt(e.target.value) || 500,
                    })
                  }
                  disabled={isRunning}
                  className="w-full px-3 py-2 bg-slate-700 rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Run Button */}
              <div className="pt-4 space-y-2">
                {!isRunning ? (
                  <button
                    onClick={runSimulations}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold transition-all transform hover:scale-105"
                  >
                    🚀 Run Simulations
                  </button>
                ) : (
                  <button
                    onClick={cancelSimulations}
                    className="w-full px-4 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold transition-colors"
                  >
                    ⏹️ Cancel
                  </button>
                )}

                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
                    ⚠️ {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress & Current Game */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Display */}
            {error && !isRunning && !results && (
              <div className="bg-red-900/30 backdrop-blur rounded-xl p-6 border border-red-500/30">
                <h2 className="text-xl font-bold mb-2 text-red-400">
                  ⚠️ Error
                </h2>
                <p className="text-red-200">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {(isRunning || results) && (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-4">Progress</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>
                      Simulation {currentSimulation} of {config.numSimulations}
                    </span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Current Game Data */}
            {currentGameData && isRunning && (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-bold mb-4">Latest Game</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Winner</div>
                    <div
                      className={`text-2xl font-bold ${currentGameData.winner === "red" ? "text-red-400" : "text-blue-400"}`}
                    >
                      {currentGameData.winner === "red" ? "🔴 Red" : "🔵 Blue"}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Turns</div>
                    <div className="text-2xl font-bold">
                      {currentGameData.turns}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Moves</div>
                    <div className="text-2xl font-bold">
                      {currentGameData.moves}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">
                      Eliminations
                    </div>
                    <div className="text-2xl font-bold">
                      {currentGameData.eliminations}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Captures</div>
                    <div className="text-2xl font-bold">
                      {currentGameData.captures}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1">Duration</div>
                    <div className="text-2xl font-bold">
                      {currentGameData.duration.toFixed(1)}s
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        {results && showScrollHint && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 animate-bounce-slow transition-opacity duration-300">
            <div className="bg-purple-600/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-purple-400/50 flex items-center gap-2">
              <span className="text-sm font-medium">
                Scroll down for charts
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <>
            {/* Summary Statistics */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">📊 Summary Statistics</h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportToJSON}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-sm"
                  >
                    📥 Export JSON
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors text-sm"
                  >
                    📥 Export CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Games</div>
                  <div className="text-3xl font-bold">
                    {results.summary.totalGames}
                  </div>
                </div>
                <div className="bg-red-900/20 rounded-lg p-4 border border-red-500/20">
                  <div className="text-red-400 text-sm mb-1">Red Wins</div>
                  <div className="text-3xl font-bold text-red-400">
                    {results.summary.redWins}
                  </div>
                  <div className="text-xs text-red-300 mt-1">
                    {results.summary.redWinRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
                  <div className="text-blue-400 text-sm mb-1">Blue Wins</div>
                  <div className="text-3xl font-bold text-blue-400">
                    {results.summary.blueWins}
                  </div>
                  <div className="text-xs text-blue-300 mt-1">
                    {results.summary.blueWinRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Avg Turns</div>
                  <div className="text-3xl font-bold">
                    {results.summary.avgTurns.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Avg Moves</div>
                  <div className="text-3xl font-bold">
                    {results.summary.avgMoves.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Total Time</div>
                  <div className="text-3xl font-bold">
                    {results.summary.totalTime.toFixed(1)}s
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Min Turns</div>
                  <div className="text-2xl font-bold">
                    {results.summary.minTurns}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Max Turns</div>
                  <div className="text-2xl font-bold">
                    {results.summary.maxTurns}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Median Turns</div>
                  <div className="text-2xl font-bold">
                    {results.summary.medianTurns}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">
                    Avg Eliminations
                  </div>
                  <div className="text-2xl font-bold">
                    {results.summary.avgEliminations.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">Avg Captures</div>
                  <div className="text-2xl font-bold">
                    {results.summary.avgCaptures.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm mb-1">
                    Avg Time/Game
                  </div>
                  <div className="text-2xl font-bold">
                    {results.summary.avgTimePerGame.toFixed(2)}s
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Win Rate Pie Chart */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Win Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareWinRateData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareWinRateData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Game Length Distribution */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">
                  Game Length Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareGameLengthDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="turns" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                      }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Win Rate Trend */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">Red Win Rate Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={prepareTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="game" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="redWinRate"
                      stroke="#ef4444"
                      fill="#ef444450"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Game Length Scatter */}
              <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-4">
                  Game Length by Winner
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="game" name="Game #" stroke="#94a3b8" />
                    <YAxis dataKey="turns" name="Turns" stroke="#94a3b8" />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                      }}
                    />
                    <Legend />
                    <Scatter
                      name="Red Wins"
                      data={prepareScatterData().filter(
                        (d) => d.winner === "red",
                      )}
                      fill="#ef4444"
                    />
                    <Scatter
                      name="Blue Wins"
                      data={prepareScatterData().filter(
                        (d) => d.winner === "blue",
                      )}
                      fill="#3b82f6"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Average Turns Over Time */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-xl font-bold mb-4">
                Average Game Length Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="game" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgTurns"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* No Results Message */}
        {!results && !isRunning && (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-12 border border-white/10 text-center mb-6">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold mb-2">No Data Yet</h3>
            <p className="text-gray-400">
              Configure your simulation parameters and click "Run Simulations"
              to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
