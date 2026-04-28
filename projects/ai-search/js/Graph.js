export class Graph {
    constructor() {
        this._adj = new Map();
        this.nodes = [];
        this.edges = [];
    }

    addNode(name, x, y) {
        if (!this._adj.has(name)) {
            this._adj.set(name, { x, y, neighbors: new Set() });
            this.nodes.push({ name, x, y });
        }
        return this;
    }

    addEdge(from, to) {
        if (!this._adj.has(from)) throw new Error(`Node not found: ${from}`);
        if (!this._adj.has(to)) throw new Error(`Node not found: ${to}`);
        if (this.hasEdge(from, to)) return this;
        this._adj.get(from).neighbors.add(to);
        this.edges.push({ from, to });
        return this;
    }

    updateNode(name, x, y) {
        const nodeData = this._adj.get(name);
        if (!nodeData) return this;

        nodeData.x = x;
        nodeData.y = y;

        const node = this.nodes.find((item) => item.name === name);
        if (node) {
            node.x = x;
            node.y = y;
        }

        return this;
    }

    getNode(id) { return this._adj.get(id) ?? null; }
    hasNode(id) { return this._adj.has(id); }
    hasEdge(from, to) { return this._adj.get(from)?.neighbors.has(to) ?? false; }
    neighbors(id) { return this._adj.get(id)?.neighbors ?? new Set(); }
}