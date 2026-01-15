import React, { useState, useEffect } from "react";
import RedVsBlueSphere from "./App.jsx";
import GameModeSelector from "./GameModeSelector.jsx";
import MultiplayerLobby from "./MultiplayerLobby.jsx";
import { useMultiplayer } from "./useMultiplayer.jsx";

export default function Game() {
  const [gameMode, setGameMode] = useState(null); // null, 'single', 'multi'
  const [showLobby, setShowLobby] = useState(false);
  const [multiplayerConfig, setMultiplayerConfig] = useState(null);

  const {
    roomId,
    playerColor,
    roomInfo,
    gameStarted,
    sendGameMove,
    sendGameOver,
    onGameMove,
    onGameOver,
    onGameRestart,
    isMyTurn,
    leaveRoom,
  } = useMultiplayer();

  // Handle mode selection
  const handleSelectMode = (mode) => {
    setGameMode(mode);
    if (mode === "multi") {
      setShowLobby(true);
    }
  };

  // Handle multiplayer game start from lobby
  const handleMultiplayerGameStart = (config) => {
    setMultiplayerConfig(config);
    setShowLobby(false);
  };

  // Handle cancel from lobby
  const handleCancelLobby = () => {
    setShowLobby(false);
    setGameMode(null);
    leaveRoom();
  };

  // Handle return to menu
  const handleReturnToMenu = () => {
    setGameMode(null);
    setShowLobby(false);
    setMultiplayerConfig(null);
    if (roomId) {
      leaveRoom();
    }
  };

  // Reset multiplayer when game starts from lobby
  useEffect(() => {
    if (gameStarted && showLobby) {
      setShowLobby(false);
    }
  }, [gameStarted, showLobby]);

  // Show mode selector if no mode selected
  if (!gameMode) {
    return <GameModeSelector onSelectMode={handleSelectMode} />;
  }

  // Show lobby for multiplayer
  if (gameMode === "multi" && showLobby) {
    return (
      <MultiplayerLobby
        onStartGame={handleMultiplayerGameStart}
        onCancel={handleCancelLobby}
      />
    );
  }

  // Show game
  return (
    <RedVsBlueSphere
      mode={gameMode}
      multiplayerConfig={multiplayerConfig}
      onReturnToMenu={handleReturnToMenu}
      // Multiplayer functions
      sendGameMove={sendGameMove}
      sendGameOver={sendGameOver}
      onGameMove={onGameMove}
      onGameOver={onGameOver}
      onGameRestart={onGameRestart}
      isMyTurn={isMyTurn}
      playerColor={playerColor}
      roomInfo={roomInfo}
    />
  );
}
