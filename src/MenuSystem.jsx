import React, { useState } from "react";
import RedVsBlueSphere from "./App";
import Analyst from "./Analyst";

export default function MenuSystem() {
  const [currentView, setCurrentView] = useState("menu"); // 'menu', 'game', 'analyst'

  const returnToMenu = () => {
    setCurrentView("menu");
  };

  if (currentView === "game") {
    return <RedVsBlueSphere mode="play" onReturnToMenu={returnToMenu} />;
  }

  if (currentView === "analyst") {
    return <Analyst onReturnToMenu={returnToMenu} />;
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
            Red vs Blue
          </h1>
          <p className="text-xl text-gray-300 mb-2 animate-slide-up">
            3D Sphere Strategy Game
          </p>
          <p
            className="text-sm text-gray-400 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Conquer the sphere, eliminate opponents, capture territory
          </p>
        </div>

        <style>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-gradient {
            animation: gradient 3s ease infinite;
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.6s ease-out;
            animation-fill-mode: both;
          }
        `}</style>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Play Game Card */}
          <button
            onClick={() => setCurrentView("game")}
            className="group bg-slate-800/50 backdrop-blur border-2 border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 hover:bg-slate-800/70 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              🎮
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">
              Play Game
            </h2>
            <p className="text-gray-400 mb-4">
              Start a new game against AI or local player
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-blue-900/30 rounded-full text-xs text-blue-300 border border-blue-500/30">
                Single Player
              </span>
              <span className="px-3 py-1 bg-purple-900/30 rounded-full text-xs text-purple-300 border border-purple-500/30">
                Local Multiplayer
              </span>
              <span className="px-3 py-1 bg-green-900/30 rounded-full text-xs text-green-300 border border-green-500/30">
                AI Opponents
              </span>
            </div>
          </button>

          {/* Analyst Card */}
          <button
            onClick={() => setCurrentView("analyst")}
            className="group bg-slate-800/50 backdrop-blur border-2 border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 hover:bg-slate-800/70 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-6xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              🔬
            </div>
            <h2 className="text-3xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
              Game Analyst
            </h2>
            <p className="text-gray-400 mb-4">
              Run simulations and analyze game statistics
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-purple-900/30 rounded-full text-xs text-purple-300 border border-purple-500/30">
                Bulk Simulations
              </span>
              <span className="px-3 py-1 bg-pink-900/30 rounded-full text-xs text-pink-300 border border-pink-500/30">
                Statistics
              </span>
              <span className="px-3 py-1 bg-blue-900/30 rounded-full text-xs text-blue-300 border border-blue-500/30">
                Data Export
              </span>
            </div>
          </button>
        </div>

        {/* Features Section */}
        <div
          className="bg-slate-800/30 backdrop-blur rounded-xl p-6 border border-white/10 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h3 className="text-lg font-bold text-white mb-4 text-center">
            ✨ Game Features
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 hover:bg-white/5 rounded-lg transition-all duration-200 group cursor-default">
              <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-200">
                🌐
              </div>
              <div className="text-xs text-gray-300 group-hover:text-white transition-colors">
                Multiple Sphere Types
              </div>
            </div>
            <div className="p-3 hover:bg-white/5 rounded-lg transition-all duration-200 group cursor-default">
              <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-200">
                🎯
              </div>
              <div className="text-xs text-gray-300 group-hover:text-white transition-colors">
                Strategic Gameplay
              </div>
            </div>
            <div className="p-3 hover:bg-white/5 rounded-lg transition-all duration-200 group cursor-default">
              <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-200">
                🤖
              </div>
              <div className="text-xs text-gray-300 group-hover:text-white transition-colors">
                Smart AI
              </div>
            </div>
            <div className="p-3 hover:bg-white/5 rounded-lg transition-all duration-200 group cursor-default">
              <div className="text-2xl mb-2 group-hover:scale-125 transition-transform duration-200">
                📊
              </div>
              <div className="text-xs text-gray-300 group-hover:text-white transition-colors">
                Detailed Analytics
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div
          className="mt-8 text-center text-sm text-gray-500 animate-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="mb-2 hover:text-gray-400 transition-colors">
            🖱️ Click tiles to move or eliminate · 🎨 Capture territory · 🏆
            Dominate the sphere
          </p>
          <p className="text-xs hover:text-gray-400 transition-colors">
            Use the Analyst to study game patterns and optimize strategies
          </p>
        </div>
      </div>
    </div>
  );
}
