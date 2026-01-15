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
            ✨ Strategic 3D Sphere Game ✨
          </p>
        </div>

        {/* Mode Card */}
        <div className="max-w-2xl mx-auto mb-8">
          {/* Single Player Card */}
          <button
            onClick={() => onSelectMode("single")}
            className="card-elevated p-8 text-left hover:scale-105 transition-all duration-300 hover-glow-purple group w-full"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              🎮
            </div>
            <h2 className="text-3xl font-black text-white mb-3">Play Game</h2>
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
              Start Game →
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
