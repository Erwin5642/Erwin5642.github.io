import {search} from '../core/Search.js';
import {assertNotUndefined} from '../utility/assert.js';

export class SimulationController {
  constructor(options = {}) {
    this.problem = null;
    this.stepIntervalMs = options.stepIntervalMs ?? 600;

    this.selectedAlgorithmKey = options.algorithm ?? 'bfs';
    this.isRunning = false;
    this.activeRun = null;

    this.stepCounter = 0;
    this.lastStepAt = 0;
  }

  setProblem(problem) {
    this.problem = problem ?? null;
    this.reset();
  }

  setStepInterval(stepIntervalMs) {
    this.stepIntervalMs = stepIntervalMs;
  }

  setAlgorithm(algorithmKey) {
    this.selectedAlgorithmKey = algorithmKey;
  }

  start() {
    if (!this.problem) return;

    const result = search(this.problem, this.selectedAlgorithmKey);
    if (!result) {
      alert("Nenhuma solução encontrada!\n");
    }

    this.activeRun = result;
    this.stepCounter = 0;
    this.lastStepAt = performance.now();
    this.isRunning = this.activeRun.length > 0;
  }

  toggleSimulation() {
    if (!this.activeRun) return this.isRunning;
    this.isRunning = !this.isRunning;
    return this.isRunning;
  }

  reset() {
    this.isRunning = false;
    this.activeRun = null;
    this.stepCounter = 0;
    this.lastStepAt = 0;
  }

  tick(now) {
    if (!this.isRunning || !this.activeRun) return;
    if (now - this.lastStepAt < this.stepIntervalMs) return;

    const step = this.#step(this.stepCounter);
    this.lastStepAt = now;
    return step;
  }

  #step(stepIndex) {
    const solution = this.activeRun;
    if (solution.length === 0 || stepIndex < 0 || stepIndex >= solution.length) {
      this.isRunning = false;
      return null;
    }

    const step = solution[stepIndex];

    this.stepCounter += 1;
    if (this.stepCounter >= solution.length) {
      this.isRunning = false;
    }

    return step;
  }
}
