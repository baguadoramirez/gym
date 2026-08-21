// -------------------------
// CRONÓMETRO (TEMPORIZADOR DE CUENTA ATRÁS)
// -------------------------
let stopwatchInterval;
let stopwatchTime = 0; // en segundos
let isRunning = false;
let beepInterval = null;
let beepContext = null;
let stopwatchWakeLock = null;

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
const quickAddShortcuts = document.getElementById('quick-add-shortcuts');
const quickAddCloseBtn = document.getElementById('quick-add-close-btn');
const quickAddSearch = document.getElementById('quick-add-search');
const quickAddGroups = document.getElementById('quick-add-groups');
const quickAddResults = document.getElementById('quick-add-results');
const quickAddMostUsed = document.getElementById('quick-add-most-used');
const quickAddWarmup = document.getElementById('quick-add-warmup');
const quickAddFavoritesOnly = document.getElementById('quick-add-favorites-only');
const quickAddNoMaterialOnly = document.getElementById('quick-add-no-material');
const quickAddCustomBtn = document.getElementById('quick-add-custom');
const customExerciseOverlay = document.getElementById('custom-exercise-overlay');
const customExerciseName = document.getElementById('custom-exercise-name');
const customExerciseIsCardio = document.getElementById('custom-exercise-is-cardio');
const customExerciseWarmup = document.getElementById('custom-exercise-warmup');
const customExerciseCancel = document.getElementById('custom-exercise-cancel');
const customExerciseConfirm = document.getElementById('custom-exercise-confirm');
const orderOverlay = document.getElementById('order-overlay');
const orderList = document.getElementById('order-list');
const orderCancel = document.getElementById('order-cancel');
const orderConfirm = document.getElementById('order-confirm');

let quickAddSelectedGroup = "";
let quickAddMode = "popular";

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

async function requestStopwatchWakeLock() {
  if (!isRunning || document.visibilityState !== "visible" || !("wakeLock" in navigator)) return;

  try {
    const lock = await navigator.wakeLock.request("screen");
    if (!isRunning) {
      await lock.release();
      return;
    }
    stopwatchWakeLock = lock;
    lock.addEventListener("release", () => {
      if (stopwatchWakeLock === lock) stopwatchWakeLock = null;
    });
  } catch (error) {
    stopwatchWakeLock = null;
  }
}

async function releaseStopwatchWakeLock() {
  const lock = stopwatchWakeLock;
  stopwatchWakeLock = null;
  if (!lock) return;

  try {
    await lock.release();
  } catch (error) {
    // The browser may already have released it after a visibility change.
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && isRunning && !stopwatchWakeLock) {
    requestStopwatchWakeLock();
  }
});

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
  quickAddMode = "popular";
  quickAddSelectedGroup = "";
  if (quickAddSearch) quickAddSearch.value = "";
  if (quickAddFavoritesOnly) quickAddFavoritesOnly.checked = false;
  if (quickAddNoMaterialOnly) quickAddNoMaterialOnly.checked = false;
  if (quickAddWarmup) quickAddWarmup.checked = false;
  renderQuickAddGroups();
  renderQuickAddResults();
  const firstExercise = quickAddResults?.querySelector(".quick-result-item");
  openOverlay(quickAddOverlay, { initialFocus: firstExercise || quickAddMostUsed || quickAddCustomBtn });
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
    row._orderEntry = entry;
    const title = document.createElement("div");
    title.className = "order-title";
    title.textContent = entry.name;
    const dragHandle = document.createElement("button");
    dragHandle.type = "button";
    dragHandle.className = "order-drag-handle";
    dragHandle.setAttribute("aria-label", `Mover ${entry.name}`);
    dragHandle.title = "Mantén pulsado y arrastra";
    dragHandle.textContent = "⋮";

    dragHandle.addEventListener("pointerdown", event => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      event.preventDefault();
      const activePointerId = event.pointerId;
      const startX = event.clientX;
      const startY = event.clientY;
      const rowRect = row.getBoundingClientRect();
      const dragGhost = row.cloneNode(true);
      dragGhost.classList.add("order-drag-ghost");
      dragGhost.classList.remove("is-dragging");
      dragGhost.setAttribute("aria-hidden", "true");
      dragGhost.style.left = `${rowRect.left}px`;
      dragGhost.style.top = `${rowRect.top}px`;
      dragGhost.style.width = `${rowRect.width}px`;
      dragGhost.style.height = `${rowRect.height}px`;
      document.body.appendChild(dragGhost);
      row.classList.add("is-dragging");
      document.body.classList.add("is-reordering");

      const moveRow = moveEvent => {
        if (moveEvent.pointerId !== activePointerId) return;
        moveEvent.preventDefault();
        dragGhost.style.transform = `translate3d(${moveEvent.clientX - startX}px, ${moveEvent.clientY - startY}px, 0)`;
        const otherRows = Array.from(orderList.querySelectorAll(".order-item"))
          .filter(item => item !== row);
        const nextRow = otherRows.find(item => {
          const rect = item.getBoundingClientRect();
          return moveEvent.clientY < rect.top + rect.height / 2;
        });

        if (nextRow) {
          orderList.insertBefore(row, nextRow);
        } else {
          orderList.appendChild(row);
        }
      };

      const finishDragging = finishEvent => {
        if (finishEvent?.pointerId != null && finishEvent.pointerId !== activePointerId) return;
        row.classList.remove("is-dragging");
        document.body.classList.remove("is-reordering");
        dragGhost.remove();
        items.splice(0, items.length, ...Array.from(orderList.children).map(item => item._orderEntry));
        document.removeEventListener("pointermove", moveRow);
        document.removeEventListener("pointerup", finishDragging);
        document.removeEventListener("pointercancel", finishDragging);
        window.removeEventListener("blur", finishDragging);
      };

      document.addEventListener("pointermove", moveRow, { passive: false });
      document.addEventListener("pointerup", finishDragging);
      document.addEventListener("pointercancel", finishDragging);
      window.addEventListener("blur", finishDragging);
    });

    dragHandle.addEventListener("keydown", event => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault();
      const currentIndex = items.indexOf(entry);
      const nextIndex = event.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex < 0 || nextIndex >= items.length) return;
      [items[currentIndex], items[nextIndex]] = [items[nextIndex], items[currentIndex]];
      renderOrderList(items);
      orderList.children[nextIndex]?.querySelector(".order-drag-handle")?.focus();
    });

    row.appendChild(title);
    row.appendChild(dragHandle);
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
    requestStopwatchWakeLock();
    startBtn.style.display = 'none'; // Ocultar botón iniciar
    stopwatchInterval = setInterval(() => {
      if (stopwatchTime > 0) {
        stopwatchTime--;
        updateDisplay();
      } else {
        clearInterval(stopwatchInterval);
        isRunning = false;
        releaseStopwatchWakeLock();
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
    releaseStopwatchWakeLock();
    startBtn.style.display = 'inline-block'; // Mostrar botón iniciar
  }
  stopBeepLoop();
});

resetBtn.addEventListener('click', () => {
  isRunning = false;
  clearInterval(stopwatchInterval);
  releaseStopwatchWakeLock();
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

function normalizeQuickAddText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase(getLocale());
}

function getQuickAddSearchText() {
  return normalizeQuickAddText(quickAddSearch?.value).trim();
}

function getQuickAddRecentNames(limit = 12) {
  const history = typeof getLocalHistory === "function" ? getLocalHistory() : [];
  const seen = new Set();
  const names = [];
  history
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .forEach(session => {
      (Array.isArray(session.exercises) ? session.exercises : []).forEach(ex => {
        const name = ex?.nombre?.trim();
        if (!name || seen.has(name)) return;
        seen.add(name);
        names.push(name);
      });
    });
  return names.slice(0, limit);
}

function getQuickAddUsageCounts() {
  const counts = new Map();
  const history = typeof getLocalHistory === "function" ? getLocalHistory() : [];
  history.forEach(session => {
    (Array.isArray(session.exercises) ? session.exercises : []).forEach(ex => {
      const name = ex?.nombre?.trim();
      if (!name) return;
      counts.set(name, (counts.get(name) || 0) + 1);
    });
  });
  return counts;
}

function getQuickAddPopularNames() {
  const counts = getQuickAddUsageCounts();
  return Object.keys(exerciseTemplates)
    .sort((a, b) => {
      const countDifference = (counts.get(b) || 0) - (counts.get(a) || 0);
      return countDifference || a.localeCompare(b, getLocale());
    });
}

function getQuickAddPool() {
  if (quickAddMode === "recent") return getQuickAddRecentNames();
  if (quickAddMode === "favorites") return loadFavorites();
  if (quickAddMode === "popular") return getQuickAddPopularNames();
  return Object.keys(exerciseTemplates);
}

function getQuickAddMatches() {
  const searchText = getQuickAddSearchText();
  const favoritesOnly = Boolean(quickAddFavoritesOnly?.checked);
  const noMaterialOnly = Boolean(quickAddNoMaterialOnly?.checked);
  const favorites = new Set(loadFavorites());
  const usageCounts = getQuickAddUsageCounts();

  const matches = getQuickAddPool().filter(name => {
    const tpl = exerciseTemplates[name];
    if (!tpl) return false;
    const group = resolveExerciseGroup(tpl);
    const section = tpl?.seccion || "";
    const muscle = tpl?.musculo || "";
    const searchable = normalizeQuickAddText(`${name} ${group} ${muscle} ${section}`);
    if (quickAddSelectedGroup && group !== quickAddSelectedGroup) return false;
    if (favoritesOnly && !favorites.has(name)) return false;
    if (noMaterialOnly && !tpl?.sinMaterial) return false;
    if (searchText && !searchable.includes(searchText)) return false;
    return true;
  });
  return matches.sort((a, b) => {
    const favoriteDifference = Number(favorites.has(b)) - Number(favorites.has(a));
    if (favoriteDifference) return favoriteDifference;
    if (quickAddMode === "popular") {
      const countDifference = (usageCounts.get(b) || 0) - (usageCounts.get(a) || 0);
      if (countDifference) return countDifference;
    }
    return a.localeCompare(b, getLocale());
  });
}

function updateQuickFilterStates() {
  [quickAddFavoritesOnly, quickAddNoMaterialOnly, quickAddWarmup].forEach(input => {
    const label = input?.closest(".quick-filter");
    if (label) label.classList.toggle("is-active", input.checked);
  });
}

function updateQuickShortcutStates() {
  if (quickAddShortcuts) {
    quickAddShortcuts.querySelectorAll(".quick-shortcut-btn").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.quickMode === quickAddMode);
    });
  }
  if (quickAddMostUsed) {
    const active = quickAddMode === "popular";
    quickAddMostUsed.classList.toggle("is-active", active);
    quickAddMostUsed.setAttribute("aria-pressed", active ? "true" : "false");
  }
}

function renderQuickAddGroups() {
  if (!quickAddGroups) return;
  const groups = getExerciseGroups();
  quickAddGroups.innerHTML = "";
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = `quick-group-chip${quickAddSelectedGroup ? "" : " is-active"}`;
  allBtn.textContent = t("quickAdd.allGroups");
  allBtn.addEventListener("click", () => {
    quickAddSelectedGroup = "";
    renderQuickAddGroups();
    renderQuickAddResults();
  });
  quickAddGroups.appendChild(allBtn);

  groups.forEach(group => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `quick-group-chip${quickAddSelectedGroup === group ? " is-active" : ""}`;
    btn.textContent = translateGroupLabel(group);
    btn.addEventListener("click", () => {
      quickAddSelectedGroup = quickAddSelectedGroup === group ? "" : group;
      renderQuickAddGroups();
      renderQuickAddResults();
    });
    quickAddGroups.appendChild(btn);
  });
}

function addQuickExercise(name) {
  if (!name) return;
  addExerciseFromTemplate(name, { calentamiento: quickAddWarmup?.checked === true });
  if (quickAddWarmup) quickAddWarmup.checked = false;
  closeQuickAddOverlay();
}

function renderQuickAddResults() {
  if (!quickAddResults) return;
  updateQuickShortcutStates();
  updateQuickFilterStates();
  const matches = getQuickAddMatches();
  const favorites = new Set(loadFavorites());
  const usageCounts = getQuickAddUsageCounts();
  quickAddResults.innerHTML = "";
  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "quick-add-empty";
    empty.textContent = quickAddFavoritesOnly?.checked
      ? t("quickAdd.emptyFavorites")
      : t("quickAdd.empty");
    quickAddResults.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  matches.forEach(name => {
    const tpl = exerciseTemplates[name] || {};
    const group = resolveExerciseGroup(tpl);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-result-item";
    button.classList.toggle("is-favorite", favorites.has(name));
    button.addEventListener("click", () => addQuickExercise(name));

    const title = document.createElement("span");
    title.className = "quick-result-title";
    title.textContent = name;

    const meta = document.createElement("span");
    meta.className = "quick-result-meta";
    meta.textContent = `${translateGroupLabel(group)} · ${tpl.seccion || tpl.musculo || "N/A"}`;

    const badges = document.createElement("span");
    badges.className = "quick-result-badges";
    if (favorites.has(name)) {
      const badge = document.createElement("span");
      badge.className = "quick-result-badge";
      badge.textContent = "★";
      badges.appendChild(badge);
    }
    const usageCount = usageCounts.get(name) || 0;
    if (usageCount > 0) {
      const badge = document.createElement("span");
      badge.className = "quick-result-badge quick-result-badge-usage";
      badge.textContent = `${usageCount}x`;
      badges.appendChild(badge);
    }
    if (tpl.sinMaterial) {
      const badge = document.createElement("span");
      badge.className = "quick-result-badge";
      badge.textContent = t("quickAdd.noMaterialBadge");
      badges.appendChild(badge);
    }

    const body = document.createElement("span");
    body.className = "quick-result-body";
    body.appendChild(title);
    body.appendChild(meta);
    button.appendChild(body);
    button.appendChild(badges);
    fragment.appendChild(button);
  });
  quickAddResults.appendChild(fragment);
}

if (quickAddSearch) {
  quickAddSearch.addEventListener("input", renderQuickAddResults);
  quickAddSearch.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    const first = getQuickAddMatches()[0];
    if (!first) return;
    event.preventDefault();
    addQuickExercise(first);
  });
}
if (quickAddShortcuts) {
  quickAddShortcuts.addEventListener("click", event => {
    const btn = event.target.closest(".quick-shortcut-btn");
    if (!btn) return;
    quickAddMode = btn.dataset.quickMode || "all";
    renderQuickAddResults();
  });
}
if (quickAddMostUsed) {
  quickAddMostUsed.addEventListener("click", () => {
    quickAddMode = quickAddMode === "popular" ? "all" : "popular";
    renderQuickAddResults();
  });
}
if (quickAddFavoritesOnly) {
  quickAddFavoritesOnly.addEventListener("change", renderQuickAddResults);
}
if (quickAddNoMaterialOnly) {
  quickAddNoMaterialOnly.addEventListener("change", renderQuickAddResults);
}
if (quickAddWarmup) {
  quickAddWarmup.addEventListener("change", updateQuickFilterStates);
}

if (quickAddCustomBtn) {
  quickAddCustomBtn.addEventListener("click", () => {
    if (customExerciseWarmup && quickAddWarmup) {
      customExerciseWarmup.checked = quickAddWarmup.checked;
    }
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
    if (typeof markSessionDirty === "function") {
      markSessionDirty();
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
    const isWarmup = customExerciseWarmup ? customExerciseWarmup.checked : false;
  if (!exercisesContainer) exercisesContainer = mainExercisesContainer;
  exercisesContainer.appendChild(
      buildExerciseCard({
        nombre: name,
        musculo: isCardio ? "Cardio" : "Personalizado",
        seccion: "N/A",
        hacer: "",
        noHacer: "",
        trucos: "",
        calentamiento: isWarmup,
        sets: []
      })
    );
    saveSession();
    const total = exercisesContainer.querySelectorAll(".exercise-card").length;
    activeExerciseIndex = Math.max(0, total - 1);
    scheduleExercisePagination();
    closeCustomExerciseOverlay();
    if (customExerciseWarmup) customExerciseWarmup.checked = false;
    if (quickAddWarmup) quickAddWarmup.checked = false;
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
    if (typeof markSessionDirty === "function") {
      markSessionDirty();
    }
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
