function loadCustomRoutines() {
  if (!currentUserKey) return {};
  try {
    const key = `${CUSTOM_ROUTINES_KEY}_${currentUserKey}`;
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

function saveCustomRoutines(data) {
  if (!currentUserKey) return;
  const key = `${CUSTOM_ROUTINES_KEY}_${currentUserKey}`;
  storage.setItem(key, JSON.stringify(data));
}

function getAllRoutines() {
  const base = window.routines || {};
  const custom = loadCustomRoutines();
  return { ...base, ...custom };
}

function buildRoutineValue(week, day) {
  return `${week}${ROUTINE_VALUE_SEP}${day}`;
}

function parseRoutineValue(value) {
  const [week, day] = String(value || "").split(ROUTINE_VALUE_SEP);
  return { week: week || "", day: day || "" };
}

function getSelectedRoutineKeys() {
  if (routineSelect?.value) {
    const parsed = parseRoutineValue(routineSelect.value);
    if (parsed.week && parsed.day) return parsed;
  }
  return { week: weekSelect?.value || "", day: daySelect?.value || "" };
}

function syncRoutineSelectFromWeekDay() {
  if (!routineSelect || !weekSelect || !daySelect) return;
  const value = buildRoutineValue(weekSelect.value, daySelect.value);
  const hasOption = Array.from(routineSelect.options).some(opt => opt.value === value);
  if (hasOption) routineSelect.value = value;
}

function getRoutineEntries() {
  const routines = getAllRoutines();
  const entries = [];
  Object.keys(routines).forEach(week => {
    const days = routines[week] || {};
    const dayKeys = Object.keys(days);
    dayKeys.forEach(day => {
      const isSingleCustom = dayKeys.length === 1 && day === "Día 1 - Sesión guardada";
      const label = isSingleCustom
        ? translateRoutineLabel(week)
        : `${translateRoutineLabel(week)} · ${translateRoutineLabel(day)}`;
      entries.push({
        week,
        day,
        label,
        value: buildRoutineValue(week, day)
      });
    });
  });
  entries.sort((a, b) => a.label.localeCompare(b.label, getLocale()));
  return entries;
}

function normalizeRoutineExerciseName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeRoutineLabel(label) {
  return String(label || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");
}

function findMatchingRoutineKey(group, label) {
  if (!group || typeof group !== "object") return "";
  const target = normalizeRoutineLabel(label);
  if (!target) return "";
  return Object.keys(group).find(key => normalizeRoutineLabel(key) === target) || "";
}

function resolveRoutineKeys(week, day) {
  const allRoutines = getAllRoutines();
  let weekKey = week;
  if (!allRoutines[weekKey]) {
    const matchedWeek = findMatchingRoutineKey(allRoutines, week);
    if (matchedWeek) weekKey = matchedWeek;
  }
  const weekGroup = allRoutines[weekKey] || {};
  let dayKey = day;
  if (!weekGroup[dayKey]) {
    const matchedDay = findMatchingRoutineKey(weekGroup, day);
    if (matchedDay) {
      dayKey = matchedDay;
    } else {
      const targetNumber = extractRoutineNumber(day);
      if (!Number.isNaN(targetNumber)) {
        const numberMatch = Object.keys(weekGroup).find(key => extractRoutineNumber(key) === targetNumber);
        if (numberMatch) dayKey = numberMatch;
      }
    }
  }
  return { weekKey, dayKey };
}

function getRoutineSignature(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) return "";
  return exercises
    .map(normalizeRoutineExerciseName)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, getLocale()))
    .join("|");
}

function getSavedRoutineSignatures() {
  const routines = getAllRoutines();
  const signatures = new Set();
  Object.values(routines).forEach(days => {
    if (!days || typeof days !== "object") return;
    Object.values(days).forEach(exercises => {
      if (!Array.isArray(exercises)) return;
      const signature = getRoutineSignature(exercises);
      if (signature) signatures.add(signature);
    });
  });
  return signatures;
}

function getCurrentRoutineExercises() {
  return Array.from(document.querySelectorAll(".exercise-card .exercise-title"))
    .map(card => card.textContent.trim())
    .filter(Boolean);
}

function notifyRoutineError(message) {
  if (saveRoutineError) {
    showSaveRoutineError(message);
    return;
  }
  alert(message);
}

function saveCurrentRoutineAs(name, exercises) {
  const trimmed = name.trim();
  if (!trimmed) {
    notifyRoutineError(t("status.emptyRoutineName"));
    return false;
  }
  const routineExercises = Array.isArray(exercises) ? exercises : [];
  if (routineExercises.length === 0) {
    notifyRoutineError(t("status.noExercisesToSaveRoutine"));
    return false;
  }
  const allCustom = loadCustomRoutines();
  const exists = Boolean(allCustom[trimmed]);
  if (exists && !confirm(t("confirm.overwriteRoutine", { name: trimmed }))) {
    return false;
  }
  allCustom[trimmed] = {
    "Día 1 - Sesión guardada": routineExercises
  };
  saveCustomRoutines(allCustom);
  populateRoutineSelectors();
  if (weekSelect) {
    weekSelect.value = trimmed;
    populateDaySelect(trimmed);
  }
  syncRoutineSelectFromWeekDay();
  setStatus(t("status.routineAdded"));
  return true;
}

async function maybePromptSaveRoutine() {
  if (!currentUserKey) return;
  const exercises = getCurrentRoutineExercises();
  if (!exercises.length) return;
  const signature = getRoutineSignature(exercises);
  if (!signature) return;
  const savedSignatures = getSavedRoutineSignatures();
  if (savedSignatures.has(signature)) return;
  if (lastRoutinePromptSignature === signature) return;
  lastRoutinePromptSignature = signature;

  if (!confirm(t("confirm.saveNewRoutine"))) return;
  const routineName = await promptForRoutineName("");
  if (!routineName) return;
  saveCurrentRoutineAs(routineName, exercises);
}


function populateGroupSelect(selectEl) {
  if (!selectEl) return;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("placeholder.selectGroup");
  selectEl.replaceChildren(placeholder);
  getExerciseGroups().forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = translateGroupLabel(group);
    selectEl.appendChild(opt);
  });
}

function extractRoutineNumber(label) {
  const match = String(label).match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
}

const routineLabelMap = {
  "Semana 1": "week.1",
  "Semana 2": "week.2",
  "Semana 3": "week.3",
  "Semana 4": "week.4",
  "Semana 5": "week.5",
  "Día 1 – Tren superior (tirón + pecho secundario)": "day.1",
  "Día 2 – Tren superior (empuje + hombro y brazos)": "day.2",
  "Día 3 – Tren inferior + core": "day.3"
};

function translateRoutineLabel(label) {
  const key = routineLabelMap[label];
  return key ? t(key) : label;
}

function sortRoutineLabels(a, b) {
  const numA = extractRoutineNumber(a);
  const numB = extractRoutineNumber(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
    return numA - numB;
  }
  if (!Number.isNaN(numA) && Number.isNaN(numB)) return -1;
  if (Number.isNaN(numA) && !Number.isNaN(numB)) return 1;
  return String(a).localeCompare(String(b), getLocale());
}

function populateDaySelect(week) {
  if (!daySelect) return;
  daySelect.innerHTML = "";
  const allRoutines = getAllRoutines();
  const days = Object.keys(allRoutines?.[week] || {}).sort(sortRoutineLabels);
  days.forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = translateRoutineLabel(day);
    daySelect.appendChild(opt);
  });
  if (days.length > 0) daySelect.value = days[0];
}

function populateRoutineSelectors() {
  if (!weekSelect || !daySelect) return;
  const entries = getRoutineEntries();
  const currentValue = routineSelect?.value || buildRoutineValue(weekSelect.value, daySelect.value);

  if (routineSelect) {
    routineSelect.innerHTML = "";
    entries.forEach(entry => {
      const opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = entry.label;
      routineSelect.appendChild(opt);
    });
  }

  const selectedValue = entries.some(entry => entry.value === currentValue)
    ? currentValue
    : entries[0]?.value || "";

  if (selectedValue) {
    const selected = parseRoutineValue(selectedValue);
    weekSelect.value = selected.week;
    populateDaySelect(selected.week);
    daySelect.value = selected.day;
    if (routineSelect) routineSelect.value = selectedValue;
  } else {
    weekSelect.innerHTML = "";
    daySelect.innerHTML = "";
    if (routineSelect) routineSelect.innerHTML = "";
  }
}

function refreshRoutineSelectLabels() {
  if (routineSelect) {
    const currentValue = routineSelect.value;
    const entries = getRoutineEntries();
    routineSelect.innerHTML = "";
    entries.forEach(entry => {
      const opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = entry.label;
      routineSelect.appendChild(opt);
    });
    if (entries.some(entry => entry.value === currentValue)) {
      routineSelect.value = currentValue;
    }
    syncRoutineSelectFromWeekDay();
    return;
  }
  if (weekSelect) {
    Array.from(weekSelect.options).forEach(opt => {
      opt.textContent = translateRoutineLabel(opt.value);
    });
  }
  if (daySelect) {
    Array.from(daySelect.options).forEach(opt => {
      opt.textContent = translateRoutineLabel(opt.value);
    });
  }
}

function populateHistoryDaySelect() {
  if (!historyDaySelect) return;
  const sessions = (window.uploadedHistory || [])
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  historyDaySelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = sessions.length ? t("status.selectDay") : t("status.noHistorySessions");
  historyDaySelect.appendChild(placeholder);
  if (!sessions.length) {
    historyDaySelect.disabled = true;
    if (loadPreviousSessionBtn) loadPreviousSessionBtn.disabled = true;
    return;
  }
  sessions.forEach(session => {
    const opt = document.createElement("option");
    opt.value = session.key || buildSessionKey(session) || "";
    const dayLabel = session.day ? translateRoutineLabel(session.day) : "-";
    const dateLabel = session.date || "-";
    opt.textContent = `${dateLabel} · ${dayLabel}`;
    historyDaySelect.appendChild(opt);
  });
  historyDaySelect.disabled = false;
  if (loadPreviousSessionBtn) loadPreviousSessionBtn.disabled = false;
}

function getHistorySessionByKey(sessionKey) {
  if (!sessionKey) return null;
  return (window.uploadedHistory || []).find(session => {
    const key = session.key || buildSessionKey(session) || "";
    return key === sessionKey;
  }) || null;
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE DOLOR (SOLO EJERCICIOS DE HOY + "No identificado")
// -------------------------

