# Game Analyst - Quick Reference Card

## 🚀 Launch

1. Open Red vs Blue
2. Click **"🔬 Game Analyst"** from main menu
3. Configure settings
4. Click **"🚀 Run Simulations"**

## ⚙️ Essential Settings

| Setting | Recommended | Range |
|---------|-------------|-------|
| Simulations | 100-500 | 1-10,000 |
| Subdivisions | 2 | 0-4 |
| Starting Tiles | 3 | 1-10 |
| Max Turns | 500 | 50-2,000 |

## 📊 Key Metrics

### Balance Check
- ✅ **Good**: 45-55% win rate for each player
- ⚠️ **Fair**: 40-60% win rate
- ❌ **Poor**: < 40% or > 60% win rate

### Game Length
- **Quick**: < 50 turns
- **Normal**: 50-120 turns
- **Long**: > 120 turns

### Sample Sizes
- **50 games**: Quick test only
- **100 games**: Basic trends
- **500 games**: Reliable data ⭐
- **1000+ games**: High confidence

## 📈 Charts Overview

| Chart | Shows | Look For |
|-------|-------|----------|
| 🥧 Pie | Win split | Equal halves |
| 📊 Bar | Game length | Bell curve |
| 📈 Area | Win rate trend | Converges to 50% |
| 🔵 Scatter | Individual games | Mixed colors |
| 📉 Line | Avg length | Stable line |

## 💾 Export Options

**JSON** → Python, R, databases, ML  
**CSV** → Excel, Google Sheets, Tableau

## ⚡ Quick Workflows

### Test Balance
```
Config: Goldberg, Sub 2, Start 3
Sims: 500
Check: Win rate ~50%
```

### Compare Spheres
```
Run 200 sims on each sphere type
Same subdivisions & starting tiles
Compare avg game length & balance
```

### Find Optimal Settings
```
Test: Start tiles 1, 3, 5, 7
Test: Subdivisions 1, 2, 3
Test: Exact elimination on/off
Choose: Best balance + desired length
```

## 🎯 Interpretation Guide

### Red Win Rate
- **49-51%**: Perfect balance ✅
- **45-55%**: Good balance ✅
- **40-60%**: Acceptable ⚠️
- **<40% or >60%**: Imbalanced ❌

### Game Length Variance
- **Std Dev < 20**: Consistent
- **Std Dev 20-40**: Normal
- **Std Dev > 40**: High variance

### Action Ratios
- **Moves > Eliminations**: Normal
- **Eliminations > Moves**: Aggressive
- **High Captures**: Territory control

## 🔧 Common Configurations

### Balanced Standard
```
Goldberg, Sub 2, Start 3
Exact: ON, Sims: 500
Expected: 50/50, 80-90 turns
```

### Quick Games
```
Soccer Ball, Start 5
Exact: OFF, Sims: 200
Expected: 30-50 turns
```

### Strategic Depth
```
Goldberg, Sub 3, Start 3
Exact: ON, Sims: 500
Expected: 120-150 turns
```

### Simple Testing
```
Dodecahedron, Start 3
Exact: ON, Sims: 100
Expected: 40-60 turns
```

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Too slow | Lower subdivisions |
| Hits max turns | Increase max or lower complexity |
| Imbalanced | Try different sphere/settings |
| High variance | Normal for complex spheres |

## 📱 Keyboard Shortcuts

- **Scroll**: Charts are interactive
- **Hover**: See detailed values
- **Click Legend**: Toggle series
- **Export**: One click for JSON/CSV

## 💡 Pro Tips

1. ✅ Always run 100+ games for meaningful data
2. ✅ Export data before closing browser
3. ✅ Start with default settings first
4. ✅ Check win rate AND distribution
5. ✅ Compare median, not just average
6. ✅ Look for convergence in trends
7. ✅ Save interesting configs
8. ✅ Test edge cases

## 🎓 Reading Results

### Example Output
```
Total Games: 500
Red Wins: 247 (49.4%)
Blue Wins: 253 (50.6%)
Avg Turns: 87.3
Min/Max: 23 / 389
```

**Interpretation**:
- ✅ Balanced (49.4% vs 50.6%)
- ✅ Consistent length (avg 87)
- ✅ Few outliers (min/max reasonable)
- ✅ Good configuration

## 📊 Statistical Rules

### Sample Size Formula
```
Margin of Error ≈ 100 / √(n)

100 games → ±10%
500 games → ±5%
1000 games → ±3%
```

### Confidence Levels
- **95% confidence**: Win rate ± margin
- **500 games**: 50% ± 5% = 45-55%
- **Need <5%?**: Run 500+ simulations

## 🔄 Typical Session

1. **Setup** (30 sec): Choose config
2. **Run** (10-60 sec): Watch progress
3. **Analyze** (2-5 min): Review charts
4. **Export** (5 sec): Save data
5. **Adjust** (30 sec): Tweak settings
6. **Repeat**: Compare results

## 🎯 Success Criteria

Your simulation is good when:
- ✅ Win rate converged to stable value
- ✅ Game lengths form clear distribution
- ✅ Minimum 100 games completed
- ✅ Charts show consistent patterns
- ✅ No extreme outliers (>3x median)

## 📞 Quick Help

**Balance issues?** Try different sphere type  
**Too fast?** Increase subdivisions  
**Too slow?** Decrease subdivisions  
**Crashes?** Lower max turns per game  
**Confused?** See ANALYST_GUIDE.md

## 🔗 Resources

- **Full Guide**: ANALYST_GUIDE.md
- **Examples**: ANALYST_EXAMPLE_OUTPUT.md
- **Game Help**: README.md
- **Changes**: CHANGELOG.md

---

**TIP**: Bookmark this page for quick reference while analyzing! 📌

**Version**: 2.1.0 | **Updated**: 2025