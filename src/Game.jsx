import React, { useState } from "react";
import RedVsBlueSphere from "./App.jsx";
import GameModeSelector from "./GameModeSelector.jsx";

export default function Game() {
  const [gameMode, setGameMode] = useState(null); // null or 'single'

  // Handle mode selection
  const handleSelectMode = (mode) => {
    setGameMode(mode);
  };

  // Handle return to menu
  const handleReturnToMenu = () => {
    setGameMode(null);
  };

  // Show mode selector if no mode selected
  if (!gameMode) {
    return <GameModeSelector onSelectMode={handleSelectMode} />;
  }

  // Show game
  return (
    <RedVsBlueSphere mode={gameMode} onReturnToMenu={handleReturnToMenu} />
  );
}
