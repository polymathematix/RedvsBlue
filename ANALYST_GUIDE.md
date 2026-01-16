# 🔬 Game Analyst Guide

## Overview

The **Game Analyst** is a powerful tool for running automated simulations of Red vs Blue games and collecting statistical data. This feature allows you to:

- Run hundreds or thousands of game simulations automatically
- Analyze win rates, game lengths, and strategic patterns
- Visualize data with interactive charts
- Export results for further analysis
- Optimize game balance and AI strategies

## Accessing the Analyst

1. Launch the Red vs Blue application
2. From the main menu, click on the **"Game Analyst"** card (🔬)
3. You'll be taken to the Analyst interface

## Configuration Panel

### Game Settings

#### Sphere Type
Choose from 7 different sphere geometries:
- **Goldberg**: Classic geodesic sphere (recommended for balanced games)
- **Triangular**: All-triangle mesh (fast, simple)
- **Quad Sphere**: Square-based geometry
- **Dodecahedron**: 12-sided polyhedron (quick games)
- **Octahedron**: 8-sided polyhedron
- **Icosahedron**: 20-sided polyhedron
- **Soccer Ball**: Truncated icosahedron (60 faces)

#### Subdivisions (0-4)
- Controls sphere complexity and number of tiles
- Higher values = more tiles = longer games
- Only available for certain sphere types
- **Tip**: Start with 2 for balanced game length

#### Starting Tiles (1-10)
- Number of initial tiles each player starts with
- More starting tiles = faster early game
- **Recommended**: 3 for standard gameplay

#### Exact Elimination
- ☑️ **Enabled**: Players can only eliminate tiles exactly opposite their position
- ☐ **Disabled**: Players can eliminate the nearest opposite tile (easier)
- Affects game strategy significantly

#### Player Types
- **Red Player**: AI type (currently Computer only)
- **Blue Player**: AI type (currently Computer only)
- Both players use the same AI algorithm for fair comparison

### Simulation Settings

#### Number of Simulations (1-10,000)
- How many games to run in the batch
- **Recommendations**:
  - **Quick test**: 10-50 simulations
  - **Reliable data**: 100-500 simulations
  - **Statistical analysis**: 1,000+ simulations
- More simulations = better statistical confidence

#### Max Turns Per Game (50-2,000)
- Maximum turns before declaring a winner by tile count
- Prevents infinite games
- **Recommended**: 500 for most configurations

## Running Simulations

1. Configure your game settings
2. Set the number of simulations
3. Click **"🚀 Run Simulations"**
4. Watch the progress bar and live game data
5. Click **"⏹️ Cancel"** to stop early (partial results will be saved)

### Performance Tips
- 100 simulations typically complete in 5-15 seconds
- Complex spheres (high subdivisions) take longer
- Your computer's speed affects simulation time

## Understanding the Results

### Summary Statistics

#### Game Outcomes
- **Total Games**: Total simulations completed
- **Red Wins**: Number of games won by red player
- **Blue Wins**: Number of games won by blue player
- **Red Win Rate**: Percentage (should be ~50% for balanced gameplay)
- **Blue Win Rate**: Percentage (should be ~50% for balanced gameplay)

#### Game Metrics
- **Avg Turns**: Average number of turns per game
- **Min Turns**: Shortest game length
- **Max Turns**: Longest game length
- **Median Turns**: Middle value (50th percentile)

#### Action Metrics
- **Avg Moves**: Average tile movements per game
- **Avg Eliminations**: Average elimination actions per game
- **Avg Captures**: Average territory captures per game

#### Performance
- **Total Time**: Total simulation runtime
- **Avg Time/Game**: Average time per simulation

### Interpreting Win Rates

#### Balanced Game (Good)
- **Red Win Rate**: 45-55%
- **Blue Win Rate**: 45-55%
- Indicates fair game mechanics

#### Imbalanced Game (Investigate)
- One player consistently above 60%
- May indicate:
  - First-player advantage
  - Sphere geometry bias
  - AI strategy issues
  - Configuration imbalance

### Game Length Analysis

- **Short games** (< 50 turns): Quick eliminations, aggressive play
- **Medium games** (50-150 turns): Balanced strategy
- **Long games** (> 200 turns): Defensive play, stalemates

## Visualization Charts

### 1. Win Distribution (Pie Chart)
- Shows proportion of red vs blue wins
- Ideal: Nearly equal slices
- Quick visual check for balance

### 2. Game Length Distribution (Bar Chart)
- Histogram of game durations
- Shows typical game length range
- Helps identify outliers
- **Look for**: Bell curve distribution

### 3. Red Win Rate Trend (Area Chart)
- Win rate over time during simulations
- Should stabilize around 50%
- Early volatility is normal
- **Convergence** = reliable data

### 4. Game Length by Winner (Scatter Chart)
- Each dot is one game
- X-axis: Game number
- Y-axis: Number of turns
- Color: Winner (red/blue)
- **Look for**: Mixed colors (balanced wins)

### 5. Average Game Length Trend (Line Chart)
- How game length changes over simulations
- Should be relatively stable
- Large variations may indicate randomness issues

## Data Export

### JSON Export
- Complete raw data with all details
- Best for: Programming analysis, databases
- Includes: All game results, configurations, timestamps
- Format: Structured JSON file

### CSV Export
- Spreadsheet-compatible format
- Best for: Excel, Google Sheets, data science tools
- Columns: Game #, Winner, Turns, Moves, Eliminations, Captures, Duration
- Easy to create pivot tables and charts

## Use Cases

### 1. Game Balance Testing
**Goal**: Ensure fair gameplay
```
Configuration:
- Run 500+ simulations
- Various sphere types
- Different starting tiles

Look for:
- ~50% win rate for each player
- Consistent game lengths
- No extreme outliers
```

### 2. Sphere Comparison
**Goal**: Compare different sphere types
```
Method:
1. Run 200 sims on Goldberg (subdivisions: 2)
2. Run 200 sims on Icosahedron (subdivisions: 2)
3. Run 200 sims on Soccer Ball
4. Compare average game lengths and win distributions
```

### 3. AI Strategy Analysis
**Goal**: Understand AI behavior patterns
```
Observe:
- Elimination vs Move ratio
- Capture frequency
- Game length variations
- Endgame patterns
```

### 4. Configuration Optimization
**Goal**: Find ideal starting parameters
```
Test combinations:
- Starting Tiles: 1, 3, 5, 7
- Exact Elimination: On vs Off
- Subdivisions: 1, 2, 3

Record:
- Most balanced win rates
- Most engaging game lengths (50-100 turns)
- Fewest stalemates
```

## Tips & Best Practices

### Getting Reliable Data
1. ✅ Run at least 100 simulations for meaningful statistics
2. ✅ Use the same configuration when comparing
3. ✅ Check for convergence in win rate trends
4. ✅ Run multiple batches to verify consistency

### Interpreting Results
1. 📊 Small sample sizes have high variance
2. 📊 Look at median, not just average
3. 📊 Extreme outliers may indicate bugs
4. 📊 Win rates between 40-60% are generally acceptable

### Performance Optimization
1. ⚡ Start small (50 sims) to test configurations
2. ⚡ Run large batches when you have reliable settings
3. ⚡ Lower subdivisions = faster simulations
4. ⚡ Close other applications for maximum speed

### Common Pitfalls
❌ **Don't**: Judge balance from < 50 simulations
❌ **Don't**: Compare different configurations directly
❌ **Don't**: Ignore the distribution (only look at average)
❌ **Don't**: Forget to export data before closing

✅ **Do**: Run multiple test batches
✅ **Do**: Keep consistent variables
✅ **Do**: Look at all statistics together
✅ **Do**: Save your data regularly

## Statistical Significance

### Sample Size Guide
- **10-50 games**: Preliminary testing only
- **100-200 games**: Basic trends visible (~10% margin of error)
- **500-1000 games**: Good confidence (~5% margin of error)
- **2000+ games**: High confidence (~2-3% margin of error)

### Win Rate Confidence
For 100 simulations:
- 50-50 split ± 10% is normal variance
- 60-40 split suggests possible imbalance
- 70-30 split indicates definite imbalance

For 500 simulations:
- 50-50 split ± 5% is normal variance
- 55-45 split suggests investigation
- 60-40 split indicates imbalance

## Troubleshooting

### Issue: Simulations Run Very Slowly
**Solutions**:
- Lower the number of subdivisions
- Choose simpler sphere types (Dodecahedron)
- Reduce starting tiles
- Lower max turns per game

### Issue: All Games Hit Max Turn Limit
**Causes**:
- Max turns too low
- Sphere too large
- Defensive AI behavior

**Solutions**:
- Increase max turns to 1000-2000
- Use fewer subdivisions
- Enable/disable exact elimination

### Issue: One Player Wins 90%+ of Games
**Causes**:
- Configuration heavily favors first player
- Sphere geometry bias
- Bug in game logic

**Solutions**:
- Try different sphere types
- Adjust starting tiles
- Test with exact elimination toggled
- Report consistent imbalances

### Issue: Game Lengths Vary Wildly
**Causes**:
- High randomness in AI decisions
- Capture cascades
- Normal for complex spheres

**Solutions**:
- Run more simulations for better average
- This may be expected behavior
- Look at median instead of mean

## Advanced Analysis

### Combining with External Tools

#### Python Analysis Example
```python
import pandas as pd
import matplotlib.pyplot as plt

# Load exported CSV
df = pd.read_csv('redvsblue-analysis-xxxxx.csv')

# Advanced statistics
print(df.describe())
print(f"Win rate std dev: {df['Winner'].value_counts(normalize=True).std()}")

# Custom visualizations
df.boxplot(column='Turns', by='Winner')
plt.show()
```

#### Excel Pivot Tables
1. Import CSV into Excel
2. Create Pivot Table
3. Rows: Winner
4. Values: Average of Turns, Count of Games
5. Filter by specific configurations

## Future Enhancements

Potential features for future versions:
- [ ] Compare two different AI strategies head-to-head
- [ ] Heatmap of tile capture frequency
- [ ] Replay specific games from simulations
- [ ] Parameter sweep automation
- [ ] Statistical significance tests
- [ ] Machine learning on game patterns
- [ ] Multi-threaded simulations for speed
- [ ] Real-time charts during simulation

## Support & Feedback

If you discover interesting patterns, extreme imbalances, or have suggestions for the Analyst tool, please share your findings!

Happy analyzing! 📊🔬🎮