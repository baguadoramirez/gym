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
    const BODY_WEIGHT_KEY = "__body_weight__";
    const setHidden = (element, isHidden) => {
      if (!element) return;
      element.classList.toggle("is-hidden", isHidden);
      element.style.display = isHidden ? "none" : "block";
    };
    const METRIC_MODES = {
      meanWeight: "meanWeight",
      maxWeight: "maxWeight",
      meanVolume: "meanVolume"
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

    const getSessionExercises = (session) => {
      if (!session || typeof session !== "object") return [];
      if (Array.isArray(session.exercises)) return session.exercises;
      if (Array.isArray(session.ejercicios)) return session.ejercicios;
      return [];
    };

    const getBodyWeightValue = (session) => {
      const raw = session?.sensations?.weight ?? session?.sensations?.peso ?? session?.sensations?.pes;
      const value = parseFloat(raw);
      return Number.isNaN(value) ? null : value;
    };

    const getSetWeightValue = (set) => parseFloat(set?.peso ?? set?.weight ?? set?.intensidad);
    const getSetRepsValue = (set) => parseFloat(set?.reps ?? set?.repeticiones ?? set?.tiempo ?? set?.time);

    const getMeanWeightFromSets = (sets) => {
      if (!Array.isArray(sets) || !sets.length) return null;
      const values = sets.map(set => getSetWeightValue(set)).filter(value => Number.isFinite(value));
      if (!values.length) return null;
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    };

    const getMaxWeightFromSets = (sets) => {
      if (!Array.isArray(sets) || !sets.length) return null;
      const values = sets.map(set => getSetWeightValue(set)).filter(value => Number.isFinite(value));
      if (!values.length) return null;
      return Math.max(...values);
    };

    const getVolumeFromSets = (sets) => {
      if (!Array.isArray(sets) || !sets.length) return null;
      const volumes = sets
        .map(set => {
          const peso = getSetWeightValue(set);
          const reps = getSetRepsValue(set);
          return Number.isFinite(peso) && Number.isFinite(reps) && reps > 0
            ? peso * reps
            : null;
        })
        .filter(value => value != null);

      if (!volumes.length) return null;
      return volumes.reduce((sum, value) => sum + value, 0) / volumes.length;
    };

    const getTrendValues = (values) => {
      let previous = null;
      return values.map(value => {
        if (!Number.isFinite(value)) return null;
        previous = previous == null
          ? value
          : (TREND_ALPHA * value) + ((1 - TREND_ALPHA) * previous);
        return previous;
      });
    };

    const getCurrentSessionExerciseNames = () => (
      Array.from(document.querySelectorAll("#exercises-container .exercise-card .exercise-title"))
        .map(el => el.textContent.trim())
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
          const name = getExerciseName(ex);
          if (name) names.add(name);
        });
      });
      return Array.from(names);
    };

    const createChartSection = ({ selectEl, metricButtonsEl, canvasEl, noDataMsgEl, allowBodyWeight, getExerciseNames }) => {
      let chartInstance;
      let currentMode = METRIC_MODES.maxWeight;

      const getMetricLabel = (mode) => {
        if (mode === METRIC_MODES.meanWeight) return tChart("chart.metric.meanWeight");
        if (mode === METRIC_MODES.meanVolume) return tChart("chart.metric.meanVolume");
        return tChart("chart.metric.maxWeight");
      };

      const getMetricValue = (mode, metrics) => {
        if (mode === METRIC_MODES.meanWeight) return metrics.meanWeight;
        if (mode === METRIC_MODES.meanVolume) return metrics.volume;
        return metrics.maxWeight;
      };

      const renderChart = (exerciseName, mode = currentMode) => {
        if (!canvasEl) return;
        const sessions = getHistorySessions();
        const dateMap = new Map();
        const isBodyWeight = exerciseName === BODY_WEIGHT_KEY;

        sessions.forEach(session => {
          const date = session?.date;
          if (!date) return;

          if (isBodyWeight) {
            const weight = getBodyWeightValue(session);
            if (weight == null) return;
            dateMap.set(date, { value: weight, count: 1 });
            return;
          }

          const exercises = getSessionExercises(session);
          const ex = exercises.find(item => getExerciseName(item) === exerciseName);
          if (!ex || !Array.isArray(ex.sets)) return;

          const metrics = {
            meanWeight: getMeanWeightFromSets(ex.sets),
            maxWeight: getMaxWeightFromSets(ex.sets),
            volume: getVolumeFromSets(ex.sets)
          };

          const value = getMetricValue(mode, metrics);
          if (value == null) return;

          const current = dateMap.get(date) || { meanWeightSum: 0, meanWeightCount: 0, maxWeight: null, volumeSum: 0, volumeCount: 0 };
          if (mode === METRIC_MODES.meanWeight) {
            current.meanWeightSum += value;
            current.meanWeightCount += 1;
          } else if (mode === METRIC_MODES.maxWeight) {
            current.maxWeight = current.maxWeight == null ? value : Math.max(current.maxWeight, value);
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
          return;
        }
        setHidden(noDataMsgEl, true);

        const labels = sortedDates.map(date => new Date(date).toLocaleDateString(getChartLocale()));
        const values = sortedDates.map(date => {
          const current = dateMap.get(date);
          if (isBodyWeight) return current?.value ?? null;
          if (mode === METRIC_MODES.meanWeight) return current?.meanWeightCount ? current.meanWeightSum / current.meanWeightCount : null;
          if (mode === METRIC_MODES.meanVolume) return current?.volumeCount ? current.volumeSum / current.volumeCount : null;
          return current?.maxWeight ?? null;
        });
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
          : (mode === METRIC_MODES.meanVolume ? tChart("chart.axis.load") : tChart("chart.axis.weight"));

        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(canvasEl, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: datasetLabel,
                data: values,
                borderColor: "#f97316",
                backgroundColor: "#f9731620",
                fill: false,
                tension: 0.25,
                pointRadius: 4
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
                spanGaps: true
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false }
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
              }
            }
          }
        });
      };

      const populateMetricButtons = () => {
        if (!metricButtonsEl) return;
        metricButtonsEl.innerHTML = "";
        const options = [
          [METRIC_MODES.meanWeight, tChart("chart.metric.meanWeight")],
          [METRIC_MODES.maxWeight, tChart("chart.metric.maxWeight")],
          [METRIC_MODES.meanVolume, tChart("chart.metric.meanVolume")]
        ];
        options.forEach(([value, label]) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `chart-metric-btn${value === currentMode ? " active" : ""}`;
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
        const sessions = getHistorySessions();
        const exercises = new Set(getExerciseNames());

        const maxByExercise = new Map();
        sessions.forEach(session => {
          const exercisesList = getSessionExercises(session);
          exercisesList.forEach(ex => {
            const name = getExerciseName(ex);
            if (!name || !Array.isArray(ex.sets) || !exercises.has(name)) return;
            const maxWeight = getMaxWeightFromSets(ex.sets);
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
          return;
        }

        let defaultValue = Array.from(exercises)[0] || "";
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
      getExerciseNames: getAllHistoryExerciseNames
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
