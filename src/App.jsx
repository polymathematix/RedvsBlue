import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

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
  const vertexFaces = {};
  faces.forEach((face, faceIdx) => {
    face.forEach((vertIdx) => {
      if (!vertexFaces[vertIdx]) vertexFaces[vertIdx] = [];
      vertexFaces[vertIdx].push(faceIdx);
    });
  });

  const newVertices = faces.map((face) => faceCenter(face, vertices));
  const newFaces = [];
  const facePositions = [];

  for (let vi = 0; vi < vertices.length; vi++) {
    const adjacentFaces = vertexFaces[vi];
    if (!adjacentFaces || adjacentFaces.length < 3) continue;

    const sortedFaces = [adjacentFaces[0]];
    const remaining = adjacentFaces.slice(1);

    while (remaining.length > 0) {
      const lastFace = faces[sortedFaces[sortedFaces.length - 1]];
      let found = false;
      for (let i = 0; i < remaining.length; i++) {
        const candidateFace = faces[remaining[i]];
        const shared = lastFace.filter((v) => candidateFace.includes(v));
        if (shared.length === 2 && shared.includes(vi)) {
          sortedFaces.push(remaining[i]);
          remaining.splice(i, 1);
          found = true;
          break;
        }
      }
      if (!found) break;
    }

    if (sortedFaces.length >= 3) {
      newFaces.push(sortedFaces);
      facePositions.push(vertices[vi]);
    }
  }

  return { vertices: newVertices, faces: newFaces, facePositions };
};

// ============ SPHERE GENERATORS ============
const generateGoldberg = (detail) => {
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

  const subdivided = subdivideMesh(vertices, faces, detail);
  return toDual(subdivided.vertices, subdivided.faces);
};

const generateTriangular = (detail) => {
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
    detail,
  );
  const facePositions = tris.map((face) => faceCenter(face, verts));
  return { vertices: verts, faces: tris, facePositions };
};

const generateQuadSphere = (detail) => {
  const vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1],
  ].map(normalize);

  const faces = [
    [0, 1, 2],
    [0, 2, 3],
    [5, 4, 7],
    [5, 7, 6],
    [4, 0, 3],
    [4, 3, 7],
    [1, 5, 6],
    [1, 6, 2],
    [3, 2, 6],
    [3, 6, 7],
    [4, 5, 1],
    [4, 1, 0],
  ];

  const subdivided = subdivideMesh(vertices, faces, detail + 1);
  return toDual(subdivided.vertices, subdivided.faces);
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
    [0, 8, 10, 2, 16],
    [0, 16, 17, 1, 12],
    [0, 12, 14, 4, 8],
    [1, 17, 3, 11, 9],
    [1, 9, 5, 14, 12],
    [2, 10, 6, 15, 13],
    [2, 13, 3, 17, 16],
    [3, 13, 15, 7, 11],
    [4, 14, 5, 19, 18],
    [4, 18, 6, 10, 8],
    [5, 9, 11, 7, 19],
    [6, 18, 19, 7, 15],
  ];

  const facePositions = faces.map((face) => faceCenter(face, vertices));
  return { vertices, faces, facePositions };
};

const generateOctahedron = (detail) => {
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

  if (detail === 0) {
    const facePositions = faces.map((face) => faceCenter(face, vertices));
    return { vertices, faces, facePositions };
  }

  const subdivided = subdivideMesh(vertices, faces, detail);
  const facePositions = subdivided.faces.map((face) =>
    faceCenter(face, subdivided.vertices),
  );
  return {
    vertices: subdivided.vertices,
    faces: subdivided.faces,
    facePositions,
  };
};

const SPHERE_TYPES = {
  goldberg: {
    name: "Goldberg (Hex)",
    hasDetail: true,
    generator: generateGoldberg,
  },
  triangular: {
    name: "Triangular",
    hasDetail: true,
    generator: generateTriangular,
  },
  quad: { name: "Quad Sphere", hasDetail: true, generator: generateQuadSphere },
  dodecahedron: {
    name: "Dodecahedron",
    hasDetail: false,
    generator: generateDodecahedron,
  },
  octahedron: {
    name: "Octahedron",
    hasDetail: true,
    generator: generateOctahedron,
  },
};

const generateSphere = (type, detail) => {
  const sphereType = SPHERE_TYPES[type];
  if (!sphereType) return generateGoldberg(detail);
  return sphereType.hasDetail
    ? sphereType.generator(detail)
    : sphereType.generator();
};

const getNeighbors = (faceIdx, faces) => {
  const face = faces[faceIdx];
  const neighbors = [];

  faces.forEach((otherFace, otherIdx) => {
    if (otherIdx === faceIdx) return;
    const shared = face.filter((v) => otherFace.includes(v));
    if (shared.length >= 2) {
      neighbors.push(otherIdx);
    }
  });

  return neighbors;
};

// ============ AI LOGIC ============
const AI_TYPES = {
  computer: { name: "Computer" },
};

const getValidMoves = (player, states, neighborMap) => {
  const moves = [];
  states.forEach((state, idx) => {
    if (state === player) {
      (neighborMap[idx] || []).forEach((neighborIdx) => {
        if (states[neighborIdx] === "empty") {
          moves.push({ type: "move", from: idx, to: neighborIdx });
        }
      });
    }
  });
  return moves;
};

const getEliminatable = (player, states, polyData, exactElimination) => {
  if (!polyData) return [];

  const playerTiles = states
    .map((state, idx) => ({ state, idx, pos: polyData.facePositions[idx] }))
    .filter((t) => t.state === player);

  const numFaces = polyData.faces.length;
  const avgTileRadius = Math.sqrt((4 * Math.PI) / numFaces) / 2;
  const exactThreshold = avgTileRadius * 1.5;

  const eliminatable = new Set();

  playerTiles.forEach((playerTile) => {
    const antipodal = [
      -playerTile.pos[0],
      -playerTile.pos[1],
      -playerTile.pos[2],
    ];

    let closestIdx = -1;
    let closestDist = Infinity;

    states.forEach((state, idx) => {
      if (state !== "empty") return;
      const pos = polyData.facePositions[idx];
      const dist = Math.sqrt(
        Math.pow(pos[0] - antipodal[0], 2) +
          Math.pow(pos[1] - antipodal[1], 2) +
          Math.pow(pos[2] - antipodal[2], 2),
      );
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = idx;
      }
    });

    if (closestIdx !== -1) {
      if (exactElimination) {
        if (closestDist < exactThreshold) eliminatable.add(closestIdx);
      } else {
        eliminatable.add(closestIdx);
      }
    }
  });

  return Array.from(eliminatable).map((idx) => ({
    type: "eliminate",
    target: idx,
  }));
};

const simulateMove = (states, from, to, player, neighborMap) => {
  const newStates = [...states];
  const opponent = player === "red" ? "blue" : "red";

  newStates[from] = "empty";
  newStates[to] = player;

  (neighborMap[to] || []).forEach((neighborIdx) => {
    if (newStates[neighborIdx] === opponent) {
      newStates[neighborIdx] = player;
    }
  });

  return newStates;
};

const makeAIMove = (
  aiType,
  player,
  states,
  neighborMap,
  polyData,
  exactElimination,
  moveHistory = [],
) => {
  // Safety check for polyData
  if (!polyData) return null;

  // Create a signature for an action to track repetition
  const getActionSignature = (action) => {
    if (action.type === "move") {
      return `move:${action.from}-${action.to}`;
    } else {
      return `eliminate:${action.target}`;
    }
  };

  // Count recent occurrences of each action
  const recentMoves = moveHistory.slice(-6); // Look at last 6 moves
  const moveCount = {};
  recentMoves.forEach((sig) => {
    moveCount[sig] = (moveCount[sig] || 0) + 1;
  });

  const moves = getValidMoves(player, states, neighborMap);
  const eliminations = getEliminatable(
    player,
    states,
    polyData,
    exactElimination,
  );
  const allActions = [...moves, ...eliminations];

  if (allActions.length === 0) return null;

  const opponent = player === "red" ? "blue" : "red";

  // Helper function to evaluate a position
  const evaluatePosition = (newStates) => {
    const myTiles = newStates.filter((s) => s === player).length;
    const theirTiles = newStates.filter((s) => s === opponent).length;
    const emptyTiles = newStates.filter((s) => s === "empty").length;
    const myMoves = getValidMoves(player, newStates, neighborMap).length;
    const theirMoves = getValidMoves(opponent, newStates, neighborMap).length;
    const myElims = getEliminatable(
      player,
      newStates,
      polyData,
      exactElimination,
    ).length;
    const theirElims = getEliminatable(
      opponent,
      newStates,
      polyData,
      exactElimination,
    ).length;

    return {
      myTiles,
      theirTiles,
      emptyTiles,
      myMoves,
      theirMoves,
      myElims,
      theirElims,
      tileDiff: myTiles - theirTiles,
      moveDiff: myMoves - theirMoves,
      elimDiff: myElims - theirElims,
    };
  };

  // Strategic AI: comprehensive evaluation with game phase awareness
  const actionScores = [];

  for (const action of allActions) {
    let newStates;
    if (action.type === "move") {
      newStates = simulateMove(
        states,
        action.from,
        action.to,
        player,
        neighborMap,
      );
    } else {
      newStates = [...states];
      newStates[action.target] = "eliminated";
    }

    const evaluation = evaluatePosition(newStates);

    let score = 0;
    const totalTiles = polyData?.faces?.length || 100;
    const gameProgress = (totalTiles - evaluation.emptyTiles) / totalTiles;

    // Penalize repetitive moves to prevent loops
    const actionSig = getActionSignature(action);
    const repetitionCount = moveCount[actionSig] || 0;
    if (repetitionCount > 0) {
      // Heavy penalty for repeated moves - increases exponentially
      score -= repetitionCount * 100;
    }

    // Early game: focus on expansion and mobility
    if (gameProgress < 0.3) {
      score += evaluation.myTiles * 10;
      score += evaluation.myMoves * 6;
      score -= evaluation.theirMoves * 4;
    }
    // Mid game: balanced approach
    else if (gameProgress < 0.7) {
      score += evaluation.tileDiff * 15;
      score += evaluation.moveDiff * 5;
      score += evaluation.elimDiff * 20;
      score -= evaluation.theirTiles * 4;
    }
    // Late game: aggressive and decisive
    else {
      score += evaluation.tileDiff * 20;
      score += evaluation.elimDiff * 35;
      score -= evaluation.theirMoves * 10;
      if (action.type === "eliminate") score += 15;
    }

    // Always value having more tiles than opponent
    if (evaluation.myTiles > evaluation.theirTiles) {
      score += 10;
    }

    // Penalize if we're about to lose all moves
    if (evaluation.myMoves === 0) {
      score -= 1000;
    }

    // Add small random factor to prevent exact score ties
    score += Math.random() * 5;

    actionScores.push({ action, score });
  }

  // Sort by score descending
  actionScores.sort((a, b) => b.score - a.score);

  if (actionScores.length === 0) return null;

  // Get the best score
  const bestScore = actionScores[0].score;

  // Consider all actions within 10% of the best score as "good enough"
  // This adds variety and prevents getting stuck in loops
  const threshold = bestScore * 0.9;
  const goodActions = actionScores.filter((item) => item.score >= threshold);

  // Randomly pick from the good actions
  const chosen = goodActions[Math.floor(Math.random() * goodActions.length)];
  return chosen.action;
};

// ============ COLOR CONSTANTS ============
const COLORS = {
  red: 0xef4444,
  blue: 0x3b82f6,
  empty: 0xd1d5db,
  eliminated: 0x374151,
  selected: 0xfbbf24,
  validMove: 0x22c55e,
  eliminatable: 0xf97316,
};

// ============ MAIN COMPONENT ============
export default function RedVsBlueSphere({ mode, onReturnToMenu }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshesRef = useRef([]);
  const sphereGroupRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioCtxRef = useRef(null);
  const aiTimeoutRef = useRef(null);
  const tileAnimationsRef = useRef([]);
  const prevTileStatesRef = useRef([]);
  const colorAnimationIdRef = useRef(null);
  const particlesRef = useRef([]);

  // Game state
  const [polyData, setPolyData] = useState(null);
  const [neighbors, setNeighbors] = useState([]);
  const [tileStates, setTileStates] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("red");
  const [selectedTile, setSelectedTile] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [message, setMessage] = useState("Red's turn: Select a tile");
  const [isInitialized, setIsInitialized] = useState(false);

  // Settings
  const [sphereType, setSphereType] = useState("goldberg");
  const [subdivisions, setSubdivisions] = useState(2);
  const [startingTiles, setStartingTiles] = useState(3);
  const [exactElimination, setExactElimination] = useState(true);
  const [redPlayer, setRedPlayer] = useState("human");
  const [bluePlayer, setBluePlayer] = useState("human");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  // Stats
  const [turnCount, setTurnCount] = useState(0);

  // Statistics tracking
  const [showStats, setShowStats] = useState(false);
  const gameStatsRef = useRef([]);

  // Zoom state
  const [zoom, setZoom] = useState(2.5);
  const minZoom = 1.5;
  const maxZoom = 12.0;
  const zoomRef = useRef(2.5);

  // Refs for AI
  const aiThinkingRef = useRef(false);
  const [aiThinking, setAiThinking] = useState(false);
  const moveHistoryRef = useRef([]);

  // Refs for pinch gesture
  const pinchStartDistance = useRef(null);
  const pinchStartZoom = useRef(null);

  // Sound effects
  const playSound = useCallback(
    (type) => {
      if (!soundEnabled) return;
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (
            window.AudioContext || window.webkitAudioContext
          )();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === "move") {
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            880,
            ctx.currentTime + 0.1,
          );
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.1);
        } else if (type === "capture") {
          osc.frequency.setValueAtTime(523, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            784,
            ctx.currentTime + 0.15,
          );
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.15);
        } else if (type === "eliminate") {
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(200, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.2);
        } else if (type === "win") {
          [523, 659, 784, 1047].forEach((freq, i) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g);
            g.connect(ctx.destination);
            o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
            g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
            g.gain.exponentialRampToValueAtTime(
              0.01,
              ctx.currentTime + i * 0.15 + 0.3,
            );
            o.start(ctx.currentTime + i * 0.15);
            o.stop(ctx.currentTime + i * 0.15 + 0.3);
          });
        } else if (type === "select") {
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.05);
        }
      } catch (e) {}
    },
    [soundEnabled],
  );

  // Spawn subtle particles at a position
  const spawnParticles = useCallback((position, color, type = "capture") => {
    if (!sphereGroupRef.current) return;

    const count = type === "capture" ? 6 : 8;
    const speed = type === "capture" ? 0.02 : 0.015;
    const size = type === "capture" ? 0.03 : 0.025;

    for (let i = 0; i < count; i++) {
      const geometry = new THREE.SphereGeometry(size, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
      });
      const particle = new THREE.Mesh(geometry, material);

      // Position at tile center
      particle.position.set(position[0], position[1], position[2]);

      // Random outward velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI - Math.PI / 2;
      const vel = {
        x: Math.cos(theta) * Math.cos(phi) * speed * (0.5 + Math.random()),
        y: Math.sin(phi) * speed * (0.5 + Math.random()),
        z: Math.sin(theta) * Math.cos(phi) * speed * (0.5 + Math.random()),
      };

      // Add slight outward push from sphere center
      const norm = Math.sqrt(
        position[0] ** 2 + position[1] ** 2 + position[2] ** 2,
      );
      if (norm > 0) {
        vel.x += (position[0] / norm) * speed * 0.5;
        vel.y += (position[1] / norm) * speed * 0.5;
        vel.z += (position[2] / norm) * speed * 0.5;
      }

      particle.userData = {
        velocity: vel,
        life: 1.0,
        decay: type === "capture" ? 0.025 : 0.02,
      };

      sphereGroupRef.current.add(particle);
      particlesRef.current.push(particle);
    }
  }, []);

  // Get player centroid for camera rotation
  const getPlayerCentroid = useCallback((player, states, data) => {
    if (!data) return null;
    const tiles = states
      .map((s, i) => ({ s, i }))
      .filter((t) => t.s === player);
    if (tiles.length === 0) return null;

    const c = [0, 0, 0];
    tiles.forEach((t) => {
      const pos = data.facePositions[t.i];
      c[0] += pos[0];
      c[1] += pos[1];
      c[2] += pos[2];
    });
    c[0] /= tiles.length;
    c[1] /= tiles.length;
    c[2] /= tiles.length;
    const len = Math.sqrt(c[0] * c[0] + c[1] * c[1] + c[2] * c[2]);
    return len > 0 ? [c[0] / len, c[1] / len, c[2] / len] : [0, 0, 1];
  }, []);

  // Rotate to face point
  const rotateToFace = useCallback((point) => {
    if (!point || !sphereGroupRef.current) return;
    const targetY = -Math.atan2(point[0], point[2]);
    const targetX = Math.asin(Math.max(-1, Math.min(1, point[1])));

    // Animate rotation
    const group = sphereGroupRef.current;
    const startX = group.rotation.x;
    const startY = group.rotation.y;
    let t = 0;

    const animateRotation = () => {
      t += 0.05;
      if (t >= 1) {
        group.rotation.x = targetX;
        group.rotation.y = targetY;
        return;
      }
      group.rotation.x = startX + (targetX - startX) * t;
      group.rotation.y = startY + (targetY - startY) * t;
      requestAnimationFrame(animateRotation);
    };
    animateRotation();
  }, []);

  // Check for encirclement captures - captures entire surrounded neutral areas
  const checkCaptures = useCallback((states, neighborMap) => {
    let newStates = [...states];
    let changed = true;

    // Keep checking until no more captures are possible
    while (changed) {
      changed = false;

      // Check for each player if they've surrounded any neutral areas
      for (const player of ["red", "blue"]) {
        const opponent = player === "red" ? "blue" : "red";
        const visited = new Set();

        // Check each empty tile to see if it's part of a surrounded area
        for (let i = 0; i < newStates.length; i++) {
          if (newStates[i] !== "empty" || visited.has(i)) continue;

          // Find all connected empty tiles (flood fill)
          const group = [];
          const queue = [i];
          const boundaryTiles = new Set(); // Tiles bordering this empty area

          while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;

            if (newStates[current] === "empty") {
              visited.add(current);
              group.push(current);

              // Check all neighbors
              for (const neighbor of neighborMap[current] || []) {
                if (newStates[neighbor] === "empty" && !visited.has(neighbor)) {
                  // Continue flood fill into empty neighbors
                  queue.push(neighbor);
                } else if (
                  newStates[neighbor] !== "empty" &&
                  newStates[neighbor] !== "eliminated"
                ) {
                  // Track what colors border this empty area
                  boundaryTiles.add(newStates[neighbor]);
                }
              }
            }
          }

          // If this empty area is completely surrounded by one player, capture it
          // The area must touch the player and NOT touch the opponent
          if (
            group.length > 0 &&
            boundaryTiles.has(player) &&
            !boundaryTiles.has(opponent)
          ) {
            // Capture the entire surrounded area
            for (const idx of group) {
              newStates[idx] = player;
              changed = true;
            }
          }
        }

        // If we made captures, restart from the beginning to check for cascading captures
        if (changed) break;
      }
    }
    return newStates;
  }, []);

  // Initialize game state
  const initGame = useCallback((type, subs, startTiles) => {
    const data = generateSphere(type, subs);
    setPolyData(data);

    const neighborMap = data.faces.map((_, idx) =>
      getNeighbors(idx, data.faces),
    );
    setNeighbors(neighborMap);

    const states = new Array(data.faces.length).fill("empty");
    const facesByY = data.facePositions
      .map((pos, idx) => ({ idx, y: pos[1] }))
      .sort((a, b) => b.y - a.y);

    const maxStart = Math.floor(facesByY.length / 3);
    const actualStart = Math.min(startTiles, maxStart);

    for (let i = 0; i < actualStart; i++) {
      states[facesByY[i].idx] = "red";
      states[facesByY[facesByY.length - 1 - i].idx] = "blue";
    }

    setTileStates(states);
    setCurrentPlayer("red");
    setSelectedTile(null);
    setGameOver(false);
    setWinner(null);
    setMessage("Red's turn: Select a tile");
    setTurnCount(0);
    aiThinkingRef.current = false;
    setAiThinking(false);
    prevTileStatesRef.current = [];
    moveHistoryRef.current = [];

    // Reset animation states
    tileAnimationsRef.current = [];

    // Clean up particles
    particlesRef.current.forEach((particle) => {
      if (sphereGroupRef.current) {
        sphereGroupRef.current.remove(particle);
      }
      particle.geometry.dispose();
      particle.material.dispose();
    });
    particlesRef.current = [];

    return { data, states, neighborMap };
  }, []);

  // Three.js setup
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = zoom;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);
    sphereGroupRef.current = sphereGroup;

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (cameraRef.current) {
        cameraRef.current.position.z = zoomRef.current;
      }
      renderer.render(scene, camera);
    };
    animate();

    const { data, states } = initGame("goldberg", 2, 3);
    setIsInitialized(true);

    // Initialize statistics
    gameStatsRef.current = [
      {
        turn: 0,
        red: states.filter((s) => s === "red").length,
        blue: states.filter((s) => s === "blue").length,
        empty: states.filter((s) => s === "empty").length,
        eliminated: 0,
        player: null,
        action: "start",
      },
    ];

    // Initial camera position
    setTimeout(() => {
      const centroid = getPlayerCentroid("red", states, data);
      if (centroid) rotateToFace(centroid);
    }, 100);

    // Handle resize with both window resize and container size observer
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (width > 0 && height > 0) {
        const aspect = width / height;
        cameraRef.current.aspect = aspect;

        // Adjust FOV based on aspect ratio for optimal sphere fitting
        // Wider screens use smaller FOV, narrower screens use larger FOV
        const baseFOV = 50;
        if (aspect < 1) {
          // Portrait mode - increase FOV to fit sphere
          cameraRef.current.fov = baseFOV * (1 + (1 - aspect) * 0.3);
        } else {
          // Landscape mode - use base or slightly reduced FOV
          cameraRef.current.fov = baseFOV / Math.pow(aspect, 0.15);
        }

        cameraRef.current.updateProjectionMatrix();

        rendererRef.current.setSize(width, height);
      }
    };

    // Use ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Also listen to window resize as fallback
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();

      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      if (colorAnimationIdRef.current)
        cancelAnimationFrame(colorAnimationIdRef.current);
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

      // Clean up particles
      particlesRef.current.forEach((particle) => {
        particle.geometry.dispose();
        particle.material.dispose();
      });
      particlesRef.current = [];

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Create meshes when polyData changes
  useEffect(() => {
    if (!polyData || !sphereGroupRef.current || !isInitialized) return;

    const sphereGroup = sphereGroupRef.current;

    meshesRef.current.forEach((mesh) => {
      sphereGroup.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    });
    meshesRef.current = [];

    const { vertices, faces, facePositions } = polyData;

    faces.forEach((face, faceIdx) => {
      const faceVertices = face.map((vi) => new THREE.Vector3(...vertices[vi]));
      const center = new THREE.Vector3(...facePositions[faceIdx]);

      const scaledVertices = faceVertices.map((v) => {
        const dir = v.clone().sub(center).normalize();
        return v.clone().sub(dir.multiplyScalar(0.02));
      });

      const geometry = new THREE.BufferGeometry();
      const positions = [center.x * 0.98, center.y * 0.98, center.z * 0.98];

      scaledVertices.forEach((v) => positions.push(v.x, v.y, v.z));

      const indices = [];
      for (let i = 0; i < scaledVertices.length; i++) {
        indices.push(0, i + 1, ((i + 1) % scaledVertices.length) + 1);
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      const material = new THREE.MeshPhongMaterial({
        color: COLORS.empty,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 1,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData = { faceIdx };
      sphereGroup.add(mesh);
      meshesRef.current.push(mesh);

      // Initialize animation state for this tile
      tileAnimationsRef.current[faceIdx] = {
        currentColor: new THREE.Color(COLORS.empty),
        targetColor: new THREE.Color(COLORS.empty),
        pulseTime: 0,
        isPulsing: false,
        flashIntensity: 0,
      };
    });
  }, [polyData, isInitialized]);

  // Get eliminatable tile for a specific source
  const getEliminatableFromTile = useCallback(
    (sourceIdx, states) => {
      if (!polyData || states[sourceIdx] !== currentPlayer) return null;

      const sourcePos = polyData.facePositions[sourceIdx];
      const antipodal = [-sourcePos[0], -sourcePos[1], -sourcePos[2]];

      const numFaces = polyData.faces.length;
      const avgTileRadius = Math.sqrt((4 * Math.PI) / numFaces) / 2;
      const exactThreshold = avgTileRadius * 1.5;

      let closestIdx = -1;
      let closestDist = Infinity;

      states.forEach((s, idx) => {
        if (s !== "empty") return;
        const pos = polyData.facePositions[idx];
        const dist = Math.sqrt(
          Math.pow(pos[0] - antipodal[0], 2) +
            Math.pow(pos[1] - antipodal[1], 2) +
            Math.pow(pos[2] - antipodal[2], 2),
        );
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });

      if (closestIdx !== -1) {
        if (exactElimination) {
          return closestDist < exactThreshold ? closestIdx : null;
        }
        return closestIdx;
      }
      return null;
    },
    [polyData, currentPlayer, exactElimination],
  );

  // Detect state changes and trigger animations
  useEffect(() => {
    if (meshesRef.current.length === 0 || tileStates.length === 0 || !polyData)
      return;

    const prevStates = prevTileStatesRef.current;
    const eliminatableIdx =
      selectedTile !== null
        ? getEliminatableFromTile(selectedTile, tileStates)
        : null;

    // Get all eliminatable tiles for current player to highlight them
    const allEliminatableTiles = getEliminatable(
      currentPlayer,
      tileStates,
      polyData,
      exactElimination,
    );
    const eliminatableSet = new Set(allEliminatableTiles.map((e) => e.target));

    tileStates.forEach((state, faceIdx) => {
      const anim = tileAnimationsRef.current[faceIdx];
      if (!anim) return;

      const prevState = prevStates[faceIdx];

      // Detect capture (state changed to red/blue from something else)
      if (prevState !== undefined && prevState !== state) {
        if (state === "red" || state === "blue") {
          // Trigger pulse animation for captures
          anim.isPulsing = true;
          anim.pulseTime = 0;
          anim.flashIntensity = 1.0;

          // Spawn capture particles
          const pos = polyData.facePositions[faceIdx];
          const color = state === "red" ? 0xff6b6b : 0x6b9fff;
          spawnParticles(pos, color, "capture");
        } else if (state === "eliminated" && prevState === "empty") {
          // Spawn elimination particles
          const pos = polyData.facePositions[faceIdx];
          spawnParticles(pos, 0x888888, "eliminate");
        }
      }

      // Calculate target color
      let targetHex = COLORS.empty;
      const isEliminatable = eliminatableSet.has(faceIdx) && state === "empty";

      if (faceIdx === selectedTile) {
        targetHex = COLORS.selected;
      } else if (state === "red") {
        targetHex = COLORS.red;
      } else if (state === "blue") {
        targetHex = COLORS.blue;
      } else if (state === "eliminated") {
        targetHex = COLORS.eliminated;
      } else if (selectedTile !== null && state === "empty") {
        if (neighbors[selectedTile]?.includes(faceIdx)) {
          targetHex = COLORS.validMove;
        } else if (faceIdx === eliminatableIdx) {
          targetHex = COLORS.eliminatable;
        }
      } else if (isEliminatable) {
        // Highlight eliminatable tiles even when no tile is selected
        targetHex = COLORS.eliminatable;
      }

      // Mark eliminatable tiles for pulsing animation
      anim.isEliminatable = isEliminatable;

      anim.targetColor.setHex(targetHex);
    });

    prevTileStatesRef.current = [...tileStates];
  }, [
    tileStates,
    selectedTile,
    neighbors,
    getEliminatableFromTile,
    polyData,
    spawnParticles,
    currentPlayer,
    exactElimination,
  ]);

  // Animation loop for smooth color transitions and pulse effects
  useEffect(() => {
    if (meshesRef.current.length === 0) return;

    const animateColors = () => {
      let needsUpdate = false;

      meshesRef.current.forEach((mesh) => {
        const faceIdx = mesh.userData.faceIdx;
        const anim = tileAnimationsRef.current[faceIdx];
        const state = tileStates[faceIdx];

        if (!anim) return;

        // Handle eliminated tiles
        if (state === "eliminated") {
          mesh.visible = false;
          return;
        }
        mesh.visible = true;

        // Smooth color lerp
        const lerpSpeed = 0.12;
        anim.currentColor.lerp(anim.targetColor, lerpSpeed);

        // Check if still transitioning
        const colorDist =
          Math.abs(anim.currentColor.r - anim.targetColor.r) +
          Math.abs(anim.currentColor.g - anim.targetColor.g) +
          Math.abs(anim.currentColor.b - anim.targetColor.b);
        if (colorDist > 0.01) {
          needsUpdate = true;
        }

        // Pulse animation for captured tiles
        let scale = 1;
        let emissiveIntensity = 0;

        if (anim.isPulsing) {
          anim.pulseTime += 0.08;

          // Scale pulse: grows then shrinks
          scale = 1 + Math.sin(anim.pulseTime * 2) * 0.15;

          // Emissive glow during pulse
          emissiveIntensity = Math.sin(anim.pulseTime * 2) * 0.4;

          if (anim.pulseTime > Math.PI) {
            anim.isPulsing = false;
            anim.pulseTime = 0;
          }
          needsUpdate = true;
        }

        // Continuous pulse for eliminatable tiles
        if (anim.isEliminatable && state === "empty") {
          if (!anim.eliminatablePulseTime) {
            anim.eliminatablePulseTime = Math.random() * Math.PI * 2; // Random start phase
          }
          anim.eliminatablePulseTime += 0.03;

          // Gentle pulse for eliminatable tiles
          const pulse = Math.sin(anim.eliminatablePulseTime) * 0.5 + 0.5; // 0 to 1
          scale = 1 + pulse * 0.08;

          // Gentle orange glow
          emissiveIntensity = Math.max(emissiveIntensity, pulse * 0.3);

          needsUpdate = true;
        } else {
          anim.eliminatablePulseTime = 0;
        }

        // Flash effect (white flash on capture)
        if (anim.flashIntensity > 0) {
          anim.flashIntensity -= 0.08;
          if (anim.flashIntensity < 0) anim.flashIntensity = 0;
          needsUpdate = true;
        }

        // Apply color with flash
        const flashColor = new THREE.Color(1, 1, 1);
        const displayColor = anim.currentColor
          .clone()
          .lerp(flashColor, anim.flashIntensity * 0.5);

        mesh.material.color.copy(displayColor);

        // Use orange emissive for eliminatable tiles, white for others
        if (anim.isEliminatable && state === "empty") {
          // Orange glow for eliminatable tiles (matching COLORS.eliminatable)
          mesh.material.emissive.setRGB(
            0.976 * emissiveIntensity,
            0.451 * emissiveIntensity,
            0.086 * emissiveIntensity,
          );
        } else {
          mesh.material.emissive.setRGB(
            emissiveIntensity,
            emissiveIntensity,
            emissiveIntensity,
          );
        }
        mesh.scale.setScalar(scale);
      });

      // Update particles
      const particlesToRemove = [];
      particlesRef.current.forEach((particle, index) => {
        const data = particle.userData;

        // Move particle
        particle.position.x += data.velocity.x;
        particle.position.y += data.velocity.y;
        particle.position.z += data.velocity.z;

        // Apply slight gravity (toward sphere center creates nice effect)
        data.velocity.y -= 0.0005;

        // Fade out
        data.life -= data.decay;
        particle.material.opacity = data.life * 0.7;

        // Shrink slightly
        const shrink = 0.97;
        particle.scale.multiplyScalar(shrink);

        if (data.life <= 0) {
          particlesToRemove.push(index);
        } else {
          needsUpdate = true;
        }
      });

      // Remove dead particles (reverse order to preserve indices)
      particlesToRemove.reverse().forEach((index) => {
        const particle = particlesRef.current[index];
        if (sphereGroupRef.current) {
          sphereGroupRef.current.remove(particle);
        }
        particle.geometry.dispose();
        particle.material.dispose();
        particlesRef.current.splice(index, 1);
      });

      colorAnimationIdRef.current = requestAnimationFrame(animateColors);
    };

    animateColors();

    return () => {
      if (colorAnimationIdRef.current) {
        cancelAnimationFrame(colorAnimationIdRef.current);
      }
    };
  }, [tileStates]);

  // Check if player can move
  const canMove = useCallback(
    (player, states) => {
      const moves = getValidMoves(player, states, neighbors);
      const elims = getEliminatable(player, states, polyData, exactElimination);
      return moves.length > 0 || elims.length > 0;
    },
    [neighbors, polyData, exactElimination],
  );

  // Execute a move (used by both human and AI)
  const executeMove = useCallback(
    (action, player, currentStates) => {
      let newStates = [...currentStates];
      const opponent = player === "red" ? "blue" : "red";
      let captured = false;

      if (action.type === "move") {
        newStates[action.from] = "empty";
        newStates[action.to] = player;

        (neighbors[action.to] || []).forEach((idx) => {
          if (newStates[idx] === opponent) {
            newStates[idx] = player;
            captured = true;
          }
        });

        playSound(captured ? "capture" : "move");
      } else if (action.type === "eliminate") {
        newStates[action.target] = "eliminated";
        playSound("eliminate");
      }

      // Check for territory captures (surrounded areas)
      const tilesBeforeCapture = newStates.filter((s) => s === player).length;
      newStates = checkCaptures(newStates, neighbors);
      const tilesAfterCapture = newStates.filter((s) => s === player).length;
      const territoryCaptured = tilesAfterCapture - tilesBeforeCapture;

      // If we captured territory, play a special sound
      if (territoryCaptured > 0) {
        playSound("capture");
      }
      setTurnCount((t) => t + 1);

      const nextPlayer = player === "red" ? "blue" : "red";

      if (!canMove(nextPlayer, newStates)) {
        setGameOver(true);
        setWinner(player);
        setMessage(`${player === "red" ? "Red" : "Blue"} wins!`);
        playSound("win");
      } else {
        setCurrentPlayer(nextPlayer);
        setMessage(`${nextPlayer === "red" ? "Red" : "Blue"}'s turn`);

        if (autoRotate) {
          const centroid = getPlayerCentroid(nextPlayer, newStates, polyData);
          if (centroid) rotateToFace(centroid);
        }
      }

      // Reset AI thinking flag BEFORE updating states to allow next AI turn to trigger
      aiThinkingRef.current = false;
      setAiThinking(false);

      setTileStates(newStates);
      setSelectedTile(null);

      // Record statistics
      gameStatsRef.current.push({
        turn: turnCount + 1,
        red: newStates.filter((s) => s === "red").length,
        blue: newStates.filter((s) => s === "blue").length,
        empty: newStates.filter((s) => s === "empty").length,
        eliminated: newStates.filter((s) => s === "eliminated").length,
        player: player,
        action: action.type,
      });
    },
    [
      neighbors,
      checkCaptures,
      canMove,
      playSound,
      autoRotate,
      getPlayerCentroid,
      polyData,
      rotateToFace,
    ],
    [
      neighbors,
      checkCaptures,
      canMove,
      playSound,
      autoRotate,
      getPlayerCentroid,
      polyData,
      rotateToFace,
    ],
  );

  // AI turn effect
  useEffect(() => {
    if (
      gameOver ||
      aiThinkingRef.current ||
      !polyData ||
      neighbors.length === 0
    ) {
      return;
    }

    const playerType = currentPlayer === "red" ? redPlayer : bluePlayer;

    if (playerType !== "human") {
      // Clear any existing timeout before creating a new one
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }

      aiThinkingRef.current = true;
      setAiThinking(true);
      setMessage(`${currentPlayer === "red" ? "Red" : "Blue"}'s turn`);

      const statesSnapshot = [...tileStates];
      const playerSnapshot = currentPlayer;

      aiTimeoutRef.current = setTimeout(() => {
        const action = makeAIMove(
          playerType,
          playerSnapshot,
          statesSnapshot,
          neighbors,
          polyData,
          exactElimination,
          moveHistoryRef.current,
        );

        if (action) {
          // Track this move in history
          const actionSig =
            action.type === "move"
              ? `move:${action.from}-${action.to}`
              : `eliminate:${action.target}`;
          moveHistoryRef.current.push(actionSig);
          // Keep only last 10 moves
          if (moveHistoryRef.current.length > 10) {
            moveHistoryRef.current.shift();
          }
          executeMove(action, playerSnapshot, statesSnapshot);
        } else {
          const opponent = playerSnapshot === "red" ? "blue" : "red";
          setGameOver(true);
          setWinner(opponent);
          setMessage(`${opponent === "red" ? "Red" : "Blue"} wins!`);
          aiThinkingRef.current = false;
          setAiThinking(false);
        }
      }, 400);
    }

    // Cleanup function to clear timeout when effect re-runs or unmounts
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
      }
    };
  }, [
    currentPlayer,
    redPlayer,
    bluePlayer,
    gameOver,
    tileStates,
    neighbors,
    polyData,
    exactElimination,
  ]);

  // Mouse/touch handlers
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragMoved.current = false;
    prevMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !sphereGroupRef.current) return;

    const dx = e.clientX - prevMouse.current.x;
    const dy = e.clientY - prevMouse.current.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragMoved.current = true;
    }

    sphereGroupRef.current.rotation.y += dx * 0.01;
    sphereGroupRef.current.rotation.x += dy * 0.01;

    prevMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleClick = (e) => {
    if (dragMoved.current) return;
    if (
      !rendererRef.current ||
      !cameraRef.current ||
      gameOver ||
      aiThinkingRef.current
    )
      return;

    const playerType = currentPlayer === "red" ? redPlayer : bluePlayer;
    if (playerType !== "human") return;

    const rect = rendererRef.current.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const intersects = raycaster.intersectObjects(meshesRef.current);
    if (intersects.length > 0) {
      handleTileClick(intersects[0].object.userData.faceIdx);
    }
  };

  const handleTileClick = (faceIdx) => {
    const state = tileStates[faceIdx];

    // Check if this tile can be eliminated directly (without selecting a tile first)
    if (selectedTile === null && state === "empty") {
      const allEliminatableTiles = getEliminatable(
        currentPlayer,
        tileStates,
        polyData,
        exactElimination,
      );
      const isEliminatable = allEliminatableTiles.some(
        (e) => e.target === faceIdx,
      );

      if (isEliminatable) {
        executeMove(
          { type: "eliminate", target: faceIdx },
          currentPlayer,
          tileStates,
        );
        return;
      }
    }

    if (selectedTile === null) {
      if (state === currentPlayer) {
        setSelectedTile(faceIdx);
        setMessage(
          `${currentPlayer === "red" ? "Red" : "Blue"}: Choose move or eliminate`,
        );
        playSound("select");
      }
      return;
    }

    if (faceIdx === selectedTile) {
      setSelectedTile(null);
      setMessage(`${currentPlayer === "red" ? "Red" : "Blue"}'s turn`);
      return;
    }

    if (state === currentPlayer) {
      setSelectedTile(faceIdx);
      playSound("select");
      return;
    }

    const isValidMove =
      neighbors[selectedTile]?.includes(faceIdx) && state === "empty";
    const eliminatableIdx = getEliminatableFromTile(selectedTile, tileStates);

    if (isValidMove) {
      executeMove(
        { type: "move", from: selectedTile, to: faceIdx },
        currentPlayer,
        tileStates,
      );
    } else if (faceIdx === eliminatableIdx) {
      executeMove(
        { type: "eliminate", target: faceIdx },
        currentPlayer,
        tileStates,
      );
    } else {
      setSelectedTile(null);
      setMessage(`${currentPlayer === "red" ? "Red" : "Blue"}'s turn`);
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      dragMoved.current = false;
      prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      // Pinch zoom
      isDragging.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistance.current = Math.sqrt(dx * dx + dy * dy);
      pinchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && pinchStartDistance.current !== null) {
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = pinchStartDistance.current / distance;
      const newZoom = Math.max(
        minZoom,
        Math.min(maxZoom, pinchStartZoom.current * scale),
      );
      setZoom(newZoom);
      e.preventDefault();
      return;
    }

    if (
      !isDragging.current ||
      !sphereGroupRef.current ||
      e.touches.length !== 1
    )
      return;

    const dx = e.touches[0].clientX - prevMouse.current.x;
    const dy = e.touches[0].clientY - prevMouse.current.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragMoved.current = true;
    }

    sphereGroupRef.current.rotation.y += dx * 0.01;
    sphereGroupRef.current.rotation.x += dy * 0.01;

    prevMouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    e.preventDefault();
  };

  const handleTouchEnd = (e) => {
    // Reset pinch tracking
    if (e.touches.length < 2) {
      pinchStartDistance.current = null;
      pinchStartZoom.current = null;
    }

    if (!dragMoved.current && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      if (
        !rendererRef.current ||
        !cameraRef.current ||
        gameOver ||
        aiThinkingRef.current
      ) {
        isDragging.current = false;
        return;
      }

      const playerType = currentPlayer === "red" ? redPlayer : bluePlayer;
      if (playerType !== "human") {
        isDragging.current = false;
        return;
      }

      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((touch.clientX - rect.left) / rect.width) * 2 - 1,
        -((touch.clientY - rect.top) / rect.height) * 2 + 1,
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObjects(meshesRef.current);
      if (intersects.length > 0) {
        handleTileClick(intersects[0].object.userData.faceIdx);
      }
    }
    isDragging.current = false;
  };

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY * 0.001;
      setZoom((prevZoom) =>
        Math.max(minZoom, Math.min(maxZoom, prevZoom + delta)),
      );
    },
    [minZoom, maxZoom],
  );

  // Zoom button handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.max(minZoom, prevZoom - 0.3));
  }, [minZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.min(maxZoom, prevZoom + 0.3));
  }, [maxZoom]);

  const handleResetZoom = useCallback(() => {
    setZoom(2.5);
  }, []);

  // Update zoom ref when zoom state changes
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sphereGroupRef.current) return;
      const speed = 0.1;

      switch (e.key) {
        case "ArrowLeft":
        case "a":
          sphereGroupRef.current.rotation.y -= speed;
          break;
        case "ArrowRight":
        case "d":
          sphereGroupRef.current.rotation.y += speed;
          break;
        case "ArrowUp":
        case "w":
          sphereGroupRef.current.rotation.x -= speed;
          break;
        case "ArrowDown":
        case "s":
          sphereGroupRef.current.rotation.x += speed;
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Apply settings / new game
  const applySettings = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    if (sphereGroupRef.current) sphereGroupRef.current.rotation.set(0, 0, 0);

    const { data, states } = initGame(sphereType, subdivisions, startingTiles);

    // Reset statistics
    gameStatsRef.current = [
      {
        turn: 0,
        red: states.filter((s) => s === "red").length,
        blue: states.filter((s) => s === "blue").length,
        empty: states.filter((s) => s === "empty").length,
        eliminated: 0,
        player: null,
        action: "start",
      },
    ];

    setTimeout(() => {
      const centroid = getPlayerCentroid("red", states, data);
      if (centroid) rotateToFace(centroid);
    }, 100);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden fade-in">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
        <h1
          className="text-xl sm:text-2xl font-black"
          style={{
            background: "linear-gradient(to right, #ef4444, #3b82f6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Red vs Blue
        </h1>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-3 py-1.5 glass rounded-lg hover:bg-white/20 transition-colors font-semibold ${showStats ? "text-purple-400 bg-purple-500/20" : "text-purple-300"}`}
            title="Toggle Statistics Panel"
          >
            📊 Stats {showStats ? "▼" : "▶"}
          </button>
          <span>
            Turn: <span className="text-white font-bold">{turnCount + 1}</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden md:inline">
            <span className="text-red-400 font-bold">
              {tileStates.filter((s) => s === "red").length}
            </span>{" "}
            red
          </span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline">
            <span className="text-blue-400 font-bold">
              {tileStates.filter((s) => s === "blue").length}
            </span>{" "}
            blue
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            <span className="text-gray-300 font-bold">
              {tileStates.filter((s) => s === "empty").length}
            </span>{" "}
            empty
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            <span className="text-gray-500 font-bold">
              {tileStates.filter((s) => s === "eliminated").length}
            </span>{" "}
            eliminated
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Game Info & Controls */}
        <div
          className={`flex flex-col gap-2 p-2 lg:p-3 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 transition-all ${showStats ? "lg:w-64" : "lg:w-72"}`}
        >
          {/* Score Board */}
          <div className="flex lg:flex-col gap-2">
            {/* Red Player */}
            <div
              className={`score-badge flex-1 p-2 transition-all duration-300 ${
                currentPlayer === "red" && !gameOver ? "active active-red" : ""
              }`}
            >
              <div className="flex lg:flex-col items-center lg:items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50"></div>
                <div className="flex-1">
                  <div className="text-red-400 font-bold text-xs uppercase">
                    Red
                  </div>
                  <div className="text-xl lg:text-2xl font-black text-white">
                    {tileStates.filter((s) => s === "red").length}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {redPlayer === "human" ? "👤 Human" : "🤖 Computer"}
                  </div>
                </div>
              </div>
            </div>

            {/* Blue Player */}
            <div
              className={`score-badge flex-1 p-2 transition-all duration-300 ${
                currentPlayer === "blue" && !gameOver
                  ? "active active-blue"
                  : ""
              }`}
            >
              <div className="flex lg:flex-col items-center lg:items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50"></div>
                <div className="flex-1">
                  <div className="text-blue-400 font-bold text-xs uppercase">
                    Blue
                  </div>
                  <div className="text-xl lg:text-2xl font-black text-white">
                    {tileStates.filter((s) => s === "blue").length}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {bluePlayer === "human" ? "👤 Human" : "🤖 Computer"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="card-elevated p-2">
            {gameOver ? (
              <div className="text-center">
                <div className="text-lg font-black mb-1">
                  {winner === "red" ? "🔴" : "🔵"}
                  <span
                    className={
                      winner === "red"
                        ? "text-gradient-red"
                        : "text-gradient-blue"
                    }
                  >
                    {" "}
                    {winner === "red" ? "Red" : "Blue"} Wins!
                  </span>
                </div>
                <div className="text-purple-300 text-xs">
                  Victory in {turnCount} turns
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-xs lg:text-sm font-semibold text-gray-200">
                  {message}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-2">
            {selectedTile !== null && !gameOver && !aiThinking && (
              <button
                onClick={() => {
                  setSelectedTile(null);
                  setMessage(
                    `${currentPlayer === "red" ? "Red" : "Blue"}'s turn`,
                  );
                }}
                className="btn-secondary text-xs py-2"
              >
                ✕ Cancel Selection
              </button>
            )}
            {gameOver && (
              <>
                <button
                  onClick={applySettings}
                  className="btn-primary text-xs py-2.5"
                >
                  🎮 New Game
                </button>
                {onReturnToMenu && (
                  <button
                    onClick={onReturnToMenu}
                    className="btn-secondary text-xs py-2"
                  >
                    ← Menu
                  </button>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  autoRotate
                    ? "bg-cyan-600 text-white"
                    : "bg-slate-700 text-gray-300"
                }`}
                title={
                  autoRotate ? "Auto-focus enabled" : "Auto-focus disabled"
                }
              >
                {autoRotate ? "🎯" : "🎯"}
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  soundEnabled
                    ? "bg-green-600 text-white"
                    : "bg-slate-700 text-gray-300"
                }`}
                title={soundEnabled ? "Sound enabled" : "Sound disabled"}
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
            </div>
          </div>

          {/* Settings Panel - Compact */}
          <details className="card-elevated">
            <summary className="cursor-pointer text-gray-300 hover:text-white font-semibold text-sm flex items-center gap-2 p-2 -m-2">
              ⚙️ Settings & Legend
            </summary>
            <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
              {/* Legend */}
              <div>
                <h4 className="text-white font-bold text-xs mb-2">
                  🎨 Tile Colors
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-red-500 to-red-600"></div>
                    <span className="text-gray-300">Red</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-blue-600"></div>
                    <span className="text-gray-300">Blue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-300"></div>
                    <span className="text-gray-300">Empty</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-yellow-400"></div>
                    <span className="text-gray-300">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span className="text-gray-300">Move</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    <span className="text-gray-300">Eliminate</span>
                  </div>
                </div>
              </div>

              {/* Player Selection */}
              <div>
                <h4 className="text-white font-bold text-xs mb-2">
                  👥 Players
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-red-400 text-xs font-bold block mb-1">
                      🔴 Red
                    </label>
                    <select
                      value={redPlayer}
                      onChange={(e) => setRedPlayer(e.target.value)}
                      className="input-select w-full text-xs py-1.5"
                    >
                      <option value="human">👤 Human</option>
                      <option value="computer">🤖 Computer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-blue-400 text-xs font-bold block mb-1">
                      🔵 Blue
                    </label>
                    <select
                      value={bluePlayer}
                      onChange={(e) => setBluePlayer(e.target.value)}
                      className="input-select w-full text-xs py-1.5"
                    >
                      <option value="human">👤 Human</option>
                      <option value="computer">🤖 Computer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sphere Type */}
              <div>
                <h4 className="text-white font-bold text-xs mb-2">🌐 Sphere</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(SPHERE_TYPES).map(([key, { name }]) => (
                    <button
                      key={key}
                      onClick={() => setSphereType(key)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                        sphereType === key
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                          : "glass text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Level */}
              {SPHERE_TYPES[sphereType]?.hasDetail && (
                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Detail:{" "}
                    <span className="text-purple-400 font-bold">
                      {subdivisions}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    value={subdivisions}
                    onChange={(e) => setSubdivisions(parseInt(e.target.value))}
                    className="input-range"
                  />
                </div>
              )}

              {/* Starting Tiles */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Starting Tiles:{" "}
                  <span className="text-purple-400 font-bold">
                    {startingTiles}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={startingTiles}
                  onChange={(e) => setStartingTiles(parseInt(e.target.value))}
                  className="input-range"
                />
              </div>

              {/* Elimination Mode */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Elimination Mode
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setExactElimination(true)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      exactElimination
                        ? "bg-orange-600 text-white"
                        : "bg-slate-700 text-gray-300"
                    }`}
                  >
                    🎯 Exact
                  </button>
                  <button
                    onClick={() => setExactElimination(false)}
                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      !exactElimination
                        ? "bg-orange-600 text-white"
                        : "bg-slate-700 text-gray-300"
                    }`}
                  >
                    📍 Nearest
                  </button>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applySettings}
                className="btn-primary text-xs py-2 w-full"
              >
                🎮 Apply Settings
              </button>
            </div>
          </details>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <div className="canvas-container h-full relative group">
            <div
              ref={containerRef}
              className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleClick}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            />

            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 glass rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-white font-bold text-xl"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={handleResetZoom}
                className="w-10 h-10 glass rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-white text-xs"
                title="Reset Zoom"
              >
                ⊙
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 glass rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-white font-bold text-xl"
                title="Zoom Out"
              >
                −
              </button>
            </div>
            {/* Overlay hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-gray-300 text-xs">
                🖱️ Drag to rotate • Scroll to zoom • Click tiles to play
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="lg:w-96 xl:w-[28rem] flex flex-col border-l border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-black text-gradient-purple">
                📊 Statistics
              </h2>
              <button
                onClick={() => setShowStats(false)}
                className="w-8 h-8 glass rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center text-white text-sm"
                title="Close Stats Panel"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="card-elevated p-3">
                  <div className="text-gray-400 text-xs mb-1">Total Turns</div>
                  <div className="text-2xl font-black text-white">
                    {gameStatsRef.current.length - 1}
                  </div>
                </div>
                <div className="card-elevated p-3">
                  <div className="text-gray-400 text-xs mb-1">Red Tiles</div>
                  <div className="text-2xl font-black text-red-400">
                    {tileStates.filter((s) => s === "red").length}
                  </div>
                </div>
                <div className="card-elevated p-3">
                  <div className="text-gray-400 text-xs mb-1">Blue Tiles</div>
                  <div className="text-2xl font-black text-blue-400">
                    {tileStates.filter((s) => s === "blue").length}
                  </div>
                </div>
                <div className="card-elevated p-3">
                  <div className="text-gray-400 text-xs mb-1">Eliminated</div>
                  <div className="text-2xl font-black text-gray-500">
                    {tileStates.filter((s) => s === "eliminated").length}
                  </div>
                </div>
              </div>

              {/* Charts */}
              {gameStatsRef.current.length > 1 && (
                <div className="space-y-4">
                  {/* Red vs Blue Chart */}
                  <div className="card-elevated p-3">
                    <h3 className="text-white font-bold text-sm mb-3">
                      Red vs Blue Territory
                    </h3>
                    <div className="w-full h-48">
                      <svg
                        viewBox="0 0 600 200"
                        className="w-full h-full"
                        preserveAspectRatio="none"
                      >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((y) => (
                          <line
                            key={y}
                            x1="40"
                            y1={20 + (y * 160) / 100}
                            x2="580"
                            y2={20 + (y * 160) / 100}
                            stroke="#374151"
                            strokeWidth="0.5"
                          />
                        ))}

                        {/* Y-axis labels */}
                        {[0, 25, 50, 75, 100].map((val) => (
                          <text
                            key={val}
                            x="35"
                            y={185 - (val * 160) / 100}
                            fill="#9CA3AF"
                            fontSize="10"
                            textAnchor="end"
                          >
                            {val}
                          </text>
                        ))}

                        {/* Red line */}
                        <polyline
                          points={gameStatsRef.current
                            .map((stat, i) => {
                              const x =
                                40 +
                                (i * 540) / (gameStatsRef.current.length - 1);
                              const maxTiles = polyData?.faces?.length || 100;
                              const y = 180 - (stat.red / maxTiles) * 160;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="3"
                        />

                        {/* Blue line */}
                        <polyline
                          points={gameStatsRef.current
                            .map((stat, i) => {
                              const x =
                                40 +
                                (i * 540) / (gameStatsRef.current.length - 1);
                              const maxTiles = polyData?.faces?.length || 100;
                              const y = 180 - (stat.blue / maxTiles) * 160;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="3"
                        />

                        {/* X-axis */}
                        <line
                          x1="40"
                          y1="180"
                          x2="580"
                          y2="180"
                          stroke="#4B5563"
                          strokeWidth="2"
                        />
                        <text
                          x="310"
                          y="198"
                          fill="#9CA3AF"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          Turn
                        </text>
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1 bg-red-500"></div>
                        <span className="text-gray-300 text-xs">Red</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1 bg-blue-500"></div>
                        <span className="text-gray-300 text-xs">Blue</span>
                      </div>
                    </div>
                  </div>

                  {/* Empty vs Eliminated Chart */}
                  <div className="card-elevated p-3">
                    <h3 className="text-white font-bold text-sm mb-3">
                      Empty vs Eliminated
                    </h3>
                    <div className="w-full h-48">
                      <svg
                        viewBox="0 0 600 200"
                        className="w-full h-full"
                        preserveAspectRatio="none"
                      >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((y) => (
                          <line
                            key={y}
                            x1="40"
                            y1={20 + (y * 160) / 100}
                            x2="580"
                            y2={20 + (y * 160) / 100}
                            stroke="#374151"
                            strokeWidth="0.5"
                          />
                        ))}

                        {/* Y-axis labels */}
                        {[0, 25, 50, 75, 100].map((val) => (
                          <text
                            key={val}
                            x="35"
                            y={185 - (val * 160) / 100}
                            fill="#9CA3AF"
                            fontSize="10"
                            textAnchor="end"
                          >
                            {val}
                          </text>
                        ))}

                        {/* Empty line */}
                        <polyline
                          points={gameStatsRef.current
                            .map((stat, i) => {
                              const x =
                                40 +
                                (i * 540) / (gameStatsRef.current.length - 1);
                              const maxTiles = polyData?.faces?.length || 100;
                              const y = 180 - (stat.empty / maxTiles) * 160;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#D1D5DB"
                          strokeWidth="3"
                        />

                        {/* Eliminated line */}
                        <polyline
                          points={gameStatsRef.current
                            .map((stat, i) => {
                              const x =
                                40 +
                                (i * 540) / (gameStatsRef.current.length - 1);
                              const maxTiles = polyData?.faces?.length || 100;
                              const y =
                                180 - (stat.eliminated / maxTiles) * 160;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#6B7280"
                          strokeWidth="3"
                        />

                        {/* X-axis */}
                        <line
                          x1="40"
                          y1="180"
                          x2="580"
                          y2="180"
                          stroke="#4B5563"
                          strokeWidth="2"
                        />
                        <text
                          x="310"
                          y="198"
                          fill="#9CA3AF"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          Turn
                        </text>
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1 bg-gray-300"></div>
                        <span className="text-gray-300 text-xs">Empty</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-1 bg-gray-600"></div>
                        <span className="text-gray-300 text-xs">
                          Eliminated
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Total Tiles Remaining Chart */}
                  <div className="card-elevated p-3">
                    <h3 className="text-white font-bold text-sm mb-3">
                      Tiles Remaining
                    </h3>
                    <div className="w-full h-48">
                      <svg
                        viewBox="0 0 600 200"
                        className="w-full h-full"
                        preserveAspectRatio="none"
                      >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map((y) => (
                          <line
                            key={y}
                            x1="40"
                            y1={20 + (y * 160) / 100}
                            x2="580"
                            y2={20 + (y * 160) / 100}
                            stroke="#374151"
                            strokeWidth="0.5"
                          />
                        ))}

                        {/* Y-axis labels */}
                        {[0, 25, 50, 75, 100].map((val) => (
                          <text
                            key={val}
                            x="35"
                            y={185 - (val * 160) / 100}
                            fill="#9CA3AF"
                            fontSize="10"
                            textAnchor="end"
                          >
                            {val}%
                          </text>
                        ))}

                        {/* Area fill */}
                        <polygon
                          points={`40,180 ${gameStatsRef.current
                            .map((stat, i) => {
                              const x =
                                40 +
                                (i * 540) / (gameStatsRef.current.length - 1);
                              const maxTiles = polyData?.faces?.length || 100;
                              const remaining =
                                stat.red + stat.blue + stat.empty;
                              const y = 180 - (remaining / maxTiles) * 160;
                              return `${x},${y}`;
                            })
                            .join(" ")} 580,180`}
                          fill="url(#gradient)"
                          opacity="0.3"
                        />

                        {/* Gradient definition */}
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#8B5CF6"
                              stopOpacity="1"
                            />
                            <stop
                              offset="100%"
                              stopColor="#8B5CF6"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>

                        {/* Line */}
                        <polyline
                          points={gameStatsRef.current
                            .map((stat, i) => {
                              const x =
                                40 +
                                (i * 540) / (gameStatsRef.current.length - 1);
                              const maxTiles = polyData?.faces?.length || 100;
                              const remaining =
                                stat.red + stat.blue + stat.empty;
                              const y = 180 - (remaining / maxTiles) * 160;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#8B5CF6"
                          strokeWidth="3"
                        />

                        {/* X-axis */}
                        <line
                          x1="40"
                          y1="180"
                          x2="580"
                          y2="180"
                          stroke="#4B5563"
                          strokeWidth="2"
                        />
                        <text
                          x="310"
                          y="198"
                          fill="#9CA3AF"
                          fontSize="10"
                          textAnchor="middle"
                        >
                          Turn
                        </text>
                      </svg>
                    </div>
                  </div>

                  {/* Move History Table */}
                  <div className="card-elevated p-3">
                    <h3 className="text-white font-bold text-sm mb-3">
                      Move History
                    </h3>
                    <div className="overflow-x-auto max-h-64 overflow-y-auto">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-800">
                          <tr className="text-gray-400 border-b border-white/10">
                            <th className="px-2 py-1.5 text-left">Turn</th>
                            <th className="px-2 py-1.5 text-left">Player</th>
                            <th className="px-2 py-1.5 text-left">Action</th>
                            <th className="px-2 py-1.5 text-right">R</th>
                            <th className="px-2 py-1.5 text-right">B</th>
                            <th className="px-2 py-1.5 text-right">E</th>
                            <th className="px-2 py-1.5 text-right">X</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gameStatsRef.current
                            .slice()
                            .reverse()
                            .map((stat, idx) => (
                              <tr
                                key={gameStatsRef.current.length - 1 - idx}
                                className="border-b border-white/5 hover:bg-white/5"
                              >
                                <td className="px-2 py-1.5 text-gray-300">
                                  {stat.turn}
                                </td>
                                <td className="px-2 py-1.5">
                                  {stat.player === "red" ? (
                                    <span className="text-red-400 font-semibold">
                                      🔴
                                    </span>
                                  ) : stat.player === "blue" ? (
                                    <span className="text-blue-400 font-semibold">
                                      🔵
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">▶</span>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-gray-300">
                                  {stat.action === "move"
                                    ? "↔️"
                                    : stat.action === "eliminate"
                                      ? "❌"
                                      : "🎮"}
                                </td>
                                <td className="px-2 py-1.5 text-right text-red-400 font-mono">
                                  {stat.red}
                                </td>
                                <td className="px-2 py-1.5 text-right text-blue-400 font-mono">
                                  {stat.blue}
                                </td>
                                <td className="px-2 py-1.5 text-right text-gray-400 font-mono">
                                  {stat.empty}
                                </td>
                                <td className="px-2 py-1.5 text-right text-gray-500 font-mono">
                                  {stat.eliminated}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {gameStatsRef.current.length <= 1 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-sm">No statistics yet!</p>
                  <p className="text-xs mt-2">Play some moves to see data.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
