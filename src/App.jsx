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
  random: { name: "Random" },
  greedy: { name: "Greedy" },
  defensive: { name: "Defensive" },
  strategic: { name: "Strategic" },
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
) => {
  const moves = getValidMoves(player, states, neighborMap);
  const eliminations = getEliminatable(
    player,
    states,
    polyData,
    exactElimination,
  );
  const allActions = [...moves, ...eliminations];

  if (allActions.length === 0) return null;

  if (aiType === "random") {
    return allActions[Math.floor(Math.random() * allActions.length)];
  }

  if (aiType === "greedy") {
    let bestAction = null;
    let bestScore = -Infinity;

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
      const score = newStates.filter((s) => s === player).length;
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    return bestAction;
  }

  if (aiType === "defensive") {
    const opponent = player === "red" ? "blue" : "red";
    let bestAction = null;
    let bestScore = -Infinity;

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
      const myTiles = newStates.filter((s) => s === player).length;
      const theirMoves = getValidMoves(opponent, newStates, neighborMap).length;
      const score = myTiles * 10 - theirMoves;
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    return bestAction;
  }

  // Strategic: balanced approach
  const opponent = player === "red" ? "blue" : "red";
  let bestAction = null;
  let bestScore = -Infinity;

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

    const myTiles = newStates.filter((s) => s === player).length;
    const theirTiles = newStates.filter((s) => s === opponent).length;
    const myMoves = getValidMoves(player, newStates, neighborMap).length;
    const theirMoves = getValidMoves(opponent, newStates, neighborMap).length;

    const score = (myTiles - theirTiles) * 10 + (myMoves - theirMoves) * 2;
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  }
  return bestAction;
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

  // Refs for AI
  const aiThinkingRef = useRef(false);
  const [aiThinking, setAiThinking] = useState(false);

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

  // Check for encirclement captures
  const checkCaptures = useCallback((states, neighborMap) => {
    let newStates = [...states];
    let changed = true;

    while (changed) {
      changed = false;
      for (const player of ["red", "blue"]) {
        const visited = new Set();

        for (let i = 0; i < newStates.length; i++) {
          if (newStates[i] !== "empty" || visited.has(i)) continue;

          const group = [];
          const queue = [i];
          let touchesOpponent = false;
          let touchesPlayer = false;

          while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current)) continue;

            if (newStates[current] === "empty") {
              visited.add(current);
              group.push(current);

              for (const neighbor of neighborMap[current] || []) {
                if (newStates[neighbor] === "empty" && !visited.has(neighbor)) {
                  queue.push(neighbor);
                } else if (newStates[neighbor] === player) {
                  touchesPlayer = true;
                } else if (
                  newStates[neighbor] !== "empty" &&
                  newStates[neighbor] !== "eliminated"
                ) {
                  touchesOpponent = true;
                }
              }
            }
          }

          if (group.length > 0 && touchesPlayer && !touchesOpponent) {
            for (const idx of group) {
              newStates[idx] = player;
              changed = true;
            }
          }
        }
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
    const height = 480;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 3;
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
      renderer.render(scene, camera);
    };
    animate();

    const { data, states } = initGame("goldberg", 2, 3);
    setIsInitialized(true);

    // Initial camera position
    setTimeout(() => {
      const centroid = getPlayerCentroid("red", states, data);
      if (centroid) rotateToFace(centroid);
    }, 100);

    return () => {
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
      }

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
        mesh.material.emissive.setRGB(
          emissiveIntensity,
          emissiveIntensity,
          emissiveIntensity,
        );
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

      newStates = checkCaptures(newStates, neighbors);
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

      setTileStates(newStates);
      setSelectedTile(null);
      aiThinkingRef.current = false;
      setAiThinking(false);
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
  );

  // AI turn effect
  useEffect(() => {
    if (
      gameOver ||
      aiThinkingRef.current ||
      !polyData ||
      neighbors.length === 0
    )
      return;

    const playerType = currentPlayer === "red" ? redPlayer : bluePlayer;

    if (playerType !== "human") {
      aiThinkingRef.current = true;
      setAiThinking(true);
      setMessage(
        `${currentPlayer === "red" ? "Red" : "Blue"} (${AI_TYPES[playerType]?.name}) thinking...`,
      );

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
        );

        if (action) {
          executeMove(action, playerSnapshot, statesSnapshot);
        } else {
          const opponent = playerSnapshot === "red" ? "blue" : "red";
          setGameOver(true);
          setWinner(opponent);
          setMessage(`${opponent === "red" ? "Red" : "Blue"} wins!`);
          aiThinkingRef.current = false;
          setAiThinking(false);
        }
      }, 600);
    }
  }, [
    currentPlayer,
    redPlayer,
    bluePlayer,
    gameOver,
    tileStates,
    neighbors,
    polyData,
    exactElimination,
    executeMove,
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
    }
  };

  const handleTouchMove = (e) => {
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

    setTimeout(() => {
      const centroid = getPlayerCentroid("red", states, data);
      if (centroid) rotateToFace(centroid);
    }, 100);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen w-full fade-in">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-black mb-2 text-gradient-purple drop-shadow-2xl">
          Red vs Blue
        </h1>
        <p className="text-gray-400 text-sm sm:text-base font-medium tracking-wide">
          ✨ Spherical Territory Strategy Game ✨
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-6">
        {/* Score Board */}
        <div className="flex items-center justify-between gap-4 px-2">
          {/* Red Player */}
          <div
            className={`score-badge flex-1 max-w-[200px] transition-all duration-300 ${
              currentPlayer === "red" && !gameOver ? "active active-red" : ""
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50"></div>
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {tileStates.filter((s) => s === "red").length}
                </span>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-xs uppercase tracking-wider">
                  Red Player
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {redPlayer === "human"
                    ? "👤 Human"
                    : `🤖 ${AI_TYPES[redPlayer]?.name}`}
                </div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="flex-1 text-center px-4">
            {gameOver ? (
              <div className="win-message py-4 px-6">
                <div className="text-2xl sm:text-3xl font-black mb-2">
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
                <div className="text-purple-300 text-sm font-medium">
                  Victory in {turnCount} turns
                </div>
              </div>
            ) : (
              <div className="status-message">
                <div className="text-base sm:text-lg font-semibold text-gray-200">
                  {message}
                </div>
                {aiThinking && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Blue Player */}
          <div
            className={`score-badge flex-1 max-w-[200px] transition-all duration-300 ${
              currentPlayer === "blue" && !gameOver ? "active active-blue" : ""
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {tileStates.filter((s) => s === "blue").length}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50"></div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-xs uppercase tracking-wider">
                  Blue Player
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {bluePlayer === "human"
                    ? "👤 Human"
                    : `🤖 ${AI_TYPES[bluePlayer]?.name}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 min-h-[56px] items-center">
          {selectedTile !== null && !gameOver && !aiThinking && (
            <button
              onClick={() => {
                setSelectedTile(null);
                setMessage(
                  `${currentPlayer === "red" ? "Red" : "Blue"}'s turn`,
                );
              }}
              className="btn-secondary"
            >
              ← Cancel Selection
            </button>
          )}
          {gameOver && (
            <>
              <button onClick={applySettings} className="btn-primary">
                🎮 Play Again
              </button>
              {onReturnToMenu && (
                <button onClick={onReturnToMenu} className="btn-secondary">
                  ← Back to Menu
                </button>
              )}
            </>
          )}
        </div>

        {/* 3D Canvas */}
        <div className="canvas-container relative group">
          <div
            ref={containerRef}
            className="w-full touch-none cursor-grab active:cursor-grabbing"
            style={{ height: 520 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          {/* Overlay hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="text-gray-300 text-xs font-medium">
              🖱️ Drag to rotate • Click tiles to play
            </span>
          </div>
        </div>

        {/* Quick Controls & Info Bar */}
        <div className="card-elevated">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRotate(!autoRotate)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  autoRotate
                    ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-500"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                {autoRotate ? "🎯 Auto-Focus: ON" : "🎯 Manual"}
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  soundEnabled
                    ? "bg-green-600 text-white shadow-lg shadow-green-500/30 hover:bg-green-500"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                {soundEnabled ? "🔊 Sound: ON" : "🔇 Muted"}
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                <span className="text-gray-500">Turn:</span>{" "}
                <span className="font-bold text-white">{turnCount + 1}</span>
              </span>
              <span className="text-gray-400">
                <span className="text-gray-500">Mode:</span>{" "}
                <span className="font-bold text-purple-400">
                  {exactElimination ? "Exact" : "Nearest"}
                </span>
              </span>
              <span className="text-gray-400 hidden lg:inline">
                <span className="text-gray-500">Tiles:</span>{" "}
                <span className="font-bold text-white">
                  {polyData?.faces?.length || 0}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="card">
          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center">
            <div className="legend-item">
              <div className="legend-color bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/50"></div>
              <span>Red Tiles</span>
            </div>
            <div className="legend-item">
              <div className="legend-color bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/50"></div>
              <span>Blue Tiles</span>
            </div>
            <div className="legend-item">
              <div className="legend-color bg-gray-300"></div>
              <span>Empty</span>
            </div>
            <div className="legend-item">
              <div className="legend-color bg-yellow-400 shadow-yellow-500/50"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="legend-color bg-green-500 shadow-green-500/50"></div>
              <span>Valid Move</span>
            </div>
            <div className="legend-item">
              <div className="legend-color bg-orange-500 shadow-orange-500/50"></div>
              <span>Eliminate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="mt-8 w-full max-w-4xl">
        <details className="card-elevated">
          <summary className="cursor-pointer text-gray-300 hover:text-white font-semibold text-lg flex items-center gap-2">
            ⚙️ Game Settings & Rules
          </summary>
          <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
            {/* Player Selection */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                👥 Players
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass-strong p-4 rounded-xl">
                  <label className="text-red-400 text-sm font-bold block mb-3 flex items-center gap-2">
                    🔴 Red Player
                  </label>
                  <select
                    value={redPlayer}
                    onChange={(e) => setRedPlayer(e.target.value)}
                    className="input-select w-full"
                  >
                    <option value="human">👤 Human</option>
                    {Object.entries(AI_TYPES).map(([key, { name }]) => (
                      <option key={key} value={key}>
                        🤖 AI: {name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="glass-strong p-4 rounded-xl">
                  <label className="text-blue-400 text-sm font-bold block mb-3 flex items-center gap-2">
                    🔵 Blue Player
                  </label>
                  <select
                    value={bluePlayer}
                    onChange={(e) => setBluePlayer(e.target.value)}
                    className="input-select w-full"
                  >
                    <option value="human">👤 Human</option>
                    {Object.entries(AI_TYPES).map(([key, { name }]) => (
                      <option key={key} value={key}>
                        🤖 AI: {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sphere Type */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                🌐 Sphere Type
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SPHERE_TYPES).map(([key, { name }]) => (
                  <button
                    key={key}
                    onClick={() => setSphereType(key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      sphereType === key
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                        : "glass text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail & Starting */}
            <div className="glass-strong p-6 rounded-xl space-y-5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                🎮 Game Settings
              </h3>

              {SPHERE_TYPES[sphereType]?.hasDetail && (
                <div>
                  <label className="text-gray-300 text-sm font-medium block mb-3">
                    Detail Level:{" "}
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
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-3">
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>8</span>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-medium block mb-3">
                  Elimination Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExactElimination(true)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      exactElimination
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    🎯 Exact
                  </button>
                  <button
                    onClick={() => setExactElimination(false)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !exactElimination
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                        : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    📍 Nearest
                  </button>
                </div>
              </div>
            </div>

            {/* New Game Button */}
            <div className="flex justify-center pt-4">
              <button
                onClick={applySettings}
                className="btn-primary w-full sm:w-auto"
              >
                🎮 Start New Game
              </button>
            </div>

            {/* Rules */}
            <div className="glass-strong p-6 rounded-xl space-y-4">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                📖 How to Play
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">1.</span>
                  <div>
                    <strong className="text-white">Select:</strong> Click one of
                    your colored tiles to select it. Green highlights show valid
                    moves, orange shows elimination targets.
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">2.</span>
                  <div>
                    <strong className="text-white">Move:</strong> Move to an
                    adjacent empty tile (green). This automatically captures all
                    adjacent enemy tiles!
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">3.</span>
                  <div>
                    <strong className="text-white">Eliminate:</strong> Remove
                    the empty tile on the opposite side of the sphere (orange).
                    Strategic for blocking opponent expansion!
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">4.</span>
                  <div>
                    <strong className="text-white">Surround:</strong> Empty
                    tiles that only touch your tiles automatically become yours
                    at the end of your turn.
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-purple-400 font-bold">5.</span>
                  <div>
                    <strong className="text-white">Win:</strong> Force your
                    opponent into a position where they cannot move or eliminate
                    any tiles!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
