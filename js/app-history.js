let historyData = {}; // {exerciseName: [weights]}
let historySessionsCache = null;
let historySessionsCacheUserKey = "";
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

function invalidateHistorySessionsCache() {
  historySessionsCache = null;
  historySessionsCacheUserKey = "";
}

window.invalidateGymHistoryCache = invalidateHistorySessionsCache;

function isUsableHistorySession(session) {
  if (!session || typeof session !== "object") return false;
  const exercises = getExercisesArrayFromSession(session);
  return Boolean(session.date || exercises.length);
}

function getLocalHistory() {
  const parsed = readStorageJSON(getHistoryStorageKey(), []);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(session => {
    if (!isUsableHistorySession(session)) return false;
    return !session.user || !currentUserName || session.user === currentUserName;
  });
}

function getLegacyHistoryForCurrentUser() {
  const parsed = readStorageJSON(LOCAL_HISTORY_KEY, []);
  if (!Array.isArray(parsed) || !currentUserName) return [];
  return parsed.filter(session => isUsableHistorySession(session) && session.user === currentUserName);
}

function getHistorySessionsForCharts() {
  if (!currentUserKey) return [];
  if (historySessionsCache && historySessionsCacheUserKey === currentUserKey) {
    return historySessionsCache.slice();
  }
  const sources = [];
  const stored = getLocalHistory();
  if (stored.length) sources.push(stored);
  const fromKeys = collectSessionsFromSessionKeys(currentUserKey);
  if (fromKeys.length) sources.push(fromKeys);
  const legacy = getLegacyHistoryForCurrentUser();
  if (legacy.length) sources.push(legacy);
  const merged = new Map();
  sources.flat().forEach(session => {
    if (!session || typeof session !== "object") return;
    const key = session.key
      || buildSessionKey(session)
      || `${session.date || ""}|${session.week || ""}|${session.day || ""}|${session.user || ""}`;
    if (!merged.has(key)) merged.set(key, session);
  });
  historySessionsCache = Array.from(merged.values());
  historySessionsCacheUserKey = currentUserKey;
  return historySessionsCache.slice();
}

window.getGymHistorySessions = () => getHistorySessionsForCharts();

function getExerciseNameFromEntry(entry) {
  if (!entry || typeof entry !== "object") return "";
  return entry.nombre || entry.name || entry.exercise || entry.ejercicio || "";
}

function getExercisesArrayFromSession(session) {
  if (!session || typeof session !== "object") return [];
  if (Array.isArray(session.exercises)) return session.exercises;
  if (Array.isArray(session.ejercicios)) return session.ejercicios;
  if (Array.isArray(session.data?.exercises)) return session.data.exercises;
  if (Array.isArray(session.data?.ejercicios)) return session.data.ejercicios;
  if (Array.isArray(session.session?.exercises)) return session.session.exercises;
  if (Array.isArray(session.session?.ejercicios)) return session.session.ejercicios;
  return [];
}

function getGymHistoryExerciseNames() {
  const sessions = getHistorySessionsForCharts();
  const names = new Set();
  const collectFromSession = (session) => {
    getExercisesArrayFromSession(session).forEach(entry => {
      if (isWarmupExercise(entry)) return;
      const name = getExerciseNameFromEntry(entry);
      if (name) names.add(name);
    });
  };
  sessions.forEach(collectFromSession);
  return Array.from(names);
}

window.getGymHistoryExerciseNames = getGymHistoryExerciseNames;

function getLocalHistoryForUser(userKey) {
  const parsed = readStorageJSON(getHistoryStorageKeyForUser(userKey), []);
  return Array.isArray(parsed) ? parsed.filter(isUsableHistorySession) : [];
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

function stripExerciseTechnicalNotes(exercise) {
  if (!exercise || typeof exercise !== "object") return exercise;
  const { hacer, noHacer, trucos, ...cleanExercise } = exercise;
  return cleanExercise;
}

function stripSessionTechnicalNotes(session) {
  if (!session || typeof session !== "object") return session;
  const cleanSession = { ...session };
  if (Array.isArray(cleanSession.exercises)) {
    cleanSession.exercises = cleanSession.exercises.map(stripExerciseTechnicalNotes);
  }
  if (Array.isArray(cleanSession.ejercicios)) {
    cleanSession.ejercicios = cleanSession.ejercicios.map(stripExerciseTechnicalNotes);
  }
  if (Array.isArray(cleanSession.revisions)) {
    cleanSession.revisions = cleanSession.revisions.map(stripSessionTechnicalNotes);
  }
  if (cleanSession.data && typeof cleanSession.data === "object") {
    cleanSession.data = stripSessionTechnicalNotes(cleanSession.data);
  }
  if (cleanSession.session && typeof cleanSession.session === "object") {
    cleanSession.session = stripSessionTechnicalNotes(cleanSession.session);
  }
  return cleanSession;
}

function setLocalHistory(sessions) {
  invalidateHistorySessionsCache();
  writeStorageJSON(getHistoryStorageKey(), sessions.map(stripSessionTechnicalNotes));
}

function setLocalHistoryForUser(userKey, sessions) {
  invalidateHistorySessionsCache();
  writeStorageJSON(getHistoryStorageKeyForUser(userKey), sessions.map(stripSessionTechnicalNotes));
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
    const parsed = readStorageJSON(key, null);
    if (!parsed || typeof parsed !== "object") continue;
    if (!parsed.date) continue;
    sessions.push({
      ...parsed,
      key,
      user: parsed.user || currentUserName
    });
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
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}

function rebuildHistoryData(sessions) {
  historyData = {};
  sessions.forEach(session => {
    if (session.exercises) {
      session.exercises.forEach(ex => {
        if (isWarmupExercise(ex)) return;
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
  populateHistoryDaySelect();
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
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

function normalizeImportedHistoryPayload(payload) {
  const toFiniteNumberOrNull = value => {
    if (value == null || value === "") return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };
  const rawSessions = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.sessions)
      ? payload.sessions
      : Array.isArray(payload?.history)
        ? payload.history
        : null;

  if (!rawSessions) {
    throw new Error("El JSON debe ser una lista de sesiones o contener sessions/history.");
  }

  const normalized = rawSessions
    .filter(session => session && typeof session === "object")
    .map(session => {
      const date = String(session.date || "").trim();
      const exercises = Array.isArray(session.exercises) ? session.exercises : [];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

      const cleanExercises = exercises
        .filter(ex => ex && typeof ex === "object")
        .map(ex => ({
          nombre: String(ex.nombre || ex.name || "").trim(),
          musculo: String(ex.musculo || "").trim(),
          seccion: String(ex.seccion || "").trim(),
          calentamiento: isWarmupExercise(ex),
          sets: Array.isArray(ex.sets)
            ? ex.sets
                .filter(set => set && typeof set === "object")
                .map(set => ({
                  serie: toFiniteNumberOrNull(set.serie),
                  peso: toFiniteNumberOrNull(set.peso),
                  reps: toFiniteNumberOrNull(set.reps),
                  rir: toFiniteNumberOrNull(set.rir),
                  fallo: set.fallo === true,
                  repsFallo: toFiniteNumberOrNull(set.repsFallo),
                  intensidad: toFiniteNumberOrNull(set.intensidad),
                  tiempo: toFiniteNumberOrNull(set.tiempo)
                }))
            : [],
          notes: String(ex.notes || "").trim()
        }))
        .filter(ex => ex.nombre);

      return stripSessionTechnicalNotes({
        ...session,
        date,
        user: String(session.user || "").trim(),
        week: String(session.week || "").trim(),
        day: String(session.day || "").trim(),
        exercises: cleanExercises,
        sensations: session.sensations && typeof session.sensations === "object"
          ? {
              general: String(session.sensations.general ?? ""),
              tiredness: String(session.sensations.tiredness ?? ""),
              weight: String(session.sensations.weight ?? ""),
              pain: session.sensations.pain === "si" ? "si" : "no",
              painZone: String(session.sensations.painZone ?? ""),
              painExercise: String(session.sensations.painExercise ?? ""),
              comment: String(session.sensations.comment ?? "")
            }
          : {}
      });
    })
    .filter(Boolean);

  if (!normalized.length) {
    throw new Error("No se ha encontrado ninguna sesión válida en el archivo.");
  }

  return normalized;
}

function mergeImportedHistory(imported) {
  if (!Array.isArray(imported)) return;
  const cleanImported = normalizeImportedHistoryPayload(imported);
  const sessions = getLocalHistory();
  const byKey = new Map();
  sessions.forEach(item => {
    const key = item.key || buildSessionKey(item);
    if (key) byKey.set(key, { ...item, key, user: item.user || currentUserName });
  });
  cleanImported.forEach(item => {
    if (!item || typeof item !== "object") return;
    const key = item.key || buildSessionKey(item);
    if (!key) return;
    byKey.set(key, { ...item, key, user: item.user || currentUserName });
  });
  const merged = Array.from(byKey.values()).map(stripSessionTechnicalNotes);
  setLocalHistory(merged);
  window.uploadedHistory = merged;
  rebuildHistoryData(merged);
  refreshCharts();
}

function mergeImportedHistoryForUser(imported, userName, userKey) {
  if (!Array.isArray(imported)) return;
  const cleanImported = normalizeImportedHistoryPayload(imported);
  const sessions = getLocalHistoryForUser(userKey);
  const byKey = new Map();
  sessions.forEach(item => {
    const key = item.key || buildSessionKeyForUser(item, userKey);
    if (key) byKey.set(key, { ...item, key, user: item.user || userName });
  });
  cleanImported.forEach(item => {
    if (!item || typeof item !== "object") return;
    const key = item.key || buildSessionKeyForUser(item, userKey);
    if (!key) return;
    byKey.set(key, { ...item, key, user: item.user || userName });
  });
  const merged = Array.from(byKey.values()).map(stripSessionTechnicalNotes);
  setLocalHistoryForUser(userKey, merged);
  refreshCharts();
  refreshHistoryUI();
}

function getExportHistoryForUser(userKey) {
  const sessions = getLocalHistoryForUser(userKey);
  const base = sessions.length ? sessions : collectSessionsFromSessionKeys(userKey);
  return base.map(session => stripSessionTechnicalNotes({
    ...session,
    user: session.user || currentUserName,
    key: session.key || buildSessionKeyForUser(session, userKey)
  }));
}

function getMaxWeight(exerciseName) {
  if (!historyData[exerciseName] || historyData[exerciseName].length === 0) return null;
  return Math.max(...historyData[exerciseName]);
}

function getExerciseWeightsFromHistory(exerciseName) {
  const sessions = Array.isArray(window.uploadedHistory) ? window.uploadedHistory : [];
  const weights = [];
  sessions.forEach(session => {
    const ex = session?.exercises?.find(e => e.nombre === exerciseName && !isWarmupExercise(e));
    if (!ex?.sets?.length) return;
    ex.sets.forEach(set => {
      const peso = parseFloat(set?.peso);
      if (Number.isFinite(peso) && peso > 0) weights.push(peso);
    });
  });
  return weights;
}

function getMedian(values) {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getRobustMaxWeight(exerciseName) {
  const weights = getExerciseWeightsFromHistory(exerciseName);
  if (weights.length === 0) return null;
  const median = getMedian(weights);
  if (!Number.isFinite(median) || median <= 0) return Math.max(...weights);
  const cutoff = median * 2.5;
  const filtered = weights.filter(w => w <= cutoff);
  return filtered.length ? Math.max(...filtered) : Math.max(...weights);
}

function getLastExerciseSession(exerciseName) {
  const sessions = window.uploadedHistory || [];
  let lastSession = null;
  let lastDate = null;

  sessions.forEach(session => {
    if (!session?.exercises?.length) return;
    const hasExercise = session.exercises.some(ex => ex.nombre === exerciseName && !isWarmupExercise(ex));
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

function isValidStrengthSet(exerciseName, set) {
  const peso = parseFloat(set?.peso);
  const reps = parseFloat(set?.reps);
  if (!Number.isFinite(peso) || !Number.isFinite(reps)) return false;
  if (reps < 1 || reps > 20) return false;
  const maxHist = getRobustMaxWeight(exerciseName);
  if (Number.isFinite(maxHist) && maxHist > 0 && peso > maxHist * 2.5) return false;
  return true;
}

function getLastExerciseSet(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName && !isWarmupExercise(e));
  if (!ex?.sets?.length) return null;

  const hasTenPlus = ex.sets.some(set => {
    const repsValue = parseFloat(set?.reps);
    return isValidStrengthSet(exerciseName, set) && Number.isFinite(repsValue) && repsValue >= 10;
  });

  for (let i = ex.sets.length - 1; i >= 0; i -= 1) {
    const set = ex.sets[i];
    if (!isValidStrengthSet(exerciseName, set)) continue;
    return { peso: set.peso ?? null, reps: set.reps ?? null, hasTenPlus };
  }
  return null;
}

function getLastCardioSet(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName && !isWarmupExercise(e));
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
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName && !isWarmupExercise(e));
  if (!ex?.sets?.length) return null;
  const weights = ex.sets
    .map(s => parseFloat(s.peso))
    .filter(v => !Number.isNaN(v) && v > 0);
  if (weights.length === 0) return null;
  return Math.max(...weights);
}

function formatRelativeExerciseDate(dateValue) {
  if (!dateValue) return "";
  const dateParts = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = dateParts
    ? new Date(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]))
    : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const dayDifference = Math.round((date.getTime() - today.getTime()) / 86400000);
  return new Intl.RelativeTimeFormat(getLocale(), { numeric: "auto" }).format(dayDifference, "day");
}

function getLastExerciseReference(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const exercise = lastSession.exercises.find(
    entry => entry.nombre === exerciseName && !isWarmupExercise(entry)
  );
  if (!exercise?.sets?.length) return null;

  const isCardio = String(exercise.musculo || "").toLowerCase() === "cardio";
  const sets = isCardio
    ? exercise.sets.filter(set => {
        const intensity = set.intensidad ?? set.peso ?? "";
        const time = set.tiempo ?? set.reps ?? "";
        return intensity !== "" || time !== "";
      })
    : exercise.sets.filter(set => isValidStrengthSet(exerciseName, set));

  if (!sets.length) return null;
  return {
    date: formatRelativeExerciseDate(lastSession.date),
    isCardio,
    sets
  };
}
