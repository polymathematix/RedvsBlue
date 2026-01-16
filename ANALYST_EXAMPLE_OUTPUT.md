# Game Analyst - Example Output

This document shows example outputs from the Game Analyst tool to help you understand what kind of data and insights you'll get.

## Example Run Configuration

```
Sphere Type: Goldberg
Subdivisions: 2
Starting Tiles: 3
Exact Elimination: Enabled
Red Player: Computer AI
Blue Player: Computer AI
Number of Simulations: 500
Max Turns Per Game: 500
```

## Example Summary Statistics

### Game Outcomes
```
Total Games:      500
Red Wins:         247 (49.4%)
Blue Wins:        253 (50.6%)
```
**Analysis**: ✅ Well-balanced gameplay - both players have nearly equal win rates

### Game Length Statistics
```
Average Turns:    87.3
Minimum Turns:    23
Maximum Turns:    389
Median Turns:     81
```
**Analysis**: Most games complete in 80-90 turns, with occasional longer strategic battles

### Action Statistics
```
Average Moves:         52.1 per game
Average Eliminations:  18.4 per game
Average Captures:      31.7 per game
```
**Analysis**: Players prefer moving (52) over eliminating (18), capturing happens frequently (32)

### Performance
```
Total Time:           47.3 seconds
Average Time/Game:    0.095 seconds
Simulations/Second:   ~10.6
```
**Analysis**: Fast simulation speed allows for large-scale analysis

---

## Example Chart Insights

### 1. Win Distribution (Pie Chart)
```
🔴 Red Wins:   247 games (49.4%)
🔵 Blue Wins:  253 games (50.6%)
```
**Visual**: Nearly equal pie slices
**Insight**: Game is fair and balanced - no first-player advantage detected

### 2. Game Length Distribution (Bar Chart)
```
Turns Range    | Count | Percentage
---------------|-------|------------
20-30 turns    |   12  |   2.4%
30-40 turns    |   31  |   6.2%
40-50 turns    |   48  |   9.6%
50-60 turns    |   67  |  13.4%
60-70 turns    |   83  |  16.6%  ← Peak
70-80 turns    |   76  |  15.2%
80-90 turns    |   71  |  14.2%
90-100 turns   |   54  |  10.8%
100-120 turns  |   38  |   7.6%
120-150 turns  |   15  |   3.0%
150+ turns     |    5  |   1.0%
```
**Visual**: Bell curve distribution centered around 60-70 turns
**Insight**: Consistent, predictable game length with few outliers

### 3. Red Win Rate Trend (Area Chart)
```
Simulation Range | Red Win Rate
-----------------|-------------
Games 1-25       | 56%  (early volatility)
Games 26-50      | 52%
Games 51-100     | 49%
Games 101-200    | 50%
Games 201-300    | 49%
Games 301-400    | 49%
Games 401-500    | 50%  (stabilized)
```
**Visual**: Area chart starting high, converging to 50%
**Insight**: Win rate stabilizes after ~100 games, confirming good balance

### 4. Game Length by Winner (Scatter Chart)
```
Pattern observed:
- Red wins scattered evenly from 23-320 turns
- Blue wins scattered evenly from 28-389 turns
- No correlation between winner and game length
- Both colors appear throughout the entire range
```
**Visual**: Mixed red and blue dots across all turn ranges
**Insight**: Winner is not determined by game length - both quick and long games can be won by either player

### 5. Average Game Length Trend (Line Chart)
```
Simulation Range | Avg Length
-----------------|------------
Games 1-25       | 92 turns
Games 26-50      | 89 turns
Games 51-100     | 87 turns
Games 101-200    | 88 turns
Games 201-300    | 86 turns
Games 301-400    | 87 turns
Games 401-500    | 87 turns
```
**Visual**: Relatively flat line around 87 turns
**Insight**: Consistent game length across all simulations - no drift or instability

---

## Example JSON Export (Condensed)

```json
{
  "simulationResults": [
    {
      "winner": "red",
      "turns": 73,
      "moves": 45,
      "eliminations": 16,
      "captures": 28,
      "duration": 7.3
    },
    {
      "winner": "blue",
      "turns": 91,
      "moves": 58,
      "eliminations": 20,
      "captures": 35,
      "duration": 9.1
    },
    {
      "winner": "blue",
      "turns": 54,
      "moves": 32,
      "eliminations": 12,
      "captures": 19,
      "duration": 5.4
    },
    // ... 497 more games
  ],
  "summary": {
    "totalGames": 500,
    "redWins": 247,
    "blueWins": 253,
    "redWinRate": 49.4,
    "blueWinRate": 50.6,
    "avgTurns": 87.3,
    "avgMoves": 52.1,
    "avgEliminations": 18.4,
    "avgCaptures": 31.7,
    "minTurns": 23,
    "maxTurns": 389,
    "medianTurns": 81,
    "totalTime": 47.3,
    "avgTimePerGame": 0.0946
  }
}
```

---

## Example CSV Export

```csv
Game,Winner,Turns,Moves,Eliminations,Captures,Duration
1,red,73,45,16,28,7.30
2,blue,91,58,20,35,9.10
3,blue,54,32,12,19,5.40
4,red,67,41,15,25,6.70
5,red,102,64,23,41,10.20
6,blue,78,48,17,30,7.80
7,red,45,28,11,16,4.50
8,blue,123,76,28,47,12.30
9,red,89,55,19,34,8.90
10,blue,71,44,16,27,7.10
...
500,blue,83,51,18,32,8.30
```

**Usage in Excel/Python**:
- Create pivot tables by winner
- Calculate percentiles and distributions
- Generate custom charts
- Perform statistical tests (t-test, chi-square)
- Machine learning on game patterns

---

## Comparison Example: Different Configurations

### Configuration A: Goldberg (Sub 2, Start 3)
```
Red Win Rate:    49.4%
Avg Game Length: 87 turns
Avg Eliminations: 18
Balance Score:   ✅ Excellent (0.6% difference)
```

### Configuration B: Icosahedron (Sub 2, Start 3)
```
Red Win Rate:    51.2%
Avg Game Length: 64 turns
Avg Eliminations: 24
Balance Score:   ✅ Good (2.4% difference)
```

### Configuration C: Soccer Ball (Start 5)
```
Red Win Rate:    47.8%
Avg Game Length: 42 turns
Avg Eliminations: 31
Balance Score:   ✅ Good (4.4% difference)
```

### Configuration D: Goldberg (Sub 1, Start 7)
```
Red Win Rate:    45.2%
Avg Game Length: 28 turns
Avg Eliminations: 8
Balance Score:   ⚠️ Fair (9.6% difference)
```

**Key Findings**:
1. **Goldberg (Sub 2)** provides the most balanced gameplay
2. **Icosahedron** offers faster games with more eliminations
3. **Soccer Ball** creates quick, aggressive matches
4. **High starting tiles** may create slight imbalance

---

## Real-World Insights from 500+ Simulations

### Finding #1: First-Move Advantage is Minimal
- Red (first player) wins 49.4% of games
- Difference of only 0.6% from perfect 50/50
- **Conclusion**: No significant first-player advantage

### Finding #2: Game Length is Predictable
- 80% of games finish between 50-120 turns
- Very few stalemates (only 1% exceed 150 turns)
- **Conclusion**: Games have good pacing and reach conclusions

### Finding #3: Eliminations are Strategic
- Games average 18.4 eliminations (vs 52.1 moves)
- Elimination-heavy games (>25) tend to be shorter
- **Conclusion**: Eliminations are tactical choices, not spam

### Finding #4: Captures Drive Victory
- Winners average 38 captures vs 25 for losers
- Territory control correlates strongly with winning
- **Conclusion**: Aggressive expansion is rewarded

### Finding #5: Sphere Complexity Matters
- More subdivisions = longer games but better balance
- Sub 0-1: Quick games (40 turns), slight red advantage
- Sub 2-3: Medium games (80 turns), perfectly balanced
- Sub 4: Long games (150+ turns), perfectly balanced
- **Conclusion**: Sub 2 or 3 recommended for best experience

---

## Statistical Confidence Levels

### Sample Size Analysis
```
100 games:   ±10% margin of error
200 games:   ±7%  margin of error
500 games:   ±5%  margin of error  ← Our example
1000 games:  ±3%  margin of error
```

With 500 simulations, we can be 95% confident that:
- True red win rate is between 44.4% - 54.4%
- True average game length is between 83 - 92 turns

**Conclusion**: 500 games provides reliable, actionable data

---

## Recommendations Based on This Data

### For Game Designers
✅ Configuration is well-balanced - no changes needed
✅ Game length is in sweet spot (80-90 turns)
✅ Elimination mechanic is working as intended
✅ Capture system rewards aggressive play

### For Players
- Both players have equal chances of winning
- Expect games to last about 80 turns (~8-10 minutes)
- Focus on territory control and captures
- Use eliminations strategically, not constantly

### For Further Analysis
- Test with exact elimination OFF to compare
- Try different starting tile counts (1, 5, 7)
- Test other sphere types (Octahedron, Dodecahedron)
- Analyze move patterns for optimal strategies

---

## Exporting Your Own Data

After running simulations, you can:

1. **Click "📥 Export JSON"** to get complete raw data
   - Use in: Python (pandas), R, databases
   - Best for: Statistical analysis, machine learning

2. **Click "📥 Export CSV"** to get spreadsheet format
   - Use in: Excel, Google Sheets, Tableau
   - Best for: Quick analysis, pivot tables, charts

3. **Take Screenshots** of the charts for presentations

4. **Copy Statistics** from the summary panel for reports

---

## Questions This Data Can Answer

✅ Is the game balanced?
✅ What's the typical game length?
✅ Do different spheres play differently?
✅ Is one player advantaged?
✅ How often do eliminations happen?
✅ What configuration is most fun?
✅ Are there any bugs causing issues?
✅ How long should tournaments allocate per game?
✅ What settings create the fastest games?
✅ What settings create the most strategic depth?

---

**This example demonstrates the power of the Game Analyst tool. Run your own simulations to discover patterns and optimize your Red vs Blue experience!**