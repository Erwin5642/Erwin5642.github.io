class priorityQueue {
  constructor(elements = []) {
    this.items = [];
    elements.forEach((element) => this.enqueue(element));
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
      if (this.items[parentIndex].pathCost <= this.items[index].pathCost) {
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

      if (left < length && this.items[left].pathCost < this.items[smallest].pathCost) {
        smallest = left;
      }
      if (right < length && this.items[right].pathCost < this.items[smallest].pathCost) {
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
    case 'greedy':
    default:
      return undefined;
  }
}

function breadthFirst(problem) {
  const initialNode = createSearchNode(problem.initialState);
  if (problem.isGoal(initialNode.state)) {
    return rebuildSolution(initialNode);
  }

  const frontier = [initialNode];
  const reached = new Set([stateKey(problem.initialState)]);

  while (frontier.length > 0) {
    const node = frontier.shift();

    for (const child of expand(problem, node)) {
      const s = child.state;
      const key = stateKey(s);
      if (reached.has(key)) {
        continue;
      }
      reached.add(key);

      if (problem.isGoal(s)) {
        return rebuildSolution(child);
      }

      frontier.push(child);
    }
  }

  return [];
}

function depthFirst(problem) {
  const initialNode = createSearchNode(problem.initialState);
  if (problem.isGoal(initialNode.state)) {
    return rebuildSolution(initialNode);
  }

  const frontier = [initialNode];
  const reached = new Set([stateKey(problem.initialState)]);

  while (frontier.length > 0) {
    const node = frontier.pop();

    for (const child of expand(problem, node)) {
      const s = child.state;
      const key = stateKey(s);
      if (reached.has(key)) {
        continue;
      }
      reached.add(key);

      if (problem.isGoal(s)) {
        return rebuildSolution(child);
      }

      frontier.push(child);
    }
  }

  return [];
}

function uniformCost(problem) {
  const initialNode = createSearchNode(problem.initialState);
  const frontier = new priorityQueue([initialNode]);
  const bestCost = new Map([[stateKey(problem.initialState), 0]]);

  while (!frontier.isEmpty()) {
    const node = frontier.dequeue();
    const nodeKey = stateKey(node.state);
    const knownNodeCost = bestCost.get(nodeKey);
    if (knownNodeCost != null && node.pathCost > knownNodeCost) {
      continue;
    }

    if (problem.isGoal(node.state)) {
      return rebuildSolution(node);
    }

    for (const child of expand(problem, node)) {
      const key = stateKey(child.state);
      const knownCost = bestCost.get(key);
      if (knownCost == null || child.pathCost < knownCost) {
        bestCost.set(key, child.pathCost);
        frontier.enqueue(child);
      }
    }
  }

  return [];
}
