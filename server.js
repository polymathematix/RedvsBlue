import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Game rooms storage
const rooms = new Map();
const waitingPlayers = [];

// Generate unique room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

// Room class to manage game state
class GameRoom {
  constructor(roomId, hostPlayer) {
    this.roomId = roomId;
    this.players = new Map();
    this.playerColors = new Map();
    this.gameState = null;
    this.currentTurn = "red";
    this.isGameStarted = false;
    this.settings = {
      sphereType: "goldberg",
      subdivisions: 2,
      startingTiles: 3,
      exactElimination: true,
    };

    // Add host player
    this.addPlayer(hostPlayer, "red");
  }

  addPlayer(playerId, color) {
    this.players.set(playerId, {
      id: playerId,
      color: color,
      ready: false,
      connected: true,
    });
    this.playerColors.set(playerId, color);
    return color;
  }

  removePlayer(playerId) {
    const color = this.playerColors.get(playerId);
    this.players.delete(playerId);
    this.playerColors.delete(playerId);
    return color;
  }

  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  getPlayerColor(playerId) {
    return this.playerColors.get(playerId);
  }

  setPlayerReady(playerId, ready) {
    const player = this.players.get(playerId);
    if (player) {
      player.ready = ready;
    }
  }

  areAllPlayersReady() {
    if (this.players.size < 2) return false;
    for (const player of this.players.values()) {
      if (!player.ready) return false;
    }
    return true;
  }

  isFull() {
    return this.players.size >= 2;
  }

  isEmpty() {
    return this.players.size === 0;
  }

  updateGameState(gameState) {
    this.gameState = gameState;
  }

  updateSettings(settings) {
    this.settings = { ...this.settings, ...settings };
  }

  getRoomInfo() {
    return {
      roomId: this.roomId,
      players: Array.from(this.players.values()),
      playerCount: this.players.size,
      isGameStarted: this.isGameStarted,
      currentTurn: this.currentTurn,
      settings: this.settings,
    };
  }
}

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`✅ Player connected: ${socket.id}`);

  // Create a new room
  socket.on("create-room", (callback) => {
    const roomId = generateRoomId();
    const room = new GameRoom(roomId, socket.id);
    rooms.set(roomId, room);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.color = "red";

    console.log(`🏠 Room created: ${roomId} by ${socket.id}`);

    callback({
      success: true,
      roomId: roomId,
      color: "red",
      roomInfo: room.getRoomInfo(),
    });
  });

  // Join an existing room
  socket.on("join-room", (roomId, callback) => {
    const room = rooms.get(roomId);

    if (!room) {
      return callback({
        success: false,
        error: "Room not found",
      });
    }

    if (room.isFull()) {
      return callback({
        success: false,
        error: "Room is full",
      });
    }

    if (room.isGameStarted) {
      return callback({
        success: false,
        error: "Game already in progress",
      });
    }

    const color = room.addPlayer(socket.id, "blue");
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.color = color;

    console.log(`👥 Player ${socket.id} joined room ${roomId} as ${color}`);

    // Notify all players in the room
    io.to(roomId).emit("player-joined", {
      playerId: socket.id,
      color: color,
      roomInfo: room.getRoomInfo(),
    });

    callback({
      success: true,
      roomId: roomId,
      color: color,
      roomInfo: room.getRoomInfo(),
    });
  });

  // Quick match (find or create room)
  socket.on("quick-match", (callback) => {
    // Try to find a waiting player
    if (waitingPlayers.length > 0) {
      const waitingPlayer = waitingPlayers.shift();
      const roomId = waitingPlayer.roomId;
      const room = rooms.get(roomId);

      if (room && !room.isFull()) {
        const color = room.addPlayer(socket.id, "blue");
        socket.join(roomId);
        socket.data.roomId = roomId;
        socket.data.color = color;

        console.log(`⚡ Quick match: ${socket.id} joined ${roomId}`);

        // Notify both players
        io.to(roomId).emit("player-joined", {
          playerId: socket.id,
          color: color,
          roomInfo: room.getRoomInfo(),
        });

        callback({
          success: true,
          roomId: roomId,
          color: color,
          roomInfo: room.getRoomInfo(),
        });
        return;
      }
    }

    // No waiting players, create a new room and wait
    const roomId = generateRoomId();
    const room = new GameRoom(roomId, socket.id);
    rooms.set(roomId, room);

    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.color = "red";

    waitingPlayers.push({ socketId: socket.id, roomId: roomId });

    console.log(`⏳ Player ${socket.id} waiting in room ${roomId}`);

    callback({
      success: true,
      roomId: roomId,
      color: "red",
      roomInfo: room.getRoomInfo(),
      waiting: true,
    });
  });

  // Player ready
  socket.on("player-ready", () => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    room.setPlayerReady(socket.id, true);

    io.to(roomId).emit("player-ready-update", {
      playerId: socket.id,
      roomInfo: room.getRoomInfo(),
    });

    // Start game if all players are ready
    if (room.areAllPlayersReady()) {
      room.isGameStarted = true;
      io.to(roomId).emit("game-start", {
        roomInfo: room.getRoomInfo(),
      });
      console.log(`🎮 Game started in room ${roomId}`);
    }
  });

  // Update game settings
  socket.on("update-settings", (settings) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room || room.isGameStarted) return;

    // Only host (red player) can change settings
    if (socket.data.color !== "red") return;

    room.updateSettings(settings);

    io.to(roomId).emit("settings-updated", {
      settings: room.settings,
    });
  });

  // Game move
  socket.on("game-move", (moveData) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room || !room.isGameStarted) return;

    const playerColor = socket.data.color;

    // Verify it's the player's turn
    if (playerColor !== room.currentTurn) {
      return socket.emit("error", { message: "Not your turn" });
    }

    // Update game state
    room.updateGameState(moveData.gameState);
    room.currentTurn = moveData.nextPlayer;

    // Broadcast move to all players in the room
    io.to(roomId).emit("game-move-update", {
      gameState: moveData.gameState,
      currentTurn: room.currentTurn,
      action: moveData.action,
      playerId: socket.id,
    });

    console.log(`🎯 Move made in room ${roomId} by ${playerColor}`);
  });

  // Game over
  socket.on("game-over", (gameOverData) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    io.to(roomId).emit("game-over-update", {
      winner: gameOverData.winner,
      turnCount: gameOverData.turnCount,
    });

    console.log(`🏆 Game over in room ${roomId}, winner: ${gameOverData.winner}`);
  });

  // Restart game
  socket.on("restart-game", () => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    // Only host can restart
    if (socket.data.color !== "red") return;

    room.isGameStarted = false;
    room.currentTurn = "red";
    room.gameState = null;

    // Reset ready status
    for (const player of room.players.values()) {
      player.ready = false;
    }

    io.to(roomId).emit("game-restart", {
      roomInfo: room.getRoomInfo(),
    });

    console.log(`🔄 Game restarted in room ${roomId}`);
  });

  // Chat message
  socket.on("chat-message", (message) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    const playerColor = socket.data.color;

    io.to(roomId).emit("chat-message-update", {
      playerId: socket.id,
      color: playerColor,
      message: message,
      timestamp: Date.now(),
    });
  });

  // Leave room
  socket.on("leave-room", () => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    const color = room.removePlayer(socket.id);
    socket.leave(roomId);

    // Notify other players
    io.to(roomId).emit("player-left", {
      playerId: socket.id,
      color: color,
      roomInfo: room.getRoomInfo(),
    });

    // Delete room if empty
    if (room.isEmpty()) {
      rooms.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted (empty)`);
    }

    socket.data.roomId = null;
    socket.data.color = null;

    console.log(`👋 Player ${socket.id} left room ${roomId}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Player disconnected: ${socket.id}`);

    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room) return;

    // Remove from waiting list
    const waitingIndex = waitingPlayers.findIndex(
      (p) => p.socketId === socket.id
    );
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }

    const color = room.removePlayer(socket.id);

    // Notify other players
    io.to(roomId).emit("player-disconnected", {
      playerId: socket.id,
      color: color,
      roomInfo: room.getRoomInfo(),
    });

    // Delete room if empty
    if (room.isEmpty()) {
      rooms.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted (empty)`);
    }
  });

  // Get room info
  socket.on("get-room-info", (callback) => {
    const roomId = socket.data.roomId;
    const room = rooms.get(roomId);

    if (!room) {
      return callback({ success: false, error: "Room not found" });
    }

    callback({
      success: true,
      roomInfo: room.getRoomInfo(),
    });
  });
});

// API endpoints
app.get("/", (req, res) => {
  res.json({
    name: "Red vs Blue Multiplayer Server",
    version: "1.0.0",
    rooms: rooms.size,
    players: io.engine.clientsCount,
  });
});

app.get("/rooms", (req, res) => {
  const roomList = Array.from(rooms.values()).map((room) => room.getRoomInfo());
  res.json({ rooms: roomList });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🎮 Red vs Blue Multiplayer Server      ║
║   🚀 Server running on port ${PORT}        ║
║   🌐 http://localhost:${PORT}               ║
╚═══════════════════════════════════════════╝
  `);
});
