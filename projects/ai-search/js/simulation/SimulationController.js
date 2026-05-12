const workerUrl = new URL('../workers/searchWorker.js', import.meta.url);

export class SimulationController {
  constructor(options = {}) {
    this.problem = null;
    this.problemId = null;
    this.stepIntervalMs = options.stepIntervalMs ?? 600;

    this.selectedAlgorithmKey = options.algorithm ?? 'bfs';
    this.isRunning = false;
    this.isComputing = false;
    this.activeRun = null;

    this.stepCounter = 0;
    this.lastStepAt = 0;

    this._worker = null;
    this._searchSeq = 0;
    this._pendingSearchResolve = null;
  }

  setProblem(problem, problemId = null) {
    this.problem = problem ?? null;
    this.problemId = problemId;
    this.reset();
  }

  setStepInterval(stepIntervalMs) {
    this.stepIntervalMs = stepIntervalMs;
  }

  setAlgorithm(algorithmKey) {
    this.selectedAlgorithmKey = algorithmKey;
  }

  #ensureWorker() {
    if (!this._worker) {
      this._worker = new Worker(workerUrl, {type: 'module'});
      this._worker.addEventListener('message', (event) => this.#onWorkerMessage(event));
    }
    return this._worker;
  }

  #finishSearchWait() {
    const resolve = this._pendingSearchResolve;
    this._pendingSearchResolve = null;
    resolve?.();
  }

  #onWorkerMessage(event) {
    const {ticket, ok, solution, error} = event.data;
    if (ticket !== this._searchSeq) {
      return;
    }

    this.isComputing = false;

    if (!ok) {
      console.error(error);
      alert(`Erro na busca: ${error}`);
      this.#finishSearchWait();
      return;
    }

    const result = solution;
    if (!result || result.length === 0) {
      alert('Nenhuma solução encontrada!\n');
    }

    console.log(result);

    this.activeRun = result ?? [];
    this.stepCounter = 0;
    this.lastStepAt = performance.now();
    this.isRunning = this.activeRun.length > 0;
    this.#finishSearchWait();
  }

  /**
   * Runs search on a worker. Resolves when the worker responds or after reset().
   * @returns {Promise<void>}
   */
  start() {
    if (!this.problem) {
      return Promise.resolve();
    }

    if (!this.problemId) {
      console.warn('SimulationController: problemId missing; search skipped.');
      return Promise.resolve();
    }

    this._searchSeq++;
    const ticket = this._searchSeq;

    this.activeRun = null;
    this.isRunning = false;
    this.stepCounter = 0;
    this.lastStepAt = 0;

    this.isComputing = true;
    const worker = this.#ensureWorker();

    return new Promise((resolve) => {
      this._pendingSearchResolve = resolve;
      worker.postMessage({
        ticket,
        problemId: this.problemId,
        algorithmKey: this.selectedAlgorithmKey,
        initialState: structuredClone(this.problem.initialState),
        goalState: structuredClone(this.problem.goalState),
      });
    });
  }

  toggleSimulation() {
    if (!this.activeRun) return this.isRunning;
    this.isRunning = !this.isRunning;
    return this.isRunning;
  }

  reset() {
    this._searchSeq++;
    this.isComputing = false;
    this.#finishSearchWait();
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
