# Changelog

## [1.1.0] - 2025

### Removed - Multiplayer Functionality

#### Summary
Removed all online multiplayer features as the game is designed for local play only. There is no server infrastructure to support online multiplayer at this time.

#### Files Removed
- `src/MultiplayerLobby.jsx` - Multiplayer lobby UI component
- `src/useMultiplayer.jsx` - WebSocket multiplayer hook and provider
- `server.js` - Express/Socket.io server for multiplayer
- `MULTIPLAYER_GUIDE.md` - Multiplayer setup documentation

#### Dependencies Removed
- `socket.io` - Server-side WebSocket library
- `socket.io-client` - Client-side WebSocket library  
- `express` - Web server framework
- `cors` - CORS middleware for Express

#### Scripts Removed from package.json
- `server` - Start multiplayer server
- `dev:server` - Development server
- `dev:client` - Development client

#### Code Changes

**src/GameModeSelector.jsx**
- Removed multiplayer mode option
- Updated UI to show only single player mode
- Changed title from "Choose Your Game Mode" to "Strategic 3D Sphere Game"
- Removed multiplayer card with online features list

**src/Game.jsx**
- Removed multiplayer imports (`MultiplayerLobby`, `useMultiplayer`)
- Removed multiplayer state management
- Removed lobby display logic
- Simplified game mode to only 'single' player
- Removed all multiplayer-related props and callbacks

**src/main.jsx**
- Removed `MultiplayerProvider` wrapper
- Simplified to direct `<Game />` component rendering

**src/App.jsx (RedVsBlueSphere component)**
- Added props parameter to accept `mode` and `onReturnToMenu`
- Added "Back to Menu" button when game is over
- No other changes needed as multiplayer logic was never integrated into core game

#### What Remains

The game still fully supports:
- ✅ Local single player vs AI
- ✅ Local two-player (hot seat) mode
- ✅ 4 AI difficulty levels (Random, Greedy, Defensive, Strategic)
- ✅ All sphere types and customization options
- ✅ Full 3D visualization and animations
- ✅ Sound effects and auto-rotation
- ✅ All game rules and mechanics

#### Reason for Removal

The multiplayer feature was removed because:
1. No server infrastructure is currently available or planned
2. The game is designed for local play (pass-and-play or vs AI)
3. Maintaining unused multiplayer code adds complexity
4. Server hosting would require ongoing infrastructure costs

#### Future Considerations

If online multiplayer is desired in the future, it would require:
- Dedicated server hosting (cloud provider or similar)
- Server infrastructure maintenance
- Potentially a matchmaking system
- User authentication
- Connection stability handling
- Security considerations

For now, the focus is on providing an excellent local gaming experience.

---

## [1.0.0] - Initial Release

### Added
- Complete 3D sphere strategy game
- Multiple sphere geometries (Goldberg, Triangular, Quad, Dodecahedron, Octahedron)
- AI opponents with different strategies
- Local multiplayer support
- Beautiful glassmorphism UI
- Smooth animations and particle effects
- Sound effects
- Customizable game settings
- Auto-focus camera system