/* ==========================================================
   app.js — versión limpia y corregida (v5: Reseteo en Recarga + Persistencia de Dolor)
   Requiere: ejercicios.js + html2canvas + rutinas.html
   ========================================================== */

// Elementos del DOM
const dateInput = document.getElementById("date-input");
const weekSelect = document.getElementById("week-select");
const daySelect = document.getElementById("day-select");

const loadBtn = document.getElementById("load-routine-btn");
const exportBtn = document.getElementById("export-png-btn"); 
const saveSessionBtn = document.getElementById("save-session-btn");

const exercisesContainer = document.getElementById("exercises-container");
const predefinedSelect = document.getElementById("predefined-exercise-select");
const muscleGroupSelect = document.getElementById("muscle-group-select");
const addPredefinedBtn = document.getElementById("add-predefined-btn");
const addCustomBtn = document.getElementById("add-custom-btn");
const statusText = document.getElementById("status-text");

const userHistoryControls = document.getElementById("user-history-controls");
const userHistorySelect = document.getElementById("user-history-select");
const confirmUserHistoryBtn = document.getElementById("confirm-user-history-btn");
const importUserHistoryBtn = document.getElementById("import-user-history-btn");
const newUserHistoryBtn = document.getElementById("new-user-history-btn");
const renameUserHistoryBtn = document.getElementById("rename-user-history-btn");
const deleteUserHistoryBtn = document.getElementById("delete-user-history-btn");
const exportUserHistoryBtn = document.getElementById("export-user-history-btn");
const uploadUserHistoryInput = document.getElementById("upload-user-history");
const importMergeHistoryBtn = document.getElementById("import-merge-history-btn");
const importMergeHistoryInput = document.getElementById("import-merge-history-input");
const userHistoryStatus = document.getElementById("user-history-status");
const appContent = document.getElementById("app-content");
const importOverlay = document.getElementById("import-overlay");
const importUserSelect = document.getElementById("import-user-select");
const importOverlayCancel = document.getElementById("import-overlay-cancel");
const importOverlayConfirm = document.getElementById("import-overlay-confirm");
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");
const step4 = document.getElementById("step-4");
const step1Status = document.getElementById("step-1-status");
const step2Status = document.getElementById("step-2-status");
const step3Status = document.getElementById("step-3-status");
const step4Status = document.getElementById("step-4-status");

const LOCAL_HISTORY_KEY = "gym_history_v1";
const USER_LIST_KEY = "gym_user_list";

let currentUserName = "";
let currentUserKey = "";

function normalizeUserName(name) {
  return name.trim().replace(/\s+/g, "_");
}

function loadUserList() {
  let list = [];
  let changed = false;
  try {
    const raw = localStorage.getItem(USER_LIST_KEY);
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

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
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

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
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

  const lastUser = localStorage.getItem("gym_user_name") || "";
  if (lastUser.trim()) {
    const lastKey = normalizeUserName(lastUser.trim());
    const exists = list.some(item => item.key === lastKey);
    if (!exists) {
      list.push({ name: lastUser.trim(), key: lastKey });
      changed = true;
    }
  }

  if (changed) {
    localStorage.setItem(USER_LIST_KEY, JSON.stringify(list));
  }

  return list;
}

function saveUserList(list) {
  localStorage.setItem(USER_LIST_KEY, JSON.stringify(list));
}

function promptForNewUserName(defaultValue) {
  const input = prompt("Nombre para el nuevo histórico:", defaultValue || "");
  if (input == null) return "";
  return input.trim();
}

function setCurrentUser(name, key) {
  currentUserName = name;
  currentUserKey = key;
  localStorage.setItem("gym_user_name", currentUserName);
}

function refreshCharts() {
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}

function renameUserHistory(userKey, newName) {
  const userList = loadUserList();
  const entry = userList.find(u => u.key === userKey);
  if (!entry) {
    alert("Selecciona un histórico válido.");
    return;
  }
  const trimmed = newName.trim();
  if (!trimmed) return;
  const newKey = normalizeUserName(trimmed);
  if (newKey !== userKey && userList.some(u => u.key === newKey)) {
    alert("Ya existe un histórico con ese nombre.");
    return;
  }

  const sessions = getLocalHistoryForUser(userKey).map(session => ({
    ...session,
    user: trimmed,
    key: buildSessionKeyForUser(session, newKey)
  }));
  setLocalHistoryForUser(newKey, sessions);
  if (newKey !== userKey) {
    localStorage.removeItem(getHistoryStorageKeyForUser(userKey));
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
    alert("Selecciona un histórico válido.");
    return;
  }
  const ok = confirm(`Eliminar el histórico de "${entry.name}"? Esta acción no se puede deshacer.`);
  if (!ok) return;

  localStorage.removeItem(getHistoryStorageKeyForUser(entry.key));
  const prefix = `gym_${entry.key}_`;
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i) || "";
    if (key.startsWith(prefix)) {
      localStorage.removeItem(key);
      continue;
    }
    if (!key.startsWith("gym_")) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.user === entry.name) {
        localStorage.removeItem(key);
      }
    } catch (err) {
      // Ignore malformed entries.
    }
  }

  const legacyKey = "gym_history_v1";
  const legacyRaw = localStorage.getItem(legacyKey);
  if (legacyRaw) {
    try {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        const filtered = legacyParsed.filter(item => item?.user !== entry.name);
        if (filtered.length === 0) {
          localStorage.removeItem(legacyKey);
        } else {
          localStorage.setItem(legacyKey, JSON.stringify(filtered));
        }
      }
    } catch (err) {
      // Ignore malformed legacy entries.
    }
  }

  userList.splice(entryIndex, 1);
  saveUserList(userList);

  const storedName = localStorage.getItem("gym_user_name");
  if (currentUserKey === entry.key || storedName === entry.name) {
    currentUserKey = "";
    currentUserName = "";
    localStorage.removeItem("gym_user_name");
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
  placeholder.textContent = "Selecciona un usuario (paso 1)";
  placeholder.disabled = true;
  placeholder.selected = true;
  userHistorySelect.appendChild(placeholder);

  if (!userList.length) {
    userHistorySelect.disabled = true;
    confirmUserHistoryBtn.disabled = true;
    setUserHistoryStatus("No hay históricos. Crea uno nuevo para empezar.");
    return userList;
  }

  userList.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user.key;
    opt.textContent = user.name;
    userHistorySelect.appendChild(opt);
  });
  userHistorySelect.disabled = false;
  confirmUserHistoryBtn.disabled = false;
  setUserHistoryStatus("Paso 1: selecciona un usuario y pulsa \"Usar histórico\".");
  return userList;
}

function setAppVisible(isVisible) {
  if (!appContent) return;
  appContent.style.display = isVisible ? "block" : "none";
}

function setAppEnabled(enabled) {
  const main = document.querySelector("main");
  if (!main) return;
  const controls = main.querySelectorAll("input, select, button, textarea");
  controls.forEach(el => {
    if (userHistoryControls && userHistoryControls.contains(el)) return;
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
    alert("Selecciona un histórico válido.");
    return;
  }
  setCurrentUser(selected.name, selected.key);
  loadLocalHistory();
  hydrateHistoryFromSessionKeys();
  setAppEnabled(true);
  setAppVisible(true);
  setUserHistoryStatus(`Usando histórico: ${selected.name}`);
  updateStepStatus();
}

function updateStepStatus() {
  const hasUser = Boolean(currentUserKey);
  const hasExercises = exercisesContainer && exercisesContainer.children.length > 0;

  if (step1) step1.open = !hasUser;
  if (step3) step3.open = hasUser;
  if (step4) step4.open = hasUser;

  if (step1Status) step1Status.textContent = hasUser ? "Completado" : "Pendiente";
  if (step2Status) step2Status.textContent = hasExercises ? "Completado" : "Opcional";
  if (step3Status) step3Status.textContent = hasExercises ? "En progreso" : "Pendiente";
  if (step4Status) step4Status.textContent = hasUser ? "Opcional" : "Pendiente";
}

// Event listener para el select de grupo muscular
if (muscleGroupSelect) {
  muscleGroupSelect.addEventListener("change", () => {
    const selectedGroup = muscleGroupSelect.value;
    populateExerciseSelect(selectedGroup);
  });
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
  const raw = localStorage.getItem(getHistoryStorageKey());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function getLocalHistoryForUser(userKey) {
  const raw = localStorage.getItem(getHistoryStorageKeyForUser(userKey));
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
  if (localStorage.getItem(historyKey)) return true;
  const prefix = `gym_${userKey}_`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

function setLocalHistory(sessions) {
  localStorage.setItem(getHistoryStorageKey(), JSON.stringify(sessions));
}

function setLocalHistoryForUser(userKey, sessions) {
  localStorage.setItem(getHistoryStorageKeyForUser(userKey), JSON.stringify(sessions));
}

function collectSessionsFromSessionKeys(userKey) {
  const sessions = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || "";
    if (userKey === "local") {
      if (!/^gym_\d{4}-\d{2}-\d{2}_/.test(key)) continue;
    } else {
      const prefix = `gym_${userKey}_`;
      if (!key.startsWith(prefix)) continue;
    }
    try {
      const raw = localStorage.getItem(key);
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
}

function upsertLocalHistory(session) {
  if (!session) return;
  const sessions = getLocalHistory();
  const key = session.key || buildSessionKey(session) || sessionKey();
  const sessionWithKey = { ...session, key, user: session.user || currentUserName };
  const index = sessions.findIndex(item => item.key === key);
  if (index >= 0) {
    sessions[index] = sessionWithKey;
  } else {
    sessions.push(sessionWithKey);
  }
  setLocalHistory(sessions);
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshCharts();
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
  const baseline = parseFloat(warningEl.dataset.baseline);
  if (Number.isNaN(baseline) || baseline <= 0) {
    warningEl.style.display = "none";
    return;
  }

  const rows = card.querySelectorAll("tbody tr");
  let currentMax = null;
  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const peso = parseFloat(inputs[1]?.value);
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


// -------------------------
// FUNCIÓN DE VALIDACIÓN 
// -------------------------
function checkSensationsForm() {
    let isValid = true;
    
    // 1. Sensaciones generales y cansancio
    if (!senseGeneralInput.value || senseGeneralInput.value.trim() === '') {
        isValid = false;
    }
    if (!senseTirednessInput.value || senseTirednessInput.value.trim() === '') {
        isValid = false;
    }

    // 2. Dolor específico (si 'si' está seleccionado)
    if (sensePainSelect.value === 'si') {
        if (!painZoneInput.value || painZoneInput.value.trim() === '') {
            isValid = false;
        }
        // Validar que se haya seleccionado un ejercicio O "No identificado"
        if (!painExerciseSelect.value || painExerciseSelect.value.trim() === '') {
            isValid = false;
        }
    }
    
    exportBtn.disabled = !isValid;
    if (saveSessionBtn) saveSessionBtn.disabled = !isValid;
    return isValid;
}


// -------------------------
// CREAR FILAS DE SERIES
// -------------------------

function addSetRow(tbody, setData = {}, onInputChange) {
  const tr = document.createElement("tr");
  const shouldCopyFromPrev = Object.keys(setData).length === 0;
  let resolvedSetData = setData;

  if (shouldCopyFromPrev) {
    const prevRow = tbody.lastElementChild;
    if (prevRow) {
      const prevInputs = prevRow.querySelectorAll("input");
      const prevPeso = prevInputs[1]?.value ?? "";
      const prevReps = prevInputs[2]?.value ?? "";
      const copied = {};
      if (prevPeso !== "") copied.peso = prevPeso;
      if (prevReps !== "") copied.reps = prevReps;
      resolvedSetData = { ...copied, ...setData };
    }
  }

  const fields = [
    { key: "serie", type: "number", default: tbody.children.length + 1 },
    { key: "peso", type: "number" },
    { key: "reps", type: "number" },
    { key: "fallo", type: "checkbox" },
    { key: "repsFallo", type: "number" },
    { key: "obs", type: "text" }
  ];

  fields.forEach(f => {
    const td = document.createElement("td");
    let input;

    if (f.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = setData[f.key] ?? false;
    } else {
      input = document.createElement("input");
      input.type = f.type;
      input.value = resolvedSetData[f.key] ?? f.default ?? "";
    }

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


  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Eliminar ejercicio";
  removeBtn.className = "btn-danger btn-small";
  
  removeBtn.onclick = () => {
    card.remove();
    saveSession();
    loadSession(); // Necesario para refrescar el painExerciseSelect
  };

  const headerActions = document.createElement("div");
  headerActions.style.display = "flex";
  headerActions.style.gap = "6px";
  headerActions.style.alignItems = "center";
  headerActions.appendChild(removeBtn);

  header.appendChild(left);
  header.appendChild(headerActions);
  card.appendChild(header);

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
  const lastMax = getLastExerciseMaxWeight(exData.nombre);
  if (lastMax != null) overloadWarning.dataset.baseline = String(lastMax);
  card.appendChild(overloadWarning);

  // ====== TABLA DE SERIES ======
  const table = document.createElement("table");
  table.className = "exercise-table";
  table.innerHTML = `
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
    exData.sets.forEach(s => addSetRow(tbody, s, () => updateOverloadWarning(card)));
  } else {
    const lastSet = getLastExerciseSet(exData.nombre);
    const initialSet = {};
    if (lastSet) {
      if (lastSet.peso != null && lastSet.peso !== "") initialSet.peso = lastSet.peso;
      if (lastSet.reps != null && lastSet.reps !== "") initialSet.reps = lastSet.reps;
    }
    if (Object.keys(initialSet).length === 0) {
      const maxWeight = getMaxWeight(exData.nombre);
      if (maxWeight) initialSet.peso = maxWeight;
    }
    addSetRow(tbody, initialSet, () => updateOverloadWarning(card));
  }

  const addBtn = document.createElement("button");
  addBtn.textContent = "Añadir serie";
  addBtn.className = "btn-primary btn-small add-set-btn";
  addBtn.onclick = () => {
    addSetRow(tbody, {}, () => updateOverloadWarning(card));
    saveSession();
    updateOverloadWarning(card);
  };

  headerActions.prepend(addBtn);

  updateOverloadWarning(card);

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
      return {
        serie: parseInt(inputs[0]?.value) || null,
        peso: parseFloat(inputs[1]?.value) || null,
        reps: parseInt(inputs[2]?.value) || null,
        fallo: inputs[3]?.checked || false,
        repsFallo: parseInt(inputs[4]?.value) || null,
        obs: inputs[5]?.value || ""
      };
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

  localStorage.setItem(key, JSON.stringify(data));
  setStatus("Guardado");
  
  // 1. Repopulate the list of exercises for the pain selector
  const currentExerciseNames = data.exercises.map(ex => ex.nombre);
  populatePainExerciseSelect(currentExerciseNames); 

  // 2. Restaurar la selección en el DOM (en caso de que la lista haya cambiado)
  painExerciseSelect.value = data.sensations.painExercise; 

  checkSensationsForm();
  updateStepStatus();
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE AÑADIR EJERCICIO (POR GRUPO)
// -------------------------

function populateExerciseSelect(selectedGroup) {
  if (!predefinedSelect) return;
  predefinedSelect.innerHTML = `<option value="">Seleccionar ejercicio...</option>`;
  
  if (!selectedGroup) {
    predefinedSelect.disabled = true;
    return;
  }
  
  predefinedSelect.disabled = false;
  
  // Filtrar ejercicios por grupo
  const exercisesInGroup = Object.keys(exerciseTemplates).filter(name => {
    const tpl = exerciseTemplates[name];
    const group = muscleGroupMap[tpl.musculo] || "Otros";
    return group === selectedGroup;
  }).sort();
  
  exercisesInGroup.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    predefinedSelect.appendChild(opt);
  });
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
  const saved = JSON.parse(localStorage.getItem(key) || "null");

  const week = weekSelect.value;
  const day = daySelect.value;
  const routine = routines[week]?.[day];
  
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
}


// -------------------------
// AÑADIR EJERCICIO PREDEFINIDO
// -------------------------

if (addPredefinedBtn) {
  addPredefinedBtn.onclick = () => {
    const name = predefinedSelect.value;
    if (!name) return;
    addExerciseFromTemplate(name);
  };
}


// -------------------------
// AÑADIR PERSONALIZADO
// -------------------------

if (addCustomBtn) {
  addCustomBtn.onclick = () => {
    const name = prompt("Nombre del ejercicio:");
    if (!name) return;

    exercisesContainer.appendChild(
      buildExerciseCard({
        nombre: name,
        musculo: "Personalizado",
        seccion: "N/A",
        hacer: "",
        noHacer: "",
        trucos: "",
        sets: []
      })
    );

    saveSession();
  };
}


// -------------------------
// EXPORTACIÓN A PNG (FORMATO TABLA)
// -------------------------
exportBtn.onclick = () => {
  // Doble verificación de validación
  if (!checkSensationsForm()) {
    return alert("Por favor, completa todo el cuestionario de Post-Entrenamiento antes de exportar.");
  }

  saveSession();

  const key = sessionKey();
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  if (!saved) return alert("No hay datos registrados hoy.");

  // Crear contenedor sin borrar nada antes
  const exportDiv = document.createElement("div");
  exportDiv.style.background = "white";
  exportDiv.style.padding = "20px";
  exportDiv.style.fontFamily = "sans-serif";
  exportDiv.style.width = "fit-content";
  exportDiv.style.color = "#000"; 

  // Cabecera: Solo la fecha
  const title = document.createElement("h2");
  const weekday = new Date(saved.date).toLocaleDateString("es-ES", { weekday: "long" });
  const weekdayText = weekday && weekday !== "Invalid Date" ? ` (${weekday})` : "";
  title.textContent = `${saved.date}${weekdayText}`; 
  title.style.color = "#000"; 
  exportDiv.appendChild(title);

  // Tabla
  const table = document.createElement("table");
  table.style.borderCollapse = "separate";
  table.style.borderSpacing = "0";
  table.style.fontSize = "12px";
  table.style.color = "#000"; 

  // Estilos de la cabecera (Texto blanco, fondo oscuro)
  table.innerHTML = `
    <tr style="background:#000; font-weight:bold;"> 
      <th style="border:1px solid #000; padding:4px; color:#fff;">Ejercicio</th>
      <th style="border:1px solid #000; padding:4px; color:#fff;">Serie</th>
      <th style="border:1px solid #000; padding:4px; color:#fff;">Peso</th>
      <th style="border:1px solid #000; padding:4px; color:#fff;">Reps</th>
      <th style="border:1px solid #000; padding:4px; color:#fff;">Fallo</th>
      <th style="border:1px solid #000; padding:4px; color:#fff;">Reps fallo</th>
      <th style="border:1px solid #000; padding:4px; color:#fff;">Notas</th>
    </tr>
  `;

  // Rellenar tabla con todos los sets (texto negro)
  let totalExercises = 0;
  let totalSets = 0;

  saved.exercises.forEach((ex, exIndex) => {
    const groupBg = exIndex % 2 === 0 ? "#e2e8f0" : "#f8fafc";
    totalExercises += 1;

    ex.sets.forEach((set, setIndex) => {
      totalSets += 1;

      const tr = document.createElement("tr");
      tr.style.background = groupBg;
      if (setIndex === 0) {
        tr.style.borderTop = "2px solid #000";
      }
      tr.innerHTML = `
        <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; font-weight: bold;">${ex.nombre}</td>
        <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.serie ?? ""}</td>
        <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${set.peso ?? ""}</td>
        <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${set.reps ?? ""}</td>
        <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.fallo ? "Sí" : "No"}</td>
        <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.repsFallo ?? ""}</td>
        <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.obs ?? ""}</td>
      `;
      table.appendChild(tr);
    });

    if (exIndex < saved.exercises.length - 1) {
      const separator = document.createElement("tr");
      separator.innerHTML = `
        <td colspan="7" style="border-left:1px solid #000; border-right:1px solid #000; border-top:1px solid #777; padding:0; height:6px; background:#fff;"></td>
      `;
      table.appendChild(separator);
    }
  });

  table.querySelectorAll("th, td").forEach(cell => {
    cell.style.borderColor = "#000";
  });
  table.querySelectorAll("td").forEach(cell => {
    cell.style.color = "#000";
  });

  exportDiv.appendChild(table);

  // RESUMEN
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

  // AÑADIR SENSACIONES AL EXPORT (Texto negro)
  const sensations = saved.sensations || {};
  const sensDiv = document.createElement('div');
  sensDiv.style.marginTop = '20px';
  sensDiv.style.borderTop = '1px solid #000';
  sensDiv.style.paddingTop = '10px';
  sensDiv.style.color = "#000";
  
  let painText = "";
  if (sensations.pain === 'si') {
      painText = `Sí (${sensations.painZone || 'Zona N/A'} - Ejercicio: ${sensations.painExercise || 'N/A'})`;
  } else {
      painText = 'No';
  }
  
  // Usar párrafos para formato de fila separada
  sensDiv.innerHTML = `
      <p style="font-weight:bold; margin: 3px 0; color:#000; font-size:14px;">Métricas Subjetivas:</p>
      <p style="margin: 3px 0; color:#000; font-size:12px;">- Sensaciones generales (0-10): ${sensations.general || 'N/A'}</p>
      <p style="margin: 3px 0; color:#000; font-size:12px;">- Cansancio percibido (0-10): ${sensations.tiredness || 'N/A'}</p>
      <p style="margin: 3px 0; color:#000; font-size:12px;">- Dolor en algún músculo: ${painText}</p>
  `;
  exportDiv.appendChild(sensDiv);
  
  // MARCA DE AGUA (Texto negro)
  const footer = document.createElement('p');
  footer.textContent = 'Registrado con GymTracker by Borja Aguado';
  footer.style.fontSize = '10px';
  footer.style.textAlign = 'right';
  footer.style.marginTop = '15px';
  footer.style.color = "#000";
  exportDiv.appendChild(footer);
  
  // Añadir al DOM para que html2canvas pueda capturarlo
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
    if (!checkSensationsForm()) {
      return alert("Por favor, completa todo el cuestionario de Post-Entrenamiento antes de guardar.");
    }
    saveSession();
    const key = sessionKey();
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (!saved) return alert("No hay datos registrados hoy.");
    upsertLocalHistory(saved);
    setStatus("Sesion guardada en historico local.");
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


// -------------------------
// INICIALIZACIÓN
// -------------------------

// Listener para el botón de cargar/cambiar rutina (adicional al change)
loadBtn.addEventListener("click", loadSession);

function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

onReady(() => {
  // Restablecer selectores y cargar
  weekSelect.value = 'Semana 1';
  daySelect.value = 'Día 1';

  initializeForUserSelection();
  refreshUserSelect();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
});

window.addEventListener("load", () => {
  refreshUserSelect();
});


// Añadir listeners para que los cambios de fecha/selectores recarguen la sesión

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
const minimizeBtn = document.getElementById('minimize-stopwatch');
const popup = document.getElementById('stopwatch-popup');
const quickAddPopup = document.getElementById('quick-add-popup');
const quickAddToggleBtn = document.getElementById('toggle-quick-add');
const quickAddMinimizeBtn = document.getElementById('minimize-quick-add');
const quickAddGroupSelect = document.getElementById('quick-add-group');
const quickAddExerciseSelect = document.getElementById('quick-add-exercise');
const quickAddPredefinedBtn = document.getElementById('quick-add-predefined');
const quickAddCustomBtn = document.getElementById('quick-add-custom');

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
  if (quickAddPopup && !quickAddPopup.classList.contains("collapsed")) {
    quickAddPopup.classList.add("collapsed");
    quickAddPopup.style.display = "none";
  }
  popup.classList.toggle('collapsed');
  if (popup.classList.contains('collapsed')) {
    popup.style.display = 'none';
  } else {
    popup.style.display = 'block';
  }
});

minimizeBtn.addEventListener('click', () => {
  popup.classList.add('collapsed');
  popup.style.display = 'none';
});

function populateQuickAddGroups() {
  if (!quickAddGroupSelect) return;
  quickAddGroupSelect.innerHTML = '<option value="">Seleccionar grupo...</option>';
  const groups = [
    "Pecho",
    "Espalda",
    "Hombros",
    "Brazos",
    "Piernas",
    "Antebrazos",
    "Cardio",
    "Core"
  ];
  groups.forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = group;
    quickAddGroupSelect.appendChild(opt);
  });
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
    const group = muscleGroupMap[tpl.musculo] || "Otros";
    return group === selectedGroup;
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
    const name = prompt("Nombre del ejercicio:");
    if (!name) return;
    exercisesContainer.appendChild(
      buildExerciseCard({
        nombre: name,
        musculo: "Personalizado",
        seccion: "N/A",
        hacer: "",
        noHacer: "",
        trucos: "",
        sets: []
      })
    );
    saveSession();
  });
}

if (quickAddToggleBtn) {
  quickAddToggleBtn.addEventListener("click", () => {
    if (!popup.classList.contains("collapsed")) {
      popup.classList.add("collapsed");
      popup.style.display = "none";
    }
    quickAddPopup.classList.toggle("collapsed");
    if (quickAddPopup.classList.contains("collapsed")) {
      quickAddPopup.style.display = "none";
    } else {
      quickAddPopup.style.display = "block";
    }
  });
}

if (quickAddMinimizeBtn) {
  quickAddMinimizeBtn.addEventListener("click", () => {
    quickAddPopup.classList.add("collapsed");
    quickAddPopup.style.display = "none";
  });
}

// Inicializar display
updateDisplay();

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

exercisesContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

exercisesContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  const draggedElement = document.querySelector('.exercise-card[style*="opacity: 0.5"]');
  if (draggedElement) {
    const afterElement = getDragAfterElement(exercisesContainer, e.clientY);
    if (afterElement == null) {
      exercisesContainer.appendChild(draggedElement);
    } else {
      exercisesContainer.insertBefore(draggedElement, afterElement);
    }
    saveSession();
  }
});

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
    setUserHistoryStatus("Histórico creado. Confirma la selección para usarlo.");
  });
}

if (renameUserHistoryBtn) {
  renameUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert("Selecciona un histórico para renombrar.");
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
      alert("Selecciona un histórico para eliminar.");
      return;
    }
    deleteUserHistory(selectedKey);
  });
}

if (exportUserHistoryBtn) {
  exportUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert("Selecciona un histórico para exportar.");
      return;
    }
    const userList = loadUserList();
    const entry = userList.find(u => u.key === selectedKey);
    const data = getExportHistoryForUser(selectedKey);
    if (!data.length) {
      setUserHistoryStatus("No hay datos para exportar.");
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
    setUserHistoryStatus("Histórico exportado.");
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

if (importOverlayCancel) {
  importOverlayCancel.addEventListener("click", () => {
    closeImportOverlay();
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
        let selectedKey = userHistorySelect?.value || "";
        let userList = loadUserList();
        let entry = selectedKey ? userList.find(u => u.key === selectedKey) : null;

        if (!selectedKey) {
          if (!userList.length) {
            alert("No hay usuarios disponibles. Primero crea uno nuevo.");
            return;
          }
          openImportOverlay(userList);
          if (importOverlayConfirm) {
            importOverlayConfirm.onclick = () => {
              const chosenKey = importUserSelect?.value || "";
              const chosen = userList.find(u => u.key === chosenKey);
              if (!chosen) return;
              mergeImportedHistoryForUser(data, chosen.name, chosen.key);
              refreshUserSelect();
              if (userHistorySelect) userHistorySelect.value = chosen.key;
              setUserHistoryStatus("Histórico fusionado correctamente.");
              closeImportOverlay();
            };
          }
          return;
        }

        const name = entry?.name || selectedKey;
        mergeImportedHistoryForUser(data, name, selectedKey);
        refreshUserSelect();
        setUserHistoryStatus("Histórico fusionado correctamente.");
      } catch (err) {
        setUserHistoryStatus("Error al fusionar el histórico: " + err.message);
      }
    };
    reader.readAsText(file);
  });
}

if (importUserHistoryBtn && uploadUserHistoryInput) {
  importUserHistoryBtn.addEventListener("click", () => {
    uploadUserHistoryInput.value = "";
    uploadUserHistoryInput.click();
  });
}

if (uploadUserHistoryInput) {
  uploadUserHistoryInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const firstUser = Array.isArray(data) && data.length ? (data[0]?.user || "") : "";
        const name = promptForNewUserName(firstUser);
        if (!name) return;
        const key = normalizeUserName(name);
        mergeImportedHistoryForUser(data, name, key);
        const userList = loadUserList();
        if (!userList.some(u => u.key === key)) {
          userList.push({ name, key });
          saveUserList(userList);
        }
        refreshUserSelect();
        setUserHistoryStatus(`Histórico importado para ${name}.`);
      } catch (err) {
        setUserHistoryStatus("Error al importar el histórico: " + err.message);
      }
    };
    reader.readAsText(file);
  });
}
