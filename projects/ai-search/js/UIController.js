export class UIController {
  constructor(simulation) {
    this.simulation = simulation;

    this.algorithmSelect = document.getElementById('algo-select');
    this.startButton = document.getElementById('btn-start');
    this.toggleButton = document.getElementById('btn-toggle');
    this.resetButton = document.getElementById('btn-reset');
    this.startNodeSelect = document.getElementById('start-node-select');
    this.endNodeSelect = document.getElementById('end-node-select');
  }

  bind() {
    this.#bindNodeSelect(this.startNodeSelect, (value) => this.simulation.setSource(value));
    this.#bindNodeSelect(this.endNodeSelect, (value) => this.simulation.setDestination(value));

    if (this.algorithmSelect) {
      this.simulation.setAlgorithm(this.algorithmSelect.value);
      this.algorithmSelect.addEventListener('change', () => {
        this.simulation.reset();
        this.#syncControls();
        this.simulation.setAlgorithm(this.algorithmSelect.value);
      });
    }

    this.#syncControls();
    this.startButton.addEventListener('click', () => {
      this.simulation.start();
      this.#syncControls();
    });
    this.toggleButton.addEventListener('click', () => {
      this.simulation.toggleSimulation();
      this.#syncControls();
    });
    this.resetButton.addEventListener('click', () => {
      this.simulation.reset();
      this.#syncControls();
    });
  }

  #syncControls() {
    const hasActiveSimulation = Boolean(this.simulation.runningAlgorithm);

    if (this.startButton) {
      this.startButton.style.display = hasActiveSimulation ? 'none' : '';
    }
    if (this.toggleButton) {
      this.toggleButton.style.display = hasActiveSimulation ? '' : 'none';
      this.toggleButton.textContent = this.simulation.isRunning ? 'Pausar' : 'Resumir';
    }
    if (this.resetButton) {
      this.resetButton.style.display = hasActiveSimulation ? '' : 'none';
    }
  }

  #bindNodeSelect(selectElement, onChange) {
    if (!selectElement) return;

    const refreshOptions = () => this.#populateNodeOptions(selectElement);
    selectElement.addEventListener('focus', refreshOptions);
    selectElement.addEventListener('pointerdown', refreshOptions);
    selectElement.addEventListener('change', () => {
      onChange(selectElement.value);
    });

    refreshOptions();
    onChange(selectElement.value);
  }

  #populateNodeOptions(selectElement) {
    const currentValue = selectElement.value;
    const nodeNames = this.simulation.graph.nodes.map((node) => node.name).sort();

    selectElement.innerHTML = '';
    nodeNames.forEach((nodeName) => {
      const option = document.createElement('option');
      option.value = nodeName;
      option.textContent = nodeName;
      selectElement.appendChild(option);
    });

    if (nodeNames.length === 0) return;
    if (currentValue && nodeNames.includes(currentValue)) {
      selectElement.value = currentValue;
      return;
    }

    if (selectElement === this.startNodeSelect && this.simulation.source && nodeNames.includes(this.simulation.source)) {
      selectElement.value = this.simulation.source;
      return;
    }

    if (selectElement === this.endNodeSelect && this.simulation.destination && nodeNames.includes(this.simulation.destination)) {
      selectElement.value = this.simulation.destination;
      return;
    }

    selectElement.value = nodeNames[0];
  }
}
