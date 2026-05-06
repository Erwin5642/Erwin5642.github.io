export class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this._cssViewportWidth = 0;
    this._cssViewportHeight = 0;
    this._devicePixelRatio = 1;
    this._renderModel = null;

    this.#syncCanvasSize();
    requestAnimationFrame(() => this.#syncCanvasSize());
    window.addEventListener('resize', () => this.#syncCanvasSize());
  }

  setRenderModel(renderModel) {
    this._renderModel = renderModel ?? null;
  }

  get renderModel() {
    return this._renderModel;
  }

  draw() {
    if (!this._renderModel) {
      return;
    }

    this.#syncCanvasSize();
    const context = this.context;
    const canvas = this.canvas;
    const cssWidth = this._cssViewportWidth;
    const cssHeight = this._cssViewportHeight;
    const devicePixelRatio = this._devicePixelRatio;

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    this._renderModel.draw(context, {
      widthCss: cssWidth,
      heightCss: cssHeight,
      devicePixelRatio,
    });
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
