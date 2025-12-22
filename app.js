/* ==========================================================
   app.js — versión limpia y corregida (v5: Reseteo en Recarga + Persistencia de Dolor)
   Requiere: ejercicios.js + html2canvas + rutinas.html
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

// CAMPOS DE SENSACIONES
const senseGeneralInput = document.getElementById("sense-general");
const senseTirednessInput = document.getElementById("sense-tiredness");
const sensePainSelect = document.getElementById("sense-pain");
const painDetailsDiv = document.getElementById("pain-details");
const painZoneInput = document.getElementById("pain-zone");
const painExerciseSelect = document.getElementById("pain-exercise");

// Fecha inicial
dateInput.value = new Date().toISOString().slice(0, 10);

// Histórico
let historyData = {}; // {exerciseName: [weights]}
window.uploadedHistory = []; // Array of sessions

function getMaxWeight(exerciseName) {
  if (!historyData[exerciseName] || historyData[exerciseName].length === 0) return null;
  return Math.max(...historyData[exerciseName]);
}


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
// FUNCIÓN DE VALIDACIÓN 
// -------------------------
function checkSensationsForm() {
    let isValid = true;
    
    // 1. Sensaciones generales y cansancio
    if (!senseGeneralInput.value || senseGeneralInput.value.trim() === '') {
        isValid = false;
    }
    if (!senseTirednessInput.value || senseTirednessInput.value.trim() === '') {
        isValid = false;
    }

    // 2. Dolor específico (si 'si' está seleccionado)
    if (sensePainSelect.value === 'si') {
        if (!painZoneInput.value || painZoneInput.value.trim() === '') {
            isValid = false;
        }
        // Validar que se haya seleccionado un ejercicio O "No identificado"
        if (!painExerciseSelect.value || painExerciseSelect.value.trim() === '') {
            isValid = false;
        }
    }
    
    exportBtn.disabled = !isValid;
    return isValid;
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

  // Nota: Si el ejercicio es personalizado, exData.hacer/noHacer/trucos serán vacíos
  const musculoDisplay = exData.musculo || "N/A";
  const seccionDisplay = exData.seccion || "N/A";
  const hacerDisplay = exData.hacer || "Descripción no disponible para ejercicios personalizados.";
  const noHacerDisplay = exData.noHacer || "N/A";
  const trucosDisplay = exData.trucos || "N/A";


  left.innerHTML = `
    <div class="exercise-title" style="font-weight:bold; font-size:1rem;">
      ${exData.nombre}
    </div>

    <div class="exercise-meta exercise-muscle-section" 
         data-musculo="${musculoDisplay}"
         data-seccion="${seccionDisplay}"
         style="font-size:0.8rem; color:var(--meta-text); margin-top:2px;">
      ${musculoDisplay} – ${seccionDisplay}
    </div>
  `;


  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Eliminar";
  removeBtn.className = "btn-secondary btn-small";
  
  removeBtn.onclick = () => {
    card.remove();
    saveSession();
    loadSession(); // Necesario para refrescar el painExerciseSelect
  };

  header.appendChild(left);
  header.appendChild(removeBtn);
  card.appendChild(header);

  // ====== NOTAS TÉCNICAS ======
  const notes = document.createElement("div");
  notes.className = "exercise-notes";
  notes.innerHTML = `
    <p><b>Cómo hacerlo:</b> ${hacerDisplay}</p>
    <p><b>Evitar:</b> ${noHacerDisplay}</p>
    <p><b>Trucos:</b> ${trucosDisplay}</p>
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
    const maxWeight = getMaxWeight(exData.nombre);
    addSetRow(tbody, maxWeight ? {peso: maxWeight} : {});
  }

  const addBtn = document.createElement("button");
  addBtn.textContent = "Añadir serie";
  addBtn.className = "btn-secondary btn-small";
  addBtn.onclick = () => { addSetRow(tbody); saveSession(); };

  card.appendChild(addBtn);

  // Hacer la tarjeta draggable
  card.draggable = true;
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  });
  card.addEventListener('dragend', (e) => {
    e.target.style.opacity = '';
  });

  return card;
}


// -------------------------
// GUARDAR SESIÓN (Y SENSACIONES)
// -------------------------

function saveSession() {
  const key = sessionKey();
  const cards = document.querySelectorAll(".exercise-card");
  
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
      pain: sensePainSelect.value,
      painZone: painZoneInput.value,
      painExercise: selectedPainExercise
    }
  };

  cards.forEach(card => {
    const name = card.querySelector(".exercise-title")?.textContent.trim() || "";
    
    let mus = "";
    let sec = "";
    let hacer = "";
    let noHacer = "";
    let trucos = "";

    const metaElement = card.querySelector(".exercise-muscle-section");
    if (metaElement) {
        mus = metaElement.getAttribute("data-musculo") || "";
        sec = metaElement.getAttribute("data-seccion") || "";
    }
    
    const tpl = exerciseTemplates[name] || {};
    hacer = tpl.hacer ?? "";
    noHacer = tpl.noHacer ?? "";
    trucos = tpl.trucos ?? "";

    
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
      hacer: hacer,
      noHacer: noHacer,
      trucos: trucos,
      sets: sets
    });
  });

  localStorage.setItem(key, JSON.stringify(data));
  setStatus("Guardado");
  
  // 1. Repopulate the list of exercises for the pain selector
  const currentExerciseNames = data.exercises.map(ex => ex.nombre);
  populatePainExerciseSelect(currentExerciseNames); 

  // 2. Restaurar la selección en el DOM (en caso de que la lista haya cambiado)
  painExerciseSelect.value = data.sensations.painExercise; 

  checkSensationsForm();
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE AÑADIR EJERCICIO (TODOS)
// -------------------------

function populatePredefinedSelect() {
  predefinedSelect.innerHTML = `<option value="">Añadir ejercicio...</option>`;
  
  // Solo usa los ejercicios que tienen definición completa (y elimina duplicados)
  const allNames = Object.keys(exerciseTemplates);
  const uniqueAndSortedNames = [...new Set(allNames)].sort();
  
  uniqueAndSortedNames.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    predefinedSelect.appendChild(opt);
  });
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE DOLOR (SOLO EJERCICIOS DE HOY + "No identificado")
// -------------------------

function populatePainExerciseSelect(exerciseNames) {
    painExerciseSelect.innerHTML = `<option value="">Seleccionar ejercicio...</option>`;
    
    // Usa un Set para asegurar nombres únicos
    const uniqueNames = [...new Set(exerciseNames)];
    
    // NUEVO: Añadir opción "No identificado"
    const noSeOpt = document.createElement("option");
    noSeOpt.value = "No identificado";
    noSeOpt.textContent = "No identificado";
    painExerciseSelect.appendChild(noSeOpt);
    
    // Ordena los nombres de los ejercicios
    uniqueNames.sort().forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        painExerciseSelect.appendChild(opt);
    });
}


// -------------------------
// CARGAR SESIÓN O RUTINA BASE (Y SENSACIONES)
// -------------------------

function loadSession() {
  const key = sessionKey();
  const saved = JSON.parse(localStorage.getItem(key) || "null");

  const week = weekSelect.value;
  const day = daySelect.value;
  const routine = routines[week]?.[day];
  
  exercisesContainer.innerHTML = "";
  
  // 1. Limpiar campos de sensaciones antes de cargar
  senseGeneralInput.value = "";
  senseTirednessInput.value = "";
  sensePainSelect.value = "no";
  painZoneInput.value = "";
  painDetailsDiv.style.display = "none";
  
  let currentExercises = [];
  let savedPainExercise = ""; // Inicializamos variable para guardar el valor guardado
  
  // *Si hay datos guardados, cargarlos*
  if (saved && saved.exercises?.length > 0) {
    saved.exercises.forEach(ex => {
      // Usar los datos guardados, ya que los personalizados no están en exerciseTemplates
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: ex.nombre,
        musculo: ex.musculo ?? "N/A",
        seccion: ex.seccion ?? "N/A",
        hacer: ex.hacer ?? "",
        noHacer: ex.noHacer ?? "",
        trucos: ex.trucos ?? "",
        sets: ex.sets ?? []
      }));
    });
    
    currentExercises = saved.exercises.map(ex => ex.nombre); 
    
    // Cargar sensaciones guardadas
    if (saved.sensations) {
      senseGeneralInput.value = saved.sensations.general ?? "";
      senseTirednessInput.value = saved.sensations.tiredness ?? "";
      sensePainSelect.value = saved.sensations.pain ?? "no";
      painZoneInput.value = saved.sensations.painZone ?? "";
      savedPainExercise = saved.sensations.painExercise ?? ""; // Almacenamos el valor
      
      if (sensePainSelect.value === 'si') {
          painDetailsDiv.style.display = 'flex'; 
      }
    }
    setStatus("Cargado desde memoria");
  }

  // *Si no hay guardados pero sí rutina definida*
  else if (routine) { 
    routine.forEach(name => {
      const tpl = exerciseTemplates[name] || {};
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: name,
        musculo: tpl.musculo ?? "N/A",
        seccion: tpl.seccion ?? "N/A",
        hacer: tpl.hacer ?? "",
        noHacer: tpl.noHacer ?? "",
        trucos: tpl.trucos ?? "",
        sets: []
      }));
    });
    
    currentExercises = routine; 
    setStatus("Cargado desde rutina base");
  }

  // *Si no hay nada*
  else {
    setStatus("No hay rutina definida");
  }
  
  // 2. Llenar el selector de dolor (incluye "No identificado")
  populatePainExerciseSelect(currentExercises); 

  // 3. Establecer el valor guardado
  painExerciseSelect.value = savedPainExercise; 
  
  checkSensationsForm();
}


// -------------------------
// AÑADIR EJERCICIO PREDEFINIDO
// -------------------------

addPredefinedBtn.onclick = () => {
  const name = predefinedSelect.value;
  if (!name) return;

  const tpl = exerciseTemplates[name] || {};

  exercisesContainer.appendChild(
    buildExerciseCard({
      nombre: name,
      musculo: tpl.musculo ?? "N/A",
      seccion: tpl.seccion ?? "N/A",
      hacer: tpl.hacer ?? "",
      noHacer: tpl.noHacer ?? "",
      trucos: tpl.trucos ?? "",
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
      musculo: "Personalizado", 
      seccion: "N/A", 
      hacer: "",
      noHacer: "",
      trucos: "",
      sets: []
    })
  );

  saveSession();
};


// -------------------------
// EXPORTACIÓN A PNG (FORMATO TABLA)
// -------------------------
exportBtn.onclick = () => {
  // Doble verificación de validación
  if (!checkSensationsForm()) {
    return alert("Por favor, completa todo el cuestionario de Post-Entrenamiento antes de exportar.");
  }

  const key = sessionKey();
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  if (!saved) return alert("No hay datos registrados hoy.");

  // Crear contenedor sin borrar nada antes
  const exportDiv = document.createElement("div");
  exportDiv.style.background = "white";
  exportDiv.style.padding = "20px";
  exportDiv.style.fontFamily = "sans-serif";
  exportDiv.style.width = "fit-content";
  exportDiv.style.color = "#000"; 

  // Cabecera: Solo la fecha
  const title = document.createElement("h2");
  title.textContent = `${saved.date}`; 
  title.style.color = "#000"; 
  exportDiv.appendChild(title);

  // Tabla
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.fontSize = "12px";
  table.style.color = "#000"; 

  // Estilos de la cabecera (Texto blanco, fondo oscuro)
  table.innerHTML = `
    <tr style="background:#111; font-weight:bold;"> 
      <th style="border:1px solid #333; padding:4px; color:#fff;">Ejercicio</th>
      <th style="border:1px solid #333; padding:4px; color:#fff;">Serie</th>
      <th style="border:1px solid #333; padding:4px; color:#fff;">Peso</th>
      <th style="border:1px solid #333; padding:4px; color:#fff;">Reps</th>
      <th style="border:1px solid #333; padding:4px; color:#fff;">Fallo</th>
      <th style="border:1px solid #333; padding:4px; color:#fff;">Reps fallo</th>
      <th style="border:1px solid #333; padding:4px; color:#fff;">Notas</th>
    </tr>
  `;

  // Rellenar tabla con todos los sets (texto negro)
  saved.exercises.forEach(ex => {
    ex.sets.forEach(set => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="border:1px solid #333; padding:4px; color:#000;">${ex.nombre}</td>
        <td style="border:1px solid #333; padding:4px; color:#000;">${set.serie ?? ""}</td>
        <td style="border:1px solid #333; padding:4px; color:#000;">${set.peso ?? ""}</td>
        <td style="border:1px solid #333; padding:4px; color:#000;">${set.reps ?? ""}</td>
        <td style="border:1px solid #333; padding:4px; color:#000;">${set.fallo ? "Sí" : "No"}</td>
        <td style="border:1px solid #333; padding:4px; color:#000;">${set.repsFallo ?? ""}</td>
        <td style="border:1px solid #333; padding:4px; color:#000;">${set.obs ?? ""}</td>
      `;
      table.appendChild(tr);
    });
  });

  exportDiv.appendChild(table);

  // AÑADIR SENSACIONES AL EXPORT (Texto negro)
  const sensations = saved.sensations || {};
  const sensDiv = document.createElement('div');
  sensDiv.style.marginTop = '20px';
  sensDiv.style.borderTop = '1px solid #000';
  sensDiv.style.paddingTop = '10px';
  sensDiv.style.color = "#000";
  
  let painText = "";
  if (sensations.pain === 'si') {
      painText = `Sí (${sensations.painZone || 'Zona N/A'} - Ejercicio: ${sensations.painExercise || 'N/A'})`;
  } else {
      painText = 'No';
  }
  
  // Usar párrafos para formato de fila separada
  sensDiv.innerHTML = `
      <p style="font-weight:bold; margin: 3px 0; color:#000; font-size:14px;">Métricas Subjetivas:</p>
      <p style="margin: 3px 0; color:#000; font-size:12px;">- Sensaciones generales (0-10): ${sensations.general || 'N/A'}</p>
      <p style="margin: 3px 0; color:#000; font-size:12px;">- Cansancio percibido (0-10): ${sensations.tiredness || 'N/A'}</p>
      <p style="margin: 3px 0; color:#000; font-size:12px;">- Dolor en algún músculo: ${painText}</p>
  `;
  exportDiv.appendChild(sensDiv);
  
  // MARCA DE AGUA (Texto negro)
  const footer = document.createElement('p');
  footer.textContent = 'Registrado con GymTracker by Borja Aguado';
  footer.style.fontSize = '10px';
  footer.style.textAlign = 'right';
  footer.style.marginTop = '15px';
  footer.style.color = "#000";
  exportDiv.appendChild(footer);
  
  // Añadir al DOM para que html2canvas pueda capturarlo
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
// MANEJADOR DE SENSACIONES
// -------------------------
sensePainSelect.addEventListener('change', () => {
    if (sensePainSelect.value === 'si') {
        painDetailsDiv.style.display = 'flex'; 
    } else {
        painDetailsDiv.style.display = 'none';
        // Opcional: limpiar los campos cuando se desactiva el dolor
        painZoneInput.value = ""; 
        painExerciseSelect.value = "";
    }
    saveSession(); 
});

// Añadir listeners para guardar automáticamente y validar
senseGeneralInput.addEventListener("input", saveSession);
senseTirednessInput.addEventListener("input", saveSession);
painZoneInput.addEventListener("input", saveSession);
painExerciseSelect.addEventListener("change", saveSession); // El change es necesario para capturar la selección


// -------------------------
// INICIALIZACIÓN
// -------------------------

// Listener para el botón de cargar/cambiar rutina (adicional al change)
loadBtn.addEventListener("click", loadSession);

document.addEventListener('DOMContentLoaded', () => {
    
    // ** IMPLEMENTACIÓN DEL RESETEADO AL RECARGAR **
    // Borrar la información de la sesión anterior guardada
    // Esto asegura que la página se vea "limpia" de datos de ejercicios al abrir.
    localStorage.removeItem(sessionKey());
    // (Opcional, pero se recomienda borrar solo la clave activa si usas una única para sensaciones)
    // localStorage.removeItem('sensationsData'); 
    
    // Restablecer selectores y cargar
    weekSelect.value = 'Semana 1';
    daySelect.value = 'Día 1';

    populatePredefinedSelect(); 
    loadSession(); 
});


// Añadir listeners para que los cambios de fecha/selectores recarguen la sesión
dateInput.addEventListener("change", loadSession);
weekSelect.addEventListener("change", loadSession);
daySelect.addEventListener("change", loadSession);

// -------------------------
// CRONÓMETRO (TEMPORIZADOR DE CUENTA ATRÁS)
// -------------------------
let stopwatchInterval;
let stopwatchTime = 0; // en segundos
let isRunning = false;

const stopwatchDisplay = document.getElementById('stopwatch-display');
const stopwatchInput = document.getElementById('stopwatch-input');
const startBtn = document.getElementById('start-stopwatch');
const stopBtn = document.getElementById('stop-stopwatch');
const resetBtn = document.getElementById('reset-stopwatch');
const toggleBtn = document.getElementById('toggle-stopwatch');
const minimizeBtn = document.getElementById('minimize-stopwatch');
const popup = document.getElementById('stopwatch-popup');

function updateDisplay() {
  const minutes = Math.floor(stopwatchTime / 60);
  const seconds = stopwatchTime % 60;
  stopwatchDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

startBtn.addEventListener('click', () => {
  if (!isRunning && stopwatchTime > 0) {
    isRunning = true;
    startBtn.style.display = 'none'; // Ocultar botón iniciar
    stopwatchInterval = setInterval(() => {
      if (stopwatchTime > 0) {
        stopwatchTime--;
        updateDisplay();
      } else {
        clearInterval(stopwatchInterval);
        isRunning = false;
        startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
        alert('¡Tiempo terminado!');
      }
    }, 1000);
  }
});

stopBtn.addEventListener('click', () => {
  if (isRunning) {
    isRunning = false;
    clearInterval(stopwatchInterval);
    startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
  }
});

resetBtn.addEventListener('click', () => {
  isRunning = false;
  clearInterval(stopwatchInterval);
  stopwatchTime = parseInt(stopwatchInput.value) || 0;
  updateDisplay();
  startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
});

stopwatchInput.addEventListener('input', () => {
  if (!isRunning) {
    stopwatchTime = parseInt(stopwatchInput.value) || 0;
    updateDisplay();
  }
});

toggleBtn.addEventListener('click', () => {
  popup.classList.toggle('collapsed');
  if (popup.classList.contains('collapsed')) {
    popup.style.display = 'none';
  } else {
    popup.style.display = 'block';
  }
});

minimizeBtn.addEventListener('click', () => {
  popup.classList.add('collapsed');
  popup.style.display = 'none';
});

// Inicializar display
updateDisplay();

// -------------------------
// DRAG AND DROP PARA REORDENAR EJERCICIOS
// -------------------------

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.exercise-card:not([style*="opacity: 0.5"])')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

exercisesContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
});

exercisesContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  const draggedElement = document.querySelector('.exercise-card[style*="opacity: 0.5"]');
  if (draggedElement) {
    const afterElement = getDragAfterElement(exercisesContainer, e.clientY);
    if (afterElement == null) {
      exercisesContainer.appendChild(draggedElement);
    } else {
      exercisesContainer.insertBefore(draggedElement, afterElement);
    }
    saveSession();
  }
});

// -------------------------
// HISTÓRICO
// -------------------------

const uploadHistoryInput = document.getElementById('upload-history');
const downloadHistoryBtn = document.getElementById('download-history-btn');
const uploadHistoryBtn = document.getElementById('upload-history-btn');

uploadHistoryBtn.addEventListener('click', () => uploadHistoryInput.click());

uploadHistoryInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        window.uploadedHistory = data;
        // Procesar data para historyData
        historyData = {};
        data.forEach(session => {
          if (session.exercises) {
            session.exercises.forEach(ex => {
              if (!historyData[ex.nombre]) historyData[ex.nombre] = [];
              if (ex.sets) {
                ex.sets.forEach(set => {
                  if (set.peso && !isNaN(parseFloat(set.peso))) {
                    historyData[ex.nombre].push(parseFloat(set.peso));
                  }
                });
              }
            });
          }
        });
        setStatus('Histórico cargado correctamente.');
      } catch (err) {
        setStatus('Error al cargar el histórico: ' + err.message);
      }
    };
    reader.readAsText(file);
  }
});

downloadHistoryBtn.addEventListener('click', () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('gym_'));
  const data = keys.map(k => JSON.parse(localStorage.getItem(k)));
  // Añadir la sesión actual si no está guardada
  const currentKey = sessionKey();
  if (!keys.includes(currentKey)) {
    const currentData = {
      date: dateInput.value,
      week: weekSelect.value,
      day: daySelect.value,
      exercises: [],
      sensations: {
        general: senseGeneralInput.value,
        tiredness: senseTirednessInput.value,
        pain: sensePainSelect.value,
        painZone: painZoneInput.value,
        painExercise: painExerciseSelect.value
      }
    };
    const cards = document.querySelectorAll('.exercise-card');
    cards.forEach(card => {
      const name = card.querySelector('.exercise-title')?.textContent.trim() || '';
      const meta = card.querySelector('.exercise-meta');
      const musculo = meta?.getAttribute('data-musculo') || '';
      const seccion = meta?.getAttribute('data-seccion') || '';
      const sets = [];
      const rows = card.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        sets.push({
          serie: inputs[0]?.value || '',
          peso: inputs[1]?.value || '',
          reps: inputs[2]?.value || '',
          fallo: inputs[3]?.checked || false,
          repsFallo: inputs[4]?.value || '',
          obs: inputs[5]?.value || ''
        });
      });
      currentData.exercises.push({
        nombre: name,
        musculo: musculo,
        seccion: seccion,
        sets: sets
      });
    });
    data.push(currentData);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'historico_rutinas.json';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Histórico descargado.');
});