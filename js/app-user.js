
const logoutUserBtn = document.getElementById("logout-user-btn");

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
    t("csv.usuario"),
    t("csv.fecha"),
    t("csv.semana"),
    t("csv.dia"),
    t("csv.ejercicio"),
    t("csv.calentamiento"),
    t("csv.musculo"),
    t("csv.seccion"),
    t("csv.serie"),
    t("csv.peso"),
    t("csv.reps"),
    t("csv.fallo"),
    t("csv.reps_fallo"),
    t("csv.intensidad"),
    t("csv.tiempo"),
    t("csv.notas"),
    t("csv.sens_general"),
    t("csv.sens_tiredness"),
    t("csv.sens_weight"),
    t("csv.sens_pain"),
    t("csv.sens_pain_zone"),
    t("csv.sens_pain_exercise"),
    t("csv.sens_comment")
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
      sens_pain_exercise: sensations.painExercise ?? "",
      sens_comment: sensations.comment ?? ""
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
        "",
        base.sens_general,
        base.sens_tiredness,
        base.sens_weight,
        base.sens_pain,
        base.sens_pain_zone,
        base.sens_pain_exercise,
        base.sens_comment
      ];
      rows.push(row.map(escapeCsvCell).join(","));
      return;
    }

    exercises.forEach(ex => {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      const exerciseNote = (ex.notes ?? Array.from(new Set((ex.sets || []).map(s => (s.obs ?? "").trim()).filter(Boolean))).join(" / ")).trim();
      if (!sets.length) {
        const row = [
          base.usuario,
          base.fecha,
          base.semana,
          base.dia,
          ex.nombre || "",
          isWarmupExercise(ex) ? t("option.yes") : t("option.no"),
          ex.musculo || "",
          ex.seccion || "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          exerciseNote,
          base.sens_general,
          base.sens_tiredness,
          base.sens_weight,
          base.sens_pain,
          base.sens_pain_zone,
          base.sens_pain_exercise,
          base.sens_comment
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
          isWarmupExercise(ex) ? t("option.yes") : t("option.no"),
          ex.musculo || "",
          ex.seccion || "",
          set.serie ?? "",
          set.peso ?? "",
          set.reps ?? "",
          set.fallo === true ? t("option.yes") : set.fallo === false ? t("option.no") : "",
          set.repsFallo ?? "",
          set.intensidad ?? "",
          set.tiempo ?? "",
          exerciseNote,
          base.sens_general,
          base.sens_tiredness,
          base.sens_weight,
          base.sens_pain,
          base.sens_pain_zone,
          base.sens_pain_exercise,
          base.sens_comment
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
      alert(t("alert.selectUserExport"));
      return;
    }
    const userList = loadUserList();
    const entry = userList.find(u => u.key === selectedKey);
    const data = getExportHistoryForUser(selectedKey);
    if (!data.length) {
      setUserHistoryStatus(t("status.noUserDataExport"));
      return;
    }
    const csv = buildCsvForUser(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = entry?.name ? normalizeUserName(entry.name) : selectedKey;
    a.download = `${t("file.historyPrefix")}_${safeName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setUserHistoryStatus(t("status.userExportedCsv"));
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
  openOverlay(importOverlay, { initialFocus: importUserSelect });
}

function closeImportOverlay() {
  if (!importOverlay) return;
  closeOverlay(importOverlay);
}

function openManageUserOverlay() {
  if (!manageUserOverlay) return;
  if (manageUserNameLabel) {
    manageUserNameLabel.textContent = currentUserName || t("status.selectUser");
  }
  renderUserStatsCharts();
  openOverlay(manageUserOverlay, { initialFocus: manageUserHistoryBtn || manageUserClose });
}

function closeManageUserOverlay() {
  if (!manageUserOverlay) return;
  closeOverlay(manageUserOverlay);
}

function openFavoritesOverlay() {
  if (!favoritesOverlay) return;
  renderFavoritesList();
  openOverlay(favoritesOverlay, { initialFocus: favoritesGroupSelect || favoritesClose });
}

function closeFavoritesOverlay() {
  if (!favoritesOverlay) return;
  closeOverlay(favoritesOverlay);
}

let globalUserStatsChartInstance = null;
let globalUserStatsPieInstance = null;

function renderUserStatsChart(targetCanvas, noDataLabel, instanceRefSetter, instanceRefGetter, options = {}) {
  if (!targetCanvas || typeof Chart === "undefined") return;
  const limit = Number.isInteger(options.limit) ? options.limit : null;
  const sessions = getHistorySessionsForCharts();
  let rows = (sessions || [])
    .filter(session => Array.isArray(session.exercises) && session.exercises.length)
    .slice()
    .sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
  if (limit && rows.length > limit) {
    rows = rows.slice(-limit);
  }

  if (!rows.length) {
    setVisible(noDataLabel, true);
    const currentInstance = instanceRefGetter();
    if (currentInstance) currentInstance.destroy();
    instanceRefSetter(null);
    return;
  }

  const labels = rows.map((session, index) => {
    const date = session.date || "";
    if (!date) return `${t("chart.axis.sessions")} ${index + 1}`;
    const dateObj = new Date(date);
    return isNaN(dateObj)
      ? date
      : dateObj.toLocaleDateString(getLocale(), { day: "2-digit", month: "2-digit" });
  });

  const groupSet = new Set();
  const perSession = rows.map(session => {
    const counts = new Map();
    session.exercises.forEach(ex => {
      if (isWarmupExercise(ex)) return;
      const name = ex?.nombre || "";
      const tpl = exerciseTemplates[name] || {};
      const rawGroup = resolveExerciseGroup(tpl || { musculo: ex?.musculo });
      const muscle = (rawGroup || t("chart.muscle.unknown")).trim() || t("chart.muscle.unknown");
      const setsCount = Array.isArray(ex.sets) ? ex.sets.length : 0;
      if (setsCount <= 0) return;
      groupSet.add(muscle);
      counts.set(muscle, (counts.get(muscle) || 0) + setsCount);
    });
    return counts;
  });

  const groups = Array.from(groupSet).sort((a, b) => a.localeCompare(b, getLocale()));
  if (!groups.length) {
    setVisible(noDataLabel, true);
    const currentInstance = instanceRefGetter();
    if (currentInstance) currentInstance.destroy();
    instanceRefSetter(null);
    return;
  }

  const palette = [
    "#f97316",
    "#22c55e",
    "#38bdf8",
    "#a855f7",
    "#facc15",
    "#ef4444",
    "#14b8a6",
    "#e11d48",
    "#84cc16",
    "#0ea5e9"
  ];

  const datasets = groups.map((group, idx) => ({
    label: group,
    data: perSession.map(map => map.get(group) || 0),
    backgroundColor: palette[idx % palette.length],
    stack: "sets"
  }));

  setVisible(noDataLabel, false);
  const existing = instanceRefGetter();
  if (existing) existing.destroy();
  const instance = new Chart(targetCanvas, {
    type: "bar",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        x: {
          stacked: true,
          title: { display: true, text: t("chart.axis.sessions"), font: { size: 14 } }
        },
        y: {
          stacked: true,
          beginAtZero: true,
          title: { display: true, text: t("chart.axis.sets"), font: { size: 14 } }
        }
      }
    }
  });
  instanceRefSetter(instance);
}

function renderUserStatsCharts() {
  renderUserStatsChart(
    globalUserStatsChartCanvas,
    globalUserStatsNoData,
    (val) => { globalUserStatsChartInstance = val; },
    () => globalUserStatsChartInstance,
    { limit: 10 }
  );

  renderUserStatsPieChart();
}

function renderUserStatsPieChart() {
  if (!globalUserStatsPieCanvas || typeof Chart === "undefined") return;
  const sessions = getHistorySessionsForCharts();
  const rows = (sessions || [])
    .filter(session => Array.isArray(session.exercises) && session.exercises.length);

  const totals = new Map();
  rows.forEach(session => {
    session.exercises.forEach(ex => {
      if (isWarmupExercise(ex)) return;
      const name = ex?.nombre || "";
      const tpl = exerciseTemplates[name] || {};
      const rawGroup = resolveExerciseGroup(tpl || { musculo: ex?.musculo });
      const muscle = (rawGroup || t("chart.muscle.unknown")).trim() || t("chart.muscle.unknown");
      const setsCount = Array.isArray(ex.sets) ? ex.sets.length : 0;
      if (setsCount <= 0) return;
      totals.set(muscle, (totals.get(muscle) || 0) + setsCount);
    });
  });

  const labels = Array.from(totals.keys()).sort((a, b) => a.localeCompare(b, getLocale()));
  const values = labels.map(label => totals.get(label) || 0);
  const totalSum = values.reduce((acc, val) => acc + val, 0);

  if (!labels.length || totalSum === 0) {
    setVisible(globalUserStatsPieNoData, true);
    if (globalUserStatsPieLegend) globalUserStatsPieLegend.innerHTML = "";
    if (globalUserStatsPieInstance) globalUserStatsPieInstance.destroy();
    globalUserStatsPieInstance = null;
    return;
  }
  setVisible(globalUserStatsPieNoData, false);

  const palette = [
    "#f97316",
    "#22c55e",
    "#38bdf8",
    "#a855f7",
    "#facc15",
    "#ef4444",
    "#14b8a6",
    "#e11d48",
    "#84cc16",
    "#0ea5e9"
  ];

  if (globalUserStatsPieInstance) globalUserStatsPieInstance.destroy();
  globalUserStatsPieInstance = new Chart(globalUserStatsPieCanvas, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, idx) => palette[idx % palette.length])
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed || 0;
              const pct = totalSum ? Math.round((value / totalSum) * 1000) / 10 : 0;
              return `${ctx.label}: ${value} (${pct}%)`;
            }
          }
        }
      }
    }
  });

  if (globalUserStatsPieLegend) {
    const iconMap = {
      "Pecho": "🫁",
      "Espalda": "🧍",
      "Hombros": "🤷",
      "Brazos": "💪",
      "Piernas": "🦵",
      "Core": "🧱",
      "Cardio": "❤️",
      "Otros": "🔹"
    };
    globalUserStatsPieLegend.innerHTML = "";
    labels.forEach((label, idx) => {
      const item = document.createElement("div");
      item.className = "pie-icon-item";
      const dot = document.createElement("span");
      dot.className = "pie-icon-dot";
      dot.style.background = palette[idx % palette.length];
      const icon = document.createElement("span");
      icon.textContent = iconMap[label] || "🔸";
      const text = document.createElement("span");
      const value = values[idx] || 0;
      const pct = totalSum ? Math.round((value / totalSum) * 1000) / 10 : 0;
      text.textContent = `${label} ${pct}%`;
      item.appendChild(dot);
      item.appendChild(icon);
      item.appendChild(text);
      globalUserStatsPieLegend.appendChild(item);
    });
  }
}

function renderFavoritesList() {
  if (!favoritesList) return;
  favoritesList.innerHTML = "";
  if (!currentUserKey) {
    const hint = document.createElement("div");
    hint.className = "hint-text";
    hint.textContent = t("status.selectUser");
    favoritesList.appendChild(hint);
    return;
  }
  const favorites = new Set(loadFavorites());
  const allNames = Object.keys(exerciseTemplates || {}).sort((a, b) => a.localeCompare(b, getLocale()));
  if (!allNames.length) {
    const hint = document.createElement("div");
    hint.className = "hint-text";
    hint.textContent = t("exercise.empty");
    favoritesList.appendChild(hint);
    return;
  }

  if (favoritesGroupSelect) {
    const currentValue = favoritesGroupSelect.value || "";
    favoritesGroupSelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t("placeholder.selectGroup");
    favoritesGroupSelect.appendChild(placeholder);
    const groups = Array.from(new Set(
      allNames
        .map(name => resolveExerciseGroup(exerciseTemplates[name]))
        .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, getLocale()));
    groups.forEach(group => {
      const opt = document.createElement("option");
      opt.value = group;
      opt.textContent = group;
      favoritesGroupSelect.appendChild(opt);
    });
    const nextValue = currentValue && groups.includes(currentValue) ? currentValue : "";
    favoritesGroupSelect.value = nextValue;
  }

  const selectedGroup = favoritesGroupSelect?.value || "";
  if (!selectedGroup) {
    const hint = document.createElement("div");
    hint.className = "hint-text";
    hint.textContent = t("placeholder.selectGroup");
    favoritesList.appendChild(hint);
    return;
  }

  const groupNames = allNames.filter(name => {
    const tpl = exerciseTemplates[name];
    return resolveExerciseGroup(tpl) === selectedGroup;
  });
  if (!groupNames.length) {
    const hint = document.createElement("div");
    hint.className = "hint-text";
    hint.textContent = t("favorites.emptyOption");
    favoritesList.appendChild(hint);
    return;
  }

  const fragment = document.createDocumentFragment();
  groupNames.forEach(name => {
    const label = document.createElement("label");
    label.className = "favorite-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = favorites.has(name);
    checkbox.addEventListener("change", () => {
      const updated = new Set(loadFavorites());
      if (checkbox.checked) {
        updated.add(name);
      } else {
        updated.delete(name);
      }
      saveFavorites(Array.from(updated));
      if (quickAddGroupSelect) {
        populateQuickAddExercises(quickAddGroupSelect.value);
      }
    });
    const text = document.createElement("span");
    text.textContent = name;
    label.appendChild(checkbox);
    label.appendChild(text);
    fragment.appendChild(label);
  });
  favoritesList.appendChild(fragment);
}

function openHistoryMenuOverlay() {
  if (!historyMenuOverlay) return;
  refreshHistoryUI();
  if (historyDateInput) historyDateInput.value = "";
  updateHistoryButtons();
  const firstSession = historyDateList?.querySelector(".history-date-item");
  openOverlay(historyMenuOverlay, { initialFocus: firstSession || historyMenuClose });
}

function closeHistoryMenuOverlay() {
  if (!historyMenuOverlay) return;
  closeOverlay(historyMenuOverlay);
}

function getCurrentUserSessionsForBodyWeightEdit() {
  const localSessions = getLocalHistory();
  if (localSessions.length) return localSessions;
  return collectSessionsFromSessionKeys(currentUserKey);
}

function getLatestBodyWeightSession(sessions) {
  return sessions
    .filter(session => session?.date)
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0] || null;
}

async function editUserBodyWeight() {
  if (!currentUserKey) {
    alert(t("alert.selectValidUser"));
    return;
  }

  const sessions = getCurrentUserSessionsForBodyWeightEdit();
  if (!sessions.length) {
    setUserHistoryStatus("No hay sesiones guardadas para modificar.");
    return;
  }

  const latest = getLatestBodyWeightSession(sessions);
  const defaultDate = latest?.date || dateInput?.value || "";
  const dateStr = await promptForText("Fecha de la sesión (AAAA-MM-DD)", defaultDate);
  if (!dateStr) return;

  const matchingSessions = sessions.filter(session => session?.date === dateStr);
  if (!matchingSessions.length) {
    alert("No hay sesiones guardadas para esa fecha.");
    return;
  }

  const currentWeight = matchingSessions.find(session => session?.sensations?.weight)?.sensations?.weight ?? "";
  const weightText = await promptForText("Peso corporal (kg)", String(currentWeight ?? ""));
  if (!weightText) return;

  const parsedWeight = parseFloat(String(weightText).replace(",", "."));
  if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
    alert("Introduce un peso corporal válido.");
    return;
  }

  const updatedSessions = sessions.map(session => {
    if (session?.date !== dateStr) return session;
    return {
      ...session,
      sensations: {
        ...(session.sensations || {}),
        weight: String(parsedWeight)
      }
    };
  });

  setLocalHistory(updatedSessions);
  window.uploadedHistory = updatedSessions;
  rebuildHistoryData(updatedSessions);
  refreshHistoryUI();
  refreshCharts();
  renderUserStatsCharts();

  if (dateInput?.value === dateStr && senseWeightInput) {
    senseWeightInput.value = String(parsedWeight);
    if (typeof persistSessionSafely === "function") persistSessionSafely();
  }

  setUserHistoryStatus(`Peso corporal actualizado para ${dateStr}: ${parsedWeight} kg.`);
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

if (manageUserBodyWeightBtn) {
  manageUserBodyWeightBtn.addEventListener("click", () => {
    closeManageUserOverlay();
    editUserBodyWeight();
  });
}

if (manageUserChartsBtn) {
  manageUserChartsBtn.addEventListener("click", () => {
    closeManageUserOverlay();
    const step8Index = stepPages.indexOf(step8);
    if (step8Index >= 0) {
      allowGlobalChartsStep = true;
      setActiveStep(step8Index, { force: true });
      if (typeof window.loadChartExercises === "function") {
        window.loadChartExercises();
      }
      renderUserStatsCharts();
    }
  });
}

if (manageUserMuscleChartsBtn) {
  manageUserMuscleChartsBtn.addEventListener("click", () => {
    closeManageUserOverlay();
    const step9Index = stepPages.indexOf(step9);
    if (step9Index >= 0) {
      allowGlobalChartsStep = true;
      setActiveStep(step9Index, { force: true });
      renderUserStatsCharts();
    }
  });
}

if (manageUserFavoritesBtn) {
  manageUserFavoritesBtn.addEventListener("click", () => {
    closeManageUserOverlay();
    openFavoritesOverlay();
  });
}

if (logoutUserBtn) {
  logoutUserBtn.addEventListener("click", () => {
    currentUserKey = "";
    currentUserName = "";
    appState.currentUserKey = "";
    appState.currentUserName = "";
    sessionSaveKind = "none";
    lastAutoSaveTime = null;
    sessionIsDirty = false;
    storage.removeItem("gym_user_name");
    updateCurrentUserBadge();
    setAppEnabled(false);
    setAppVisible(false);
    updateAutoSaveLabel();
    refreshUserSelect();
    if (userHistorySelect) {
      userHistorySelect.value = "";
      userHistorySelect.selectedIndex = 0;
    }
    closeManageUserOverlay();
    closeHistoryMenuOverlay();
    closeFavoritesOverlay();
    closeImportOverlay();
  });
}
if (favoritesGroupSelect) {
  favoritesGroupSelect.addEventListener("change", () => {
    renderFavoritesList();
  });
}

if (historyMenuClose) {
  historyMenuClose.addEventListener("click", closeHistoryMenuOverlay);
}

if (favoritesClose) {
  favoritesClose.addEventListener("click", closeFavoritesOverlay);
}

if (historyMenuOverlay) {
  historyMenuOverlay.addEventListener("click", (e) => {
    if (e.target === historyMenuOverlay) closeHistoryMenuOverlay();
  });
}

if (favoritesOverlay) {
  favoritesOverlay.addEventListener("click", (e) => {
    if (e.target === favoritesOverlay) closeFavoritesOverlay();
  });
}

if (historyDateInput) {
  historyDateInput.addEventListener("change", () => {
    updateHistoryButtons();
  });
  historyDateInput.addEventListener("input", () => {
    updateHistoryButtons();
  });
}

if (historyViewBtn) {
  historyViewBtn.addEventListener("click", () => {
    const session = getSelectedHistorySession();
    if (!session) return;
    if (!editingSessionContext) {
      editingSessionContext = {
        date: dateInput?.value || "",
        week: weekSelect?.value || "",
        day: daySelect?.value || "",
        restoreOnExit: false
      };
    }
    if (editExercisesContainer) {
      exercisesContainer = editExercisesContainer;
      showAllExercises = true;
      editExercisesContainer.innerHTML = "";
    }
    isEditingHistory = true;
    appState.isEditingHistory = isEditingHistory;
    setHistoryEditorMode(false);
    applyHistorySession(session, { silent: true, preserveAutoSave: true });
    const step7Index = stepPages.indexOf(step7);
    if (step7Index >= 0) setActiveStep(step7Index);
    setHistoryEditorMode(false);
    closeHistoryMenuOverlay();
    closeManageUserOverlay();
  });
}

if (historyDeleteSessionBtn) {
  historyDeleteSessionBtn.addEventListener("click", () => {
    deleteSelectedHistorySession();
  });
}

if (unlockHistoryEditBtn) {
  unlockHistoryEditBtn.addEventListener("click", () => {
    setHistoryEditorMode(!historyEditUnlocked);
  });
}

if (overwriteHistoryBtn) {
  overwriteHistoryBtn.addEventListener("click", () => {
    overwriteEditedSession();
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
        const data = normalizeImportedHistoryPayload(JSON.parse(event.target.result));
        const firstUser = Array.isArray(data) && data.length ? (data[0]?.user || "") : "";
        const trimmedName = String(firstUser || "").trim();
        const normalizedKey = normalizeUserName(trimmedName);
        let userList = loadUserList();
        let entry = normalizedKey
          ? userList.find(u => u.key === normalizedKey || u.name.toLowerCase() === trimmedName.toLowerCase())
          : null;

        if (!entry) {
          if (!trimmedName) {
            alert(t("alert.noUserInImport"));
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
        setUserHistoryStatus(t("status.importMerged"));
      } catch (err) {
        setUserHistoryStatus(t("status.importError", { error: err.message }));
      }
    };
    reader.readAsText(file);
  });
}
