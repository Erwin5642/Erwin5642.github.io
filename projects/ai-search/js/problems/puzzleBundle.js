import {DEFAULT_INITIAL_CONFIGURATION, DEFAULT_GOAL_CONFIGURATION} from '../data/puzzleData.js';
import {RenderModel} from '../render/RenderModel.js';
import {createPuzzleProblem} from './problemFactories.js';

export const puzzleProblem = createPuzzleProblem(
    DEFAULT_INITIAL_CONFIGURATION,
    DEFAULT_GOAL_CONFIGURATION,
);

function resetPuzzle(problem, model) {
  model.board = problem.initialState;
}

const TILE_COLORS = {
  1: '#fecaca',
  2: '#fed7aa',
  3: '#fde68a',
  4: '#bbf7d0',
  5: '#cff3d0',
  6: '#bae6fd',
  7: '#c7d2fe',
  8: '#ddd6fe',
};

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawPuzzle(ctx, viewport, model) {
  const {widthCss, heightCss} = viewport;
  const board = model.board;
  if (!board) return;

  const pad = 40;
  const boardSize = Math.min(widthCss, heightCss) - 2 * pad;
  const cellSize = boardSize / 3;
  const originX = (widthCss - boardSize) / 2;
  const originY = (heightCss - boardSize) / 2;

  ctx.fillStyle = '#1f2937';
  drawRoundedRect(ctx, originX - 6, originY - 6, boardSize + 12, boardSize + 12, 14);
  ctx.fill();

  ctx.fillStyle = '#f9fafb';
  drawRoundedRect(ctx, originX, originY, boardSize, boardSize, 10);
  ctx.fill();

  const gap = 6;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const tile = board[row][col];
      const x = originX + col * cellSize + gap;
      const y = originY + row * cellSize + gap;
      const w = cellSize - 2 * gap;
      const h = cellSize - 2 * gap;
      const isEmpty = tile === 'x';

      if (isEmpty) {
        ctx.fillStyle = '#e5e7eb';
        drawRoundedRect(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        continue;
      }

      ctx.fillStyle = TILE_COLORS[tile] ?? '#e0e7ff';
      drawRoundedRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1f2937';
      ctx.font = `bold ${Math.floor(cellSize * 0.45)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(tile), x + w / 2, y + h / 2);
    }
  }
}

function updatePuzzle(newState, previousState, model) {
  model.board = newState;
}

export const puzzleRenderModel = new RenderModel(resetPuzzle, updatePuzzle, drawPuzzle);

export const puzzleBundle = Object.freeze({
  id: 'puzzle',
  name: 'Puzzle',
  problem: puzzleProblem,
  renderModel: puzzleRenderModel,
});

