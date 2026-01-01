/* ==========================================================
   app.js — versión limpia y corregida (v5: Reseteo en Recarga + Persistencia de Dolor)
   Requiere: ejercicios.js + html2canvas + rutinas.html
   ========================================================== */

// Elementos del DOM
const dateInput = document.getElementById("date-input");
const weekSelect = document.getElementById("week-select");
const daySelect = document.getElementById("day-select");

const loadBtn = document.getElementById("load-routine-btn");
const deleteRoutineBtn = document.getElementById("delete-routine-btn");
const exportBtn = document.getElementById("export-png-btn"); 
const saveSessionBtn = document.getElementById("save-session-btn");
const saveSessionMessage = document.getElementById("save-session-message");
const saveSessionError = document.getElementById("save-session-error");
const postWorkoutSection = document.getElementById("post-workout-section");
const saveRoutineBtn = document.getElementById("save-routine-btn");
const saveRoutineMessage = document.getElementById("save-routine-message");
const saveRoutineError = document.getElementById("save-routine-error");

const mainExercisesContainer = document.getElementById("exercises-container");
const editExercisesContainer = document.getElementById("edit-exercises-container");
let exercisesContainer = mainExercisesContainer;
const statusText = document.getElementById("status-text");

const userHistoryControls = document.getElementById("user-history-controls");
const userHistorySelect = document.getElementById("user-history-select");
const newUserHistoryBtn = document.getElementById("new-user-history-btn");
const renameUserHistoryBtn = document.getElementById("rename-user-history-btn");
const deleteUserHistoryBtn = document.getElementById("delete-user-history-btn");
const exportUserHistoryBtn = document.getElementById("export-user-history-btn");
const exportUserHistoryCsvBtn = document.getElementById("export-user-history-csv-btn");
const importMergeHistoryBtn = document.getElementById("import-merge-history-btn");
const importMergeHistoryInput = document.getElementById("import-merge-history-input");
const userHistoryStatus = document.getElementById("user-history-status");
const appContent = document.getElementById("app-content");
const importOverlay = document.getElementById("import-overlay");
const importUserSelect = document.getElementById("import-user-select");
const importOverlayCancel = document.getElementById("import-overlay-cancel");
const importOverlayConfirm = document.getElementById("import-overlay-confirm");
const manageUserOverlay = document.getElementById("manage-user-overlay");
const manageUserClose = document.getElementById("manage-user-close");
const manageUserHistoryBtn = document.getElementById("manage-user-history-btn");
const historyMenuOverlay = document.getElementById("history-menu-overlay");
const historyMenuClose = document.getElementById("history-menu-close");
const step0 = document.getElementById("step-0");
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");
const step4 = document.getElementById("step-4");
const step5 = document.getElementById("step-5");
const step6 = document.getElementById("step-6");
const step7 = document.getElementById("step-7");
const step3Body = document.getElementById("step-3-body");
const step7Body = document.getElementById("step-7-body");
const step1Status = document.getElementById("step-1-status");
const step2Status = document.getElementById("step-2-status");
const step3Status = document.getElementById("step-3-status");
const step4Status = document.getElementById("step-4-status");
const step5Status = document.getElementById("step-5-status");
const step6Status = document.getElementById("step-6-status");
const stepperPrevBtn = document.getElementById("stepper-prev");
const stepperNextBtn = document.getElementById("stepper-next");
const subheader = document.getElementById("subheader");
const toggleUserManageBtn = document.getElementById("toggle-user-manage");
const toggleStopwatchBtn = document.getElementById("toggle-stopwatch");
const toggleQuickAddBtn = document.getElementById("toggle-quick-add");
const toggleFastModeBtn = document.getElementById("toggle-fast-mode");
const fastModeLabel = document.getElementById("fast-mode-label");
const autoSaveStatus = document.getElementById("autosave-status");
const exerciseEmptyState = document.getElementById("exercise-empty-state");
const welcomeStartBtn = document.getElementById("welcome-start-btn");
const welcomeInfoBtn = document.getElementById("welcome-info-btn");
const welcomeLegalBtn = document.getElementById("welcome-legal-btn");
const welcomeInfoPanel = document.getElementById("welcome-info");
const welcomeLegalPanel = document.getElementById("welcome-legal");
const exerciseCounter = document.getElementById("exercise-counter");
const exercisePrevBtn = document.getElementById("exercise-prev");
const exerciseNextBtn = document.getElementById("exercise-next");
const saveRoutineControls = document.getElementById("save-routine-controls");
const homeLogoBtn = document.getElementById("home-logo-btn");
const historyDateInput = document.getElementById("history-date-input");
const historyViewBtn = document.getElementById("history-view-btn");
const historyEditBtn = document.getElementById("history-edit-btn");
const historyViewOverlay = document.getElementById("history-view-overlay");
const historyViewContent = document.getElementById("history-view-content");
const historyViewClose = document.getElementById("history-view-close");
const sessionSummary = document.getElementById("session-summary");

const LOCAL_HISTORY_KEY = "gym_history_v1";
const USER_LIST_KEY = "gym_user_list";
const CUSTOM_ROUTINES_KEY = "gym_custom_routines_v1";

function getSafeStorage() {
  try {
    const testKey = "__gym_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (err) {
    const memory = new Map();
    return {
      getItem: key => (memory.has(key) ? memory.get(key) : null),
      setItem: (key, value) => {
        memory.set(key, String(value));
      },
      removeItem: key => {
        memory.delete(key);
      },
      key: index => Array.from(memory.keys())[index] ?? null,
      get length() {
        return memory.size;
      }
    };
  }
}

const storage = getSafeStorage();

let currentUserName = "";
let currentUserKey = "";
const stepPages = [step0, step1, step2, step3, step4, step5, step6, step7].filter(Boolean);
let activeStepIndex = 0;
let pendingStartStepIndex = null;
let activeExerciseIndex = 0;
let exercisePaginationScheduled = false;
let showAllExercises = false;
let lastAutoSaveTime = null;
let autoSaveTimer = null;
let editingSessionContext = null;
let isFastMode = false;

function normalizeUserName(name) {
  return name.trim().replace(/\s+/g, "_");
}

function loadUserList() {
  let list = [];
  let changed = false;
  try {
    const raw = storage.getItem(USER_LIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      if (parsed.length && typeof parsed[0] === "string") {
        list = parsed
          .filter(item => typeof item === "string" && item.trim())
          .map(item => ({ name: item.trim(), key: normalizeUserName(item.trim()) }));
      } else {
        list = parsed.filter(item => item && typeof item.name === "string" && typeof item.key === "string");
      }
    }
  } catch (err) {
    list = [];
  }

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    const prefix = `${LOCAL_HISTORY_KEY}_`;
    if (!key.startsWith(prefix)) continue;
    const userKey = key.slice(prefix.length);
    if (!userKey) continue;
    const exists = list.some(item => item.key === userKey);
    if (!exists) {
      list.push({ name: userKey.replace(/_/g, " "), key: userKey });
      changed = true;
    }
  }

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    const match = key.match(/^gym_(.*?)_\d{4}-\d{2}-\d{2}_/);
    if (!match) continue;
    const userKey = match[1];
    if (!userKey) continue;
    const exists = list.some(item => item.key === userKey);
    if (!exists) {
      list.push({ name: userKey.replace(/_/g, " "), key: userKey });
      changed = true;
    }
  }

  const lastUser = storage.getItem("gym_user_name") || "";
  if (lastUser.trim()) {
    const lastKey = normalizeUserName(lastUser.trim());
    const exists = list.some(item => item.key === lastKey);
    if (!exists) {
      list.push({ name: lastUser.trim(), key: lastKey });
      changed = true;
    }
  }

  if (changed) {
    storage.setItem(USER_LIST_KEY, JSON.stringify(list));
  }

  return list;
}

function saveUserList(list) {
  storage.setItem(USER_LIST_KEY, JSON.stringify(list));
}

function promptForNewUserName(defaultValue) {
  const input = prompt("Nombre del nuevo usuario:", defaultValue || "");
  if (input == null) return "";
  return input.trim();
}

function setCurrentUser(name, key) {
  currentUserName = name;
  currentUserKey = key;
  storage.setItem("gym_user_name", currentUserName);
}

function refreshCharts() {
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}

function setFastMode(enabled) {
  isFastMode = enabled;
  document.body.classList.toggle("fast-mode", enabled);
  if (toggleFastModeBtn) {
    toggleFastModeBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
  }
  if (fastModeLabel) {
    fastModeLabel.textContent = enabled ? "Básico" : "Avanzado";
  }
  storage.setItem("gym_fast_mode", enabled ? "1" : "0");
}

function refreshHistoryUI() {
  if (!historyDateInput) return;
  const sessions = window.uploadedHistory || [];
  const latest = sessions
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
  if (latest && (!historyDateInput.value || historyDateInput.value === "")) {
    historyDateInput.value = latest.date || "";
  }
  updateHistoryButtons();
}

function updateHistoryButtons() {
  if (!historyDateInput) return;
  const dateStr = historyDateInput.value;
  const hasSession = Boolean(
    dateStr && (window.uploadedHistory || []).some(session => session.date === dateStr)
  );
  if (historyViewBtn) historyViewBtn.disabled = !hasSession;
  if (historyEditBtn) historyEditBtn.disabled = !hasSession;
}

function getSelectedHistorySession() {
  const dateStr = historyDateInput?.value || "";
  if (!dateStr) return null;
  const sessions = (window.uploadedHistory || []).filter(session => session.date === dateStr);
  if (!sessions.length) return null;
  const sorted = sessions.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return sorted[0];
}

function openHistoryViewOverlay(session) {
  if (!historyViewOverlay || !historyViewContent || !session) return;
  const exercises = Array.isArray(session.exercises) ? session.exercises : [];
  const lines = [
    `Fecha: ${session.date || "-"}`,
    `Semana: ${session.week || "-"}`,
    `Dia: ${session.day || "-"}`,
    `Ejercicios: ${exercises.length}`
  ];
  exercises.forEach(ex => {
    const sets = Array.isArray(ex.sets) ? ex.sets.length : 0;
    lines.push(`- ${ex.nombre || "Ejercicio"} (${sets} series)`);
  });
  historyViewContent.textContent = lines.join("\n");
  historyViewOverlay.style.display = "flex";
  historyViewOverlay.setAttribute("aria-hidden", "false");
}

function closeHistoryViewOverlay() {
  if (!historyViewOverlay) return;
  historyViewOverlay.style.display = "none";
  historyViewOverlay.setAttribute("aria-hidden", "true");
}

function ensureSelectValue(selectEl, value) {
  if (!selectEl || !value) return;
  const exists = Array.from(selectEl.options).some(opt => opt.value === value);
  if (!exists) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    selectEl.appendChild(opt);
  }
  selectEl.value = value;
}

function renameUserHistory(userKey, newName) {
  const userList = loadUserList();
  const entry = userList.find(u => u.key === userKey);
  if (!entry) {
    alert("Selecciona un usuario válido.");
    return;
  }
  const trimmed = newName.trim();
  if (!trimmed) return;
  const newKey = normalizeUserName(trimmed);
  if (newKey !== userKey && userList.some(u => u.key === newKey)) {
    alert("Ya existe un usuario con ese nombre.");
    return;
  }

  const sessions = getLocalHistoryForUser(userKey).map(session => ({
    ...session,
    user: trimmed,
    key: buildSessionKeyForUser(session, newKey)
  }));
  setLocalHistoryForUser(newKey, sessions);
  if (newKey !== userKey) {
    storage.removeItem(getHistoryStorageKeyForUser(userKey));
  }

  entry.name = trimmed;
  entry.key = newKey;
  saveUserList(userList);

  if (currentUserKey === userKey) {
    setCurrentUser(trimmed, newKey);
    loadLocalHistory();
    loadSession();
  }

  refreshUserSelect();
  if (userHistorySelect) userHistorySelect.value = newKey;
  setUserHistoryStatus(`Histórico renombrado a ${trimmed}.`);
}

function resolveUserEntry(selectedKey) {
  const userList = loadUserList();
  let entry = userList.find(u => u.key === selectedKey);
  if (!entry && selectedKey) {
    const normalized = normalizeUserName(selectedKey);
    entry = userList.find(u => u.key === normalized)
      || userList.find(u => u.name.toLowerCase() === selectedKey.toLowerCase());
  }
  return entry;
}

function deleteUserHistory(userKey) {
  const userList = loadUserList();
  const entry = resolveUserEntry(userKey);
  const entryIndex = entry ? userList.findIndex(u => u.key === entry.key) : -1;
  if (entryIndex === -1) {
    alert("Selecciona un usuario válido.");
    return;
  }
  const ok = confirm(`Eliminar el usuario "${entry.name}"? Esta acción no se puede deshacer.`);
  if (!ok) return;

  storage.removeItem(getHistoryStorageKeyForUser(entry.key));
  const prefix = `gym_${entry.key}_`;
  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i) || "";
    if (key.startsWith(prefix)) {
      storage.removeItem(key);
      continue;
    }
    if (!key.startsWith("gym_")) continue;
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.user === entry.name) {
        storage.removeItem(key);
      }
    } catch (err) {
      // Ignore malformed entries.
    }
  }

  const legacyKey = "gym_history_v1";
  const legacyRaw = storage.getItem(legacyKey);
  if (legacyRaw) {
    try {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        const filtered = legacyParsed.filter(item => item?.user !== entry.name);
        if (filtered.length === 0) {
          storage.removeItem(legacyKey);
        } else {
          storage.setItem(legacyKey, JSON.stringify(filtered));
        }
      }
    } catch (err) {
      // Ignore malformed legacy entries.
    }
  }

  userList.splice(entryIndex, 1);
  saveUserList(userList);

  const storedName = storage.getItem("gym_user_name");
  if (currentUserKey === entry.key || storedName === entry.name) {
    currentUserKey = "";
    currentUserName = "";
    storage.removeItem("gym_user_name");
    setAppEnabled(false);
    setAppVisible(false);
  }

  refreshUserSelect();
  setUserHistoryStatus("Histórico eliminado.");
}

function setUserHistoryStatus(msg) {
  if (userHistoryStatus) userHistoryStatus.textContent = msg;
}

function refreshUserSelect() {
  const userList = loadUserList();
  if (!userHistorySelect) return userList;
  userHistorySelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecciona un usuario";
  placeholder.disabled = true;
  placeholder.selected = true;
  userHistorySelect.appendChild(placeholder);

  if (!userList.length) {
    userHistorySelect.disabled = true;
    setUserHistoryStatus("No hay usuarios. Crea uno nuevo para empezar.");
    return userList;
  }

  userList.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user.key;
    opt.textContent = user.name;
    userHistorySelect.appendChild(opt);
  });
  userHistorySelect.disabled = false;
  setUserHistoryStatus("Selecciona un usuario para continuar");
  return userList;
}

function setAppVisible(isVisible) {
  if (!appContent) return;
  appContent.style.display = isVisible ? "block" : "none";
  if (!isVisible) {
    setActiveStep(0, { skipScroll: true });
  } else {
    updateStepNavigation();
  }
}

function setAppEnabled(enabled) {
  const main = document.querySelector("main");
  if (!main) return;
  const controls = main.querySelectorAll("input, select, button, textarea");
  controls.forEach(el => {
    if (userHistoryControls && userHistoryControls.contains(el)) return;
    if (step0 && step0.contains(el)) return;
    el.disabled = !enabled;
  });
}

function initializeForUserSelection() {
  refreshUserSelect();
  setAppEnabled(false);
  setAppVisible(false);
  updateStepStatus();
}

function activateSelectedUser(userKey) {
  const userList = loadUserList();
  const selected = userList.find(u => u.key === userKey);
  if (!selected) {
    alert("Selecciona un usuario válido.");
    return;
  }
  setCurrentUser(selected.name, selected.key);
  loadLocalHistory();
  hydrateHistoryFromSessionKeys();
  setAppEnabled(true);
  setAppVisible(true);
  populateRoutineSelectors();
  checkSensationsForm();
  setUserHistoryStatus(`Usuario activo: ${selected.name}`);
  updateStepStatus();
  scheduleExercisePagination(true);
  if (pendingStartStepIndex != null) {
    const targetIndex = pendingStartStepIndex;
    pendingStartStepIndex = null;
    setActiveStep(targetIndex);
  }
}

function updateStepStatus() {
  const hasUser = Boolean(currentUserKey);
  const hasExercises = exercisesContainer && exercisesContainer.children.length > 0;
  const postWorkoutComplete = isPostWorkoutComplete();

  if (step1Status) step1Status.textContent = hasUser ? "Completado" : "Pendiente";
  if (step2Status) step2Status.textContent = hasExercises ? "Completado" : "Opcional";
  if (step3Status) step3Status.textContent = hasExercises ? "En progreso" : "Pendiente";
  if (step4Status) {
    step4Status.textContent = postWorkoutComplete
      ? "Completado"
      : hasExercises
        ? "En progreso"
        : "Bloqueado";
  }
  if (step5Status) {
    step5Status.textContent = postWorkoutComplete && isSessionSavedToHistory()
      ? "Disponible"
      : "Bloqueado";
  }
  if (step6Status) step6Status.textContent = hasUser ? "Opcional" : "Pendiente";
  if (toggleUserManageBtn) toggleUserManageBtn.disabled = !hasUser;
  if (postWorkoutSection) {
    postWorkoutSection.classList.toggle("post-workout-locked", !hasExercises);
  }
  updateStepNavigation();
}

function updateExercisePagination(resetIndex = false) {
  if (!exercisesContainer) return;
  let cards = Array.from(exercisesContainer.querySelectorAll(".exercise-card"));
  if (!cards.length) {
    cards = Array.from(exercisesContainer.children).filter(node => node.nodeType === 1);
    cards.forEach(card => card.classList.add("exercise-card"));
  }
  const total = cards.length;
  if (resetIndex) {
    activeExerciseIndex = 0;
  }
  if (total === 0) {
    if (exerciseCounter) exerciseCounter.textContent = "Ejercicio 0 de 0";
    if (exercisePrevBtn) exercisePrevBtn.disabled = true;
    if (exerciseNextBtn) exerciseNextBtn.disabled = true;
    if (saveRoutineControls) saveRoutineControls.style.display = "none";
    if (exerciseEmptyState) exerciseEmptyState.style.display = "block";
    return;
  }
  if (exerciseEmptyState) exerciseEmptyState.style.display = "none";

  if (showAllExercises) {
    cards.forEach(card => {
      card.style.display = "block";
    });
    if (exerciseCounter) exerciseCounter.textContent = `Ejercicios: ${total}`;
    if (exercisePrevBtn) exercisePrevBtn.disabled = true;
    if (exerciseNextBtn) exerciseNextBtn.disabled = true;
    if (saveRoutineControls) saveRoutineControls.style.display = "none";
    return;
  }

  activeExerciseIndex = Math.max(0, Math.min(activeExerciseIndex, total - 1));
  cards.forEach((card, idx) => {
    card.style.display = idx === activeExerciseIndex ? "block" : "none";
  });
  if (exerciseCounter) {
    exerciseCounter.textContent = `Ejercicio ${activeExerciseIndex + 1} de ${total}`;
  }
  if (exercisePrevBtn) exercisePrevBtn.disabled = activeExerciseIndex === 0;
  if (exerciseNextBtn) exerciseNextBtn.disabled = activeExerciseIndex >= total - 1;
  if (saveRoutineControls) {
    saveRoutineControls.style.display = activeExerciseIndex === total - 1 ? "flex" : "none";
  }
}

function scheduleExercisePagination(resetIndex = false) {
  if (resetIndex) activeExerciseIndex = 0;
  if (exercisePaginationScheduled) return;
  exercisePaginationScheduled = true;
  requestAnimationFrame(() => {
    exercisePaginationScheduled = false;
    updateExercisePagination(false);
  });
}

function isAppVisible() {
  return appContent && appContent.style.display !== "none";
}

function getMaxStepIndex() {
  if (isAppVisible()) {
    let maxIndex = stepPages.length - 1;
    const step5Index = stepPages.indexOf(step5);
    const step4Index = stepPages.indexOf(step4);
    const step6Index = stepPages.indexOf(step6);
    const step7Index = stepPages.indexOf(step7);
    if (!isPostWorkoutComplete() && step5Index > 0) {
      maxIndex = Math.min(maxIndex, step5Index - 1);
      if (step4Index >= 0) {
        maxIndex = Math.max(maxIndex, step4Index);
      }
    }
    if (!isSessionSavedToHistory() && step5Index > 0) {
      maxIndex = Math.min(maxIndex, step5Index - 1);
      if (step4Index >= 0) {
        maxIndex = Math.max(maxIndex, step4Index);
      }
    }
    if (!editingSessionContext && step7Index >= 0 && step6Index >= 0) {
      maxIndex = Math.min(maxIndex, step6Index);
    }
    return maxIndex;
  }
  const loginIndex = stepPages.indexOf(step1);
  if (loginIndex >= 0) return loginIndex;
  return Math.min(1, stepPages.length - 1);
}

function isSessionSavedToHistory() {
  if (!currentUserKey) return false;
  const key = sessionKey();
  if (!key) return false;
  return getLocalHistory().some(session => session.key === key);
}

function updateStepNavigation() {
  if (!stepPages.length) return;
  const maxIndex = getMaxStepIndex();
  if (activeStepIndex > maxIndex) {
    activeStepIndex = maxIndex;
  }
  const activeStep = stepPages[activeStepIndex];

  if (subheader) {
    const step2Index = stepPages.indexOf(step2);
    const step3Index = stepPages.indexOf(step3);
    const showFromStep2 = step2Index >= 0 && activeStepIndex >= step2Index;
    const isStep3 = step3Index >= 0 && activeStepIndex === step3Index;
    subheader.classList.toggle("is-visible", showFromStep2);

    if (toggleUserManageBtn) {
      toggleUserManageBtn.style.display = showFromStep2 ? "flex" : "none";
    }
    if (toggleStopwatchBtn) {
      toggleStopwatchBtn.style.display = isStep3 ? "flex" : "none";
    }
    if (toggleQuickAddBtn) {
      toggleQuickAddBtn.style.display = isStep3 ? "flex" : "none";
    }
    if (toggleFastModeBtn) {
      toggleFastModeBtn.style.display = isStep3 ? "flex" : "none";
    }

    if (!isStep3) {
      if (typeof closeStopwatchOverlay === "function") closeStopwatchOverlay();
      if (typeof closeQuickAddOverlay === "function") closeQuickAddOverlay();
      if (isFastMode) setFastMode(false);
    }
  }
  updateHeaderOffsets();

  if (stepperPrevBtn) {
    stepperPrevBtn.disabled = activeStepIndex === 0;
    stepperPrevBtn.style.display = activeStepIndex === 0 ? "none" : "inline-flex";
  }
  if (stepperNextBtn) {
    const atLast = activeStepIndex >= maxIndex;
    const canMoveNext = !atLast;
    stepperNextBtn.disabled = !canMoveNext;
    stepperNextBtn.style.display = activeStepIndex === 0 ? "none" : "inline-flex";
  }
}

function updateHeaderOffsets() {
  const header = document.getElementById("compact-header");
  if (!header) return;
  const headerHeight = header.offsetHeight || 0;
  if (subheader) {
    subheader.style.top = `${headerHeight}px`;
  }
  const subheaderHeight = subheader && subheader.classList.contains("is-visible")
    ? (subheader.offsetHeight || 0)
    : 0;
  const spacing = 12;
  document.body.style.paddingTop = `${headerHeight + subheaderHeight + spacing}px`;
}

function updateAutoSaveLabel() {
  if (!autoSaveStatus) return;
  if (!lastAutoSaveTime) {
    autoSaveStatus.textContent = "";
    return;
  }
  const diffSeconds = Math.floor((Date.now() - lastAutoSaveTime) / 1000);
  if (diffSeconds < 2) {
    autoSaveStatus.textContent = "Guardado ahora";
    return;
  }
  autoSaveStatus.textContent = `Guardado hace ${diffSeconds} s`;
}

function markAutoSaved() {
  lastAutoSaveTime = Date.now();
  updateAutoSaveLabel();
  if (!autoSaveTimer) {
    autoSaveTimer = setInterval(updateAutoSaveLabel, 15000);
  }
}

function updateSessionSummary() {
  if (!sessionSummary) return;
  if (exercisesContainer !== mainExercisesContainer) return;
  const key = sessionKey();
  const saved = JSON.parse(storage.getItem(key) || "null");
  if (!saved) {
    sessionSummary.textContent = "Sin datos de sesión.";
    return;
  }
  sessionSummary.innerHTML = "";
  const exportContent = buildExportContent(saved, { variant: "web" });
  sessionSummary.appendChild(exportContent);
}

function buildExportContent(saved, options = {}) {
  const variant = options.variant || "png";
  const usePngStyles = variant === "png";
  const isDarkTheme = document.documentElement.classList.contains("dark");
  const exportDiv = document.createElement("div");
  if (usePngStyles) {
    exportDiv.style.background = "white";
    exportDiv.style.padding = "20px";
    exportDiv.style.fontFamily = "sans-serif";
    exportDiv.style.width = "fit-content";
    exportDiv.style.color = "#000";
  } else {
    exportDiv.className = "session-summary";
  }

  const title = document.createElement("h2");
  const dateObj = new Date(saved.date);
  const isValidDate = !isNaN(dateObj);
  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    : saved.date;
  const weekday = isValidDate
    ? dateObj.toLocaleDateString("es-ES", { weekday: "long" })
    : "";
  const weekdayText = weekday ? ` (${weekday})` : "";
  title.textContent = `${formattedDate}${weekdayText}`;
  if (usePngStyles) {
    title.style.color = "#000";
  } else {
    title.className = "session-summary-title";
  }
  exportDiv.appendChild(title);

  const table = document.createElement("table");
  if (usePngStyles) {
    const headerBg = isDarkTheme ? "#000" : "#e5e7eb";
    const headerText = isDarkTheme ? "#fff" : "#000";
    table.style.borderCollapse = "separate";
    table.style.borderSpacing = "0";
    table.style.fontSize = "12px";
    table.style.color = "#000";
    table.innerHTML = `
      <tr style="background:${headerBg}; font-weight:bold;">
        <th style="border:1px solid #000; padding:4px; color:${headerText};">Ejercicio</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">Serie</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">Peso/<br>Intensidad</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">Reps/<br>Tiempo</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">Fallo</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">Reps fallo</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">Notas</th>
      </tr>
    `;
  } else {
    table.className = "session-summary-mini-table";
    table.innerHTML = `
      <tr class="session-summary-head">
        <th>Ejercicio</th>
        <th>Series</th>
        <th>Peso máx / Tiempo</th>
        <th>Fallo</th>
      </tr>
    `;
  }

  let totalExercises = 0;
  let totalSets = 0;

  saved.exercises.forEach((ex, exIndex) => {
    const groupBg = usePngStyles
      ? (exIndex % 2 === 0 ? "#e2e8f0" : "#f8fafc")
      : (exIndex % 2 === 0 ? "var(--control-bg)" : "var(--card-bg)");
    totalExercises += 1;

    const isCardio = String(ex.musculo || "").toLowerCase() === "cardio";
    if (!usePngStyles) {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      const seriesCount = sets.length;
      const weights = sets
        .map(set => parseFloat(set.peso))
        .filter(value => !Number.isNaN(value));
      const times = sets
        .map(set => parseFloat(set.tiempo ?? set.reps))
        .filter(value => !Number.isNaN(value));
      const maxWeight = isCardio ? "-" : (weights.length ? Math.max(...weights) : "-");
      const maxTime = isCardio ? (times.length ? Math.max(...times) : "-") : "-";
      const hasFailure = isCardio
        ? "-"
        : sets.some(set => set.fallo === true) ? "Sí" : "No";
      const weightOrTime = isCardio
        ? (maxTime !== "-" ? `${maxTime} min` : "-")
        : (maxWeight !== "-" ? `${maxWeight} kg` : "-");
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ex.nombre || "Ejercicio"}</td>
        <td>${seriesCount}</td>
        <td>${weightOrTime}</td>
        <td>${hasFailure}</td>
      `;
      table.appendChild(row);
      return;
    }

    ex.sets.forEach((set, setIndex) => {
      totalSets += 1;
      const displayPeso = isCardio ? (set.intensidad ?? set.peso ?? "") : (set.peso ?? "");
      const displayReps = isCardio ? (set.tiempo ?? set.reps ?? "") : (set.reps ?? "");
      const displayFallo = isCardio ? "" : (set.fallo ? "Sí" : "No");
      const displayRepsFallo = isCardio ? "" : (set.repsFallo ?? "");

      const tr = document.createElement("tr");
      tr.style.background = groupBg;
      if (setIndex === 0) {
        tr.style.borderTop = "2px solid #000";
      }
      if (usePngStyles) {
        tr.innerHTML = `
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; font-weight: bold;">${ex.nombre}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.serie ?? ""}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${displayPeso}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${displayReps}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${displayFallo}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${displayRepsFallo}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.obs ?? ""}</td>
        `;
      } else {
        tr.innerHTML = `
          <td style="background:${groupBg}; font-weight: 700;">${ex.nombre}</td>
          <td style="background:${groupBg};">${set.serie ?? ""}</td>
          <td style="background:${groupBg}; text-align:right;">${displayPeso}</td>
          <td style="background:${groupBg}; text-align:right;">${displayReps}</td>
          <td style="background:${groupBg};">${displayFallo}</td>
          <td style="background:${groupBg};">${displayRepsFallo}</td>
          <td style="background:${groupBg};">${set.obs ?? ""}</td>
        `;
      }
      table.appendChild(tr);
    });

    if (usePngStyles && exIndex < saved.exercises.length - 1) {
      const separator = document.createElement("tr");
      if (usePngStyles) {
        separator.innerHTML = `
          <td colspan="7" style="border-left:1px solid #000; border-right:1px solid #000; border-top:1px solid #777; padding:0; height:6px; background:#fff;"></td>
        `;
      }
      table.appendChild(separator);
    }
  });

  if (usePngStyles) {
    table.querySelectorAll("th, td").forEach(cell => {
      cell.style.borderColor = "#000";
    });
    table.querySelectorAll("td").forEach(cell => {
      cell.style.color = "#000";
    });
  }

  if (usePngStyles) {
    exportDiv.appendChild(table);
  } else {
    const tableWrap = document.createElement("div");
    tableWrap.className = "session-summary-table-wrap";
    tableWrap.appendChild(table);
    exportDiv.appendChild(tableWrap);
  }

  if (usePngStyles) {
    const summary = document.createElement("div");
    summary.style.marginTop = "8px";
    summary.style.fontSize = "12px";
    summary.style.color = "#000";
    summary.innerHTML = `
      <p style="margin: 3px 0; font-weight:bold; color:#000;">Resumen:</p>
      <p style="margin: 3px 0; color:#000;">- Total ejercicios: ${totalExercises}</p>
      <p style="margin: 3px 0; color:#000;">- Total series: ${totalSets}</p>
    `;
    exportDiv.appendChild(summary);

    const sensations = saved.sensations || {};
    const sensDiv = document.createElement("div");
    sensDiv.style.marginTop = "20px";
    sensDiv.style.borderTop = "1px solid #000";
    sensDiv.style.paddingTop = "10px";
    sensDiv.style.color = "#000";

    let painText = "";
    if (sensations.pain === "si") {
      painText = `Sí (${sensations.painZone || "Zona N/A"} - Ejercicio: ${sensations.painExercise || "N/A"})`;
    } else {
      painText = "No";
    }

    sensDiv.innerHTML = `
        <p style="font-weight:bold; margin: 3px 0; color:#000; font-size:14px;">Métricas Subjetivas:</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">- Sensaciones generales (0-10): ${sensations.general || "N/A"}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">- Cansancio percibido (0-10): ${sensations.tiredness || "N/A"}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">- Dolor en algún músculo: ${painText}</p>
    `;
    exportDiv.appendChild(sensDiv);

    const footer = document.createElement("p");
    footer.textContent = "Registrado con GymTracker by Borja Aguado";
    footer.style.fontSize = "10px";
    footer.style.textAlign = "right";
    footer.style.marginTop = "15px";
    footer.style.color = "#000";
    exportDiv.appendChild(footer);
  }

  return exportDiv;
}

function setActiveStep(index, options = {}) {
  if (!stepPages.length) return;
  const maxIndex = getMaxStepIndex();
  let nextIndex = Math.max(0, Math.min(index, maxIndex));

  const step7Index = stepPages.indexOf(step7);
  const enteringStep7 = step7Index >= 0 && nextIndex === step7Index;
  const leavingStep7 = step7Index >= 0 && activeStepIndex === step7Index && nextIndex !== step7Index;
  if (enteringStep7 && editExercisesContainer) {
    exercisesContainer = editExercisesContainer;
    showAllExercises = true;
  }
  if (leavingStep7) {
    exercisesContainer = mainExercisesContainer;
    showAllExercises = false;
    if (editExercisesContainer) editExercisesContainer.innerHTML = "";
    if (editingSessionContext) {
      if (dateInput) dateInput.value = editingSessionContext.date || "";
      if (weekSelect) {
        ensureSelectValue(weekSelect, editingSessionContext.week || "");
      }
      if (daySelect) {
        if (weekSelect) populateDaySelect(weekSelect.value);
        ensureSelectValue(daySelect, editingSessionContext.day || "");
      }
      loadSession();
      editingSessionContext = null;
    }
  }

  activeStepIndex = nextIndex;
  stepPages.forEach((step, idx) => {
    if (!step) return;
    step.classList.toggle("active", idx === activeStepIndex);
    step.setAttribute("aria-hidden", idx === activeStepIndex ? "false" : "true");
    if ("open" in step) {
      step.open = idx === activeStepIndex;
    }
  });

  updateStepNavigation();
}

function initializeStepper() {
  if (!stepPages.length) return;

  if (stepperPrevBtn) {
    stepperPrevBtn.addEventListener("click", () => setActiveStep(activeStepIndex - 1));
  }
  if (stepperNextBtn) {
    stepperNextBtn.addEventListener("click", () => setActiveStep(activeStepIndex + 1));
  }

  setActiveStep(activeStepIndex, { skipScroll: true });
}

// CAMPOS DE SENSACIONES
const senseGeneralInput = document.getElementById("sense-general");
const senseTirednessInput = document.getElementById("sense-tiredness");
const senseWeightInput = document.getElementById("sense-weight");
const sensePainSelect = document.getElementById("sense-pain");
const painDetailsDiv = document.getElementById("pain-details");
const painZoneInput = document.getElementById("pain-zone");
const painExerciseSelect = document.getElementById("pain-exercise");

// MAPA DE GRUPOS MUSCULARES
const muscleGroupMap = {
  "Pectoral": "Pecho",
  "Deltoides": "Hombros",
  "Bíceps": "Brazos",
  "Tríceps": "Brazos",
  "Espalda": "Espalda",
  "Dorsal": "Espalda",
  "Cuádriceps": "Piernas",
  "Femoral": "Piernas",
  "Gemelos": "Piernas",
  "Glúteo": "Piernas",
  "Cardio": "Cardio",
  "Antebrazo": "Antebrazos",
  "Trapecio": "Espalda",
  "Abdominales": "Core",
  "Oblicuos": "Core",
  "Transverso": "Core",
  "Inferior": "Core",
  "Lateral": "Core"
};

// Fecha inicial
dateInput.value = new Date().toISOString().slice(0, 10);

// Histórico
let historyData = {}; // {exerciseName: [weights]}
window.uploadedHistory = []; // Array of sessions

function getHistoryStorageKey() {
  return currentUserKey ? `${LOCAL_HISTORY_KEY}_${currentUserKey}` : LOCAL_HISTORY_KEY;
}

function getHistoryStorageKeyForUser(userKey) {
  return userKey ? `${LOCAL_HISTORY_KEY}_${userKey}` : LOCAL_HISTORY_KEY;
}

function buildSessionKeyForUser(session, userKey) {
  const date = session?.date || "";
  const week = session?.week || "";
  const day = session?.day || "";
  if (!date && !week && !day) return "";
  const userPart = userKey ? `${userKey}_` : "";
  return `gym_${userPart}${date}_${week}_${day}`;
}

function buildSessionKey(session) {
  return buildSessionKeyForUser(session, currentUserKey);
}

function getLocalHistory() {
  const raw = storage.getItem(getHistoryStorageKey());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function getLocalHistoryForUser(userKey) {
  const raw = storage.getItem(getHistoryStorageKeyForUser(userKey));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function hasHistoryForUser(userKey) {
  if (!userKey) return false;
  const historyKey = getHistoryStorageKeyForUser(userKey);
  if (storage.getItem(historyKey)) return true;
  const prefix = `gym_${userKey}_`;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

function setLocalHistory(sessions) {
  storage.setItem(getHistoryStorageKey(), JSON.stringify(sessions));
}

function setLocalHistoryForUser(userKey, sessions) {
  storage.setItem(getHistoryStorageKeyForUser(userKey), JSON.stringify(sessions));
}

function collectSessionsFromSessionKeys(userKey) {
  const sessions = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    if (userKey === "local") {
      if (!/^gym_\d{4}-\d{2}-\d{2}_/.test(key)) continue;
    } else {
      const prefix = `gym_${userKey}_`;
      if (!key.startsWith(prefix)) continue;
    }
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") continue;
      if (!parsed.date) continue;
      sessions.push({
        ...parsed,
        key,
        user: parsed.user || currentUserName
      });
    } catch (err) {
      // Ignore malformed entries.
    }
  }
  return sessions;
}

function hydrateHistoryFromSessionKeys() {
  const existing = getLocalHistory();
  if (existing.length) return;
  const sessions = collectSessionsFromSessionKeys(currentUserKey);
  if (!sessions.length) return;
  setLocalHistory(sessions);
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshCharts();
}

function rebuildHistoryData(sessions) {
  historyData = {};
  sessions.forEach(session => {
    if (session.exercises) {
      session.exercises.forEach(ex => {
        if (!historyData[ex.nombre]) historyData[ex.nombre] = [];
        if (ex.sets) {
          ex.sets.forEach(set => {
            if (set.peso && !isNaN(parseFloat(set.peso))) {
              historyData[ex.nombre].push(parseFloat(set.peso));
            }
          });
        }
      });
    }
  });
}

function loadLocalHistory() {
  const sessions = getLocalHistory();
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshCharts();
  refreshHistoryUI();
}

function upsertLocalHistory(session) {
  if (!session) return;
  const sessions = getLocalHistory();
  const key = session.key || buildSessionKey(session) || sessionKey();
  const sessionWithKey = { ...session, key, user: session.user || currentUserName };
  const index = sessions.findIndex(item => item.key === key);
  if (index >= 0) {
    const existing = sessions[index];
    const revisions = Array.isArray(existing.revisions) ? existing.revisions.slice() : [];
    const snapshot = { ...existing };
    delete snapshot.revisions;
    revisions.push({ savedAt: new Date().toISOString(), data: snapshot });
    if (revisions.length > 10) {
      revisions.splice(0, revisions.length - 10);
    }
    sessions[index] = { ...sessionWithKey, revisions };
  } else {
    sessions.push(sessionWithKey);
  }
  setLocalHistory(sessions);
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshCharts();
  refreshHistoryUI();
}

function mergeImportedHistory(imported) {
  if (!Array.isArray(imported)) return;
  const sessions = getLocalHistory();
  const byKey = new Map();
  sessions.forEach(item => {
    const key = item.key || buildSessionKey(item);
    if (key) byKey.set(key, { ...item, key, user: item.user || currentUserName });
  });
  imported.forEach(item => {
    if (!item || typeof item !== "object") return;
    const key = item.key || buildSessionKey(item);
    if (!key) return;
    byKey.set(key, { ...item, key, user: item.user || currentUserName });
  });
  const merged = Array.from(byKey.values());
  setLocalHistory(merged);
  window.uploadedHistory = merged;
  rebuildHistoryData(merged);
  refreshCharts();
}

function mergeImportedHistoryForUser(imported, userName, userKey) {
  if (!Array.isArray(imported)) return;
  const sessions = getLocalHistoryForUser(userKey);
  const byKey = new Map();
  sessions.forEach(item => {
    const key = item.key || buildSessionKeyForUser(item, userKey);
    if (key) byKey.set(key, { ...item, key, user: item.user || userName });
  });
  imported.forEach(item => {
    if (!item || typeof item !== "object") return;
    const key = item.key || buildSessionKeyForUser(item, userKey);
    if (!key) return;
    byKey.set(key, { ...item, key, user: item.user || userName });
  });
  const merged = Array.from(byKey.values());
  setLocalHistoryForUser(userKey, merged);
  refreshCharts();
  refreshHistoryUI();
}

function getExportHistoryForUser(userKey) {
  const sessions = getLocalHistoryForUser(userKey);
  const base = sessions.length ? sessions : collectSessionsFromSessionKeys(userKey);
  return base.map(session => ({
    ...session,
    user: session.user || currentUserName,
    key: session.key || buildSessionKeyForUser(session, userKey)
  }));
}

function getMaxWeight(exerciseName) {
  if (!historyData[exerciseName] || historyData[exerciseName].length === 0) return null;
  return Math.max(...historyData[exerciseName]);
}

function getLastExerciseSession(exerciseName) {
  const sessions = window.uploadedHistory || [];
  let lastSession = null;
  let lastDate = null;

  sessions.forEach(session => {
    if (!session?.exercises?.length) return;
    const hasExercise = session.exercises.some(ex => ex.nombre === exerciseName);
    if (!hasExercise) return;

    const sessionDate = new Date(session.date);
    if (!isNaN(sessionDate)) {
      if (!lastDate || sessionDate > lastDate) {
        lastDate = sessionDate;
        lastSession = session;
      }
    } else {
      lastSession = session;
    }
  });

  return lastSession;
}

function getLastExerciseSet(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;

  const firstSet = ex.sets[0] || {};
  const peso = firstSet.peso ?? null;
  const reps = firstSet.reps ?? null;

  if (peso == null && reps == null) return null;
  return { peso, reps };
}

function getLastCardioSet(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;

  const firstSet = ex.sets[0] || {};
  const tiempo = firstSet.tiempo ?? firstSet.reps ?? null;
  const intensidad = firstSet.intensidad ?? firstSet.peso ?? null;

  if (tiempo == null && intensidad == null) return null;
  return { tiempo, intensidad };
}

function getLastExerciseMaxWeight(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;
  const weights = ex.sets
    .map(s => parseFloat(s.peso))
    .filter(v => !Number.isNaN(v) && v > 0);
  if (weights.length === 0) return null;
  return Math.max(...weights);
}

function getLastExerciseSummary(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;
  const firstSet = ex.sets[0] || {};
  const isCardio = String(ex.musculo || "").toLowerCase() === "cardio";
  if (isCardio) {
    const tiempo = firstSet.tiempo ?? firstSet.reps ?? "";
    const intensidad = firstSet.intensidad ?? firstSet.peso ?? "";
    const parts = [];
    if (intensidad !== "") parts.push(`Intensidad ${intensidad}`);
    if (tiempo !== "") parts.push(`${tiempo} min`);
    const cardioText = parts.length ? `Cardio: ${parts.join(" · ")}` : "Cardio sin datos";
    return `Última sesión: ${lastSession.date} · ${cardioText}`;
  }
  const peso = firstSet.peso ?? "";
  const reps = firstSet.reps ?? "";
  const parts = [];
  if (peso !== "") parts.push(`${peso} kg`);
  if (reps !== "") parts.push(`${reps} reps`);
  const firstSetText = parts.length ? `Primera serie: ${parts.join(" x ")}` : "Primera serie sin datos";
  return `Última sesión: ${lastSession.date} · ${firstSetText}`;
}

function updateOverloadWarning(card) {
  const warningEl = card.querySelector(".overload-warning");
  if (!warningEl) return;
  if (card.dataset.exerciseType === "cardio") {
    warningEl.style.display = "none";
    return;
  }
  const baseline = parseFloat(warningEl.dataset.baseline);
  if (Number.isNaN(baseline) || baseline <= 0) {
    warningEl.style.display = "none";
    return;
  }

  const rows = card.querySelectorAll("tbody tr");
  let currentMax = null;
  rows.forEach(row => {
    const weightInput = row.querySelector('input[data-key="peso"]');
    const peso = parseFloat(weightInput?.value);
    if (!Number.isNaN(peso)) {
      if (currentMax === null || peso > currentMax) currentMax = peso;
    }
  });

  if (currentMax != null && currentMax > baseline * 1.1) {
    warningEl.textContent = `Aviso de sobrecarga: último máximo ${baseline} kg, ahora ${currentMax} kg.`;
    warningEl.style.display = "block";
  } else {
    warningEl.style.display = "none";
  }
}

// -------------------------
// FUNCIONES BASE
// -------------------------

function sessionKey() {
  const userPart = currentUserKey ? `${currentUserKey}_` : "";
  return `gym_${userPart}${dateInput.value}_${weekSelect.value}_${daySelect.value}`;
}

function setStatus(msg) {
  statusText.textContent = msg;
  setTimeout(() => {
    if (statusText.textContent === msg) statusText.textContent = "";
  }, 1500);
}

function loadCustomRoutines() {
  try {
    const key = currentUserKey ? `${CUSTOM_ROUTINES_KEY}_${currentUserKey}` : CUSTOM_ROUTINES_KEY;
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

function saveCustomRoutines(data) {
  const key = currentUserKey ? `${CUSTOM_ROUTINES_KEY}_${currentUserKey}` : CUSTOM_ROUTINES_KEY;
  storage.setItem(key, JSON.stringify(data));
}

function getAllRoutines() {
  const base = window.routines || {};
  const custom = loadCustomRoutines();
  return { ...base, ...custom };
}

function showSaveSessionMessage() {
  if (!saveSessionMessage) return;
  const messages = [
    "Bien hecho! :)",
    "Eres un maquina! 💪",
    "Gran trabajo, sigue asi! 😎",
    "Buen ritmo, a por la siguiente! 🚀",
    "Ritmo solido, sigue sumando! 🔥",
    "Hoy se entrena, manana se presume! 😄",
    "Vas fino, muy buen curro! ✅",
    "Cada dia mas fuerte! 🦾",
    "Objetivo cumplido, a descansar! 🧘",
    "Suma y sigue, campeon! 🏆",
    "On fire! 🔥",
    "Progreso real, sigue asi! 📈",
    "Modo bestia activado! 🐺",
    "Dejando huella, crack! 👊",
    "Nivel Llados, a tope! 💥",
    "Cruasán 🥐 con faking cafe?! Tú no!",
    "Panza? Es como foak, ni de coña! 🔥",
    "Entreno limpio, mente fuerte! 🧠"
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  saveSessionMessage.innerHTML = `<strong>Sesión guardada.</strong> ${message}`;
  saveSessionMessage.style.display = "block";
  clearSaveSessionError();
}

function showSaveSessionError(message) {
  if (!saveSessionError) return;
  saveSessionError.innerHTML = `<strong>Error.</strong> ${message}`;
  saveSessionError.style.display = "block";
}

function clearSaveSessionError() {
  if (!saveSessionError) return;
  saveSessionError.textContent = "";
  saveSessionError.style.display = "none";
}

function showSaveRoutineMessage(message) {
  if (!saveRoutineMessage) return;
  saveRoutineMessage.innerHTML = `<strong>Rutina guardada.</strong> ${message || ""}`.trim();
  saveRoutineMessage.style.display = "block";
  if (saveRoutineError) {
    saveRoutineError.textContent = "";
    saveRoutineError.style.display = "none";
  }
}

function showSaveRoutineError(message) {
  if (!saveRoutineError) return;
  saveRoutineError.innerHTML = `<strong>Error.</strong> ${message}`;
  saveRoutineError.style.display = "block";
  if (saveRoutineMessage) {
    saveRoutineMessage.textContent = "";
    saveRoutineMessage.style.display = "none";
  }
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (!field || !errorEl) return;
  if (message) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
    field.setAttribute("aria-invalid", "true");
  } else {
    errorEl.textContent = "";
    errorEl.style.display = "none";
    field.removeAttribute("aria-invalid");
  }
}

function clearFieldErrors() {
  [
    "sense-general",
    "sense-tiredness",
    "sense-pain",
    "pain-zone",
    "pain-exercise"
  ].forEach(id => setFieldError(id, ""));
}

function isPostWorkoutComplete() {
  const hasExercises = exercisesContainer && exercisesContainer.children.length > 0;
  if (!hasExercises) return false;
  if (!senseGeneralInput?.value || senseGeneralInput.value.trim() === "") return false;
  if (!senseTirednessInput?.value || senseTirednessInput.value.trim() === "") return false;
  if (sensePainSelect?.value === "si") {
    if (!painZoneInput?.value || painZoneInput.value.trim() === "") return false;
    if (!painExerciseSelect?.value || painExerciseSelect.value.trim() === "") return false;
  }
  return true;
}


// -------------------------
// FUNCIÓN DE VALIDACIÓN 
// -------------------------
function checkSensationsForm(shouldFocus = false) {
    let isValid = true;
    let errorMessage = "";
    let firstInvalid = null;
    const hasExercises = exercisesContainer && exercisesContainer.children.length > 0;

    clearFieldErrors();

    if (!hasExercises) {
        isValid = false;
        errorMessage = "Añade al menos un ejercicio para activar el cuestionario post entreno.";
    }
    
    // 1. Sensaciones generales y cansancio
    if (hasExercises) {
        if (!senseGeneralInput.value || senseGeneralInput.value.trim() === '') {
            isValid = false;
            errorMessage = "Completa el cuestionario post entreno para activar los botones.";
            setFieldError("sense-general", "Campo obligatorio.");
            if (!firstInvalid) firstInvalid = senseGeneralInput;
        }
        if (!senseTirednessInput.value || senseTirednessInput.value.trim() === '') {
            isValid = false;
            errorMessage = "Completa el cuestionario post entreno para activar los botones.";
            setFieldError("sense-tiredness", "Campo obligatorio.");
            if (!firstInvalid) firstInvalid = senseTirednessInput;
        }
    }

    // 2. Dolor específico (si 'si' está seleccionado)
    if (hasExercises && sensePainSelect.value === 'si') {
        if (!painZoneInput.value || painZoneInput.value.trim() === '') {
            isValid = false;
            errorMessage = "Completa el cuestionario post entreno para activar los botones.";
            setFieldError("pain-zone", "Indica la zona del dolor.");
            if (!firstInvalid) firstInvalid = painZoneInput;
        }
        if (!painExerciseSelect.value || painExerciseSelect.value.trim() === '') {
            isValid = false;
            errorMessage = "Completa el cuestionario post entreno para activar los botones.";
            setFieldError("pain-exercise", "Selecciona un ejercicio.");
            if (!firstInvalid) firstInvalid = painExerciseSelect;
        }
    }

    exportBtn.disabled = !isValid;
    if (saveSessionBtn) saveSessionBtn.disabled = !isValid;
    if (!isValid && saveSessionMessage) {
        saveSessionMessage.style.display = "none";
        saveSessionMessage.textContent = "";
    }
    if (isValid) {
        clearSaveSessionError();
    } else {
        showSaveSessionError(errorMessage || "Completa el cuestionario para activar los botones.");
    }

    if (shouldFocus && firstInvalid) {
        firstInvalid.focus();
    }

    return isValid;
}


// -------------------------
// CREAR FILAS DE SERIES
// -------------------------

const strengthSetFields = [
  { key: "serie", type: "static" },
  { key: "peso", type: "number" },
  { key: "reps", type: "number" },
  { key: "fallo", type: "checkbox" },
  { key: "repsFallo", type: "number" },
  { key: "obs", type: "text" }
];

const cardioSetFields = [
  { key: "serie", type: "static" },
  { key: "intensidad", type: "number", placeholder: "1-10" },
  { key: "tiempo", type: "number", placeholder: "min" },
  { key: "obs", type: "text" }
];

function addSetRow(tbody, setData = {}, onInputChange, fields = strengthSetFields) {
  const tr = document.createElement("tr");
  const shouldCopyFromPrev = Object.keys(setData).length === 0;
  let resolvedSetData = setData;

  if (shouldCopyFromPrev) {
    const prevRow = tbody.lastElementChild;
    if (prevRow) {
      const prevInputs = prevRow.querySelectorAll("input");
      const copied = {};
      let inputIndex = 0;
      fields.forEach(f => {
        if (f.type === "static") return;
        const prevInput = prevInputs[inputIndex];
        inputIndex += 1;
        if (!prevInput) return;
        if (f.type === "checkbox") {
          if (prevInput.checked) copied[f.key] = true;
          return;
        }
        const prevValue = prevInput.value ?? "";
        if (prevValue !== "") copied[f.key] = prevValue;
      });
      resolvedSetData = { ...copied, ...setData };
    }
  }

  fields.forEach(f => {
    const td = document.createElement("td");
    let input;

    if (f.type === "static") {
      const text = document.createElement("span");
      const defaultValue = tbody.children.length + 1;
      text.textContent = resolvedSetData[f.key] ?? defaultValue ?? "";
      td.appendChild(text);
      tr.appendChild(td);
      return;
    }
    if (f.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = setData[f.key] ?? false;
    } else {
      input = document.createElement("input");
      input.type = f.type;
      input.value = resolvedSetData[f.key] ?? "";
    }
    input.dataset.key = f.key;
    if (f.placeholder) input.placeholder = f.placeholder;

    input.addEventListener("input", () => {
      saveSession();
      if (onInputChange) onInputChange();
    });
    input.addEventListener("change", () => {
      saveSession();
      if (onInputChange) onInputChange();
    });

    td.appendChild(input);
    tr.appendChild(td);
  });

  tbody.appendChild(tr);
}


// -------------------------
// CREAR UNA TARJETA DE EJERCICIO
// -------------------------

function buildExerciseCard(exData) {
  const card = document.createElement("div");
  card.className = "exercise-card";
  const isCardio = String(exData.musculo || exData.grupo || "").toLowerCase() === "cardio";
  card.dataset.exerciseType = isCardio ? "cardio" : "strength";

  // ====== CABECERA ======
  const header = document.createElement("div");
  header.className = "exercise-header";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.flexDirection = "column";

  // Nota: Si el ejercicio es personalizado, exData.hacer/noHacer/trucos serán vacíos
  const musculoDisplay = exData.musculo || "N/A";
  const seccionDisplay = exData.seccion || "N/A";
  const hacerDisplay = exData.hacer || "Descripción no disponible para ejercicios personalizados.";
  const noHacerDisplay = exData.noHacer || "N/A";
  const trucosDisplay = exData.trucos || "N/A";


  left.innerHTML = `
    <div class="exercise-title" style="font-weight:bold; font-size:1rem;">
      ${exData.nombre}
    </div>

    <div class="exercise-meta exercise-muscle-section" 
         data-musculo="${musculoDisplay}"
         data-seccion="${seccionDisplay}"
         style="font-size:0.8rem; color:var(--meta-text); margin-top:2px;">
      ${musculoDisplay} – ${seccionDisplay}
    </div>
  `;


  const headerActions = document.createElement("div");
  headerActions.style.display = "flex";
  headerActions.style.gap = "6px";
  headerActions.style.alignItems = "center";

  header.appendChild(left);
  header.appendChild(headerActions);
  card.appendChild(header);

  // ====== HISTORIAL RAPIDO ======
  const historyInfo = document.createElement("div");
  historyInfo.className = "exercise-history";
  historyInfo.style.fontSize = "0.75rem";
  historyInfo.style.color = "var(--meta-text)";
  historyInfo.style.margin = "6px 0 4px";
  historyInfo.textContent = getLastExerciseSummary(exData.nombre) || "Sin historial para este ejercicio.";
  card.appendChild(historyInfo);

  // ====== AVISO SOBRECARGA ======
  const overloadWarning = document.createElement("div");
  overloadWarning.className = "overload-warning";
  overloadWarning.style.display = "none";
  overloadWarning.style.fontSize = "0.75rem";
  overloadWarning.style.margin = "2px 0 6px";
  overloadWarning.style.color = "#b91c1c";
  const lastMax = isCardio ? null : getLastExerciseMaxWeight(exData.nombre);
  if (lastMax != null) overloadWarning.dataset.baseline = String(lastMax);
  card.appendChild(overloadWarning);

  // ====== TABLA DE SERIES ======
  const table = document.createElement("table");
  table.className = "exercise-table";
  table.innerHTML = isCardio ? `
    <thead>
      <tr>
        <th>Serie</th><th>Intensidad</th><th>Tiempo (min)</th><th>Notas</th>
      </tr>
    </thead>
    <tbody></tbody>
  ` : `
    <thead>
      <tr>
        <th>Serie</th><th>Peso</th><th>Reps</th><th>Fallo</th><th>Reps fallo</th><th>Notas</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  card.appendChild(table);

  const tbody = table.querySelector("tbody");

  // Series
  if (exData.sets && exData.sets.length > 0) {
    exData.sets.forEach(s => {
      const normalized = isCardio
        ? {
            intensidad: s.intensidad ?? s.peso ?? "",
            tiempo: s.tiempo ?? s.reps ?? "",
            obs: s.obs ?? ""
          }
        : s;
      addSetRow(tbody, normalized, () => updateOverloadWarning(card), isCardio ? cardioSetFields : strengthSetFields);
    });
  } else {
    const initialSet = {};
    if (isCardio) {
      const lastSet = getLastCardioSet(exData.nombre);
      if (lastSet) {
        if (lastSet.intensidad != null && lastSet.intensidad !== "") initialSet.intensidad = lastSet.intensidad;
        if (lastSet.tiempo != null && lastSet.tiempo !== "") initialSet.tiempo = lastSet.tiempo;
      }
      addSetRow(tbody, initialSet, () => updateOverloadWarning(card), cardioSetFields);
    } else {
      const lastSet = getLastExerciseSet(exData.nombre);
      if (lastSet) {
        if (lastSet.peso != null && lastSet.peso !== "") initialSet.peso = lastSet.peso;
        if (lastSet.reps != null && lastSet.reps !== "") initialSet.reps = lastSet.reps;
      }
      if (Object.keys(initialSet).length === 0) {
        const maxWeight = getMaxWeight(exData.nombre);
        if (maxWeight) initialSet.peso = maxWeight;
      }
      addSetRow(tbody, initialSet, () => updateOverloadWarning(card), strengthSetFields);
    }
  }

  const addBtn = document.createElement("button");
  addBtn.textContent = "Añadir serie";
  addBtn.className = "btn-primary add-set-btn";
  addBtn.onclick = () => {
    addSetRow(tbody, {}, () => updateOverloadWarning(card), isCardio ? cardioSetFields : strengthSetFields);
    saveSession();
    updateOverloadWarning(card);
  };

  updateOverloadWarning(card);

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Eliminar ejercicio";
  removeBtn.className = "btn-danger";
  removeBtn.onclick = () => {
    card.remove();
    saveSession();
    loadSession(); // Necesario para refrescar el painExerciseSelect
    scheduleExercisePagination();
  };

  const actions = document.createElement("div");
  actions.className = "exercise-actions";
  actions.appendChild(addBtn);
  actions.appendChild(removeBtn);
  card.appendChild(actions);

  // ====== NOTAS TÉCNICAS ======
  const notes = document.createElement("div");
  notes.className = "exercise-notes";
  notes.innerHTML = `
    <details>
      <summary><b>Notas de técnica</b></summary>
      <p><b>Cómo hacerlo:</b> ${hacerDisplay}</p>
      <p><b>Evitar:</b> ${noHacerDisplay}</p>
      <p><b>Trucos:</b> ${trucosDisplay}</p>
    </details>
  `;
  card.appendChild(notes);

  // Hacer la tarjeta draggable
  card.draggable = true;
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  });
  card.addEventListener('dragend', (e) => {
    e.target.style.opacity = '';
  });

  return card;
}

function addExerciseFromTemplate(name) {
  if (!name) return;
  const tpl = exerciseTemplates[name] || {};
  if (!exercisesContainer) exercisesContainer = mainExercisesContainer;
  exercisesContainer.appendChild(
    buildExerciseCard({
      nombre: name,
      musculo: tpl.musculo ?? "N/A",
      seccion: tpl.seccion ?? "N/A",
      hacer: tpl.hacer ?? "",
      noHacer: tpl.noHacer ?? "",
      trucos: tpl.trucos ?? "",
      sets: []
    })
  );
  saveSession();
  const total = exercisesContainer.querySelectorAll(".exercise-card").length;
  activeExerciseIndex = Math.max(0, total - 1);
  scheduleExercisePagination();
}


// -------------------------
// GUARDAR SESIÓN (Y SENSACIONES)
// -------------------------

function saveSession() {
  if (!currentUserKey) return;
  const key = sessionKey();
  const cards = document.querySelectorAll(".exercise-card");
  
  // Capturamos el valor antes de la posible reconstrucción del select.
  const selectedPainExercise = painExerciseSelect.value; 

  const data = {
    date: dateInput.value,
    week: weekSelect.value,
    day: daySelect.value,
    exercises: [],
    
    // SENSACIONES
    sensations: {
      general: senseGeneralInput.value,
      tiredness: senseTirednessInput.value,
      weight: senseWeightInput.value,
      pain: sensePainSelect.value,
      painZone: painZoneInput.value,
      painExercise: selectedPainExercise
    },
    user: currentUserName
  };

  cards.forEach(card => {
    const name = card.querySelector(".exercise-title")?.textContent.trim() || "";
    
    let mus = "";
    let sec = "";
    let hacer = "";
    let noHacer = "";
    let trucos = "";

    const metaElement = card.querySelector(".exercise-muscle-section");
    if (metaElement) {
        mus = metaElement.getAttribute("data-musculo") || "";
        sec = metaElement.getAttribute("data-seccion") || "";
    }
    
    const tpl = exerciseTemplates[name] || {};
    hacer = tpl.hacer ?? "";
    noHacer = tpl.noHacer ?? "";
    trucos = tpl.trucos ?? "";

    
    const tbody = card.querySelector("tbody");
    const rows = tbody ? Array.from(tbody.querySelectorAll("tr")) : [];

    const sets = rows.map(row => {
      const inputs = Array.from(row.querySelectorAll("input"));
      const serieText = row.querySelector("td:first-child")?.textContent || "";
      const setData = { serie: parseInt(serieText, 10) || null };
      inputs.forEach(input => {
        const key = input.dataset.key;
        if (!key) return;
        if (input.type === "checkbox") {
          setData[key] = input.checked;
          return;
        }
        if (key === "obs") {
          setData[key] = input.value || "";
          return;
        }
        const raw = input.value;
        if (raw === "") {
          setData[key] = null;
          return;
        }
        if (key === "reps" || key === "repsFallo") {
          setData[key] = parseInt(raw, 10) || null;
          return;
        }
        if (key === "peso" || key === "tiempo" || key === "intensidad") {
          const parsed = parseFloat(raw);
          setData[key] = Number.isNaN(parsed) ? null : parsed;
          return;
        }
        setData[key] = raw;
      });
      return setData;
    });

    data.exercises.push({
      nombre: name,
      musculo: mus,
      seccion: sec,
      hacer: hacer,
      noHacer: noHacer,
      trucos: trucos,
      sets: sets
    });
  });

  storage.setItem(key, JSON.stringify(data));
  setStatus("Guardado");
  markAutoSaved();
  updateSessionSummary();
  
  // 1. Repopulate the list of exercises for the pain selector
  const currentExerciseNames = data.exercises.map(ex => ex.nombre);
  populatePainExerciseSelect(currentExerciseNames); 

  // 2. Restaurar la selección en el DOM (en caso de que la lista haya cambiado)
  painExerciseSelect.value = data.sensations.painExercise; 

  checkSensationsForm();
  updateStepStatus();
  scheduleExercisePagination(false);
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE AÑADIR EJERCICIO (POR GRUPO)
// -------------------------

function resolveExerciseGroup(tpl) {
  if (!tpl) return "Otros";
  return muscleGroupMap[tpl.musculo] || tpl.grupo || "Otros";
}

function getExerciseGroups() {
  const groups = new Set();
  Object.values(exerciseTemplates).forEach(tpl => {
    groups.add(resolveExerciseGroup(tpl));
  });
  const preferredOrder = [
    "Pecho",
    "Espalda",
    "Hombros",
    "Brazos",
    "Piernas",
    "Antebrazos",
    "Cardio",
    "Core",
    "Otros"
  ];
  const ordered = preferredOrder.filter(group => groups.has(group));
  const rest = [...groups].filter(group => !preferredOrder.includes(group)).sort();
  return ordered.concat(rest);
}

function populateGroupSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">Seleccionar grupo...</option>';
  getExerciseGroups().forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    selectEl.appendChild(opt);
  });
}

function extractRoutineNumber(label) {
  const match = String(label).match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
}

function sortRoutineLabels(a, b) {
  const numA = extractRoutineNumber(a);
  const numB = extractRoutineNumber(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
    return numA - numB;
  }
  if (!Number.isNaN(numA) && Number.isNaN(numB)) return -1;
  if (Number.isNaN(numA) && !Number.isNaN(numB)) return 1;
  return String(a).localeCompare(String(b), "es");
}

function populateDaySelect(week) {
  if (!daySelect) return;
  daySelect.innerHTML = "";
  const allRoutines = getAllRoutines();
  const days = Object.keys(allRoutines?.[week] || {}).sort(sortRoutineLabels);
  days.forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = day;
    daySelect.appendChild(opt);
  });
  if (days.length > 0) daySelect.value = days[0];
}

function populateRoutineSelectors() {
  if (!weekSelect || !daySelect) return;
  weekSelect.innerHTML = "";
  const allRoutines = getAllRoutines();
  const weeks = Object.keys(allRoutines || {}).sort(sortRoutineLabels);
  weeks.forEach(week => {
    const opt = document.createElement("option");
    opt.value = week;
    opt.textContent = week;
    weekSelect.appendChild(opt);
  });
  if (weeks.length > 0) {
    weekSelect.value = weeks[0];
    populateDaySelect(weeks[0]);
  } else {
    daySelect.innerHTML = "";
  }
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE DOLOR (SOLO EJERCICIOS DE HOY + "No identificado")
// -------------------------

function populatePainExerciseSelect(exerciseNames) {
    painExerciseSelect.innerHTML = `<option value="">Seleccionar ejercicio...</option>`;
    
    // Usa un Set para asegurar nombres únicos
    const uniqueNames = [...new Set(exerciseNames)];
    
    // NUEVO: Añadir opción "No identificado"
    const noSeOpt = document.createElement("option");
    noSeOpt.value = "No identificado";
    noSeOpt.textContent = "No identificado";
    painExerciseSelect.appendChild(noSeOpt);
    
    // Ordena los nombres de los ejercicios
    uniqueNames.sort().forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        painExerciseSelect.appendChild(opt);
    });
}


// -------------------------
// CARGAR SESIÓN O RUTINA BASE (Y SENSACIONES)
// -------------------------

function loadSession() {
  const key = sessionKey();
  const saved = JSON.parse(storage.getItem(key) || "null");
  lastAutoSaveTime = null;
  updateAutoSaveLabel();

  const week = weekSelect.value;
  const day = daySelect.value;
  const routine = getAllRoutines()[week]?.[day];
  
  exercisesContainer.innerHTML = "";
  
  // 1. Limpiar campos de sensaciones antes de cargar
  senseGeneralInput.value = "";
  senseTirednessInput.value = "";
  sensePainSelect.value = "no";
  painZoneInput.value = "";
  painDetailsDiv.style.display = "none";
  
  let currentExercises = [];
  let savedPainExercise = ""; // Inicializamos variable para guardar el valor guardado
  
  // *Si hay datos guardados, cargarlos*
  if (saved && saved.exercises?.length > 0) {
    saved.exercises.forEach(ex => {
      const tpl = exerciseTemplates[ex.nombre] || {};
      const pickValue = (primary, fallback) => {
        if (primary === null || primary === undefined) return fallback;
        const str = String(primary).trim();
        if (str === "" || str.toLowerCase() === "n/a") return fallback;
        return primary;
      };
      // Usar los datos guardados, ya que los personalizados no están en exerciseTemplates
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: ex.nombre,
        musculo: pickValue(ex.musculo, tpl.musculo ?? "N/A"),
        seccion: pickValue(ex.seccion, tpl.seccion ?? "N/A"),
        hacer: pickValue(ex.hacer, tpl.hacer ?? ""),
        noHacer: pickValue(ex.noHacer, tpl.noHacer ?? ""),
        trucos: pickValue(ex.trucos, tpl.trucos ?? ""),
        sets: ex.sets ?? []
      }));
    });
    
    currentExercises = saved.exercises.map(ex => ex.nombre); 
    
    // Cargar sensaciones guardadas
    if (saved.sensations) {
      senseGeneralInput.value = saved.sensations.general ?? "";
      senseTirednessInput.value = saved.sensations.tiredness ?? "";
      senseWeightInput.value = saved.sensations.weight ?? "";
      sensePainSelect.value = saved.sensations.pain ?? "no";
      painZoneInput.value = saved.sensations.painZone ?? "";
      savedPainExercise = saved.sensations.painExercise ?? ""; // Almacenamos el valor
      
      if (sensePainSelect.value === 'si') {
          painDetailsDiv.style.display = 'flex'; 
      }
    }
    setStatus("Cargado desde memoria");
  }

  // *Si no hay guardados pero sí rutina definida*
  else if (routine) { 
    routine.forEach(name => {
      const tpl = exerciseTemplates[name] || {};
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: name,
        musculo: tpl.musculo ?? "N/A",
        seccion: tpl.seccion ?? "N/A",
        hacer: tpl.hacer ?? "",
        noHacer: tpl.noHacer ?? "",
        trucos: tpl.trucos ?? "",
        sets: []
      }));
    });
    
    currentExercises = routine; 
    setStatus("Cargado desde rutina base");
  }

  // *Si no hay nada*
  else {
    setStatus("No hay rutina definida");
  }
  
  // 2. Llenar el selector de dolor (incluye "No identificado")
  populatePainExerciseSelect(currentExercises); 

  // 3. Establecer el valor guardado
  painExerciseSelect.value = savedPainExercise; 
  
  checkSensationsForm();
  updateStepStatus();
  updateSessionSummary();
  scheduleExercisePagination(true);
}


if (saveRoutineBtn) {
  saveRoutineBtn.onclick = () => {
    if (!currentUserKey) {
      showSaveRoutineError("Selecciona un usuario antes de guardar rutinas personalizadas.");
      return;
    }
    const cards = Array.from(document.querySelectorAll(".exercise-card"));
    if (cards.length === 0) {
      showSaveRoutineError("Añade al menos un ejercicio antes de guardar la rutina.");
      return;
    }
    const routineName = prompt("Nombre de la rutina:");
    if (!routineName) return;

    const trimmed = routineName.trim();
    if (!trimmed) {
      showSaveRoutineError("El nombre de la rutina no puede estar vacío.");
      return;
    }

    const exercises = cards
      .map(card => card.querySelector(".exercise-title")?.textContent.trim())
      .filter(Boolean);
    if (exercises.length === 0) {
      showSaveRoutineError("No se encontraron ejercicios válidos.");
      return;
    }

    const allCustom = loadCustomRoutines();
    const exists = Boolean(allCustom[trimmed]);
    if (exists && !confirm(`La rutina "${trimmed}" ya existe. ¿Quieres sobrescribirla?`)) {
      return;
    }

    allCustom[trimmed] = {
      "Día 1 - Sesión guardada": exercises
    };
    saveCustomRoutines(allCustom);
    populateRoutineSelectors();
    if (weekSelect) {
      weekSelect.value = trimmed;
      populateDaySelect(trimmed);
    }
    showSaveRoutineMessage("Ya aparece en rutinas predefinidas.");
  };
}


// -------------------------
// EXPORTACIÓN A PNG (FORMATO TABLA)
// -------------------------
exportBtn.onclick = () => {
  // Doble verificación de validación
  if (!checkSensationsForm(true)) {
    showSaveSessionError("Completa todo el cuestionario de Post-Entrenamiento antes de exportar.");
    return;
  }

  saveSession();

  const key = sessionKey();
  const saved = JSON.parse(storage.getItem(key) || "null");
  if (!saved) return alert("No hay datos registrados hoy.");

  const exportDiv = buildExportContent(saved, { variant: "png" });
  document.body.appendChild(exportDiv);

  // Exportar a PNG
  html2canvas(exportDiv, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = `sesion_${saved.date}_${saved.week}_${saved.day}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    exportDiv.remove();
  });
};

if (saveSessionBtn) {
  saveSessionBtn.onclick = () => {
    if (!checkSensationsForm(true)) {
      showSaveSessionError("Completa todo el cuestionario de Post-Entrenamiento antes de guardar.");
      return;
    }
    saveSession();
    const key = sessionKey();
    const saved = JSON.parse(storage.getItem(key) || "null");
    if (!saved) return alert("No hay datos registrados hoy.");
    upsertLocalHistory(saved);
    setStatus("Sesion guardada en historico local.");
    showSaveSessionMessage();
  };
}


// -------------------------
// MANEJADOR DE SENSACIONES
// -------------------------
sensePainSelect.addEventListener('change', () => {
    if (sensePainSelect.value === 'si') {
        painDetailsDiv.style.display = 'flex'; 
    } else {
        painDetailsDiv.style.display = 'none';
        // Opcional: limpiar los campos cuando se desactiva el dolor
        painZoneInput.value = ""; 
        painExerciseSelect.value = "";
    }
    saveSession(); 
});

// Añadir listeners para guardar automáticamente y validar
senseGeneralInput.addEventListener("input", saveSession);
senseTirednessInput.addEventListener("input", saveSession);
senseWeightInput.addEventListener("input", saveSession);
painZoneInput.addEventListener("input", saveSession);
painExerciseSelect.addEventListener("change", saveSession); // El change es necesario para capturar la selección
if (senseGeneralInput) senseGeneralInput.addEventListener("input", () => checkSensationsForm());
if (senseTirednessInput) senseTirednessInput.addEventListener("input", () => checkSensationsForm());
if (sensePainSelect) sensePainSelect.addEventListener("change", () => checkSensationsForm());
if (painZoneInput) painZoneInput.addEventListener("input", () => checkSensationsForm());
if (painExerciseSelect) painExerciseSelect.addEventListener("change", () => checkSensationsForm());


// -------------------------
// INICIALIZACIÓN
// -------------------------

// Listener para el botón de cargar/cambiar rutina (adicional al change)
loadBtn.addEventListener("click", loadSession);

if (deleteRoutineBtn) {
  deleteRoutineBtn.addEventListener("click", () => {
    if (!currentUserKey) {
      setStatus("Selecciona un usuario antes de borrar rutinas.");
      return;
    }
    const routineName = weekSelect?.value || "";
    if (!routineName) {
      setStatus("Selecciona una rutina para borrar.");
      return;
    }
    const custom = loadCustomRoutines();
    if (!custom[routineName]) {
      setStatus("Solo puedes borrar rutinas personalizadas.");
      return;
    }
    if (!confirm(`Borrar la rutina personalizada "${routineName}"?`)) return;
    delete custom[routineName];
    saveCustomRoutines(custom);
    populateRoutineSelectors();
    if (weekSelect) {
      weekSelect.value = "Semana 1";
      populateDaySelect(weekSelect.value);
    }
    setStatus("Rutina borrada.");
  });
}

function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

onReady(() => {
  // Restablecer selectores y cargar
  populateRoutineSelectors();
  if (weekSelect) {
    weekSelect.addEventListener("change", () => populateDaySelect(weekSelect.value));
  }

  initializeForUserSelection();
  initializeStepper();
  if (welcomeStartBtn) {
    const startIndex = stepPages.indexOf(step1);
    const sessionIndex = stepPages.indexOf(step2);
    welcomeStartBtn.addEventListener("click", () => {
      if (currentUserKey && sessionIndex >= 0) {
        setActiveStep(sessionIndex);
        return;
      }
      if (sessionIndex >= 0) {
        pendingStartStepIndex = sessionIndex;
      }
      if (startIndex >= 0) {
        setActiveStep(startIndex);
      }
    });
  }
  if (welcomeLegalBtn) {
    welcomeLegalBtn.addEventListener("click", () => {
      if (!welcomeLegalPanel) return;
      const isHidden = welcomeLegalPanel.style.display === "none";
      welcomeLegalPanel.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        welcomeLegalPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  if (welcomeInfoBtn) {
    welcomeInfoBtn.addEventListener("click", () => {
      if (!welcomeInfoPanel) return;
      const isHidden = welcomeInfoPanel.style.display === "none";
      welcomeInfoPanel.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        welcomeInfoPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  if (homeLogoBtn) {
    homeLogoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveStep(0);
    });
  }
  refreshUserSelect();
  if (exportBtn) exportBtn.disabled = true;
  if (saveSessionBtn) saveSessionBtn.disabled = true;
  checkSensationsForm();
  setFastMode(storage.getItem("gym_fast_mode") === "1");
  if (toggleFastModeBtn) {
    toggleFastModeBtn.addEventListener("click", () => {
      setFastMode(!isFastMode);
    });
  }
  updateHeaderOffsets();
  window.addEventListener("resize", updateHeaderOffsets);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  window.__gymAppReady = true;
});

window.addEventListener("load", () => {
  refreshUserSelect();
});


// -------------------------
// CRONÓMETRO (TEMPORIZADOR DE CUENTA ATRÁS)
// -------------------------
let stopwatchInterval;
let stopwatchTime = 0; // en segundos
let isRunning = false;
let beepInterval = null;
let beepContext = null;

const stopwatchDisplay = document.getElementById('stopwatch-display');
const stopwatchInput = document.getElementById('stopwatch-input');
const startBtn = document.getElementById('start-stopwatch');
const stopBtn = document.getElementById('stop-stopwatch');
const resetBtn = document.getElementById('reset-stopwatch');
const toggleBtn = document.getElementById('toggle-stopwatch');
const popup = document.getElementById('stopwatch-popup');
const stopwatchOverlay = document.getElementById('stopwatch-overlay');
const stopwatchCloseBtn = document.getElementById('stopwatch-close-btn');
const quickAddPopup = document.getElementById('quick-add-popup');
const quickAddOverlay = document.getElementById('quick-add-overlay');
const quickAddToggleBtn = document.getElementById('toggle-quick-add');
const quickAddCloseBtn = document.getElementById('quick-add-close-btn');
const quickAddGroupSelect = document.getElementById('quick-add-group');
const quickAddExerciseSelect = document.getElementById('quick-add-exercise');
const quickAddPredefinedBtn = document.getElementById('quick-add-predefined');
const quickAddCustomBtn = document.getElementById('quick-add-custom');
const customExerciseOverlay = document.getElementById('custom-exercise-overlay');
const customExerciseName = document.getElementById('custom-exercise-name');
const customExerciseIsCardio = document.getElementById('custom-exercise-is-cardio');
const customExerciseCancel = document.getElementById('custom-exercise-cancel');
const customExerciseConfirm = document.getElementById('custom-exercise-confirm');

function updateDisplay() {
  const minutes = Math.floor(stopwatchTime / 60);
  const seconds = stopwatchTime % 60;
  stopwatchDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function playBeep() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!beepContext) beepContext = new AudioCtx();
  if (beepContext.state === "suspended") {
    beepContext.resume();
  }
  const oscillator = beepContext.createOscillator();
  const gain = beepContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.2;
  oscillator.connect(gain);
  gain.connect(beepContext.destination);
  oscillator.start();
  oscillator.stop(beepContext.currentTime + 0.2);
}

function startBeepLoop() {
  if (beepInterval) return;
  playBeep();
  beepInterval = setInterval(playBeep, 1000);
}

function stopBeepLoop() {
  if (!beepInterval) return;
  clearInterval(beepInterval);
  beepInterval = null;
}

function openStopwatchOverlay() {
  if (!stopwatchOverlay) return;
  stopwatchOverlay.style.display = "flex";
  stopwatchOverlay.setAttribute("aria-hidden", "false");
}

function closeStopwatchOverlay() {
  if (!stopwatchOverlay) return;
  stopwatchOverlay.style.display = "none";
  stopwatchOverlay.setAttribute("aria-hidden", "true");
}

function openQuickAddOverlay() {
  if (!quickAddOverlay) return;
  quickAddOverlay.style.display = "flex";
  quickAddOverlay.setAttribute("aria-hidden", "false");
}

function closeQuickAddOverlay() {
  if (!quickAddOverlay) return;
  quickAddOverlay.style.display = "none";
  quickAddOverlay.setAttribute("aria-hidden", "true");
}

function openCustomExerciseOverlay() {
  if (!customExerciseOverlay) return;
  customExerciseOverlay.style.display = "flex";
  customExerciseOverlay.setAttribute("aria-hidden", "false");
  if (customExerciseName) {
    customExerciseName.value = "";
    customExerciseName.focus();
  }
  if (customExerciseIsCardio) customExerciseIsCardio.checked = false;
}

function closeCustomExerciseOverlay() {
  if (!customExerciseOverlay) return;
  customExerciseOverlay.style.display = "none";
  customExerciseOverlay.setAttribute("aria-hidden", "true");
}

startBtn.addEventListener('click', () => {
  if (!isRunning && stopwatchTime > 0) {
    stopBeepLoop();
    isRunning = true;
    startBtn.style.display = 'none'; // Ocultar botón iniciar
    stopwatchInterval = setInterval(() => {
      if (stopwatchTime > 0) {
        stopwatchTime--;
        updateDisplay();
      } else {
        clearInterval(stopwatchInterval);
        isRunning = false;
        startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
        startBeepLoop();
        setStatus('Tiempo terminado.');
      }
    }, 1000);
  }
});

stopBtn.addEventListener('click', () => {
  if (isRunning) {
    isRunning = false;
    clearInterval(stopwatchInterval);
    startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
  }
  stopBeepLoop();
});

resetBtn.addEventListener('click', () => {
  isRunning = false;
  clearInterval(stopwatchInterval);
  stopwatchTime = parseInt(stopwatchInput.value) || 0;
  updateDisplay();
  startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
  stopBeepLoop();
});

stopwatchInput.addEventListener('input', () => {
  if (!isRunning) {
    stopwatchTime = parseInt(stopwatchInput.value) || 0;
    updateDisplay();
  }
});

toggleBtn.addEventListener('click', () => {
  closeQuickAddOverlay();
  if (stopwatchOverlay?.style.display === "flex") {
    closeStopwatchOverlay();
  } else {
    openStopwatchOverlay();
  }
});


function populateQuickAddGroups() {
  populateGroupSelect(quickAddGroupSelect);
}

function populateQuickAddExercises(selectedGroup) {
  if (!quickAddExerciseSelect) return;
  quickAddExerciseSelect.innerHTML = '<option value="">Seleccionar ejercicio...</option>';
  if (!selectedGroup) {
    quickAddExerciseSelect.disabled = true;
    return;
  }
  const exercisesInGroup = Object.keys(exerciseTemplates).filter(name => {
    const tpl = exerciseTemplates[name];
    return resolveExerciseGroup(tpl) === selectedGroup;
  }).sort();
  exercisesInGroup.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    quickAddExerciseSelect.appendChild(opt);
  });
  quickAddExerciseSelect.disabled = false;
}

if (quickAddGroupSelect) {
  populateQuickAddGroups();
  quickAddGroupSelect.addEventListener("change", () => {
    populateQuickAddExercises(quickAddGroupSelect.value);
  });
}

if (quickAddPredefinedBtn) {
  quickAddPredefinedBtn.addEventListener("click", () => {
    const name = quickAddExerciseSelect?.value || "";
    if (!name) return;
    addExerciseFromTemplate(name);
  });
}

if (quickAddCustomBtn) {
  quickAddCustomBtn.addEventListener("click", () => {
    closeQuickAddOverlay();
    openCustomExerciseOverlay();
  });
}

if (quickAddToggleBtn) {
  quickAddToggleBtn.addEventListener("click", () => {
    closeStopwatchOverlay();
    if (quickAddOverlay?.style.display === "flex") {
      closeQuickAddOverlay();
    } else {
      openQuickAddOverlay();
    }
  });
}

if (stopwatchCloseBtn) {
  stopwatchCloseBtn.addEventListener("click", closeStopwatchOverlay);
}

if (quickAddCloseBtn) {
  quickAddCloseBtn.addEventListener("click", closeQuickAddOverlay);
}

if (customExerciseCancel) {
  customExerciseCancel.addEventListener("click", closeCustomExerciseOverlay);
}

if (customExerciseConfirm) {
  customExerciseConfirm.addEventListener("click", () => {
    const name = customExerciseName?.value.trim();
    if (!name) return;
    const isCardio = customExerciseIsCardio ? customExerciseIsCardio.checked : false;
  if (!exercisesContainer) exercisesContainer = mainExercisesContainer;
  exercisesContainer.appendChild(
      buildExerciseCard({
        nombre: name,
        musculo: isCardio ? "Cardio" : "Personalizado",
        seccion: "N/A",
        hacer: "",
        noHacer: "",
        trucos: "",
        sets: []
      })
    );
    saveSession();
    const total = exercisesContainer.querySelectorAll(".exercise-card").length;
    activeExerciseIndex = Math.max(0, total - 1);
    scheduleExercisePagination();
    closeCustomExerciseOverlay();
  });
}

if (exercisePrevBtn) {
  exercisePrevBtn.addEventListener("click", () => {
    activeExerciseIndex = Math.max(0, activeExerciseIndex - 1);
    scheduleExercisePagination();
  });
}

if (exerciseNextBtn) {
  exerciseNextBtn.addEventListener("click", () => {
    activeExerciseIndex += 1;
    scheduleExercisePagination();
  });
}

if (stopwatchOverlay) {
  stopwatchOverlay.addEventListener("click", (e) => {
    if (e.target === stopwatchOverlay) closeStopwatchOverlay();
  });
}

if (quickAddOverlay) {
  quickAddOverlay.addEventListener("click", (e) => {
    if (e.target === quickAddOverlay) closeQuickAddOverlay();
  });
}

if (customExerciseOverlay) {
  customExerciseOverlay.addEventListener("click", (e) => {
    if (e.target === customExerciseOverlay) closeCustomExerciseOverlay();
  });
}

// Inicializar display
updateDisplay();

const exerciseObserver = new MutationObserver(() => {
  scheduleExercisePagination(false);
});
if (mainExercisesContainer) {
  exerciseObserver.observe(mainExercisesContainer, { childList: true });
}
if (editExercisesContainer) {
  exerciseObserver.observe(editExercisesContainer, { childList: true });
}

// -------------------------
// DRAG AND DROP PARA REORDENAR EJERCICIOS
// -------------------------

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.exercise-card:not([style*="opacity: 0.5"])')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function bindDragAndDrop(container) {
  if (!container) return;
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggedElement = document.querySelector('.exercise-card[style*="opacity: 0.5"]');
    if (draggedElement) {
      const afterElement = getDragAfterElement(container, e.clientY);
      if (afterElement == null) {
        container.appendChild(draggedElement);
      } else {
        container.insertBefore(draggedElement, afterElement);
      }
      saveSession();
      scheduleExercisePagination();
    }
  });
}

bindDragAndDrop(mainExercisesContainer);
bindDragAndDrop(editExercisesContainer);

// -------------------------
// HISTÓRICO
// -------------------------

if (userHistorySelect) {
  userHistorySelect.addEventListener("change", () => {
    const selectedKey = userHistorySelect.value || "";
    if (!selectedKey) return;
    activateSelectedUser(selectedKey);
  });
}

if (newUserHistoryBtn) {
  newUserHistoryBtn.addEventListener("click", () => {
    const name = promptForNewUserName("");
    if (!name) return;
    const userList = loadUserList();
    const key = normalizeUserName(name);
    if (!userList.some(u => u.key === key)) {
      userList.push({ name, key });
      saveUserList(userList);
      setLocalHistoryForUser(key, []);
    }
    refreshUserSelect();
    if (userHistorySelect) userHistorySelect.value = key;
    activateSelectedUser(key);
    setUserHistoryStatus("Usuario creado y cargado.");
  });
}

if (renameUserHistoryBtn) {
  renameUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert("Selecciona un usuario para renombrar.");
      return;
    }
    const userList = loadUserList();
    const entry = userList.find(u => u.key === selectedKey);
    const defaultName = entry?.name || "";
    const newName = promptForNewUserName(defaultName);
    if (!newName) return;
    renameUserHistory(selectedKey, newName);
  });
}

if (deleteUserHistoryBtn) {
  deleteUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert("Selecciona un usuario para eliminar.");
      return;
    }
    deleteUserHistory(selectedKey);
  });
}

if (exportUserHistoryBtn) {
  exportUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert("Selecciona un usuario para exportar.");
      return;
    }
    const userList = loadUserList();
    const entry = userList.find(u => u.key === selectedKey);
    const data = getExportHistoryForUser(selectedKey);
    if (!data.length) {
      setUserHistoryStatus("No hay datos de este usuario para exportar.");
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = entry?.name ? normalizeUserName(entry.name) : selectedKey;
    a.download = `historico_${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setUserHistoryStatus("Datos del usuario exportados.");
  });
}

function escapeCsvCell(value) {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsvForUser(sessions) {
  const header = [
    "usuario",
    "fecha",
    "semana",
    "dia",
    "ejercicio",
    "musculo",
    "seccion",
    "serie",
    "peso",
    "reps",
    "fallo",
    "reps_fallo",
    "intensidad",
    "tiempo",
    "notas",
    "sens_general",
    "sens_tiredness",
    "sens_weight",
    "sens_pain",
    "sens_pain_zone",
    "sens_pain_exercise"
  ];
  const rows = [header.map(escapeCsvCell).join(",")];

  sessions.forEach(session => {
    const sensations = session.sensations || {};
    const base = {
      usuario: session.user || "",
      fecha: session.date || "",
      semana: session.week || "",
      dia: session.day || "",
      sens_general: sensations.general ?? "",
      sens_tiredness: sensations.tiredness ?? "",
      sens_weight: sensations.weight ?? "",
      sens_pain: sensations.pain ?? "",
      sens_pain_zone: sensations.painZone ?? "",
      sens_pain_exercise: sensations.painExercise ?? ""
    };

    const exercises = Array.isArray(session.exercises) ? session.exercises : [];
    if (!exercises.length) {
      const row = [
        base.usuario,
        base.fecha,
        base.semana,
        base.dia,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        base.sens_general,
        base.sens_tiredness,
        base.sens_weight,
        base.sens_pain,
        base.sens_pain_zone,
        base.sens_pain_exercise
      ];
      rows.push(row.map(escapeCsvCell).join(","));
      return;
    }

    exercises.forEach(ex => {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      if (!sets.length) {
        const row = [
          base.usuario,
          base.fecha,
          base.semana,
          base.dia,
          ex.nombre || "",
          ex.musculo || "",
          ex.seccion || "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          base.sens_general,
          base.sens_tiredness,
          base.sens_weight,
          base.sens_pain,
          base.sens_pain_zone,
          base.sens_pain_exercise
        ];
        rows.push(row.map(escapeCsvCell).join(","));
        return;
      }
      sets.forEach(set => {
        const row = [
          base.usuario,
          base.fecha,
          base.semana,
          base.dia,
          ex.nombre || "",
          ex.musculo || "",
          ex.seccion || "",
          set.serie ?? "",
          set.peso ?? "",
          set.reps ?? "",
          set.fallo === true ? "si" : set.fallo === false ? "no" : "",
          set.repsFallo ?? "",
          set.intensidad ?? "",
          set.tiempo ?? "",
          set.obs ?? "",
          base.sens_general,
          base.sens_tiredness,
          base.sens_weight,
          base.sens_pain,
          base.sens_pain_zone,
          base.sens_pain_exercise
        ];
        rows.push(row.map(escapeCsvCell).join(","));
      });
    });
  });

  return rows.join("\n");
}

if (exportUserHistoryCsvBtn) {
  exportUserHistoryCsvBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert("Selecciona un usuario para exportar.");
      return;
    }
    const userList = loadUserList();
    const entry = userList.find(u => u.key === selectedKey);
    const data = getExportHistoryForUser(selectedKey);
    if (!data.length) {
      setUserHistoryStatus("No hay datos de este usuario para exportar.");
      return;
    }
    const csv = buildCsvForUser(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = entry?.name ? normalizeUserName(entry.name) : selectedKey;
    a.download = `historico_${safeName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setUserHistoryStatus("CSV del usuario exportado.");
  });
}

if (importMergeHistoryBtn && importMergeHistoryInput) {
  importMergeHistoryBtn.addEventListener("click", () => {
    importMergeHistoryInput.value = "";
    importMergeHistoryInput.click();
  });
}

function openImportOverlay(userList) {
  if (!importOverlay || !importUserSelect) return;
  importUserSelect.innerHTML = "";
  userList.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user.key;
    opt.textContent = user.name;
    importUserSelect.appendChild(opt);
  });
  importOverlay.style.display = "flex";
  importOverlay.setAttribute("aria-hidden", "false");
}

function closeImportOverlay() {
  if (!importOverlay) return;
  importOverlay.style.display = "none";
  importOverlay.setAttribute("aria-hidden", "true");
}

function openManageUserOverlay() {
  if (!manageUserOverlay) return;
  manageUserOverlay.style.display = "flex";
  manageUserOverlay.setAttribute("aria-hidden", "false");
}

function closeManageUserOverlay() {
  if (!manageUserOverlay) return;
  manageUserOverlay.style.display = "none";
  manageUserOverlay.setAttribute("aria-hidden", "true");
}

function openHistoryMenuOverlay() {
  if (!historyMenuOverlay) return;
  historyMenuOverlay.style.display = "flex";
  historyMenuOverlay.setAttribute("aria-hidden", "false");
  refreshHistoryUI();
}

function closeHistoryMenuOverlay() {
  if (!historyMenuOverlay) return;
  historyMenuOverlay.style.display = "none";
  historyMenuOverlay.setAttribute("aria-hidden", "true");
}

if (importOverlayCancel) {
  importOverlayCancel.addEventListener("click", () => {
    closeImportOverlay();
  });
}

if (manageUserClose) {
  manageUserClose.addEventListener("click", closeManageUserOverlay);
}

if (manageUserOverlay) {
  manageUserOverlay.addEventListener("click", (e) => {
    if (e.target === manageUserOverlay) closeManageUserOverlay();
  });
}

if (manageUserHistoryBtn) {
  manageUserHistoryBtn.addEventListener("click", () => {
    openHistoryMenuOverlay();
  });
}

if (historyMenuClose) {
  historyMenuClose.addEventListener("click", closeHistoryMenuOverlay);
}

if (historyMenuOverlay) {
  historyMenuOverlay.addEventListener("click", (e) => {
    if (e.target === historyMenuOverlay) closeHistoryMenuOverlay();
  });
}

if (historyDateInput) {
  historyDateInput.addEventListener("change", () => {
    updateHistoryButtons();
  });
}

if (historyViewBtn) {
  historyViewBtn.addEventListener("click", () => {
    const session = getSelectedHistorySession();
    if (session) openHistoryViewOverlay(session);
  });
}

if (historyEditBtn) {
  historyEditBtn.addEventListener("click", () => {
    const session = getSelectedHistorySession();
    if (!session) return;
    if (!editingSessionContext) {
      editingSessionContext = {
        date: dateInput?.value || "",
        week: weekSelect?.value || "",
        day: daySelect?.value || ""
      };
    }
    if (editExercisesContainer) {
      exercisesContainer = editExercisesContainer;
      showAllExercises = true;
      editExercisesContainer.innerHTML = "";
    }
    if (dateInput) dateInput.value = session.date || "";
    if (weekSelect) {
      ensureSelectValue(weekSelect, session.week || "");
    }
    if (daySelect) {
      if (weekSelect) populateDaySelect(weekSelect.value);
      ensureSelectValue(daySelect, session.day || "");
    }
    loadSession();
    const step7Index = stepPages.indexOf(step7);
    if (step7Index >= 0) setActiveStep(step7Index);
    closeHistoryMenuOverlay();
    closeManageUserOverlay();
  });
}

if (historyViewClose) {
  historyViewClose.addEventListener("click", closeHistoryViewOverlay);
}

if (historyViewOverlay) {
  historyViewOverlay.addEventListener("click", (e) => {
    if (e.target === historyViewOverlay) closeHistoryViewOverlay();
  });
}

if (toggleUserManageBtn) {
  toggleUserManageBtn.addEventListener("click", () => {
    if (toggleUserManageBtn.disabled) return;
    openManageUserOverlay();
  });
}

if (importMergeHistoryInput) {
  importMergeHistoryInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const firstUser = Array.isArray(data) && data.length ? (data[0]?.user || "") : "";
        const trimmedName = String(firstUser || "").trim();
        const normalizedKey = normalizeUserName(trimmedName);
        let userList = loadUserList();
        let entry = normalizedKey
          ? userList.find(u => u.key === normalizedKey || u.name.toLowerCase() === trimmedName.toLowerCase())
          : null;

        if (!entry) {
          if (!trimmedName) {
            alert("No se ha encontrado un nombre de usuario en los datos importados.");
            return;
          }
          entry = { name: trimmedName, key: normalizedKey };
          userList.push(entry);
          saveUserList(userList);
          setLocalHistoryForUser(entry.key, []);
        }

        mergeImportedHistoryForUser(data, entry.name, entry.key);
        refreshUserSelect();
        if (userHistorySelect) userHistorySelect.value = entry.key;
        activateSelectedUser(entry.key);
        setUserHistoryStatus("Datos importados y fusionados correctamente.");
      } catch (err) {
        setUserHistoryStatus("Error al fusionar los datos: " + err.message);
      }
    };
    reader.readAsText(file);
  });
}
