import {search} from '../core/Search.js';
import {createPuzzleProblem, createRomaniaProblem} from '../problems/problemFactories.js';

function buildProblem(problemId, initialState, goalState, heuristicKey) {
  switch (problemId) {
    case 'romania':
      return createRomaniaProblem(initialState, goalState, heuristicKey);
    case 'puzzle':
      return createPuzzleProblem(initialState, goalState, heuristicKey);
    default:
      throw new Error(`Unknown problem: ${problemId}`);
  }
}

self.addEventListener('message', (event) => {
  const {ticket, problemId, algorithmKey, initialState, goalState, heuristicKey} =
      event.data;
  try {
    const problem = buildProblem(problemId, initialState, goalState, heuristicKey);
    const solution = search(problem, algorithmKey);
    self.postMessage({ticket, ok: true, solution: solution ?? []});
  } catch (err) {
    console.error('[Search worker]', err);
    self.postMessage({
      ticket,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
