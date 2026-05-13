import {ROMANIA_CITIES} from '../data/romaniaData.js';
import {createPuzzleProblem, createRomaniaProblem} from '../problems/problemFactories.js';

const INFORMED_ALGORITHM_KEYS = new Set(['astar', 'greedy', 'idastar']);

export class UIController {

  constructor(simulation, renderer, bundles) {
    this.simulation = simulation;
    this.renderer = renderer;
    this.bundles = bundles;

    this.problemSelect = document.getElementById('problem-select');
    this.algorithmSelect = document.getElementById('algo-select');
    this.startButton = document.getElementById('btn-start');
    this.toggleButton = document.getElementById('btn-toggle');
    this.resetButton = document.getElementById('btn-reset');
    this.stepIntervalSlider = document.getElementById('step-interval-slider');
    this.stepIntervalLabel = document.getElementById('step-interval-ms');
    this.initialInputContainer = document.getElementById('initial-input-container');
    this.endInputContainer = document.getElementById('end-input-container');
    this.heuristicPanel = document.getElementById('heuristic-panel');
    this.heuristicSelect = document.getElementById('heuristic-select');

    this.currentBundle = null;
    this._puzzleEditors = null;
    this._romaniaCityOrder = [...ROMANIA_CITIES].sort((a, b) =>
        a.localeCompare(b, 'pt-BR', {sensitivity: 'base'}));
  }

  bind() {
    this.problemSelect.innerHTML = '';
    this.bundles.forEach((bundle, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = bundle.name;
      this.problemSelect.appendChild(option);
    });

    if (this.bundles.length > 0) {
      this.problemSelect.selectedIndex = 0;
      this.#applySelectedBundle(0);
    }

    this.problemSelect.addEventListener('change', () => {
      const index = Number(this.problemSelect.value);
      if (index >= 0 && index < this.bundles.length) {
        this.simulation.reset();
        this.#applySelectedBundle(index);
      }
    });

    this.selectedAlgorithm = this.simulation.selectedAlgorithmKey;
    this.algorithmSelect.value = this.selectedAlgorithm;

    this.algorithmSelect.addEventListener('change', () => {
      const key = this.algorithmSelect.value;
      this.selectedAlgorithm = key;
      this.simulation.reset();
      this.simulation.setAlgorithm(key);
      this.currentBundle.renderModel.reset(this.currentBundle.problem);
      this.#updateHeuristicPanelVisibility();
    });

    if (this.heuristicSelect) {
      this.heuristicSelect.addEventListener('change', () => {
        const heuristicKey = this.heuristicSelect.value;
        this.simulation.reset();
        this.#rebuildProblemWithHeuristic(heuristicKey);
      });
    }

    this.startButton.addEventListener('click', async () => {
      const bundle = this.currentBundle;
      bundle.renderModel.reset(bundle.problem);
      bundle.renderModel.setComputing(true);
      try {
        await this.simulation.start();
      } finally {
        bundle.renderModel.setComputing(false);
      }
      if (!this.simulation.activeRun) {
        bundle.renderModel.reset(bundle.problem);
      }
    });
    this.toggleButton.addEventListener('click', () => {
      this.simulation.toggleSimulation();
    });
    this.resetButton.addEventListener('click', () => {
      this.simulation.reset();
      this.currentBundle.renderModel.reset(this.currentBundle.problem);
    });

    const applyStepIntervalFromSlider = () => {
      const sliderMin = Number(this.stepIntervalSlider.min);
      const sliderMax = Number(this.stepIntervalSlider.max);
      const sliderValue = Number(this.stepIntervalSlider.value);
      const normalized = (sliderValue - sliderMin) / Math.max(1, sliderMax - sliderMin);
      const minIntervalMs = 0;
      const maxIntervalMs = 1000;
      const intervalMs = Math.round(maxIntervalMs - normalized * (maxIntervalMs - minIntervalMs));
      if (this.stepIntervalLabel) {
        this.stepIntervalLabel.textContent = `${intervalMs} ms por passo`;
      }
      this.simulation.setStepInterval(intervalMs);
    };

    this.stepIntervalSlider.addEventListener('input', applyStepIntervalFromSlider);
    applyStepIntervalFromSlider();
    this.#updateHeuristicPanelVisibility();
  }

  #applySelectedBundle(index) {
    const bundle = this.bundles[index];
    this.currentBundle = bundle;
    this.simulation.setHeuristicKey(bundle.activeHeuristicKey);
    this.simulation.setProblem(bundle.problem, bundle.id);
    this.renderer.setRenderModel(bundle.renderModel);
    bundle.renderModel.reset(bundle.problem);
    this.#syncStateInputPanels();
    this.#fillHeuristicSelect();
    this.#updateHeuristicPanelVisibility();
  }

  #fillHeuristicSelect() {
    if (!this.heuristicSelect) {
      return;
    }
    const bundle = this.currentBundle;
    this.heuristicSelect.innerHTML = '';
    for (const {id, label} of bundle?.heuristics ?? []) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = label;
      this.heuristicSelect.appendChild(opt);
    }
    const key = bundle?.activeHeuristicKey ?? bundle?.defaultHeuristicKey ?? '';
    if (key && [...this.heuristicSelect.options].some((o) => o.value === key)) {
      this.heuristicSelect.value = key;
    }
  }

  #updateHeuristicPanelVisibility() {
    if (!this.heuristicPanel) {
      return;
    }
    const informed = INFORMED_ALGORITHM_KEYS.has(this.algorithmSelect.value);
    const hasList = (this.currentBundle?.heuristics?.length ?? 0) > 0;
    this.heuristicPanel.hidden = !informed || !hasList;
  }

  /**
   * New heuristic ⇒ new Problem from the factory; same initial/goal states.
   * Remounts state panels so they reference the new instance.
   */
  #rebuildProblemWithHeuristic(heuristicKey) {
    const bundle = this.currentBundle;
    if (!bundle?.heuristics?.length) {
      return;
    }
    const validIds = new Set(bundle.heuristics.map((h) => h.id));
    const key = validIds.has(heuristicKey) ? heuristicKey : bundle.defaultHeuristicKey;

    const initialState = structuredClone(bundle.problem.initialState);
    const goalState = structuredClone(bundle.problem.goalState);

    if (bundle.id === 'romania') {
      bundle.problem = createRomaniaProblem(initialState, goalState, key);
    } else if (bundle.id === 'puzzle') {
      bundle.problem = createPuzzleProblem(initialState, goalState, key);
    } else {
      return;
    }

    bundle.activeHeuristicKey = key;
    this.simulation.setHeuristicKey(key);
    this.simulation.setProblem(bundle.problem, bundle.id);
    this.#syncStateInputPanels();
    bundle.renderModel.reset(bundle.problem);
    if (this.heuristicSelect && this.heuristicSelect.value !== key) {
      this.heuristicSelect.value = key;
    }
  }

  #syncStateInputPanels() {
    this._puzzleEditors = null;
    this.initialInputContainer.replaceChildren();
    this.endInputContainer.replaceChildren();
    if (this.currentBundle?.id === 'romania') {
      this.#mountRomaniaStateSelectors();
    } else if (this.currentBundle?.id === 'puzzle') {
      this.#mountPuzzleBoardEditors();
    }
  }

  #clonePuzzleBoard(board) {
    return board.map((row) => [...row]);
  }

  #validateEightPuzzle(board) {
    if (!board || board.length !== 3) {
      return 'Tabuleiro incompleto.';
    }
    const flat = [];
    for (let r = 0; r < 3; r++) {
      if (!board[r] || board[r].length !== 3) {
        return 'Tabuleiro incompleto.';
      }
      for (let c = 0; c < 3; c++) {
        flat.push(board[r][c]);
      }
    }
    let empty = 0;
    const seen = new Set();
    for (const v of flat) {
      if (v === '-') {
        empty++;
        continue;
      }
      if (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 8) {
        if (seen.has(v)) {
          return 'Cada peça 1–8 só pode aparecer uma vez.';
        }
        seen.add(v);
        continue;
      }
      return 'Use números 1–8 ou espaço vazio em cada célula.';
    }
    if (empty !== 1) {
      return 'Deve haver exatamente um espaço vazio.';
    }
    if (seen.size !== 8) {
      return 'Coloque todas as peças de 1 a 8.';
    }
    return '';
  }

  #readPuzzleSelects(selects) {
    return selects.map((row) =>
        row.map((sel) => {
          const raw = sel.value;
          return raw === '-' ? '-' : Number(raw);
        }));
  }

  #fillPuzzleTileSelect(sel, value) {
    sel.replaceChildren();
    const emptyOpt = document.createElement('option');
    emptyOpt.value = '-';
    emptyOpt.textContent = '—';
    sel.appendChild(emptyOpt);
    for (let n = 1; n <= 8; n++) {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.textContent = String(n);
      sel.appendChild(opt);
    }
    sel.value = value === '-' ? '-' : String(value);
  }

  #createPuzzleBoardSection(board, idPrefix, ariaLabel) {
    const section = document.createElement('div');
    section.className = 'puzzle-board-section';

    const hint = document.createElement('p');
    hint.className = 'puzzle-board-hint';
    hint.textContent = 'Números 1–8, cada um uma vez; um espaço vazio (—).';
    section.appendChild(hint);

    const grid = document.createElement('div');
    grid.className = 'puzzle-board-grid';
    grid.setAttribute('role', 'group');
    grid.setAttribute('aria-label', ariaLabel);

    const selects = [[], [], []];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const sel = document.createElement('select');
        sel.className = 'form-select';
        sel.id = `${idPrefix}-${r}-${c}`;
        this.#fillPuzzleTileSelect(sel, board[r][c]);
        selects[r][c] = sel;
        grid.appendChild(sel);
      }
    }
    section.appendChild(grid);

    const errorEl = document.createElement('p');
    errorEl.className = 'puzzle-board-error';
    errorEl.setAttribute('aria-live', 'polite');
    section.appendChild(errorEl);

    return {section, selects, errorEl};
  }

  #mountPuzzleBoardEditors() {
    const problem = this.currentBundle.problem;
    const initialBoard = this.#clonePuzzleBoard(problem.initialState);
    const goalBoard = this.#clonePuzzleBoard(problem.goalState);

    const initial = this.#createPuzzleBoardSection(
        initialBoard,
        'puzzle-init',
        'Tabuleiro inicial 3×3',
    );
    const goal = this.#createPuzzleBoardSection(
        goalBoard,
        'puzzle-goal',
        'Tabuleiro objetivo 3×3',
    );

    const applyPuzzleBoards = () => {
      const iBoard = this.#readPuzzleSelects(initial.selects);
      const gBoard = this.#readPuzzleSelects(goal.selects);
      const errI = this.#validateEightPuzzle(iBoard);
      const errG = this.#validateEightPuzzle(gBoard);
      initial.errorEl.textContent = errI;
      goal.errorEl.textContent = errG;
      if (errI || errG) {
        return;
      }
      problem.setInitialState(this.#clonePuzzleBoard(iBoard));
      problem.setGoalState(this.#clonePuzzleBoard(gBoard));
      this.simulation.reset();
      this.currentBundle.renderModel.reset(problem);
    };

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        initial.selects[r][c].addEventListener('change', applyPuzzleBoards);
        goal.selects[r][c].addEventListener('change', applyPuzzleBoards);
      }
    }

    this.initialInputContainer.appendChild(initial.section);
    this.endInputContainer.appendChild(goal.section);
    this._puzzleEditors = {initial, goal};
  }

  #puzzleBoardsValidFromEditors() {
    if (!this._puzzleEditors) {
      return true;
    }
    const iBoard = this.#readPuzzleSelects(this._puzzleEditors.initial.selects);
    const gBoard = this.#readPuzzleSelects(this._puzzleEditors.goal.selects);
    return !this.#validateEightPuzzle(iBoard) && !this.#validateEightPuzzle(gBoard);
  }

  #mountRomaniaStateSelectors() {
    const problem = this.currentBundle.problem;
    const cities = this._romaniaCityOrder;

    const mkSelect = (id, value) => {
      const sel = document.createElement('select');
      sel.id = id;
      sel.className = 'form-select';
      sel.setAttribute('aria-label', id === 'romania-initial-city'
          ? 'Cidade inicial'
          : 'Cidade objetivo');
      for (const city of cities) {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        if (city === value) {
          opt.selected = true;
        }
        sel.appendChild(opt);
      }
      return sel;
    };

    const initialSel = mkSelect('romania-initial-city', problem.initialState);
    const goalSel = mkSelect('romania-goal-city', problem.goalState);

    const applyRomaniaStates = () => {
      problem.setInitialState(initialSel.value);
      problem.setGoalState(goalSel.value);
      this.simulation.reset();
      this.currentBundle.renderModel.reset(problem);
    };

    initialSel.addEventListener('change', applyRomaniaStates);
    goalSel.addEventListener('change', applyRomaniaStates);

    this.initialInputContainer.appendChild(initialSel);
    this.endInputContainer.appendChild(goalSel);
  }

  sync() {
    const algorithmKey = this.simulation.selectedAlgorithmKey;
    if (this.algorithmSelect.value !== algorithmKey) {
      this.algorithmSelect.value = algorithmKey;
    }
    this.selectedAlgorithm = algorithmKey;

    if (this.heuristicSelect && this.heuristicPanel && !this.heuristicPanel.hidden) {
      const bundleKey = this.currentBundle?.activeHeuristicKey;
      if (bundleKey && this.heuristicSelect.value !== bundleKey) {
        this.heuristicSelect.value = bundleKey;
      }
    }

    const hasRun = !!this.simulation.activeRun;
    const busy = this.simulation.isComputing;
    const showStart = !hasRun && !busy;
    this.startButton.style.display = showStart ? '' : 'none';
    if (showStart) {
      const configOk = this.currentBundle?.id !== 'puzzle' ||
          this.#puzzleBoardsValidFromEditors();
      this.startButton.disabled = !configOk;
    } else {
      this.startButton.disabled = false;
    }
    this.toggleButton.style.display = hasRun ? '' : 'none';
    this.resetButton.style.display = (hasRun || busy) ? '' : 'none';
    this.toggleButton.textContent = this.simulation.isRunning ? 'Pausar' : 'Resumir';
  }
}
