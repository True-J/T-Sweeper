// js/saves.js
import { appState } from "./state.js";
import { dom } from "./dom.js";
import { capturePlayerMarks, applyPlayerMarks } from "./board.js";
import { snapshotRegionsForSave, restoreRegionsFromSave } from "./regions.js";

export function resetAllSaves() {
  appState.saveStates = [];
  appState.selectedSaveId = null;
  appState.nextSaveId = 1;
  renderSaveList();
}

export function renderSaveList() {
  if (!dom.saveList) return;
  dom.saveList.innerHTML = "";

  if (appState.saveStates.length === 0) {
    const empty = document.createElement("div");
    empty.style.fontSize = "13px";
    empty.textContent = "No save states";
    dom.saveList.appendChild(empty);
    return;
  }

  for (const s of appState.saveStates) {
    const item = document.createElement("div");
    item.className = "list-item";
    item.textContent = s.name;
    if (s.id === appState.selectedSaveId) item.classList.add("active");

    item.addEventListener("click", () => {
      appState.selectedSaveId = s.id;
      applyPlayerMarks(s.marks);
      restoreRegionsFromSave(s.regionsSave);
      renderSaveList();
    });
    dom.saveList.appendChild(item);
  }
}

export function wireSaveButtons() {
  dom.createSaveBtn?.addEventListener("click", () => {
    const marks = capturePlayerMarks();
    const regionsSave = snapshotRegionsForSave();

    const id = appState.nextSaveId++;

    let parentId = appState.selectedSaveId;
    let childIndex = 0;

    if (parentId != null) {
      const siblings = appState.saveStates.filter(s => s.parentId === parentId);
      childIndex = siblings.length;
    }

    const save = {
      id,
      parentId,
      childIndex,
      name: "", // set below
      createdAt: Date.now(),
      marks,
      regionsSave
    };

    save.name = `Save ${id}`;

    appState.saveStates.unshift(save);
    appState.selectedSaveId = save.id;
    renderSaveList();
  });

  dom.deleteSaveBtn?.addEventListener("click", () => {
    if (appState.selectedSaveId == null) return;

    const idx = appState.saveStates.findIndex((s) => s.id === appState.selectedSaveId);
    if (idx === -1) return;

    appState.saveStates.splice(idx, 1);

    if (appState.saveStates.length === 0) {
      appState.selectedSaveId = null;
    } else {
      const newIdx = Math.min(idx, appState.saveStates.length - 1);
      appState.selectedSaveId = appState.saveStates[newIdx].id;
    }

    renderSaveList();
  });
}
