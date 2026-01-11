/* ==========================================================
   app.js — versión limpia y corregida (v5: Reseteo en Recarga + Persistencia de Dolor)
   Requiere: ejercicios.js + html2canvas + rutinas.html
   ========================================================== */

// Elementos del DOM
const dateInput = document.getElementById("date-input");
const weekSelect = document.getElementById("week-select");
const daySelect = document.getElementById("day-select");
const routineSelect = document.getElementById("routine-select");

const loadBtn = document.getElementById("load-routine-btn");
const deleteRoutineBtn = document.getElementById("delete-routine-btn");
const exportBtn = document.getElementById("export-png-btn"); 
const saveSessionBtn = document.getElementById("save-session-btn");
const saveSessionMessage = document.getElementById("save-session-message");
const saveSessionError = document.getElementById("save-session-error");
const postWorkoutSection = document.getElementById("post-workout-section");
const saveRoutineBtn = document.getElementById("save-routine-btn");
const saveRoutineMessage = document.getElementById("save-routine-message");
const saveRoutineError = document.getElementById("save-routine-error");

const mainExercisesContainer = document.getElementById("exercises-container");
const editExercisesContainer = document.getElementById("edit-exercises-container");
let exercisesContainer = mainExercisesContainer;
const statusText = document.getElementById("status-text");

const userHistoryControls = document.getElementById("user-history-controls");
const userHistorySelect = document.getElementById("user-history-select");
const newUserHistoryBtn = document.getElementById("new-user-history-btn");
const renameUserHistoryBtn = document.getElementById("rename-user-history-btn");
const deleteUserHistoryBtn = document.getElementById("delete-user-history-btn");
const exportUserHistoryBtn = document.getElementById("export-user-history-btn");
const exportUserHistoryCsvBtn = document.getElementById("export-user-history-csv-btn");
const importMergeHistoryBtn = document.getElementById("import-merge-history-btn");
const importMergeHistoryInput = document.getElementById("import-merge-history-input");
const userHistoryStatus = document.getElementById("user-history-status");
const appContent = document.getElementById("app-content");
const importOverlay = document.getElementById("import-overlay");
const importUserSelect = document.getElementById("import-user-select");
const importOverlayCancel = document.getElementById("import-overlay-cancel");
const importOverlayConfirm = document.getElementById("import-overlay-confirm");
const manageUserOverlay = document.getElementById("manage-user-overlay");
const manageUserClose = document.getElementById("manage-user-close");
const manageUserHistoryBtn = document.getElementById("manage-user-history-btn");
const manageUserNameLabel = document.getElementById("manage-user-name");
const historyMenuOverlay = document.getElementById("history-menu-overlay");
const historyMenuClose = document.getElementById("history-menu-close");
const step0 = document.getElementById("step-0");
const step1 = document.getElementById("step-1");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");
const step4 = document.getElementById("step-4");
const step5 = document.getElementById("step-5");
const step6 = document.getElementById("step-6");
const step7 = document.getElementById("step-7");
const step3Body = document.getElementById("step-3-body");
const step7Body = document.getElementById("step-7-body");
const step1Status = document.getElementById("step-1-status");
const step2Status = document.getElementById("step-2-status");
const step3Status = document.getElementById("step-3-status");
const step4Status = document.getElementById("step-4-status");
const step5Status = document.getElementById("step-5-status");
const step6Status = document.getElementById("step-6-status");
const stepperPrevBtn = document.getElementById("stepper-prev");
const stepperNextBtn = document.getElementById("stepper-next");
const subheader = document.getElementById("subheader");
const toggleUserManageBtn = document.getElementById("toggle-user-manage");
const toggleStopwatchBtn = document.getElementById("toggle-stopwatch");
const toggleQuickAddBtn = document.getElementById("toggle-quick-add");
const toggleOrderModeBtn = document.getElementById("toggle-order-mode");
const toggleFastModeBtn = document.getElementById("toggle-fast-mode");
const fastModeLabel = document.getElementById("fast-mode-label");
const autoSaveStatus = document.getElementById("autosave-status");
const exerciseEmptyState = document.getElementById("exercise-empty-state");
const welcomeStartBtn = document.getElementById("welcome-start-btn");
const welcomeInfoBtn = document.getElementById("welcome-info-btn");
const welcomeLegalBtn = document.getElementById("welcome-legal-btn");
const welcomeInfoPanel = document.getElementById("welcome-info");
const welcomeLegalPanel = document.getElementById("welcome-legal");
const exerciseCounter = document.getElementById("exercise-counter");
const exercisePrevBtn = document.getElementById("exercise-prev");
const exerciseNextBtn = document.getElementById("exercise-next");
const saveRoutineControls = document.getElementById("save-routine-controls");
const homeLogoBtn = document.getElementById("home-logo-btn");
const historyDateInput = document.getElementById("history-date-input");
const historyViewBtn = document.getElementById("history-view-btn");
const historyEditBtn = document.getElementById("history-edit-btn");
const historyViewOverlay = document.getElementById("history-view-overlay");
const historyViewContent = document.getElementById("history-view-content");
const historyViewClose = document.getElementById("history-view-close");
const sessionSummary = document.getElementById("session-summary");
const removeExerciseBtn = document.getElementById("remove-exercise-btn");
const step2ModeInputs = document.querySelectorAll('input[name="step2-mode"]');
const step2ManualSection = document.getElementById("step2-manual");
const step2PreviousSection = document.getElementById("step2-previous");
const step2PredefinedSection = document.getElementById("step2-predefined");
const historyDaySelect = document.getElementById("history-day-select");
const loadPreviousSessionBtn = document.getElementById("load-previous-session-btn");

const LOCAL_HISTORY_KEY = "gym_history_v1";
const USER_LIST_KEY = "gym_user_list";
const CUSTOM_ROUTINES_KEY = "gym_custom_routines_v1";
let lastRoutinePromptSignature = "";
const ROUTINE_VALUE_SEP = "|||";

function getSafeStorage() {
  try {
    const testKey = "__gym_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (err) {
    const memory = new Map();
    return {
      getItem: key => (memory.has(key) ? memory.get(key) : null),
      setItem: (key, value) => {
        memory.set(key, String(value));
      },
      removeItem: key => {
        memory.delete(key);
      },
      key: index => Array.from(memory.keys())[index] ?? null,
      get length() {
        return memory.size;
      }
    };
  }
}

const storage = getSafeStorage();

const LANG_KEY = "gym_lang";
const FONT_SCALE_KEY = "gym_font_scale";
const FONT_SCALE_MIN = 0.75;
const FONT_SCALE_MAX = 1.45;
const FONT_SCALE_STEP = 0.05;
const SESSION_MODE_KEY = "gym_session_mode";
const SESSION_MODE_DEFAULT = "manual";
const DEFAULT_LANG = "es";
const I18N_STRINGS = {
  ca: {
    "app.title": "Registre de rutines de gimnàs",
    "label.language": "Idioma",
    "lang.ca": "CAT",
    "lang.es": "ESP",
    "lang.en": "ENG",
    "header.backHome": "Torna a l'inici",
    "header.changeTheme": "Canvia el tema",
    "header.appIconAlt": "Icona de l'app",
    "header.borjaAlt": "Logotip de Borja Aguado",
    "subheader.title": "Barra d'opcions",
    "textSize.decrease": "Reduir text",
    "textSize.increase": "Augmentar text",
    "aria.manageUser": "Gestionar usuari",
    "aria.countdown": "Compte enrere",
    "aria.exercises": "Exercicis",
    "aria.toggleMode": "Canviar mode",
    "stopwatch.start": "Inicia",
    "stopwatch.stop": "Atura",
    "stopwatch.reset": "Reinicia",
    "welcome.start": "Inicia sessió",
    "welcome.info": "Informació rellevant",
    "welcome.legal": "Avisos legals i mèdics",
    "welcome.info.privacy": "<b>Privacitat:</b> no es guarden dades al núvol. Tot s'emmagatzema localment al dispositiu.",
    "welcome.info.sync": "<b>Sense sincronització:</b> les dades no es comparteixen entre dispositius excepte si exportes i importes manualment.",
    "welcome.info.important": "<b>Important:</b> si esborres les dades del navegador o l'app, es perdran. Exporta còpies si les vols conservar.",
    "welcome.info.shortcut": "<b>Accés directe:</b> iOS → Compartir → “Afegir a la pantalla d'inici”. Android → Menú → “Instal·lar l'app”.",
    "welcome.legal.legal": "<b>Avís legal:</b> GitHub Pages només serveix fitxers estàtics, sense base de dades ni servidor on pujar dades.",
    "welcome.legal.medical": "<b>Avís mèdic:</b> aquesta aplicació no ofereix assessorament mèdic ni esportiu. Consulta un professional abans de fer canvis en el teu entrenament, especialment si tens lesions o condicions prèvies.",
    "welcome.legal.use": "<b>Ús i responsabilitat:</b> utilitzes la web sota el teu compte i risc. No es garanteix la disponibilitat ni la conservació de les dades si canvies de dispositiu, navegador o mode privat.",
    "welcome.legal.warranty": "<b>Sense garanties:</b> l'aplicació s'ofereix “tal com és”, sense garanties de disponibilitat, continuïtat o absència d'errors.",
    "welcome.legal.limitation": "<b>Limitació de responsabilitat:</b> el creador no es fa responsable de danys indirectes, pèrdues de beneficis o decisions preses a partir de la informació registrada.",
    "step0.title": "Inici",
    "step0.status": "Benvinguda",
    "step1.summary": "Pas 1: Selecció d'usuaris",
    "step1.hint": "Pas 1 · Selecció d'usuari",
    "step1.statusText": "Comença seleccionant un usuari per carregar les seves dades.",
    "step2.summary": "Pas 2: Com vols iniciar la sessió?",
    "step2.hint": "Pas 2: Tria com vols crear la sessió",
    "step2.option.manual": "Crear la sessió manualment",
    "step2.option.previous": "Carregar una sessió prèvia",
    "step2.option.predefined": "Utilitzar una sessió predefinida",
    "step2.manualHint": "Afegeix exercicis a la sessió des del pas 3.",
    "step3.summary": "Pas 3: Exercicis de la sessió",
    "step3.hint": "Pas 3 · Exercicis de la sessió",
    "step4.summary": "Pas 4: Qüestionari post-entrenament",
    "step4.hint": "Pas 4 · Qüestionari post-entrenament",
    "step5.summary": "Pas 5: Resum de la sessió",
    "step5.hint": "Pas 5 · Resum de la sessió",
    "step6.summary": "Pas 6: Gràfics de l'usuari",
    "step6.hint": "Pas 6 · Gràfics de l'usuari",
    "step7.summary": "Pas 7: Edita sessió anterior",
    "step7.hint": "Pas 7 · Edita sessió anterior",
    "status.pending": "Pendent",
    "status.optional": "Opcional",
    "status.inProgress": "En progrés",
    "status.completed": "Completat",
    "status.blocked": "Bloquejat",
    "status.available": "Disponible",
    "status.editing": "Edició",
    "label.user": "Usuari",
    "label.week": "Setmana",
    "label.day": "Dia",
    "label.routine": "Rutines",
    "label.exercise": "Exercici",
    "label.muscleGroup": "Grup muscular",
    "label.variable": "Variable",
    "label.date": "Data",
    "label.exercises": "Exercicis",
    "label.sensGeneral": "Sensacions generals de l'entrenament 0-10 (molt malament - excel·lent)",
    "label.sensTiredness": "Cansament percebut 0-10",
    "label.sensWeight": "Pes corporal (kg) - Opcional",
    "label.sensPain": "Dolor en algun múscul (sí/no)",
    "label.painZone": "Zona del dolor",
    "label.painExercise": "Identifica si algun exercici pot haver estat el responsable",
    "placeholder.sensGeneral": "Ex: 8",
    "placeholder.sensTiredness": "Ex: 6",
    "placeholder.sensWeight": "Ex: 78.5",
    "placeholder.painZone": "Ex: Espatlla dreta",
    "placeholder.selectGroup": "Seleccionar grup...",
    "placeholder.selectExercise": "Seleccionar exercici...",
    "stopwatch.placeholder": "Temps en segons (ex: 60)",
    "customExercise.namePlaceholder": "Ex: Rem en barra",
    "cardio.placeholderIntensity": "1-10",
    "cardio.placeholderTime": "min",
    "option.no": "No",
    "option.yes": "Sí",
    "option.notIdentified": "No identificat",
    "week.1": "Setmana 1",
    "week.2": "Setmana 2",
    "week.3": "Setmana 3",
    "week.4": "Setmana 4",
    "week.5": "Setmana 5",
    "day.1": "Dia 1 – Tren superior (tracció)",
    "day.2": "Dia 2 – Tren superior (empenta)",
    "day.3": "Dia 3 – Tren inferior + core",
    "button.newUser": "Crea un usuari nou",
    "button.importMerge": "Importa dades (fusiona)",
    "button.loadRoutine": "Carrega rutina",
    "button.deleteRoutine": "Esborra rutina",
    "button.saveRoutine": "Desa rutina",
    "button.loadPreviousSession": "Carrega sessió prèvia",
    "button.saveSession": "Desa sessió de l'usuari",
    "button.exportPng": "Imatge de sessió completa (📷)",
    "button.selectExercises": "Selecciona exercicis",
    "button.generateChart": "Genera gràfic",
    "button.merge": "Fusiona",
    "button.close": "Tanca",
    "button.cancel": "Cancel·la",
    "button.add": "Afegir",
    "button.custom": "Personalitzat",
    "button.prev": "Anterior",
    "button.next": "Següent",
    "button.order": "Ordenar",
    "button.apply": "Aplicar",
    "button.view": "Veure",
    "button.edit": "Edita",
    "footer.createdBy": "Web creada per",
    "footer.licensePrefix": "Codi sota",
    "footer.licenseLink": "Llicència Creative Commons Reconeixement-CompartirIgual 4.0 Internacional",
    "import.title": "Selecciona l'usuari per fusionar",
    "manage.title": "Gestió de l'usuari",
    "manage.history": "Sessions anteriors",
    "manage.rename": "Canvia el nom de l'usuari",
    "manage.exportJson": "Còpia de seguretat (JSON)",
    "manage.exportCsv": "Exporta dades d'anàlisi (CSV)",
    "manage.delete": "Elimina usuari",
    "history.menuTitle": "Sessions anteriors",
    "order.title": "Ordenar exercicis",
    "order.empty": "No hi ha exercicis per ordenar.",
    "history.viewTitle": "Sessió seleccionada",
    "postWorkout.title": "Qüestionari de Post-Entrenament",
    "customExercise.title": "Exercici personalitzat",
    "customExercise.nameLabel": "Nom de l'exercici",
    "customExercise.isCardio": "És cardio",
    "charts.title": "Gràfics de l'usuari",
    "charts.noData": "Encara no hi ha dades d'aquest usuari. Desa sessions o importa dades per veure els gràfics.",
    "chart.variable.maxWeight": "Pes màxim",
    "chart.variable.totalLoad": "Càrrega total (pes x reps)",
    "chart.variable.cardioIntensity": "Cardio - Intensitat màxima",
    "chart.variable.cardioTime": "Cardio - Temps total (min)",
    "chart.variable.sensGeneral": "Sensacions generals (0-10)",
    "chart.variable.sensTiredness": "Cansament percebut (0-10)",
    "chart.variable.sensWeight": "Pes corporal (kg)",
    "chart.variable.sensPain": "Dolor en algun múscul (Sí/No)",
    "chart.generateLabel": "Genera gràfic",
    "chart.alert.selectExercise": "Selecciona com a mínim un exercici.",
    "chart.axis.date": "Data",
    "chart.axis.weight": "Pes (kg)",
    "chart.axis.load": "Càrrega (kg*reps)",
    "chart.axis.intensity": "Intensitat (1-10)",
    "chart.axis.time": "Temps (min)",
    "chart.axis.pain": "Dolor (0=No, 1=Sí)",
    "chart.axis.score": "Puntuació (0-10)",
    "chart.axis.sensations": "Sensacions (0-10)",
    "chart.axis.bodyWeight": "Pes corporal (kg)",
    "chart.option.bodyWeight": "Pes corporal",
    "exercise.counter.empty": "Exercici 0 de 0",
    "exercise.counter.all": "Exercicis: {total}",
    "exercise.counter.current": "Exercici {current} de {total}",
    "exercise.empty": "Encara no hi ha exercicis en aquesta sessió. Usa el botó taronja a dalt a la dreta \"+\" per afegir el primer exercici.",
    "fastMode.basic": "+ info",
    "fastMode.detailed": "- info",
    "autoSave.now": "Desat ara",
    "autoSave.ago": "Desat fa {seconds} s",
    "session.noData": "Sense dades de sessió.",
    "session.table.exercise": "Exercici",
    "session.table.set": "Sèrie",
    "session.table.weightIntensity": "Pes/<br>Intensitat",
    "session.table.repsTime": "Reps/<br>Temps",
    "session.table.failure": "Fallada",
    "session.table.failureReps": "Reps de fallada",
    "session.table.notes": "Notes",
    "session.table.series": "Sèries",
    "session.table.maxWeightTime": "Pes màx / Temps",
    "session.summary.header": "Resum:",
    "session.summary.totalExercises": "- Total exercicis: {count}",
    "session.summary.totalSets": "- Total sèries: {count}",
    "session.metrics.title": "Mètriques subjectives:",
    "session.metrics.general": "- Sensacions generals (0-10): {value}",
    "session.metrics.tiredness": "- Cansament percebut (0-10): {value}",
    "session.metrics.pain": "- Dolor en algun múscul: {value}",
    "session.footer": "Registrat amb GymTracker by Borja Aguado",
    "session.failure.yes": "Sí",
    "session.failure.no": "No",
    "session.pain.zoneNA": "Zona N/A",
    "session.pain.exerciseNA": "Exercici: N/A",
    "warning.overload": "Avís de sobrecàrrega: últim màxim {baseline} kg, ara {current} kg.",
    "history.view.date": "Data",
    "history.view.week": "Setmana",
    "history.view.day": "Dia",
    "history.view.exercises": "Exercicis",
    "history.view.exerciseDefault": "Exercici",
    "history.view.sets": "sèries",
    "status.historyRenamed": "Històric reanomenat a {name}.",
    "status.historyDeleted": "Històric eliminat.",
    "status.selectUser": "Selecciona un usuari",
    "status.noUsers": "No hi ha usuaris. Crea'n un de nou per començar.",
    "status.selectUserContinue": "Selecciona un usuari per continuar",
    "status.selectDay": "Selecciona un dia.",
    "status.noHistoryDay": "No hi ha sessions per a aquest dia.",
    "status.noHistorySessions": "No hi ha sessions prèvies disponibles.",
    "status.loadedPreviousSession": "Sessió prèvia carregada.",
    "status.userActive": "Usuari actiu: {name}",
    "status.createdLoaded": "Usuari creat i carregat.",
    "status.userExported": "Dades de l'usuari exportades.",
    "status.userExportedCsv": "CSV de l'usuari exportat.",
    "status.noUserDataExport": "No hi ha dades d'aquest usuari per exportar.",
    "status.importMerged": "Dades importades i fusionades correctament.",
    "status.importError": "Error en fusionar les dades: {error}",
    "prompt.newUserName": "Nom del nou usuari:",
    "prompt.routineName": "Nom de la rutina:",
    "alert.selectValidUser": "Selecciona un usuari vàlid.",
    "alert.userExists": "Ja existeix un usuari amb aquest nom.",
    "confirm.deleteUser": "Eliminar l'usuari \"{name}\"? Aquesta acció no es pot desfer.",
    "alert.selectUserRename": "Selecciona un usuari per reanomenar.",
    "alert.selectUserDelete": "Selecciona un usuari per eliminar.",
    "alert.selectUserExport": "Selecciona un usuari per exportar.",
    "alert.noDataToday": "No hi ha dades registrades avui.",
    "alert.noUserInImport": "No s'ha trobat un nom d'usuari a les dades importades.",
    "confirm.saveNewRoutine": "Aquesta rutina no està desada. La vols desar?",
    "confirm.overwriteRoutine": "La rutina \"{name}\" ja existeix. La vols sobrescriure?",
    "confirm.deleteRoutine": "Esborrar la rutina personalitzada \"{name}\"?",
    "status.selectUserBeforeSaveRoutine": "Selecciona un usuari abans de desar rutines personalitzades.",
    "status.noExercisesToSaveRoutine": "Afegeix com a mínim un exercici abans de desar la rutina.",
    "status.emptyRoutineName": "El nom de la rutina no pot estar buit.",
    "status.noValidExercises": "No s'han trobat exercicis vàlids.",
    "status.routineAdded": "Ja apareix a rutines predefinides.",
    "status.postWorkoutExportError": "Completa tot el qüestionari de post-entrenament abans d'exportar.",
    "status.postWorkoutSaveError": "Completa tot el qüestionari de post-entrenament abans de desar.",
    "status.sessionSavedLocal": "Sessió desada a l'històric local.",
    "status.saved": "Desat",
    "status.loadedMemory": "Carregat des de memòria",
    "status.loadedRoutine": "Carregat des de rutina base",
    "status.noRoutine": "No hi ha rutina definida",
    "status.selectUserBeforeRoutineDelete": "Selecciona un usuari abans d'esborrar rutines.",
    "status.selectRoutineToDelete": "Selecciona una rutina per esborrar.",
    "status.onlyCustomRoutineDelete": "Només pots esborrar rutines personalitzades.",
    "status.routineDeleted": "Rutina esborrada.",
    "status.timeFinished": "Temps acabat.",
    "error.addExerciseToActivate": "Afegeix com a mínim un exercici per activar el qüestionari post-entrenament.",
    "error.completeQuestionnaire": "Completa el qüestionari post-entrenament per activar els botons.",
    "error.requiredField": "Camp obligatori.",
    "error.painZoneRequired": "Indica la zona del dolor.",
    "error.exerciseRequired": "Selecciona un exercici.",
    "error.completeQuestionnaireButtons": "Completa el qüestionari per activar els botons.",
    "message.sessionSavedTitle": "Sessió desada.",
    "message.routineSavedTitle": "Rutina desada.",
    "message.errorTitle": "Error.",
    "message.saveSessionRandom.0": "Ben fet! :)",
    "message.saveSessionRandom.1": "Ets una màquina! 💪",
    "message.saveSessionRandom.2": "Gran feina, segueix així! 😎",
    "message.saveSessionRandom.3": "Bon ritme, a per la següent! 🚀",
    "message.saveSessionRandom.4": "Ritme sòlid, segueix sumant! 🔥",
    "message.saveSessionRandom.5": "Avui s'entrena, demà es presumeix! 😄",
    "message.saveSessionRandom.6": "Vas fi, molt bona feina! ✅",
    "message.saveSessionRandom.7": "Cada dia més fort! 🦾",
    "message.saveSessionRandom.8": "Objectiu complert, a descansar! 🧘",
    "message.saveSessionRandom.9": "Suma i segueix, campió! 🏆",
    "message.saveSessionRandom.10": "En flames! 🔥",
    "message.saveSessionRandom.11": "Progrés real, segueix així! 📈",
    "message.saveSessionRandom.12": "Mode bèstia activat! 🐺",
    "message.saveSessionRandom.13": "Deixant empremta, crack! 👊",
    "message.saveSessionRandom.14": "Nivell Llados, a tope! 💥",
    "message.saveSessionRandom.15": "Croissant 🥐 amb faking cafè?! Tu no!",
    "message.saveSessionRandom.16": "Panxa? Això és com foak, ni de conya! 🔥",
    "message.saveSessionRandom.17": "Entrenament net, ment forta! 🧠",
    "exercise.history.none": "Sense historial per a aquest exercici.",
    "exercise.table.cardio": "<th>Sèrie</th><th>Intensitat</th><th>Temps (min)</th><th>Notes</th><th class=\"set-action-col\"></th>",
    "exercise.table.strength": "<th>Sèrie</th><th>Pes</th><th>Reps</th><th>Fallada</th><th>Reps de fallada</th><th>Notes</th><th class=\"set-action-col\"></th>",
    "exercise.addSet": "Afegir sèrie",
    "exercise.removeSet": "Eliminar sèrie",
    "exercise.remove": "Eliminar exercici",
    "exercise.notes.title": "Notes de tècnica",
    "exercise.notes.how": "Com fer-ho:",
    "exercise.notes.avoid": "Evitar:",
    "exercise.notes.tips": "Trucs:",
    "exercise.custom.noDescription": "Descripció no disponible per a exercicis personalitzats.",
    "exercise.lastSession": "Última sessió: {date} · {detail}",
    "exercise.lastSession.cardio": "Cardio: {detail}",
    "exercise.cardio.noData": "Cardio sense dades",
    "exercise.firstSet": "Primera sèrie: {detail}",
    "exercise.firstSet.noData": "Primera sèrie sense dades",
    "exercise.detail.intensity": "Intensitat {value}",
    "exercise.detail.time": "{value} min",
    "exercise.detail.weight": "{value} kg",
    "exercise.detail.reps": "{value} reps",
    "group.Pecho": "Pectoral",
    "group.Espalda": "Esquena",
    "group.Hombros": "Espatlles",
    "group.Brazos": "Braços",
    "group.Piernas": "Cames",
    "group.Antebrazos": "Avantbraços",
    "group.Cardio": "Cardio",
    "group.Core": "Core",
    "group.Otros": "Altres",
    "group.Personalizado": "Personalitzat",
    "file.sessionPrefix": "sessio",
    "file.historyPrefix": "historic",
    "muscle.Pectoral": "Pectoral",
    "muscle.Deltoides": "Deltoides",
    "muscle.Bíceps": "Bíceps",
    "muscle.Tríceps": "Tríceps",
    "muscle.Espalda": "Esquena",
    "muscle.Dorsal": "Dorsal",
    "muscle.Cuádriceps": "Quàdriceps",
    "muscle.Femoral": "Isquiotibials",
    "muscle.Gemelos": "Bessons",
    "muscle.Glúteo": "Gluti",
    "muscle.Cardio": "Cardio",
    "muscle.Antebrazo": "Avantbraç",
    "muscle.Trapecio": "Trapezi",
    "muscle.Abdominales": "Abdominals",
    "muscle.Oblicuos": "Oblics",
    "muscle.Transverso": "Transvers",
    "muscle.Inferior": "Inferior",
    "muscle.Lateral": "Lateral",
    "csv.usuario": "usuari",
    "csv.fecha": "data",
    "csv.semana": "setmana",
    "csv.dia": "dia",
    "csv.ejercicio": "exercici",
    "csv.musculo": "muscul",
    "csv.seccion": "secció",
    "csv.serie": "sèrie",
    "csv.peso": "pes",
    "csv.reps": "reps",
    "csv.fallo": "fallada",
    "csv.reps_fallo": "reps_fallada",
    "csv.intensidad": "intensitat",
    "csv.tiempo": "temps",
    "csv.notas": "notes",
    "csv.sens_general": "sens_general",
    "csv.sens_tiredness": "sens_tiredness",
    "csv.sens_weight": "sens_weight",
    "csv.sens_pain": "sens_pain",
    "csv.sens_pain_zone": "sens_pain_zone",
    "csv.sens_pain_exercise": "sens_pain_exercise"
  },
  en: {
    "app.title": "Gym Routine Tracker",
    "label.language": "Language",
    "lang.ca": "CAT",
    "lang.es": "ESP",
    "lang.en": "ENG",
    "header.backHome": "Back to home",
    "header.changeTheme": "Switch theme",
    "header.appIconAlt": "App icon",
    "header.borjaAlt": "Borja Aguado logo",
    "subheader.title": "Options bar",
    "textSize.decrease": "Decrease text",
    "textSize.increase": "Increase text",
    "aria.manageUser": "Manage user",
    "aria.countdown": "Countdown",
    "aria.exercises": "Exercises",
    "aria.toggleMode": "Toggle mode",
    "stopwatch.start": "Start",
    "stopwatch.stop": "Stop",
    "stopwatch.reset": "Reset",
    "welcome.start": "Start session",
    "welcome.info": "Relevant info",
    "welcome.legal": "Legal and medical notices",
    "welcome.info.privacy": "<b>Privacy:</b> no data is stored in the cloud. Everything is stored locally on your device.",
    "welcome.info.sync": "<b>No sync:</b> data is not shared between devices unless you export and import manually.",
    "welcome.info.important": "<b>Important:</b> if you delete browser or app data, it will be lost. Export backups if you want to keep them.",
    "welcome.info.shortcut": "<b>Shortcut:</b> iOS → Share → “Add to Home Screen”. Android → Menu → “Install app”.",
    "welcome.legal.legal": "<b>Legal notice:</b> GitHub Pages only serves static files, with no database or server to upload data.",
    "welcome.legal.medical": "<b>Medical disclaimer:</b> this app does not provide medical or sports advice. Consult a professional before making changes to your training, especially if you have injuries or prior conditions.",
    "welcome.legal.use": "<b>Use and responsibility:</b> you use the website at your own risk. Availability or data preservation is not guaranteed if you change device, browser, or private mode.",
    "welcome.legal.warranty": "<b>No warranties:</b> the app is provided “as is”, without guarantees of availability, continuity, or error-free operation.",
    "welcome.legal.limitation": "<b>Limitation of liability:</b> the creator is not responsible for indirect damages, lost profits, or decisions made based on recorded information.",
    "step0.title": "Home",
    "step0.status": "Welcome",
    "step1.summary": "Step 1: User selection",
    "step1.hint": "Step 1 · User selection",
    "step1.statusText": "Start by selecting a user to load their data.",
    "step2.summary": "Step 2: How do you want to start?",
    "step2.hint": "Step 2: Choose how you want to create the session",
    "step2.option.manual": "Create the session manually",
    "step2.option.previous": "Load a previous session",
    "step2.option.predefined": "Use a preset session",
    "step2.manualHint": "Add exercises in step 3.",
    "step3.summary": "Step 3: Session exercises",
    "step3.hint": "Step 3 · Session exercises",
    "step4.summary": "Step 4: Post-workout questionnaire",
    "step4.hint": "Step 4 · Post-workout questionnaire",
    "step5.summary": "Step 5: Session summary",
    "step5.hint": "Step 5 · Session summary",
    "step6.summary": "Step 6: User charts",
    "step6.hint": "Step 6 · User charts",
    "step7.summary": "Step 7: Edit previous session",
    "step7.hint": "Step 7 · Edit previous session",
    "status.pending": "Pending",
    "status.optional": "Optional",
    "status.inProgress": "In progress",
    "status.completed": "Completed",
    "status.blocked": "Locked",
    "status.available": "Available",
    "status.editing": "Editing",
    "label.user": "User",
    "label.week": "Week",
    "label.day": "Day",
    "label.routine": "Routines",
    "label.exercise": "Exercise",
    "label.muscleGroup": "Muscle group",
    "label.variable": "Variable",
    "label.date": "Date",
    "label.exercises": "Exercises",
    "label.sensGeneral": "Overall workout feel 0-10 (very bad - excellent)",
    "label.sensTiredness": "Perceived fatigue 0-10",
    "label.sensWeight": "Body weight (kg) - Optional",
    "label.sensPain": "Pain in any muscle (yes/no)",
    "label.painZone": "Pain area",
    "label.painExercise": "Identify if any exercise might have caused it",
    "placeholder.sensGeneral": "e.g. 8",
    "placeholder.sensTiredness": "e.g. 6",
    "placeholder.sensWeight": "e.g. 78.5",
    "placeholder.painZone": "e.g. Right shoulder",
    "placeholder.selectGroup": "Select group...",
    "placeholder.selectExercise": "Select exercise...",
    "stopwatch.placeholder": "Time in seconds (e.g. 60)",
    "customExercise.namePlaceholder": "e.g. Barbell row",
    "cardio.placeholderIntensity": "1-10",
    "cardio.placeholderTime": "min",
    "option.no": "No",
    "option.yes": "Yes",
    "option.notIdentified": "Not identified",
    "week.1": "Week 1",
    "week.2": "Week 2",
    "week.3": "Week 3",
    "week.4": "Week 4",
    "week.5": "Week 5",
    "day.1": "Day 1 – Upper body (pull)",
    "day.2": "Day 2 – Upper body (push)",
    "day.3": "Day 3 – Lower body + core",
    "button.newUser": "Create new user",
    "button.importMerge": "Import data (merge)",
    "button.loadRoutine": "Load routine",
    "button.deleteRoutine": "Delete routine",
    "button.saveRoutine": "Save routine",
    "button.loadPreviousSession": "Load previous session",
    "button.saveSession": "Save user session",
    "button.exportPng": "Full session image (📷)",
    "button.selectExercises": "Select exercises",
    "button.generateChart": "Generate chart",
    "button.merge": "Merge",
    "button.close": "Close",
    "button.cancel": "Cancel",
    "button.add": "Add",
    "button.custom": "Custom",
    "button.prev": "Previous",
    "button.next": "Next",
    "button.order": "Order",
    "button.apply": "Apply",
    "button.view": "View",
    "button.edit": "Edit",
    "footer.createdBy": "Website by",
    "footer.licensePrefix": "Code licensed under",
    "footer.licenseLink": "Creative Commons Attribution-ShareAlike 4.0 International License",
    "import.title": "Select the user to merge",
    "manage.title": "User management",
    "manage.history": "Previous sessions",
    "manage.rename": "Rename user",
    "manage.exportJson": "Backup (JSON)",
    "manage.exportCsv": "Export analysis data (CSV)",
    "manage.delete": "Delete user",
    "history.menuTitle": "Previous sessions",
    "order.title": "Reorder exercises",
    "order.empty": "No exercises to reorder.",
    "history.viewTitle": "Selected session",
    "postWorkout.title": "Post-workout questionnaire",
    "customExercise.title": "Custom exercise",
    "customExercise.nameLabel": "Exercise name",
    "customExercise.isCardio": "Is cardio",
    "charts.title": "User charts",
    "charts.noData": "No data for this user yet. Save sessions or import data to see charts.",
    "chart.variable.maxWeight": "Max weight",
    "chart.variable.totalLoad": "Total load (weight x reps)",
    "chart.variable.cardioIntensity": "Cardio - Max intensity",
    "chart.variable.cardioTime": "Cardio - Total time (min)",
    "chart.variable.sensGeneral": "Overall feel (0-10)",
    "chart.variable.sensTiredness": "Perceived fatigue (0-10)",
    "chart.variable.sensWeight": "Body weight (kg)",
    "chart.variable.sensPain": "Pain in any muscle (Yes/No)",
    "chart.generateLabel": "Generate chart",
    "chart.alert.selectExercise": "Select at least one exercise.",
    "chart.axis.date": "Date",
    "chart.axis.weight": "Weight (kg)",
    "chart.axis.load": "Load (kg*reps)",
    "chart.axis.intensity": "Intensity (1-10)",
    "chart.axis.time": "Time (min)",
    "chart.axis.pain": "Pain (0=No, 1=Yes)",
    "chart.axis.score": "Score (0-10)",
    "chart.axis.sensations": "Feelings (0-10)",
    "chart.axis.bodyWeight": "Body weight (kg)",
    "chart.option.bodyWeight": "Body weight",
    "exercise.counter.empty": "Exercise 0 of 0",
    "exercise.counter.all": "Exercises: {total}",
    "exercise.counter.current": "Exercise {current} of {total}",
    "exercise.empty": "No exercises yet in this session. Use the orange button at the top right \"+\" to add the first exercise.",
    "fastMode.basic": "+ info",
    "fastMode.detailed": "- info",
    "autoSave.now": "Saved just now",
    "autoSave.ago": "Saved {seconds} s ago",
    "session.noData": "No session data.",
    "session.table.exercise": "Exercise",
    "session.table.set": "Set",
    "session.table.weightIntensity": "Weight/<br>Intensity",
    "session.table.repsTime": "Reps/<br>Time",
    "session.table.failure": "Failure",
    "session.table.failureReps": "Failure reps",
    "session.table.notes": "Notes",
    "session.table.series": "Sets",
    "session.table.maxWeightTime": "Max weight / Time",
    "session.summary.header": "Summary:",
    "session.summary.totalExercises": "- Total exercises: {count}",
    "session.summary.totalSets": "- Total sets: {count}",
    "session.metrics.title": "Subjective metrics:",
    "session.metrics.general": "- Overall feel (0-10): {value}",
    "session.metrics.tiredness": "- Perceived fatigue (0-10): {value}",
    "session.metrics.pain": "- Pain in any muscle: {value}",
    "session.footer": "Logged with GymTracker by Borja Aguado",
    "session.failure.yes": "Yes",
    "session.failure.no": "No",
    "session.pain.zoneNA": "Area N/A",
    "session.pain.exerciseNA": "Exercise: N/A",
    "warning.overload": "Overload warning: last max {baseline} kg, now {current} kg.",
    "history.view.date": "Date",
    "history.view.week": "Week",
    "history.view.day": "Day",
    "history.view.exercises": "Exercises",
    "history.view.exerciseDefault": "Exercise",
    "history.view.sets": "sets",
    "status.historyRenamed": "History renamed to {name}.",
    "status.historyDeleted": "History deleted.",
    "status.selectUser": "Select a user",
    "status.noUsers": "No users yet. Create one to get started.",
    "status.selectUserContinue": "Select a user to continue",
    "status.selectDay": "Select a day.",
    "status.noHistoryDay": "No sessions for that day.",
    "status.noHistorySessions": "No previous sessions available.",
    "status.loadedPreviousSession": "Previous session loaded.",
    "status.userActive": "Active user: {name}",
    "status.createdLoaded": "User created and loaded.",
    "status.userExported": "User data exported.",
    "status.userExportedCsv": "User CSV exported.",
    "status.noUserDataExport": "No data for this user to export.",
    "status.importMerged": "Data imported and merged successfully.",
    "status.importError": "Error while merging data: {error}",
    "prompt.newUserName": "New user name:",
    "prompt.routineName": "Routine name:",
    "alert.selectValidUser": "Select a valid user.",
    "alert.userExists": "A user with that name already exists.",
    "confirm.deleteUser": "Delete user \"{name}\"? This action cannot be undone.",
    "alert.selectUserRename": "Select a user to rename.",
    "alert.selectUserDelete": "Select a user to delete.",
    "alert.selectUserExport": "Select a user to export.",
    "alert.noDataToday": "No data recorded today.",
    "alert.noUserInImport": "No user name found in imported data.",
    "confirm.saveNewRoutine": "This routine isn't saved yet. Save it?",
    "confirm.overwriteRoutine": "Routine \"{name}\" already exists. Overwrite it?",
    "confirm.deleteRoutine": "Delete custom routine \"{name}\"?",
    "status.selectUserBeforeSaveRoutine": "Select a user before saving custom routines.",
    "status.noExercisesToSaveRoutine": "Add at least one exercise before saving the routine.",
    "status.emptyRoutineName": "Routine name cannot be empty.",
    "status.noValidExercises": "No valid exercises found.",
    "status.routineAdded": "Added to preset routines.",
    "status.postWorkoutExportError": "Complete the post-workout questionnaire before exporting.",
    "status.postWorkoutSaveError": "Complete the post-workout questionnaire before saving.",
    "status.sessionSavedLocal": "Session saved to local history.",
    "status.saved": "Saved",
    "status.loadedMemory": "Loaded from memory",
    "status.loadedRoutine": "Loaded from base routine",
    "status.noRoutine": "No routine defined",
    "status.selectUserBeforeRoutineDelete": "Select a user before deleting routines.",
    "status.selectRoutineToDelete": "Select a routine to delete.",
    "status.onlyCustomRoutineDelete": "You can only delete custom routines.",
    "status.routineDeleted": "Routine deleted.",
    "status.timeFinished": "Time's up.",
    "error.addExerciseToActivate": "Add at least one exercise to enable the post-workout questionnaire.",
    "error.completeQuestionnaire": "Complete the post-workout questionnaire to enable the buttons.",
    "error.requiredField": "Required field.",
    "error.painZoneRequired": "Specify the pain area.",
    "error.exerciseRequired": "Select an exercise.",
    "error.completeQuestionnaireButtons": "Complete the questionnaire to enable the buttons.",
    "message.sessionSavedTitle": "Session saved.",
    "message.routineSavedTitle": "Routine saved.",
    "message.errorTitle": "Error.",
    "message.saveSessionRandom.0": "Well done! :)",
    "message.saveSessionRandom.1": "You're a machine! 💪",
    "message.saveSessionRandom.2": "Great work, keep it up! 😎",
    "message.saveSessionRandom.3": "Good pace, on to the next one! 🚀",
    "message.saveSessionRandom.4": "Solid pace, keep adding up! 🔥",
    "message.saveSessionRandom.5": "Train today, show it tomorrow! 😄",
    "message.saveSessionRandom.6": "You're doing great, nice work! ✅",
    "message.saveSessionRandom.7": "Stronger every day! 🦾",
    "message.saveSessionRandom.8": "Goal achieved, time to rest! 🧘",
    "message.saveSessionRandom.9": "Keep stacking wins, champ! 🏆",
    "message.saveSessionRandom.10": "On fire! 🔥",
    "message.saveSessionRandom.11": "Real progress, keep it up! 📈",
    "message.saveSessionRandom.12": "Beast mode activated! 🐺",
    "message.saveSessionRandom.13": "Leaving your mark, legend! 👊",
    "message.saveSessionRandom.14": "Llados level, all in! 💥",
    "message.saveSessionRandom.15": "Croissant 🥐 with fake coffee?! Not you!",
    "message.saveSessionRandom.16": "Belly? That's like foak, no way! 🔥",
    "message.saveSessionRandom.17": "Clean training, strong mind! 🧠",
    "exercise.history.none": "No history for this exercise.",
    "exercise.table.cardio": "<th>Set</th><th>Intensity</th><th>Time (min)</th><th>Notes</th><th class=\"set-action-col\"></th>",
    "exercise.table.strength": "<th>Set</th><th>Weight</th><th>Reps</th><th>Failure</th><th>Failure reps</th><th>Notes</th><th class=\"set-action-col\"></th>",
    "exercise.addSet": "Add set",
    "exercise.removeSet": "Remove set",
    "exercise.remove": "Remove exercise",
    "exercise.notes.title": "Technique notes",
    "exercise.notes.how": "How to do it:",
    "exercise.notes.avoid": "Avoid:",
    "exercise.notes.tips": "Tips:",
    "exercise.custom.noDescription": "Description not available for custom exercises.",
    "exercise.lastSession": "Last session: {date} · {detail}",
    "exercise.lastSession.cardio": "Cardio: {detail}",
    "exercise.cardio.noData": "Cardio with no data",
    "exercise.firstSet": "First set: {detail}",
    "exercise.firstSet.noData": "First set with no data",
    "exercise.detail.intensity": "Intensity {value}",
    "exercise.detail.time": "{value} min",
    "exercise.detail.weight": "{value} kg",
    "exercise.detail.reps": "{value} reps",
    "group.Pecho": "Chest",
    "group.Espalda": "Back",
    "group.Hombros": "Shoulders",
    "group.Brazos": "Arms",
    "group.Piernas": "Legs",
    "group.Antebrazos": "Forearms",
    "group.Cardio": "Cardio",
    "group.Core": "Core",
    "group.Otros": "Other",
    "group.Personalizado": "Custom",
    "file.sessionPrefix": "session",
    "file.historyPrefix": "history",
    "muscle.Pectoral": "Pectoral",
    "muscle.Deltoides": "Deltoids",
    "muscle.Bíceps": "Biceps",
    "muscle.Tríceps": "Triceps",
    "muscle.Espalda": "Back",
    "muscle.Dorsal": "Lats",
    "muscle.Cuádriceps": "Quadriceps",
    "muscle.Femoral": "Hamstrings",
    "muscle.Gemelos": "Calves",
    "muscle.Glúteo": "Glutes",
    "muscle.Cardio": "Cardio",
    "muscle.Antebrazo": "Forearm",
    "muscle.Trapecio": "Trapezius",
    "muscle.Abdominales": "Abs",
    "muscle.Oblicuos": "Obliques",
    "muscle.Transverso": "Transverse",
    "muscle.Inferior": "Lower",
    "muscle.Lateral": "Lateral",
    "csv.usuario": "user",
    "csv.fecha": "date",
    "csv.semana": "week",
    "csv.dia": "day",
    "csv.ejercicio": "exercise",
    "csv.musculo": "muscle",
    "csv.seccion": "section",
    "csv.serie": "set",
    "csv.peso": "weight",
    "csv.reps": "reps",
    "csv.fallo": "failure",
    "csv.reps_fallo": "failure_reps",
    "csv.intensidad": "intensity",
    "csv.tiempo": "time",
    "csv.notas": "notes",
    "csv.sens_general": "sens_general",
    "csv.sens_tiredness": "sens_tiredness",
    "csv.sens_weight": "sens_weight",
    "csv.sens_pain": "sens_pain",
    "csv.sens_pain_zone": "sens_pain_zone",
    "csv.sens_pain_exercise": "sens_pain_exercise"
  },
  es: {
    "app.title": "Registro de rutinas de gimnasio",
    "label.language": "Idioma",
    "lang.ca": "CAT",
    "lang.es": "ESP",
    "lang.en": "ENG",
    "header.backHome": "Volver al inicio",
    "header.changeTheme": "Cambiar tema",
    "header.appIconAlt": "Icono de la app",
    "header.borjaAlt": "Logo de Borja Aguado",
    "subheader.title": "Barra de opciones",
    "textSize.decrease": "Reducir texto",
    "textSize.increase": "Aumentar texto",
    "aria.manageUser": "Gestionar usuario",
    "aria.countdown": "Cuenta atrás",
    "aria.exercises": "Ejercicios",
    "aria.toggleMode": "Cambiar modo",
    "stopwatch.start": "Iniciar",
    "stopwatch.stop": "Detener",
    "stopwatch.reset": "Reiniciar",
    "welcome.start": "Iniciar sesión",
    "welcome.info": "Información relevante",
    "welcome.legal": "Avisos legales y médicos",
    "welcome.info.privacy": "<b>Privacidad:</b> no se guardan datos en la nube. Todo se almacena localmente en el dispositivo.",
    "welcome.info.sync": "<b>Sin sincronización:</b> los datos no se comparten entre dispositivos salvo que exportes e importes manualmente.",
    "welcome.info.important": "<b>Importante:</b> si borras los datos del navegador o la app, se perderán. Exporta copias si quieres conservarlas.",
    "welcome.info.shortcut": "<b>Acceso directo:</b> iOS → Compartir → “Añadir a pantalla de inicio”. Android → Menú → “Instalar app”.",
    "welcome.legal.legal": "<b>Aviso legal:</b> GitHub Pages solo sirve archivos estáticos, sin base de datos ni servidor donde subir datos.",
    "welcome.legal.medical": "<b>Aviso médico:</b> esta aplicación no ofrece asesoramiento médico ni deportivo. Consulta a un profesional antes de hacer cambios en tu entrenamiento, especialmente si tienes lesiones o condiciones previas.",
    "welcome.legal.use": "<b>Uso y responsabilidad:</b> usas la web bajo tu cuenta y riesgo. No se garantiza la disponibilidad ni la conservación de los datos si cambias de dispositivo, navegador o modo privado.",
    "welcome.legal.warranty": "<b>Sin garantías:</b> la aplicación se ofrece “tal cual”, sin garantías de disponibilidad, continuidad o ausencia de errores.",
    "welcome.legal.limitation": "<b>Limitación de responsabilidad:</b> el creador no se hace responsable de daños indirectos, pérdidas de beneficios o decisiones tomadas a partir de la información registrada.",
    "step0.title": "Inicio",
    "step0.status": "Bienvenida",
    "step1.summary": "Paso 1: Selección de usuarios",
    "step1.hint": "Paso 1 · Selección de usuario",
    "step1.statusText": "Empieza seleccionando un usuario para cargar sus datos.",
    "step2.summary": "Paso 2: ¿Cómo quieres iniciar la sesión?",
    "step2.hint": "Paso 2: Elige cómo quieres crear la sesión",
    "step2.option.manual": "Crear la sesión manualmente",
    "step2.option.previous": "Cargar una sesión previa",
    "step2.option.predefined": "Usar una sesión predefinida",
    "step2.manualHint": "Añade ejercicios en el paso 3.",
    "step3.summary": "Paso 3: Ejercicios de la sesión",
    "step3.hint": "Paso 3 · Ejercicios de la sesión",
    "step4.summary": "Paso 4: Cuestionario post-entrenamiento",
    "step4.hint": "Paso 4 · Cuestionario post-entrenamiento",
    "step5.summary": "Paso 5: Resumen de la sesión",
    "step5.hint": "Paso 5 · Resumen de la sesión",
    "step6.summary": "Paso 6: Gráficos del usuario",
    "step6.hint": "Paso 6 · Gráficos del usuario",
    "step7.summary": "Paso 7: Editar sesión anterior",
    "step7.hint": "Paso 7 · Editar sesión anterior",
    "status.pending": "Pendiente",
    "status.optional": "Opcional",
    "status.inProgress": "En progreso",
    "status.completed": "Completado",
    "status.blocked": "Bloqueado",
    "status.available": "Disponible",
    "status.editing": "Edición",
    "label.user": "Usuario",
    "label.week": "Semana",
    "label.day": "Día",
    "label.routine": "Rutinas",
    "label.exercise": "Ejercicio",
    "label.muscleGroup": "Grupo muscular",
    "label.variable": "Variable",
    "label.date": "Fecha",
    "label.exercises": "Ejercicios",
    "label.sensGeneral": "Sensaciones generales del entrenamiento 0-10 (muy mal - excelente)",
    "label.sensTiredness": "Cansancio percibido 0-10",
    "label.sensWeight": "Peso corporal (kg) - Opcional",
    "label.sensPain": "Dolor en algún músculo (sí/no)",
    "label.painZone": "Zona del dolor",
    "label.painExercise": "Identifica si algún ejercicio puede haber sido el responsable",
    "placeholder.sensGeneral": "Ej: 8",
    "placeholder.sensTiredness": "Ej: 6",
    "placeholder.sensWeight": "Ej: 78.5",
    "placeholder.painZone": "Ej: Hombro derecho",
    "placeholder.selectGroup": "Seleccionar grupo...",
    "placeholder.selectExercise": "Seleccionar ejercicio...",
    "stopwatch.placeholder": "Tiempo en segundos (ej: 60)",
    "customExercise.namePlaceholder": "Ej: Remo en barra",
    "cardio.placeholderIntensity": "1-10",
    "cardio.placeholderTime": "min",
    "option.no": "No",
    "option.yes": "Sí",
    "option.notIdentified": "No identificado",
    "week.1": "Semana 1",
    "week.2": "Semana 2",
    "week.3": "Semana 3",
    "week.4": "Semana 4",
    "week.5": "Semana 5",
    "day.1": "Día 1 – Tren superior (tirón)",
    "day.2": "Día 2 – Tren superior (empuje)",
    "day.3": "Día 3 – Tren inferior + core",
    "button.newUser": "Crear un usuario nuevo",
    "button.importMerge": "Importar datos (fusionar)",
    "button.loadRoutine": "Cargar rutina",
    "button.deleteRoutine": "Borrar rutina",
    "button.saveRoutine": "Guardar rutina",
    "button.loadPreviousSession": "Cargar sesión previa",
    "button.saveSession": "Guardar sesión del usuario",
    "button.exportPng": "Imagen de sesión completa (📷)",
    "button.selectExercises": "Seleccionar ejercicios",
    "button.generateChart": "Generar gráfico",
    "button.merge": "Fusionar",
    "button.close": "Cerrar",
    "button.cancel": "Cancelar",
    "button.add": "Añadir",
    "button.custom": "Personalizado",
    "button.prev": "Anterior",
    "button.next": "Siguiente",
    "button.order": "Ordenar",
    "button.apply": "Aplicar",
    "button.view": "Ver",
    "button.edit": "Editar",
    "footer.createdBy": "Web creada por",
    "footer.licensePrefix": "Código bajo",
    "footer.licenseLink": "Licencia Creative Commons Reconocimiento-CompartirIgual 4.0 Internacional",
    "import.title": "Selecciona el usuario para fusionar",
    "manage.title": "Gestión del usuario",
    "manage.history": "Sesiones anteriores",
    "manage.rename": "Cambiar el nombre del usuario",
    "manage.exportJson": "Copia de seguridad (JSON)",
    "manage.exportCsv": "Exportar datos de análisis (CSV)",
    "manage.delete": "Eliminar usuario",
    "history.menuTitle": "Sesiones anteriores",
    "order.title": "Ordenar ejercicios",
    "order.empty": "No hay ejercicios para ordenar.",
    "history.viewTitle": "Sesión seleccionada",
    "postWorkout.title": "Cuestionario de Post-Entrenamiento",
    "customExercise.title": "Ejercicio personalizado",
    "customExercise.nameLabel": "Nombre del ejercicio",
    "customExercise.isCardio": "Es cardio",
    "charts.title": "Gráficos del usuario",
    "charts.noData": "Aún no hay datos de este usuario. Guarda sesiones o importa datos para ver los gráficos.",
    "chart.variable.maxWeight": "Peso máximo",
    "chart.variable.totalLoad": "Carga total (peso x reps)",
    "chart.variable.cardioIntensity": "Cardio - Intensidad máxima",
    "chart.variable.cardioTime": "Cardio - Tiempo total (min)",
    "chart.variable.sensGeneral": "Sensaciones generales (0-10)",
    "chart.variable.sensTiredness": "Cansancio percibido (0-10)",
    "chart.variable.sensWeight": "Peso corporal (kg)",
    "chart.variable.sensPain": "Dolor en algún músculo (Sí/No)",
    "chart.generateLabel": "Generar gráfico",
    "chart.alert.selectExercise": "Selecciona al menos un ejercicio.",
    "chart.axis.date": "Fecha",
    "chart.axis.weight": "Peso (kg)",
    "chart.axis.load": "Carga (kg*reps)",
    "chart.axis.intensity": "Intensidad (1-10)",
    "chart.axis.time": "Tiempo (min)",
    "chart.axis.pain": "Dolor (0=No, 1=Sí)",
    "chart.axis.score": "Puntuación (0-10)",
    "chart.axis.sensations": "Sensaciones (0-10)",
    "chart.axis.bodyWeight": "Peso corporal (kg)",
    "chart.option.bodyWeight": "Peso corporal",
    "exercise.counter.empty": "Ejercicio 0 de 0",
    "exercise.counter.all": "Ejercicios: {total}",
    "exercise.counter.current": "Ejercicio {current} de {total}",
    "exercise.empty": "Todavía no hay ejercicios en esta sesión. Usa el botón naranja arriba a la derecha \"+\" para añadir el primer ejercicio.",
    "fastMode.basic": "+ info",
    "fastMode.detailed": "- info",
    "autoSave.now": "Guardado ahora",
    "autoSave.ago": "Guardado hace {seconds} s",
    "session.noData": "Sin datos de sesión.",
    "session.table.exercise": "Ejercicio",
    "session.table.set": "Serie",
    "session.table.weightIntensity": "Peso/<br>Intensidad",
    "session.table.repsTime": "Reps/<br>Tiempo",
    "session.table.failure": "Fallo",
    "session.table.failureReps": "Reps de fallo",
    "session.table.notes": "Notas",
    "session.table.series": "Series",
    "session.table.maxWeightTime": "Peso máx / Tiempo",
    "session.summary.header": "Resumen:",
    "session.summary.totalExercises": "- Total ejercicios: {count}",
    "session.summary.totalSets": "- Total series: {count}",
    "session.metrics.title": "Métricas subjetivas:",
    "session.metrics.general": "- Sensaciones generales (0-10): {value}",
    "session.metrics.tiredness": "- Cansancio percibido (0-10): {value}",
    "session.metrics.pain": "- Dolor en algún músculo: {value}",
    "session.footer": "Registrado con GymTracker by Borja Aguado",
    "session.failure.yes": "Sí",
    "session.failure.no": "No",
    "session.pain.zoneNA": "Zona N/A",
    "session.pain.exerciseNA": "Ejercicio: N/A",
    "warning.overload": "Aviso de sobrecarga: último máximo {baseline} kg, ahora {current} kg.",
    "history.view.date": "Fecha",
    "history.view.week": "Semana",
    "history.view.day": "Día",
    "history.view.exercises": "Ejercicios",
    "history.view.exerciseDefault": "Ejercicio",
    "history.view.sets": "series",
    "status.historyRenamed": "Histórico renombrado a {name}.",
    "status.historyDeleted": "Histórico eliminado.",
    "status.selectUser": "Selecciona un usuario",
    "status.noUsers": "No hay usuarios. Crea uno nuevo para empezar.",
    "status.selectUserContinue": "Selecciona un usuario para continuar",
    "status.selectDay": "Selecciona un día.",
    "status.noHistoryDay": "No hay sesiones para ese día.",
    "status.noHistorySessions": "No hay sesiones previas disponibles.",
    "status.loadedPreviousSession": "Sesión previa cargada.",
    "status.userActive": "Usuario activo: {name}",
    "status.createdLoaded": "Usuario creado y cargado.",
    "status.userExported": "Datos del usuario exportados.",
    "status.userExportedCsv": "CSV del usuario exportado.",
    "status.noUserDataExport": "No hay datos de este usuario para exportar.",
    "status.importMerged": "Datos importados y fusionados correctamente.",
    "status.importError": "Error al fusionar los datos: {error}",
    "prompt.newUserName": "Nombre del nuevo usuario:",
    "prompt.routineName": "Nombre de la rutina:",
    "alert.selectValidUser": "Selecciona un usuario válido.",
    "alert.userExists": "Ya existe un usuario con ese nombre.",
    "confirm.deleteUser": "¿Eliminar el usuario \"{name}\"? Esta acción no se puede deshacer.",
    "alert.selectUserRename": "Selecciona un usuario para renombrar.",
    "alert.selectUserDelete": "Selecciona un usuario para eliminar.",
    "alert.selectUserExport": "Selecciona un usuario para exportar.",
    "alert.noDataToday": "No hay datos registrados hoy.",
    "alert.noUserInImport": "No se ha encontrado un nombre de usuario en los datos importados.",
    "confirm.saveNewRoutine": "Esta rutina no está guardada. ¿Quieres guardarla?",
    "confirm.overwriteRoutine": "La rutina \"{name}\" ya existe. ¿Quieres sobrescribirla?",
    "confirm.deleteRoutine": "¿Borrar la rutina personalizada \"{name}\"?",
    "status.selectUserBeforeSaveRoutine": "Selecciona un usuario antes de guardar rutinas personalizadas.",
    "status.noExercisesToSaveRoutine": "Añade al menos un ejercicio antes de guardar la rutina.",
    "status.emptyRoutineName": "El nombre de la rutina no puede estar vacío.",
    "status.noValidExercises": "No se han encontrado ejercicios válidos.",
    "status.routineAdded": "Ya aparece en rutinas predefinidas.",
    "status.postWorkoutExportError": "Completa todo el cuestionario de post-entrenamiento antes de exportar.",
    "status.postWorkoutSaveError": "Completa todo el cuestionario de post-entrenamiento antes de guardar.",
    "status.sessionSavedLocal": "Sesión guardada en el histórico local.",
    "status.saved": "Guardado",
    "status.loadedMemory": "Cargado desde memoria",
    "status.loadedRoutine": "Cargado desde rutina base",
    "status.noRoutine": "No hay rutina definida",
    "status.selectUserBeforeRoutineDelete": "Selecciona un usuario antes de borrar rutinas.",
    "status.selectRoutineToDelete": "Selecciona una rutina para borrar.",
    "status.onlyCustomRoutineDelete": "Solo puedes borrar rutinas personalizadas.",
    "status.routineDeleted": "Rutina borrada.",
    "status.timeFinished": "Tiempo terminado.",
    "error.addExerciseToActivate": "Añade al menos un ejercicio para activar el cuestionario post-entrenamiento.",
    "error.completeQuestionnaire": "Completa el cuestionario de post-entrenamiento para activar los botones.",
    "error.requiredField": "Campo obligatorio.",
    "error.painZoneRequired": "Indica la zona del dolor.",
    "error.exerciseRequired": "Selecciona un ejercicio.",
    "error.completeQuestionnaireButtons": "Completa el cuestionario para activar los botones.",
    "message.sessionSavedTitle": "Sesión guardada.",
    "message.routineSavedTitle": "Rutina guardada.",
    "message.errorTitle": "Error.",
    "message.saveSessionRandom.0": "¡Bien hecho! :)",
    "message.saveSessionRandom.1": "¡Eres una máquina! 💪",
    "message.saveSessionRandom.2": "Gran trabajo, ¡sigue así! 😎",
    "message.saveSessionRandom.3": "Buen ritmo, ¡a por la siguiente! 🚀",
    "message.saveSessionRandom.4": "Ritmo sólido, ¡sigue sumando! 🔥",
    "message.saveSessionRandom.5": "¡Hoy se entrena, mañana se presume! 😄",
    "message.saveSessionRandom.6": "Vas fino, ¡muy buen trabajo! ✅",
    "message.saveSessionRandom.7": "¡Cada día más fuerte! 🦾",
    "message.saveSessionRandom.8": "Objetivo cumplido, ¡a descansar! 🧘",
    "message.saveSessionRandom.9": "Suma y sigue, campeón! 🏆",
    "message.saveSessionRandom.10": "¡En llamas! 🔥",
    "message.saveSessionRandom.11": "Progreso real, ¡sigue así! 📈",
    "message.saveSessionRandom.12": "¡Modo bestia activado! 🐺",
    "message.saveSessionRandom.13": "Dejando huella, crack! 👊",
    "message.saveSessionRandom.14": "Nivel Llados, ¡a tope! 💥",
    "message.saveSessionRandom.15": "Croissant 🥐 con faking café?! ¡Tú no!",
    "message.saveSessionRandom.16": "¿Barriga? Eso es como foak, ¡ni de coña! 🔥",
    "message.saveSessionRandom.17": "Entrenamiento limpio, mente fuerte! 🧠",
    "exercise.history.none": "Sin historial para este ejercicio.",
    "exercise.table.cardio": "<th>Serie</th><th>Intensidad</th><th>Tiempo (min)</th><th>Notas</th><th class=\"set-action-col\"></th>",
    "exercise.table.strength": "<th>Serie</th><th>Peso</th><th>Reps</th><th>Fallo</th><th>Reps de fallo</th><th>Notas</th><th class=\"set-action-col\"></th>",
    "exercise.addSet": "Añadir serie",
    "exercise.removeSet": "Eliminar serie",
    "exercise.remove": "Eliminar ejercicio",
    "exercise.notes.title": "Notas de técnica",
    "exercise.notes.how": "Cómo hacerlo:",
    "exercise.notes.avoid": "Evitar:",
    "exercise.notes.tips": "Consejos:",
    "exercise.custom.noDescription": "Descripción no disponible para ejercicios personalizados.",
    "exercise.lastSession": "Última sesión: {date} · {detail}",
    "exercise.lastSession.cardio": "Cardio: {detail}",
    "exercise.cardio.noData": "Cardio sin datos",
    "exercise.firstSet": "Primera serie: {detail}",
    "exercise.firstSet.noData": "Primera serie sin datos",
    "exercise.detail.intensity": "Intensidad {value}",
    "exercise.detail.time": "{value} min",
    "exercise.detail.weight": "{value} kg",
    "exercise.detail.reps": "{value} reps",
    "group.Pecho": "Pecho",
    "group.Espalda": "Espalda",
    "group.Hombros": "Hombros",
    "group.Brazos": "Brazos",
    "group.Piernas": "Piernas",
    "group.Antebrazos": "Antebrazos",
    "group.Cardio": "Cardio",
    "group.Core": "Core",
    "group.Otros": "Otros",
    "group.Personalizado": "Personalizado",
    "file.sessionPrefix": "sesion",
    "file.historyPrefix": "historico",
    "muscle.Pectoral": "Pectoral",
    "muscle.Deltoides": "Deltoides",
    "muscle.Bíceps": "Bíceps",
    "muscle.Tríceps": "Tríceps",
    "muscle.Espalda": "Espalda",
    "muscle.Dorsal": "Dorsal",
    "muscle.Cuádriceps": "Cuádriceps",
    "muscle.Femoral": "Femoral",
    "muscle.Gemelos": "Gemelos",
    "muscle.Glúteo": "Glúteo",
    "muscle.Cardio": "Cardio",
    "muscle.Antebrazo": "Antebrazo",
    "muscle.Trapecio": "Trapecio",
    "muscle.Abdominales": "Abdominales",
    "muscle.Oblicuos": "Oblicuos",
    "muscle.Transverso": "Transverso",
    "muscle.Inferior": "Inferior",
    "muscle.Lateral": "Lateral",
    "csv.usuario": "usuario",
    "csv.fecha": "fecha",
    "csv.semana": "semana",
    "csv.dia": "dia",
    "csv.ejercicio": "ejercicio",
    "csv.musculo": "musculo",
    "csv.seccion": "seccion",
    "csv.serie": "serie",
    "csv.peso": "peso",
    "csv.reps": "reps",
    "csv.fallo": "fallo",
    "csv.reps_fallo": "reps_fallo",
    "csv.intensidad": "intensidad",
    "csv.tiempo": "tiempo",
    "csv.notas": "notas",
    "csv.sens_general": "sens_general",
    "csv.sens_tiredness": "sens_tiredness",
    "csv.sens_weight": "sens_weight",
    "csv.sens_pain": "sens_pain",
    "csv.sens_pain_zone": "sens_pain_zone",
    "csv.sens_pain_exercise": "sens_pain_exercise"
  }
};

let currentLanguage = DEFAULT_LANG;
const languageListeners = new Set();
const FLAG_SVGS = {
  es: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
  <rect width="24" height="16" fill="#AA151B"/>
  <rect y="4" width="24" height="8" fill="#F1BF00"/>
  </svg>`,
  ca: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
  <rect width="24" height="16" fill="#F1BF00"/>
  <rect y="0" width="24" height="2" fill="#D52B1E"/>
  <rect y="4" width="24" height="2" fill="#D52B1E"/>
  <rect y="8" width="24" height="2" fill="#D52B1E"/>
  <rect y="12" width="24" height="2" fill="#D52B1E"/>
  </svg>`,
  en: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16">
  <rect width="24" height="16" fill="#FFFFFF"/>
  <rect width="24" height="2" y="0" fill="#B22234"/>
  <rect width="24" height="2" y="4" fill="#B22234"/>
  <rect width="24" height="2" y="8" fill="#B22234"/>
  <rect width="24" height="2" y="12" fill="#B22234"/>
  <rect width="10" height="7" fill="#3C3B6E"/>
  <circle cx="2" cy="2" r="0.6" fill="#FFFFFF"/>
  <circle cx="5" cy="2" r="0.6" fill="#FFFFFF"/>
  <circle cx="8" cy="2" r="0.6" fill="#FFFFFF"/>
  <circle cx="3.5" cy="4" r="0.6" fill="#FFFFFF"/>
  <circle cx="6.5" cy="4" r="0.6" fill="#FFFFFF"/>
  <circle cx="2" cy="6" r="0.6" fill="#FFFFFF"/>
  <circle cx="5" cy="6" r="0.6" fill="#FFFFFF"/>
  <circle cx="8" cy="6" r="0.6" fill="#FFFFFF"/>
  </svg>`
};
const FLAG_DATA_URIS = Object.keys(FLAG_SVGS).reduce((acc, key) => {
  const svg = FLAG_SVGS[key].replace(/\s+/g, " ").trim();
  acc[key] = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return acc;
}, {});

function getLanguage() {
  const stored = storage.getItem(LANG_KEY);
  if (stored && I18N_STRINGS[stored]) return stored;
  return DEFAULT_LANG;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getFontScale() {
  const stored = parseFloat(storage.getItem(FONT_SCALE_KEY));
  if (!Number.isNaN(stored)) {
    return clampNumber(stored, FONT_SCALE_MIN, FONT_SCALE_MAX);
  }
  return 1;
}

function getLocale() {
  if (currentLanguage === "en") return "en-GB";
  if (currentLanguage === "es") return "es-ES";
  return "ca-ES";
}

function t(key, vars = {}) {
  const dict = I18N_STRINGS[currentLanguage] || I18N_STRINGS[DEFAULT_LANG];
  const fallback = I18N_STRINGS[DEFAULT_LANG] || {};
  let text = dict[key] || fallback[key] || key;
  Object.keys(vars).forEach(varKey => {
    text = text.replace(new RegExp(`\\{${varKey}\\}`, "g"), String(vars[varKey]));
  });
  return text;
}

function applyTranslations(root = document) {
  if (!root) return;
  root.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-html]").forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  root.querySelectorAll("[data-i18n-aria]").forEach(el => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  root.querySelectorAll("[data-i18n-title]").forEach(el => {
    el.setAttribute("title", t(el.dataset.i18nTitle));
  });
  root.querySelectorAll("[data-i18n-alt]").forEach(el => {
    el.setAttribute("alt", t(el.dataset.i18nAlt));
  });
}

function getSessionMode() {
  const stored = storage.getItem(SESSION_MODE_KEY);
  if (stored === "manual" || stored === "previous" || stored === "predefined") return stored;
  return SESSION_MODE_DEFAULT;
}

function updateStep2ModeUI(mode) {
  if (step2ManualSection) step2ManualSection.classList.toggle("is-active", mode === "manual");
  if (step2PreviousSection) step2PreviousSection.classList.toggle("is-active", mode === "previous");
  if (step2PredefinedSection) step2PredefinedSection.classList.toggle("is-active", mode === "predefined");
  if (step2ModeInputs && step2ModeInputs.length) {
    step2ModeInputs.forEach(input => {
      input.checked = input.value === mode;
    });
  }
}

function setSessionMode(mode) {
  const next = (mode === "manual" || mode === "previous" || mode === "predefined")
    ? mode
    : SESSION_MODE_DEFAULT;
  storage.setItem(SESSION_MODE_KEY, next);
  updateStep2ModeUI(next);
  if (next === "previous") {
    populateHistoryDaySelect();
  }
}

function updateFontSizeButtons(scale) {
  const decreaseBtn = document.getElementById("text-size-decrease");
  const increaseBtn = document.getElementById("text-size-increase");
  if (decreaseBtn) decreaseBtn.disabled = scale <= FONT_SCALE_MIN + 0.001;
  if (increaseBtn) increaseBtn.disabled = scale >= FONT_SCALE_MAX - 0.001;
}

function setFontScale(scale) {
  const next = clampNumber(scale, FONT_SCALE_MIN, FONT_SCALE_MAX);
  document.documentElement.style.setProperty("--font-scale", next.toString());
  storage.setItem(FONT_SCALE_KEY, next.toFixed(2));
  updateFontSizeButtons(next);
}

function updateLanguageSelectIcon(lang = currentLanguage) {
  const languageSelect = document.getElementById("language-select");
  if (!languageSelect) return;
  const dataUri = FLAG_DATA_URIS[lang] || FLAG_DATA_URIS[DEFAULT_LANG];
  if (dataUri) {
    languageSelect.style.setProperty("--flag-icon", `url("${dataUri}")`);
  }
}

function notifyLanguageChange() {
  languageListeners.forEach(listener => listener(currentLanguage));
}

function onLanguageChange(listener) {
  if (typeof listener !== "function") return;
  languageListeners.add(listener);
}

function setLanguage(lang) {
  const next = I18N_STRINGS[lang] ? lang : DEFAULT_LANG;
  currentLanguage = next;
  storage.setItem(LANG_KEY, next);
  document.documentElement.lang = next;
  const languageSelect = document.getElementById("language-select");
  if (languageSelect && languageSelect.value !== next) {
    languageSelect.value = next;
  }
  updateLanguageSelectIcon(next);
  applyTranslations();
  refreshLanguageSensitiveUI();
  notifyLanguageChange();
}

function refreshLanguageSensitiveUI() {
  updateStepStatus();
  updateExercisePagination(false);
  updateAutoSaveLabel();
  updateSessionSummary();
  refreshHistoryUI();
  setFastMode(isFastMode, { skipPersist: true });
  refreshRoutineSelectLabels();
  populateHistoryDaySelect();
  if (exercisesContainer && exercisesContainer.children.length > 0) {
    loadSession({ silent: true, preserveAutoSave: true });
  }
  const quickGroupSelect = document.getElementById("quick-add-group");
  if (quickGroupSelect) {
    populateGroupSelect(quickGroupSelect);
    if (quickGroupSelect.value) {
      populateQuickAddExercises(quickGroupSelect.value);
    }
  }
}

currentLanguage = getLanguage();
document.documentElement.lang = currentLanguage;
window.gymI18n = { t, setLanguage, getLanguage, getLocale, applyTranslations, onLanguageChange };

let currentUserName = "";
let currentUserKey = "";
const stepPages = [step0, step1, step2, step3, step4, step5, step6, step7].filter(Boolean);
let activeStepIndex = 0;
let pendingStartStepIndex = null;
let activeExerciseIndex = 0;
let exercisePaginationScheduled = false;
let showAllExercises = false;
let lastAutoSaveTime = null;
let autoSaveTimer = null;
let editingSessionContext = null;
let isFastMode = false;

function normalizeUserName(name) {
  return name.trim().replace(/\s+/g, "_");
}

function loadUserList() {
  let list = [];
  let changed = false;
  try {
    const raw = storage.getItem(USER_LIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      if (parsed.length && typeof parsed[0] === "string") {
        list = parsed
          .filter(item => typeof item === "string" && item.trim())
          .map(item => ({ name: item.trim(), key: normalizeUserName(item.trim()) }));
      } else {
        list = parsed.filter(item => item && typeof item.name === "string" && typeof item.key === "string");
      }
    }
  } catch (err) {
    list = [];
  }

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    const prefix = `${LOCAL_HISTORY_KEY}_`;
    if (!key.startsWith(prefix)) continue;
    const userKey = key.slice(prefix.length);
    if (!userKey) continue;
    const exists = list.some(item => item.key === userKey);
    if (!exists) {
      list.push({ name: userKey.replace(/_/g, " "), key: userKey });
      changed = true;
    }
  }

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    const match = key.match(/^gym_(.*?)_\d{4}-\d{2}-\d{2}_/);
    if (!match) continue;
    const userKey = match[1];
    if (!userKey) continue;
    const exists = list.some(item => item.key === userKey);
    if (!exists) {
      list.push({ name: userKey.replace(/_/g, " "), key: userKey });
      changed = true;
    }
  }

  const lastUser = storage.getItem("gym_user_name") || "";
  if (lastUser.trim()) {
    const lastKey = normalizeUserName(lastUser.trim());
    const exists = list.some(item => item.key === lastKey);
    if (!exists) {
      list.push({ name: lastUser.trim(), key: lastKey });
      changed = true;
    }
  }

  if (changed) {
    storage.setItem(USER_LIST_KEY, JSON.stringify(list));
  }

  return list;
}

function saveUserList(list) {
  storage.setItem(USER_LIST_KEY, JSON.stringify(list));
}

function promptForNewUserName(defaultValue) {
  const input = prompt(t("prompt.newUserName"), defaultValue || "");
  if (input == null) return "";
  return input.trim();
}

function setCurrentUser(name, key) {
  currentUserName = name;
  currentUserKey = key;
  storage.setItem("gym_user_name", currentUserName);
}

function refreshCharts() {
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}

function setFastMode(enabled, options = {}) {
  isFastMode = enabled;
  document.body.classList.toggle("fast-mode", enabled);
  if (toggleFastModeBtn) {
    toggleFastModeBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
  }
  if (fastModeLabel) {
    fastModeLabel.textContent = enabled ? t("fastMode.basic") : t("fastMode.detailed");
  }
  if (!options.skipPersist) storage.setItem("gym_fast_mode", enabled ? "1" : "0");
}

function refreshHistoryUI() {
  if (!historyDateInput) return;
  const sessions = window.uploadedHistory || [];
  const latest = sessions
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
  if (latest && (!historyDateInput.value || historyDateInput.value === "")) {
    historyDateInput.value = latest.date || "";
  }
  updateHistoryButtons();
}

function updateHistoryButtons() {
  if (!historyDateInput) return;
  const dateStr = historyDateInput.value;
  const hasSession = Boolean(
    dateStr && (window.uploadedHistory || []).some(session => session.date === dateStr)
  );
  if (historyViewBtn) historyViewBtn.disabled = !hasSession;
  if (historyEditBtn) historyEditBtn.disabled = !hasSession;
}

function getSelectedHistorySession() {
  const dateStr = historyDateInput?.value || "";
  if (!dateStr) return null;
  const sessions = (window.uploadedHistory || []).filter(session => session.date === dateStr);
  if (!sessions.length) return null;
  const sorted = sessions.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return sorted[0];
}

function openHistoryViewOverlay(session) {
  if (!historyViewOverlay || !historyViewContent || !session) return;
  const exercises = Array.isArray(session.exercises) ? session.exercises : [];
  const lines = [
    `${t("history.view.date")}: ${session.date || "-"}`,
    `${t("history.view.week")}: ${session.week || "-"}`,
    `${t("history.view.day")}: ${session.day || "-"}`,
    `${t("history.view.exercises")}: ${exercises.length}`
  ];
  exercises.forEach(ex => {
    const sets = Array.isArray(ex.sets) ? ex.sets.length : 0;
    lines.push(`- ${ex.nombre || t("history.view.exerciseDefault")} (${sets} ${t("history.view.sets")})`);
  });
  historyViewContent.textContent = lines.join("\n");
  historyViewOverlay.style.display = "flex";
  historyViewOverlay.setAttribute("aria-hidden", "false");
}

function closeHistoryViewOverlay() {
  if (!historyViewOverlay) return;
  historyViewOverlay.style.display = "none";
  historyViewOverlay.setAttribute("aria-hidden", "true");
}

function ensureSelectValue(selectEl, value) {
  if (!selectEl || !value) return;
  const exists = Array.from(selectEl.options).some(opt => opt.value === value);
  if (!exists) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    selectEl.appendChild(opt);
  }
  selectEl.value = value;
}

function renameUserHistory(userKey, newName) {
  const userList = loadUserList();
  const entry = userList.find(u => u.key === userKey);
  if (!entry) {
    alert(t("alert.selectValidUser"));
    return;
  }
  const trimmed = newName.trim();
  if (!trimmed) return;
  const newKey = normalizeUserName(trimmed);
  if (newKey !== userKey && userList.some(u => u.key === newKey)) {
    alert(t("alert.userExists"));
    return;
  }

  const sessions = getLocalHistoryForUser(userKey).map(session => ({
    ...session,
    user: trimmed,
    key: buildSessionKeyForUser(session, newKey)
  }));
  setLocalHistoryForUser(newKey, sessions);
  if (newKey !== userKey) {
    storage.removeItem(getHistoryStorageKeyForUser(userKey));
  }

  entry.name = trimmed;
  entry.key = newKey;
  saveUserList(userList);

  if (currentUserKey === userKey) {
    setCurrentUser(trimmed, newKey);
    loadLocalHistory();
    loadSession();
  }

  refreshUserSelect();
  if (userHistorySelect) userHistorySelect.value = newKey;
  setUserHistoryStatus(t("status.historyRenamed", { name: trimmed }));
}

function resolveUserEntry(selectedKey) {
  const userList = loadUserList();
  let entry = userList.find(u => u.key === selectedKey);
  if (!entry && selectedKey) {
    const normalized = normalizeUserName(selectedKey);
    entry = userList.find(u => u.key === normalized)
      || userList.find(u => u.name.toLowerCase() === selectedKey.toLowerCase());
  }
  return entry;
}

function deleteUserHistory(userKey) {
  const userList = loadUserList();
  const entry = resolveUserEntry(userKey);
  const entryIndex = entry ? userList.findIndex(u => u.key === entry.key) : -1;
  if (entryIndex === -1) {
    alert(t("alert.selectValidUser"));
    return;
  }
  const ok = confirm(t("confirm.deleteUser", { name: entry.name }));
  if (!ok) return;

  storage.removeItem(getHistoryStorageKeyForUser(entry.key));
  const prefix = `gym_${entry.key}_`;
  for (let i = storage.length - 1; i >= 0; i--) {
    const key = storage.key(i) || "";
    if (key.startsWith(prefix)) {
      storage.removeItem(key);
      continue;
    }
    if (!key.startsWith("gym_")) continue;
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.user && parsed.user === entry.name) {
        storage.removeItem(key);
      }
    } catch (err) {
      // Ignore malformed entries.
    }
  }

  const legacyKey = "gym_history_v1";
  const legacyRaw = storage.getItem(legacyKey);
  if (legacyRaw) {
    try {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        const filtered = legacyParsed.filter(item => item?.user !== entry.name);
        if (filtered.length === 0) {
          storage.removeItem(legacyKey);
        } else {
          storage.setItem(legacyKey, JSON.stringify(filtered));
        }
      }
    } catch (err) {
      // Ignore malformed legacy entries.
    }
  }

  userList.splice(entryIndex, 1);
  saveUserList(userList);

  const storedName = storage.getItem("gym_user_name");
  if (currentUserKey === entry.key || storedName === entry.name) {
    currentUserKey = "";
    currentUserName = "";
    storage.removeItem("gym_user_name");
    setAppEnabled(false);
    setAppVisible(false);
  }

  refreshUserSelect();
  setUserHistoryStatus(t("status.historyDeleted"));
}

function setUserHistoryStatus(msg) {
  if (userHistoryStatus) userHistoryStatus.textContent = msg;
}

function refreshUserSelect() {
  const userList = loadUserList();
  if (!userHistorySelect) return userList;
  userHistorySelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = t("status.selectUser");
  placeholder.disabled = true;
  placeholder.selected = true;
  userHistorySelect.appendChild(placeholder);

  if (!userList.length) {
    userHistorySelect.disabled = true;
    setUserHistoryStatus(t("status.noUsers"));
    return userList;
  }

  userList.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user.key;
    opt.textContent = user.name;
    userHistorySelect.appendChild(opt);
  });
  userHistorySelect.disabled = false;
  setUserHistoryStatus(t("status.selectUserContinue"));
  return userList;
}

function setAppVisible(isVisible) {
  if (!appContent) return;
  appContent.style.display = isVisible ? "block" : "none";
  if (!isVisible) {
    setActiveStep(0, { skipScroll: true });
  } else {
    updateStepNavigation();
  }
}

function setAppEnabled(enabled) {
  const main = document.querySelector("main");
  if (!main) return;
  const controls = main.querySelectorAll("input, select, button, textarea");
  controls.forEach(el => {
    if (userHistoryControls && userHistoryControls.contains(el)) return;
    if (step0 && step0.contains(el)) return;
    el.disabled = !enabled;
  });
}

function initializeForUserSelection() {
  refreshUserSelect();
  setAppEnabled(false);
  setAppVisible(false);
  updateStepStatus();
}

function activateSelectedUser(userKey) {
  const userList = loadUserList();
  const selected = userList.find(u => u.key === userKey);
  if (!selected) {
    alert(t("alert.selectValidUser"));
    return;
  }
  setCurrentUser(selected.name, selected.key);
  loadLocalHistory();
  hydrateHistoryFromSessionKeys();
  setAppEnabled(true);
  setAppVisible(true);
  populateRoutineSelectors();
  checkSensationsForm();
  setUserHistoryStatus(t("status.userActive", { name: selected.name }));
  updateStepStatus();
  scheduleExercisePagination(true);
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
  if (pendingStartStepIndex != null) {
    const targetIndex = pendingStartStepIndex;
    pendingStartStepIndex = null;
    setActiveStep(targetIndex);
  }
}

function updateStepStatus() {
  const hasUser = Boolean(currentUserKey);
  const hasExercises = exercisesContainer && exercisesContainer.children.length > 0;
  const postWorkoutComplete = isPostWorkoutComplete();

  if (step1Status) step1Status.textContent = hasUser ? t("status.completed") : t("status.pending");
  if (step2Status) step2Status.textContent = hasExercises ? t("status.completed") : t("status.optional");
  if (step3Status) step3Status.textContent = hasExercises ? t("status.inProgress") : t("status.pending");
  if (step4Status) {
    step4Status.textContent = postWorkoutComplete
      ? t("status.completed")
      : hasExercises
        ? t("status.inProgress")
        : t("status.blocked");
  }
  if (step5Status) {
    step5Status.textContent = postWorkoutComplete && isSessionSavedToHistory()
      ? t("status.available")
      : t("status.blocked");
  }
  if (step6Status) step6Status.textContent = hasUser ? t("status.optional") : t("status.pending");
  if (toggleUserManageBtn) toggleUserManageBtn.disabled = !hasUser;
  if (postWorkoutSection) {
    postWorkoutSection.classList.toggle("post-workout-locked", !hasExercises);
  }
  updateStepNavigation();
}

function updateExercisePagination(resetIndex = false) {
  if (!exercisesContainer) return;
  let cards = Array.from(exercisesContainer.querySelectorAll(".exercise-card"));
  if (!cards.length) {
    cards = Array.from(exercisesContainer.children).filter(node => node.nodeType === 1);
    cards.forEach(card => card.classList.add("exercise-card"));
  }
  const fastModeBtn = document.getElementById("toggle-fast-mode");
  const navActionsFallback = document.querySelector(".exercise-nav-actions");
  const total = cards.length;
  if (resetIndex) {
    activeExerciseIndex = 0;
  }
  if (total === 0) {
    if (exerciseCounter) exerciseCounter.textContent = t("exercise.counter.empty");
    if (exercisePrevBtn) exercisePrevBtn.disabled = true;
    if (exerciseNextBtn) exerciseNextBtn.disabled = true;
    if (saveRoutineControls) saveRoutineControls.style.display = "none";
    if (exerciseEmptyState) exerciseEmptyState.style.display = "block";
    if (fastModeBtn && navActionsFallback && fastModeBtn.parentElement !== navActionsFallback) {
      navActionsFallback.prepend(fastModeBtn);
    }
    if (removeExerciseBtn) removeExerciseBtn.disabled = true;
    return;
  }
  if (exerciseEmptyState) exerciseEmptyState.style.display = "none";

  if (showAllExercises) {
    cards.forEach(card => {
      card.style.display = "block";
    });
    const firstCard = cards[0];
    const firstHeaderActions = firstCard?.querySelector(".exercise-header-actions");
    if (fastModeBtn && firstHeaderActions && fastModeBtn.parentElement !== firstHeaderActions) {
      firstHeaderActions.appendChild(fastModeBtn);
    }
    if (removeExerciseBtn) removeExerciseBtn.disabled = false;
    if (exerciseCounter) exerciseCounter.textContent = t("exercise.counter.all", { total });
    if (exercisePrevBtn) exercisePrevBtn.disabled = true;
    if (exerciseNextBtn) exerciseNextBtn.disabled = true;
    if (saveRoutineControls) saveRoutineControls.style.display = "none";
    return;
  }

  activeExerciseIndex = Math.max(0, Math.min(activeExerciseIndex, total - 1));
  cards.forEach((card, idx) => {
    card.style.display = idx === activeExerciseIndex ? "block" : "none";
  });
  const activeCard = cards[activeExerciseIndex];
  const activeHeaderActions = activeCard?.querySelector(".exercise-header-actions");
  if (fastModeBtn && activeHeaderActions && fastModeBtn.parentElement !== activeHeaderActions) {
    activeHeaderActions.appendChild(fastModeBtn);
  }
  if (removeExerciseBtn) removeExerciseBtn.disabled = !activeCard;
  if (exerciseCounter) {
    exerciseCounter.textContent = t("exercise.counter.current", { current: activeExerciseIndex + 1, total });
  }
  if (exercisePrevBtn) exercisePrevBtn.disabled = activeExerciseIndex === 0;
  if (exerciseNextBtn) exerciseNextBtn.disabled = activeExerciseIndex >= total - 1;
  if (saveRoutineControls) {
    saveRoutineControls.style.display = activeExerciseIndex === total - 1 ? "flex" : "none";
  }
}

function scheduleExercisePagination(resetIndex = false) {
  if (resetIndex) activeExerciseIndex = 0;
  if (exercisePaginationScheduled) return;
  exercisePaginationScheduled = true;
  requestAnimationFrame(() => {
    exercisePaginationScheduled = false;
    updateExercisePagination(false);
  });
}

function isAppVisible() {
  return appContent && appContent.style.display !== "none";
}

function getMaxStepIndex() {
  if (isAppVisible()) {
    let maxIndex = stepPages.length - 1;
    const step5Index = stepPages.indexOf(step5);
    const step4Index = stepPages.indexOf(step4);
    const step6Index = stepPages.indexOf(step6);
    const step7Index = stepPages.indexOf(step7);
    if (!isPostWorkoutComplete() && step5Index > 0) {
      maxIndex = Math.min(maxIndex, step5Index - 1);
      if (step4Index >= 0) {
        maxIndex = Math.max(maxIndex, step4Index);
      }
    }
    if (!isSessionSavedToHistory() && step5Index > 0) {
      maxIndex = Math.min(maxIndex, step5Index - 1);
      if (step4Index >= 0) {
        maxIndex = Math.max(maxIndex, step4Index);
      }
    }
    if (!editingSessionContext && step7Index >= 0 && step6Index >= 0) {
      maxIndex = Math.min(maxIndex, step6Index);
    }
    return maxIndex;
  }
  const loginIndex = stepPages.indexOf(step1);
  if (loginIndex >= 0) return loginIndex;
  return Math.min(1, stepPages.length - 1);
}

function isSessionSavedToHistory() {
  if (!currentUserKey) return false;
  const key = sessionKey();
  if (!key) return false;
  return getLocalHistory().some(session => session.key === key);
}

function updateStepNavigation() {
  if (!stepPages.length) return;
  const maxIndex = getMaxStepIndex();
  if (activeStepIndex > maxIndex) {
    activeStepIndex = maxIndex;
  }
  const activeStep = stepPages[activeStepIndex];

  if (subheader) {
    const step2Index = stepPages.indexOf(step2);
    const step3Index = stepPages.indexOf(step3);
    const showFromStep2 = step2Index >= 0 && activeStepIndex >= step2Index;
    const isStep3 = step3Index >= 0 && activeStepIndex === step3Index;
    subheader.classList.toggle("is-visible", showFromStep2);

    if (toggleUserManageBtn) {
      toggleUserManageBtn.style.display = showFromStep2 ? "flex" : "none";
    }
    if (toggleStopwatchBtn) {
      toggleStopwatchBtn.style.display = isStep3 ? "flex" : "none";
    }
    if (toggleQuickAddBtn) {
      toggleQuickAddBtn.style.display = isStep3 ? "flex" : "none";
    }
    if (toggleFastModeBtn) {
      toggleFastModeBtn.style.display = isStep3 ? "flex" : "none";
    }

    if (!isStep3) {
      if (typeof closeStopwatchOverlay === "function") closeStopwatchOverlay();
      if (typeof closeQuickAddOverlay === "function") closeQuickAddOverlay();
      if (isFastMode) setFastMode(false);
    }
  }
  updateHeaderOffsets();

  if (stepperPrevBtn) {
    stepperPrevBtn.disabled = activeStepIndex === 0;
    stepperPrevBtn.style.display = activeStepIndex === 0 ? "none" : "inline-flex";
  }
  if (stepperNextBtn) {
    const atLast = activeStepIndex >= maxIndex;
    const canMoveNext = !atLast;
    stepperNextBtn.disabled = !canMoveNext;
    stepperNextBtn.style.display = activeStepIndex === 0 ? "none" : "inline-flex";
  }
}

function updateHeaderOffsets() {
  const header = document.getElementById("compact-header");
  if (!header) return;
  const headerHeight = header.offsetHeight || 0;
  if (subheader) {
    subheader.style.top = `${headerHeight}px`;
  }
  const subheaderHeight = subheader && subheader.classList.contains("is-visible")
    ? (subheader.offsetHeight || 0)
    : 0;
  const spacing = 12;
  document.body.style.paddingTop = `${headerHeight + subheaderHeight + spacing}px`;
}

function updateAutoSaveLabel() {
  if (!autoSaveStatus) return;
  autoSaveStatus.textContent = "";
}

function markAutoSaved() {
  lastAutoSaveTime = Date.now();
  updateAutoSaveLabel();
  if (!autoSaveTimer) {
    autoSaveTimer = setInterval(updateAutoSaveLabel, 15000);
  }
}

function updateSessionSummary() {
  if (!sessionSummary) return;
  if (exercisesContainer !== mainExercisesContainer) return;
  const key = sessionKey();
  const saved = JSON.parse(storage.getItem(key) || "null");
  if (!saved) {
    sessionSummary.textContent = t("session.noData");
    return;
  }
  sessionSummary.innerHTML = "";
  const exportContent = buildExportContent(saved, { variant: "web" });
  sessionSummary.appendChild(exportContent);
}

function buildExportContent(saved, options = {}) {
  const variant = options.variant || "png";
  const usePngStyles = variant === "png";
  const isDarkTheme = document.documentElement.classList.contains("dark");
  const exportDiv = document.createElement("div");
  if (usePngStyles) {
    exportDiv.style.background = "white";
    exportDiv.style.padding = "20px";
    exportDiv.style.fontFamily = "sans-serif";
    exportDiv.style.width = "fit-content";
    exportDiv.style.color = "#000";
  } else {
    exportDiv.className = "session-summary";
  }

  const title = document.createElement("h2");
  const dateObj = new Date(saved.date);
  const isValidDate = !isNaN(dateObj);
  const formattedDate = isValidDate
    ? dateObj.toLocaleDateString(getLocale(), { day: "2-digit", month: "2-digit", year: "numeric" })
    : saved.date;
  const weekday = isValidDate
    ? dateObj.toLocaleDateString(getLocale(), { weekday: "long" })
    : "";
  const weekdayText = weekday ? ` (${weekday})` : "";
  title.textContent = `${formattedDate}${weekdayText}`;
  if (usePngStyles) {
    title.style.color = "#000";
  } else {
    title.className = "session-summary-title";
  }
  exportDiv.appendChild(title);

  const table = document.createElement("table");
  if (usePngStyles) {
    const headerBg = isDarkTheme ? "#000" : "#e5e7eb";
    const headerText = isDarkTheme ? "#fff" : "#000";
    table.style.borderCollapse = "separate";
    table.style.borderSpacing = "0";
    table.style.fontSize = "12px";
    table.style.color = "#000";
    table.innerHTML = `
      <tr style="background:${headerBg}; font-weight:bold;">
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.exercise")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.set")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.weightIntensity")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.repsTime")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.failure")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.failureReps")}</th>
        <th style="border:1px solid #000; padding:4px; color:${headerText};">${t("session.table.notes")}</th>
      </tr>
    `;
  } else {
    table.className = "session-summary-mini-table";
    table.innerHTML = `
      <tr class="session-summary-head">
        <th>${t("session.table.exercise")}</th>
        <th>${t("session.table.series")}</th>
        <th>${t("session.table.maxWeightTime")}</th>
        <th>${t("session.table.failure")}</th>
      </tr>
    `;
  }

  let totalExercises = 0;
  let totalSets = 0;

  saved.exercises.forEach((ex, exIndex) => {
    const groupBg = usePngStyles
      ? (exIndex % 2 === 0 ? "#e2e8f0" : "#f8fafc")
      : (exIndex % 2 === 0 ? "var(--control-bg)" : "var(--card-bg)");
    totalExercises += 1;

    const isCardio = String(ex.musculo || "").toLowerCase() === "cardio";
    if (!usePngStyles) {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      const seriesCount = sets.length;
      const weights = sets
        .map(set => parseFloat(set.peso))
        .filter(value => !Number.isNaN(value));
      const times = sets
        .map(set => parseFloat(set.tiempo ?? set.reps))
        .filter(value => !Number.isNaN(value));
      const maxWeight = isCardio ? "-" : (weights.length ? Math.max(...weights) : "-");
      const maxTime = isCardio ? (times.length ? Math.max(...times) : "-") : "-";
      const hasFailure = isCardio
        ? "-"
        : sets.some(set => set.fallo === true) ? t("session.failure.yes") : t("session.failure.no");
      const weightOrTime = isCardio
        ? (maxTime !== "-" ? t("exercise.detail.time", { value: maxTime }) : "-")
        : (maxWeight !== "-" ? t("exercise.detail.weight", { value: maxWeight }) : "-");
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ex.nombre || t("history.view.exerciseDefault")}</td>
        <td>${seriesCount}</td>
        <td>${weightOrTime}</td>
        <td>${hasFailure}</td>
      `;
      table.appendChild(row);
      return;
    }

    ex.sets.forEach((set, setIndex) => {
      totalSets += 1;
      const displayPeso = isCardio ? (set.intensidad ?? set.peso ?? "") : (set.peso ?? "");
      const displayReps = isCardio ? (set.tiempo ?? set.reps ?? "") : (set.reps ?? "");
      const displayFallo = isCardio ? "" : (set.fallo ? t("session.failure.yes") : t("session.failure.no"));
      const displayRepsFallo = isCardio ? "" : (set.repsFallo ?? "");

      const tr = document.createElement("tr");
      tr.style.background = groupBg;
      if (setIndex === 0) {
        tr.style.borderTop = "2px solid #000";
      }
      if (usePngStyles) {
        tr.innerHTML = `
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; font-weight: bold;">${ex.nombre}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.serie ?? ""}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${displayPeso}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg}; text-align:right;">${displayReps}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${displayFallo}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${displayRepsFallo}</td>
          <td style="border:1px solid #000; padding:4px; color:#000; background:${groupBg};">${set.obs ?? ""}</td>
        `;
      } else {
        tr.innerHTML = `
          <td style="background:${groupBg}; font-weight: 700;">${ex.nombre}</td>
          <td style="background:${groupBg};">${set.serie ?? ""}</td>
          <td style="background:${groupBg}; text-align:right;">${displayPeso}</td>
          <td style="background:${groupBg}; text-align:right;">${displayReps}</td>
          <td style="background:${groupBg};">${displayFallo}</td>
          <td style="background:${groupBg};">${displayRepsFallo}</td>
          <td style="background:${groupBg};">${set.obs ?? ""}</td>
        `;
      }
      table.appendChild(tr);
    });

    if (usePngStyles && exIndex < saved.exercises.length - 1) {
      const separator = document.createElement("tr");
      if (usePngStyles) {
        separator.innerHTML = `
          <td colspan="7" style="border-left:1px solid #000; border-right:1px solid #000; border-top:1px solid #777; padding:0; height:6px; background:#fff;"></td>
        `;
      }
      table.appendChild(separator);
    }
  });

  if (usePngStyles) {
    table.querySelectorAll("th, td").forEach(cell => {
      cell.style.borderColor = "#000";
    });
    table.querySelectorAll("td").forEach(cell => {
      cell.style.color = "#000";
    });
  }

  if (usePngStyles) {
    exportDiv.appendChild(table);
  } else {
    const tableWrap = document.createElement("div");
    tableWrap.className = "session-summary-table-wrap";
    tableWrap.appendChild(table);
    exportDiv.appendChild(tableWrap);
  }

  if (usePngStyles) {
    const summary = document.createElement("div");
    summary.style.marginTop = "8px";
    summary.style.fontSize = "12px";
    summary.style.color = "#000";
    summary.innerHTML = `
      <p style="margin: 3px 0; font-weight:bold; color:#000;">${t("session.summary.header")}</p>
      <p style="margin: 3px 0; color:#000;">${t("session.summary.totalExercises", { count: totalExercises })}</p>
      <p style="margin: 3px 0; color:#000;">${t("session.summary.totalSets", { count: totalSets })}</p>
    `;
    exportDiv.appendChild(summary);

    const sensations = saved.sensations || {};
    const sensDiv = document.createElement("div");
    sensDiv.style.marginTop = "20px";
    sensDiv.style.borderTop = "1px solid #000";
    sensDiv.style.paddingTop = "10px";
    sensDiv.style.color = "#000";

    let painText = "";
    if (sensations.pain === "si") {
      const zoneText = sensations.painZone || t("session.pain.zoneNA");
      const exerciseText = sensations.painExercise || t("session.pain.exerciseNA");
      painText = `${t("session.failure.yes")} (${zoneText} - ${exerciseText})`;
    } else {
      painText = t("session.failure.no");
    }

    sensDiv.innerHTML = `
        <p style="font-weight:bold; margin: 3px 0; color:#000; font-size:14px;">${t("session.metrics.title")}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">${t("session.metrics.general", { value: sensations.general || "N/A" })}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">${t("session.metrics.tiredness", { value: sensations.tiredness || "N/A" })}</p>
        <p style="margin: 3px 0; color:#000; font-size:12px;">${t("session.metrics.pain", { value: painText })}</p>
    `;
    exportDiv.appendChild(sensDiv);

    const footer = document.createElement("p");
    footer.textContent = t("session.footer");
    footer.style.fontSize = "10px";
    footer.style.textAlign = "right";
    footer.style.marginTop = "15px";
    footer.style.color = "#000";
    exportDiv.appendChild(footer);
  }

  return exportDiv;
}

function setActiveStep(index, options = {}) {
  if (!stepPages.length) return;
  const maxIndex = getMaxStepIndex();
  let nextIndex = Math.max(0, Math.min(index, maxIndex));
  const prevIndex = activeStepIndex;

  const step7Index = stepPages.indexOf(step7);
  const step6Index = stepPages.indexOf(step6);
  const step3Index = stepPages.indexOf(step3);
  const step4Index = stepPages.indexOf(step4);
  const enteringStep7 = step7Index >= 0 && nextIndex === step7Index;
  const leavingStep7 = step7Index >= 0 && activeStepIndex === step7Index && nextIndex !== step7Index;
  const enteringStep4FromStep3 = step4Index >= 0 && step3Index >= 0 && prevIndex === step3Index && nextIndex === step4Index;
  if (enteringStep7 && editExercisesContainer) {
    exercisesContainer = editExercisesContainer;
    showAllExercises = true;
  }
  if (leavingStep7) {
    exercisesContainer = mainExercisesContainer;
    showAllExercises = false;
    if (editExercisesContainer) editExercisesContainer.innerHTML = "";
    if (editingSessionContext) {
      if (dateInput) dateInput.value = editingSessionContext.date || "";
      if (weekSelect) {
        ensureSelectValue(weekSelect, editingSessionContext.week || "");
      }
      if (daySelect) {
        if (weekSelect) populateDaySelect(weekSelect.value);
        ensureSelectValue(daySelect, editingSessionContext.day || "");
      }
      loadSession();
      if (typeof window.loadChartExercises === "function") {
        window.loadChartExercises();
      }
      editingSessionContext = null;
    }
  }

  activeStepIndex = nextIndex;
  stepPages.forEach((step, idx) => {
    if (!step) return;
    step.classList.toggle("active", idx === activeStepIndex);
    step.setAttribute("aria-hidden", idx === activeStepIndex ? "false" : "true");
    if ("open" in step) {
      step.open = idx === activeStepIndex;
    }
  });

  if (step6Index >= 0 && nextIndex === step6Index) {
    if (typeof window.loadChartExercises === "function") {
      window.loadChartExercises();
    }
  }

  if (step3Index >= 0 && nextIndex === step3Index) {
    lastRoutinePromptSignature = "";
  }
  if (enteringStep4FromStep3) {
    maybePromptSaveRoutine();
  }
  updateStepNavigation();
}

function initializeStepper() {
  if (!stepPages.length) return;

  if (stepperPrevBtn) {
    stepperPrevBtn.addEventListener("click", () => setActiveStep(activeStepIndex - 1));
  }
  if (stepperNextBtn) {
    stepperNextBtn.addEventListener("click", () => setActiveStep(activeStepIndex + 1));
  }

  setActiveStep(activeStepIndex, { skipScroll: true });
}

// CAMPOS DE SENSACIONES
const senseGeneralInput = document.getElementById("sense-general");
const senseTirednessInput = document.getElementById("sense-tiredness");
const senseWeightInput = document.getElementById("sense-weight");
const sensePainSelect = document.getElementById("sense-pain");
const painDetailsDiv = document.getElementById("pain-details");
const painZoneInput = document.getElementById("pain-zone");
const painExerciseSelect = document.getElementById("pain-exercise");

// MAPA DE GRUPOS MUSCULARES
const muscleGroupMap = {
  "Pectoral": "Pecho",
  "Deltoides": "Hombros",
  "Bíceps": "Brazos",
  "Tríceps": "Brazos",
  "Espalda": "Espalda",
  "Dorsal": "Espalda",
  "Cuádriceps": "Piernas",
  "Femoral": "Piernas",
  "Gemelos": "Piernas",
  "Glúteo": "Piernas",
  "Cardio": "Cardio",
  "Antebrazo": "Antebrazos",
  "Trapecio": "Espalda",
  "Abdominales": "Core",
  "Oblicuos": "Core",
  "Transverso": "Core",
  "Inferior": "Core",
  "Lateral": "Core"
};

// Fecha inicial
dateInput.value = new Date().toISOString().slice(0, 10);

// Histórico
let historyData = {}; // {exerciseName: [weights]}
window.uploadedHistory = []; // Array of sessions

function getHistoryStorageKey() {
  return currentUserKey ? `${LOCAL_HISTORY_KEY}_${currentUserKey}` : LOCAL_HISTORY_KEY;
}

function getHistoryStorageKeyForUser(userKey) {
  return userKey ? `${LOCAL_HISTORY_KEY}_${userKey}` : LOCAL_HISTORY_KEY;
}

function buildSessionKeyForUser(session, userKey) {
  const date = session?.date || "";
  const week = session?.week || "";
  const day = session?.day || "";
  if (!date && !week && !day) return "";
  const userPart = userKey ? `${userKey}_` : "";
  return `gym_${userPart}${date}_${week}_${day}`;
}

function buildSessionKey(session) {
  return buildSessionKeyForUser(session, currentUserKey);
}

function getLocalHistory() {
  const raw = storage.getItem(getHistoryStorageKey());
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function getLegacyHistoryForCurrentUser() {
  const raw = storage.getItem(LOCAL_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    if (!currentUserName) return parsed;
    return parsed.filter(session => {
      if (!session || typeof session !== "object") return false;
      if (!session.user) return true;
      return session.user === currentUserName;
    });
  } catch (err) {
    return [];
  }
}

function getHistorySessionsForCharts() {
  const sources = [];
  const stored = getLocalHistory();
  if (stored.length) sources.push(stored);
  const fromKeys = collectSessionsFromSessionKeys(currentUserKey);
  if (fromKeys.length) sources.push(fromKeys);
  const localKeys = collectSessionsFromSessionKeys("local");
  if (localKeys.length) sources.push(localKeys);
  const legacy = getLegacyHistoryForCurrentUser();
  if (legacy.length) sources.push(legacy);
  const merged = new Map();
  sources.flat().forEach(session => {
    if (!session || typeof session !== "object") return;
    const key = session.key
      || buildSessionKey(session)
      || `${session.date || ""}|${session.week || ""}|${session.day || ""}|${session.user || ""}`;
    if (!merged.has(key)) merged.set(key, session);
  });
  if (!merged.size) {
    const scanned = collectSessionsFromStorage();
    scanned.forEach(session => {
      const key = session.key
        || buildSessionKey(session)
        || `${session.date || ""}|${session.week || ""}|${session.day || ""}|${session.user || ""}`;
      if (!merged.has(key)) merged.set(key, session);
    });
  }
  return Array.from(merged.values());
}

function collectSessionsFromStorage() {
  const sessions = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    if (!key.startsWith("gym_")) continue;
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") continue;
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (!item || typeof item !== "object") return;
          const hasExercises = Array.isArray(item.exercises) || Array.isArray(item.ejercicios);
          if (!hasExercises) return;
          sessions.push({ ...item, key: item.key || key });
        });
        continue;
      }
      const hasExercises = Array.isArray(parsed.exercises) || Array.isArray(parsed.ejercicios);
      if (!hasExercises) continue;
      sessions.push({ ...parsed, key: parsed.key || key });
    } catch (err) {
      // Ignore malformed entries.
    }
  }
  return sessions;
}

window.getGymHistorySessions = () => getHistorySessionsForCharts();

function getExerciseNameFromEntry(entry) {
  if (!entry || typeof entry !== "object") return "";
  return entry.nombre || entry.name || entry.exercise || entry.ejercicio || "";
}

function getExercisesArrayFromSession(session) {
  if (!session || typeof session !== "object") return [];
  if (Array.isArray(session.exercises)) return session.exercises;
  if (Array.isArray(session.ejercicios)) return session.ejercicios;
  if (Array.isArray(session.data?.exercises)) return session.data.exercises;
  if (Array.isArray(session.data?.ejercicios)) return session.data.ejercicios;
  if (Array.isArray(session.session?.exercises)) return session.session.exercises;
  if (Array.isArray(session.session?.ejercicios)) return session.session.ejercicios;
  return [];
}

function getGymHistoryExerciseNames() {
  const sessions = getHistorySessionsForCharts();
  const names = new Set();
  const collectFromSession = (session) => {
    getExercisesArrayFromSession(session).forEach(entry => {
      const name = getExerciseNameFromEntry(entry);
      if (name) names.add(name);
    });
  };
  sessions.forEach(collectFromSession);
  if (names.size) return Array.from(names);
  const fromStorage = collectExerciseNamesFromStorage();
  return fromStorage.length ? fromStorage : Array.from(names);
}

window.getGymHistoryExerciseNames = getGymHistoryExerciseNames;

function collectExerciseNamesFromStorage() {
  const names = new Set();
  const seen = new WeakSet();
  const visit = (value, depth = 0) => {
    if (depth > 4 || value == null) return;
    if (Array.isArray(value)) {
      value.forEach(item => visit(item, depth + 1));
      return;
    }
    if (typeof value !== "object") return;
    if (seen.has(value)) return;
    seen.add(value);
    const exercises = value.exercises || value.ejercicios || value.data?.exercises || value.data?.ejercicios || value.session?.exercises || value.session?.ejercicios;
    if (Array.isArray(exercises)) {
      exercises.forEach(entry => {
        const name = getExerciseNameFromEntry(entry);
        if (name) names.add(name);
      });
    }
    Object.values(value).forEach(child => visit(child, depth + 1));
  };
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    if (!key.includes("gym") && !key.includes("history")) continue;
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      visit(parsed, 0);
    } catch (err) {
      // Ignore malformed entries.
    }
  }
  return Array.from(names);
}

function getLocalHistoryForUser(userKey) {
  const raw = storage.getItem(getHistoryStorageKeyForUser(userKey));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function hasHistoryForUser(userKey) {
  if (!userKey) return false;
  const historyKey = getHistoryStorageKeyForUser(userKey);
  if (storage.getItem(historyKey)) return true;
  const prefix = `gym_${userKey}_`;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    if (key.startsWith(prefix)) return true;
  }
  return false;
}

function setLocalHistory(sessions) {
  storage.setItem(getHistoryStorageKey(), JSON.stringify(sessions));
}

function setLocalHistoryForUser(userKey, sessions) {
  storage.setItem(getHistoryStorageKeyForUser(userKey), JSON.stringify(sessions));
}

function collectSessionsFromSessionKeys(userKey) {
  const sessions = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i) || "";
    if (userKey === "local") {
      if (!/^gym_\d{4}-\d{2}-\d{2}_/.test(key)) continue;
    } else {
      const prefix = `gym_${userKey}_`;
      if (!key.startsWith(prefix)) continue;
    }
    try {
      const raw = storage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") continue;
      if (!parsed.date) continue;
      sessions.push({
        ...parsed,
        key,
        user: parsed.user || currentUserName
      });
    } catch (err) {
      // Ignore malformed entries.
    }
  }
  return sessions;
}

function hydrateHistoryFromSessionKeys() {
  const existing = getLocalHistory();
  if (existing.length) return;
  const sessions = collectSessionsFromSessionKeys(currentUserKey);
  if (!sessions.length) return;
  setLocalHistory(sessions);
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshCharts();
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}

function rebuildHistoryData(sessions) {
  historyData = {};
  sessions.forEach(session => {
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
}

function loadLocalHistory() {
  const sessions = getLocalHistory();
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshCharts();
  refreshHistoryUI();
  populateHistoryDaySelect();
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}

function upsertLocalHistory(session) {
  if (!session) return;
  const sessions = getLocalHistory();
  const key = session.key || buildSessionKey(session) || sessionKey();
  const sessionWithKey = { ...session, key, user: session.user || currentUserName };
  const index = sessions.findIndex(item => item.key === key);
  if (index >= 0) {
    const existing = sessions[index];
    const revisions = Array.isArray(existing.revisions) ? existing.revisions.slice() : [];
    const snapshot = { ...existing };
    delete snapshot.revisions;
    revisions.push({ savedAt: new Date().toISOString(), data: snapshot });
    if (revisions.length > 10) {
      revisions.splice(0, revisions.length - 10);
    }
    sessions[index] = { ...sessionWithKey, revisions };
  } else {
    sessions.push(sessionWithKey);
  }
  setLocalHistory(sessions);
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshCharts();
  refreshHistoryUI();
}

function mergeImportedHistory(imported) {
  if (!Array.isArray(imported)) return;
  const sessions = getLocalHistory();
  const byKey = new Map();
  sessions.forEach(item => {
    const key = item.key || buildSessionKey(item);
    if (key) byKey.set(key, { ...item, key, user: item.user || currentUserName });
  });
  imported.forEach(item => {
    if (!item || typeof item !== "object") return;
    const key = item.key || buildSessionKey(item);
    if (!key) return;
    byKey.set(key, { ...item, key, user: item.user || currentUserName });
  });
  const merged = Array.from(byKey.values());
  setLocalHistory(merged);
  window.uploadedHistory = merged;
  rebuildHistoryData(merged);
  refreshCharts();
}

function mergeImportedHistoryForUser(imported, userName, userKey) {
  if (!Array.isArray(imported)) return;
  const sessions = getLocalHistoryForUser(userKey);
  const byKey = new Map();
  sessions.forEach(item => {
    const key = item.key || buildSessionKeyForUser(item, userKey);
    if (key) byKey.set(key, { ...item, key, user: item.user || userName });
  });
  imported.forEach(item => {
    if (!item || typeof item !== "object") return;
    const key = item.key || buildSessionKeyForUser(item, userKey);
    if (!key) return;
    byKey.set(key, { ...item, key, user: item.user || userName });
  });
  const merged = Array.from(byKey.values());
  setLocalHistoryForUser(userKey, merged);
  refreshCharts();
  refreshHistoryUI();
}

function getExportHistoryForUser(userKey) {
  const sessions = getLocalHistoryForUser(userKey);
  const base = sessions.length ? sessions : collectSessionsFromSessionKeys(userKey);
  return base.map(session => ({
    ...session,
    user: session.user || currentUserName,
    key: session.key || buildSessionKeyForUser(session, userKey)
  }));
}

function getMaxWeight(exerciseName) {
  if (!historyData[exerciseName] || historyData[exerciseName].length === 0) return null;
  return Math.max(...historyData[exerciseName]);
}

function getLastExerciseSession(exerciseName) {
  const sessions = window.uploadedHistory || [];
  let lastSession = null;
  let lastDate = null;

  sessions.forEach(session => {
    if (!session?.exercises?.length) return;
    const hasExercise = session.exercises.some(ex => ex.nombre === exerciseName);
    if (!hasExercise) return;

    const sessionDate = new Date(session.date);
    if (!isNaN(sessionDate)) {
      if (!lastDate || sessionDate > lastDate) {
        lastDate = sessionDate;
        lastSession = session;
      }
    } else {
      lastSession = session;
    }
  });

  return lastSession;
}

function getLastExerciseSet(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;

  const firstSet = ex.sets[0] || {};
  const peso = firstSet.peso ?? null;
  const reps = firstSet.reps ?? null;

  if (peso == null && reps == null) return null;
  return { peso, reps };
}

function getLastCardioSet(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;

  const firstSet = ex.sets[0] || {};
  const tiempo = firstSet.tiempo ?? firstSet.reps ?? null;
  const intensidad = firstSet.intensidad ?? firstSet.peso ?? null;

  if (tiempo == null && intensidad == null) return null;
  return { tiempo, intensidad };
}

function getLastExerciseMaxWeight(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;
  const weights = ex.sets
    .map(s => parseFloat(s.peso))
    .filter(v => !Number.isNaN(v) && v > 0);
  if (weights.length === 0) return null;
  return Math.max(...weights);
}

function getLastExerciseSummary(exerciseName) {
  const lastSession = getLastExerciseSession(exerciseName);
  if (!lastSession) return null;
  const ex = lastSession.exercises.find(e => e.nombre === exerciseName);
  if (!ex?.sets?.length) return null;
  const firstSet = ex.sets[0] || {};
  const isCardio = String(ex.musculo || "").toLowerCase() === "cardio";
  if (isCardio) {
    const tiempo = firstSet.tiempo ?? firstSet.reps ?? "";
    const intensidad = firstSet.intensidad ?? firstSet.peso ?? "";
    const parts = [];
    if (intensidad !== "") parts.push(t("exercise.detail.intensity", { value: intensidad }));
    if (tiempo !== "") parts.push(t("exercise.detail.time", { value: tiempo }));
    const cardioDetail = parts.length
      ? t("exercise.lastSession.cardio", { detail: parts.join(" · ") })
      : t("exercise.cardio.noData");
    return t("exercise.lastSession", { date: lastSession.date, detail: cardioDetail });
  }
  const peso = firstSet.peso ?? "";
  const reps = firstSet.reps ?? "";
  const parts = [];
  if (peso !== "") parts.push(t("exercise.detail.weight", { value: peso }));
  if (reps !== "") parts.push(t("exercise.detail.reps", { value: reps }));
  const firstSetDetail = parts.length ? t("exercise.firstSet", { detail: parts.join(" x ") }) : t("exercise.firstSet.noData");
  return t("exercise.lastSession", { date: lastSession.date, detail: firstSetDetail });
}

function updateOverloadWarning(card) {
  const warningEl = card.querySelector(".overload-warning");
  if (!warningEl) return;
  if (card.dataset.exerciseType === "cardio") {
    warningEl.style.display = "none";
    return;
  }
  const baseline = parseFloat(warningEl.dataset.baseline);
  if (Number.isNaN(baseline) || baseline <= 0) {
    warningEl.style.display = "none";
    return;
  }

  const rows = card.querySelectorAll("tbody tr");
  let currentMax = null;
  rows.forEach(row => {
    const weightInput = row.querySelector('input[data-key="peso"]');
    const peso = parseFloat(weightInput?.value);
    if (!Number.isNaN(peso)) {
      if (currentMax === null || peso > currentMax) currentMax = peso;
    }
  });

  if (currentMax != null && currentMax > baseline * 1.1) {
    warningEl.textContent = t("warning.overload", { baseline, current: currentMax });
    warningEl.style.display = "block";
  } else {
    warningEl.style.display = "none";
  }
}

// -------------------------
// FUNCIONES BASE
// -------------------------

function sessionKey() {
  const userPart = currentUserKey ? `${currentUserKey}_` : "";
  return `gym_${userPart}${dateInput.value}_${weekSelect.value}_${daySelect.value}`;
}

function setStatus(msg) {
  statusText.textContent = msg;
  setTimeout(() => {
    if (statusText.textContent === msg) statusText.textContent = "";
  }, 1500);
}

function loadCustomRoutines() {
  if (!currentUserKey) return {};
  try {
    const key = `${CUSTOM_ROUTINES_KEY}_${currentUserKey}`;
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    return {};
  }
}

function saveCustomRoutines(data) {
  if (!currentUserKey) return;
  const key = `${CUSTOM_ROUTINES_KEY}_${currentUserKey}`;
  storage.setItem(key, JSON.stringify(data));
}

function getAllRoutines() {
  const base = window.routines || {};
  const custom = loadCustomRoutines();
  return { ...base, ...custom };
}

function buildRoutineValue(week, day) {
  return `${week}${ROUTINE_VALUE_SEP}${day}`;
}

function parseRoutineValue(value) {
  const [week, day] = String(value || "").split(ROUTINE_VALUE_SEP);
  return { week: week || "", day: day || "" };
}

function getSelectedRoutineKeys() {
  if (routineSelect?.value) {
    const parsed = parseRoutineValue(routineSelect.value);
    if (parsed.week && parsed.day) return parsed;
  }
  return { week: weekSelect?.value || "", day: daySelect?.value || "" };
}

function syncRoutineSelectFromWeekDay() {
  if (!routineSelect || !weekSelect || !daySelect) return;
  const value = buildRoutineValue(weekSelect.value, daySelect.value);
  const hasOption = Array.from(routineSelect.options).some(opt => opt.value === value);
  if (hasOption) routineSelect.value = value;
}

function getRoutineEntries() {
  const routines = getAllRoutines();
  const entries = [];
  Object.keys(routines).forEach(week => {
    const days = routines[week] || {};
    const dayKeys = Object.keys(days);
    dayKeys.forEach(day => {
      const isSingleCustom = dayKeys.length === 1 && day === "Día 1 - Sesión guardada";
      const label = isSingleCustom
        ? translateRoutineLabel(week)
        : `${translateRoutineLabel(week)} · ${translateRoutineLabel(day)}`;
      entries.push({
        week,
        day,
        label,
        value: buildRoutineValue(week, day)
      });
    });
  });
  entries.sort((a, b) => a.label.localeCompare(b.label, getLocale()));
  return entries;
}

function normalizeRoutineExerciseName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getRoutineSignature(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) return "";
  return exercises
    .map(normalizeRoutineExerciseName)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, getLocale()))
    .join("|");
}

function getSavedRoutineSignatures() {
  const routines = getAllRoutines();
  const signatures = new Set();
  Object.values(routines).forEach(days => {
    if (!days || typeof days !== "object") return;
    Object.values(days).forEach(exercises => {
      if (!Array.isArray(exercises)) return;
      const signature = getRoutineSignature(exercises);
      if (signature) signatures.add(signature);
    });
  });
  return signatures;
}

function getCurrentRoutineExercises() {
  return Array.from(document.querySelectorAll(".exercise-card .exercise-title"))
    .map(card => card.textContent.trim())
    .filter(Boolean);
}

function notifyRoutineError(message) {
  if (saveRoutineError) {
    showSaveRoutineError(message);
    return;
  }
  alert(message);
}

function saveCurrentRoutineAs(name, exercises) {
  const trimmed = name.trim();
  if (!trimmed) {
    notifyRoutineError(t("status.emptyRoutineName"));
    return false;
  }
  const routineExercises = Array.isArray(exercises) ? exercises : [];
  if (routineExercises.length === 0) {
    notifyRoutineError(t("status.noExercisesToSaveRoutine"));
    return false;
  }
  const allCustom = loadCustomRoutines();
  const exists = Boolean(allCustom[trimmed]);
  if (exists && !confirm(t("confirm.overwriteRoutine", { name: trimmed }))) {
    return false;
  }
  allCustom[trimmed] = {
    "Día 1 - Sesión guardada": routineExercises
  };
  saveCustomRoutines(allCustom);
  populateRoutineSelectors();
  if (weekSelect) {
    weekSelect.value = trimmed;
    populateDaySelect(trimmed);
  }
  syncRoutineSelectFromWeekDay();
  setStatus(t("status.routineAdded"));
  return true;
}

function maybePromptSaveRoutine() {
  if (!currentUserKey) return;
  const exercises = getCurrentRoutineExercises();
  if (!exercises.length) return;
  const signature = getRoutineSignature(exercises);
  if (!signature) return;
  const savedSignatures = getSavedRoutineSignatures();
  if (savedSignatures.has(signature)) return;
  if (lastRoutinePromptSignature === signature) return;
  lastRoutinePromptSignature = signature;

  if (!confirm(t("confirm.saveNewRoutine"))) return;
  const routineName = prompt(t("prompt.routineName"));
  if (!routineName) return;
  saveCurrentRoutineAs(routineName, exercises);
}

function showSaveSessionMessage() {
  if (!saveSessionMessage) return;
  const messages = Array.from({ length: 18 }, (_, index) => t(`message.saveSessionRandom.${index}`));
  const message = messages[Math.floor(Math.random() * messages.length)];
  saveSessionMessage.innerHTML = `<strong>${t("message.sessionSavedTitle")}</strong> ${message}`;
  saveSessionMessage.style.display = "block";
  clearSaveSessionError();
}

function showSaveSessionError(message) {
  if (!saveSessionError) return;
  saveSessionError.innerHTML = `<strong>${t("message.errorTitle")}</strong> ${message}`;
  saveSessionError.style.display = "block";
}

function clearSaveSessionError() {
  if (!saveSessionError) return;
  saveSessionError.textContent = "";
  saveSessionError.style.display = "none";
}

function showSaveRoutineMessage(message) {
  if (!saveRoutineMessage) return;
  saveRoutineMessage.innerHTML = `<strong>${t("message.routineSavedTitle")}</strong> ${message || ""}`.trim();
  saveRoutineMessage.style.display = "block";
  if (saveRoutineError) {
    saveRoutineError.textContent = "";
    saveRoutineError.style.display = "none";
  }
}

function showSaveRoutineError(message) {
  if (!saveRoutineError) return;
  saveRoutineError.innerHTML = `<strong>${t("message.errorTitle")}</strong> ${message}`;
  saveRoutineError.style.display = "block";
  if (saveRoutineMessage) {
    saveRoutineMessage.textContent = "";
    saveRoutineMessage.style.display = "none";
  }
}

function setFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`error-${fieldId}`);
  if (!field || !errorEl) return;
  if (message) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
    field.setAttribute("aria-invalid", "true");
  } else {
    errorEl.textContent = "";
    errorEl.style.display = "none";
    field.removeAttribute("aria-invalid");
  }
}

function clearFieldErrors() {
  [
    "sense-general",
    "sense-tiredness",
    "sense-pain",
    "pain-zone",
    "pain-exercise"
  ].forEach(id => setFieldError(id, ""));
}

function isPostWorkoutComplete() {
  const hasExercises = exercisesContainer && exercisesContainer.children.length > 0;
  if (!hasExercises) return false;
  if (!senseGeneralInput?.value || senseGeneralInput.value.trim() === "") return false;
  if (!senseTirednessInput?.value || senseTirednessInput.value.trim() === "") return false;
  if (sensePainSelect?.value === "si") {
    if (!painZoneInput?.value || painZoneInput.value.trim() === "") return false;
    if (!painExerciseSelect?.value || painExerciseSelect.value.trim() === "") return false;
  }
  return true;
}


// -------------------------
// FUNCIÓN DE VALIDACIÓN 
// -------------------------
function checkSensationsForm(shouldFocus = false) {
    let isValid = true;
    let errorMessage = "";
    let firstInvalid = null;
    const hasExercises = exercisesContainer && exercisesContainer.children.length > 0;

    clearFieldErrors();

    if (!hasExercises) {
        isValid = false;
        errorMessage = t("error.addExerciseToActivate");
    }
    
    // 1. Sensaciones generales y cansancio
    if (hasExercises) {
        if (!senseGeneralInput.value || senseGeneralInput.value.trim() === '') {
            isValid = false;
            errorMessage = t("error.completeQuestionnaire");
            setFieldError("sense-general", t("error.requiredField"));
            if (!firstInvalid) firstInvalid = senseGeneralInput;
        }
        if (!senseTirednessInput.value || senseTirednessInput.value.trim() === '') {
            isValid = false;
            errorMessage = t("error.completeQuestionnaire");
            setFieldError("sense-tiredness", t("error.requiredField"));
            if (!firstInvalid) firstInvalid = senseTirednessInput;
        }
    }

    // 2. Dolor específico (si 'si' está seleccionado)
    if (hasExercises && sensePainSelect.value === 'si') {
        if (!painZoneInput.value || painZoneInput.value.trim() === '') {
            isValid = false;
            errorMessage = t("error.completeQuestionnaire");
            setFieldError("pain-zone", t("error.painZoneRequired"));
            if (!firstInvalid) firstInvalid = painZoneInput;
        }
        if (!painExerciseSelect.value || painExerciseSelect.value.trim() === '') {
            isValid = false;
            errorMessage = t("error.completeQuestionnaire");
            setFieldError("pain-exercise", t("error.exerciseRequired"));
            if (!firstInvalid) firstInvalid = painExerciseSelect;
        }
    }

    exportBtn.disabled = !isValid;
    if (saveSessionBtn) saveSessionBtn.disabled = !isValid;
    if (!isValid && saveSessionMessage) {
        saveSessionMessage.style.display = "none";
        saveSessionMessage.textContent = "";
    }
    if (isValid) {
        clearSaveSessionError();
    } else {
        showSaveSessionError(errorMessage || t("error.completeQuestionnaireButtons"));
    }

    if (shouldFocus && firstInvalid) {
        firstInvalid.focus();
    }

    return isValid;
}


// -------------------------
// CREAR FILAS DE SERIES
// -------------------------

const strengthSetFields = [
  { key: "serie", type: "static" },
  { key: "peso", type: "number" },
  { key: "reps", type: "number" },
  { key: "fallo", type: "checkbox" },
  { key: "repsFallo", type: "number" },
  { key: "obs", type: "text" }
];

const cardioSetFields = [
  { key: "serie", type: "static" },
  { key: "intensidad", type: "number", placeholderKey: "cardio.placeholderIntensity" },
  { key: "tiempo", type: "number", placeholderKey: "cardio.placeholderTime" },
  { key: "obs", type: "text" }
];

function updateSetNumbers(tbody) {
  if (!tbody) return;
  Array.from(tbody.children).forEach((row, index) => {
    const cell = row.querySelector("td");
    const label = cell?.querySelector("span");
    if (label) label.textContent = String(index + 1);
  });
}

function addSetRow(tbody, setData = {}, onInputChange, fields = strengthSetFields) {
  const tr = document.createElement("tr");
  const shouldCopyFromPrev = Object.keys(setData).length === 0;
  let resolvedSetData = setData;

  if (shouldCopyFromPrev) {
    const prevRow = tbody.lastElementChild;
    if (prevRow) {
      const prevInputs = prevRow.querySelectorAll("input");
      const copied = {};
      let inputIndex = 0;
      fields.forEach(f => {
        if (f.type === "static") return;
        const prevInput = prevInputs[inputIndex];
        inputIndex += 1;
        if (!prevInput) return;
        if (f.type === "checkbox") {
          if (prevInput.checked) copied[f.key] = true;
          return;
        }
        const prevValue = prevInput.value ?? "";
        if (prevValue !== "") copied[f.key] = prevValue;
      });
      resolvedSetData = { ...copied, ...setData };
    }
  }

  fields.forEach(f => {
    const td = document.createElement("td");
    let input;

    if (f.type === "static") {
      const text = document.createElement("span");
      const defaultValue = tbody.children.length + 1;
      text.textContent = resolvedSetData[f.key] ?? defaultValue ?? "";
      td.appendChild(text);
      tr.appendChild(td);
      return;
    }
    if (f.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = setData[f.key] ?? false;
    } else {
      input = document.createElement("input");
      input.type = f.type;
      input.value = resolvedSetData[f.key] ?? "";
    }
    input.dataset.key = f.key;
    if (f.placeholderKey) input.placeholder = t(f.placeholderKey);

    input.addEventListener("input", () => {
      saveSession();
      if (onInputChange) onInputChange();
    });
    input.addEventListener("change", () => {
      saveSession();
      if (onInputChange) onInputChange();
    });

    td.appendChild(input);
    tr.appendChild(td);
  });

  const actionTd = document.createElement("td");
  actionTd.className = "set-action-cell";
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-set-btn";
  removeBtn.textContent = "−";
  removeBtn.setAttribute("aria-label", t("exercise.removeSet"));
  removeBtn.addEventListener("click", () => {
    tr.remove();
    updateSetNumbers(tbody);
    saveSession();
    if (onInputChange) onInputChange();
  });
  actionTd.appendChild(removeBtn);
  tr.appendChild(actionTd);

  tbody.appendChild(tr);
}


// -------------------------
// CREAR UNA TARJETA DE EJERCICIO
// -------------------------

function buildExerciseCard(exData) {
  const card = document.createElement("div");
  card.className = "exercise-card";
  const isCardio = String(exData.musculo || exData.grupo || "").toLowerCase() === "cardio";
  card.dataset.exerciseType = isCardio ? "cardio" : "strength";

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
  const hacerDisplay = exData.hacer || t("exercise.custom.noDescription");
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
      ${translateGroupLabel(musculoDisplay)} – ${seccionDisplay}
    </div>
  `;


  const headerActions = document.createElement("div");
  headerActions.className = "exercise-header-actions";

  header.appendChild(left);
  header.appendChild(headerActions);
  card.appendChild(header);

  // ====== HISTORIAL RAPIDO ======
  const historyInfo = document.createElement("div");
  historyInfo.className = "exercise-history";
  historyInfo.style.fontSize = "0.65rem";
  historyInfo.style.color = "var(--meta-text)";
  historyInfo.style.margin = "6px 0 4px";
  historyInfo.textContent = getLastExerciseSummary(exData.nombre) || t("exercise.history.none");
  card.appendChild(historyInfo);

  // ====== AVISO SOBRECARGA ======
  const overloadWarning = document.createElement("div");
  overloadWarning.className = "overload-warning";
  overloadWarning.style.display = "none";
  overloadWarning.style.fontSize = "0.75rem";
  overloadWarning.style.margin = "2px 0 6px";
  overloadWarning.style.color = "#b91c1c";
  const lastMax = isCardio ? null : getLastExerciseMaxWeight(exData.nombre);
  if (lastMax != null) overloadWarning.dataset.baseline = String(lastMax);
  card.appendChild(overloadWarning);

  // ====== TABLA DE SERIES ======
  const table = document.createElement("table");
  table.className = "exercise-table";
  table.innerHTML = isCardio ? `
    <thead>
      <tr>
        ${t("exercise.table.cardio")}
      </tr>
    </thead>
    <tbody></tbody>
  ` : `
    <thead>
      <tr>
        ${t("exercise.table.strength")}
      </tr>
    </thead>
    <tbody></tbody>
  `;
  card.appendChild(table);

  const tbody = table.querySelector("tbody");

  // Series
  if (exData.sets && exData.sets.length > 0) {
    exData.sets.forEach(s => {
      const normalized = isCardio
        ? {
            intensidad: s.intensidad ?? s.peso ?? "",
            tiempo: s.tiempo ?? s.reps ?? "",
            obs: s.obs ?? ""
          }
        : s;
      addSetRow(tbody, normalized, () => updateOverloadWarning(card), isCardio ? cardioSetFields : strengthSetFields);
    });
  } else {
    const initialSet = {};
    if (isCardio) {
      const lastSet = getLastCardioSet(exData.nombre);
      if (lastSet) {
        if (lastSet.intensidad != null && lastSet.intensidad !== "") initialSet.intensidad = lastSet.intensidad;
        if (lastSet.tiempo != null && lastSet.tiempo !== "") initialSet.tiempo = lastSet.tiempo;
      }
      addSetRow(tbody, initialSet, () => updateOverloadWarning(card), cardioSetFields);
    } else {
      const lastSet = getLastExerciseSet(exData.nombre);
      if (lastSet) {
        if (lastSet.peso != null && lastSet.peso !== "") initialSet.peso = lastSet.peso;
        if (lastSet.reps != null && lastSet.reps !== "") initialSet.reps = lastSet.reps;
      }
      if (Object.keys(initialSet).length === 0) {
        const maxWeight = getMaxWeight(exData.nombre);
        if (maxWeight) initialSet.peso = maxWeight;
      }
      addSetRow(tbody, initialSet, () => updateOverloadWarning(card), strengthSetFields);
    }
  }

  const addBtn = document.createElement("button");
  addBtn.textContent = "+";
  addBtn.className = "add-set-btn";
  addBtn.setAttribute("aria-label", t("exercise.addSet"));
  addBtn.onclick = () => {
    addSetRow(tbody, {}, () => updateOverloadWarning(card), isCardio ? cardioSetFields : strengthSetFields);
    saveSession();
    updateOverloadWarning(card);
  };

  const headerRow = table.querySelector("thead tr");
  const actionHeader = headerRow?.querySelector(".set-action-col") || headerRow?.lastElementChild;
  if (actionHeader) {
    actionHeader.innerHTML = "";
    actionHeader.appendChild(addBtn);
  }

  updateOverloadWarning(card);

  // ====== NOTAS TÉCNICAS ======
  const notes = document.createElement("div");
  notes.className = "exercise-notes";
  notes.innerHTML = `
    <details>
      <summary><b>${t("exercise.notes.title")}</b></summary>
      <p><b>${t("exercise.notes.how")}</b> ${hacerDisplay}</p>
      <p><b>${t("exercise.notes.avoid")}</b> ${noHacerDisplay}</p>
      <p><b>${t("exercise.notes.tips")}</b> ${trucosDisplay}</p>
    </details>
  `;
  card.appendChild(notes);

  return card;
}

function addExerciseFromTemplate(name) {
  if (!name) return;
  const tpl = exerciseTemplates[name] || {};
  if (!exercisesContainer) exercisesContainer = mainExercisesContainer;
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
  const total = exercisesContainer.querySelectorAll(".exercise-card").length;
  activeExerciseIndex = Math.max(0, total - 1);
  scheduleExercisePagination();
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}


// -------------------------
// GUARDAR SESIÓN (Y SENSACIONES)
// -------------------------

function saveSession() {
  if (!currentUserKey) return;
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
      weight: senseWeightInput.value,
      pain: sensePainSelect.value,
      painZone: painZoneInput.value,
      painExercise: selectedPainExercise
    },
    user: currentUserName
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
      const serieText = row.querySelector("td:first-child")?.textContent || "";
      const setData = { serie: parseInt(serieText, 10) || null };
      inputs.forEach(input => {
        const key = input.dataset.key;
        if (!key) return;
        if (input.type === "checkbox") {
          setData[key] = input.checked;
          return;
        }
        if (key === "obs") {
          setData[key] = input.value || "";
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
      return setData;
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

  storage.setItem(key, JSON.stringify(data));
  setStatus(t("status.saved"));
  markAutoSaved();
  updateSessionSummary();
  
  // 1. Repopulate the list of exercises for the pain selector
  const currentExerciseNames = data.exercises.map(ex => ex.nombre);
  populatePainExerciseSelect(currentExerciseNames); 

  // 2. Restaurar la selección en el DOM (en caso de que la lista haya cambiado)
  painExerciseSelect.value = data.sensations.painExercise; 

  checkSensationsForm();
  updateStepStatus();
  scheduleExercisePagination(false);
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE AÑADIR EJERCICIO (POR GRUPO)
// -------------------------

function resolveExerciseGroup(tpl) {
  if (!tpl) return "Otros";
  return muscleGroupMap[tpl.musculo] || tpl.grupo || "Otros";
}

function translateGroupLabel(label) {
  const groupKey = `group.${label}`;
  const translatedGroup = t(groupKey);
  if (translatedGroup !== groupKey) return translatedGroup;
  const muscleKey = `muscle.${label}`;
  const translatedMuscle = t(muscleKey);
  if (translatedMuscle !== muscleKey) return translatedMuscle;
  return label;
}

function getExerciseGroups() {
  const groups = new Set();
  Object.values(exerciseTemplates).forEach(tpl => {
    groups.add(resolveExerciseGroup(tpl));
  });
  const preferredOrder = [
    "Pecho",
    "Espalda",
    "Hombros",
    "Brazos",
    "Piernas",
    "Antebrazos",
    "Cardio",
    "Core",
    "Otros"
  ];
  const ordered = preferredOrder.filter(group => groups.has(group));
  const rest = [...groups]
    .filter(group => !preferredOrder.includes(group))
    .sort((a, b) => a.localeCompare(b, getLocale()));
  return ordered.concat(rest);
}

function populateGroupSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = `<option value="">${t("placeholder.selectGroup")}</option>`;
  getExerciseGroups().forEach(group => {
    const opt = document.createElement("option");
    opt.value = group;
    opt.textContent = translateGroupLabel(group);
    selectEl.appendChild(opt);
  });
}

function extractRoutineNumber(label) {
  const match = String(label).match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
}

const routineLabelMap = {
  "Semana 1": "week.1",
  "Semana 2": "week.2",
  "Semana 3": "week.3",
  "Semana 4": "week.4",
  "Semana 5": "week.5",
  "Día 1 – Tren superior (tirón + pecho secundario)": "day.1",
  "Día 2 – Tren superior (empuje + hombro y brazos)": "day.2",
  "Día 3 – Tren inferior + core": "day.3"
};

function translateRoutineLabel(label) {
  const key = routineLabelMap[label];
  return key ? t(key) : label;
}

function sortRoutineLabels(a, b) {
  const numA = extractRoutineNumber(a);
  const numB = extractRoutineNumber(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB) && numA !== numB) {
    return numA - numB;
  }
  if (!Number.isNaN(numA) && Number.isNaN(numB)) return -1;
  if (Number.isNaN(numA) && !Number.isNaN(numB)) return 1;
  return String(a).localeCompare(String(b), getLocale());
}

function populateDaySelect(week) {
  if (!daySelect) return;
  daySelect.innerHTML = "";
  const allRoutines = getAllRoutines();
  const days = Object.keys(allRoutines?.[week] || {}).sort(sortRoutineLabels);
  days.forEach(day => {
    const opt = document.createElement("option");
    opt.value = day;
    opt.textContent = translateRoutineLabel(day);
    daySelect.appendChild(opt);
  });
  if (days.length > 0) daySelect.value = days[0];
}

function populateRoutineSelectors() {
  if (!weekSelect || !daySelect) return;
  const entries = getRoutineEntries();
  const currentValue = routineSelect?.value || buildRoutineValue(weekSelect.value, daySelect.value);

  if (routineSelect) {
    routineSelect.innerHTML = "";
    entries.forEach(entry => {
      const opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = entry.label;
      routineSelect.appendChild(opt);
    });
  }

  const selectedValue = entries.some(entry => entry.value === currentValue)
    ? currentValue
    : entries[0]?.value || "";

  if (selectedValue) {
    const selected = parseRoutineValue(selectedValue);
    weekSelect.value = selected.week;
    populateDaySelect(selected.week);
    daySelect.value = selected.day;
    if (routineSelect) routineSelect.value = selectedValue;
  } else {
    weekSelect.innerHTML = "";
    daySelect.innerHTML = "";
    if (routineSelect) routineSelect.innerHTML = "";
  }
}

function refreshRoutineSelectLabels() {
  if (routineSelect) {
    const currentValue = routineSelect.value;
    const entries = getRoutineEntries();
    routineSelect.innerHTML = "";
    entries.forEach(entry => {
      const opt = document.createElement("option");
      opt.value = entry.value;
      opt.textContent = entry.label;
      routineSelect.appendChild(opt);
    });
    if (entries.some(entry => entry.value === currentValue)) {
      routineSelect.value = currentValue;
    }
    syncRoutineSelectFromWeekDay();
    return;
  }
  if (weekSelect) {
    Array.from(weekSelect.options).forEach(opt => {
      opt.textContent = translateRoutineLabel(opt.value);
    });
  }
  if (daySelect) {
    Array.from(daySelect.options).forEach(opt => {
      opt.textContent = translateRoutineLabel(opt.value);
    });
  }
}

function populateHistoryDaySelect() {
  if (!historyDaySelect) return;
  const sessions = (window.uploadedHistory || [])
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  historyDaySelect.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = sessions.length ? t("status.selectDay") : t("status.noHistorySessions");
  historyDaySelect.appendChild(placeholder);
  if (!sessions.length) {
    historyDaySelect.disabled = true;
    if (loadPreviousSessionBtn) loadPreviousSessionBtn.disabled = true;
    return;
  }
  sessions.forEach(session => {
    const opt = document.createElement("option");
    opt.value = session.key || buildSessionKey(session) || "";
    const dayLabel = session.day ? translateRoutineLabel(session.day) : "-";
    const dateLabel = session.date || "-";
    opt.textContent = `${dateLabel} · ${dayLabel}`;
    historyDaySelect.appendChild(opt);
  });
  historyDaySelect.disabled = false;
  if (loadPreviousSessionBtn) loadPreviousSessionBtn.disabled = false;
}

function getHistorySessionByKey(sessionKey) {
  if (!sessionKey) return null;
  return (window.uploadedHistory || []).find(session => {
    const key = session.key || buildSessionKey(session) || "";
    return key === sessionKey;
  }) || null;
}


// -------------------------
// FUNCIÓN PARA EL SELECTOR DE DOLOR (SOLO EJERCICIOS DE HOY + "No identificado")
// -------------------------

function populatePainExerciseSelect(exerciseNames) {
    painExerciseSelect.innerHTML = `<option value="">${t("placeholder.selectExercise")}</option>`;
    
    // Usa un Set para asegurar nombres únicos
    const uniqueNames = [...new Set(exerciseNames)];
    
    // NUEVO: Añadir opción "No identificado"
    const noSeOpt = document.createElement("option");
    noSeOpt.value = "No identificado";
    noSeOpt.textContent = t("option.notIdentified");
    painExerciseSelect.appendChild(noSeOpt);
    
    // Ordena los nombres de los ejercicios
    uniqueNames.sort((a, b) => a.localeCompare(b, getLocale())).forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
    painExerciseSelect.appendChild(opt);
  });
}


// -------------------------
// CARGAR SESIÓN O RUTINA BASE (Y SENSACIONES)
// -------------------------

function pickLastNonEmptySet(sets, keys) {
  if (!Array.isArray(sets) || sets.length === 0) return null;
  for (let i = sets.length - 1; i >= 0; i -= 1) {
    const set = sets[i] || {};
    const hasValue = keys.some(key => {
      const value = set[key];
      return value !== null && value !== undefined && String(value).trim() !== "";
    });
    if (hasValue) return set;
  }
  return sets[sets.length - 1] || null;
}

function applyHistorySession(session, options = {}) {
  if (!session) return;
  const silent = options.silent === true;
  const preserveAutoSave = options.preserveAutoSave === true;
  const onlyFirstSet = options.onlyFirstSet === true;
  if (!preserveAutoSave) {
    lastAutoSaveTime = null;
    updateAutoSaveLabel();
  }
  exercisesContainer.innerHTML = "";
  senseGeneralInput.value = "";
  senseTirednessInput.value = "";
  senseWeightInput.value = "";
  sensePainSelect.value = "no";
  painZoneInput.value = "";
  painDetailsDiv.style.display = "none";

  let currentExercises = [];
  let savedPainExercise = "";
  const pickValue = (primary, fallback) => {
    if (primary === null || primary === undefined) return fallback;
    const str = String(primary).trim();
    if (str === "" || str.toLowerCase() === "n/a") return fallback;
    return primary;
  };

  if (session.exercises?.length) {
    session.exercises.forEach(ex => {
      const tpl = exerciseTemplates[ex.nombre] || {};
      let sets = ex.sets ?? [];
      if (onlyFirstSet && sets.length) {
        const isCardio = String(ex.musculo || ex.seccion || "").toLowerCase() === "cardio";
        const lastSet = isCardio
          ? pickLastNonEmptySet(sets, ["intensidad", "tiempo", "peso", "reps"])
          : pickLastNonEmptySet(sets, ["peso", "reps"]);
        const first = lastSet || sets[0] || {};
        if (String(ex.musculo || ex.seccion || "").toLowerCase() === "cardio") {
          sets = [{
            intensidad: first.intensidad ?? first.peso ?? null,
            tiempo: first.tiempo ?? first.reps ?? null
          }];
        } else {
          sets = [{
            peso: first.peso ?? null,
            reps: first.reps ?? null
          }];
        }
      }
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: ex.nombre,
        musculo: pickValue(ex.musculo, tpl.musculo ?? "N/A"),
        seccion: pickValue(ex.seccion, tpl.seccion ?? "N/A"),
        hacer: pickValue(ex.hacer, tpl.hacer ?? ""),
        noHacer: pickValue(ex.noHacer, tpl.noHacer ?? ""),
        trucos: pickValue(ex.trucos, tpl.trucos ?? ""),
        sets
      }));
    });
    currentExercises = session.exercises.map(ex => ex.nombre);
  }

  if (session.sensations) {
    senseGeneralInput.value = session.sensations.general ?? "";
    senseTirednessInput.value = session.sensations.tiredness ?? "";
    senseWeightInput.value = session.sensations.weight ?? "";
    sensePainSelect.value = session.sensations.pain ?? "no";
    painZoneInput.value = session.sensations.painZone ?? "";
    savedPainExercise = session.sensations.painExercise ?? "";
    if (sensePainSelect.value === "si") {
      painDetailsDiv.style.display = "flex";
    }
  }

  populatePainExerciseSelect(currentExercises);
  painExerciseSelect.value = savedPainExercise;

  checkSensationsForm();
  updateStepStatus();
  updateSessionSummary();
  scheduleExercisePagination(true);
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
  if (!silent) setStatus(t("status.loadedPreviousSession"));
}

function loadSession(options = {}) {
  const silent = options.silent === true;
  const preserveAutoSave = options.preserveAutoSave === true;
  const key = sessionKey();
  const saved = JSON.parse(storage.getItem(key) || "null");
  if (!preserveAutoSave) {
    lastAutoSaveTime = null;
    updateAutoSaveLabel();
  }

  const week = weekSelect.value;
  const day = daySelect.value;
  const routine = getAllRoutines()[week]?.[day];
  
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
      const tpl = exerciseTemplates[ex.nombre] || {};
      const pickValue = (primary, fallback) => {
        if (primary === null || primary === undefined) return fallback;
        const str = String(primary).trim();
        if (str === "" || str.toLowerCase() === "n/a") return fallback;
        return primary;
      };
      // Usar los datos guardados, ya que los personalizados no están en exerciseTemplates
      exercisesContainer.appendChild(buildExerciseCard({
        nombre: ex.nombre,
        musculo: pickValue(ex.musculo, tpl.musculo ?? "N/A"),
        seccion: pickValue(ex.seccion, tpl.seccion ?? "N/A"),
        hacer: pickValue(ex.hacer, tpl.hacer ?? ""),
        noHacer: pickValue(ex.noHacer, tpl.noHacer ?? ""),
        trucos: pickValue(ex.trucos, tpl.trucos ?? ""),
        sets: ex.sets ?? []
      }));
    });
    
    currentExercises = saved.exercises.map(ex => ex.nombre); 
    
    // Cargar sensaciones guardadas
    if (saved.sensations) {
      senseGeneralInput.value = saved.sensations.general ?? "";
      senseTirednessInput.value = saved.sensations.tiredness ?? "";
      senseWeightInput.value = saved.sensations.weight ?? "";
      sensePainSelect.value = saved.sensations.pain ?? "no";
      painZoneInput.value = saved.sensations.painZone ?? "";
      savedPainExercise = saved.sensations.painExercise ?? ""; // Almacenamos el valor
      
      if (sensePainSelect.value === 'si') {
          painDetailsDiv.style.display = 'flex'; 
      }
    }
    if (!silent) setStatus(t("status.loadedMemory"));
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
    if (!silent) setStatus(t("status.loadedRoutine"));
  }

  // *Si no hay nada*
  else {
    if (!silent) setStatus(t("status.noRoutine"));
  }
  
  // 2. Llenar el selector de dolor (incluye "No identificado")
  populatePainExerciseSelect(currentExercises); 

  // 3. Establecer el valor guardado
  painExerciseSelect.value = savedPainExercise; 
  
  checkSensationsForm();
  updateStepStatus();
  updateSessionSummary();
  scheduleExercisePagination(true);
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
}


if (saveRoutineBtn) {
  saveRoutineBtn.onclick = () => {
    if (!currentUserKey) {
      notifyRoutineError(t("status.selectUserBeforeSaveRoutine"));
      return;
    }
    const routineName = prompt(t("prompt.routineName"));
    if (!routineName) return;
    const exercises = getCurrentRoutineExercises();
    const saved = saveCurrentRoutineAs(routineName, exercises);
    if (saved) showSaveRoutineMessage(t("status.routineAdded"));
  };
}


// -------------------------
// EXPORTACIÓN A PNG (FORMATO TABLA)
// -------------------------
exportBtn.onclick = () => {
  // Doble verificación de validación
  if (!checkSensationsForm(true)) {
    showSaveSessionError(t("status.postWorkoutExportError"));
    return;
  }

  saveSession();

  const key = sessionKey();
  const saved = JSON.parse(storage.getItem(key) || "null");
  if (!saved) return alert(t("alert.noDataToday"));

  const exportDiv = buildExportContent(saved, { variant: "png" });
  document.body.appendChild(exportDiv);

  // Exportar a PNG
  html2canvas(exportDiv, { scale: 2 }).then(canvas => {
    const link = document.createElement("a");
    link.download = `${t("file.sessionPrefix")}_${saved.date}_${saved.week}_${saved.day}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    exportDiv.remove();
  });
};

if (saveSessionBtn) {
  saveSessionBtn.onclick = () => {
    if (!checkSensationsForm(true)) {
      showSaveSessionError(t("status.postWorkoutSaveError"));
      return;
    }
    saveSession();
    const key = sessionKey();
    const saved = JSON.parse(storage.getItem(key) || "null");
    if (!saved) return alert(t("alert.noDataToday"));
    upsertLocalHistory(saved);
    updateStepStatus();
    setStatus(t("status.sessionSavedLocal"));
    showSaveSessionMessage();
  };
}


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
senseWeightInput.addEventListener("input", saveSession);
painZoneInput.addEventListener("input", saveSession);
painExerciseSelect.addEventListener("change", saveSession); // El change es necesario para capturar la selección
if (senseGeneralInput) senseGeneralInput.addEventListener("input", () => checkSensationsForm());
if (senseTirednessInput) senseTirednessInput.addEventListener("input", () => checkSensationsForm());
if (sensePainSelect) sensePainSelect.addEventListener("change", () => checkSensationsForm());
if (painZoneInput) painZoneInput.addEventListener("input", () => checkSensationsForm());
if (painExerciseSelect) painExerciseSelect.addEventListener("change", () => checkSensationsForm());


// -------------------------
// INICIALIZACIÓN
// -------------------------

// Listener para el botón de cargar/cambiar rutina (adicional al change)
loadBtn.addEventListener("click", loadSession);

if (deleteRoutineBtn) {
  deleteRoutineBtn.addEventListener("click", () => {
    if (!currentUserKey) {
      setStatus(t("status.selectUserBeforeRoutineDelete"));
      return;
    }
    const selected = getSelectedRoutineKeys();
    const routineName = selected.week || "";
    if (!routineName) {
      setStatus(t("status.selectRoutineToDelete"));
      return;
    }
    const custom = loadCustomRoutines();
    if (!custom[routineName]) {
      setStatus(t("status.onlyCustomRoutineDelete"));
      return;
    }
    if (!confirm(t("confirm.deleteRoutine", { name: routineName }))) return;
    delete custom[routineName];
    saveCustomRoutines(custom);
    populateRoutineSelectors();
    if (weekSelect) {
      weekSelect.value = "Semana 1";
      populateDaySelect(weekSelect.value);
    }
    syncRoutineSelectFromWeekDay();
    setStatus(t("status.routineDeleted"));
  });
}

function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

onReady(() => {
  setLanguage(currentLanguage);
  const languageSelect = document.getElementById("language-select");
  if (languageSelect) {
    languageSelect.addEventListener("change", (event) => {
      setLanguage(event.target.value);
    });
  }
  const savedMode = getSessionMode();
  setSessionMode(savedMode);
  if (step2ModeInputs && step2ModeInputs.length) {
    step2ModeInputs.forEach(input => {
      input.addEventListener("change", () => {
        setSessionMode(input.value);
      });
    });
  }
  if (loadPreviousSessionBtn) {
    loadPreviousSessionBtn.addEventListener("click", () => {
      const selectedKey = historyDaySelect?.value || "";
      if (!selectedKey) {
        setStatus(t("status.selectDay"));
        return;
      }
      const session = getHistorySessionByKey(selectedKey);
      if (!session) {
        setStatus(t("status.noHistoryDay"));
        return;
      }
      if (session.week && weekSelect) {
        ensureSelectValue(weekSelect, session.week);
        populateDaySelect(weekSelect.value);
      }
      if (session.day && daySelect) {
        if (weekSelect) populateDaySelect(weekSelect.value);
        ensureSelectValue(daySelect, session.day);
      }
      syncRoutineSelectFromWeekDay();
      applyHistorySession(session, { onlyFirstSet: true });
    });
  }
  const initialFontScale = getFontScale();
  setFontScale(initialFontScale);
  const decreaseTextBtn = document.getElementById("text-size-decrease");
  const increaseTextBtn = document.getElementById("text-size-increase");
  if (decreaseTextBtn) {
    decreaseTextBtn.addEventListener("click", () => {
      const currentScale = getFontScale();
      setFontScale(currentScale - FONT_SCALE_STEP);
    });
  }
  if (increaseTextBtn) {
    increaseTextBtn.addEventListener("click", () => {
      const currentScale = getFontScale();
      setFontScale(currentScale + FONT_SCALE_STEP);
    });
  }
  // Restablecer selectores y cargar
  populateRoutineSelectors();
  if (weekSelect) {
    weekSelect.addEventListener("change", () => {
      populateDaySelect(weekSelect.value);
      syncRoutineSelectFromWeekDay();
    });
  }
  if (daySelect) {
    daySelect.addEventListener("change", syncRoutineSelectFromWeekDay);
  }
  if (routineSelect) {
    routineSelect.addEventListener("change", () => {
      const selected = parseRoutineValue(routineSelect.value);
      if (weekSelect) {
        ensureSelectValue(weekSelect, selected.week);
        populateDaySelect(weekSelect.value);
      }
      if (daySelect) {
        ensureSelectValue(daySelect, selected.day);
      }
    });
  }

  initializeForUserSelection();
  initializeStepper();
  if (welcomeStartBtn) {
    const startIndex = stepPages.indexOf(step1);
    const sessionIndex = stepPages.indexOf(step2);
    welcomeStartBtn.addEventListener("click", () => {
      if (currentUserKey && sessionIndex >= 0) {
        setActiveStep(sessionIndex);
        return;
      }
      if (sessionIndex >= 0) {
        pendingStartStepIndex = sessionIndex;
      }
      if (startIndex >= 0) {
        setActiveStep(startIndex);
      }
    });
  }
  if (welcomeLegalBtn) {
    welcomeLegalBtn.addEventListener("click", () => {
      if (!welcomeLegalPanel) return;
      const isHidden = welcomeLegalPanel.style.display === "none";
      welcomeLegalPanel.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        welcomeLegalPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  if (welcomeInfoBtn) {
    welcomeInfoBtn.addEventListener("click", () => {
      if (!welcomeInfoPanel) return;
      const isHidden = welcomeInfoPanel.style.display === "none";
      welcomeInfoPanel.style.display = isHidden ? "block" : "none";
      if (isHidden) {
        welcomeInfoPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  if (homeLogoBtn) {
    homeLogoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setActiveStep(0);
    });
  }
  refreshUserSelect();
  if (exportBtn) exportBtn.disabled = true;
  if (saveSessionBtn) saveSessionBtn.disabled = true;
  checkSensationsForm();
  setFastMode(storage.getItem("gym_fast_mode") === "1");
  if (toggleFastModeBtn) {
    toggleFastModeBtn.addEventListener("click", () => {
      setFastMode(!isFastMode);
    });
  }
  updateHeaderOffsets();
  window.addEventListener("resize", updateHeaderOffsets);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  window.__gymAppReady = true;
});

window.addEventListener("load", () => {
  refreshUserSelect();
});


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
  stopwatchOverlay.style.display = "flex";
  stopwatchOverlay.setAttribute("aria-hidden", "false");
}

function closeStopwatchOverlay() {
  if (!stopwatchOverlay) return;
  stopwatchOverlay.style.display = "none";
  stopwatchOverlay.setAttribute("aria-hidden", "true");
}

function openQuickAddOverlay() {
  if (!quickAddOverlay) return;
  quickAddOverlay.style.display = "flex";
  quickAddOverlay.setAttribute("aria-hidden", "false");
}

function closeQuickAddOverlay() {
  if (!quickAddOverlay) return;
  quickAddOverlay.style.display = "none";
  quickAddOverlay.setAttribute("aria-hidden", "true");
}

function openOrderOverlay(items) {
  if (!orderOverlay) return;
  orderOverlay.style.display = "flex";
  orderOverlay.setAttribute("aria-hidden", "false");
  renderOrderList(items);
}

function closeOrderOverlay() {
  if (!orderOverlay) return;
  orderOverlay.style.display = "none";
  orderOverlay.setAttribute("aria-hidden", "true");
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
  customExerciseOverlay.style.display = "flex";
  customExerciseOverlay.setAttribute("aria-hidden", "false");
  if (customExerciseName) {
    customExerciseName.value = "";
    customExerciseName.focus();
  }
  if (customExerciseIsCardio) customExerciseIsCardio.checked = false;
}

function closeCustomExerciseOverlay() {
  if (!customExerciseOverlay) return;
  customExerciseOverlay.style.display = "none";
  customExerciseOverlay.setAttribute("aria-hidden", "true");
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
  quickExerciseSelect.innerHTML = `<option value="">${t("placeholder.selectExercise")}</option>`;
  if (!selectedGroup) {
    quickExerciseSelect.disabled = true;
    return;
  }
  const exercisesInGroup = Object.keys(exerciseTemplates).filter(name => {
    const tpl = exerciseTemplates[name];
    return resolveExerciseGroup(tpl) === selectedGroup;
  }).sort((a, b) => a.localeCompare(b, getLocale()));
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
    saveSession();
    loadSession(); // Necesario para refrescar el painExerciseSelect
    scheduleExercisePagination();
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
  newUserHistoryBtn.addEventListener("click", () => {
    const name = promptForNewUserName("");
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

function escapeCsvCell(value) {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function buildCsvForUser(sessions) {
  const header = [
    t("csv.usuario"),
    t("csv.fecha"),
    t("csv.semana"),
    t("csv.dia"),
    t("csv.ejercicio"),
    t("csv.musculo"),
    t("csv.seccion"),
    t("csv.serie"),
    t("csv.peso"),
    t("csv.reps"),
    t("csv.fallo"),
    t("csv.reps_fallo"),
    t("csv.intensidad"),
    t("csv.tiempo"),
    t("csv.notas"),
    t("csv.sens_general"),
    t("csv.sens_tiredness"),
    t("csv.sens_weight"),
    t("csv.sens_pain"),
    t("csv.sens_pain_zone"),
    t("csv.sens_pain_exercise")
  ];
  const rows = [header.map(escapeCsvCell).join(",")];

  sessions.forEach(session => {
    const sensations = session.sensations || {};
    const base = {
      usuario: session.user || "",
      fecha: session.date || "",
      semana: session.week || "",
      dia: session.day || "",
      sens_general: sensations.general ?? "",
      sens_tiredness: sensations.tiredness ?? "",
      sens_weight: sensations.weight ?? "",
      sens_pain: sensations.pain ?? "",
      sens_pain_zone: sensations.painZone ?? "",
      sens_pain_exercise: sensations.painExercise ?? ""
    };

    const exercises = Array.isArray(session.exercises) ? session.exercises : [];
    if (!exercises.length) {
      const row = [
        base.usuario,
        base.fecha,
        base.semana,
        base.dia,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        base.sens_general,
        base.sens_tiredness,
        base.sens_weight,
        base.sens_pain,
        base.sens_pain_zone,
        base.sens_pain_exercise
      ];
      rows.push(row.map(escapeCsvCell).join(","));
      return;
    }

    exercises.forEach(ex => {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      if (!sets.length) {
        const row = [
          base.usuario,
          base.fecha,
          base.semana,
          base.dia,
          ex.nombre || "",
          ex.musculo || "",
          ex.seccion || "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          base.sens_general,
          base.sens_tiredness,
          base.sens_weight,
          base.sens_pain,
          base.sens_pain_zone,
          base.sens_pain_exercise
        ];
        rows.push(row.map(escapeCsvCell).join(","));
        return;
      }
      sets.forEach(set => {
        const row = [
          base.usuario,
          base.fecha,
          base.semana,
          base.dia,
          ex.nombre || "",
          ex.musculo || "",
          ex.seccion || "",
          set.serie ?? "",
          set.peso ?? "",
          set.reps ?? "",
          set.fallo === true ? t("option.yes") : set.fallo === false ? t("option.no") : "",
          set.repsFallo ?? "",
          set.intensidad ?? "",
          set.tiempo ?? "",
          set.obs ?? "",
          base.sens_general,
          base.sens_tiredness,
          base.sens_weight,
          base.sens_pain,
          base.sens_pain_zone,
          base.sens_pain_exercise
        ];
        rows.push(row.map(escapeCsvCell).join(","));
      });
    });
  });

  return rows.join("\n");
}

if (exportUserHistoryCsvBtn) {
  exportUserHistoryCsvBtn.addEventListener("click", () => {
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
    const csv = buildCsvForUser(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = entry?.name ? normalizeUserName(entry.name) : selectedKey;
    a.download = `${t("file.historyPrefix")}_${safeName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setUserHistoryStatus(t("status.userExportedCsv"));
  });
}

if (importMergeHistoryBtn && importMergeHistoryInput) {
  importMergeHistoryBtn.addEventListener("click", () => {
    importMergeHistoryInput.value = "";
    importMergeHistoryInput.click();
  });
}

function openImportOverlay(userList) {
  if (!importOverlay || !importUserSelect) return;
  importUserSelect.innerHTML = "";
  userList.forEach(user => {
    const opt = document.createElement("option");
    opt.value = user.key;
    opt.textContent = user.name;
    importUserSelect.appendChild(opt);
  });
  importOverlay.style.display = "flex";
  importOverlay.setAttribute("aria-hidden", "false");
}

function closeImportOverlay() {
  if (!importOverlay) return;
  importOverlay.style.display = "none";
  importOverlay.setAttribute("aria-hidden", "true");
}

function openManageUserOverlay() {
  if (!manageUserOverlay) return;
  if (manageUserNameLabel) {
    manageUserNameLabel.textContent = currentUserName || t("status.selectUser");
  }
  manageUserOverlay.style.display = "flex";
  manageUserOverlay.setAttribute("aria-hidden", "false");
}

function closeManageUserOverlay() {
  if (!manageUserOverlay) return;
  manageUserOverlay.style.display = "none";
  manageUserOverlay.setAttribute("aria-hidden", "true");
}

function openHistoryMenuOverlay() {
  if (!historyMenuOverlay) return;
  historyMenuOverlay.style.display = "flex";
  historyMenuOverlay.setAttribute("aria-hidden", "false");
  refreshHistoryUI();
}

function closeHistoryMenuOverlay() {
  if (!historyMenuOverlay) return;
  historyMenuOverlay.style.display = "none";
  historyMenuOverlay.setAttribute("aria-hidden", "true");
}

if (importOverlayCancel) {
  importOverlayCancel.addEventListener("click", () => {
    closeImportOverlay();
  });
}

if (manageUserClose) {
  manageUserClose.addEventListener("click", closeManageUserOverlay);
}

if (manageUserOverlay) {
  manageUserOverlay.addEventListener("click", (e) => {
    if (e.target === manageUserOverlay) closeManageUserOverlay();
  });
}

if (manageUserHistoryBtn) {
  manageUserHistoryBtn.addEventListener("click", () => {
    openHistoryMenuOverlay();
  });
}

if (historyMenuClose) {
  historyMenuClose.addEventListener("click", closeHistoryMenuOverlay);
}

if (historyMenuOverlay) {
  historyMenuOverlay.addEventListener("click", (e) => {
    if (e.target === historyMenuOverlay) closeHistoryMenuOverlay();
  });
}

if (historyDateInput) {
  historyDateInput.addEventListener("change", () => {
    updateHistoryButtons();
  });
}

if (historyViewBtn) {
  historyViewBtn.addEventListener("click", () => {
    const session = getSelectedHistorySession();
    if (session) openHistoryViewOverlay(session);
  });
}

if (historyEditBtn) {
  historyEditBtn.addEventListener("click", () => {
    const session = getSelectedHistorySession();
    if (!session) return;
    if (!editingSessionContext) {
      editingSessionContext = {
        date: dateInput?.value || "",
        week: weekSelect?.value || "",
        day: daySelect?.value || ""
      };
    }
    if (editExercisesContainer) {
      exercisesContainer = editExercisesContainer;
      showAllExercises = true;
      editExercisesContainer.innerHTML = "";
    }
    if (dateInput) dateInput.value = session.date || "";
    if (weekSelect) {
      ensureSelectValue(weekSelect, session.week || "");
    }
    if (daySelect) {
      if (weekSelect) populateDaySelect(weekSelect.value);
      ensureSelectValue(daySelect, session.day || "");
    }
    loadSession();
    const step7Index = stepPages.indexOf(step7);
    if (step7Index >= 0) setActiveStep(step7Index);
    closeHistoryMenuOverlay();
    closeManageUserOverlay();
  });
}

if (historyViewClose) {
  historyViewClose.addEventListener("click", closeHistoryViewOverlay);
}

if (historyViewOverlay) {
  historyViewOverlay.addEventListener("click", (e) => {
    if (e.target === historyViewOverlay) closeHistoryViewOverlay();
  });
}

if (toggleUserManageBtn) {
  toggleUserManageBtn.addEventListener("click", () => {
    if (toggleUserManageBtn.disabled) return;
    openManageUserOverlay();
  });
}

if (importMergeHistoryInput) {
  importMergeHistoryInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        const firstUser = Array.isArray(data) && data.length ? (data[0]?.user || "") : "";
        const trimmedName = String(firstUser || "").trim();
        const normalizedKey = normalizeUserName(trimmedName);
        let userList = loadUserList();
        let entry = normalizedKey
          ? userList.find(u => u.key === normalizedKey || u.name.toLowerCase() === trimmedName.toLowerCase())
          : null;

        if (!entry) {
          if (!trimmedName) {
            alert(t("alert.noUserInImport"));
            return;
          }
          entry = { name: trimmedName, key: normalizedKey };
          userList.push(entry);
          saveUserList(userList);
          setLocalHistoryForUser(entry.key, []);
        }

        mergeImportedHistoryForUser(data, entry.name, entry.key);
        refreshUserSelect();
        if (userHistorySelect) userHistorySelect.value = entry.key;
        activateSelectedUser(entry.key);
        setUserHistoryStatus(t("status.importMerged"));
      } catch (err) {
        setUserHistoryStatus(t("status.importError", { error: err.message }));
      }
    };
    reader.readAsText(file);
  });
}
