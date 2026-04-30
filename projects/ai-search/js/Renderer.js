const GRAPH_VIEW_PADDING_PX = 60;

export class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this._cssViewportWidth = 0;
    this._cssViewportHeight = 0;
    this._devicePixelRatio = 1;

    this.#syncCanvasSize();
    requestAnimationFrame(() => this.#syncCanvasSize());
    window.addEventListener('resize', () => this.#syncCanvasSize());
  }

  draw(graph) {
    this.#syncCanvasSize();
    const context = this.context;
    const canvasEl = this.canvas;
    const cssWidth = this._cssViewportWidth;
    const cssHeight = this._cssViewportHeight;
    const devicePixelRatio = this._devicePixelRatio;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    context.save();
    context.textAlign = 'center';
    context.font = 'serif';

    // Mapeia coordenadas dos nodos para coordenadas dentro dos limites do canvas
    if (graph.nodes.length > 0) {
      let graphBoundsMinX = Infinity;
      let graphBoundsMinY = Infinity;
      let graphBoundsMaxX = -Infinity;
      let graphBoundsMaxY = -Infinity;
      for (const node of graph.nodes) {
        graphBoundsMinX = Math.min(graphBoundsMinX, node.x);
        graphBoundsMinY = Math.min(graphBoundsMinY, node.y);
        graphBoundsMaxX = Math.max(graphBoundsMaxX, node.x);
        graphBoundsMaxY = Math.max(graphBoundsMaxY, node.y);
      }
      const graphWorldWidth = Math.max(graphBoundsMaxX - graphBoundsMinX, 1e-6);
      const graphWorldHeight = Math.max(graphBoundsMaxY - graphBoundsMinY,
          1e-6);
      const drawableInnerWidth = Math.max(1,
          cssWidth - 2 * GRAPH_VIEW_PADDING_PX);
      const drawableInnerHeight = Math.max(1,
          cssHeight - 2 * GRAPH_VIEW_PADDING_PX);
      const scaleGraphUnitsToCssPx = Math.min(
          drawableInnerWidth / graphWorldWidth,
          drawableInnerHeight / graphWorldHeight);
      const cssOffsetX = GRAPH_VIEW_PADDING_PX +
          (drawableInnerWidth - graphWorldWidth * scaleGraphUnitsToCssPx) / 2
          - graphBoundsMinX * scaleGraphUnitsToCssPx;
      const cssOffsetY = GRAPH_VIEW_PADDING_PX +
          (drawableInnerHeight - graphWorldHeight * scaleGraphUnitsToCssPx) / 2
          - graphBoundsMinY * scaleGraphUnitsToCssPx;

      context.setTransform(devicePixelRatio * scaleGraphUnitsToCssPx, 0, 0,
          devicePixelRatio * scaleGraphUnitsToCssPx,
          devicePixelRatio * cssOffsetX, devicePixelRatio * cssOffsetY);
    }

    graph.edges.forEach((edge) => {
      const fromNode = graph.getNode(edge.from);
      const toNode = graph.getNode(edge.to);
      if (!fromNode || !toNode) return;

      context.beginPath();
      context.moveTo(fromNode.x, fromNode.y);
      context.lineTo(toNode.x, toNode.y);
      context.strokeStyle = edge.color ?? 'black';
      context.stroke();

      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const edgeVectorX = toNode.x - fromNode.x;
      const edgeVectorY = toNode.y - fromNode.y;
      const edgeLength = Math.hypot(edgeVectorX, edgeVectorY) || 1;

      const normalX = -edgeVectorY / edgeLength;
      const normalY = edgeVectorX / edgeLength;
      const labelOffset = 10;

      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = 'black';
      context.fillText(edge.cost, midX + normalX * labelOffset,
          midY + normalY * labelOffset);
    });

    graph.nodes.forEach((node) => {
      context.beginPath();
      context.arc(node.x, node.y, 15, 0, Math.PI * 2);
      context.fillStyle = node.color ?? '#3498db';
      context.fill();
      context.stroke();

      context.fillStyle = 'black';
      context.fillText(node.name, node.x, node.y, 28);
    });

    context.restore();
  }

  #syncCanvasSize() {
    const canvasEl = this.canvas;
    const container = canvasEl.parentElement;
    const cssViewportWidth = container
        ? container.clientWidth
        : window.innerWidth;
    const cssViewportHeight = container
        ? container.clientHeight
        : window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreWidth = Math.max(1,
        Math.floor(cssViewportWidth * devicePixelRatio));
    const backingStoreHeight = Math.max(1,
        Math.floor(cssViewportHeight * devicePixelRatio));

    if (canvasEl.width !== backingStoreWidth || canvasEl.height !==
        backingStoreHeight) {
      canvasEl.width = backingStoreWidth;
      canvasEl.height = backingStoreHeight;
    }
    this._cssViewportWidth = cssViewportWidth;
    this._cssViewportHeight = cssViewportHeight;
    this._devicePixelRatio = devicePixelRatio;
  }
}
