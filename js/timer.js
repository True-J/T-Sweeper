import { appState, savePuzzleProgress } from "./state.js";
import { dom } from "./dom.js";
import { capturePlayerMarks } from "./board.js";

let timerIntervalId = null;

export function getElapsedMs() {
  const runningDelta = appState.timerRunningStartMs
    ? (Date.now() - appState.timerRunningStartMs)
    : 0;
  return (appState.timerElapsedMs || 0) + runningDelta;
}

function autoSaveProgress() {
  if (!appState.playingPuzzle || !appState.curPuzzle?.name) return;

  const progress = capturePlayerMarks();
  savePuzzleProgress(
    appState.curPuzzle.name,
    progress,
    getElapsedMs(),
    appState.curPuzzle.isLeaderboardAttempt,
    dom.notesText ? dom.notesText.value : "",
    appState.regions,
    appState.saveStates
  );
}

function tick() {
  updateTimerHud();
  autoSaveProgress();
}

export function startTimer(resumeElapsedMs = 0) {
  stopTimer(); // freezes existing running time and clears interval

  appState.timerElapsedMs = Number(resumeElapsedMs) || 0;
  appState.timerRunningStartMs = Date.now();
  timerIntervalId = setInterval(tick, 1000);

  updateTimerHud();
}

export function stopTimer() {
  if (appState.timerRunningStartMs != null) {
    appState.timerElapsedMs = getElapsedMs();
    appState.timerRunningStartMs = null;
  }
  if (timerIntervalId != null) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }

  autoSaveProgress();
  updateTimerHud();
}

export function updateTimerHud() {
  if (!dom.timeHud) return;

  const ms = getElapsedMs();
  const totalSec = Math.floor(ms / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  dom.timeHud.textContent = `${hh}:${mm}:${ss}`;
}

// Pause when tab is hidden; resume when visible.
document.addEventListener("visibilitychange", () => {
  if (!appState.playingPuzzle) return;

  if (document.hidden) stopTimer();
  else if (appState.timerRunningStartMs == null) startTimer(appState.timerElapsedMs);
});

window.addEventListener("beforeunload", () => {
  if (!appState.playingPuzzle) return;
  stopTimer();
});