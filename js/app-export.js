/* SPDX-License-Identifier: GPL-3.0-or-later · Copyright (C) 2026 Borja Aguado */
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
  const exportContent = buildExportContent(saved);
  sessionSummary.appendChild(exportContent);
}

// Resumen de la sesión que se muestra en el paso "Resumen"
function buildExportContent(saved) {
  const exportDiv = document.createElement("div");
  exportDiv.className = "session-summary";

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
  title.className = "session-summary-title";
  exportDiv.appendChild(title);

  const table = document.createElement("table");
  table.className = "session-summary-mini-table";
  table.innerHTML = `
    <tr class="session-summary-head">
      <th>${t("session.table.exercise")}</th>
      <th>${t("session.table.series")}</th>
      <th>${t("session.table.maxWeightTime")}</th>
      <th>${t("session.table.failure")}</th>
    </tr>
  `;

  saved.exercises.forEach(ex => {
    const isWarmup = isWarmupExercise(ex);
    const displayName = isWarmup
      ? `${ex.nombre || t("history.view.exerciseDefault")} (${t("exercise.warmup")})`
      : (ex.nombre || t("history.view.exerciseDefault"));
    const isCardio = String(ex.musculo || "").toLowerCase() === "cardio";
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
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
      <td>${escapeHtml(sets.length)}</td>
      <td>${escapeHtml(weightOrTime)}</td>
      <td>${escapeHtml(hasFailure)}</td>
    `;
    table.appendChild(row);
  });

  const tableWrap = document.createElement("div");
  tableWrap.className = "session-summary-table-wrap";
  tableWrap.appendChild(table);
  exportDiv.appendChild(tableWrap);

  const sessionComment = (saved.sensations?.comment ?? saved.comment ?? "").trim();
  if (sessionComment) {
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

  return exportDiv;
}

// -------------------------
// IMAGEN DE LA SESIÓN (canvas propio, sin html2canvas)
// -------------------------
const SHARE_IMAGE = {
  width: 1080,
  padding: 56,
  font: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  colors: {
    bg: "#0e0e10",
    card: "#18181b",
    border: "#2a2a2e",
    text: "#f4f4f5",
    muted: "#a1a1aa",
    accent: "#f97316",
    gold: "#eab308",
    danger: "#f87171",
    track: "#2a2a2e"
  }
};

function toNumber(value) {
  const parsed = parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatShareNumber(value, maxDecimals = 1) {
  return Number(value).toLocaleString(getLocale(), { maximumFractionDigits: maxDecimals });
}

// Fórmula de Epley; por encima de 12 repeticiones deja de ser fiable
function estimateOneRepMax(weight, reps) {
  if (!weight || !reps || reps > 12) return null;
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

function getBestEstimatedMax(sets) {
  return (sets || []).reduce((best, set) => {
    const e1rm = estimateOneRepMax(toNumber(set.peso), toNumber(set.reps));
    return e1rm && e1rm > best ? e1rm : best;
  }, 0);
}

function getPreviousBestEstimatedMax(exerciseName, beforeDate) {
  return getLocalHistory().reduce((best, session) => {
    if (!session?.date || session.date >= beforeDate) return best;
    (session.exercises || []).forEach(ex => {
      if (ex.nombre !== exerciseName || isWarmupExercise(ex)) return;
      best = Math.max(best, getBestEstimatedMax(ex.sets));
    });
    return best;
  }, 0);
}

function buildSessionImageData(saved) {
  const dateObj = new Date(`${saved.date}T12:00:00`);
  const validDate = !isNaN(dateObj);
  const dateLabel = validDate
    ? dateObj.toLocaleDateString(getLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : saved.date;
  const routineLabel = [saved.week, saved.day].filter(Boolean).map(translateRoutineLabel).join(" · ");

  let effectiveSets = 0;
  let volume = 0;
  const exercises = (saved.exercises || []).map(ex => {
    const warmup = isWarmupExercise(ex);
    const cardio = String(ex.musculo || "").toLowerCase() === "cardio";
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    const chips = [];
    sets.forEach(set => {
      if (cardio) {
        const intensity = toNumber(set.intensidad ?? set.peso);
        const time = toNumber(set.tiempo ?? set.reps);
        if (intensity == null && time == null) return;
        chips.push({ main: [intensity != null ? `Int. ${formatShareNumber(intensity)}` : "", time != null ? `${formatShareNumber(time, 2)} min` : ""].filter(Boolean).join(" · ") });
        if (!warmup) effectiveSets += 1;
        return;
      }
      const weight = toNumber(set.peso);
      const reps = toNumber(set.reps);
      if (weight == null && reps == null) return;
      const main = weight != null && reps != null
        ? `${formatShareNumber(weight)} kg × ${formatShareNumber(reps, 0)}`
        : (reps != null ? `${formatShareNumber(reps, 0)} reps` : `${formatShareNumber(weight)} kg`);
      const rir = toNumber(set.rir);
      chips.push({ main, extra: set.fallo ? "fallo" : (rir != null ? `RIR ${formatShareNumber(rir, 0)}` : ""), failure: Boolean(set.fallo) });
      if (!warmup) {
        effectiveSets += 1;
        if (weight && reps) volume += weight * reps;
      }
    });
    // Series consecutivas idénticas en una sola etiqueta ("3× 70 kg × 10"): imagen más corta y ligera
    const groupedChips = chips.reduce((acc, chip) => {
      const last = acc[acc.length - 1];
      if (last && last.main === chip.main && last.extra === chip.extra && last.failure === chip.failure) {
        last.count += 1;
      } else {
        acc.push({ ...chip, count: 1 });
      }
      return acc;
    }, []);
    const best = cardio || warmup ? 0 : getBestEstimatedMax(sets);
    const previousBest = best ? getPreviousBestEstimatedMax(ex.nombre, saved.date) : 0;
    const metaParts = [ex.musculo ? translateGroupLabel(ex.musculo) : "", warmup ? t("exercise.warmup") : ""];
    if (best) metaParts.push(`1RM est. ${formatShareNumber(best, 0)} kg`);
    return {
      name: ex.nombre || t("history.view.exerciseDefault"),
      meta: metaParts.filter(Boolean).join(" · "),
      warmup,
      chips: groupedChips,
      note: String(ex.notes || "").trim(),
      record: Boolean(best && previousBest && best > previousBest + 0.01)
    };
  });

  const sensations = saved.sensations || {};
  const painText = sensations.pain === "si"
    ? ["Sí", sensations.painZone, sensations.painExercise].filter(Boolean).join(" · ")
    : "No";
  return {
    dateLabel: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1),
    routineLabel,
    userName: currentUserName || saved.user || "",
    stats: [
      { label: "Ejercicios", value: String(exercises.filter(ex => !ex.warmup).length) },
      { label: "Series", value: String(effectiveSets) },
      { label: "Volumen", value: volume ? `${formatShareNumber(volume >= 10000 ? volume / 1000 : volume, volume >= 10000 ? 1 : 0)}${volume >= 10000 ? "k" : ""} kg` : "—" },
      { label: "Sensación", value: sensations.general !== "" && sensations.general != null ? `${sensations.general}/10` : "—" }
    ],
    exercises,
    general: toNumber(sensations.general),
    tiredness: toNumber(sensations.tiredness),
    painText,
    bodyWeight: toNumber(sensations.weight),
    comment: String(sensations.comment ?? saved.comment ?? "").trim()
  };
}

function wrapCanvasText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// Se ejecuta dos veces: la primera solo mide la altura, la segunda dibuja
function layoutSessionImage(ctx, data, draw) {
  const { width: W, padding: P, font, colors: C } = SHARE_IMAGE;
  const inner = W - P * 2;
  let y = P;
  const text = (value, x, ty, size, weight, color, align = "left") => {
    ctx.font = `${weight} ${size}px ${font}`;
    if (!draw) return;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";
    ctx.fillText(value, x, ty);
  };

  if (draw) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, ctx.canvas.height);
    ctx.fillStyle = C.accent;
    ctx.fillRect(0, 0, W, 8);
  }

  // Cabecera
  y += 24;
  text("GYM TRACKER", P, y, 24, 800, C.accent);
  if (data.userName) text(data.userName, W - P, y, 26, 600, C.muted, "right");
  y += 64;
  ctx.font = `800 54px ${font}`;
  wrapCanvasText(ctx, data.dateLabel, inner).forEach((line, index) => {
    if (index) y += 62;
    text(line, P, y, 54, 800, C.text);
  });
  if (data.routineLabel) {
    y += 46;
    text(data.routineLabel, P, y, 28, 600, C.muted);
  }

  // Resumen en cuatro cifras
  y += 40;
  const gap = 16;
  const tileW = (inner - gap * 3) / 4;
  data.stats.forEach((stat, index) => {
    const x = P + index * (tileW + gap);
    if (draw) {
      ctx.fillStyle = C.card;
      roundRect(ctx, x, y, tileW, 112, 20);
      ctx.fill();
    }
    text(stat.label, x + 22, y + 40, 22, 600, C.muted);
    text(stat.value, x + 22, y + 88, stat.value.length > 7 ? 34 : 42, 800, C.text);
  });
  y += 112 + 30;

  // Ejercicios
  data.exercises.forEach(ex => {
    const cardPad = 26;
    const cardTop = y;
    const cardInner = inner - cardPad * 2;
    let cy = cardTop + cardPad;
    const badgeW = ex.record ? 150 : 0;

    ctx.font = `800 34px ${font}`;
    const nameLines = wrapCanvasText(ctx, ex.name, cardInner - badgeW);
    const ops = [];
    nameLines.forEach((line, index) => {
      cy += index ? 42 : 32;
      const lineY = cy;
      ops.push(() => text(line, P + cardPad, lineY, 34, 800, ex.warmup ? C.muted : C.text));
    });
    if (ex.record) {
      const by = cardTop + cardPad - 2;
      ops.push(() => {
        ctx.fillStyle = C.gold;
        roundRect(ctx, W - P - cardPad - badgeW + 12, by, badgeW - 12, 40, 20);
        ctx.fill();
        text("★ RÉCORD", W - P - cardPad - (badgeW - 12) / 2, by + 28, 20, 800, "#1a1300", "center");
      });
    }
    if (ex.meta) {
      cy += 36;
      const metaY = cy;
      ops.push(() => text(ex.meta, P + cardPad, metaY, 23, 600, C.muted));
    }

    // Series como etiquetas que saltan de línea
    if (ex.chips.length) {
      cy += 22;
      let cx = P + cardPad;
      let rowTop = cy;
      ex.chips.forEach(chip => {
        const countLabel = chip.count > 1 ? `${chip.count}×` : "";
        ctx.font = `800 26px ${font}`;
        const countW = countLabel ? ctx.measureText(countLabel).width + 8 : 0;
        ctx.font = `700 26px ${font}`;
        const mainW = ctx.measureText(chip.main).width;
        ctx.font = `600 20px ${font}`;
        const extraW = chip.extra ? ctx.measureText(chip.extra).width + 10 : 0;
        const chipW = countW + mainW + extraW + 32;
        if (cx + chipW > P + cardPad + cardInner && cx > P + cardPad) {
          cx = P + cardPad;
          rowTop += 56;
        }
        const chipX = cx;
        const chipY = rowTop;
        ops.push(() => {
          ctx.fillStyle = C.bg;
          roundRect(ctx, chipX, chipY, chipW, 48, 14);
          ctx.fill();
          ctx.strokeStyle = chip.failure ? C.danger : C.border;
          ctx.lineWidth = 2;
          ctx.stroke();
          if (countLabel) text(countLabel, chipX + 16, chipY + 33, 26, 800, C.accent);
          text(chip.main, chipX + 16 + countW, chipY + 33, 26, 700, C.text);
          if (chip.extra) text(chip.extra, chipX + 16 + countW + mainW + 10, chipY + 32, 20, 600, chip.failure ? C.danger : C.muted);
        });
        cx += chipW + 10;
      });
      cy = rowTop + 48;
    }

    if (ex.note) {
      ctx.font = `italic 500 23px ${font}`;
      wrapCanvasText(ctx, `“${ex.note}”`, cardInner).forEach(line => {
        cy += 34;
        const noteY = cy;
        ops.push(() => text(line, P + cardPad, noteY, 23, "italic 500", C.muted));
      });
    }

    const cardH = cy - cardTop + cardPad;
    if (draw) {
      ctx.fillStyle = C.card;
      roundRect(ctx, P, cardTop, inner, cardH, 26);
      ctx.fill();
      if (ex.record) {
        ctx.fillStyle = C.gold;
        roundRect(ctx, P, cardTop + 22, 6, cardH - 44, 3);
        ctx.fill();
      }
      ops.forEach(op => op());
    }
    y = cardTop + cardH + 14;
  });

  // Sensaciones
  y += 26;
  text("Sensaciones", P, y, 30, 800, C.text);
  const bar = (label, value, invert) => {
    y += 52;
    text(label, P, y, 24, 600, C.muted);
    const barX = P + 220;
    const barW = inner - 220 - 90;
    if (draw) {
      ctx.fillStyle = C.track;
      roundRect(ctx, barX, y - 18, barW, 14, 7);
      ctx.fill();
      if (value != null) {
        ctx.fillStyle = invert ? C.muted : C.accent;
        roundRect(ctx, barX, y - 18, Math.max(14, barW * Math.min(10, Math.max(0, value)) / 10), 14, 7);
        ctx.fill();
      }
    }
    text(value != null ? `${formatShareNumber(value)}/10` : "—", W - P, y, 26, 800, C.text, "right");
  };
  bar("General", data.general, false);
  bar("Cansancio", data.tiredness, true);
  y += 52;
  text("Dolor", P, y, 24, 600, C.muted);
  text(data.painText, W - P, y, 24, 700, data.painText === "No" ? C.text : C.danger, "right");
  if (data.bodyWeight) {
    y += 46;
    text("Peso corporal", P, y, 24, 600, C.muted);
    text(`${formatShareNumber(data.bodyWeight)} kg`, W - P, y, 24, 700, C.text, "right");
  }

  if (data.comment) {
    y += 30;
    ctx.font = `italic 500 26px ${font}`;
    const lines = wrapCanvasText(ctx, data.comment, inner - 32);
    const top = y;
    if (draw) {
      ctx.fillStyle = C.accent;
      ctx.fillRect(P, top, 5, lines.length * 38 + 10);
    }
    lines.forEach(line => {
      y += 38;
      text(line, P + 26, y, 26, "italic 500", C.text);
    });
    y += 10;
  }

  // Pie
  y += 44;
  if (draw) {
    ctx.fillStyle = C.border;
    ctx.fillRect(P, y, inner, 2);
  }
  y += 44;
  text("Registrado con Gym Tracker", P, y, 22, 700, C.muted);
  text("baguadoramirez.github.io/gym", W - P, y, 22, 600, C.muted, "right");
  return y + P - 12;
}

function renderSessionImage(saved) {
  const data = buildSessionImageData(saved);
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_IMAGE.width;
  canvas.height = 10;
  const ctx = canvas.getContext("2d");
  canvas.height = Math.ceil(layoutSessionImage(ctx, data, false));
  layoutSessionImage(ctx, data, true);
  return canvas;
}

function downloadSessionImage(saved) {
  const canvas = renderSessionImage(saved);
  // "Día 1 – Tren superior (...)" → "Día 1"
  const shortDay = String(saved.day || "").split(/[–—-]/)[0].trim();
  const fileName = [t("file.sessionPrefix"), saved.date, shortDay].filter(Boolean).join("_").replace(/[^\w.\-áéíóúñÁÉÍÓÚÑ]+/g, "_") + ".png";
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}
