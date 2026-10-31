/* SPDX-License-Identifier: GPL-3.0-or-later · Copyright (C) 2026 Borja Aguado */

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
    t("csv.rir"),
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
          set.rir ?? "",
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

function openManageUserOverlay() {
  if (!manageUserOverlay) return;
  if (manageUserNameLabel) {
    manageUserNameLabel.textContent = currentUserName || t("status.selectUser");
  }
  renderUserStatsCharts();
  openOverlay(manageUserOverlay, { initialFocus: manageUserFavoritesBtn || manageUserClose });
}

function closeManageUserOverlay() {
  if (!manageUserOverlay) return;
  closeOverlay(manageUserOverlay);
}

function openFavoritesOverlay() {
  if (!favoritesOverlay) return;
  renderFavoritesList();
  const firstGroup = favoritesGroupSelect?.querySelector(".favorites-group-btn");
  openOverlay(favoritesOverlay, { initialFocus: firstGroup || favoritesClose });
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

  const colors = labels.map(label => getMuscleGroupStyle(label).color);
  const isDark = document.documentElement.classList.contains("dark");
  // Total de series en el centro del anillo
  const centerTotal = {
    id: "centerTotal",
    afterDraw(chart) {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      const x = (chartArea.left + chartArea.right) / 2;
      const y = (chartArea.top + chartArea.bottom) / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.fillStyle = isDark ? "#f8fafc" : "#111827";
      ctx.font = "800 26px system-ui, sans-serif";
      ctx.fillText(String(totalSum), x, y + 4);
      ctx.fillStyle = isDark ? "#9ca3af" : "#6b7280";
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.fillText("series", x, y + 22);
      ctx.restore();
    }
  };

  if (globalUserStatsPieInstance) globalUserStatsPieInstance.destroy();
  globalUserStatsPieInstance = new Chart(globalUserStatsPieCanvas, {
    type: "doughnut",
    data: {
      labels: labels.map(label => translateGroupLabel(label)),
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: isDark ? "#111111" : "#ffffff",
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      layout: { padding: 6 },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const value = ctx.parsed || 0;
              const pct = totalSum ? Math.round((value / totalSum) * 1000) / 10 : 0;
              return `${ctx.label}: ${value} series (${pct}%)`;
            }
          }
        }
      }
    },
    plugins: [centerTotal]
  });

  if (globalUserStatsPieLegend) {
    globalUserStatsPieLegend.innerHTML = "";
    labels
      .map((label, idx) => ({ label, value: values[idx] || 0 }))
      .sort((a, b) => b.value - a.value)
      .forEach(({ label, value }) => {
        const style = getMuscleGroupStyle(label);
        const item = document.createElement("div");
        item.className = "pie-icon-item";
        const dot = document.createElement("span");
        dot.className = "pie-icon-dot";
        dot.style.background = style.color;
        const name = document.createElement("span");
        name.className = "pie-icon-name";
        name.textContent = `${style.icon} ${translateGroupLabel(label)}`;
        const amount = document.createElement("span");
        amount.className = "pie-icon-value";
        const pct = totalSum ? Math.round((value / totalSum) * 100) : 0;
        amount.textContent = `${value} · ${pct}%`;
        item.append(dot, name, amount);
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

  const groups = Array.from(new Set(
    allNames
      .map(name => resolveExerciseGroup(exerciseTemplates[name]))
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, getLocale()));

  if (favoritesGroupSelect) {
    const currentValue = favoritesGroupSelect.dataset.selectedGroup || groups[0] || "";
    favoritesGroupSelect.innerHTML = "";
    const nextValue = groups.includes(currentValue) ? currentValue : groups[0] || "";
    favoritesGroupSelect.dataset.selectedGroup = nextValue;
    groups.forEach(group => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "favorites-group-btn";
      button.textContent = translateGroupLabel(group);
      button.dataset.group = group;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", group === nextValue ? "true" : "false");
      button.classList.toggle("is-active", group === nextValue);
      button.addEventListener("click", () => {
        favoritesGroupSelect.dataset.selectedGroup = group;
        renderFavoritesList();
      });
      favoritesGroupSelect.appendChild(button);
    });
    favoritesGroupSelect.querySelector(".is-active")?.scrollIntoView({ block: "nearest", inline: "center" });
  }

  const selectedGroup = favoritesGroupSelect?.dataset.selectedGroup || groups[0] || "";
  const groupNames = allNames.filter(
    name => resolveExerciseGroup(exerciseTemplates[name]) === selectedGroup
  );
  const fragment = document.createDocumentFragment();
  groupNames.forEach(name => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "favorite-item";
    card.classList.toggle("is-active", favorites.has(name));
    card.setAttribute("aria-pressed", favorites.has(name) ? "true" : "false");
    card.addEventListener("click", () => {
      const updated = new Set(loadFavorites());
      if (updated.has(name)) {
        updated.delete(name);
      } else {
        updated.add(name);
      }
      saveFavorites(Array.from(updated));
      const active = updated.has(name);
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-pressed", active ? "true" : "false");
    });
    const text = document.createElement("span");
    text.className = "favorite-item-name";
    text.textContent = name;
    const star = document.createElement("span");
    star.className = "favorite-item-star";
    star.textContent = "★";
    star.setAttribute("aria-hidden", "true");
    card.appendChild(text);
    card.appendChild(star);
    fragment.appendChild(card);
  });
  favoritesList.appendChild(fragment);
}

// El historial ahora es una pestaña propia
function openHistoryMenuOverlay() {
  closeManageUserOverlay();
  openTab("historial");
}

if (manageUserClose) {
  manageUserClose.addEventListener("click", closeManageUserOverlay);
}

if (manageUserOverlay) {
  manageUserOverlay.addEventListener("click", (e) => {
    if (e.target === manageUserOverlay) closeManageUserOverlay();
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
    closeFavoritesOverlay();
  });
}
if (favoritesClose) {
  favoritesClose.addEventListener("click", closeFavoritesOverlay);
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
    openHistorySession(session);
    closeManageUserOverlay();
  });
}

if (historyDeleteSessionBtn) {
  historyDeleteSessionBtn.addEventListener("click", () => {
    if (deleteSelectedHistorySession()) openTab("historial");
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
        const parsed = safeParseJSON(event.target.result, null);
        if (!parsed) throw new Error("El archivo no contiene JSON válido.");
        const data = normalizeImportedHistoryPayload(parsed);
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
