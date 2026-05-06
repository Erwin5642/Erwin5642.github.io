import {Problem} from '../core/Problem.js';
import {
  DEFAULT_ROMANIA_SOURCE,
  DEFAULT_ROMANIA_DESTINATION,
  ROMANIA_ROADS_KM,
  ROMANIA_POSITIONS_KM,
} from '../data/romaniaData.js';
import {RenderModel} from '../render/RenderModel.js';

const ROMANIA_GRAPH = Object.freeze(ROMANIA_ROADS_KM.reduce((graph, [a, b, km]) => {
  if (!graph[a]) {
    graph[a] = [];
  }
  if (!graph[b]) {
    graph[b] = [];
  }
  graph[a].push(Object.freeze({to: b, cost: km}));
  graph[b].push(Object.freeze({to: a, cost: km}));
  return graph;
}, {}));

export const romaniaProblem = new Problem({
  initialState: DEFAULT_ROMANIA_SOURCE,
  goalState: DEFAULT_ROMANIA_DESTINATION,
  isGoal: function(state) {
    return state === this.goalState;
  },
  actions: (state) => (ROMANIA_GRAPH[state] ?? []).map((edge) => edge.to),
  result: (state, action) => {
    const neighbors = ROMANIA_GRAPH[state] ?? [];
    const edge = neighbors.find((candidate) => candidate.to === action);
    return edge ? edge.to : state;
  },
  actionCost: (state, action, resultState) => {
    const neighbors = ROMANIA_GRAPH[state] ?? [];
    const edge = neighbors.find((candidate) => candidate.to === action);
    if (edge && edge.to === resultState) {
      return edge.cost;
    }
    return Number.POSITIVE_INFINITY;
  },
});

function sortedEdgeKey(a, b) {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function resetRomaniaRenderModel(problem, model) {
  if (!problem) {
    model.romaniaVisitedNodes = null;
    model.romaniaVisitedEdges = null;
    model.romaniaSolutionNodes = null;
    model.romaniaSolutionEdges = null;
    return;
  }
  model.romaniaVisitedNodes = new Set([problem.initialState]);
  model.romaniaVisitedEdges = new Set();
  model.romaniaSolutionNodes = null;
  model.romaniaSolutionEdges = null;
}

function updateRomaniaRenderModel(newState, previousState, model) {
  if (!model.romaniaVisitedNodes || !model.romaniaVisitedEdges) {
    return;
  }
  if (newState != null) {
    model.romaniaVisitedNodes.add(newState);
  }
  if (previousState != null && newState != null && previousState !== newState) {
    model.romaniaVisitedNodes.add(previousState);
    model.romaniaVisitedEdges.add(sortedEdgeKey(previousState, newState));
  }
  const goal = model.currentProblem?.goalState;
  if (goal != null && newState === goal) {
    model.romaniaSolutionNodes = new Set(model.romaniaVisitedNodes);
    model.romaniaSolutionEdges = new Set(model.romaniaVisitedEdges);
  }
}

function drawRomaniaMap(ctx, viewport, model) {
  const {widthCss, heightCss} = viewport;
  const pad = 100;
  const w = widthCss - 2 * pad;
  const h = heightCss - 2 * pad;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const {xKm, yKm} of Object.values(ROMANIA_POSITIONS_KM)) {
    minX = Math.min(minX, xKm);
    maxX = Math.max(maxX, xKm);
    minY = Math.min(minY, yKm);
    maxY = Math.max(maxY, yKm);
  }
  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);

  const toCanvas = (xKm, yKm) => ({
    x: pad + ((xKm - minX) / spanX) * w,
    y: pad + h - ((yKm - minY) / spanY) * h,
  });

  const problem = model.currentProblem;
  const source = problem?.initialState;
  const goal = problem?.goalState;
  const visitedNodes = model.romaniaVisitedNodes;
  const visitedEdges = model.romaniaVisitedEdges;
  const solutionNodes = model.romaniaSolutionNodes;
  const solutionEdges = model.romaniaSolutionEdges;
  const current = model.currentState;

  const strokeEdge = (a, b, color, width) => {
    const pa = ROMANIA_POSITIONS_KM[a];
    const pb = ROMANIA_POSITIONS_KM[b];
    if (!pa || !pb) {
      return;
    }
    const ca = toCanvas(pa.xKm, pa.yKm);
    const cb = toCanvas(pb.xKm, pb.yKm);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(ca.x, ca.y);
    ctx.lineTo(cb.x, cb.y);
    ctx.stroke();
  };

  for (const [a, b, km] of ROMANIA_ROADS_KM) {
    const key = sortedEdgeKey(a, b);
    const isOnSolution = solutionEdges?.has(key) ?? false;
    const isVisited = visitedEdges?.has(key) ?? false;
    let edgeColor = '#94a3b8';
    let edgeWidth = 1;
    if (isOnSolution) {
      edgeColor = '#2563eb';
      edgeWidth = 4.5;
    } else if (isVisited) {
      edgeColor = '#ca8a04';
      edgeWidth = 3.5;
    }
    strokeEdge(a, b, edgeColor, edgeWidth);

    const pa = ROMANIA_POSITIONS_KM[a];
    const pb = ROMANIA_POSITIONS_KM[b];
    if (!pa || !pb || typeof km !== 'number') {
      continue;
    }
    const ca = toCanvas(pa.xKm, pa.yKm);
    const cb = toCanvas(pb.xKm, pb.yKm);
    let mx = (ca.x + cb.x) / 2;
    let my = (ca.y + cb.y) / 2;
    const dx = cb.x - ca.x;
    const dy = cb.y - ca.y;
    const len = Math.hypot(dx, dy) || 1;
    const off = 35;
    mx += -(dy / len) * off;
    my += (dx / len) * off;

    const label = `${km}`;
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = 'rgba(255,255,255,0.92)';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(label, mx, my);
    let labelColor = '#334155';
    if (isOnSolution) {
      labelColor = '#1e3a8a';
    } else if (isVisited) {
      labelColor = '#854d0e';
    }
    ctx.fillStyle = labelColor;
    ctx.fillText(label, mx, my);
  }

  function nodeFill(city) {
    if (city === goal) {
      return '#ef4444';
    }
    if (city === source) {
      return '#22c55e';
    }
    if (solutionNodes?.has(city)) {
      return '#3b82f6';
    }
    if (visitedNodes?.has(city)) {
      return '#fcd34d';
    }
    return '#e8ecf0';
  }

  for (const [city, pos] of Object.entries(ROMANIA_POSITIONS_KM)) {
    const {x, y} = toCanvas(pos.xKm, pos.yKm);
    const isCurrent = city === current;
    const r = isCurrent ? 30 : 25;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = nodeFill(city);
    ctx.fill();
    ctx.strokeStyle = isCurrent ? '#1d4ed8' : '#2a2f36';
    ctx.lineWidth = isCurrent ? 2.5 : 1;
    ctx.stroke();

    ctx.fillStyle = '#1a1d21';
    ctx.font = '15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(city, x, y + r + 5);
  }
}

export const romaniaRenderModel = new RenderModel(
    resetRomaniaRenderModel,
    updateRomaniaRenderModel,
    drawRomaniaMap,
);

export const romaniaBundle = Object.freeze({
  name: 'Mapa da Romania',
  problem: romaniaProblem,
  renderModel: romaniaRenderModel,
});