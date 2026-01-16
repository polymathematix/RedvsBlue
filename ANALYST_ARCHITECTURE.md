# Game Analyst - Architecture Documentation

## System Overview

The Game Analyst is a modular addition to Red vs Blue that provides statistical analysis through automated game simulations. It operates independently from the main game but shares core game logic.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Red vs Blue                         │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │              │  │              │  │              │ │
│  │  Menu System │──│  Game Mode   │  │   Analyst    │ │
│  │              │  │              │  │     Mode     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MenuSystem.jsx                           │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ State Management: currentView ('menu'|'game'|'analyst')   │ │
│  └───────────────────────────────────────────────────────────┘ │
│         │                  │                    │               │
│         ▼                  ▼                    ▼               │
│  ┌──────────┐      ┌──────────┐        ┌──────────┐           │
│  │   Menu   │      │   Game   │        │ Analyst  │           │
│  │   View   │      │   Mode   │        │   Mode   │           │
│  └──────────┘      └──────────┘        └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │                    │
                              │                    │
                    ┌─────────▼─────────┐ ┌────────▼────────┐
                    │                   │ │                 │
                    │     App.jsx       │ │  Analyst.jsx    │
                    │ (Game Component)  │ │                 │
                    │                   │ │                 │
                    └───────────────────┘ └─────────────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │                 │
                                          │ GameSimulator.js│
                                          │  (Headless)     │
                                          │                 │
                                          └─────────────────┘
```

## File Structure & Dependencies

```
src/
├── main.jsx                    # Entry point
│   └── imports MenuSystem
│
├── MenuSystem.jsx              # Navigation controller
│   ├── imports App.jsx
│   └── imports Analyst.jsx
│
├── App.jsx                     # Main game component
│   ├── Three.js rendering
│   ├── Game logic
│   └── AI implementation
│
├── Analyst.jsx                 # Analyst UI & orchestration
│   ├── imports GameSimulator
│   ├── imports Recharts
│   ├── Configuration management
│   ├── Progress tracking
│   └── Data visualization
│
└── GameSimulator.js            # Headless simulation engine
    ├── Sphere generation (extracted from App.jsx)
    ├── Game logic (mirrored from App.jsx)
    ├── AI decision-making (same as App.jsx)
    └── Returns game results
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│                        User                                │
└────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                   Analyst.jsx (UI)                         │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Configuration State:                                  │ │
│  │ - sphereType, subdivisions, startingTiles            │ │
│  │ - exactElimination, numSimulations, maxTurns         │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                             │
                    User clicks "Run"
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│              runSimulations() function                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ For i = 1 to numSimulations:                         │ │
│  │   1. Call simulateGame(config)                       │ │
│  │   2. Collect result                                  │ │
│  │   3. Update progress                                 │ │
│  │   4. Update live stats                               │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                             │
              For each simulation │
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│           GameSimulator.simulateGame(config)               │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ 1. Generate sphere (vertices, faces, neighbors)     │ │
│  │ 2. Initialize tile states                           │ │
│  │ 3. Game loop:                                        │ │
│  │    - Get AI move (makeAIMove)                        │ │
│  │    - Execute action (move/eliminate)                 │ │
│  │    - Check captures (checkCaptures)                  │ │
│  │    - Check win condition                             │ │
│  │    - Switch player                                   │ │
│  │ 4. Return game result                                │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                             │
                    Result object │
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                 Back to Analyst.jsx                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Collect result: {                                    │ │
│  │   winner: 'red' | 'blue',                            │ │
│  │   turns: number,                                     │ │
│  │   moves: number,                                     │ │
│  │   eliminations: number,                              │ │
│  │   captures: number,                                  │ │
│  │   duration: number                                   │ │
│  │ }                                                    │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                             │
            All simulations complete │
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│              Statistical Aggregation                       │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Calculate:                                           │ │
│  │ - Win counts & percentages                           │ │
│  │ - Average, min, max, median turns                    │ │
│  │ - Average actions (moves, eliminations, captures)    │ │
│  │ - Performance metrics                                │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                  Data Visualization                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Recharts components render:                          │ │
│  │ - Pie Chart (win distribution)                       │ │
│  │ - Bar Chart (game length histogram)                  │ │
│  │ - Area Chart (win rate trend)                        │ │
│  │ - Scatter Chart (game lengths by winner)             │ │
│  │ - Line Chart (average length trend)                  │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│                    User Views Results                      │
│             Can export JSON or CSV                         │
└────────────────────────────────────────────────────────────┘
```

## Shared vs Independent Code

### Shared Logic (Between App.jsx and GameSimulator.js)

Both components share identical implementations of:

```
┌────────────────────────────────────────┐
│      Shared Game Logic                 │
├────────────────────────────────────────┤
│ - Sphere Generation Functions          │
│   • generateGoldberg()                 │
│   • generateIcosahedron()              │
│   • generateOctahedron()               │
│   • generateDodecahedron()             │
│   • etc.                               │
│                                        │
│ - Mesh Utilities                       │
│   • subdivideMesh()                    │
│   • toDual()                           │
│   • normalize()                        │
│   • faceCenter()                       │
│                                        │
│ - Game Mechanics                       │
│   • getNeighbors()                     │
│   • getValidMoves()                    │
│   • getEliminatable()                  │
│   • checkCaptures()                    │
│   • makeAIMove()                       │
└────────────────────────────────────────┘
```

**Note**: Code is duplicated rather than imported to keep components independent and maintain flexibility for future divergence.

### Independent Components

```
App.jsx Only:                  GameSimulator.js Only:
- Three.js rendering           - Headless execution
- Canvas management            - Batch processing
- User input handling          - Result aggregation
- Visual animations            - Performance optimization
- Sound effects                - No rendering overhead
- Camera controls              
- Particle systems             Analyst.jsx Only:
                              - Recharts integration
                              - Statistical calculations
                              - CSV/JSON export
                              - Progress UI
                              - Configuration management
```

## State Management

### MenuSystem State

```javascript
{
  currentView: 'menu' | 'game' | 'analyst'
}
```

### Analyst State

```javascript
{
  // Configuration
  config: {
    sphereType: string,
    subdivisions: number,
    startingTiles: number,
    exactElimination: boolean,
    redPlayer: string,
    bluePlayer: string,
    numSimulations: number,
    maxTurnsPerGame: number
  },
  
  // Execution State
  isRunning: boolean,
  progress: number,
  currentSimulation: number,
  error: string | null,
  
  // Results
  results: {
    simulationResults: Array<GameResult>,
    summary: SummaryStatistics
  } | null,
  
  // Live Data
  currentGameData: GameResult | null
}
```

### GameResult Type

```typescript
interface GameResult {
  winner: 'red' | 'blue';
  turns: number;
  moves: number;
  eliminations: number;
  captures: number;
  duration: number;
}
```

## Integration Points

### 1. Menu Integration

```
MenuSystem.jsx
    │
    ├─► onReturnToMenu() callback
    │   - Passed to both Game and Analyst
    │   - Allows navigation back to menu
    │   - Cleans up current mode
    │
    └─► View switching
        - Conditional rendering based on currentView
        - No props passed between modes
        - Clean separation of concerns
```

### 2. Configuration Sharing

```
Game Configuration        Analyst Configuration
      │                           │
      ├─► Sphere Types ───────────┤
      ├─► Subdivisions ───────────┤
      ├─► Starting Tiles ─────────┤
      ├─► Exact Elimination ──────┤
      └─► AI Types ───────────────┘
      
(Same options available in both modes)
```

### 3. Game Logic Consistency

```
                 Core Game Rules
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
    App.jsx (Visual)      GameSimulator.js (Headless)
    
    Both implement:
    - Same move validation
    - Same capture detection
    - Same win conditions
    - Same AI algorithm
    
    Differences:
    - Rendering vs no rendering
    - Interactive vs automated
    - Real-time vs batch
```

## Performance Considerations

### Simulation Speed

```
Single Game Execution:
┌─────────────────────────────────┐
│ 1. Sphere Generation    (~1ms)  │
│ 2. Neighbor Calculation (~1ms)  │
│ 3. Game Loop            (~8ms)  │
│    - AI decisions (bulk)        │
│    - State updates              │
│    - Capture checks             │
│ 4. Result Assembly      (<1ms)  │
├─────────────────────────────────┤
│ Total per game: ~10ms           │
└─────────────────────────────────┘

Batch Performance:
- 100 games:  ~1 second
- 500 games:  ~5 seconds
- 1000 games: ~10 seconds
```

### Optimization Strategies

1. **No Rendering**: GameSimulator has zero rendering overhead
2. **Minimal State**: Only essential game state tracked
3. **Efficient Loops**: Optimized for batch processing
4. **Async Progress**: Non-blocking UI updates
5. **Early Termination**: Cancel button stops immediately

## Error Handling

```
Error Handling Flow:
┌────────────────────────────────────┐
│ Analyst.jsx                        │
│  ┌──────────────────────────────┐ │
│  │ Try/Catch around:            │ │
│  │ - Configuration validation   │ │
│  │ - Simulation loop            │ │
│  │ - Individual game execution  │ │
│  │ - Statistics calculation     │ │
│  └──────────────────────────────┘ │
│                                    │
│  Error States:                     │
│  - Invalid config → User message   │
│  - Sim failure → Log & continue    │
│  - All fail → Error display        │
│  - Cancel → Clean stop             │
└────────────────────────────────────┘
```

## Export Architecture

```
Export Flow:
┌────────────────────────────────────┐
│ User clicks "Export JSON/CSV"      │
└────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│ Analyst.jsx                        │
│  ┌──────────────────────────────┐ │
│  │ 1. Serialize results data    │ │
│  │ 2. Create Blob               │ │
│  │ 3. Generate download URL     │ │
│  │ 4. Trigger browser download  │ │
│  │ 5. Cleanup URL               │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
              │
              ▼
┌────────────────────────────────────┐
│ Browser downloads file:            │
│ - JSON: Complete data structure    │
│ - CSV: Tabular format              │
└────────────────────────────────────┘
```

## Visualization Pipeline

```
Raw Data → Data Transformation → Recharts → Rendered Charts
    │              │                 │              │
    │              │                 │              │
    ▼              ▼                 ▼              ▼
Results[]    prepareWinRateData() → PieChart  → <svg>
             prepareGameLength()   → BarChart  → <svg>
             prepareTrendData()    → AreaChart → <svg>
             prepareScatterData()  → Scatter   → <svg>
```

## Testing Considerations

### Unit Test Points

```
GameSimulator.js:
- Sphere generation accuracy
- Neighbor calculation correctness
- Move validation logic
- Capture detection
- Win condition checks
- AI decision making

Analyst.jsx:
- Configuration validation
- Progress calculation
- Statistical aggregation
- Data transformation
- Export functionality
```

### Integration Test Points

```
- Menu navigation flow
- Simulation execution
- Results display
- Export operations
- Error handling
- Cancel functionality
```

## Future Architecture Considerations

### Potential Enhancements

1. **Worker Threads**: Move simulations to Web Workers
2. **Streaming Results**: Process results as they complete
3. **Caching**: Cache sphere generation for identical configs
4. **Comparison Mode**: Run multiple configs simultaneously
5. **Custom Strategies**: Allow user-defined AI strategies

### Scalability

```
Current: Single-threaded, client-side
         ├─► 10 sims/second
         └─► Max practical: ~5000 sims

Future: Multi-threaded workers
        ├─► 40+ sims/second (4 cores)
        └─► Max practical: 20,000+ sims

Future: Server-side
        ├─► 1000+ sims/second
        └─► Unlimited scale
```

## Summary

The Game Analyst architecture follows these principles:

1. **Modularity**: Clean separation between game, analyst, and menu
2. **Independence**: Each mode operates independently
3. **Code Reuse**: Shared game logic ensures consistency
4. **Performance**: Headless simulation optimized for speed
5. **User Experience**: Real-time progress, interactive charts
6. **Flexibility**: Easy to extend with new features
7. **Maintainability**: Clear structure, well-documented

The architecture supports both interactive gameplay and automated analysis while maintaining code quality and user experience.

---

**Version**: 2.1.0  
**Last Updated**: 2025  
**Architecture Status**: Stable