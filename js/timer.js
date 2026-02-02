// js/timer.js
import { appState, savePuzzleProgress } from "./state.js";
import { dom } from "./dom.js";
import { capturePlayerMarks } from "./board.js";

let timerIntervalId = null;

function tick() {
  updateTimerHud();
  // Auto-save progress every tick
  autoSaveProgress();
}

function autoSaveProgress() {
  // Only save if a puzzle is currently being played
  if (!appState.playingPuzzle || !appState.curPuzzle.name) return;
  
  const progress = capturePlayerMarks();
  savePuzzleProgress(
    appState.curPuzzle.name,
    progress,
    appState.timerStartMs,
    appState.curPuzzle.isLeaderboardAttempt,
    dom.notesText ? dom.notesText.value : "",
    appState.regions,
    appState.saveStates
  );
}

export function startTimer(resumeStartTimeMs = null) {
  stopTimer(); // always reset (prevents multiple intervals)
  if (resumeStartTimeMs !== null) {
    // Resuming: adjust startMs so elapsed time includes previous session
    const elapsedSoFar = Date.now() - resumeStartTimeMs;
    appState.timerStartMs = Date.now() - elapsedSoFar;
  } else {
    // Fresh start
    appState.timerStartMs = Date.now();
  }
  timerIntervalId = setInterval(tick, 1000);
}

export function stopTimer() {
  if (timerIntervalId == null) return;
  clearInterval(timerIntervalId);
  timerIntervalId = null;
}

export function updateTimerHud() {
  if (!dom.timeHud) return;

  if (!appState.timerStartMs) {
    dom.timeHud.textContent = "00:00:00";
    return;
  }
  const diff = Date.now() - appState.timerStartMs;
  const totalSec = Math.floor(diff / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  dom.timeHud.textContent = `${hh}:${mm}:${ss}`;
}