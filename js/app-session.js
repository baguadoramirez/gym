function buildSessionData(container) {
  if (!currentUserKey) return null;
  const root = container || exercisesContainer || mainExercisesContainer || document;
  const cards = root.querySelectorAll(".exercise-card");
  
  // Capturamos el valor antes de la posible reconstrucción del select.
  const selectedPainExercise = painExerciseSelect.value; 

  const data = {
    date: dateInput.value,
    week: weekSelect.value,
    day: daySelect.value,
    exercises: [],
    
    // SENSACIONES
    sensations: {
      general: senseGeneralInput.value,
      tiredness: senseTirednessInput.value,
      weight: senseWeightInput?.value || "",
      pain: sensePainSelect.value,
      painZone: painZoneInput.value,
      painExercise: selectedPainExercise,
      comment: senseCommentInput?.value || ""
    },
    user: currentUserName
  };

  cards.forEach(card => {
    const editableName = card.querySelector(".history-exercise-name-input")?.value.trim();
    const name = editableName || card.querySelector(".exercise-title")?.textContent.trim() || "";
    
    let mus = "";
    let sec = "";
    const metaElement = card.querySelector(".exercise-muscle-section");
    if (metaElement) {
        mus = metaElement.getAttribute("data-musculo") || "";
        sec = metaElement.getAttribute("data-seccion") || "";
    }
    
    const tbody = card.querySelector("tbody");
    const rows = tbody ? Array.from(tbody.querySelectorAll("tr")) : [];

    const sets = rows.map(row => {
      const inputs = Array.from(row.querySelectorAll("input"));
      const serieText = row.querySelector("td:first-child")?.textContent || "";
      const setData = { serie: parseInt(serieText, 10) || null };
      inputs.forEach(input => {
        const key = input.dataset.key;
        if (!key) return;
        if (input.type === "checkbox") {
          setData[key] = input.checked;
          return;
        }
        const raw = input.value;
        if (raw === "") {
          setData[key] = null;
          return;
        }
        if (key === "reps" || key === "repsFallo") {
          setData[key] = parseInt(raw, 10) || null;
          return;
        }
        if (key === "peso" || key === "tiempo" || key === "intensidad") {
          const parsed = parseFloat(raw);
          setData[key] = Number.isNaN(parsed) ? null : parsed;
          return;
        }
        setData[key] = raw;
      });
      if ((setData.repsFallo == null || setData.repsFallo === "") && row.dataset.repsFallo) {
        const parsed = parseInt(row.dataset.repsFallo, 10);
        setData.repsFallo = Number.isNaN(parsed) ? null : parsed;
      }
      return setData;
    });

    const exerciseNotes = card.querySelector(".exercise-notes-input")?.value || "";

    data.exercises.push({
      nombre: name,
      musculo: mus,
      seccion: sec,
      calentamiento: card.dataset.calentamiento === "true",
      sets: sets,
      notes: exerciseNotes
    });
  });

  return data;
}

function saveSession(options = {}) {
  if (!currentUserKey) return;
  if (isEditingHistory) return;
  const source = options.source === "manual" ? "manual" : "auto";
  const key = sessionKey();
  const data = buildSessionData(mainExercisesContainer);
  if (!data) return;
  storage.setItem(key, JSON.stringify(data));
  setStatus(t("status.saved"));
  markAutoSaved(source);
  if (typeof updateSessionProgressIndicator === "function") {
    updateSessionProgressIndicator();
  }
  updateSessionSummary();
  
  // 1. Repopulate the list of exercises for the pain selector
  const currentExerciseNames = data.exercises.map(ex => ex.nombre);
  populatePainExerciseSelect(currentExerciseNames); 

  // 2. Restaurar la selección en el DOM (en caso de que la lista haya cambiado)
  painExerciseSelect.value = data.sensations.painExercise; 

  checkSensationsForm();
  updateStepStatus();
  scheduleExercisePagination(false);
  renderUserStatsCharts();
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE AÑADIR EJERCICIO (POR GRUPO)
// -------------------------
