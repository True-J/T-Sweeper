// js/hud.js
import { BOARD_SIZE, appState } from "./state.js";
import { dom } from "./dom.js";
import { getCellEl } from "./board.js";

export function computeTotalMinesFromSolved() {
  let count = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const v = appState.curPuzzle.solvedPuzzle?.[r]?.[c];
      if (v === "F" || v === "f" || v === "f2" || v === "f3") count++;
    }
  }
  return count;
}

export function computeCurrentFoundMines() {
  let found = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = getCellEl(r, c);
      if (!cell) continue;
      if (cell.textContent === "F" || cell.textContent === "f") found++;
    }
  }
  return found;
}

export function updateMineHud() {
  if (!dom.mineHud) return;
  const found = computeCurrentFoundMines();
  dom.mineHud.textContent = `${found} / ${appState.puzzleTotalMines} Mines`;
}
