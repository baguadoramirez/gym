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
    const METRIC_MODES = {
      meanWeight: "meanWeight",
      maxWeight: "maxWeight",
      meanVolume: "meanVolume",
      performance: "performance"
    };
    const TREND_ALPHA = 0.35;

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

    const getMeanWeightFromSets = (sets, exercise, bodyWeight) => {
      if (!Array.isArray(sets) || !sets.length) return null;
      const values = sets.map(set => getSetWeightValue(set, exercise, bodyWeight)).filter(value => Number.isFinite(value));
      if (!values.length) return null;
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    };

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
      return volumes.reduce((sum, value) => sum + value, 0) / volumes.length;
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

    const getTrendValues = (values) => {
      const smoothForward = values.map(() => null);
      let previousForward = null;
      values.forEach((value, index) => {
        if (!Number.isFinite(value)) return;
        previousForward = previousForward == null
          ? value
          : (TREND_ALPHA * value) + ((1 - TREND_ALPHA) * previousForward);
        smoothForward[index] = previousForward;
      });
      const smoothBackward = values.map(() => null);
      let previousBackward = null;
      for (let index = values.length - 1; index >= 0; index -= 1) {
        const value = values[index];
        if (!Number.isFinite(value)) continue;
        previousBackward = previousBackward == null
          ? value
          : (TREND_ALPHA * value) + ((1 - TREND_ALPHA) * previousBackward);
        smoothBackward[index] = previousBackward;
      }
      return values.map((value, index) => {
        if (!Number.isFinite(value)) return null;
        const forward = smoothForward[index];
        const backward = smoothBackward[index];
        if (!Number.isFinite(forward)) return Number.isFinite(backward) ? backward : null;
        if (!Number.isFinite(backward)) return forward;
        return (forward + backward) / 2;
      });
    };

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

    const createChartSection = ({ selectEl, metricButtonsEl, canvasEl, noDataMsgEl, allowBodyWeight, getExerciseNames, simpleFilterControl, openSessionButton, selectedSessionLabel }) => {
      let chartInstance;
      let currentMode = METRIC_MODES.maxWeight;
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
        if (mode === METRIC_MODES.meanWeight) return tChart("chart.metric.meanWeight");
        if (mode === METRIC_MODES.meanVolume) return tChart("chart.metric.meanVolume");
        if (mode === METRIC_MODES.performance) return tChart("chart.metric.performance");
        return tChart("chart.metric.maxWeight");
      };

      const getMetricValue = (mode, metrics) => {
        if (mode === METRIC_MODES.meanWeight) return metrics.meanWeight;
        if (mode === METRIC_MODES.meanVolume) return metrics.volume;
        if (mode === METRIC_MODES.performance) return metrics.performance;
        return metrics.maxWeight;
      };

      const renderChart = (exerciseName, mode = currentMode) => {
        if (!canvasEl) return;
        const sessions = getHistorySessions()
          .slice()
          .sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));
        const dateMap = new Map();
        const isBodyWeight = exerciseName === BODY_WEIGHT_KEY;

        sessions.forEach((session, sessionIndex) => {
          const date = session?.date;
          if (!date) return;

          if (isBodyWeight) {
            const weight = getBodyWeightValue(session);
            if (weight == null) return;
            dateMap.set(date, { value: weight, count: 1, key: session.key || "" });
            return;
          }

          const exercises = getSessionExercises(session);
          const ex = exercises.find(item => getExerciseName(item) === exerciseName && !isWarmup(item));
          const sets = getExerciseSets(ex);
          if (!ex || !sets.length) return;
          const bodyWeight = getNearestBodyWeightValue(sessions, sessionIndex);

          const metrics = {
            meanWeight: getMeanWeightFromSets(sets, ex, bodyWeight),
            maxWeight: getMaxWeightFromSets(sets, ex, bodyWeight),
            volume: getVolumeFromSets(sets, ex, bodyWeight),
            performance: getPerformanceMetricsFromSets(sets, ex, bodyWeight)
          };

          const value = getMetricValue(mode, metrics);
          if (mode === METRIC_MODES.performance) {
            if (!value || value.best == null) return;
          } else if (value == null) {
            return;
          }

          const current = dateMap.get(date) || { meanWeightSum: 0, meanWeightCount: 0, maxWeight: null, volumeSum: 0, volumeCount: 0, performance: null, retention: null, key: session.key || "" };
          if (mode === METRIC_MODES.meanWeight) {
            current.meanWeightSum += value;
            current.meanWeightCount += 1;
          } else if (mode === METRIC_MODES.maxWeight) {
            current.maxWeight = current.maxWeight == null ? value : Math.max(current.maxWeight, value);
          } else if (mode === METRIC_MODES.performance) {
            if (current.performance == null || value.best > current.performance) {
              current.performance = value.best;
              current.retention = value.retention;
            }
          } else {
            current.volumeSum += value;
            current.volumeCount += 1;
          }
          dateMap.set(date, current);
        });

        const sortedDates = Array.from(dateMap.keys()).sort((a, b) => new Date(a) - new Date(b));
        if (!sortedDates.length) {
          setHidden(noDataMsgEl, false);
          if (chartInstance) chartInstance.destroy();
          chartInstance = null;
          chartPoints = [];
          setSelectedPoint(null);
          return;
        }
        setHidden(noDataMsgEl, true);
        chartPoints = sortedDates.map(date => ({
          date,
          key: dateMap.get(date)?.key || ""
        }));

        const labels = sortedDates.map(date => new Date(date).toLocaleDateString(getChartLocale()));
        const values = sortedDates.map(date => {
          const current = dateMap.get(date);
          if (isBodyWeight) return current?.value ?? null;
          if (mode === METRIC_MODES.meanWeight) return current?.meanWeightCount ? current.meanWeightSum / current.meanWeightCount : null;
          if (mode === METRIC_MODES.meanVolume) return current?.volumeCount ? current.volumeSum / current.volumeCount : null;
          if (mode === METRIC_MODES.performance) return current?.performance ?? null;
          return current?.maxWeight ?? null;
        });
        const retentionValues = mode === METRIC_MODES.performance
          ? sortedDates.map(date => dateMap.get(date)?.retention ?? null)
          : [];
        const trendValues = getTrendValues(values);
        const chartValues = values.concat(trendValues).filter(value => Number.isFinite(value));
        const maxValue = Math.max(...chartValues);
        const minValue = Math.min(...chartValues);
        let yMin = minValue;
        let yMax = maxValue;
        const padding = yMax * 0.1;
        yMin = yMin - padding;
        yMax = yMax + padding;
        if (!Number.isFinite(yMin) || !Number.isFinite(yMax) || yMin >= yMax) {
          yMin = minValue - 1;
          yMax = maxValue + 1;
        }
        const datasetLabel = isBodyWeight
          ? tChart("chart.option.bodyWeight")
          : `${exerciseName} · ${getMetricLabel(mode)}`;
        const yAxisTitle = isBodyWeight
          ? tChart("chart.axis.bodyWeight")
          : (mode === METRIC_MODES.meanVolume
            ? tChart("chart.axis.load")
            : mode === METRIC_MODES.performance
              ? tChart("chart.axis.estimated1rm")
              : tChart("chart.axis.weight"));
        const datasets = [
          {
            label: datasetLabel,
            data: values,
            borderColor: "#f97316",
            backgroundColor: "#f9731620",
            fill: false,
            tension: 0.25,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHitRadius: 16,
            yAxisID: "y"
          },
          {
            label: "Tendencia",
            data: trendValues,
            borderColor: "#2563eb",
            backgroundColor: "transparent",
            borderDash: [6, 4],
            borderWidth: 2,
            fill: false,
            tension: 0.35,
            pointRadius: 0,
            spanGaps: true,
            yAxisID: "y"
          }
        ];
        if (mode === METRIC_MODES.performance) {
          datasets.push({
            label: tChart("chart.metric.retention"),
            data: retentionValues,
            borderColor: "#16a34a",
            backgroundColor: "#16a34a20",
            borderWidth: 2,
            fill: false,
            tension: 0.25,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointHitRadius: 16,
            spanGaps: true,
            yAxisID: "y1"
          });
        }

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(canvasEl, {
          type: "line",
          data: {
            labels,
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
              mode: "nearest",
              intersect: false
            },
            plugins: {
              legend: { display: mode === METRIC_MODES.performance }
            },
            scales: {
              x: {
                title: { display: true, text: tChart("chart.axis.date"), font: { size: 16 } },
                ticks: { font: { size: 14 } }
              },
              y: {
                beginAtZero: false,
                min: yMin,
                max: yMax,
                title: { display: true, text: yAxisTitle, font: { size: 16 } },
                ticks: { font: { size: 14 } }
              },
              ...(mode === METRIC_MODES.performance ? {
                y1: {
                  position: "right",
                  min: 0,
                  max: 105,
                  grid: { drawOnChartArea: false },
                  title: { display: true, text: tChart("chart.metric.retention"), font: { size: 16 } },
                  ticks: {
                    font: { size: 14 },
                    callback: value => `${value}%`
                  }
                }
              } : {})
            }
          }
        });
      };

      const populateMetricButtons = () => {
        if (!metricButtonsEl) return;
        metricButtonsEl.innerHTML = "";
        const options = [
          [METRIC_MODES.meanWeight, "Media"],
          [METRIC_MODES.maxWeight, "Máximo"],
          [METRIC_MODES.meanVolume, "Vol. medio"],
          [METRIC_MODES.performance, "Rendimiento"]
        ];
        options.forEach(([value, label]) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `chart-metric-btn${value === currentMode ? " active" : ""}`;
          btn.setAttribute("aria-pressed", value === currentMode ? "true" : "false");
          btn.textContent = label;
          btn.addEventListener("click", () => {
            currentMode = value;
            populateMetricButtons();
            if (selectEl?.value) renderChart(selectEl.value, currentMode);
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
        const exercises = new Set(
          getExerciseNames().filter(name => (
            !simpleFilterEnabled || (recentExerciseCounts.get(name) || 0) > 2
          ))
        );

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
          setHidden(noDataMsgEl, false);
          if (chartInstance) chartInstance.destroy();
          chartInstance = null;
          setSelectedPoint(null);
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
      allowBodyWeight: false,
      getExerciseNames: getCurrentSessionExerciseNames
    });

    const globalCharts = createChartSection({
      selectEl: globalChartExerciseSelect,
      metricButtonsEl: globalChartMetricButtons,
      canvasEl: globalChartCanvas,
      noDataMsgEl: globalChartNoDataMsg,
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
        target.scrollIntoView({ behavior: "smooth", block: "start" });
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
        if (isHidden) infoPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (legalBtn && legalPanel) {
      legalBtn.addEventListener("click", () => {
        if (window.__gymAppReady) return;
        const isHidden = legalPanel.classList.contains("is-hidden") || getComputedStyle(legalPanel).display === "none";
        setHidden(legalPanel, !isHidden);
        if (isHidden) legalPanel.scrollIntoView({ behavior: "smooth", block: "start" });
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
