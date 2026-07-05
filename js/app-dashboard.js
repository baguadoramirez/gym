(() => {
  const elements = {
    greeting: document.getElementById("dashboard-greeting"),
    subtitle: document.getElementById("dashboard-subtitle"),
    lastSession: document.getElementById("dashboard-last-session"),
    lastSessionDetail: document.getElementById("dashboard-last-session-detail"),
    records: document.getElementById("dashboard-records"),
    empty: document.getElementById("dashboard-empty"),
    insights: document.getElementById("dashboard-insights"),
    weekFrequency: document.getElementById("dashboard-week-frequency"),
    weekStreak: document.getElementById("dashboard-week-streak"),
    goalTrack: document.querySelector(".dashboard-goal-track"),
    goalProgress: document.getElementById("dashboard-goal-progress"),
    muscleBalance: document.getElementById("dashboard-muscle-balance"),
    muscleEmpty: document.getElementById("dashboard-muscle-empty"),
    recordList: document.getElementById("dashboard-record-list"),
    recordEmpty: document.getElementById("dashboard-record-empty"),
    comparison: document.getElementById("dashboard-comparison"),
    alerts: document.getElementById("dashboard-alerts"),
    alertPanel: document.getElementById("dashboard-alert-panel")
  };

  const getSessions = () => {
    const sessions = typeof window.getGymHistorySessions === "function"
      ? window.getGymHistorySessions()
      : (window.uploadedHistory || []);
    return Array.isArray(sessions) ? sessions : [];
  };

  const parseDate = value => {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getExercises = session => (
    session?.exercises || session?.ejercicios || session?.data?.exercises || []
  );

  const getSets = exercise => exercise?.series || exercise?.sets || [];

  const isWarmup = exercise => (
    exercise?.calentamiento === true || exercise?.calentamiento === "true"
  );

  const exerciseName = exercise => (
    exercise?.nombre || exercise?.name || exercise?.exercise || exercise?.ejercicio || ""
  );

  const getBodyLoadMode = exercise => {
    const name = exerciseName(exercise);
    const mode = exercise?.cargaCorporal ?? window.exerciseTemplates?.[name]?.cargaCorporal;
    return mode === "restar" || mode === "sumar" ? mode : "";
  };

  const setWeight = set => {
    const value = Number.parseFloat(set?.peso ?? set?.weight);
    return Number.isFinite(value) ? value : null;
  };

  const setReps = set => {
    const value = Number.parseFloat(set?.reps ?? set?.repeticiones);
    return Number.isFinite(value) ? value : null;
  };

  const sessionVolume = session => {
    if (window.GymMetrics?.calculateSessionVolume) {
      return window.GymMetrics.calculateSessionVolume(session, {
        sessions: getSessions(),
        templates: window.exerciseTemplates || {}
      });
    }
    return getExercises(session).reduce((total, exercise) => {
      if (isWarmup(exercise)) return total;
      return total + getSets(exercise).reduce((sum, set) => {
        const weight = setWeight(set);
        const reps = setReps(set);
        return sum + (weight != null && reps != null ? weight * reps : 0);
      }, 0);
    }, 0);
  };

  const sessionSets = session => getExercises(session).reduce((total, exercise) => (
    total + (isWarmup(exercise) ? 0 : getSets(exercise).length)
  ), 0);

  const formatNumber = value => new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 0
  }).format(value);

  const formatCompactNumber = value => {
    if (Math.abs(value) < 1000) return formatNumber(value);
    return `${(value / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })}k`;
  };

  const formatDate = date => new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric"
  }).format(date);

  const relativeDays = date => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const days = Math.max(0, Math.round((today - date) / 86400000));
    if (days === 0) return "Hoy";
    if (days === 1) return "Ayer";
    return `Hace ${days} días`;
  };

  const getRecentRecords = sessions => {
    const bestByExercise = new Map();
    const recentRecords = [];
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - 29);

    sessions
      .map(session => ({ session, date: parseDate(session.date) }))
      .filter(item => item.date)
      .sort((a, b) => a.date - b.date)
      .forEach(({ session, date }) => {
        getExercises(session).forEach(exercise => {
          if (isWarmup(exercise)) return;
          const name = exerciseName(exercise).trim().toLocaleLowerCase("es");
          if (!name) return;
          const weights = getSets(exercise).map(setWeight).filter(value => value != null);
          if (!weights.length) return;
          const loadMode = getBodyLoadMode(exercise);
          const sessionBest = loadMode === "restar" ? Math.min(...weights) : Math.max(...weights);
          const previous = bestByExercise.get(name);
          const previousBest = previous?.weight;
          const isImprovement = previousBest != null && (
            window.GymMetrics?.isLoadImprovement
              ? window.GymMetrics.isLoadImprovement(sessionBest, previousBest, loadMode)
              : loadMode === "restar" ? sessionBest < previousBest : sessionBest > previousBest
          );
          if (isImprovement && date >= cutoff) {
            recentRecords.push({
              name: exerciseName(exercise),
              weight: sessionBest,
              previousWeight: previousBest,
              loadMode,
              date
            });
          }
          if (previousBest == null || isImprovement) {
            bestByExercise.set(name, { weight: sessionBest, loadMode });
          }
        });
      });
    return recentRecords;
  };

  const startOfWeek = date => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    const day = result.getDay() || 7;
    result.setDate(result.getDate() - day + 1);
    return result;
  };

  const getWeekStreak = sessions => {
    const weeks = Array.from(new Set(sessions.map(({ date }) => startOfWeek(date).getTime())))
      .sort((a, b) => b - a);
    if (!weeks.length) return 0;
    const currentWeek = startOfWeek(new Date()).getTime();
    const oneWeek = 7 * 86400000;
    if (weeks[0] < currentWeek - oneWeek) return 0;
    let streak = 1;
    for (let index = 1; index < weeks.length; index += 1) {
      const gapInDays = Math.round((weeks[index - 1] - weeks[index]) / 86400000);
      if (gapInDays !== 7) break;
      streak += 1;
    }
    return streak;
  };

  const getExerciseGroup = exercise => {
    const name = exerciseName(exercise);
    const template = window.exerciseTemplates?.[name] || {};
    if (typeof window.resolveExerciseGroup === "function") {
      return window.resolveExerciseGroup(template || { musculo: exercise?.musculo });
    }
    return template.grupo || exercise?.grupo || exercise?.musculo || "Otros";
  };

  const renderMuscleBalance = sessions => {
    const totals = new Map();
    sessions.forEach(({ session }) => {
      getExercises(session).forEach(exercise => {
        if (isWarmup(exercise)) return;
        const sets = getSets(exercise).length;
        if (!sets) return;
        const group = String(getExerciseGroup(exercise) || "Otros").trim();
        totals.set(group, (totals.get(group) || 0) + sets);
      });
    });
    const totalSets = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
    elements.muscleBalance?.replaceChildren();
    Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .forEach(([group, sets]) => {
        const percent = Math.round((sets / totalSets) * 100);
        const row = document.createElement("div");
        row.className = "dashboard-muscle-row";
        const label = document.createElement("span");
        label.textContent = group;
        const track = document.createElement("span");
        track.className = "dashboard-muscle-track";
        const fill = document.createElement("span");
        fill.className = "dashboard-muscle-fill";
        fill.style.width = `${percent}%`;
        track.appendChild(fill);
        const value = document.createElement("span");
        value.className = "dashboard-muscle-percent";
        value.textContent = `${percent}%`;
        row.append(label, track, value);
        elements.muscleBalance?.appendChild(row);
      });
    elements.muscleEmpty?.classList.toggle("is-hidden", totalSets > 0);
  };

  const renderRecordList = records => {
    elements.recordList?.replaceChildren();
    records.slice().reverse().slice(0, 4).forEach(record => {
      const item = document.createElement("div");
      item.className = "dashboard-record-item";
      const name = document.createElement("span");
      name.className = "dashboard-record-name";
      name.textContent = record.name;
      const weight = document.createElement("span");
      weight.className = "dashboard-record-weight";
      weight.textContent = `${record.weight} kg`;
      const meta = document.createElement("span");
      meta.className = "dashboard-record-meta";
      const improvement = Math.abs(record.weight - record.previousWeight);
      const change = improvement.toLocaleString("es-ES", { maximumFractionDigits: 1 });
      meta.textContent = record.loadMode === "restar"
        ? `${formatDate(record.date)} · ${change} kg menos de asistencia`
        : `${formatDate(record.date)} · +${change} kg`;
      item.append(name, weight, meta);
      elements.recordList?.appendChild(item);
    });
    elements.recordEmpty?.classList.toggle("is-hidden", records.length > 0);
  };

  const renderComparison = (recent, previous) => {
    if (!elements.comparison) return;
    const metrics = [
      {
        label: "Sesiones",
        current: recent.length,
        prior: previous.length,
        suffix: ""
      },
      {
        label: "Series registradas",
        current: recent.reduce((sum, item) => sum + sessionSets(item.session), 0),
        prior: previous.reduce((sum, item) => sum + sessionSets(item.session), 0),
        suffix: ""
      },
      {
        label: "Volumen estimado",
        current: recent.reduce((sum, item) => sum + sessionVolume(item.session), 0),
        prior: previous.reduce((sum, item) => sum + sessionVolume(item.session), 0),
        suffix: " kg"
      }
    ];
    elements.comparison.replaceChildren();
    metrics.forEach(metric => {
      const item = document.createElement("div");
      item.className = "dashboard-comparison-item";
      const label = document.createElement("span");
      label.textContent = metric.label;
      const value = document.createElement("strong");
      const formattedValue = metric.label === "Volumen estimado"
        ? formatCompactNumber(metric.current)
        : formatNumber(metric.current);
      value.textContent = `${formattedValue}${metric.suffix}`;
      const delta = document.createElement("div");
      delta.className = "dashboard-comparison-delta";
      if (metric.prior > 0) {
        const percent = Math.round(((metric.current - metric.prior) / metric.prior) * 100);
        delta.textContent = `${percent > 0 ? "+" : ""}${percent}%`;
      } else {
        delta.textContent = metric.current > 0 ? "Nuevo periodo" : "Sin cambios";
      }
      item.append(label, value, delta);
      elements.comparison.appendChild(item);
    });
  };

  const renderAlerts = (sessions, recent, previous) => {
    if (!elements.alerts) return;
    const alerts = [];
    const latest = sessions[0];
    if (latest) {
      const daysSinceLastSession = Math.max(0, Math.floor((new Date() - latest.date) / 86400000));
      if (daysSinceLastSession >= 7) {
        alerts.push(`Han pasado ${daysSinceLastSession} días desde la última sesión.`);
      }
    }
    if (previous.length >= 2 && recent.length < previous.length) {
      alerts.push(`La frecuencia bajó de ${previous.length} a ${recent.length} sesiones respecto al periodo anterior.`);
    }
    const latestFive = sessions.slice(0, 5);
    const painSessions = latestFive.filter(({ session }) => session?.sensations?.pain === "si");
    if (painSessions.length >= 2) {
      alerts.push(`Registraste dolor en ${painSessions.length} de las últimas ${latestFive.length} sesiones. Si persiste, consulta a un profesional sanitario.`);
    }
    const tirednessValues = sessions.slice(0, 3)
      .map(({ session }) => Number.parseFloat(session?.sensations?.tiredness))
      .filter(Number.isFinite);
    if (tirednessValues.length >= 2) {
      const averageTiredness = tirednessValues.reduce((sum, value) => sum + value, 0) / tirednessValues.length;
      if (averageTiredness >= 8) {
        alerts.push(`El cansancio medio reciente es ${averageTiredness.toLocaleString("es-ES", { maximumFractionDigits: 1 })}/10.`);
      }
    }
    const hasObservations = alerts.length > 0;
    elements.alertPanel?.classList.toggle("is-hidden", !hasObservations);
    elements.alerts.replaceChildren();
    alerts.forEach(text => {
      const alert = document.createElement("div");
      alert.className = "dashboard-alert";
      alert.textContent = text;
      elements.alerts.appendChild(alert);
    });
  };

  function renderDashboard() {
    if (!elements.greeting) return;
    const sessions = getSessions()
      .map(session => ({ session, date: parseDate(session.date) }))
      .filter(item => item.date)
      .sort((a, b) => b.date - a.date);
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - 29);
    const previousCutoff = new Date(cutoff);
    previousCutoff.setDate(previousCutoff.getDate() - 30);
    const recentPeriod = sessions.filter(({ date }) => date >= cutoff);
    const previousPeriod = sessions.filter(({ date }) => date >= previousCutoff && date < cutoff);
    const currentWeekStart = startOfWeek(now);
    const recentSessions = sessions.filter(({ date }) => date >= currentWeekStart);

    const userName = window.gymState?.currentUserName || "";
    elements.greeting.textContent = userName ? `Hola, ${userName}` : "Resumen de entrenamiento";
    elements.subtitle.textContent = sessions.length
      ? `${sessions.length} ${sessions.length === 1 ? "sesión guardada" : "sesiones guardadas"} en total`
      : "Consulta tu progreso antes de empezar.";
    const records = getRecentRecords(sessions.map(item => item.session));
    elements.records.textContent = String(records.length);
    elements.weekFrequency.textContent = String(recentSessions.length);
    elements.weekStreak.textContent = String(getWeekStreak(sessions));
    const weeklyGoalProgress = Math.min(100, (recentSessions.length / 3) * 100);
    if (elements.goalProgress) elements.goalProgress.style.width = `${weeklyGoalProgress}%`;
    elements.goalTrack?.setAttribute("aria-valuenow", String(Math.min(3, recentSessions.length)));

    renderMuscleBalance(sessions.filter(({ date }) => date >= cutoff));
    renderRecordList(records);
    renderComparison(recentPeriod, previousPeriod);
    renderAlerts(sessions, recentPeriod, previousPeriod);

    const latest = sessions[0];
    if (latest) {
      const exercises = getExercises(latest.session).filter(exercise => !isWarmup(exercise));
      elements.lastSession.textContent = formatDate(latest.date);
      elements.lastSessionDetail.textContent = `${relativeDays(latest.date)} · ${exercises.length} ${exercises.length === 1 ? "ejercicio" : "ejercicios"}`;
    } else {
      elements.lastSession.textContent = "—";
      elements.lastSessionDetail.textContent = "Sin sesiones guardadas";
    }
    elements.empty?.classList.toggle("is-hidden", sessions.length > 0);
    elements.insights?.classList.toggle("is-hidden", sessions.length === 0);
  }

  window.renderDashboard = renderDashboard;
  document.addEventListener("DOMContentLoaded", renderDashboard);
})();
