function updateSessionSummary() {
  if (!sessionSummary) return;
  if (exercisesContainer !== mainExercisesContainer) return;
  const key = sessionKey();
  const saved = readStorageJSON(key, null);
  if (!saved) {
    sessionSummary.textContent = t("session.noData");
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
    ? dateObj.toLocaleDateString(getLocale(), { day: "2-digit", month: "2-digit", year: "numeric" })
    : saved.date;
  const weekday = isValidDate
    ? dateObj.toLocaleDateString(getLocale(), { weekday: "long" })
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
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.exercise")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.set")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.weightIntensity")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.repsTime")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.rir")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.failure")}</th>
      </tr>
    `;
  } else {
    table.className = "session-summary-mini-table";
    table.innerHTML = `
      <tr class="session-summary-head">
        <th>${t("session.table.exercise")}</th>
        <th>${t("session.table.series")}</th>
        <th>${t("session.table.maxWeightTime")}</th>
        <th>${t("session.table.failure")}</th>
      </tr>
    `;
  }

  let totalExercises = 0;
  let totalSets = 0;
  let effectiveExercises = 0;
  let effectiveSets = 0;
  let warmupSets = 0;

  saved.exercises.forEach((ex, exIndex) => {
    const isWarmup = isWarmupExercise(ex);
    const groupBg = usePngStyles
      ? (exIndex % 2 === 0 ? "#e2e8f0" : "#f8fafc")
      : (exIndex % 2 === 0 ? "var(--control-bg)" : "var(--card-bg)");
    totalExercises += 1;
    if (!isWarmup) effectiveExercises += 1;
    const displayName = isWarmup
      ? `${ex.nombre || t("history.view.exerciseDefault")} (${t("exercise.warmup")})`
      : (ex.nombre || t("history.view.exerciseDefault"));

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
        : sets.some(set => set.fallo === true) ? t("session.failure.yes") : t("session.failure.no");
      const weightOrTime = isCardio
        ? (maxTime !== "-" ? t("exercise.detail.time", { value: maxTime }) : "-")
        : (maxWeight !== "-" ? t("exercise.detail.weight", { value: maxWeight }) : "-");
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(displayName)}</td>
        <td>${escapeHtml(seriesCount)}</td>
        <td>${escapeHtml(weightOrTime)}</td>
        <td>${escapeHtml(hasFailure)}</td>
      `;
      table.appendChild(row);
      return;
    }

    const exerciseNote = (ex.notes ?? Array.from(new Set((ex.sets || []).map(s => (s.obs ?? "").trim()).filter(Boolean))).join(" / ")).trim();
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    sets.forEach((set, setIndex) => {
      totalSets += 1;
      if (isWarmup) {
        warmupSets += 1;
      } else {
        effectiveSets += 1;
      }
      const displayPeso = isCardio ? (set.intensidad ?? set.peso ?? "") : (set.peso ?? "");
      const displayReps = isCardio ? (set.tiempo ?? set.reps ?? "") : (set.reps ?? "");
      const displayRir = isCardio ? "" : (set.rir ?? "");
      const displayFallo = isCardio ? "" : (set.fallo ? t("session.failure.yes") : t("session.failure.no"));

      const tr = document.createElement("tr");
      tr.style.background = groupBg;
      if (setIndex === 0) {
        tr.style.borderTop = "2px solid #000";
      }
      if (usePngStyles) {
        tr.innerHTML = `
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; font-weight: bold;">${escapeHtml(displayName)}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${escapeHtml(set.serie ?? "")}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${escapeHtml(displayPeso)}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${escapeHtml(displayReps)}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${escapeHtml(displayRir)}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${escapeHtml(displayFallo)}</td>
        `;
      } else {
        tr.innerHTML = `
          <td style="background:${groupBg}; font-weight: 700;">${escapeHtml(displayName)}</td>
          <td style="background:${groupBg};">${escapeHtml(set.serie ?? "")}</td>
          <td style="background:${groupBg}; text-align:right;">${escapeHtml(displayPeso)}</td>
          <td style="background:${groupBg}; text-align:right;">${escapeHtml(displayReps)}</td>
          <td style="background:${groupBg}; text-align:right;">${escapeHtml(displayRir)}</td>
          <td style="background:${groupBg};">${escapeHtml(displayFallo)}</td>
        `;
      }
      table.appendChild(tr);
    });

    if (usePngStyles && exerciseNote) {
      const noteRow = document.createElement("tr");
      noteRow.innerHTML = `
        <td colspan="6" style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; font-style: italic;">
          ${escapeHtml(t("session.table.notes"))}: ${escapeHtml(exerciseNote)}
        </td>
      `;
      table.appendChild(noteRow);
    }

    if (usePngStyles && exIndex < saved.exercises.length - 1) {
      const separator = document.createElement("tr");
      if (usePngStyles) {
        separator.innerHTML = `
          <td colspan="6" style="border-left:1px solid #000; border-right:1px solid #000; border-top:1px solid #777; padding:0; height:6px; background:#fff;"></td>
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

  const sessionComment = (saved.sensations?.comment ?? saved.comment ?? "").trim();
  if (sessionComment) {
    if (usePngStyles) {
      const commentDiv = document.createElement("div");
      commentDiv.style.marginTop = "10px";
      commentDiv.style.fontSize = "12px";
      commentDiv.style.color = "#000";
      const label = document.createElement("p");
      label.style.margin = "3px 0";
      label.style.fontWeight = "bold";
      label.textContent = t("session.comment.label");
      const value = document.createElement("p");
      value.style.margin = "3px 0";
      value.textContent = sessionComment;
      commentDiv.appendChild(label);
      commentDiv.appendChild(value);
      exportDiv.appendChild(commentDiv);
    } else {
      const commentSection = document.createElement("div");
      commentSection.className = "session-summary-section";
      const label = document.createElement("div");
      label.className = "session-summary-label";
      label.textContent = t("session.comment.label");
      const value = document.createElement("div");
      value.textContent = sessionComment;
      commentSection.appendChild(label);
      commentSection.appendChild(value);
      exportDiv.appendChild(commentSection);
    }
  }

  if (usePngStyles) {
    const summary = document.createElement("div");
    summary.style.marginTop = "8px";
    summary.style.fontSize = "12px";
    summary.style.color = "#000";
    summary.innerHTML = `
      <p style="margin: 3px 0; font-weight:bold; color:#000;">${t("session.summary.header")}</p>
      <p style="margin: 3px 0; color:#000;">${t("session.summary.totalExercises", { count: totalExercises })}</p>
      <p style="margin: 3px 0; color:#000;">${t("session.summary.totalSets", { count: totalSets })}</p>
      <p style="margin: 3px 0; color:#000;">${t("session.summary.effectiveExercises", { count: effectiveExercises })}</p>
      <p style="margin: 3px 0; color:#000;">${t("session.summary.effectiveSets", { count: effectiveSets })}</p>
      <p style="margin: 3px 0; color:#000;">${t("session.summary.warmupSets", { count: warmupSets })}</p>
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
      const zoneText = sensations.painZone || t("session.pain.zoneNA");
      const exerciseText = sensations.painExercise || t("session.pain.exerciseNA");
      painText = `${t("session.failure.yes")} (${zoneText} - ${exerciseText})`;
    } else {
      painText = t("session.failure.no");
    }

    sensDiv.innerHTML = `
        <p style="font-weight:bold; margin: 3px 0; color:#000; font-size:14px;">${escapeHtml(t("session.metrics.title"))}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">${escapeHtml(t("session.metrics.general", { value: sensations.general || "N/A" }))}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">${escapeHtml(t("session.metrics.tiredness", { value: sensations.tiredness || "N/A" }))}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">${escapeHtml(t("session.metrics.pain", { value: painText }))}</p>
    `;
    exportDiv.appendChild(sensDiv);

    const footer = document.createElement("p");
    footer.textContent = t("session.footer");
    footer.style.fontSize = "10px";
    footer.style.textAlign = "right";
    footer.style.marginTop = "15px";
    footer.style.color = "#000";
    exportDiv.appendChild(footer);
  }

  return exportDiv;
}
