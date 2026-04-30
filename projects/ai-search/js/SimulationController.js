import {BFS, DFS} from './Search.js';

const DEFAULT_NODE_COLOR = '#3498db';
const DEFAULT_EDGE_COLOR = 'black';
const SOURCE_NODE_COLOR = '#2ecc71';
const DESTINATION_NODE_COLOR = '#e74c3c';
const ACTIVE_NODE_COLOR = '#f1c40f';
const ACTIVE_EDGE_COLOR = '#f39c12';

export class SimulationController {
  constructor(graph, options = {}) {
    this.graph = graph;
    this.source = options.source ?? 'Oradea';
    this.destination = options.destination ?? 'Eforle';
    this.stepIntervalMs = options.stepIntervalMs ?? 600;

    this.selectedAlgorithmKey = options.algorithm ?? 'bfs';
    this.isRunning = false;
    this.runningAlgorithm = null;
    this.stepCounter = 0;
    this.lastStepAt = 0;
  }

  setStepInterval(stepIntervalMs) {
    this.stepIntervalMs = stepIntervalMs;
  }

  setAlgorithm(algorithmKey) {
    this.selectedAlgorithmKey = algorithmKey;
  }

  setSource(nodeName) {
    if (!this.graph.hasNode(nodeName)) return;
    this.source = nodeName;
    this.resetGraphColors();
  }

  setDestination(nodeName) {
    if (!this.graph.hasNode(nodeName)) return;
    this.destination = nodeName;
    this.resetGraphColors();
  }

  start() {
    this.runningAlgorithm = this.#createAlgorithm(this.selectedAlgorithmKey);
    if (!this.runningAlgorithm) return;

    this.resetGraphColors();
    this.stepCounter = 0;
    this.runningAlgorithm.search(this.graph, this.source, this.destination);
    this.isRunning = true;
  }

  toggleSimulation() {
    if (!this.runningAlgorithm) return this.isRunning;
    this.isRunning = !this.isRunning;
    return this.isRunning;
  }

  reset() {
    this.isRunning = false;
    this.runningAlgorithm = null;
    this.stepCounter = 0;
    this.lastStepAt = 0;
    this.resetGraphColors();
  }

  tick(now) {
    if (!this.isRunning || !this.runningAlgorithm) return;
    if (now - this.lastStepAt < this.stepIntervalMs) return;

    this.#step(this.stepCounter);
    this.lastStepAt = now;
  }

  resetGraphColors() {
    this.graph.nodes.forEach((node) => {
      node.color = DEFAULT_NODE_COLOR;
    });

    this.graph.edges.forEach((edge) => {
      edge.color = DEFAULT_EDGE_COLOR;
    });

    const sourceNode = this.graph.getNode(this.source);
    const destinationNode = this.graph.getNode(this.destination);
    if (sourceNode) sourceNode.color = SOURCE_NODE_COLOR;
    if (destinationNode) destinationNode.color = DESTINATION_NODE_COLOR;
  }

  #createAlgorithm(key) {
    switch (key) {
      case 'bfs':
        return new BFS();
      case 'dfs':
        return new DFS();
      default:
        return null;
    }
  }

  #step(stepIndex) {
    if (!this.runningAlgorithm || stepIndex >= this.runningAlgorithm.actions.length) {
      this.isRunning = false;
      return;
    }

    const stepValue = this.runningAlgorithm.actions[stepIndex];
    const from = stepValue?.from;
    const to = stepValue?.to;

    const nodeFrom = this.graph.getNode(from);
    const nodeTo = this.graph.getNode(to);
    const edge = this.graph.edges.find((currentEdge) => (
      (currentEdge.from === from && currentEdge.to === to) ||
      (currentEdge.from === to && currentEdge.to === from)
    ));

    if (nodeFrom) nodeFrom.color = ACTIVE_NODE_COLOR;
    if (nodeTo) nodeTo.color = ACTIVE_NODE_COLOR;
    if (edge) edge.color = ACTIVE_EDGE_COLOR;

    this.stepCounter += 1;
    if (this.stepCounter >= this.runningAlgorithm.actions.length) {
      this.isRunning = false;
    }
  }
}
