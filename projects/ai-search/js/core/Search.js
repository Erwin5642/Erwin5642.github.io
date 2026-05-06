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
  if (problem.isGoal(initialNode.state)) return [initialNode.state];

  const frontier = [initialNode];
  const reached = new Set([problem.initialState]);

  while (frontier.length > 0) {
    const node = frontier.shift();

    for (const child of expand(problem, node)) {
      const s = child.state;

      if (problem.isGoal(s)) {
        return rebuildSolution(child);
      }

      if (!reached.has(s)) {
        reached.add(s);
        frontier.push(child);
      }
    }
  }

  return [];
}

function depthFirst(problem) {

  return [];
}

function uniformCost(problem) {

  return [];
}