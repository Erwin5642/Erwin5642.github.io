class PriorityQueue {
  constructor(evaluationFunction, elements = []) {
    if (typeof evaluationFunction !== 'function') {
      throw new TypeError(
          'PriorityQueue requires evaluationFunction as first argument');
    }
    this.evaluationFunction = evaluationFunction;
    this.items = [];
    elements.forEach((element) => this.enqueue(element));
  }

  #score(node) {
    return this.evaluationFunction(node);
  }

  enqueue(element) {
    this.items.push(element);
    this.#bubbleUp(this.items.length - 1);
  }

  dequeue() {
    if (this.items.length === 0) return null;
    if (this.items.length === 1) return this.items.pop();

    const min = this.items[0];
    this.items[0] = this.items.pop();
    this.#bubbleDown(0);
    return min;
  }

  isEmpty() {
    return this.items.length === 0;
  }

  #bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.#score(this.items[parentIndex]) <=
          this.#score(this.items[index])) break;
      [this.items[parentIndex], this.items[index]] = [
        this.items[index],
        this.items[parentIndex]];
      index = parentIndex;
    }
  }

  #bubbleDown(index) {
    const length = this.items.length;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.#score(this.items[left]) <
          this.#score(this.items[smallest])) smallest = left;
      if (right < length && this.#score(this.items[right]) <
          this.#score(this.items[smallest])) smallest = right;
      if (smallest === index) break;

      [this.items[index], this.items[smallest]] = [
        this.items[smallest],
        this.items[index]];
      index = smallest;
    }
  }
}

function createSearchNode(state, parent = null, action = null, pathCost = 0) {
  return {state, parent, action, pathCost, depth: 0};
}

function rebuildSolution(goalNode) {
  if (!goalNode) return null;
  const solution = [];
  let current = goalNode;
  while (current) {
    solution.push(current.state);
    current = current.parent;
  }
  return solution.reverse();
}

function expand(problem, node) {
  const s = node.state;
  const expansion = [];
  problem.actions(s).forEach((action) => {
    const result = problem.result(s, action);
    const cost = node.pathCost + problem.actionCost(s, action, result);
    const child = createSearchNode(result, node, action, cost);
    child.depth = node.depth + 1;
    expansion.push(child);
  });
  return expansion;
}

function stateKey(state) {
  if (state == null) return String(state);
  if (typeof state === 'object') return JSON.stringify(state);
  return String(state);
}

function breadthFirstSearch(problem) {
  const initialNode = createSearchNode(problem.initialState);
  if (problem.isGoal(problem.initialState)) return initialNode;

  const frontier = [initialNode];
  const reached = new Set([stateKey(problem.initialState)]);

  while (frontier.length > 0) {
    const node = frontier.shift();
    for (const child of expand(problem, node)) {
      const s = child.state;
      const key = stateKey(s);
      if (problem.isGoal(s)) return child;
      if (!reached.has(key)) {
        reached.add(key);
        frontier.push(child);
      }
    }
  }
  return null;
}

function depthFirstSearch(problem) {
  const initialNode = createSearchNode(problem.initialState);
  const frontier = [initialNode];
  const explored = new Set();

  while (frontier.length > 0) {
    const node = frontier.pop();
    const key = stateKey(node.state);

    if (problem.isGoal(node.state)) return node;

    if (!explored.has(key)) {
      explored.add(key);
      for (const child of expand(problem, node)) {
        if (!explored.has(stateKey(child.state))) frontier.push(child);
      }
    }
  }
  return null;
}

function depthLimitedSearch(problem, limit) {
  const initialNode = createSearchNode(problem.initialState);
  const frontier = [initialNode];
  let result = null;

  while (frontier.length > 0) {
    const node = frontier.pop();

    if (problem.isGoal(node.state)) return node;

    if (node.depth >= limit) {
      result = 'cutoff';
    } else if (!isCycle(node)) {
      for (const child of expand(problem, node)) {
        frontier.push(child);
      }
    }
  }

  return result;
}

function isCycle(node) {
  let current = node.parent;
  const key = stateKey(node.state);

  while (current) {
    if (stateKey(current.state) === key) return true;
    current = current.parent;
  }
  return false;
}

function iterativeDeepeningSearch(problem) {
  for (let depth = 0; ; depth++) {
    const result = depthLimitedSearch(problem, depth);
    if (result !== 'cutoff') return result;
  }
}

function bestCostFirstSearch(problem, evaluationFunction) {
  const initialNode = createSearchNode(problem.initialState);
  const frontier = new PriorityQueue(evaluationFunction, [initialNode]);
  const reached = new Map();

  reached.set(stateKey(problem.initialState), initialNode);

  while (!frontier.isEmpty()) {
    const node = frontier.dequeue();
    const key = stateKey(node.state);

    if (evaluationFunction(node) >
        evaluationFunction(reached.get(key))) continue;

    if (problem.isGoal(node.state)) return node;

    for (const child of expand(problem, node)) {
      const sKey = stateKey(child.state);
      const bestReached = reached.get(sKey);

      if (!bestReached || evaluationFunction(child) <
          evaluationFunction(bestReached)) {
        reached.set(sKey, child);
        frontier.enqueue(child);
      }
    }
  }
  return null;
}

function uniformCostSearch(problem) {
  return bestCostFirstSearch(problem, (node) => node.pathCost);
}

function greedySearch(problem) {
  return bestCostFirstSearch(problem, (node) => problem.heuristic(node.state));
}

function aStarSearch(problem) {
  return bestCostFirstSearch(problem,
      (node) => node.pathCost + problem.heuristic(node.state));
}

function recIDAstar(problem, node, threshold) {
  const fScore = node.pathCost + problem.heuristic(node.state);

  if (fScore > threshold) return fScore;

  if (problem.isGoal(node.state)) return node;

  let min = Infinity;

  for (const child of expand(problem, node)) {
    if (isCycle(child)) continue;

    const result = recIDAstar(problem, child, threshold);

    if (typeof result === 'object' && result !== null) return result;

    if (result < min) min = result;
  }

  return min;
}

function iterativeDeepeningAStarSearch(problem) {
  const initialNode = createSearchNode(problem.initialState);
  let threshold = problem.heuristic(initialNode.state);

  while (threshold !== Infinity) {
    const result = recIDAstar(problem, initialNode, threshold);

    if (typeof result === 'object' && result !== null) {
      return result;
    }

    if (result === Infinity) return null;

    threshold = result;
  }

  return null;
}

export function search(problem, method) {
  let result;

  const start = performance.now();
  switch (method) {
    case 'bfs':
      result = breadthFirstSearch(problem);
      break;
    case 'dfs':
      result = depthFirstSearch(problem);
      break;
    case 'dijkstra':
      result = uniformCostSearch(problem);
      break;
    case 'ids':
      result = iterativeDeepeningSearch(problem);
      break;
    case 'astar':
      result = aStarSearch(problem);
      break;
    case 'greedy':
      result = greedySearch(problem);
      break;
    case 'idastar':
      result = iterativeDeepeningAStarSearch(problem);
      break;
    default:
      return null;
  }

  const end = performance.now();
  const durationSeconds = ((end - start) / 1000).toFixed(4);

  console.log(`[${method.toUpperCase()}] Tempo de execução: ${durationSeconds} s`);

  return rebuildSolution(result);
}