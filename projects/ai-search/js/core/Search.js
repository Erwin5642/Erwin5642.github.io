class PriorityQueue {
  /**
   * @param {(node: { pathCost: number }) => number} evaluationFunction
   *   Lower values dequeue first (e.g. path cost for UCS, g+h for A*).
   * @param {Array<{ pathCost: number }>} elements
   */
  constructor(evaluationFunction, elements = []) {
    if (typeof evaluationFunction !== 'function') {
      throw new TypeError('PriorityQueue requires evaluationFunction as first argument');
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
    if (this.items.length === 0) {
      return undefined;
    }
    if (this.items.length === 1) {
      return this.items.pop();
    }
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
      if (this.#score(this.items[parentIndex]) <= this.#score(this.items[index])) {
        break;
      }
      [this.items[parentIndex], this.items[index]] = [this.items[index], this.items[parentIndex]];
      index = parentIndex;
    }
  }

  #bubbleDown(index) {
    const length = this.items.length;
    while (true) {
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      let smallest = index;

      if (left < length && this.#score(this.items[left]) < this.#score(this.items[smallest])) {
        smallest = left;
      }
      if (right < length && this.#score(this.items[right]) < this.#score(this.items[smallest])) {
        smallest = right;
      }
      if (smallest === index) {
        break;
      }

      [this.items[index], this.items[smallest]] = [this.items[smallest], this.items[index]];
      index = smallest;
    }
  }
}


function createSearchNode(state, parent = null, action = null, pathCost = 0) {
  return {
    state,
    parent,
    action,
    pathCost,
  };
}

function rebuildSolution(goalNode) {
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
    expansion.push(createSearchNode(result, node, action, cost));
  });
  return expansion;
}

function stateKey(state) {
  if (state == null) return String(state);
  if (typeof state === 'object') return JSON.stringify(state);
  return String(state);
}

export function search(problem, method) {
  switch (method) {
    case 'bfs':
      return breadthFirst(problem);
    case 'dfs':
      return depthFirst(problem);
    case 'dijkstra':
      return uniformCost(problem);
    case 'astar':
      return aStar(problem);
    case 'greedy':
      return greedy(problem);
    default:
      return undefined;
  }
}

function breadthFirst(problem) {
  const initialNode = createSearchNode(problem.initialState);
  if (problem.isGoal(problem.initialState)) {
    return rebuildSolution(initialNode);
  }

  const frontier = [initialNode];
  const reached = new Set([stateKey(problem.initialState)]);

  while (frontier.length > 0) {
    const node = frontier.shift();

    for (const child of expand(problem, node)) {
      const s = child.state;
      const key = stateKey(s);
      if (problem.isGoal(s)) {
        return rebuildSolution(child);
      }

      if (!reached.has(key)) {
        reached.add(key);
        frontier.push(child);
      }
    }
  }

  return [];
}

function depthFirst(problem) {
  const initialNode = createSearchNode(problem.initialState);
  const frontier = [initialNode];
  const explored = new Set();

  while (frontier.length > 0) {
    const node = frontier.pop();
    const key = stateKey(node.state);

    if (problem.isGoal(node.state)) {
      return rebuildSolution(node);
    }

    if (!explored.has(key)) {
      explored.add(key);

      for (const child of expand(problem, node)) {
        const childKey = stateKey(child.state);
        if (!explored.has(childKey)) {
          frontier.push(child);
        }
      }
    }
  }
  return [];
}

function bestCostFirst(problem, evaluationFunction) {
  const initialNode = createSearchNode(problem.initialState);
  const frontier = new PriorityQueue(evaluationFunction, [initialNode]);
  const reached = new Map();

  const initialKey = stateKey(problem.initialState);
  reached.set(initialKey, initialNode);

  while (!frontier.isEmpty()) {
    const node = frontier.dequeue();
    const key = stateKey(node.state);

    if (evaluationFunction(node) > evaluationFunction(reached.get(key))) {
      continue;
    }

    if (problem.isGoal(node.state)) {
      return rebuildSolution(node);
    }

    for (const child of expand(problem, node)) {
      const s = child.state;
      const sKey = stateKey(s);

      const bestReached = reached.get(sKey);

      if (!bestReached || evaluationFunction(child) < evaluationFunction(bestReached)) {
        reached.set(sKey, child);
        frontier.enqueue(child);
      }
    }
  }

  return [];
}

function uniformCost(problem) {
  return bestCostFirst(problem, (node) => node.pathCost);
}

function greedy(problem) {
  return bestCostFirst(problem, (node) => problem.heuristic(node.state));
}

function aStar(problem) {
  return bestCostFirst(problem, (node) => node.pathCost + problem.heuristic(node.state));
}