export class Graph {
  constructor() {
    this._adj = new Map();
    this.edges = [];
  }

  addNode(name, x, y) {
    if (!this._adj.has(name)) {
      this._adj.set(name, {name, x, y, color: '#3498db', neighbors: new Set()});
    }
    return this;
  }

  addEdge(from, to, cost) {
    if (!this._adj.has(from)) throw new Error(`Node not found: ${from}`);
    if (!this._adj.has(to)) throw new Error(`Node not found: ${to}`);
    if (from === to) return this;
    if (this.hasEdge(from, to)) return this;
    this._adj.get(from).neighbors.add(to);
    this._adj.get(to).neighbors.add(from);
    this.edges.push({from, to, cost});
    return this;
  }

  getNode(id) { return this._adj.get(id) ?? null; }

  get nodes() {
    return Array.from(this._adj.values());
  }

  hasNode(id) { return this._adj.has(id); }

  hasEdge(from, to) { return this._adj.get(from)?.neighbors.has(to) ?? false; }

  neighbors(id) { return this._adj.get(id)?.neighbors ?? new Set(); }
}
