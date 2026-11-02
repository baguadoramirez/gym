/* SPDX-License-Identifier: GPL-3.0-or-later · Copyright (C) 2026 Borja Aguado */
  // Script Modificado para el nuevo toggle
  const compactThemeToggle = document.getElementById("compact-theme-toggle");
  const htmlElement = document.documentElement;
  function applyTheme(theme) {
    const isDark = theme === "dark";
    htmlElement.classList.toggle("dark", isDark);
    htmlElement.setAttribute("data-theme", theme);
    localStorage.setItem("gym-theme", theme);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute("content", isDark ? "#121212" : "#111827");
    }
  }
  const savedTheme = localStorage.getItem("gym-theme");
  const initialTheme = savedTheme === "light" ? "light" : "dark";
  applyTheme(initialTheme);

	  const onThemeToggle = () => {
	    const isDark = htmlElement.classList.contains("dark");
	    applyTheme(isDark ? "light" : "dark");
	  };
	  if (compactThemeToggle) compactThemeToggle.addEventListener("click", onThemeToggle);

	  if (typeof Chart !== "undefined") {
	    // Sin animaciones: los gráficos se dibujan directamente al cambiar de pestaña o de métrica
	    Chart.defaults.animation = false;
	    Chart.defaults.transitions.active.animation.duration = 0;
	    Chart.register({
	      id: "zeroReferenceLine",
	      afterDraw(chart) {
	        const yScale = chart.scales?.y;
	        if (!yScale || !Number.isFinite(yScale.min) || !Number.isFinite(yScale.max)) return;
	        if (yScale.min > 0 || yScale.max < 0) return;

	        const { ctx, chartArea } = chart;
	        const y = yScale.getPixelForValue(0);
	        if (y < chartArea.top || y > chartArea.bottom) return;

	        ctx.save();
	        ctx.beginPath();
	        ctx.setLineDash([6, 4]);
	        ctx.lineWidth = 1.5;
	        ctx.strokeStyle = "#9a3412";
	        ctx.moveTo(chartArea.left, y);
	        ctx.lineTo(chartArea.right, y);
	        ctx.stroke();
	        ctx.restore();
	      }
	    });
	  }
	
	  // Gráficos simples (peso máximo por día)
	  (() => {
    const i18n = window.gymI18n || {};
    const tChart = (key, vars) => (typeof i18n.t === "function" ? i18n.t(key, vars) : key);
    const getChartLocale = () => (typeof i18n.getLocale === "function" ? i18n.getLocale() : "es-ES");

    const chartExerciseSelect = document.getElementById("chart-exercise-select");
    const chartMetricButtons = document.getElementById("chart-metric-buttons");
    const chartCanvas = document.getElementById("progress-chart");
    const chartNoDataMsg = document.getElementById("chart-no-data-msg");
    const globalChartExerciseSelect = document.getElementById("global-chart-exercise-select");
    const globalChartMetricButtons = document.getElementById("global-chart-metric-buttons");
    const globalChartCanvas = document.getElementById("global-progress-chart");
    const globalChartNoDataMsg = document.getElementById("global-chart-no-data-msg");
    const globalChartShowAll = document.getElementById("global-chart-show-all");
    const globalChartOpenSession = document.getElementById("global-chart-open-session");
    const globalChartSelectedSession = document.getElementById("global-chart-selected-session");
    if (globalChartShowAll) globalChartShowAll.checked = false;
    const BODY_WEIGHT_KEY = "__body_weight__";
    const setHidden = (element, isHidden) => {
      if (!element) return;
      element.classList.toggle("is-hidden", isHidden);
      element.style.display = isHidden ? "none" : "block";
    };
    // 1RM estimado resume peso y repeticiones en un solo número; peso máximo es la referencia
    // intuitiva y el volumen total refleja el trabajo hecho en la sesión
    const METRIC_MODES = {
      performance: "performance",
      maxWeight: "maxWeight",
      volume: "volume"
    };
    const TREND_ALPHA = 0.35;
    const TREND_COMPARE_SESSIONS = 4;

    const getHistorySessions = () => (
      typeof window.getGymHistorySessions === "function"
        ? window.getGymHistorySessions()
        : (window.uploadedHistory || [])
    );

    const getExerciseName = (exercise) => {
      if (!exercise || typeof exercise !== "object") return "";
      return exercise.nombre || exercise.name || exercise.exercise || exercise.ejercicio || "";
    };

    const isWarmup = (exercise) => {
      if (typeof window.isWarmupExercise === "function") return window.isWarmupExercise(exercise);
      return exercise?.calentamiento === true || exercise?.calentamiento === "true";
    };

    const getSessionExercises = (session) => {
      if (!session || typeof session !== "object") return [];
      if (Array.isArray(session.exercises)) return session.exercises;
      if (Array.isArray(session.ejercicios)) return session.ejercicios;
      if (Array.isArray(session.data?.exercises)) return session.data.exercises;
      if (Array.isArray(session.data?.ejercicios)) return session.data.ejercicios;
      if (Array.isArray(session.session?.exercises)) return session.session.exercises;
      if (Array.isArray(session.session?.ejercicios)) return session.session.ejercicios;
      return [];
    };

    const getExerciseSets = exercise => {
      if (Array.isArray(exercise?.sets)) return exercise.sets;
      if (Array.isArray(exercise?.series)) return exercise.series;
      return [];
    };

    const getBodyWeightValue = (session) => {
      const raw = session?.sensations?.weight ?? session?.sensations?.peso ?? session?.sensations?.pes;
      const value = parseFloat(raw);
      return Number.isNaN(value) ? null : value;
    };

    const getNearestBodyWeightValue = (sessions, sessionIndex) => {
      for (let i = sessionIndex; i >= 0; i -= 1) {
        const value = getBodyWeightValue(sessions[i]);
        if (value != null) return value;
      }
      return null;
    };

    const getBodyLoadMode = (exercise) => {
      const name = getExerciseName(exercise);
      const raw = exercise?.cargaCorporal ?? window.exerciseTemplates?.[name]?.cargaCorporal ?? "";
      return raw === "sumar" || raw === "restar" ? raw : "";
    };

    const getExternalWeightValue = (set) => parseFloat(set?.peso ?? set?.weight ?? set?.intensidad);
    const getSetWeightValue = (set, exercise, bodyWeight) => {
      const externalWeight = getExternalWeightValue(set);
      const bodyLoadMode = getBodyLoadMode(exercise);

      if (bodyLoadMode && Number.isFinite(bodyWeight)) {
        const extraWeight = Number.isFinite(externalWeight) ? externalWeight : 0;
        const effectiveWeight = bodyLoadMode === "restar"
          ? bodyWeight - extraWeight
          : bodyWeight + extraWeight;
        return Math.max(effectiveWeight, 0);
      }

      return externalWeight;
    };
    const getSetRepsValue = (set) => parseFloat(set?.reps ?? set?.repeticiones ?? set?.tiempo ?? set?.time);

    const getMaxWeightFromSets = (sets, exercise, bodyWeight) => {
      if (!Array.isArray(sets) || !sets.length) return null;
      const values = sets.map(set => getSetWeightValue(set, exercise, bodyWeight)).filter(value => Number.isFinite(value));
      if (!values.length) return null;
      return Math.max(...values);
    };

    const getVolumeFromSets = (sets, exercise, bodyWeight) => {
      if (!Array.isArray(sets) || !sets.length) return null;
      const volumes = sets
        .map(set => {
          const peso = getSetWeightValue(set, exercise, bodyWeight);
          const reps = getSetRepsValue(set);
          return Number.isFinite(peso) && Number.isFinite(reps) && reps > 0
            ? peso * reps
            : null;
        })
        .filter(value => value != null);

      if (!volumes.length) return null;
      return volumes.reduce((sum, value) => sum + value, 0);
    };

    const getPerformanceMetricsFromSets = (sets, exercise, bodyWeight) => {
      if (!Array.isArray(sets) || !sets.length) return null;
      if (window.GymMetrics?.calculateExercisePerformance) {
        return window.GymMetrics.calculateExercisePerformance({ ...exercise, sets }, {
          bodyWeight,
          templates: window.exerciseTemplates || {}
        });
      }
      const values = sets
        .map(set => {
          const peso = getSetWeightValue(set, exercise, bodyWeight);
          const reps = getSetRepsValue(set);
          return Number.isFinite(peso) && Number.isFinite(reps) && reps > 0
            ? peso * (1 + (reps / 30))
            : null;
        })
        .filter(value => value != null);

      if (!values.length) return null;
      const best = Math.max(...values);
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      return {
        best,
        retention: best > 0 ? (average / best) * 100 : null
      };
    };

    const getTrendValues = values => {
      if (window.GymMetrics?.smoothTrend) return window.GymMetrics.smoothTrend(values, TREND_ALPHA);
      return values.map(value => (Number.isFinite(value) ? value : null));
    };

    const isCardioExercise = exercise => (
      window.GymMetrics?.isCardio ? window.GymMetrics.isCardio(exercise, window.exerciseTemplates || {}) : false
    );

    const formatChartNumber = value => Number(value).toLocaleString(getChartLocale(), { maximumFractionDigits: 1 });

    const getCurrentSessionExerciseNames = () => (
      Array.from(document.querySelectorAll("#exercises-container .exercise-card"))
        .filter(card => card.dataset.calentamiento !== "true")
        .map(card => card.querySelector(".exercise-title")?.textContent.trim() || "")
        .filter(Boolean)
    );

    const getAllHistoryExerciseNames = () => {
      const names = new Set(
        typeof window.getGymHistoryExerciseNames === "function"
          ? window.getGymHistoryExerciseNames()
          : []
      );
      const sessions = getHistorySessions();
      sessions.forEach(session => {
        getSessionExercises(session).forEach(ex => {
          if (isWarmup(ex)) return;
          const name = getExerciseName(ex);
          if (name) names.add(name);
        });
      });
      return Array.from(names);
    };

    const formatChartAxisDate = date => {
      const parsed = parseSessionDate(date);
      return parsed
        ? parsed.toLocaleDateString(getChartLocale(), { day: "2-digit", month: "2-digit" })
        : date;
    };

    const parseSessionDate = value => {
      if (!value) return null;
      const date = new Date(`${value}T12:00:00`);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const getThreeMonthsCutoff = () => {
      const cutoff = new Date();
      cutoff.setHours(0, 0, 0, 0);
      cutoff.setMonth(cutoff.getMonth() - 3);
      return cutoff;
    };

    const getRecentExerciseCounts = sessions => {
      const cutoff = getThreeMonthsCutoff();
      const counts = new Map();
      sessions.forEach(session => {
        const date = parseSessionDate(session?.date);
        if (!date || date < cutoff) return;
        const namesInSession = new Set();
        getSessionExercises(session).forEach(ex => {
          if (isWarmup(ex)) return;
          const name = getExerciseName(ex);
          if (name) namesInSession.add(name);
        });
        namesInSession.forEach(name => {
          counts.set(name, (counts.get(name) || 0) + 1);
        });
      });
      return counts;
    };

    const formatChartPointDate = date => {
      if (!date) return "";
      const parsed = new Date(`${date}T12:00:00`);
      if (Number.isNaN(parsed.getTime())) return date;
      return parsed.toLocaleDateString(getChartLocale(), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    };

    const openHistorySessionFromChart = point => {
      if (!point?.date || typeof window.openGymHistorySession !== "function") return;
      window.openGymHistorySession(point);
    };

    const createChartSection = ({ selectEl, metricButtonsEl, canvasEl, noDataMsgEl, summaryEl, allowBodyWeight, getExerciseNames, simpleFilterControl, openSessionButton, selectedSessionLabel }) => {
      let chartInstance;
      let currentMode = METRIC_MODES.performance;
      let chartPoints = [];
      let selectedPoint = null;

      const setSelectedPoint = point => {
        selectedPoint = point || null;
        if (openSessionButton) openSessionButton.disabled = !selectedPoint;
        if (selectedSessionLabel) {
          selectedSessionLabel.textContent = selectedPoint
            ? `Seleccionada: ${formatChartPointDate(selectedPoint.date)}`
            : "Toca un punto del gráfico para seleccionar un día.";
        }
      };

      const getMetricLabel = (mode) => {
        if (mode === METRIC_MODES.volume) return tChart("chart.metric.volume");
        if (mode === METRIC_MODES.performance) return tChart("chart.metric.performance");
        return tChart("chart.metric.maxWeight");
      };

      const getSessionMetricValue = (mode, sets, exercise, bodyWeight) => {
        if (mode === METRIC_MODES.volume) return getVolumeFromSets(sets, exercise, bodyWeight);
        if (mode === METRIC_MODES.performance) return getPerformanceMetricsFromSets(sets, exercise, bodyWeight)?.best ?? null;
        return getMaxWeightFromSets(sets, exercise, bodyWeight);
      };

      // Un valor por día: si hubiera varias sesiones en la misma fecha (datos antiguos), se combinan
      const collectDailyValues = (exerciseName, mode, sessions) => {
        const dateMap = new Map();
        let cardio = false;
        sessions.forEach((session, sessionIndex) => {
          const date = session?.date;
          if (!date) return;

          if (exerciseName === BODY_WEIGHT_KEY) {
            const weight = getBodyWeightValue(session);
            if (weight != null) dateMap.set(date, { value: weight, key: session.key || "" });
            return;
          }

          const ex = getSessionExercises(session).find(item => getExerciseName(item) === exerciseName && !isWarmup(item));
          const sets = getExerciseSets(ex);
          if (!ex || !sets.length) return;
          const value = getSessionMetricValue(mode, sets, ex, getNearestBodyWeightValue(sessions, sessionIndex));
          if (!Number.isFinite(value)) return;
          cardio = cardio || isCardioExercise(ex);
          const current = dateMap.get(date);
          if (!current) {
            dateMap.set(date, { value, key: session.key || "" });
          } else if (mode === METRIC_MODES.volume) {
            current.value += value;
          } else if (value > current.value) {
            dateMap.set(date, { value, key: session.key || "" });
          }
        });
        return { dateMap, cardio };
      };

      const renderSummary = ({ values, trend, records, unit }) => {
        if (!summaryEl) return;
        const lastIndex = values.length - 1;
        const parts = [`Última: ${formatChartNumber(values[lastIndex])}${unit}`];
        const baseIndex = lastIndex - TREND_COMPARE_SESSIONS;
        if (baseIndex >= 0) {
          const change = trend[lastIndex] - trend[baseIndex];
          const sign = change > 0 ? "+" : change < 0 ? "−" : "±";
          parts.push(`tendencia ${sign}${formatChartNumber(Math.abs(change))}${unit} en ${TREND_COMPARE_SESSIONS} sesiones`);
        }
        if (records > 0) parts.push(`${records} ${records === 1 ? "récord" : "récords"} (punto grande)`);
        summaryEl.textContent = parts.join(" · ");
        summaryEl.classList.remove("is-hidden");
      };

      const clearChart = () => {
        setHidden(noDataMsgEl, false);
        if (chartInstance) chartInstance.destroy();
        chartInstance = null;
        chartPoints = [];
        setSelectedPoint(null);
        summaryEl?.classList.add("is-hidden");
      };

      const renderChart = (exerciseName, mode = currentMode) => {
        if (!canvasEl) return;
        const sessions = getHistorySessions()
          .slice()
          .sort((a, b) => String(a?.date || "").localeCompare(String(b?.date || "")));
        const isBodyWeight = exerciseName === BODY_WEIGHT_KEY;
        if (metricButtonsEl) metricButtonsEl.hidden = isBodyWeight;

        let shownMode = mode;
        let { dateMap, cardio } = collectDailyValues(exerciseName, shownMode, sessions);
        // El cardio no tiene 1RM ni volumen en kg: se muestra su intensidad máxima
        if (!dateMap.size && !isBodyWeight && shownMode !== METRIC_MODES.maxWeight) {
          shownMode = METRIC_MODES.maxWeight;
          ({ dateMap, cardio } = collectDailyValues(exerciseName, shownMode, sessions));
        }
        populateMetricButtons(shownMode);

        const sortedDates = Array.from(dateMap.keys()).sort();
        if (!sortedDates.length) {
          clearChart();
          return;
        }
        setHidden(noDataMsgEl, true);
        chartPoints = sortedDates.map(date => ({ date, key: dateMap.get(date)?.key || "" }));

        const values = sortedDates.map(date => dateMap.get(date).value);
        const trend = getTrendValues(values);
        let best = -Infinity;
        const isRecord = values.map((value, index) => {
          const record = !isBodyWeight && index > 0 && value > best;
          best = Math.max(best, value);
          return record;
        });
        const unit = cardio && !isBodyWeight ? "" : " kg";
        renderSummary({ values, trend, records: isRecord.filter(Boolean).length, unit });

        const datasetLabel = isBodyWeight ? tChart("chart.option.bodyWeight") : getMetricLabel(shownMode);
        const accent = "#f97316";
        const datasets = [
          {
            label: datasetLabel,
            data: values,
            borderColor: accent,
            backgroundColor: accent,
            borderWidth: 2,
            fill: false,
            tension: 0,
            pointRadius: isRecord.map(record => (record ? 5 : 3)),
            pointBackgroundColor: isRecord.map(record => (record ? accent : "transparent")),
            pointBorderColor: accent,
            pointHoverRadius: 7,
            pointHitRadius: 16,
            yAxisID: "y"
          },
          {
            label: tChart("chart.metric.trend"),
            data: trend,
            borderColor: "#2563eb",
            backgroundColor: "#2563eb",
            borderDash: [6, 4],
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius: 0,
            pointHitRadius: 0,
            spanGaps: true,
            yAxisID: "y"
          }
        ];

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(canvasEl, {
          type: "line",
          data: {
            labels: sortedDates.map(formatChartAxisDate),
            datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            onClick: (_event, activeElements) => {
              if (!activeElements?.length) return;
              const index = activeElements[0]?.index;
              setSelectedPoint(chartPoints[index]);
            },
            onHover: (event, activeElements) => {
              if (event?.native?.target) {
                event.native.target.style.cursor = activeElements?.length ? "pointer" : "default";
              }
            },
            interaction: {
              mode: "index",
              intersect: false
            },
            plugins: {
              legend: {
                display: true,
                position: "bottom",
                labels: { boxWidth: 14, boxHeight: 2, font: { size: 12 } }
              },
              tooltip: {
                callbacks: {
                  title: items => formatChartPointDate(chartPoints[items[0]?.dataIndex]?.date),
                  label: item => `${item.dataset.label}: ${formatChartNumber(item.parsed.y)}${unit}`
                }
              }
            },
            scales: {
              x: {
                ticks: { font: { size: 12 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 5 },
                grid: { display: false }
              },
              y: {
                beginAtZero: false,
                grace: "10%",
                ticks: {
                  font: { size: 12 },
                  maxTicksLimit: 6,
                  callback: value => formatChartNumber(value)
                }
              }
            }
          }
        });
      };

      const populateMetricButtons = (activeMode = currentMode) => {
        if (!metricButtonsEl) return;
        metricButtonsEl.innerHTML = "";
        const options = [
          [METRIC_MODES.performance, "1RM est."],
          [METRIC_MODES.maxWeight, "Peso máx."],
          [METRIC_MODES.volume, "Volumen"]
        ];
        options.forEach(([value, label]) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `chart-metric-btn${value === activeMode ? " active" : ""}`;
          btn.setAttribute("aria-pressed", value === activeMode ? "true" : "false");
          btn.textContent = label;
          btn.addEventListener("click", () => {
            currentMode = value;
            if (selectEl?.value) renderChart(selectEl.value, currentMode);
            else populateMetricButtons();
          });
          metricButtonsEl.appendChild(btn);
        });
      };

      const loadExercises = () => {
        if (!selectEl) return;
        const previousValue = selectEl.value || "";
        setSelectedPoint(null);
        const sessions = getHistorySessions()
          .slice()
          .sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));
        const simpleFilterEnabled = simpleFilterControl && !simpleFilterControl.checked;
        const recentExerciseCounts = simpleFilterEnabled ? getRecentExerciseCounts(sessions) : new Map();
        const allExerciseNames = getExerciseNames();
        const frequentNames = allExerciseNames.filter(name => (
          !simpleFilterEnabled || (recentExerciseCounts.get(name) || 0) > 2
        ));
        // Con pocos entrenos ningún ejercicio es "frecuente": mejor mostrarlos todos que un selector vacío
        const exercises = new Set(frequentNames.length ? frequentNames : allExerciseNames);

        const maxByExercise = new Map();
        sessions.forEach((session, sessionIndex) => {
          const exercisesList = getSessionExercises(session);
          exercisesList.forEach(ex => {
            if (isWarmup(ex)) return;
            const name = getExerciseName(ex);
            const sets = getExerciseSets(ex);
            if (!name || !sets.length || !exercises.has(name)) return;
            const bodyWeight = getNearestBodyWeightValue(sessions, sessionIndex);
            const maxWeight = getMaxWeightFromSets(sets, ex, bodyWeight);
            if (maxWeight == null) return;
            const current = maxByExercise.get(name);
            if (current == null || maxWeight > current) {
              maxByExercise.set(name, maxWeight);
            }
          });
        });

        let hasBodyWeight = false;
        if (allowBodyWeight) {
          const bodyWeightByDate = new Map();
          sessions.forEach(session => {
            const date = session?.date;
            if (!date) return;
            const weight = getBodyWeightValue(session);
            if (weight == null) return;
            bodyWeightByDate.set(date, weight);
          });
          hasBodyWeight = bodyWeightByDate.size > 0;
        }

        selectEl.innerHTML = "";
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.disabled = true;
        placeholder.selected = true;
        placeholder.textContent = tChart("placeholder.selectExercise");
        selectEl.appendChild(placeholder);

        if (hasBodyWeight) {
          const opt = document.createElement("option");
          opt.value = BODY_WEIGHT_KEY;
          opt.textContent = tChart("chart.option.bodyWeight");
          selectEl.appendChild(opt);
        }

        Array.from(exercises)
          .sort((a, b) => a.localeCompare(b, getChartLocale()))
          .forEach(name => {
            const opt = document.createElement("option");
            opt.value = name;
            const maxValue = maxByExercise.get(name);
            opt.textContent = maxValue != null ? `${name} · ${maxValue} kg` : name;
            selectEl.appendChild(opt);
          });

        populateMetricButtons();

        const hasOptions = exercises.size > 0 || hasBodyWeight;
        selectEl.disabled = !hasOptions;
        if (!hasOptions) {
          clearChart();
          return;
        }

        let defaultValue = (previousValue === BODY_WEIGHT_KEY && hasBodyWeight) || Array.from(exercises).includes(previousValue)
          ? previousValue
          : Array.from(exercises)[0] || "";
        if (!defaultValue && hasBodyWeight) defaultValue = BODY_WEIGHT_KEY;
        if (defaultValue) {
          selectEl.value = defaultValue;
          renderChart(defaultValue, currentMode);
        }
      };

      if (selectEl) {
        selectEl.addEventListener("change", () => {
          if (selectEl.value) renderChart(selectEl.value, currentMode);
        });
      }
      if (simpleFilterControl) {
        simpleFilterControl.addEventListener("change", loadExercises);
      }
      if (openSessionButton) {
        openSessionButton.addEventListener("click", () => {
          openHistorySessionFromChart(selectedPoint);
        });
      }

      return { loadExercises };
    };

    const sessionCharts = createChartSection({
      selectEl: chartExerciseSelect,
      metricButtonsEl: chartMetricButtons,
      canvasEl: chartCanvas,
      noDataMsgEl: chartNoDataMsg,
      summaryEl: document.getElementById("chart-summary"),
      allowBodyWeight: false,
      getExerciseNames: getCurrentSessionExerciseNames
    });

    const globalCharts = createChartSection({
      selectEl: globalChartExerciseSelect,
      metricButtonsEl: globalChartMetricButtons,
      canvasEl: globalChartCanvas,
      noDataMsgEl: globalChartNoDataMsg,
      summaryEl: document.getElementById("global-chart-summary"),
      allowBodyWeight: true,
      getExerciseNames: getAllHistoryExerciseNames,
      simpleFilterControl: globalChartShowAll,
      openSessionButton: globalChartOpenSession,
      selectedSessionLabel: globalChartSelectedSession
    });

    const loadChartExercises = () => {
      if (sessionCharts) sessionCharts.loadExercises();
      if (globalCharts) globalCharts.loadExercises();
    };

    loadChartExercises();
    window.loadChartExercises = loadChartExercises;
  })();

  function attachWelcomeFallbacks() {
    if (window.__gymAppReady) return;
    const setFallbackStep = (stepId) => {
      const steps = Array.from(document.querySelectorAll(".step-page"));
      steps.forEach(step => {
        const isTarget = step.id === stepId;
        step.classList.toggle("active", isTarget);
        step.setAttribute("aria-hidden", isTarget ? "false" : "true");
        if ("open" in step) step.open = isTarget;
      });
      const target = document.getElementById(stepId);
      if (target) {
        target.scrollIntoView({ block: "start" });
      }
    };

    const startBtn = document.getElementById("welcome-start-btn");
    const infoBtn = document.getElementById("welcome-info-btn");
    const legalBtn = document.getElementById("welcome-legal-btn");
    const infoPanel = document.getElementById("welcome-info");
    const legalPanel = document.getElementById("welcome-legal");

    if (startBtn) {
      startBtn.addEventListener("click", () => setFallbackStep("step-1"));
    }
    if (infoBtn && infoPanel) {
      infoBtn.addEventListener("click", () => {
        if (window.__gymAppReady) return;
        const isHidden = infoPanel.classList.contains("is-hidden") || getComputedStyle(infoPanel).display === "none";
        setHidden(infoPanel, !isHidden);
        if (isHidden) infoPanel.scrollIntoView({ block: "start" });
      });
    }
    if (legalBtn && legalPanel) {
      legalBtn.addEventListener("click", () => {
        if (window.__gymAppReady) return;
        const isHidden = legalPanel.classList.contains("is-hidden") || getComputedStyle(legalPanel).display === "none";
        setHidden(legalPanel, !isHidden);
        if (isHidden) legalPanel.scrollIntoView({ block: "start" });
      });
    }
  }

  const attachFallbacksAfterData = () => {
    Promise.resolve(window.exerciseDataReady).finally(attachWelcomeFallbacks);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachFallbacksAfterData);
  } else {
    attachFallbacksAfterData();
  }
