/* ==========================================================
   app.js — versión estable y depurada
   Requiere: ejercicios.js + html2canvas + index.html
   ========================================================== */

// Elementos del DOM
const dateInput = document.getElementById("date-input");
const weekSelect = document.getElementById("week-select");
const daySelect = document.getElementById("day-select");

const loadBtn = document.getElementById("load-routine-btn");
const exportBtn = document.getElementById("export-png-btn");

const exercisesContainer = document.getElementById("exercises-container");
const predefinedSelect = document.getElementById("predefined-exercise-select");
const addPredefinedBtn = document.getElementById("add-predefined-btn");
const addCustomBtn = document.getElementById("add-custom-btn");
const statusText = document.getElementById("status-text");

// Fecha inicial
dateInput.value = new Date().toISOString().slice(0, 10);


// -------------------------
// FUNCIONES BASE
// -------------------------

function sessionKey() {
  return `gym_${dateInput.value}_${weekSelect.value}_${daySelect.value}`;
}

function setStatus(msg) {
  statusText.textContent = msg;
  setTimeout(() => {
    if (statusText.textContent === msg) statusText.textContent = "";
  }, 1500);
}


// -------------------------
// CREAR FILAS DE SERIES
// -------------------------

function addSetRow(tbody, setData = {}) {
  const tr = document.createElement("tr");

  const fields = [
    { key: "serie", type: "number", default: tbody.children.length + 1 },
    { key: "peso", type: "number" },
    { key: "reps", type: "number" },
    { key: "fallo", type: "checkbox" },
    { key: "repsFallo", type: "number" },
    { key: "obs", type: "text" }
  ];

  fields.forEach(f => {
    const td = document.createElement("td");
    let input;

    if (f.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = setData[f.key] ?? false;
    } else {
      input = document.createElement("input");
      input.type = f.type;
      input.value = setData[f.key] ?? f.default ?? "";
    }

    input.addEventListener("input", saveSession);
    input.addEventListener("change", saveSession);

    td.appendChild(input);
    tr.appendChild(td);
  });

  tbody.appendChild(tr);
}


// -------------------------
// CREAR UNA TARJETA DE EJERCICIO
// -------------------------

function buildExerciseCard(exData) {
  const card = document.createElement("div");
  card.className = "exercise-card";

  // ====== CABECERA ======
  const header = document.createElement("div");
  header.className = "exercise-header";
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.flexDirection = "column";

  left.innerHTML = `
    <div class="exercise-title" style="font-weight:bold; font-size:1rem;">
      ${exData.nombre}
    </div>

    <div class="exercise-meta" style="font-size:0.8rem; color:var(--meta-text); margin-top:2px;">
      ${exData.musculo} – ${exData.seccion}
    </div>
  `;


  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Eliminar";
  removeBtn.className = "btn-secondary btn-small";
  
  removeBtn.onclick = () => {
    const name = card.querySelector(".exercise-title").textContent.trim();

    // 1. Eliminar visualmente
    card.remove();

    // 2. Obtener clave
    const key = sessionKey();
    const saved = JSON.parse(localStorage.getItem(key) || "null") || {
      date: dateInput.value,
      week: weekSelect.value,
      day: daySelect.value,
      exercises: []
    };

    // 3. Eliminar de la memoria
    saved.exercises = saved.exercises.filter(ex => ex.nombre !== name);

    // 4. Guardar aunque quede vacío
    localStorage.setItem(key, JSON.stringify(saved));

    setStatus("Ejercicio eliminado (fijado en sesión)");
  };

  header.appendChild(left);
  header.appendChild(removeBtn);
  card.appendChild(header);

  // ====== NOTAS TÉCNICAS ======
  const notes = document.createElement("div");
  notes.className = "exercise-notes";
  notes.innerHTML = `
    <p><strong>Cómo hacerlo:</strong> ${exData.hacer || ""}</p>
    <p><strong>Evitar:</strong> ${exData.noHacer || ""}</p>
    <p><strong>Trucos:</strong> ${exData.trucos || ""}</p>
  `;

  card.appendChild(notes);

  // ====== TABLA DE SERIES ======
  const table = document.createElement("table");
  table.className = "exercise-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Serie</th><th>Peso</th><th>Reps</th><th>Fallo</th><th>Reps fallo</th><th>Notas</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  card.appendChild(table);

  const tbody = table.querySelector("tbody");

  // Series
  if (exData.sets && exData.sets.length > 0) {
    exData.sets.forEach(s => addSetRow(tbody, s));
  } else {
    addSetRow(tbody);
  }

  const addBtn = document.createElement("button");
  addBtn.textContent = "Añadir serie";
  addBtn.className = "btn-secondary btn-small";
  addBtn.onclick = () => { addSetRow(tbody); saveSession(); };

  card.appendChild(addBtn);
  return card;
}



// -------------------------
// GUARDAR SESIÓN
// -------------------------

function saveSession() {
  const key = sessionKey();
  const cards = document.querySelectorAll(".exercise-card");

  const data = {
    date: dateInput.value,
    week: weekSelect.value,
    day: daySelect.value,
    exercises: []
  };

  cards.forEach(card => {
    const name = card.querySelector(".exercise-title")?.textContent.trim() || "";
    const mus = card.querySelector(".exercise-muscle")?.textContent.trim() || "";
    const sec = card.querySelector(".exercise-section")?.textContent.trim() || "";

    const tbody = card.querySelector("tbody");
    const rows = tbody ? Array.from(tbody.querySelectorAll("tr")) : [];
    
    const sets = rows.map(row => {
      const inputs = Array.from(row.querySelectorAll("input"));
      return {
        serie: parseInt(inputs[0]?.value) || null,
        peso: parseFloat(inputs[1]?.value) || null,
        reps: parseInt(inputs[2]?.value) || null,
        fallo: inputs[3]?.checked || false,
        repsFallo: parseInt(inputs[4]?.value) || null,
        obs: inputs[5]?.value || ""
      };
    });

    data.exercises.push({
      nombre: name,
      musculo: mus,
      seccion: sec,
      hacer: exerciseTemplates[name]?.hacer ?? "",
      noHacer: exerciseTemplates[name]?.noHacer ?? "",
      trucos: exerciseTemplates[name]?.trucos ?? "",
      sets: sets
    });
  });

  localStorage.setItem(key, JSON.stringify(data));
  setStatus("Guardado");
}



// -------------------------
// CARGAR SESIÓN O RUTINA BASE
// -------------------------

function loadSession() {
  const key = sessionKey();
  const saved = JSON.parse(localStorage.getItem(key) || "null");

  const week = weekSelect.value;
  const day = daySelect.value;

  const routine = routines[week]?.[day];
  exercisesContainer.innerHTML = "";

  // *Si hay datos guardados, cargarlos*
  if (saved && saved.exercises?.length > 0) {
    saved.exercises.forEach(ex => {
      const tpl = exerciseTemplates[ex.nombre] || {};
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: ex.nombre,
        musculo: ex.musculo ?? tpl.musculo ?? "",
        seccion: ex.seccion ?? tpl.seccion ?? "",
        hacer: tpl.hacer ?? "",
        noHacer: tpl.noHacer ?? "",
        trucos: tpl.trucos ?? "",
        sets: ex.sets ?? []
      }));
    });
    setStatus("Cargado desde memoria");
    return;
  }

  // *Si no hay guardados pero sí rutina definida*
  if (routine) {
    routine.forEach(name => {
      const tpl = exerciseTemplates[name] || {};
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: name,
        musculo: tpl.musculo ?? "",
        seccion: tpl.seccion ?? "",
        hacer: tpl.hacer ?? "",
        noHacer: tpl.noHacer ?? "",
        sets: []
      }));
    });

    setStatus("Cargado desde rutina base");
    return;
  }

  // *Si no hay nada*
  setStatus("No hay rutina definida");
}


// -------------------------
// AÑADIR EJERCICIO PREDEFINIDO
// -------------------------

function populatePredefinedSelect() {
  predefinedSelect.innerHTML = `<option value="">Añadir ejercicio...</option>`;
  Object.keys(exerciseTemplates).sort().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    predefinedSelect.appendChild(opt);
  });
}

addPredefinedBtn.onclick = () => {
  const name = predefinedSelect.value;
  if (!name) return;

  const tpl = exerciseTemplates[name] || {};

  exercisesContainer.appendChild(
    buildExerciseCard({
      nombre: name,
      musculo: tpl.musculo ?? "",
      seccion: tpl.seccion ?? "",
      hacer: tpl.hacer ?? "",
      noHacer: tpl.noHacer ?? "",
      sets: []
    })
  );

  saveSession();
};


// -------------------------
// AÑADIR PERSONALIZADO
// -------------------------

addCustomBtn.onclick = () => {
  const name = prompt("Nombre del ejercicio:");
  if (!name) return;

  exercisesContainer.appendChild(
    buildExerciseCard({
      nombre: name,
      musculo: "",
      seccion: "",
      hacer: "",
      noHacer: "",
      sets: []
    })
  );

  saveSession();
};


// -------------------------
// EXPORTACIÓN A PNG (FORMATO TABLA)
// -------------------------
exportBtn.onclick = () => {
  const key = sessionKey();
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  if (!saved) return alert("No hay datos registrados hoy.");

  // Crear contenedor sin borrar nada antes
  const exportDiv = document.createElement("div");
  exportDiv.style.background = "white";
  exportDiv.style.padding = "20px";
  exportDiv.style.fontFamily = "sans-serif";
  exportDiv.style.width = "fit-content";

  // Cabecera
  const title = document.createElement("h2");
  title.textContent = `${saved.date} — ${saved.week} — ${saved.day}`;
  exportDiv.appendChild(title);

  // Tabla
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "12px";

  table.innerHTML = `
    <tr style="background:#f0f0f0; font-weight:bold;">
      <th style="border:1px solid #333; padding:4px;">Ejercicio</th>
      <th style="border:1px solid #333; padding:4px;">Serie</th>
      <th style="border:1px solid #333; padding:4px;">Peso</th>
      <th style="border:1px solid #333; padding:4px;">Reps</th>
      <th style="border:1px solid #333; padding:4px;">Fallo</th>
      <th style="border:1px solid #333; padding:4px;">Reps fallo</th>
      <th style="border:1px solid #333; padding:4px;">Notas</th>
    </tr>
  `;

  // Rellenar tabla con todos los sets
  saved.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="border:1px solid #333; padding:4px;">${ex.nombre}</td>
        <td style="border:1px solid #333; padding:4px;">${set.serie ?? ""}</td>
        <td style="border:1px solid #333; padding:4px;">${set.peso ?? ""}</td>
        <td style="border:1px solid #333; padding:4px;">${set.reps ?? ""}</td>
        <td style="border:1px solid #333; padding:4px;">${set.fallo ? "Sí" : "No"}</td>
        <td style="border:1px solid #333; padding:4px;">${set.repsFallo ?? ""}</td>
        <td style="border:1px solid #333; padding:4px;">${set.obs ?? ""}</td>
      `;
      table.appendChild(tr);
    });
  });

  exportDiv.appendChild(table);
  document.body.appendChild(exportDiv);

  // Exportar a PNG
  html2canvas(exportDiv, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = `sesion_${saved.date}_${saved.week}_${saved.day}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    exportDiv.remove();
  });
};



// -------------------------
// INICIALIZACIÓN
// -------------------------

populatePredefinedSelect();
loadSession();

dateInput.addEventListener("change", loadSession);
weekSelect.addEventListener("change", loadSession);
daySelect.addEventListener("change", loadSession);
