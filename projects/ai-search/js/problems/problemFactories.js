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

export function createRomaniaProblem(initialState, goalState) {
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
      const currentPosition = ROMANIA_POSITIONS_KM[state];
      const destinationPosition = ROMANIA_POSITIONS_KM[this.goalState];
      if (!currentPosition || !destinationPosition) {
        return 0;
      }
      return Math.hypot(
          currentPosition.xKm - destinationPosition.xKm,
          currentPosition.yKm - destinationPosition.yKm,
      );
    },
  });
}

export function createPuzzleProblem(initialState, goalState) {
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
      const flatCurrentState = state.flat();
      const flatGoalState = this.goalState.flat();
      return flatCurrentState.reduce((count, tile, index) => {
        const isNotEmpty = tile !== 0;
        const isMisplaced = tile !== flatGoalState[index];
        return (isNotEmpty && isMisplaced) ? count + 1 : count;
      }, 0);
    },
  });
}
