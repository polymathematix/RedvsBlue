import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const MultiplayerContext = createContext(null);

export function MultiplayerProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [roomInfo, setRoomInfo] = useState(null);
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const gameStateRef = useRef(null);
  const onGameMoveRef = useRef(null);
  const onGameOverRef = useRef(null);
  const onGameRestartRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io('http://localhost:3001', {
      autoConnect: false,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Connected to multiplayer server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Set up room event listeners
  useEffect(() => {
    if (!socket) return;

    // Player joined
    socket.on('player-joined', (data) => {
      console.log('👥 Player joined:', data);
      setRoomInfo(data.roomInfo);
      setOpponentConnected(data.roomInfo.playerCount === 2);
      setIsWaiting(false);
    });

    // Player left
    socket.on('player-left', (data) => {
      console.log('👋 Player left:', data);
      setRoomInfo(data.roomInfo);
      setOpponentConnected(data.roomInfo.playerCount === 2);
    });

    // Player disconnected
    socket.on('player-disconnected', (data) => {
      console.log('❌ Player disconnected:', data);
      setRoomInfo(data.roomInfo);
      setOpponentConnected(false);
    });

    // Player ready update
    socket.on('player-ready-update', (data) => {
      console.log('✅ Player ready:', data);
      setRoomInfo(data.roomInfo);
    });

    // Game start
    socket.on('game-start', (data) => {
      console.log('🎮 Game starting:', data);
      setRoomInfo(data.roomInfo);
      setGameStarted(true);
    });

    // Settings updated
    socket.on('settings-updated', (data) => {
      console.log('⚙️ Settings updated:', data);
      if (roomInfo) {
        setRoomInfo({ ...roomInfo, settings: data.settings });
      }
    });

    // Game move update
    socket.on('game-move-update', (data) => {
      console.log('🎯 Game move received:', data);
      if (onGameMoveRef.current) {
        onGameMoveRef.current(data);
      }
    });

    // Game over update
    socket.on('game-over-update', (data) => {
      console.log('🏆 Game over:', data);
      if (onGameOverRef.current) {
        onGameOverRef.current(data);
      }
    });

    // Game restart
    socket.on('game-restart', (data) => {
      console.log('🔄 Game restart:', data);
      setRoomInfo(data.roomInfo);
      setGameStarted(false);
      if (onGameRestartRef.current) {
        onGameRestartRef.current();
      }
    });

    // Chat message
    socket.on('chat-message-update', (data) => {
      console.log('💬 Chat message:', data);
      setChatMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('player-disconnected');
      socket.off('player-ready-update');
      socket.off('game-start');
      socket.off('settings-updated');
      socket.off('game-move-update');
      socket.off('game-over-update');
      socket.off('game-restart');
      socket.off('chat-message-update');
    };
  }, [socket, roomInfo]);

  // Connect to server
  const connect = useCallback(() => {
    if (socket && !isConnected) {
      socket.connect();
    }
  }, [socket, isConnected]);

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  }, [socket, isConnected]);

  // Create a new room
  const createRoom = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      socket.emit('create-room', (response) => {
        if (response.success) {
          setRoomId(response.roomId);
          setPlayerColor(response.color);
          setRoomInfo(response.roomInfo);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, isConnected]);

  // Join an existing room
  const joinRoom = useCallback((roomIdToJoin) => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      socket.emit('join-room', roomIdToJoin, (response) => {
        if (response.success) {
          setRoomId(response.roomId);
          setPlayerColor(response.color);
          setRoomInfo(response.roomInfo);
          setOpponentConnected(response.roomInfo.playerCount === 2);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, isConnected]);

  // Quick match
  const quickMatch = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      socket.emit('quick-match', (response) => {
        if (response.success) {
          setRoomId(response.roomId);
          setPlayerColor(response.color);
          setRoomInfo(response.roomInfo);
          setIsWaiting(response.waiting || false);
          setOpponentConnected(response.roomInfo.playerCount === 2);
          resolve(response);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }, [socket, isConnected]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (socket && roomId) {
      socket.emit('leave-room');
      setRoomId(null);
      setPlayerColor(null);
      setRoomInfo(null);
      setOpponentConnected(false);
      setIsWaiting(false);
      setGameStarted(false);
      setChatMessages([]);
    }
  }, [socket, roomId]);

  // Mark player as ready
  const setReady = useCallback(() => {
    if (socket && roomId) {
      socket.emit('player-ready');
    }
  }, [socket, roomId]);

  // Update game settings (host only)
  const updateSettings = useCallback((settings) => {
    if (socket && roomId) {
      socket.emit('update-settings', settings);
    }
  }, [socket, roomId]);

  // Send game move
  const sendGameMove = useCallback((moveData) => {
    if (socket && roomId) {
      socket.emit('game-move', moveData);
    }
  }, [socket, roomId]);

  // Send game over
  const sendGameOver = useCallback((gameOverData) => {
    if (socket && roomId) {
      socket.emit('game-over', gameOverData);
    }
  }, [socket, roomId]);

  // Restart game
  const restartGame = useCallback(() => {
    if (socket && roomId) {
      socket.emit('restart-game');
    }
  }, [socket, roomId]);

  // Send chat message
  const sendChatMessage = useCallback((message) => {
    if (socket && roomId && message.trim()) {
      socket.emit('chat-message', message);
    }
  }, [socket, roomId]);

  // Register callback for game moves
  const onGameMove = useCallback((callback) => {
    onGameMoveRef.current = callback;
  }, []);

  // Register callback for game over
  const onGameOver = useCallback((callback) => {
    onGameOverRef.current = callback;
  }, []);

  // Register callback for game restart
  const onGameRestart = useCallback((callback) => {
    onGameRestartRef.current = callback;
  }, []);

  // Check if it's the current player's turn
  const isMyTurn = useCallback(() => {
    if (!roomInfo || !playerColor) return false;
    return roomInfo.currentTurn === playerColor;
  }, [roomInfo, playerColor]);

  // Check if current player is host
  const isHost = useCallback(() => {
    return playerColor === 'red';
  }, [playerColor]);

  const value = {
    // Connection state
    socket,
    isConnected,

    // Room state
    roomId,
    playerColor,
    roomInfo,
    opponentConnected,
    isWaiting,
    gameStarted,
    chatMessages,

    // Actions
    connect,
    disconnect,
    createRoom,
    joinRoom,
    quickMatch,
    leaveRoom,
    setReady,
    updateSettings,
    sendGameMove,
    sendGameOver,
    restartGame,
    sendChatMessage,

    // Event handlers
    onGameMove,
    onGameOver,
    onGameRestart,

    // Helpers
    isMyTurn,
    isHost,
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
}
