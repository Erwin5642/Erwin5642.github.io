export class BFS {
  constructor() {
    this.actions = [];
  }

  /**
   * @param {Graph} graph
   * @param {string} source
   * @param {string} destination
   * @return {boolean}
   */
  search(graph, source, destination) {
    this.actions = [];

    if (!graph.hasNode(source) || !graph.hasNode(destination)) return false;

    if (source === destination) return true;

    const frontier = [source];
    const reached = new Set([source]);

    while (frontier.length > 0) {
      const node = frontier.shift();

      for (const s of graph.neighbors(node)) {
        if (reached.has(s)) continue;

        this.actions.push({from: node, to: s});

        if (s === destination) {
          return true;
        }

        reached.add(s);
        frontier.push(s);
      }
    }

    return false;
  }
}

export class DFS {
  constructor() {
    this.actions = [];
  }

  /**
   * @param {Graph} graph
   * @param {string} source
   * @param {string} destination
   * @return {boolean}
   */
  search(graph, source, destination) {
    this.actions = [];

    if (!graph.hasNode(source) || !graph.hasNode(destination)) return false;

    if (source === destination) {
      return true;
    }

    const frontier = [{node: source, from: null}];
    const reached = new Set([source]);

    while (frontier.length > 0) {
      const {node} = frontier.pop();

      for (const s of graph.neighbors(node)) {
        if (reached.has(s)) continue;

        this.actions.push({from: node, to: s});

        if (s === destination) {
          return true;
        }

        reached.add(s);
        frontier.push(s);
      }
    }

    return false;
  }
}