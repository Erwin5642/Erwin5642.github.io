import {assertHandler} from '../utility/assert.js';

export class RenderModel {
  /**
   * @param {(problem: unknown, model: RenderModel) => void} reset
   * @param {(newState: unknown, previousState: unknown, model: RenderModel) => void} update
   * @param {(ctx: CanvasRenderingContext2D, viewport: object, model: RenderModel) => void} draw
   */
  constructor(reset, update, draw) {
    assertHandler('reset', reset);
    assertHandler('update', update);
    assertHandler('draw', draw);

    this._resetHandler = reset;
    this._updateHandler = update;
    this._drawHandler = draw;
    this.currentState = null;
    this.currentProblem = null;
    this.currentStep = 0;
  }

  reset(problem) {
    this.currentStep = 0;
    this.currentProblem = problem ?? null;
    this.currentState = problem?.initialState ?? null;
    this._resetHandler(problem, this);
  }

  update(newState) {
    const previousState = this.currentState;
    this.currentStep++;
    this.currentState = newState;
    this._updateHandler(newState, previousState, this);
  }

  draw(ctx, viewport) {
    const {widthCss} = viewport;
    ctx.font = '13px system-ui, sans-serif';
    ctx.strokeText(`Passo: ${this.currentStep}`, widthCss - 100, 50);
    ctx.save();
    this._drawHandler(ctx, viewport, this);
    ctx.restore();
  }
}