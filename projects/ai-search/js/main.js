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
  const step = simulation.tick(performance.now());
  if (step) renderer.renderModel?.update(step);
  renderer.draw();

  requestAnimationFrame(loop);
}

loop();
