// GameSimulator.js - Headless game simulation for statistical analysis

// ============ UTILITY FUNCTIONS ============
const normalize = (v) => {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  return len > 0 ? [v[0] / len, v[1] / len, v[2] / len] : [0, 0, 1];
};

const faceCenter = (face, vertices) => {
  const center = [0, 0, 0];
  face.forEach((vi) => {
    center[0] += vertices[vi][0];
    center[1] += vertices[vi][1];
    center[2] += vertices[vi][2];
  });
  return normalize([
    center[0] / face.length,
    center[1] / face.length,
    center[2] / face.length,
  ]);
};

const subdivideMesh = (vertices, faces, subdivisions) => {
  let verts = [...vertices];
  let tris = [...faces];

  for (let s = 0; s < subdivisions; s++) {
    const midpointCache = {};
    const getMidpoint = (i1, i2) => {
      const key = i1 < i2 ? `${i1}-${i2}` : `${i2}-${i1}`;
      if (midpointCache[key] !== undefined) return midpointCache[key];
      const v1 = verts[i1];
      const v2 = verts[i2];
      const mid = normalize([
        (v1[0] + v2[0]) / 2,
        (v1[1] + v2[1]) / 2,
        (v1[2] + v2[2]) / 2,
      ]);
      verts.push(mid);
      midpointCache[key] = verts.length - 1;
      return midpointCache[key];
    };

    const newTris = [];
    for (const tri of tris) {
      const a = getMidpoint(tri[0], tri[1]);
      const b = getMidpoint(tri[1], tri[2]);
      const c = getMidpoint(tri[2], tri[0]);
      newTris.push([tri[0], a, c], [tri[1], b, a], [tri[2], c, b], [a, b, c]);
    }
    tris = newTris;
  }
  return { vertices: verts, faces: tris };
};

const toDual = (vertices, faces) => {
  const vertexFaces = [];
  for (let i = 0; i < vertices.length; i++) vertexFaces.push([]);
  faces.forEach((face, faceIdx) => {
    face.forEach((vi) => vertexFaces[vi].push(faceIdx));
  });

  const newVertices = [];
  const newFaces = [];
  const facePositions = faces.map((face) => faceCenter(face, vertices));

  vertexFaces.forEach((facesAroundVertex) => {
    const adjacentFaces = [...facesAroundVertex];
    const sortedFaces = [];
    const remaining = new Set(adjacentFaces);
    sortedFaces.push(adjacentFaces[0]);
    remaining.delete(adjacentFaces[0]);
    while (remaining.size > 0) {
      const lastFace = sortedFaces[sortedFaces.length - 1];
      let found = false;
      for (const candidateFace of remaining) {
        const shared = faces[lastFace].filter((v) =>
          faces[candidateFace].includes(v),
        ).length;
        if (shared >= 2) {
          sortedFaces.push(candidateFace);
          remaining.delete(candidateFace);
          found = true;
          break;
        }
      }
      if (!found) break;
    }
    newFaces.push(sortedFaces);
  });

  return { vertices: facePositions, faces: newFaces };
};

// ============ SPHERE GENERATORS ============
const generateGoldberg = (subdivisions) => {
  const t = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ].map(normalize);

  const faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  const subdivided = subdivideMesh(vertices, faces, subdivisions);
  return toDual(subdivided.vertices, subdivided.faces);
};

const generateIcosahedron = (subdivisions) => {
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = 1;
  const b = 1 / phi;
  const vertices = [
    [0, b, -a],
    [b, a, 0],
    [-b, a, 0],
    [0, b, a],
    [0, -b, a],
    [-a, 0, b],
    [0, -b, -a],
    [a, 0, -b],
    [a, 0, b],
    [-a, 0, -b],
    [b, -a, 0],
    [-b, -a, 0],
  ].map(normalize);

  const faces = [
    [2, 1, 0],
    [1, 2, 3],
    [5, 4, 3],
    [4, 8, 3],
    [7, 6, 0],
    [6, 9, 0],
    [11, 10, 4],
    [10, 11, 6],
    [9, 5, 2],
    [5, 9, 11],
    [8, 7, 1],
    [7, 8, 10],
    [2, 5, 3],
    [8, 1, 3],
    [9, 2, 0],
    [1, 7, 0],
    [11, 9, 6],
    [7, 10, 6],
    [5, 11, 4],
    [10, 8, 4],
  ];

  const facePositions = {};
  const subdivided = subdivideMesh(vertices, faces, subdivisions);
  subdivided.faces.forEach((face, idx) => {
    facePositions[idx] = faceCenter(face, subdivided.vertices);
  });
  return { ...subdivided, facePositions };
};

const generateOctahedron = (subdivisions) => {
  const vertices = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];

  const faces = [
    [0, 2, 4],
    [0, 4, 3],
    [0, 3, 5],
    [0, 5, 2],
    [1, 4, 2],
    [1, 3, 4],
    [1, 5, 3],
    [1, 2, 5],
  ];

  const facePositions = {};
  faces.forEach((face, idx) => {
    facePositions[idx] = faceCenter(face, vertices);
  });

  const subdivided = subdivideMesh(vertices, faces, subdivisions);
  const facePositions2 = {};
  subdivided.faces.forEach((face, idx) => {
    facePositions2[idx] = faceCenter(face, subdivided.vertices);
  });
  return { ...subdivided, facePositions: facePositions2 };
};

const generateDodecahedron = () => {
  const phi = (1 + Math.sqrt(5)) / 2;
  const a = 1 / phi;
  const b = phi;
  const vertices = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
    [0, a, b],
    [0, a, -b],
    [0, -a, b],
    [0, -a, -b],
    [a, b, 0],
    [a, -b, 0],
    [-a, b, 0],
    [-a, -b, 0],
    [b, 0, a],
    [b, 0, -a],
    [-b, 0, a],
    [-b, 0, -a],
  ].map(normalize);

  const faces = [
    [0, 8, 4, 14, 12],
    [0, 16, 2, 10, 8],
    [0, 12, 1, 17, 16],
    [1, 9, 5, 14, 12],
    [1, 17, 3, 11, 9],
    [2, 13, 3, 17, 16],
    [2, 10, 6, 15, 13],
    [3, 13, 15, 7, 11],
    [4, 8, 10, 6, 18],
    [4, 18, 19, 5, 14],
    [5, 19, 7, 11, 9],
    [6, 15, 7, 19, 18],
  ];

  const facePositions = {};
  faces.forEach((face, idx) => {
    facePositions[idx] = faceCenter(face, vertices);
  });
  return { vertices, faces, facePositions };
};

const generateQuadSphere = (subdivisions) => {
  const vertices = [
    [1, 1, 1],
    [1, 1, -1],
    [1, -1, 1],
    [1, -1, -1],
    [-1, 1, 1],
    [-1, 1, -1],
    [-1, -1, 1],
    [-1, -1, -1],
  ].map(normalize);

  const faces = [
    [0, 2, 3, 1],
    [4, 5, 7, 6],
    [0, 1, 5, 4],
    [2, 6, 7, 3],
    [0, 4, 6, 2],
    [1, 3, 7, 5],
  ];

  const subdivided = subdivideMesh(vertices, faces, subdivisions);
  return toDual(subdivided.vertices, subdivided.faces);
};

const generateTriangular = (subdivisions) => {
  const t = (1 + Math.sqrt(5)) / 2;
  const vertices = [
    [-1, t, 0],
    [1, t, 0],
    [-1, -t, 0],
    [1, -t, 0],
    [0, -1, t],
    [0, 1, t],
    [0, -1, -t],
    [0, 1, -t],
    [t, 0, -1],
    [t, 0, 1],
    [-t, 0, -1],
    [-t, 0, 1],
  ].map(normalize);

  const faces = [
    [0, 11, 5],
    [0, 5, 1],
    [0, 1, 7],
    [0, 7, 10],
    [0, 10, 11],
    [1, 5, 9],
    [5, 11, 4],
    [11, 10, 2],
    [10, 7, 6],
    [7, 1, 8],
    [3, 9, 4],
    [3, 4, 2],
    [3, 2, 6],
    [3, 6, 8],
    [3, 8, 9],
    [4, 9, 5],
    [2, 4, 11],
    [6, 2, 10],
    [8, 6, 7],
    [9, 8, 1],
  ];

  const { vertices: verts, faces: tris } = subdivideMesh(
    vertices,
    faces,
    subdivisions,
  );

  const facePositions = {};
  tris.forEach((face, idx) => {
    facePositions[idx] = faceCenter(face, verts);
  });
  return { vertices: verts, faces: tris, facePositions };
};

const generateTruncatedIcosahedron = () => {
  const ico = generateIcosahedron(1);
  const dual = toDual(ico.vertices, ico.faces);

  const facePositions = {};
  dual.faces.forEach((face, idx) => {
    facePositions[idx] = faceCenter(face, dual.vertices);
  });
  return { ...dual, facePositions };
};

const SPHERE_GENERATORS = {
  goldberg: generateGoldberg,
  triangular: generateTriangular,
  quad: generateQuadSphere,
  dodecahedron: generateDodecahedron,
  octahedron: generateOctahedron,
  icosahedron: generateIcosahedron,
  soccerball: generateTruncatedIcosahedron,
};

const generateSphere = (sphereType, subdivisions) => {
  const generator = SPHERE_GENERATORS[sphereType];
  if (!generator) throw new Error(`Unknown sphere type: ${sphereType}`);

  if (sphereType === "dodecahedron" || sphereType === "soccerball") {
    return generator();
  }
  return generator(subdivisions);
};

// ============ GAME LOGIC ============
const getNeighbors = (faceIdx, faces) => {
  const face = faces[faceIdx];
  const neighbors = [];
  for (let i = 0; i < faces.length; i++) {
    if (i === faceIdx) continue;
    const shared = face.filter((v) => faces[i].includes(v)).length;
    if (shared >= 2) neighbors.push(i);
  }
  return neighbors;
};

const getValidMoves = (tileStates, currentPlayer, neighbors) => {
  const moves = [];
  tileStates.forEach((state, idx) => {
    if (state === currentPlayer) {
      neighbors[idx].forEach((neighborIdx) => {
        if (tileStates[neighborIdx] === "empty") {
          moves.push({ type: "move", from: idx, to: neighborIdx });
        }
      });
    }
  });
  return moves;
};

const getEliminatable = (
  tileStates,
  currentPlayer,
  facePositions,
  exactElimination,
) => {
  const playerTiles = tileStates
    .map((state, idx) => (state === currentPlayer ? idx : null))
    .filter((pos) => pos !== null);

  const numFaces = tileStates.length;
  const avgTileRadius = Math.sqrt((4 * Math.PI) / numFaces);
  const exactThreshold = avgTileRadius * 1.5;

  const eliminatable = [];

  const antipodal = (pos) => {
    return [-pos[0], -pos[1], -pos[2]];
  };

  for (const tileIdx of playerTiles) {
    let closestIdx = null;
    let closestDist = Infinity;

    const pos = facePositions[tileIdx];
    const antipodalPos = antipodal(pos);

    for (let i = 0; i < tileStates.length; i++) {
      if (tileStates[i] === "empty" || tileStates[i] === "eliminated") continue;
      if (tileStates[i] === currentPlayer) continue;

      const targetPos = facePositions[i];
      const dist = Math.sqrt(
        (targetPos[0] - antipodalPos[0]) ** 2 +
          (targetPos[1] - antipodalPos[1]) ** 2 +
          (targetPos[2] - antipodalPos[2]) ** 2,
      );

      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== null) {
      if (exactElimination) {
        if (closestDist <= exactThreshold) {
          eliminatable.push({ type: "eliminate", target: closestIdx });
        }
      } else {
        eliminatable.push({ type: "eliminate", target: closestIdx });
      }
    }
  }

  return eliminatable;
};

const checkCaptures = (tileStates, currentPlayer, neighbors) => {
  let newStates = [...tileStates];
  let changed = false;

  const opponent = currentPlayer === "red" ? "blue" : "red";

  for (let i = 0; i < newStates.length; i++) {
    if (newStates[i] !== opponent) continue;

    const visited = new Set();
    const group = [];
    const queue = [i];
    const boundaryTiles = new Set();

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      visited.add(current);

      if (newStates[current] === opponent) {
        group.push(current);
        neighbors[current].forEach((n) => {
          if (!visited.has(n)) queue.push(n);
        });
      } else if (newStates[current] === currentPlayer) {
        boundaryTiles.add(current);
      }
    }

    const isSurrounded = group.every((tile) =>
      neighbors[tile].every(
        (n) => newStates[n] !== opponent && newStates[n] !== "empty",
      ),
    );

    if (isSurrounded && boundaryTiles.size > 0) {
      group.forEach((tile) => {
        newStates[tile] = currentPlayer;
        changed = true;
      });
    }
  }

  return { newStates, changed };
};

const makeAIMove = (
  tileStates,
  currentPlayer,
  neighbors,
  facePositions,
  exactElimination,
  moveHistory = [],
) => {
  const getActionSignature = (action) => {
    if (action.type === "move") return `move-${action.from}-${action.to}`;
    return `eliminate-${action.target}`;
  };

  const recentMoves = moveHistory.slice(-10);
  const moveCount = {};
  recentMoves.forEach((sig) => {
    moveCount[sig] = (moveCount[sig] || 0) + 1;
  });

  const moves = getValidMoves(tileStates, currentPlayer, neighbors);
  const eliminations = getEliminatable(
    tileStates,
    currentPlayer,
    facePositions,
    exactElimination,
  );
  const allActions = [...eliminations, ...moves];

  if (allActions.length === 0) return null;

  const opponent = currentPlayer === "red" ? "blue" : "red";

  const evaluatePosition = (states) => {
    const myTiles = states.filter((s) => s === currentPlayer).length;
    const theirTiles = states.filter((s) => s === opponent).length;
    const emptyTiles = states.filter((s) => s === "empty").length;
    const myMoves = getValidMoves(states, currentPlayer, neighbors).length;
    const theirMoves = getValidMoves(states, opponent, neighbors).length;
    const myElims = getEliminatable(
      states,
      currentPlayer,
      facePositions,
      exactElimination,
    ).length;
    const theirElims = getEliminatable(
      states,
      opponent,
      facePositions,
      exactElimination,
    ).length;

    const tileDiff = myTiles - theirTiles;
    const moveDiff = myMoves - theirMoves;
    const elimDiff = myElims - theirElims;

    return tileDiff * 10 + moveDiff * 2 + elimDiff * 5;
  };

  const actionScores = [];

  for (const action of allActions) {
    let newStates = [...tileStates];

    if (action.type === "eliminate") {
      newStates[action.target] = "eliminated";
    } else if (action.type === "move") {
      newStates[action.to] = currentPlayer;
    }

    const captureResult = checkCaptures(newStates, currentPlayer, neighbors);
    newStates = captureResult.newStates;

    const evaluation = evaluatePosition(newStates);

    let score = evaluation;
    const totalTiles = newStates.filter((s) => s !== "eliminated").length;
    const gameProgress = 1 - totalTiles / tileStates.length;

    const actionSig = getActionSignature(action);
    const repetitionCount = moveCount[actionSig] || 0;
    score -= repetitionCount * 15;

    if (action.type === "eliminate") {
      score += 50;
      score += gameProgress * 30;
    } else {
      score += 10;
    }

    actionScores.push({ action, score });
  }

  actionScores.sort((a, b) => b.score - a.score);

  const bestScore = actionScores[0].score;
  const threshold = bestScore - 5;
  const goodActions = actionScores.filter((a) => a.score >= threshold);

  const chosen = goodActions[Math.floor(Math.random() * goodActions.length)];
  return chosen.action;
};

// ============ GAME SIMULATOR ============
export const simulateGame = async (config) => {
  const {
    sphereType,
    subdivisions,
    startingTiles,
    exactElimination,
    maxTurnsPerGame,
  } = config;

  // Generate sphere
  const polyData = generateSphere(sphereType, subdivisions);
  let { faces, vertices, facePositions } = polyData;

  // Ensure facePositions exists (some generators don't return it)
  if (!facePositions) {
    facePositions = {};
    faces.forEach((face, idx) => {
      facePositions[idx] = faceCenter(face, vertices);
    });
  }

  // Generate neighbors
  const neighbors = faces.map((_, idx) => getNeighbors(idx, faces));

  // Initialize tile states
  const tileStates = new Array(faces.length).fill("empty");
  const facesByY = faces
    .map((face, idx) => ({ idx, y: facePositions[idx][1] }))
    .sort((a, b) => b.y - a.y);

  const maxStart = Math.min(startingTiles, Math.floor(faces.length / 4));
  const actualStart = Math.max(1, maxStart);

  for (let i = 0; i < actualStart; i++) {
    tileStates[facesByY[i].idx] = "red";
  }
  for (let i = 0; i < actualStart; i++) {
    tileStates[facesByY[facesByY.length - 1 - i].idx] = "blue";
  }

  // Game state
  let currentPlayer = "red";
  let turnCount = 0;
  let moveHistory = [];
  let gameOver = false;
  let winner = null;
  let moves = 0;
  let eliminations = 0;
  let captures = 0;

  // Game loop
  while (!gameOver && turnCount < maxTurnsPerGame) {
    turnCount++;

    // Get AI move
    const action = makeAIMove(
      tileStates,
      currentPlayer,
      neighbors,
      facePositions,
      exactElimination,
      moveHistory,
    );

    if (!action) {
      // No valid moves, game over
      const redTiles = tileStates.filter((s) => s === "red").length;
      const blueTiles = tileStates.filter((s) => s === "blue").length;
      winner = redTiles > blueTiles ? "red" : "blue";
      gameOver = true;
      break;
    }

    // Execute action
    if (action.type === "eliminate") {
      tileStates[action.target] = "eliminated";
      eliminations++;
    } else if (action.type === "move") {
      tileStates[action.to] = currentPlayer;
      moves++;
    }

    // Check captures
    const tilesBeforeCaptureRed = tileStates.filter((s) => s === "red").length;
    const tilesBeforeCaptureBlue = tileStates.filter(
      (s) => s === "blue",
    ).length;

    const captureResult = checkCaptures(tileStates, currentPlayer, neighbors);
    tileStates.splice(0, tileStates.length, ...captureResult.newStates);

    const tilesAfterCaptureRed = tileStates.filter((s) => s === "red").length;
    const tilesAfterCaptureBlue = tileStates.filter((s) => s === "blue").length;

    const territoryCaptured = Math.abs(
      tilesAfterCaptureRed -
        tilesBeforeCaptureRed +
        (tilesAfterCaptureBlue - tilesBeforeCaptureBlue),
    );
    captures += territoryCaptured;

    // Add to move history
    const actionSig =
      action.type === "move"
        ? `move-${action.from}-${action.to}`
        : `eliminate-${action.target}`;
    moveHistory.push(actionSig);
    if (moveHistory.length > 20) moveHistory.shift();

    // Check game over
    const redTiles = tileStates.filter((s) => s === "red").length;
    const blueTiles = tileStates.filter((s) => s === "blue").length;
    const emptyTiles = tileStates.filter((s) => s === "empty").length;

    if (redTiles === 0 && blueTiles > 0) {
      winner = "blue";
      gameOver = true;
    } else if (blueTiles === 0 && redTiles > 0) {
      winner = "red";
      gameOver = true;
    } else if (emptyTiles === 0) {
      winner = redTiles > blueTiles ? "red" : "blue";
      gameOver = true;
    }

    // Switch player
    currentPlayer = currentPlayer === "red" ? "blue" : "red";
  }

  // If max turns reached without winner
  if (!winner) {
    const redTiles = tileStates.filter((s) => s === "red").length;
    const blueTiles = tileStates.filter((s) => s === "blue").length;
    winner =
      redTiles > blueTiles ? "red" : blueTiles > redTiles ? "blue" : "red";
  }

  return {
    winner,
    turns: turnCount,
    moves,
    eliminations,
    captures,
    duration: turnCount * 0.1, // Approximate duration in seconds
  };
};

export default simulateGame;
