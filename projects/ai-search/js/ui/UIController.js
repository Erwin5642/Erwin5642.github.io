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

    this.currentBundle = null;
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
    });

    this.startButton.addEventListener('click', () => {
      this.simulation.start();
      this.currentBundle.renderModel.reset(this.currentBundle.problem);
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
  }

  #applySelectedBundle(index) {
    const bundle = this.bundles[index];
    this.currentBundle = bundle;
    this.simulation.setProblem(bundle.problem);
    this.renderer.setRenderModel(bundle.renderModel);
    bundle.renderModel.reset(bundle.problem);
  }

  sync() {
    const algorithmKey = this.simulation.selectedAlgorithmKey;
    if (this.algorithmSelect.value !== algorithmKey) {
      this.algorithmSelect.value = algorithmKey;
    }
    this.selectedAlgorithm = algorithmKey;

    const hasRun = !!this.simulation.activeRun;
    this.startButton.style.display = hasRun ? 'none' : '';
    this.toggleButton.style.display = hasRun ? '' : 'none';
    this.resetButton.style.display = hasRun ? '' : 'none';
    this.toggleButton.textContent = this.simulation.isRunning ? 'Pausar' : 'Resumir';
  }
}
