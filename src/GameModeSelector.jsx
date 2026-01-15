import React from "react";

export default function GameModeSelector({ onSelectMode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl z-50 fade-in p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-7xl font-black mb-4 text-gradient-purple drop-shadow-2xl">
            Red vs Blue
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl font-medium tracking-wide">
            ✨ Choose Your Game Mode ✨
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Single Player Card */}
          <button
            onClick={() => onSelectMode("single")}
            className="card-elevated p-8 text-left hover:scale-105 transition-all duration-300 hover-glow-purple group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              🎮
            </div>
            <h2 className="text-3xl font-black text-white mb-3">
              Single Player
            </h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Play against AI opponents with different difficulty levels, or
              challenge a friend on the same device.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>4 AI difficulty levels</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Local 2-player mode</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Practice and learn strategies</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>No internet required</span>
              </div>
            </div>
            <div className="mt-6 btn-primary text-center w-full">
              Play Solo →
            </div>
          </button>

          {/* Multiplayer Card */}
          <button
            onClick={() => onSelectMode("multi")}
            className="card-elevated p-8 text-left hover:scale-105 transition-all duration-300 hover-glow-blue group relative overflow-hidden"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                🌐
              </div>
              <h2 className="text-3xl font-black text-white mb-3">
                Multiplayer
                <span className="ml-3 text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
                  NEW
                </span>
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Challenge players online in real-time matches. Create a room or
                join a friend's game instantly.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Real-time online matches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Quick match or private rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>In-game chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Play with friends anywhere</span>
                </div>
              </div>
              <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl text-center shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all">
                Play Online →
              </div>
            </div>
          </button>
        </div>

        {/* Additional Info */}
        <div className="card text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Strategic gameplay on 3D spheres</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>5 different sphere geometries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              <span>Fully customizable settings</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Use arrow keys or drag to rotate • Click tiles to play</p>
        </div>
      </div>
    </div>
  );
}
