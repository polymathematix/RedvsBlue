import React, { useState, useEffect, useRef } from "react";
import { useMultiplayer } from "./useMultiplayer";

export default function MultiplayerLobby({ onStartGame, onCancel }) {
  const {
    isConnected,
    roomId,
    playerColor,
    roomInfo,
    opponentConnected,
    isWaiting,
    gameStarted,
    chatMessages,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    quickMatch,
    leaveRoom,
    setReady,
    updateSettings,
    sendChatMessage,
    isHost,
  } = useMultiplayer();

  const [view, setView] = useState("menu"); // menu, create, join, lobby
  const [roomInput, setRoomInput] = useState("");
  const [error, setError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  const chatEndRef = useRef(null);

  // Connect on mount
  useEffect(() => {
    if (!isConnected) {
      setConnectionStatus("connecting");
      connect();
    } else {
      setConnectionStatus("connected");
    }
  }, [isConnected, connect]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Handle game start
  useEffect(() => {
    if (gameStarted && roomInfo) {
      onStartGame({
        isMultiplayer: true,
        playerColor: playerColor,
        settings: roomInfo.settings,
      });
    }
  }, [gameStarted, roomInfo, playerColor, onStartGame]);

  // Handle create room
  const handleCreateRoom = async () => {
    try {
      setError("");
      await createRoom();
      setView("lobby");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle join room
  const handleJoinRoom = async () => {
    if (!roomInput.trim()) {
      setError("Please enter a room code");
      return;
    }

    try {
      setError("");
      await joinRoom(roomInput.toUpperCase());
      setView("lobby");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle quick match
  const handleQuickMatch = async () => {
    try {
      setError("");
      await quickMatch();
      setView("lobby");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle ready
  const handleReady = () => {
    setReady();
    setIsReady(true);
  };

  // Handle leave
  const handleLeave = () => {
    leaveRoom();
    setView("menu");
    setIsReady(false);
    setError("");
  };

  // Handle send chat
  const handleSendChat = () => {
    if (chatInput.trim()) {
      sendChatMessage(chatInput);
      setChatInput("");
    }
  };

  // Copy room code
  const copyRoomCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
    }
  };

  // Render connection status
  if (!isConnected && connectionStatus === "connecting") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl z-50">
        <div className="card-elevated max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold text-white">
              Connecting to Server...
            </h2>
            <p className="text-gray-400 text-center">
              Please wait while we connect you to the multiplayer server
            </p>
            <button onClick={onCancel} className="btn-secondary mt-4">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl z-50">
        <div className="card-elevated max-w-md w-full mx-4">
          <div className="flex flex-col items-center gap-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-2xl font-bold text-white">
              Connection Failed
            </h2>
            <p className="text-gray-400 text-center">
              Unable to connect to the multiplayer server. Please make sure the
              server is running.
            </p>
            <div className="flex gap-3 mt-4">
              <button onClick={connect} className="btn-primary">
                Retry
              </button>
              <button onClick={onCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Menu view
  if (view === "menu") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl z-50 fade-in">
        <div className="card-elevated max-w-lg w-full mx-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-gradient-purple mb-2">
              🎮 Multiplayer
            </h2>
            <p className="text-gray-400">Choose how you want to play</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleQuickMatch}
              className="w-full btn-primary py-4 text-lg hover-glow-purple"
            >
              ⚡ Quick Match
              <div className="text-xs opacity-75 mt-1">
                Find an opponent instantly
              </div>
            </button>

            <button
              onClick={handleCreateRoom}
              className="w-full glass-strong hover:bg-white/15 py-4 rounded-xl transition-all"
            >
              <div className="text-lg font-semibold text-white">
                🏠 Create Room
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Play with a friend
              </div>
            </button>

            <button
              onClick={() => setView("join")}
              className="w-full glass-strong hover:bg-white/15 py-4 rounded-xl transition-all"
            >
              <div className="text-lg font-semibold text-white">
                🔗 Join Room
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Enter a room code
              </div>
            </button>
          </div>

          <button
            onClick={onCancel}
            className="w-full mt-6 btn-secondary"
          >
            ← Back to Single Player
          </button>

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Connected to server
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Join view
  if (view === "join") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl z-50 fade-in">
        <div className="card-elevated max-w-md w-full mx-4">
          <h2 className="text-3xl font-black text-gradient-purple mb-6 text-center">
            Join Room
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm font-medium block mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="Enter 7-character code"
                maxLength={7}
                className="input-select w-full text-center text-2xl font-bold tracking-wider"
                autoFocus
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={roomInput.length < 7}
              className="w-full btn-primary py-3"
            >
              Join Game
            </button>

            <button
              onClick={() => {
                setView("menu");
                setError("");
                setRoomInput("");
              }}
              className="w-full btn-secondary"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Lobby view
  if (view === "lobby") {
    const myPlayer = roomInfo?.players?.find((p) => p.color === playerColor);
    const opponent = roomInfo?.players?.find((p) => p.color !== playerColor);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl z-50 overflow-y-auto p-4">
        <div className="card-elevated max-w-4xl w-full my-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gradient-purple mb-2">
              🎮 Game Lobby
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-gray-400">Room Code:</span>
              <button
                onClick={copyRoomCode}
                className="glass px-4 py-2 rounded-lg font-mono text-2xl font-bold text-white hover:bg-white/10 transition-all"
                title="Click to copy"
              >
                {roomId}
              </button>
              <span className="text-gray-500 text-xs">(Click to copy)</span>
            </div>
          </div>

          {/* Waiting for opponent */}
          {!opponentConnected && (
            <div className="mb-6 p-6 glass-strong rounded-xl text-center">
              <div className="text-4xl mb-3">⏳</div>
              <h3 className="text-xl font-bold text-white mb-2">
                Waiting for opponent...
              </h3>
              <p className="text-gray-400 mb-4">
                Share the room code with a friend to start playing
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}

          {/* Players */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* My Player */}
            <div
              className={`glass-strong p-6 rounded-xl ${
                playerColor === "red"
                  ? "border-2 border-red-500/50"
                  : "border-2 border-blue-500/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${
                      playerColor === "red"
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : "bg-gradient-to-br from-blue-500 to-blue-600"
                    }`}
                  ></div>
                  <div>
                    <div className="font-bold text-white text-lg">You</div>
                    <div className="text-sm text-gray-400">
                      {playerColor === "red" ? "Red Player" : "Blue Player"}
                    </div>
                  </div>
                </div>
                {myPlayer?.ready ? (
                  <div className="text-2xl">✅</div>
                ) : (
                  <div className="text-2xl opacity-30">⏳</div>
                )}
              </div>
              {!myPlayer?.ready && opponentConnected && (
                <button
                  onClick={handleReady}
                  disabled={isReady}
                  className="w-full btn-primary"
                >
                  {isReady ? "✅ Ready!" : "Ready Up"}
                </button>
              )}
            </div>

            {/* Opponent */}
            <div className="glass-strong p-6 rounded-xl opacity-60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${
                      opponent
                        ? opponent.color === "red"
                          ? "bg-gradient-to-br from-red-500 to-red-600"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                        : "bg-gray-700"
                    }`}
                  ></div>
                  <div>
                    <div className="font-bold text-white text-lg">
                      {opponent ? "Opponent" : "Waiting..."}
                    </div>
                    <div className="text-sm text-gray-400">
                      {opponent
                        ? opponent.color === "red"
                          ? "Red Player"
                          : "Blue Player"
                        : "---"}
                    </div>
                  </div>
                </div>
                {opponent?.ready ? (
                  <div className="text-2xl">✅</div>
                ) : opponent ? (
                  <div className="text-2xl opacity-30">⏳</div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Chat */}
          {opponentConnected && (
            <div className="mb-6 glass-strong p-4 rounded-xl">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                💬 Chat
              </h3>
              <div className="bg-slate-900/50 rounded-lg p-3 h-32 overflow-y-auto mb-3">
                {chatMessages.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-4">
                    No messages yet. Say hi! 👋
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-2 ${
                        msg.color === playerColor ? "text-right" : "text-left"
                      }`}
                    >
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-sm ${
                          msg.color === playerColor
                            ? "bg-purple-600 text-white"
                            : "bg-gray-700 text-gray-200"
                        }`}
                      >
                        {msg.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Type a message..."
                  className="input-select flex-1"
                  maxLength={100}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="btn-primary px-6"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* Settings (Host only) */}
          {isHost() && !gameStarted && (
            <div className="mb-6 glass-strong p-4 rounded-xl">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                ⚙️ Game Settings <span className="text-xs text-purple-400">(Host)</span>
              </h3>
              <div className="text-sm text-gray-400">
                Settings can be changed from the main game screen
              </div>
            </div>
          )}

          {/* Status Messages */}
          {opponentConnected && roomInfo?.players?.every((p) => p.ready) && (
            <div className="win-message text-center py-4 mb-6">
              <div className="text-2xl font-bold">🎮 Starting Game...</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleLeave} className="btn-secondary flex-1">
              ← Leave Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
