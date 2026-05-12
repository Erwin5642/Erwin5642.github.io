import {search} from '../core/Search.js';
import {createPuzzleProblem, createRomaniaProblem} from '../problems/problemFactories.js';

function buildProblem(problemId, initialState, goalState) {
  switch (problemId) {
    case 'romania':
      return createRomaniaProblem(initialState, goalState);
    case 'puzzle':
      return createPuzzleProblem(initialState, goalState);
    default:
      throw new Error(`Unknown problem: ${problemId}`);
  }
}

self.addEventListener('message', (event) => {
  const {ticket, problemId, algorithmKey, initialState, goalState} = event.data;
  try {
    const problem = buildProblem(problemId, initialState, goalState);
    const solution = search(problem, algorithmKey);
    self.postMessage({ticket, ok: true, solution: solution ?? []});
  } catch (err) {
    self.postMessage({
      ticket,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});
