import {Renderer} from "./Renderer.js";
import {Graph} from "./Graph.js";
import {Editor} from "./Editor.js";

const graph = new Graph();
const renderer = new Renderer('graphCanvas');
new Editor(graph, 'graphCanvas');

function loop() {
    renderer.draw(graph);
    requestAnimationFrame(loop);
}

loop();
