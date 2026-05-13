import {Problem} from '../core/Problem.js';
import {
  ROMANIA_ROADS_KM,
  ROMANIA_POSITIONS_KM,
} from '../data/romaniaData.js';

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

const findX = (state) => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (state[i][j] === '-') return {row: i, col: j};
    }
  }
  return {row: -1, col: -1};
};

/** @type {Record<string, (state: string, goalState: string) => number>} */
const romaniaHeuristicImpl = {
  straight_line(state, goalState) {
    const currentPosition = ROMANIA_POSITIONS_KM[state];
    const destinationPosition = ROMANIA_POSITIONS_KM[goalState];
    if (!currentPosition || !destinationPosition) {
      return 0;
    }
    return Math.hypot(
        currentPosition.xKm - destinationPosition.xKm,
        currentPosition.yKm - destinationPosition.yKm,
    );
  },
  zero() {
    return 0;
  },
};

export const ROMANIA_HEURISTIC_OPTIONS = Object.freeze([
  {id: 'straight_line', label: 'Linha reta no mapa (km)'},
  {id: 'zero', label: 'Zero (h ≡ 0)'},
]);

export const ROMANIA_DEFAULT_HEURISTIC = 'straight_line';

/** @type {Record<string, (state: number[][]|string[][], goalState: number[][]|string[][]) => number>} */
const puzzleHeuristicImpl = {
  misplaced(state, goalState) {
    let count = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const t = state[i][j];
        if (t !== '-' && t !== goalState[i][j]) {
          count++;
        }
      }
    }
    return count;
  },
  manhattan(state, goalState) {
    const goalPos = new Map();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const t = goalState[r][c];
        if (t !== '-') {
          goalPos.set(t, {r, c});
        }
      }
    }
    let sum = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const t = state[r][c];
        if (t === '-') continue;
        const g = goalPos.get(t);
        if (g) {
          sum += Math.abs(r - g.r) + Math.abs(c - g.c);
        }
      }
    }
    return sum;
  },
};

export const PUZZLE_HEURISTIC_OPTIONS = Object.freeze([
  {id: 'misplaced', label: 'Peças fora do lugar'},
  {id: 'manhattan', label: 'Distância de Manhattan'},
]);

export const PUZZLE_DEFAULT_HEURISTIC = 'misplaced';

export function createRomaniaProblem(initialState, goalState, heuristicKey = ROMANIA_DEFAULT_HEURISTIC) {
  const impl = romaniaHeuristicImpl[heuristicKey] ?? romaniaHeuristicImpl[ROMANIA_DEFAULT_HEURISTIC];
  return new Problem({
    initialState,
    goalState,
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
    heuristic: function(state) {
      return impl(state, this.goalState);
    },
  });
}

export function createPuzzleProblem(initialState, goalState, heuristicKey = PUZZLE_DEFAULT_HEURISTIC) {
  const impl = puzzleHeuristicImpl[heuristicKey] ?? puzzleHeuristicImpl[PUZZLE_DEFAULT_HEURISTIC];
  return new Problem({
    initialState,
    goalState,
    isGoal: function(state) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.goalState[i][j] !== state[i][j]) return false;
        }
      }
      return true;
    },
    actions: (state) => {
      const {row, col} = findX(state);
      const res = [];
      if (col > 0) res.push('left');
      if (col < 2) res.push('right');
      if (row > 0) res.push('up');
      if (row < 2) res.push('down');
      return res;
    },
    result: (state, action) => {
      const {row: xRow, col: xCol} = findX(state);

      let newRow = xRow;
      let newCol = xCol;
      switch (action) {
        case 'left':
          newCol = xCol - 1;
          break;
        case 'right':
          newCol = xCol + 1;
          break;
        case 'up':
          newRow = xRow - 1;
          break;
        case 'down':
          newRow = xRow + 1;
          break;
      }

      const newState = state.map((r) => [...r]);
      newState[xRow][xCol] = newState[newRow][newCol];
      newState[newRow][newCol] = '-';
      return newState;
    },
    actionCost: () => 1,
    heuristic: function(state) {
      return impl(state, this.goalState);
    },
  });
}
