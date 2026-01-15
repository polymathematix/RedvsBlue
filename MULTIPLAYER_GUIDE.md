# 🌐 Red vs Blue - Multiplayer Guide

## Overview

Red vs Blue now features **real-time multiplayer** functionality, allowing you to play against friends or random opponents online! The multiplayer system uses WebSockets (Socket.IO) for instant, synchronized gameplay.

## ✨ Multiplayer Features

- **🚀 Quick Match** - Instantly find and play against an available opponent
- **🏠 Create Room** - Host a private game and share the room code with friends
- **🔗 Join Room** - Enter a friend's room code to join their game
- **💬 In-Game Chat** - Communicate with your opponent during the game
- **🎮 Real-Time Sync** - All moves are instantly synchronized between players
- **⚙️ Host Controls** - Room creator can configure game settings

## 🚀 Quick Start

### Step 1: Start the Server

Open a terminal and run:

```bash
cd /Users/nicolaasvermeulen/Desktop/Repository/RedvsBlue
npm run server
```

You should see:
```
╔═══════════════════════════════════════════╗
║   🎮 Red vs Blue Multiplayer Server      ║
║   🚀 Server running on port 3001         ║
║   🌐 http://localhost:3001               ║
╚═══════════════════════════════════════════╝
```

**Keep this terminal window open!** The server must be running for multiplayer to work.

### Step 2: Start the Game Client

Open a **NEW terminal window** and run:

```bash
npm run dev
```

The game will open at `http://localhost:5173`

### Step 3: Play!

1. Click **"🌐 Multiplayer"** on the main menu
2. Choose a game mode:
   - **⚡ Quick Match** - Find an opponent instantly
   - **🏠 Create Room** - Play with a friend (share the room code)
   - **🔗 Join Room** - Enter a friend's room code

## 📖 How to Play Multiplayer

### Quick Match

1. Click **"⚡ Quick Match"**
2. Wait for an opponent to join (or join someone else's game)
3. Once matched, both players click **"Ready Up"**
4. Game starts automatically when both players are ready!

### Create Private Room

1. Click **"🏠 Create Room"**
2. Share your **Room Code** (7-character code) with a friend
3. Wait for them to join
4. Both players click **"Ready Up"**
5. Game starts!

**Tip:** Click the room code to copy it to clipboard

### Join Private Room

1. Get a room code from your friend
2. Click **"🔗 Join Room"**
3. Enter the 7-character code
4. Click **"Join Game"**
5. Click **"Ready Up"** when you're ready

## 🎮 Gameplay

### Your Turn

- **It's Your Turn When:**
  - The status shows "Red's turn" or "Blue's turn" (your color)
  - Your score badge is highlighted with a glowing ring
  
- **Making Moves:**
  - Click your tile to select it
  - Click a valid move (green) or elimination target (orange)
  - Your move is instantly sent to your opponent

### Opponent's Turn

- Watch your opponent's moves in real-time
- The 3D sphere rotates to show their moves
- Wait for your turn to make the next move

### Chat

- Type messages in the chat box during the game
- Press Enter or click "Send" to send
- Use chat to strategize, taunt, or be friendly! 😊

## ⚙️ Settings (Host Only)

The player who creates the room (Red player) can configure:

- **Sphere Type** - Choose the game board geometry
- **Detail Level** - Adjust complexity (more tiles = longer game)
- **Starting Tiles** - Number of initial tiles per player
- **Elimination Mode** - Exact or Nearest antipodal point

**Note:** Settings must be changed before clicking "Ready Up"

## 🔧 Running Server & Client Together

### Option 1: Two Terminals (Recommended)

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Client:**
```bash
npm run dev
```

### Option 2: Background Process

**Start server in background:**
```bash
npm run server &
npm run dev
```

**To stop the background server:**
```bash
pkill -f "node server.js"
```

## 🌐 Playing with Friends on Different Computers

### Local Network (Same WiFi)

1. Find your IP address:
   - **Mac/Linux:** `ifconfig | grep "inet "`
   - **Windows:** `ipconfig`

2. Update the Socket.IO connection in `src/useMultiplayer.jsx` line 24:
   ```javascript
   const socketInstance = io('http://YOUR_IP_ADDRESS:3001', {
   ```

3. Share your IP with friends so they can connect

### Over the Internet

You'll need to:

1. Deploy the server to a hosting service (Heroku, Railway, DigitalOcean, etc.)
2. Update the Socket.IO URL to your deployed server
3. Share the room code with friends anywhere!

**Example deployment options:**
- Heroku (free tier)
- Railway.app (free tier)
- Render.com (free tier)
- Your own server/VPS

## 🐛 Troubleshooting

### "Connection Failed" Error

**Problem:** Can't connect to multiplayer server

**Solutions:**
1. Make sure the server is running (`npm run server`)
2. Check if port 3001 is available
3. Verify no firewall is blocking the connection
4. Check browser console for error messages

### "Room Not Found" Error

**Problem:** Can't join room with code

**Solutions:**
1. Check if the room code is correct (7 characters)
2. Make sure the host hasn't left the room
3. Try creating a new room

### Server Won't Start

**Problem:** Port 3001 already in use

**Solutions:**
1. Kill the existing process:
   ```bash
   lsof -ti:3001 | xargs kill -9
   ```
2. Or change the port in `server.js`:
   ```javascript
   const PORT = process.env.PORT || 3002; // Use different port
   ```

### Player Disconnected During Game

**Problem:** Opponent lost connection

**Solutions:**
- The game will notify you if they disconnect
- You can leave the lobby and start a new game
- They can rejoin if the room still exists

### Moves Not Syncing

**Problem:** Game state not updating properly

**Solutions:**
1. Check your internet connection
2. Refresh the page and reconnect
3. Restart both server and client
4. Check browser console for errors

## 📊 Server API Endpoints

The server exposes some useful endpoints:

- **GET /** - Server info and status
- **GET /rooms** - List all active rooms

**Example:**
```bash
curl http://localhost:3001/
curl http://localhost:3001/rooms
```

## 🏗️ Architecture Overview

### Components

```
Client (Browser)
    ├── Game.jsx - Main game wrapper
    ├── GameModeSelector.jsx - Mode selection screen
    ├── MultiplayerLobby.jsx - Room/lobby management
    ├── App.jsx - Core game logic (RedVsBlueSphere)
    └── useMultiplayer.jsx - Socket.IO hooks and state

Server (Node.js)
    └── server.js - Express + Socket.IO server
```

### Communication Flow

```
Player 1                Server                Player 2
   │                      │                      │
   ├─── create-room ─────>│                      │
   │<───── roomId ────────┤                      │
   │                      │<──── join-room ──────┤
   │                      ├──── player-joined ───>│
   │<─── player-joined ───┤                      │
   │                      │                      │
   ├─── player-ready ────>│                      │
   │                      ├──── player-ready ────>│
   │                      │<──── player-ready ───┤
   │<─── player-ready ────┤                      │
   │                      │                      │
   │<──── game-start ─────┼──── game-start ─────>│
   │                      │                      │
   ├──── game-move ──────>│                      │
   │                      ├──── move-update ─────>│
   │                      │<──── game-move ──────┤
   │<──── move-update ────┤                      │
```

### Socket.IO Events

**Client → Server:**
- `create-room` - Create a new game room
- `join-room` - Join an existing room
- `quick-match` - Find/create a quick match
- `leave-room` - Leave the current room
- `player-ready` - Mark player as ready
- `update-settings` - Update game settings (host only)
- `game-move` - Send a game move
- `game-over` - Send game over state
- `restart-game` - Restart the game (host only)
- `chat-message` - Send a chat message

**Server → Client:**
- `player-joined` - A player joined the room
- `player-left` - A player left the room
- `player-disconnected` - A player disconnected
- `player-ready-update` - Player ready status changed
- `game-start` - Game is starting
- `settings-updated` - Settings were updated
- `game-move-update` - A move was made
- `game-over-update` - Game ended
- `game-restart` - Game was restarted
- `chat-message-update` - New chat message

## 🎯 Tips for Best Experience

1. **Stable Connection** - Use a stable internet connection for smooth gameplay
2. **Ready Up Together** - Coordinate with your opponent to ready up at the same time
3. **Use Chat** - Communicate strategy or just have fun!
4. **Host Controls** - If you're hosting, set up the game before your friend joins
5. **Room Codes** - Save room codes in case of disconnection

## 🔐 Security Notes

**Current Implementation:**
- No authentication (anonymous play)
- No player names (colors only)
- Room codes are random 7-character strings
- No persistent storage (rooms are lost when server restarts)

**For Production:**
Consider adding:
- User authentication
- Player accounts and profiles
- Room passwords
- Game history
- Leaderboards
- Persistent storage (database)

## 📝 Known Limitations

- Maximum 2 players per room
- No spectator mode (yet)
- No reconnection after disconnection
- No saved games
- Server must be running locally

## 🚀 Future Enhancements

Potential improvements:
- [ ] Tournament mode
- [ ] Ranked matchmaking
- [ ] Player profiles and stats
- [ ] Replay system
- [ ] Spectator mode
- [ ] Custom avatars
- [ ] Voice chat
- [ ] Mobile app
- [ ] AI vs Human tournaments

## 💬 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Check the browser console for errors (F12)
3. Check the server terminal for error messages
4. Restart both server and client
5. Make sure all dependencies are installed (`npm install`)

## 🎉 Have Fun!

Enjoy playing Red vs Blue with friends around the world! May the best strategist win! 🏆

---

**Created with ❤️ using:**
- Socket.IO for real-time communication
- Express.js for the server
- React for the UI
- Three.js for 3D graphics