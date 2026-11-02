/* SPDX-License-Identifier: GPL-3.0-or-later · Copyright (C) 2026 Borja Aguado */
(() => {
  const metrics = globalThis.GymMetrics;
  const results = [];

  const test = (name, callback) => {
    try {
      callback();
      results.push({ name, passed: true });
    } catch (error) {
      results.push({ name, passed: false, error: error.message });
    }
  };

  const equal = (actual, expected) => {
    if (actual !== expected) {
      throw new Error(`esperado ${expected}; obtenido ${actual}`);
    }
  };

  const templates = {
    Dominadas: { grupo: "Espalda", cargaCorporal: "sumar" },
    "Dominadas asistidas": { grupo: "Espalda", cargaCorporal: "restar" },
    Correr: { grupo: "Cardio" }
  };

  test("Pesas: suma peso × repeticiones", () => {
    const session = {
      exercises: [{ nombre: "Press", sets: [
        { peso: 20, reps: 10 },
        { peso: 20, reps: 10 },
        { peso: 20, reps: 10 }
      ] }]
    };
    equal(metrics.calculateSessionVolume(session, { templates }), 600);
  });

  test("Peso corporal: utiliza el peso registrado", () => {
    const session = {
      date: "2026-01-10",
      sensations: { weight: 80 },
      exercises: [{ nombre: "Dominadas", sets: [{ peso: null, reps: 10 }] }]
    };
    equal(metrics.calculateSessionVolume(session, { sessions: [session], templates }), 800);
  });

  test("Peso corporal con lastre: suma la carga externa", () => {
    const session = {
      date: "2026-01-10",
      sensations: { weight: 80 },
      exercises: [{ nombre: "Dominadas", sets: [{ peso: 10, reps: 10 }] }]
    };
    equal(metrics.calculateSessionVolume(session, { sessions: [session], templates }), 900);
  });

  test("Ejercicio asistido: resta la asistencia", () => {
    const session = {
      date: "2026-01-10",
      sensations: { weight: 80 },
      exercises: [{ nombre: "Dominadas asistidas", sets: [{ peso: 20, reps: 10 }] }]
    };
    equal(metrics.calculateSessionVolume(session, { sessions: [session], templates }), 600);
  });

  test("Reutiliza el último peso corporal anterior", () => {
    const weightSession = { date: "2026-01-01", sensations: { weight: 75 }, exercises: [] };
    const training = {
      date: "2026-01-08",
      exercises: [{ nombre: "Dominadas", sets: [{ reps: 4 }] }]
    };
    equal(metrics.calculateSessionVolume(training, {
      sessions: [training, weightSession],
      templates
    }), 300);
  });

  test("Excluye las series de calentamiento", () => {
    const session = {
      exercises: [{ nombre: "Press", calentamiento: true, sets: [{ peso: 20, reps: 10 }] }]
    };
    equal(metrics.calculateSessionVolume(session, { templates }), 0);
  });

  test("No mezcla cardio con volumen en kg", () => {
    const session = {
      exercises: [{ nombre: "Correr", sets: [{ tiempo: 30, intensidad: 7 }] }]
    };
    equal(metrics.calculateSessionVolume(session, { templates }), 0);
  });

  test("Los valores vacíos o inválidos no generan NaN", () => {
    const session = {
      exercises: [{ nombre: "Press", sets: [{ peso: "abc", reps: "" }] }]
    };
    const volume = metrics.calculateSessionVolume(session, { templates });
    equal(Number.isNaN(volume), false);
    equal(volume, 0);
  });

  test("Menos asistencia se considera una mejora", () => {
    equal(metrics.isLoadImprovement(15, 20, "restar"), true);
    equal(metrics.isLoadImprovement(25, 20, "restar"), false);
  });

  test("Tendencia: una serie constante no cambia", () => {
    equal(metrics.smoothTrend([50, 50, 50, 50]).join(","), "50,50,50,50");
  });

  test("Tendencia: respeta los huecos sin dato", () => {
    const trend = metrics.smoothTrend([10, null, 20, ""]);
    equal(trend[1], null);
    equal(trend[3], null);
    equal(Number.isFinite(trend[2]), true);
  });

  test("Tendencia: sin retraso, un pico simétrico sigue en su sitio", () => {
    const trend = metrics.smoothTrend([50, 50, 50, 60, 50, 50, 50]);
    equal(trend.indexOf(Math.max(...trend)), 3);
    equal(trend[2].toFixed(6), trend[4].toFixed(6));
  });

  // Señales sintéticas de forma conocida para los tests con sensores
  const sensors = globalThis.GymSensors;
  const synthPullups = ({ rom = 0.5, reps = 3, pauseBottom = 0.6, hz = 60 } = {}) => {
    const segments = [{ still: 1 }];
    for (let rep = 0; rep < reps; rep += 1) {
      segments.push({ move: 1, dir: 1 }, { move: 1.2, dir: -1 });
      if (pauseBottom && rep < reps - 1) segments.push({ still: pauseBottom });
    }
    segments.push({ still: 1 });
    const samples = [];
    let t = 0;
    segments.forEach(segment => {
      const seconds = segment.still || segment.move;
      for (let i = 0; i < Math.round(seconds * hz); i += 1, t += 1 / hz) {
        const a = segment.move
          ? segment.dir * (rom / 2) * (Math.PI / seconds) ** 2 * Math.cos(Math.PI * (i / hz) / seconds)
          : 0;
        // Móvil inclinado: la vertical reparte la aceleración entre los ejes x e y
        samples.push({ t, ax: 0.3 * (9.81 + a), ay: 0.954 * (9.81 + a), az: 0, gx: 0, gy: 0, gz: 0 });
      }
    });
    return samples;
  };

  test("Dominadas: cuenta las repeticiones y mide el recorrido", () => {
    const result = sensors.analyzePullups(synthPullups());
    equal(result.reps.length, 3);
    result.reps.forEach(rep => {
      if (Math.abs(rep.rom - 0.5) > 0.05) throw new Error(`recorrido ${rep.rom.toFixed(3)} m, esperado 0,5 m`);
    });
  });

  test("Dominadas: funciona sin pausas entre repeticiones", () => {
    const result = sensors.analyzePullups(synthPullups({ rom: 0.4, reps: 5, pauseBottom: 0 }));
    equal(result.reps.length, 5);
    if (Math.abs(result.romMean - 0.4) > 0.05) throw new Error(`recorrido medio ${result.romMean.toFixed(3)} m`);
  });

  test("Pallof: mide el giro de las manos y descarta el sesgo del giroscopio", () => {
    const samples = Array.from({ length: 600 }, (_, i) => {
      const t = i / 60;
      return { t, ax: 0, ay: 9.81, az: 0, gx: 0, gy: 0, gz: 3 + 5 * Math.PI * Math.cos(Math.PI * t) };
    });
    const result = sensors.analyzePallof(samples);
    if (Math.abs(result.maxDeviation - 5) > 1) throw new Error(`desviación ${result.maxDeviation.toFixed(2)}°, esperada 5°`);
    const still = sensors.analyzePallof(samples.map(sample => ({ ...sample, gz: 3 })));
    if (still.maxDeviation > 0.01) throw new Error("el sesgo constante no debería contar como giro");
  });

  const list = document.getElementById("results");
  results.forEach(result => {
    const item = document.createElement("li");
    item.className = result.passed ? "pass" : "fail";
    item.textContent = result.passed ? `✓ ${result.name}` : `✗ ${result.name}: ${result.error}`;
    list.appendChild(item);
  });
  const passed = results.filter(result => result.passed).length;
  const summary = document.getElementById("summary");
  summary.textContent = `${passed}/${results.length} pruebas superadas`;
  summary.className = passed === results.length ? "pass" : "fail";
  if (passed !== results.length) throw new Error(summary.textContent);
})();
