import {Renderer} from './render/Renderer.js';
import {SimulationController} from './simulation/SimulationController.js';
import {UIController} from './ui/UIController.js';
import {romaniaBundle} from './problems/romaniaBundle.js';
import {puzzleBundle} from './problems/puzzleBundle.js';

const bundles = [
    romaniaBundle,
    puzzleBundle
];
const renderer = new Renderer('graphCanvas');
const simulation = new SimulationController();
const ui = new UIController(simulation, renderer, bundles);
ui.bind();

function loop() {
  ui.sync();
  let stepsInLoop = 1;
  if (simulation.stepIntervalMs < 10) {
    stepsInLoop = 100;
  }
  for (let i = 0; i < stepsInLoop; i++) {
    const step = simulation.tick(performance.now());
    if (step) renderer.renderModel.update(step);
  }
  renderer.draw();

  requestAnimationFrame(loop);
}

loop();
