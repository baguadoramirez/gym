// -------------------------
// CRONÓMETRO (TEMPORIZADOR DE CUENTA ATRÁS)
// -------------------------
let stopwatchInterval;
let stopwatchTime = 0; // en segundos
let isRunning = false;
let beepInterval = null;
let beepContext = null;

const stopwatchDisplay = document.getElementById('stopwatch-display');
const stopwatchInput = document.getElementById('stopwatch-input');
const startBtn = document.getElementById('start-stopwatch');
const stopBtn = document.getElementById('stop-stopwatch');
const resetBtn = document.getElementById('reset-stopwatch');
const toggleBtn = document.getElementById('toggle-stopwatch');
const popup = document.getElementById('stopwatch-popup');
const stopwatchOverlay = document.getElementById('stopwatch-overlay');
const stopwatchCloseBtn = document.getElementById('stopwatch-close-btn');
const quickAddPopup = document.getElementById('quick-add-popup');
const quickAddOverlay = document.getElementById('quick-add-overlay');
const quickAddToggleBtn = document.getElementById('toggle-quick-add');
const quickAddCloseBtn = document.getElementById('quick-add-close-btn');
const quickAddGroupSelect = document.getElementById('quick-add-group');
const quickAddExerciseSelect = document.getElementById('quick-add-exercise');
const quickAddFavoritesOnly = document.getElementById('quick-add-favorites-only');
const quickAddNoMaterialOnly = document.getElementById('quick-add-no-material');
const quickAddPredefinedBtn = document.getElementById('quick-add-predefined');
const quickAddCustomBtn = document.getElementById('quick-add-custom');
const customExerciseOverlay = document.getElementById('custom-exercise-overlay');
const customExerciseName = document.getElementById('custom-exercise-name');
const customExerciseIsCardio = document.getElementById('custom-exercise-is-cardio');
const customExerciseCancel = document.getElementById('custom-exercise-cancel');
const customExerciseConfirm = document.getElementById('custom-exercise-confirm');
const orderOverlay = document.getElementById('order-overlay');
const orderList = document.getElementById('order-list');
const orderCancel = document.getElementById('order-cancel');
const orderConfirm = document.getElementById('order-confirm');

function updateDisplay() {
  const minutes = Math.floor(stopwatchTime / 60);
  const seconds = stopwatchTime % 60;
  stopwatchDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function playBeep() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  if (!beepContext) beepContext = new AudioCtx();
  if (beepContext.state === "suspended") {
    beepContext.resume();
  }
  const oscillator = beepContext.createOscillator();
  const gain = beepContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.2;
  oscillator.connect(gain);
  gain.connect(beepContext.destination);
  oscillator.start();
  oscillator.stop(beepContext.currentTime + 0.2);
}

function startBeepLoop() {
  if (beepInterval) return;
  playBeep();
  beepInterval = setInterval(playBeep, 1000);
}

function stopBeepLoop() {
  if (!beepInterval) return;
  clearInterval(beepInterval);
  beepInterval = null;
}

function openStopwatchOverlay() {
  if (!stopwatchOverlay) return;
  openOverlay(stopwatchOverlay, { initialFocus: stopwatchInput || startBtn });
}

function closeStopwatchOverlay() {
  if (!stopwatchOverlay) return;
  closeOverlay(stopwatchOverlay);
}

function openQuickAddOverlay() {
  if (!quickAddOverlay) return;
  openOverlay(quickAddOverlay, { initialFocus: quickAddGroupSelect });
}

function closeQuickAddOverlay() {
  if (!quickAddOverlay) return;
  closeOverlay(quickAddOverlay);
}

function openOrderOverlay(items) {
  if (!orderOverlay) return;
  renderOrderList(items);
  openOverlay(orderOverlay, { initialFocus: orderConfirm || orderCancel });
}

function closeOrderOverlay() {
  if (!orderOverlay) return;
  closeOverlay(orderOverlay);
}

function renderOrderList(items) {
  if (!orderList) return;
  orderList.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "hint-text";
    empty.textContent = t("order.empty");
    orderList.appendChild(empty);
    return;
  }
  items.forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "order-item";
    const title = document.createElement("div");
    title.className = "order-title";
    title.textContent = entry.name;
    const actions = document.createElement("div");
    actions.className = "order-actions";
    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.textContent = "↑";
    upBtn.disabled = index === 0;
    upBtn.addEventListener("click", () => {
      if (index === 0) return;
      const swapped = items[index - 1];
      items[index - 1] = items[index];
      items[index] = swapped;
      renderOrderList(items);
    });
    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.textContent = "↓";
    downBtn.disabled = index === items.length - 1;
    downBtn.addEventListener("click", () => {
      if (index >= items.length - 1) return;
      const swapped = items[index + 1];
      items[index + 1] = items[index];
      items[index] = swapped;
      renderOrderList(items);
    });
    actions.appendChild(upBtn);
    actions.appendChild(downBtn);
    row.appendChild(title);
    row.appendChild(actions);
    orderList.appendChild(row);
  });
}

function openCustomExerciseOverlay() {
  if (!customExerciseOverlay) return;
  if (customExerciseName) {
    customExerciseName.value = "";
  }
  if (customExerciseIsCardio) customExerciseIsCardio.checked = false;
  openOverlay(customExerciseOverlay, { initialFocus: customExerciseName });
}

function closeCustomExerciseOverlay() {
  if (!customExerciseOverlay) return;
  closeOverlay(customExerciseOverlay);
}

startBtn.addEventListener('click', () => {
  if (!isRunning && stopwatchTime > 0) {
    stopBeepLoop();
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
        startBeepLoop();
        setStatus(t("status.timeFinished"));
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
  stopBeepLoop();
});

resetBtn.addEventListener('click', () => {
  isRunning = false;
  clearInterval(stopwatchInterval);
  stopwatchTime = parseInt(stopwatchInput.value) || 0;
  updateDisplay();
  startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
  stopBeepLoop();
});

stopwatchInput.addEventListener('input', () => {
  if (!isRunning) {
    stopwatchTime = parseInt(stopwatchInput.value) || 0;
    updateDisplay();
  }
});

toggleBtn.addEventListener('click', () => {
  closeQuickAddOverlay();
  if (stopwatchOverlay?.style.display === "flex") {
    closeStopwatchOverlay();
  } else {
    openStopwatchOverlay();
  }
});


function populateQuickAddGroups() {
  populateGroupSelect(quickAddGroupSelect);
}

function populateQuickAddExercises(selectedGroup) {
  const quickExerciseSelect = document.getElementById("quick-add-exercise");
  if (!quickExerciseSelect) return;
  const favoritesOnly = Boolean(quickAddFavoritesOnly?.checked);
  const noMaterialOnly = Boolean(quickAddNoMaterialOnly?.checked);
  const favorites = favoritesOnly ? new Set(loadFavorites()) : null;
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("placeholder.selectExercise");
  quickExerciseSelect.replaceChildren(placeholder);
  if (!selectedGroup) {
    quickExerciseSelect.disabled = true;
    return;
  }
  const exercisesInGroup = Object.keys(exerciseTemplates).filter(name => {
    const tpl = exerciseTemplates[name];
    if (resolveExerciseGroup(tpl) !== selectedGroup) return false;
    if (favoritesOnly && favorites && !favorites.has(name)) return false;
    if (noMaterialOnly && !tpl?.sinMaterial) return false;
    return true;
  }).sort((a, b) => a.localeCompare(b, getLocale()));
  if (!exercisesInGroup.length) {
    if (favoritesOnly && quickExerciseSelect.options[0]) {
      quickExerciseSelect.options[0].textContent = t("favorites.emptyOption");
    }
    quickExerciseSelect.disabled = true;
    return;
  }
  exercisesInGroup.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    quickExerciseSelect.appendChild(opt);
  });
  quickExerciseSelect.disabled = false;
}

if (quickAddGroupSelect) {
  populateQuickAddGroups();
  quickAddGroupSelect.addEventListener("change", () => {
    populateQuickAddExercises(quickAddGroupSelect.value);
  });
}
if (quickAddFavoritesOnly) {
  quickAddFavoritesOnly.addEventListener("change", () => {
    if (quickAddGroupSelect) {
      populateQuickAddExercises(quickAddGroupSelect.value);
    }
  });
}
if (quickAddNoMaterialOnly) {
  quickAddNoMaterialOnly.addEventListener("change", () => {
    if (quickAddGroupSelect) {
      populateQuickAddExercises(quickAddGroupSelect.value);
    }
  });
}

if (quickAddPredefinedBtn) {
  quickAddPredefinedBtn.addEventListener("click", () => {
    const name = quickAddExerciseSelect?.value || "";
    if (!name) return;
    addExerciseFromTemplate(name);
  });
}

if (quickAddCustomBtn) {
  quickAddCustomBtn.addEventListener("click", () => {
    closeQuickAddOverlay();
    openCustomExerciseOverlay();
  });
}

if (quickAddToggleBtn) {
  quickAddToggleBtn.addEventListener("click", () => {
    closeStopwatchOverlay();
    if (quickAddOverlay?.style.display === "flex") {
      closeQuickAddOverlay();
    } else {
      openQuickAddOverlay();
    }
  });
}

if (toggleOrderModeBtn) {
  toggleOrderModeBtn.addEventListener("click", () => {
    if (!exercisesContainer) return;
    const cards = Array.from(exercisesContainer.querySelectorAll(".exercise-card"));
    const items = cards.map(card => ({
      node: card,
      name: card.querySelector(".exercise-title")?.textContent.trim() || t("history.view.exerciseDefault")
    }));
    openOrderOverlay(items);
    if (orderConfirm) {
      orderConfirm.onclick = () => {
        if (!items.length) {
          closeOrderOverlay();
          return;
        }
        items.forEach(item => {
          exercisesContainer.appendChild(item.node);
        });
        saveSession();
        scheduleExercisePagination(true);
        closeOrderOverlay();
      };
    }
  });
}

if (stopwatchCloseBtn) {
  stopwatchCloseBtn.addEventListener("click", closeStopwatchOverlay);
}

if (quickAddCloseBtn) {
  quickAddCloseBtn.addEventListener("click", closeQuickAddOverlay);
}

if (orderCancel) {
  orderCancel.addEventListener("click", closeOrderOverlay);
}

if (orderOverlay) {
  orderOverlay.addEventListener("click", (e) => {
    if (e.target === orderOverlay) closeOrderOverlay();
  });
}

if (customExerciseCancel) {
  customExerciseCancel.addEventListener("click", closeCustomExerciseOverlay);
}

if (customExerciseConfirm) {
  customExerciseConfirm.addEventListener("click", () => {
    const name = customExerciseName?.value.trim();
    if (!name) return;
    const isCardio = customExerciseIsCardio ? customExerciseIsCardio.checked : false;
  if (!exercisesContainer) exercisesContainer = mainExercisesContainer;
  exercisesContainer.appendChild(
      buildExerciseCard({
        nombre: name,
        musculo: isCardio ? "Cardio" : "Personalizado",
        seccion: "N/A",
        hacer: "",
        noHacer: "",
        trucos: "",
        sets: []
      })
    );
    saveSession();
    const total = exercisesContainer.querySelectorAll(".exercise-card").length;
    activeExerciseIndex = Math.max(0, total - 1);
    scheduleExercisePagination();
    closeCustomExerciseOverlay();
  });
}

if (exercisePrevBtn) {
  exercisePrevBtn.addEventListener("click", () => {
    activeExerciseIndex = Math.max(0, activeExerciseIndex - 1);
    scheduleExercisePagination();
  });
}

if (exerciseNextBtn) {
  exerciseNextBtn.addEventListener("click", () => {
    activeExerciseIndex += 1;
    scheduleExercisePagination();
  });
}

if (removeExerciseBtn) {
  removeExerciseBtn.addEventListener("click", () => {
    if (!exercisesContainer) return;
    const cards = Array.from(exercisesContainer.querySelectorAll(".exercise-card"));
    if (!cards.length) return;
    const index = Math.max(0, Math.min(activeExerciseIndex, cards.length - 1));
    const card = cards[index];
    if (!card) return;
    card.remove();
    activeExerciseIndex = Math.max(0, index - 1);
    saveSession();
    loadSession({ preserveExerciseIndex: true }); // Necesario para refrescar el painExerciseSelect
  });
}

if (stopwatchOverlay) {
  stopwatchOverlay.addEventListener("click", (e) => {
    if (e.target === stopwatchOverlay) closeStopwatchOverlay();
  });
}

if (quickAddOverlay) {
  quickAddOverlay.addEventListener("click", (e) => {
    if (e.target === quickAddOverlay) closeQuickAddOverlay();
  });
}

if (customExerciseOverlay) {
  customExerciseOverlay.addEventListener("click", (e) => {
    if (e.target === customExerciseOverlay) closeCustomExerciseOverlay();
  });
}

// Inicializar display
updateDisplay();

const exerciseObserver = new MutationObserver(() => {
  scheduleExercisePagination(false);
});
if (mainExercisesContainer) {
  exerciseObserver.observe(mainExercisesContainer, { childList: true });
}
if (editExercisesContainer) {
  exerciseObserver.observe(editExercisesContainer, { childList: true });
}

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

function bindDragAndDrop(container) {
  if (!container) return;
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggedElement = document.querySelector('.exercise-card[style*="opacity: 0.5"]');
    if (draggedElement) {
      const afterElement = getDragAfterElement(container, e.clientY);
      if (afterElement == null) {
        container.appendChild(draggedElement);
      } else {
        container.insertBefore(draggedElement, afterElement);
      }
      saveSession();
      scheduleExercisePagination();
    }
  });
}

bindDragAndDrop(mainExercisesContainer);
bindDragAndDrop(editExercisesContainer);

// -------------------------
// HISTÓRICO
// -------------------------

if (userHistorySelect) {
  userHistorySelect.addEventListener("change", () => {
    const selectedKey = userHistorySelect.value || "";
    if (!selectedKey) return;
    activateSelectedUser(selectedKey);
  });
}

if (newUserHistoryBtn) {
  newUserHistoryBtn.addEventListener("click", async () => {
    const name = await promptForNewUserName("");
    if (!name) return;
    const userList = loadUserList();
    const key = normalizeUserName(name);
    if (!userList.some(u => u.key === key)) {
      userList.push({ name, key });
      saveUserList(userList);
      setLocalHistoryForUser(key, []);
    }
    refreshUserSelect();
    if (userHistorySelect) userHistorySelect.value = key;
    activateSelectedUser(key);
    setUserHistoryStatus(t("status.createdLoaded"));
  });
}

if (renameUserHistoryBtn) {
  renameUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert(t("alert.selectUserRename"));
      return;
    }
    const userList = loadUserList();
    const entry = userList.find(u => u.key === selectedKey);
    const defaultName = entry?.name || "";
    const newName = promptForNewUserName(defaultName);
    if (!newName) return;
    renameUserHistory(selectedKey, newName);
  });
}

if (deleteUserHistoryBtn) {
  deleteUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert(t("alert.selectUserDelete"));
      return;
    }
    deleteUserHistory(selectedKey);
  });
}

if (exportUserHistoryBtn) {
  exportUserHistoryBtn.addEventListener("click", () => {
    const selectedKey = userHistorySelect?.value || "";
    if (!selectedKey) {
      alert(t("alert.selectUserExport"));
      return;
    }
    const userList = loadUserList();
    const entry = userList.find(u => u.key === selectedKey);
    const data = getExportHistoryForUser(selectedKey);
    if (!data.length) {
      setUserHistoryStatus(t("status.noUserDataExport"));
      return;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = entry?.name ? normalizeUserName(entry.name) : selectedKey;
    a.download = `${t("file.historyPrefix")}_${safeName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setUserHistoryStatus(t("status.userExported"));
  });
}
