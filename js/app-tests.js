/* SPDX-License-Identifier: GPL-3.0-or-later · Copyright (C) 2026 Borja Aguado */
// Pestaña Tests: graba los sensores del móvil durante dominadas o Pallof y muestra el resultado
(() => {
  const elements = {
    typeButtons: Array.from(document.querySelectorAll("[data-test-type]")),
    sideGroup: document.getElementById("tests-side"),
    sideButtons: Array.from(document.querySelectorAll("[data-test-side]")),
    instructions: document.getElementById("tests-instructions"),
    duration: document.getElementById("tests-duration"),
    startBtn: document.getElementById("tests-start-btn"),
    status: document.getElementById("tests-status"),
    result: document.getElementById("tests-result"),
    resultTitle: document.getElementById("tests-result-title"),
    stats: document.getElementById("tests-stats"),
    canvas: document.getElementById("tests-chart"),
    reps: document.getElementById("tests-reps"),
    exportBtn: document.getElementById("tests-export-btn"),
    deleteBtn: document.getElementById("tests-delete-btn"),
    history: document.getElementById("tests-history"),
    historyEmpty: document.getElementById("tests-history-empty"),
    tabBar: document.getElementById("tab-bar")
  };
  if (!elements.startBtn) return;

  const TESTS = {
    pullups: {
      label: "Dominadas",
      countdown: 5,
      durations: [30, 45, 60],
      // Al parar a mano se descarta el final: es el momento de sacar el móvil del bolsillo
      trimSeconds: 1.5,
      instructions: "Guarda el móvil en un bolsillo ajustado o en la cintura, con la pantalla encendida. Pulsa Empezar: tienes 5 s para guardarlo y colgarte. Quédate quieto colgado un momento antes de la primera repetición y al acabar."
    },
    pallof: {
      label: "Pallof",
      countdown: 3,
      durations: [10, 20, 30],
      trimSeconds: 1,
      instructions: "Sujeta el móvil entre las manos, pegado al agarre. Pulsa Empezar, colócate en 3 s y extiende los brazos al oír el pitido. Aguanta sin dejar que las manos giren; la medición se para sola."
    }
  };
  const MAX_SAVED_TESTS = 50;
  const ACCENT = "#f97316";

  let testType = "pullups";
  let side = "izquierda";
  let phase = "idle";
  let samples = [];
  let timers = [];
  let wakeLock = null;
  let audioContext = null;
  let chart = null;
  let shownTest = null;
  let lastRecording = null;

  const storageKey = () => (typeof currentUserKey === "string" && currentUserKey ? `gym_tests_v1_${currentUserKey}` : "");

  const loadTests = () => {
    const key = storageKey();
    const parsed = key ? readStorageJSON(key, []) : [];
    return Array.isArray(parsed) ? parsed : [];
  };

  const saveTests = tests => {
    const key = storageKey();
    if (key) writeStorageJSON(key, tests.slice(-MAX_SAVED_TESTS));
  };

  const formatNumber = (value, digits = 1) => (
    Number.isFinite(value) ? value.toLocaleString("es-ES", { maximumFractionDigits: digits, minimumFractionDigits: digits }) : "—"
  );

  const formatDate = iso => new Date(iso).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  const setStatus = text => {
    elements.status.textContent = text;
  };

  const setSegment = (buttons, attribute, value) => {
    buttons.forEach(button => {
      const active = button.dataset[attribute] === value;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  const renderControls = () => {
    const config = TESTS[testType];
    setSegment(elements.typeButtons, "testType", testType);
    setSegment(elements.sideButtons, "testSide", side);
    elements.sideGroup.hidden = testType !== "pallof";
    elements.instructions.textContent = config.instructions;
    const previous = Number(elements.duration.value);
    elements.duration.replaceChildren(...config.durations.map(seconds => {
      const option = document.createElement("option");
      option.value = String(seconds);
      option.textContent = `${seconds} s`;
      return option;
    }));
    elements.duration.value = String(config.durations.includes(previous) ? previous : config.durations[1]);
    const busy = phase !== "idle";
    elements.typeButtons.concat(elements.sideButtons).forEach(button => { button.disabled = busy; });
    elements.duration.disabled = busy;
    elements.startBtn.textContent = phase === "countdown" ? "Cancelar" : phase === "recording" ? "Parar" : "Empezar";
  };

  // --- Señales: pitido y vibración para no tener que mirar la pantalla ---
  const beep = (count = 1) => {
    navigator.vibrate?.(count > 1 ? [150, 100, 150] : 200);
    if (!audioContext) return;
    for (let index = 0; index < count; index += 1) {
      const start = audioContext.currentTime + index * 0.25;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0.2;
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.15);
    }
  };

  const onMotion = event => {
    const gravity = event.accelerationIncludingGravity;
    if (!gravity || !Number.isFinite(gravity.x)) return;
    const rotation = event.rotationRate || {};
    samples.push({
      t: event.timeStamp / 1000,
      ax: gravity.x,
      ay: gravity.y,
      az: gravity.z,
      gx: rotation.beta ?? 0,
      gy: rotation.gamma ?? 0,
      gz: rotation.alpha ?? 0
    });
  };

  const clearTimers = () => {
    timers.forEach(timer => clearTimeout(timer));
    timers = [];
  };

  const releaseResources = () => {
    window.removeEventListener("devicemotion", onMotion);
    clearTimers();
    wakeLock?.release?.().catch(() => {});
    wakeLock = null;
  };

  const cancel = message => {
    if (phase === "idle") return;
    releaseResources();
    phase = "idle";
    samples = [];
    setStatus(message || "Test cancelado.");
    renderControls();
  };

  const finish = manual => {
    if (phase !== "recording") return;
    releaseResources();
    phase = "idle";
    beep(2);
    const config = TESTS[testType];
    let recorded = samples;
    samples = [];
    if (manual && recorded.length) {
      const cutoff = recorded[recorded.length - 1].t - config.trimSeconds;
      recorded = recorded.filter(sample => sample.t <= cutoff);
    }
    renderControls();
    const duration = recorded.length ? recorded[recorded.length - 1].t - recorded[0].t : 0;
    if (duration < 2) {
      setStatus("La medición es demasiado corta. Inténtalo de nuevo.");
      return;
    }
    const analysis = testType === "pullups"
      ? GymSensors.analyzePullups(recorded)
      : GymSensors.analyzePallof(recorded);
    if (!analysis) {
      setStatus("No se pudieron analizar los datos. Inténtalo de nuevo.");
      return;
    }
    const test = buildTest(analysis, recorded.length / duration);
    lastRecording = { id: test.id, samples: recorded };
    const tests = loadTests();
    tests.push(test);
    saveTests(tests);
    setStatus(testType === "pullups" && !test.reps.length
      ? "No se han detectado repeticiones. Revisa que el móvil vaya bien sujeto y quédate quieto al empezar y al acabar."
      : "Test guardado.");
    showTest(test);
    renderHistory();
  };

  const buildTest = (analysis, sampleRate) => {
    const base = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      type: testType,
      duration: analysis.duration,
      sampleRate,
      series: GymSensors.downsample(analysis.series)
    };
    if (testType === "pallof") {
      return {
        ...base,
        side,
        rotationRms: analysis.rotationRms,
        maxDeviation: analysis.maxDeviation,
        deviationRms: analysis.deviationRms,
        linearRms: analysis.linearRms
      };
    }
    return {
      ...base,
      romMean: analysis.romMean,
      romSd: analysis.romSd,
      meanVelocity: analysis.meanVelocity,
      reps: analysis.reps.map(rep => ({
        rom: rep.rom,
        duration: rep.duration,
        meanVelocity: rep.meanVelocity,
        peakVelocity: rep.peakVelocity,
        highTime: rep.highTime
      }))
    };
  };

  const startRecording = () => {
    phase = "recording";
    samples = [];
    renderControls();
    beep(1);
    setStatus("Grabando…");
    window.addEventListener("devicemotion", onMotion);
    const seconds = Number(elements.duration.value) || TESTS[testType].durations[1];
    timers.push(setTimeout(() => {
      if (phase === "recording" && !samples.length) {
        cancel("Este dispositivo no envía datos de movimiento. Usa un móvil con acelerómetro y giroscopio.");
      }
    }, 1500));
    timers.push(setTimeout(() => finish(false), seconds * 1000));
  };

  const start = async () => {
    if (phase === "countdown") {
      cancel();
      return;
    }
    if (phase === "recording") {
      finish(true);
      return;
    }
    if (typeof DeviceMotionEvent === "undefined") {
      setStatus("Este navegador no da acceso a los sensores de movimiento.");
      return;
    }
    // iOS pide permiso, y solo se puede pedir desde un toque
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== "granted") {
          setStatus("Sin permiso para usar los sensores de movimiento.");
          return;
        }
      } catch (error) {
        setStatus("No se pudo pedir permiso para los sensores de movimiento.");
        return;
      }
    }
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume?.();
    } catch (error) {
      audioContext = null;
    }
    try {
      wakeLock = await navigator.wakeLock?.request("screen");
    } catch (error) {
      wakeLock = null;
    }
    phase = "countdown";
    renderControls();
    const countdown = TESTS[testType].countdown;
    for (let remaining = countdown; remaining > 0; remaining -= 1) {
      timers.push(setTimeout(() => setStatus(`Empieza en ${remaining}…`), (countdown - remaining) * 1000));
    }
    timers.push(setTimeout(startRecording, countdown * 1000));
  };

  // --- Resultado ---
  const addStat = (label, value) => {
    const item = document.createElement("div");
    item.className = "tests-stat";
    const name = document.createElement("span");
    name.textContent = label;
    const number = document.createElement("strong");
    number.textContent = value;
    item.append(name, number);
    elements.stats.appendChild(item);
  };

  const describeTest = test => (test.type === "pallof"
    ? `Pallof (${test.side === "derecha" ? "der." : "izq."}) · ${formatNumber(test.rotationRms)} °/s · máx. ${formatNumber(test.maxDeviation)}°`
    : `Dominadas · ${test.reps.length} reps · ${formatNumber(test.romMean != null ? test.romMean * 100 : null, 0)} cm`);

  const renderChart = test => {
    if (chart) chart.destroy();
    const isPullups = test.type === "pullups";
    const scale = isPullups ? 100 : 1;
    const points = test.series.t.map((time, index) => ({ x: time, y: test.series.value[index] * scale }));
    const datasets = [{
      label: isPullups ? "Altura (cm)" : "Desviación de las manos (°)",
      data: points,
      borderColor: ACCENT,
      backgroundColor: ACCENT,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0
    }];
    if (isPullups && test.reps.length) {
      datasets.push({
        label: "Repetición",
        data: test.reps.map(rep => {
          const index = test.series.t.findIndex(time => time >= rep.highTime);
          return { x: rep.highTime, y: (test.series.value[index >= 0 ? index : test.series.t.length - 1]) * scale };
        }),
        showLine: false,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        pointRadius: 5
      });
    }
    chart = new Chart(elements.canvas, {
      type: "line",
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 14, boxHeight: 2, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              title: items => `${formatNumber(items[0]?.parsed.x)} s`,
              label: item => `${item.dataset.label}: ${formatNumber(item.parsed.y)}`
            }
          }
        },
        scales: {
          x: {
            type: "linear",
            ticks: { font: { size: 12 }, maxTicksLimit: 6, callback: value => `${value} s` },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { font: { size: 12 }, maxTicksLimit: 6 }
          }
        }
      }
    });
  };

  const showTest = test => {
    shownTest = test;
    elements.result.classList.remove("is-hidden");
    elements.resultTitle.textContent = `${test.type === "pallof" ? "Pallof" : "Dominadas"} · ${formatDate(test.date)}`;
    elements.stats.replaceChildren();
    elements.reps.replaceChildren();
    if (test.type === "pallof") {
      addStat("Lado", test.side === "derecha" ? "Derecha" : "Izquierda");
      addStat("Duración", `${formatNumber(test.duration)} s`);
      addStat("Giro de las manos", `${formatNumber(test.rotationRms)} °/s`);
      addStat("Desviación máxima", `${formatNumber(test.maxDeviation)}°`);
      addStat("Desviación media", `${formatNumber(test.deviationRms)}°`);
      addStat("Movimiento lineal", `${formatNumber(test.linearRms, 2)} m/s²`);
    } else {
      addStat("Repeticiones", String(test.reps.length));
      addStat("Recorrido medio", test.romMean != null ? `${formatNumber(test.romMean * 100, 0)} cm` : "—");
      addStat("Variación", test.romSd != null ? `± ${formatNumber(test.romSd * 100, 0)} cm` : "—");
      addStat("Velocidad de subida", test.meanVelocity != null ? `${formatNumber(test.meanVelocity, 2)} m/s` : "—");
      test.reps.forEach(rep => {
        const item = document.createElement("li");
        item.textContent = `${formatNumber(rep.rom * 100, 0)} cm · ${formatNumber(rep.meanVelocity, 2)} m/s · ${formatNumber(rep.duration)} s`;
        elements.reps.appendChild(item);
      });
    }
    elements.reps.hidden = !elements.reps.children.length;
    // Los datos completos solo existen para la última grabación; lo guardado está reducido
    elements.exportBtn.hidden = lastRecording?.id !== test.id;
    renderChart(test);
  };

  const exportCsv = () => {
    if (!lastRecording || lastRecording.id !== shownTest?.id) return;
    const t0 = lastRecording.samples[0]?.t || 0;
    const rows = ["t_s,ax,ay,az,gx_deg_s,gy_deg_s,gz_deg_s"].concat(lastRecording.samples.map(sample => (
      [sample.t - t0, sample.ax, sample.ay, sample.az, sample.gx, sample.gy, sample.gz]
        .map(value => Number(value).toFixed(4)).join(",")
    )));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `test-${shownTest.type}-${shownTest.date.slice(0, 19).replace(/[:T]/g, "-")}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const deleteShownTest = () => {
    if (!shownTest || !confirm("¿Eliminar este test?")) return;
    saveTests(loadTests().filter(test => test.id !== shownTest.id));
    shownTest = null;
    if (chart) chart.destroy();
    chart = null;
    elements.result.classList.add("is-hidden");
    setStatus("");
    renderHistory();
  };

  const renderHistory = () => {
    const tests = loadTests().slice().reverse();
    elements.history.replaceChildren(...tests.map(test => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tests-history-item";
      const date = document.createElement("span");
      date.className = "tests-history-date";
      date.textContent = formatDate(test.date);
      const text = document.createElement("span");
      text.textContent = describeTest(test);
      button.append(date, text);
      button.addEventListener("click", () => {
        showTest(test);
        elements.result.scrollIntoView({ block: "start" });
      });
      return button;
    }));
    elements.historyEmpty.classList.toggle("is-hidden", tests.length > 0);
  };

  // Al volver a la pestaña o cambiar de usuario se recarga lo guardado
  const render = () => {
    if (phase === "idle") {
      renderControls();
      if (shownTest && !loadTests().some(test => test.id === shownTest.id)) {
        shownTest = null;
        elements.result.classList.add("is-hidden");
      }
    }
    renderHistory();
  };

  elements.typeButtons.forEach(button => button.addEventListener("click", () => {
    testType = button.dataset.testType;
    setStatus("");
    renderControls();
  }));
  elements.sideButtons.forEach(button => button.addEventListener("click", () => {
    side = button.dataset.testSide;
    renderControls();
  }));
  elements.startBtn.addEventListener("click", start);
  elements.exportBtn.addEventListener("click", exportCsv);
  elements.deleteBtn.addEventListener("click", deleteShownTest);
  // Salir de la pestaña o de la app durante un test lo cancela
  elements.tabBar?.addEventListener("click", event => {
    if (event.target.closest("[data-tab]")?.dataset.tab !== "tests") cancel();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancel("Test cancelado: la app pasó a segundo plano.");
  });

  window.renderGymTests = render;
  render();
})();
