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
