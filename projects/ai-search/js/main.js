import {Renderer} from './Renderer.js';
import {Graph} from './Graph.js';
import {SimulationController} from './SimulationController.js';
import {UIController} from './UIController.js';
import {seedRomaniaNodes, seedRomaniaRoads} from './romaniaMapData.js';

const graph = new Graph();
seedRomaniaNodes(graph);
seedRomaniaRoads(graph);

const renderer = new Renderer('graphCanvas');
const simulation = new SimulationController(graph);
const ui = new UIController(simulation);
ui.bind();

function loop() {
  simulation.tick(performance.now());
  renderer.draw(graph);
  requestAnimationFrame(loop);
}

simulation.resetGraphColors();
loop();
