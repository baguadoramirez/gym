/* ==========================================================
   Núcleo de Gym Tracker
   Requiere: ejercicios.js + app-storage.js + html2canvas + index.html
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
const manageUserChartsBtn = document.getElementById("manage-user-charts-btn");
const manageUserMuscleChartsBtn = document.getElementById("manage-user-muscle-charts-btn");
const manageUserFavoritesBtn = document.getElementById("manage-user-favorites-btn");
const manageUserNameLabel = document.getElementById("manage-user-name");
const globalUserStatsChartCanvas = document.getElementById("global-user-stats-chart");
const globalUserStatsNoData = document.getElementById("global-user-stats-no-data");
const globalUserStatsPieCanvas = document.getElementById("global-user-stats-pie");
const globalUserStatsPieNoData = document.getElementById("global-user-stats-pie-no-data");
const globalUserStatsPieLegend = document.getElementById("global-user-stats-pie-legend");
const historyMenuOverlay = document.getElementById("history-menu-overlay");
const historyMenuClose = document.getElementById("history-menu-close");
const step0 = document.getElementById("step-0");
const step1 = document.getElementById("step-1");
const stepDashboard = document.getElementById("step-dashboard");
const step2 = document.getElementById("step-2");
const step3 = document.getElementById("step-3");
const step4 = document.getElementById("step-4");
const step5 = document.getElementById("step-5");
const step6 = document.getElementById("step-6");
const step7 = document.getElementById("step-7");
const step8 = document.getElementById("step-8");
const step9 = document.getElementById("step-9");
const step3Body = document.getElementById("step-3-body");
const step7Body = document.getElementById("step-7-body");
const step1Status = document.getElementById("step-1-status");
const step2Status = document.getElementById("step-2-status");
const step3Status = document.getElementById("step-3-status");
const step4Status = document.getElementById("step-4-status");
const step5Status = document.getElementById("step-5-status");
const step6Status = document.getElementById("step-6-status");
const step8Status = document.getElementById("step-8-status");
const step9Status = document.getElementById("step-9-status");
const stepperPrevBtn = document.getElementById("stepper-prev");
const stepperNextBtn = document.getElementById("stepper-next");
const stepperFooter = document.getElementById("stepper-footer");
const stepperStepName = document.getElementById("stepper-step-name");
const stepperStepPosition = document.getElementById("stepper-step-position");
const appFooter = document.getElementById("app-footer");
const subheader = document.getElementById("subheader");
const toggleUserManageBtn = document.getElementById("toggle-user-manage");
const currentUserNameLabel = document.getElementById("current-user-name");
const toggleStopwatchBtn = document.getElementById("toggle-stopwatch");
const toggleQuickAddBtn = document.getElementById("toggle-quick-add");
const toggleOrderModeBtn = document.getElementById("toggle-order-mode");
const sessionHeaderDate = document.getElementById("session-header-date");
const sessionSaveStatus = document.getElementById("session-save-status");
const sessionStatusPill = document.querySelector(".session-status-pill");
const exerciseEmptyState = document.getElementById("exercise-empty-state");
const exerciseEmptyAddBtn = document.getElementById("exercise-empty-add-btn");
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
const historyDateList = document.getElementById("history-date-list");
const historyViewBtn = document.getElementById("history-view-btn");
const historyDeleteSessionBtn = document.getElementById("history-delete-session-btn");
const overwriteHistoryBtn = document.getElementById("overwrite-history-btn");
const unlockHistoryEditBtn = document.getElementById("unlock-history-edit-btn");
const historyEditorMode = document.getElementById("history-editor-mode");
const editSessionActions = document.getElementById("edit-session-actions");
const historyBodyWeightInput = document.getElementById("history-body-weight");
const editSessionStatus = document.getElementById("edit-session-status");
const promptOverlay = document.getElementById("prompt-overlay");
const promptTitle = document.getElementById("prompt-title");
const promptLabel = document.getElementById("prompt-label");
const promptInput = document.getElementById("prompt-input");
const promptCancel = document.getElementById("prompt-cancel");
const promptConfirm = document.getElementById("prompt-confirm");
const historyExercisePickerOverlay = document.getElementById("history-exercise-picker-overlay");
const historyExercisePickerClose = document.getElementById("history-exercise-picker-close");
const historyExercisePickerSearch = document.getElementById("history-exercise-picker-search");
const historyExercisePickerList = document.getElementById("history-exercise-picker-list");
const historyExerciseCustomToggle = document.getElementById("history-exercise-custom-toggle");
const historyExerciseCustomFields = document.getElementById("history-exercise-custom-fields");
const historyExerciseCustomName = document.getElementById("history-exercise-custom-name");
const historyExerciseCustomConfirm = document.getElementById("history-exercise-custom-confirm");
const favoritesOverlay = document.getElementById("favorites-overlay");
const favoritesList = document.getElementById("favorites-list");
const favoritesClose = document.getElementById("favorites-close");
const favoritesGroupSelect = document.getElementById("favorites-group-select");
const sessionSummary = document.getElementById("session-summary");
const removeExerciseBtn = document.getElementById("remove-exercise-btn");
const step2ModeInputs = document.querySelectorAll('input[name="step2-mode"]');
const step2ManualSection = document.getElementById("step2-manual");
const step2PreviousSection = document.getElementById("step2-previous");
const step2PredefinedSection = document.getElementById("step2-predefined");
const historyDaySelect = document.getElementById("history-day-select");
const loadPreviousSessionBtn = document.getElementById("load-previous-session-btn");

let lastRoutinePromptSignature = "";
const ROUTINE_VALUE_SEP = "|||";

const FONT_SCALE_KEY = "gym_font_scale";
const FONT_SCALE_MIN = 0.75;
const FONT_SCALE_MAX = 1.45;
const FONT_SCALE_STEP = 0.05;
const SESSION_MODE_KEY = "gym_session_mode";
const SESSION_MODE_DEFAULT = "manual";
const TEXT_STRINGS = {

    "app.title": "Registro de rutinas de gimnasio",
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
    "step8.summary": "Paso 8",
    "step8.hint": "Paso 8",
    "step9.summary": "Paso 9",
    "step9.hint": "Paso 9",
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
    "label.sensComment": "Comentario general de la sesión",
    "label.favoritesOnly": "Solo favoritos",
    "label.noMaterial": "Sin material",
    "label.painZone": "Zona del dolor",
    "label.painExercise": "Identifica si algún ejercicio puede haber sido el responsable",
    "placeholder.sensGeneral": "Ej: 8",
    "placeholder.sensTiredness": "Ej: 6",
    "placeholder.sensWeight": "Ej: 78.5",
    "placeholder.sensComment": "Ej: Muy buen entreno, buena energía.",
    "placeholder.painZone": "Ej: Hombro derecho",
    "placeholder.selectGroup": "Seleccionar grupo...",
    "placeholder.selectExercise": "Seleccionar ejercicio...",
    "favorites.title": "Ejercicios favoritos",
    "favorites.emptyOption": "Sin favoritos en este grupo",
    "quickAdd.allGroups": "Todos",
    "quickAdd.empty": "No hay ejercicios con estos filtros.",
    "quickAdd.emptyFavorites": "No hay favoritos con estos filtros.",
    "quickAdd.noMaterialBadge": "Sin material",
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
    "button.overwriteSession": "Sobrescribir sesión",
    "status.sessionOverwritten": "Sesión sobrescrita correctamente.",
    "footer.createdBy": "Web creada por",
    "footer.licensePrefix": "Código bajo",
    "footer.licenseLink": "Licencia Creative Commons Reconocimiento-CompartirIgual 4.0 Internacional",
    "import.title": "Selecciona el usuario para fusionar",
    "manage.title": "Gestión del usuario",
    "manage.history": "Sesiones anteriores",
    "manage.chartsExercise": "Gráficos por ejercicio",
    "manage.chartsMuscle": "Gráficos por grupo muscular",
    "manage.favorites": "Favoritos",
    "userStats.title": "Estadísticas por sesión",
    "userStats.noData": "Aún no hay datos para mostrar.",
    "chart.axis.sessions": "Sesiones",
    "chart.axis.sets": "Series",
    "chart.muscle.unknown": "Otros",
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
    "exercise.warmup": "Calentamiento",
    "charts.title": "Gráficos del usuario",
    "charts.byExercise": "Gráficos por ejercicio",
    "charts.byMuscleSession": "Gráficos por grupo muscular y sesión",
    "charts.byMuscleTotal": "Porcentaje total de series por grupo muscular",
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
    "chart.metric.label": "Métrica",
    "chart.metric.meanWeight": "Media de peso por día",
    "chart.metric.maxWeight": "Máximo de peso por día",
    "chart.metric.meanVolume": "Volumen medio por día",
    "chart.metric.totalVolume": "Volumen total por día",
    "exercise.counter.empty": "Ejercicio 0 de 0",
    "exercise.counter.all": "Ejercicios: {total}",
    "exercise.counter.current": "Ejercicio {current} de {total}",
    "exercise.empty": "Todavía no hay ejercicios en esta sesión.",
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
    "session.summary.effectiveExercises": "- Ejercicios efectivos: {count}",
    "session.summary.effectiveSets": "- Series efectivas: {count}",
    "session.summary.warmupSets": "- Series de calentamiento: {count}",
    "session.comment.label": "Comentario de la sesión:",
    "session.metrics.title": "Métricas subjetivas:",
    "session.metrics.general": "- Sensaciones generales (0-10): {value}",
    "session.metrics.tiredness": "- Cansancio percibido (0-10): {value}",
    "session.metrics.pain": "- Dolor en algún músculo: {value}",
    "session.footer": "Registrado con GymTracker by Borja Aguado",
    "session.failure.yes": "Sí",
    "session.failure.no": "No",
    "session.pain.zoneNA": "Zona N/A",
    "session.pain.exerciseNA": "Ejercicio: N/A",
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
    "exercise.history.none": "Primera vez con este ejercicio",
    "exercise.history.label": "Última referencia",
    "exercise.series.label": "Series",
    "exercise.suggestionNone": "Sin sugerencia disponible.",
    "exercise.suggestion.keep": "Mantén el peso y busca 12 reps 💪",
    "exercise.suggestion.down": "Ajuste suave: baja un poco para asegurar técnica ✅",
    "exercise.suggestion.up": "Buen trabajo: sube un paso y apunta a 10 reps 🔥",
    "exercise.table.cardio": "<th>Serie</th><th>Intensidad</th><th>Tiempo (min)</th><th class=\"set-action-col\"></th>",
    "exercise.table.strength": "<th>Serie</th><th>Peso</th><th>Reps</th><th>Fallo</th><th class=\"set-action-col\"></th>",
    "exercise.notes.general": "Notas",
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
    "exercise.firstSet": "Último set válido: {detail}",
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
    "csv.calentamiento": "calentamiento",
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
    "csv.sens_pain_exercise": "sens_pain_exercise",
    "csv.sens_comment": "sens_comment"
  
};

function getLocale() {
  return "es-ES";
}

function isWarmupExercise(exercise) {
  return exercise?.calentamiento === true || exercise?.calentamiento === "true";
}

function t(key, vars = {}) {
  let text = TEXT_STRINGS[key] || key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replaceAll(`{${name}}`, value);
  });
  return text;
}

window.gymI18n = { t, getLocale };


const appState = {
  currentUserName: "",
  currentUserKey: "",
  activeStepIndex: 0,
  isEditingHistory: false
};
window.gymState = appState;

const overlayFocusState = new WeakMap();

function getFocusableElements(root) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setVisible(element, isVisible, display = "block") {
  if (!element) return;
  element.classList.toggle("is-hidden", !isVisible);
  element.style.display = isVisible ? display : "none";
}

function isElementHidden(element) {
  if (!element) return true;
  return element.classList.contains("is-hidden") || getComputedStyle(element).display === "none";
}

function setRichMessage(element, title, message = "") {
  if (!element) return;
  element.replaceChildren();
  const strong = document.createElement("strong");
  strong.textContent = title;
  element.appendChild(strong);
  const body = String(message || "").trim();
  if (body) {
    element.appendChild(document.createTextNode(` ${body}`));
  }
}

function openOverlay(overlay, options = {}) {
  if (!overlay) return;
  const card = overlay.querySelector(".overlay-card") || overlay;
  overlayFocusState.set(overlay, document.activeElement);
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "-1");
  const focusTarget = options.initialFocus || getFocusableElements(card)[0] || card;
  window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
}

function closeOverlay(overlay) {
  if (!overlay) return;
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
  const previous = overlayFocusState.get(overlay);
  overlayFocusState.delete(overlay);
  if (previous && typeof previous.focus === "function" && document.contains(previous)) {
    previous.focus({ preventScroll: true });
  }
}

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  const openOverlays = Array.from(document.querySelectorAll('.overlay[aria-hidden="false"]'));
  const overlay = openOverlays[openOverlays.length - 1];
  if (!overlay) return;
  event.preventDefault();
  closeOverlay(overlay);
});

let currentUserName = appState.currentUserName;
let currentUserKey = appState.currentUserKey;
const stepPages = [step0, step1, stepDashboard, step2, step3, step4, step5, step6, step7, step8, step9].filter(Boolean);
let activeStepIndex = appState.activeStepIndex;
let pendingStartStepIndex = null;
let activeExerciseIndex = 0;
let exercisePaginationScheduled = false;
let showAllExercises = false;
let sessionSaveKind = "none";
let sessionIsDirty = false;
let historyEditUnlocked = false;
let historyExercisePickerTarget = null;
let editingSessionContext = null;
let isEditingHistory = appState.isEditingHistory;
let allowGlobalChartsStep = false;

function openPromptDialog(title, defaultValue = "") {
  if (!promptOverlay || !promptInput || !promptTitle || !promptLabel || !promptConfirm || !promptCancel) {
    return Promise.resolve("");
  }

  promptTitle.textContent = title;
  promptLabel.textContent = title;
  promptInput.value = defaultValue;
  promptInput.focus();
  openOverlay(promptOverlay, { initialFocus: promptInput });

  return new Promise(resolve => {
    const finish = value => {
      promptConfirm.onclick = null;
      promptCancel.onclick = null;
      promptInput.onkeydown = null;
      closeOverlay(promptOverlay);
      resolve(String(value || "").trim());
    };

    promptConfirm.onclick = () => finish(promptInput.value);
    promptCancel.onclick = () => finish("");
    promptInput.onkeydown = event => {
      if (event.key === "Enter") {
        event.preventDefault();
        finish(promptInput.value);
      } else if (event.key === "Escape") {
        event.preventDefault();
        finish("");
      }
    };
  });
}

async function promptForText(title, defaultValue = "") {
  try {
    if (typeof window.prompt === "function") {
      const input = window.prompt(title, defaultValue || "");
      if (input !== null) return input.trim();
      return "";
    }
  } catch (error) {
    // Fallback al diálogo interno cuando prompt() no está disponible.
  }

  return openPromptDialog(title, defaultValue);
}

async function promptForNewUserName(defaultValue = "") {
  return promptForText(t("prompt.newUserName"), defaultValue);
}

async function promptForRoutineName(defaultValue = "") {
  return promptForText(t("prompt.routineName"), defaultValue);
}

function setCurrentUser(name, key) {
  currentUserName = name;
  currentUserKey = key;
  appState.currentUserName = currentUserName;
  appState.currentUserKey = currentUserKey;
  storage.setItem("gym_user_name", currentUserName);
  updateCurrentUserBadge();
}

function updateCurrentUserBadge() {
  if (!currentUserNameLabel) return;
  currentUserNameLabel.textContent = currentUserName || t("status.selectUser");
}

function setSessionSaveState(state, label) {
  if (sessionSaveStatus) {
    sessionSaveStatus.textContent = label;
    sessionSaveStatus.dataset.state = state;
  }
  if (sessionStatusPill) {
    sessionStatusPill.dataset.state = state;
  }
}

function formatSessionHeaderDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(getLocale(), { day: "2-digit", month: "2-digit" });
}

function updateSessionHeaderDate() {
  if (!sessionHeaderDate) return;
  sessionHeaderDate.textContent = formatSessionHeaderDate(dateInput?.value || "");
}

function markSessionDirty() {
  if (!currentUserKey || isEditingHistory) return;
  if (!sessionIsDirty) {
    sessionIsDirty = true;
    updateAutoSaveLabel();
  }
}

function refreshCharts() {
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
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
  renderHistoryDateList();
  updateHistoryButtons();
}

function updateHistoryButtons() {
  if (!historyDateInput) return;
  const dateStr = historyDateInput.value;
  const hasSession = Boolean(
    dateStr && (window.uploadedHistory || []).some(session => session.date === dateStr)
  );
  if (historyViewBtn) historyViewBtn.disabled = !hasSession;
  if (historyDeleteSessionBtn) historyDeleteSessionBtn.disabled = !hasSession;
  if (overwriteHistoryBtn) overwriteHistoryBtn.disabled = !hasSession;
  updateHistoryDateListSelection();
}

function formatHistoryDateLabel(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr || "-";
  return date.toLocaleDateString(getLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function renderHistoryDateList() {
  if (!historyDateList) return;
  const sessions = (window.uploadedHistory || [])
    .filter(session => session?.date)
    .slice()
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  historyDateList.innerHTML = "";
  if (!sessions.length) {
    const empty = document.createElement("p");
    empty.className = "meta-text";
    empty.textContent = t("status.noHistorySessions");
    historyDateList.appendChild(empty);
    return;
  }

  const seenDates = new Set();
  sessions.forEach(session => {
    if (seenDates.has(session.date)) return;
    seenDates.add(session.date);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-date-item";
    button.dataset.date = session.date;

    const title = document.createElement("span");
    title.className = "history-date-item-title";
    title.textContent = formatHistoryDateLabel(session.date);

    const details = document.createElement("span");
    details.className = "history-date-item-details";
    const routine = session.week || session.day || "";
    const exerciseCount = Array.isArray(session.exercises) ? session.exercises.length : 0;
    details.textContent = routine
      ? `${translateRoutineLabel(routine)} · ${exerciseCount} ejercicios`
      : `${exerciseCount} ejercicios`;

    button.appendChild(title);
    button.appendChild(details);
    button.addEventListener("click", () => {
      historyDateInput.value = session.date;
      updateHistoryButtons();
    });
    historyDateList.appendChild(button);
  });

  updateHistoryDateListSelection();
}

function updateHistoryDateListSelection() {
  if (!historyDateList || !historyDateInput) return;
  const selectedDate = historyDateInput.value;
  historyDateList.querySelectorAll(".history-date-item").forEach(button => {
    const active = button.dataset.date === selectedDate;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function getSelectedHistorySession() {
  const dateStr = historyDateInput?.value || "";
  if (!dateStr) return null;
  const sessions = (window.uploadedHistory || []).filter(session => session.date === dateStr);
  if (!sessions.length) return null;
  const sorted = sessions.slice().sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  return sorted[0];
}

function openHistorySession(session) {
  if (!session || !editExercisesContainer) return false;
  const step7Index = stepPages.indexOf(step7);
  if (step7Index < 0) return false;

  if (historyDateInput) {
    historyDateInput.value = session.date || "";
    updateHistoryButtons();
  }

  editingSessionContext = {
    date: dateInput?.value || "",
    week: weekSelect?.value || "",
    day: daySelect?.value || "",
    restoreOnExit: true
  };
  isEditingHistory = true;
  appState.isEditingHistory = true;
  exercisesContainer = editExercisesContainer;
  editExercisesContainer.innerHTML = "";
  const sessionExercises = typeof getExercisesArrayFromSession === "function"
    ? getExercisesArrayFromSession(session)
    : (session.exercises || []);
  applyHistorySession(
    { ...session, exercises: sessionExercises },
    { includeSensations: true, preserveAutoSave: true }
  );
  if (historyBodyWeightInput) {
    historyBodyWeightInput.value = session?.sensations?.weight ?? "";
  }
  setHistoryEditorMode(false);
  if (historyMenuOverlay?.getAttribute("aria-hidden") === "false") {
    closeOverlay(historyMenuOverlay);
  }
  setActiveStep(step7Index, { force: true, ignoreMax: true });
  return true;
}

window.openGymHistorySession = ({ date, key } = {}) => {
  const sessions = window.uploadedHistory || [];
  const selected = sessions.find(session => {
    const sessionKeyValue = session.key || buildSessionKey(session);
    if (key && sessionKeyValue === key) return true;
    return date && session.date === date;
  });
  return openHistorySession(selected || null);
};

function setHistoryEditorMode(unlocked) {
  historyEditUnlocked = unlocked === true;
  if (!editExercisesContainer) return;

  if (!historyEditUnlocked) {
    if (historyExercisePickerOverlay?.getAttribute("aria-hidden") === "false") {
      historyExercisePickerTarget = null;
      closeOverlay(historyExercisePickerOverlay);
    }
    editExercisesContainer.querySelectorAll(".exercise-card").forEach(card => {
      const nameInput = card.querySelector(".history-exercise-name-input");
      const title = card.querySelector(".exercise-title");
      if (nameInput && title && nameInput.value.trim()) {
        title.textContent = nameInput.value.trim();
      }
    });
  }
  editExercisesContainer.classList.toggle("history-readonly", !historyEditUnlocked);
  editExercisesContainer.classList.toggle("history-editing", historyEditUnlocked);
  editExercisesContainer.querySelectorAll(".history-name-trigger").forEach(title => {
    title.setAttribute("aria-disabled", historyEditUnlocked ? "false" : "true");
    title.tabIndex = historyEditUnlocked ? 0 : -1;
  });
  editExercisesContainer.querySelectorAll(".exercise-table td input").forEach(input => {
    let valueDisplay = input.parentElement.querySelector(".readonly-set-value");
    if (!valueDisplay) {
      valueDisplay = document.createElement("span");
      valueDisplay.className = "readonly-set-value";
      input.parentElement.appendChild(valueDisplay);
    }
    valueDisplay.textContent = input.type === "checkbox"
      ? (input.checked ? "Sí" : "—")
      : (input.value || "—");
    valueDisplay.hidden = historyEditUnlocked;
    input.hidden = !historyEditUnlocked;
  });
  editExercisesContainer.querySelectorAll("input, textarea, select, button").forEach(control => {
    control.disabled = !historyEditUnlocked;
  });
  if (historyBodyWeightInput) {
    historyBodyWeightInput.disabled = !historyEditUnlocked;
  }
  if (historyEditorMode) {
    historyEditorMode.textContent = historyEditUnlocked ? "Modo edición" : "Modo lectura";
  }
  if (unlockHistoryEditBtn) {
    unlockHistoryEditBtn.textContent = historyEditUnlocked ? "🔓 Salir de edición" : "🔒 Editar sesión";
    unlockHistoryEditBtn.setAttribute("aria-pressed", historyEditUnlocked ? "true" : "false");
    setVisible(unlockHistoryEditBtn, true, "inline-flex");
  }
  if (editSessionActions) {
    setVisible(editSessionActions, historyEditUnlocked, "flex");
  }
  setVisible(editSessionStatus, false);
}

function applyHistoryExerciseName(name, template = null) {
  const card = historyExercisePickerTarget;
  const nextName = String(name || "").trim();
  if (!card || !nextName) return;
  const title = card.querySelector(".exercise-title");
  const nameInput = card.querySelector(".history-exercise-name-input");
  if (title) {
    title.textContent = nextName;
    title.setAttribute("aria-label", `Cambiar ejercicio: ${nextName}`);
  }
  if (nameInput) nameInput.value = nextName;

  if (template) {
    const muscle = template.musculo || template.grupo || "N/A";
    const section = template.seccion || "N/A";
    const meta = card.querySelector(".exercise-muscle-section");
    if (meta) {
      meta.dataset.musculo = muscle;
      meta.dataset.seccion = section;
      meta.textContent = `${translateGroupLabel(muscle)} - ${section}`;
    }
    card.dataset.hacer = template.hacer || "";
    card.dataset.noHacer = template.noHacer || "";
    card.dataset.trucos = template.trucos || "";
  }

  historyExercisePickerTarget = null;
  closeOverlay(historyExercisePickerOverlay);
}

function renderHistoryExercisePicker(filter = "") {
  if (!historyExercisePickerList) return;
  const query = String(filter || "").trim().toLocaleLowerCase(getLocale());
  const targetType = historyExercisePickerTarget?.dataset.exerciseType || "strength";
  const names = Object.keys(exerciseTemplates || {})
    .filter(name => {
      const template = exerciseTemplates[name] || {};
      const templateType = String(template.musculo || template.grupo || "").toLowerCase() === "cardio"
        ? "cardio"
        : "strength";
      return templateType === targetType;
    })
    .filter(name => !query || name.toLocaleLowerCase(getLocale()).includes(query))
    .sort((a, b) => a.localeCompare(b, getLocale()));
  historyExercisePickerList.replaceChildren();

  names.forEach(name => {
    const template = exerciseTemplates[name] || {};
    const button = document.createElement("button");
    button.type = "button";
    button.className = "history-exercise-picker-item";
    button.setAttribute("role", "option");

    const label = document.createElement("strong");
    label.textContent = name;
    const meta = document.createElement("span");
    const muscle = template.musculo || template.grupo || "N/A";
    meta.textContent = translateGroupLabel(muscle);
    button.append(label, meta);
    button.addEventListener("click", () => applyHistoryExerciseName(name, template));
    historyExercisePickerList.appendChild(button);
  });

  if (!names.length) {
    const empty = document.createElement("div");
    empty.className = "hint-text history-exercise-picker-empty";
    empty.textContent = "No hay ejercicios que coincidan.";
    historyExercisePickerList.appendChild(empty);
  }
}

function openHistoryExercisePicker(card) {
  if (!historyEditUnlocked || !historyExercisePickerOverlay) return;
  historyExercisePickerTarget = card;
  if (historyExercisePickerSearch) historyExercisePickerSearch.value = "";
  if (historyExerciseCustomName) historyExerciseCustomName.value = "";
  setVisible(historyExerciseCustomFields, false);
  renderHistoryExercisePicker();
  openOverlay(historyExercisePickerOverlay, {
    initialFocus: historyExercisePickerSearch || historyExercisePickerClose
  });
}

if (historyExercisePickerSearch) {
  historyExercisePickerSearch.addEventListener("input", () => {
    renderHistoryExercisePicker(historyExercisePickerSearch.value);
  });
}
if (historyExercisePickerClose) {
  historyExercisePickerClose.addEventListener("click", () => {
    historyExercisePickerTarget = null;
    closeOverlay(historyExercisePickerOverlay);
  });
}
if (historyExerciseCustomToggle) {
  historyExerciseCustomToggle.addEventListener("click", () => {
    const opening = historyExerciseCustomFields?.classList.contains("is-hidden");
    setVisible(historyExerciseCustomFields, opening, "grid");
    if (opening) historyExerciseCustomName?.focus();
  });
}
if (historyExerciseCustomConfirm) {
  historyExerciseCustomConfirm.addEventListener("click", () => {
    applyHistoryExerciseName(historyExerciseCustomName?.value);
  });
}
if (historyExerciseCustomName) {
  historyExerciseCustomName.addEventListener("keydown", event => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyHistoryExerciseName(historyExerciseCustomName.value);
  });
}

function deleteSelectedHistorySession() {
  const selected = getSelectedHistorySession();
  if (!selected) return false;
  const label = formatHistoryDateLabel(selected.date);
  if (!confirm(`¿Eliminar completamente la sesión del ${label}?`)) return false;

  const selectedKey = selected.key || buildSessionKey(selected);
  const sessions = getLocalHistory().filter(session => {
    const sessionKeyValue = session.key || buildSessionKey(session);
    return selectedKey ? sessionKeyValue !== selectedKey : session.date !== selected.date;
  });
  if (selectedKey) storage.removeItem(selectedKey);
  setLocalHistory(sessions);
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshHistoryUI();
  if (historyDateInput) historyDateInput.value = "";
  updateHistoryButtons();
  populateHistoryDaySelect();
  refreshCharts();
  return true;
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
    appState.currentUserKey = currentUserKey;
    appState.currentUserName = currentUserName;
    storage.removeItem("gym_user_name");
    setAppEnabled(false);
    setAppVisible(false);
    updateCurrentUserBadge();
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
  setVisible(appContent, isVisible);
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
  sessionSaveKind = "none";
  sessionIsDirty = false;
  refreshUserSelect();
  setAppEnabled(false);
  setAppVisible(false);
  updateCurrentUserBadge();
  updateAutoSaveLabel();
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
  sessionSaveKind = "none";
  sessionIsDirty = false;
  loadLocalHistory();
  hydrateHistoryFromSessionKeys();
  setAppEnabled(true);
  setAppVisible(true);
  populateRoutineSelectors();
  checkSensationsForm();
  updateAutoSaveLabel();
  setUserHistoryStatus(t("status.userActive", { name: selected.name }));
  updateStepStatus();
  scheduleExercisePagination(true);
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
  if (typeof window.renderDashboard === "function") {
    window.renderDashboard();
  }
  if (pendingStartStepIndex != null) {
    const targetIndex = pendingStartStepIndex;
    pendingStartStepIndex = null;
    setActiveStep(targetIndex);
  } else if (activeStepIndex === stepPages.indexOf(step1)) {
    const dashboardIndex = stepPages.indexOf(stepDashboard);
    if (dashboardIndex >= 0) setActiveStep(dashboardIndex);
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
  if (step8Status) step8Status.textContent = hasUser ? t("status.optional") : t("status.pending");
  if (step9Status) step9Status.textContent = hasUser ? t("status.optional") : t("status.pending");
  if (toggleUserManageBtn) toggleUserManageBtn.disabled = !hasUser;
  if (postWorkoutSection) {
    postWorkoutSection.classList.toggle("post-workout-locked", !hasExercises);
  }
  updateStepNavigation();
}

function updateSessionProgressIndicator() {
  const root = exercisesContainer || mainExercisesContainer;
  const cards = root ? Array.from(root.querySelectorAll(".exercise-card")) : [];
  const exerciseCount = cards.length;
  const seriesCount = cards.reduce((total, card) => {
    return total + card.querySelectorAll(".exercise-series-block > .exercise-table > tbody > tr").length;
  }, 0);
  const currentText = exerciseCount === 0
    ? "Ejercicio 0 de 0"
    : `Ejercicio ${Math.min(activeExerciseIndex + 1, exerciseCount)} de ${exerciseCount}`;
  const seriesText = seriesCount === 1 ? "1 serie" : `${seriesCount} series`;
  if (exerciseCounter) {
    exerciseCounter.textContent = `${currentText} · ${seriesText}`;
  }
}

document.addEventListener("input", event => {
  if (!currentUserKey || isEditingHistory) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest("#exercises-container, #edit-exercises-container, #step-2, #step-3, #post-workout-section")) {
    markSessionDirty();
  }
}, true);

document.addEventListener("change", event => {
  if (!currentUserKey || isEditingHistory) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest("#exercises-container, #edit-exercises-container, #step-2, #step-3, #post-workout-section")) {
    markSessionDirty();
  }
}, true);

function updateExercisePagination(resetIndex = false) {
  if (!exercisesContainer) return;
  let cards = Array.from(exercisesContainer.querySelectorAll(".exercise-card"));
  if (!cards.length) {
    cards = Array.from(exercisesContainer.children).filter(node => node.nodeType === 1);
    cards.forEach(card => card.classList.add("exercise-card"));
  }
  const total = cards.length;
  if (resetIndex) {
    activeExerciseIndex = 0;
  }
  if (total === 0) {
    updateSessionProgressIndicator();
    if (exercisePrevBtn) exercisePrevBtn.disabled = true;
    if (exerciseNextBtn) exerciseNextBtn.disabled = true;
    setVisible(saveRoutineControls, false);
    if (exerciseEmptyState) exerciseEmptyState.style.display = "block";
    if (removeExerciseBtn) removeExerciseBtn.disabled = true;
    return;
  }
  if (exerciseEmptyState) exerciseEmptyState.style.display = "none";
  updateSessionProgressIndicator();

  if (showAllExercises) {
    cards.forEach(card => {
      card.style.display = "block";
    });
    if (removeExerciseBtn) removeExerciseBtn.disabled = false;
    if (exercisePrevBtn) exercisePrevBtn.disabled = true;
    if (exerciseNextBtn) exerciseNextBtn.disabled = true;
    setVisible(saveRoutineControls, false);
    return;
  }

  activeExerciseIndex = Math.max(0, Math.min(activeExerciseIndex, total - 1));
  cards.forEach((card, idx) => {
    card.style.display = idx === activeExerciseIndex ? "block" : "none";
  });
  const activeCard = cards[activeExerciseIndex];
  if (removeExerciseBtn) removeExerciseBtn.disabled = !activeCard;
  if (exercisePrevBtn) exercisePrevBtn.disabled = activeExerciseIndex === 0;
  if (exerciseNextBtn) exerciseNextBtn.disabled = activeExerciseIndex >= total - 1;
  if (saveRoutineControls) {
    setVisible(saveRoutineControls, activeExerciseIndex === total - 1, "flex");
  }
}

if (exerciseEmptyAddBtn) {
  exerciseEmptyAddBtn.addEventListener("click", () => {
    if (typeof openQuickAddOverlay === "function") {
      openQuickAddOverlay();
    } else {
      toggleQuickAddBtn?.click();
    }
  });
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
  return appContent && !isElementHidden(appContent);
}

function getMaxStepIndex() {
  if (isAppVisible()) {
    let maxIndex = stepPages.length - 1;
    const step5Index = stepPages.indexOf(step5);
    const step4Index = stepPages.indexOf(step4);
    const step6Index = stepPages.indexOf(step6);
    const step7Index = stepPages.indexOf(step7);
    const step8Index = stepPages.indexOf(step8);
    const step9Index = stepPages.indexOf(step9);
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
    if (editingSessionContext && step7Index >= 0) {
      maxIndex = Math.max(maxIndex, step7Index);
    }
    if (!editingSessionContext && step7Index >= 0 && step6Index >= 0) {
      maxIndex = Math.min(maxIndex, step6Index);
    }
    if (allowGlobalChartsStep && step8Index >= 0) {
      maxIndex = Math.max(maxIndex, step8Index);
    }
    if (allowGlobalChartsStep && step9Index >= 0) {
      maxIndex = Math.max(maxIndex, step9Index);
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
    appState.activeStepIndex = activeStepIndex;
  }
  const activeStep = stepPages[activeStepIndex];
  const stepNames = new Map([
    [step0, "Inicio"],
    [step1, "Usuario"],
    [stepDashboard, "Resumen"],
    [step2, "Preparar sesión"],
    [step3, "Ejercicios"],
    [step4, "Cuestionario"],
    [step5, "Resumen"],
    [step6, "Gráficos"],
    [step7, "Sesión anterior"],
    [step8, "Gráficos por ejercicio"],
    [step9, "Gráficos musculares"]
  ]);

  if (stepperFooter) {
    stepperFooter.style.display = activeStepIndex === 0 ? "none" : "grid";
  }
  if (appFooter) {
    appFooter.hidden = activeStepIndex !== 0;
  }
  if (stepperStepName) {
    stepperStepName.textContent = stepNames.get(activeStep) || "Sesión";
  }
  if (stepperStepPosition) {
    stepperStepPosition.textContent = `Paso ${activeStepIndex} de ${Math.max(1, stepPages.length - 1)}`;
  }

  if (subheader) {
    const dashboardIndex = stepPages.indexOf(stepDashboard);
    const step2Index = stepPages.indexOf(step2);
    const step3Index = stepPages.indexOf(step3);
    const showFromStep2 = dashboardIndex >= 0
      ? activeStepIndex >= dashboardIndex
      : step2Index >= 0 && activeStepIndex >= step2Index;
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
    if (!isStep3) {
      if (typeof closeStopwatchOverlay === "function") closeStopwatchOverlay();
      if (typeof closeQuickAddOverlay === "function") closeQuickAddOverlay();
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
  if (!currentUserKey) {
    setSessionSaveState("no-user", "Sin usuario");
    return;
  }
  if (sessionIsDirty) {
    setSessionSaveState("pending", "Pendiente");
    return;
  }
  if (sessionSaveKind === "manual") {
    setSessionSaveState("saved", "Guardado");
    return;
  }
  if (sessionSaveKind === "auto") {
    setSessionSaveState("warning", "Autoguardado");
    return;
  }
  setSessionSaveState("active", "En sesión");
}

function markAutoSaved(kind = "auto") {
  sessionSaveKind = kind;
  sessionIsDirty = false;
  updateAutoSaveLabel();
}

function setActiveStep(index, options = {}) {
  if (!stepPages.length) return;
  const maxBound = stepPages.length - 1;
  const maxIndex = options.ignoreMax ? maxBound : getMaxStepIndex();
  let nextIndex = options.force
    ? Math.max(0, Math.min(index, maxBound))
    : Math.max(0, Math.min(index, maxIndex));
  const prevIndex = activeStepIndex;

  const step7Index = stepPages.indexOf(step7);
  const step6Index = stepPages.indexOf(step6);
  const step8Index = stepPages.indexOf(step8);
  const step9Index = stepPages.indexOf(step9);
  const step3Index = stepPages.indexOf(step3);
  const step4Index = stepPages.indexOf(step4);
  if (!editingSessionContext && step7Index >= 0 && nextIndex === step7Index) {
    if (allowGlobalChartsStep && step8Index >= 0) {
      nextIndex = step8Index;
    } else if (step6Index >= 0) {
      nextIndex = step6Index;
    }
  }
  const enteringStep7 = step7Index >= 0 && nextIndex === step7Index;
  const leavingStep7 = step7Index >= 0 && activeStepIndex === step7Index && nextIndex !== step7Index;
  const enteringStep4FromStep3 = step4Index >= 0 && step3Index >= 0 && prevIndex === step3Index && nextIndex === step4Index;
  if (step8Index >= 0 || step9Index >= 0) {
    allowGlobalChartsStep = nextIndex === step8Index || nextIndex === step9Index;
  }
  if (enteringStep7 && editExercisesContainer) {
    exercisesContainer = editExercisesContainer;
    showAllExercises = true;
  }
  if (leavingStep7) {
    exercisesContainer = mainExercisesContainer;
    showAllExercises = false;
    if (editExercisesContainer) editExercisesContainer.innerHTML = "";
    if (editingSessionContext?.restoreOnExit) {
      if (dateInput) dateInput.value = editingSessionContext.date || "";
      updateSessionHeaderDate();
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
    }
    editingSessionContext = null;
    isEditingHistory = false;
    appState.isEditingHistory = isEditingHistory;
    historyEditUnlocked = false;
  }

  activeStepIndex = nextIndex;
  appState.activeStepIndex = activeStepIndex;
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
  if (step8Index >= 0 && nextIndex === step8Index) {
    if (typeof window.loadChartExercises === "function") {
      window.loadChartExercises();
    }
    renderUserStatsCharts();
  }
  if (step9Index >= 0 && nextIndex === step9Index) {
    renderUserStatsCharts();
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
    stepperPrevBtn.addEventListener("click", () => {
      const step7Index = stepPages.indexOf(step7);
      const step8Index = stepPages.indexOf(step8);
      const step9Index = stepPages.indexOf(step9);
      const step6Index = stepPages.indexOf(step6);
      const step5Index = stepPages.indexOf(step5);
      const step2Index = stepPages.indexOf(step2);
      if (step2Index >= 0) {
        if (activeStepIndex === step7Index || activeStepIndex === step8Index || activeStepIndex === step9Index) {
          setActiveStep(step2Index, { force: true, ignoreMax: true });
          return;
        }
        if (activeStepIndex === step7Index && isEditingHistory) {
          setActiveStep(step2Index, { force: true, ignoreMax: true });
          return;
        }
      }
      if (step6Index >= 0 && step5Index >= 0 && activeStepIndex === step6Index) {
        setActiveStep(step5Index, { force: true });
        return;
      }
      if (!editingSessionContext) {
        if (step8Index >= 0 && step6Index >= 0 && activeStepIndex === step8Index) {
          setActiveStep(step6Index);
          return;
        }
        if (step9Index >= 0 && step8Index >= 0 && activeStepIndex === step9Index) {
          setActiveStep(step8Index);
          return;
        }
      }
      setActiveStep(activeStepIndex - 1, { force: true, ignoreMax: true });
    });
  }
  if (stepperNextBtn) {
    stepperNextBtn.addEventListener("click", () => setActiveStep(activeStepIndex + 1));
  }
  if (dateInput) {
    dateInput.addEventListener("change", updateSessionHeaderDate);
    dateInput.addEventListener("input", updateSessionHeaderDate);
  }

  setActiveStep(activeStepIndex, { skipScroll: true });
}

// CAMPOS DE SENSACIONES
const senseGeneralInput = document.getElementById("sense-general");
const senseTirednessInput = document.getElementById("sense-tiredness");
const senseWeightInput = document.getElementById("sense-weight");
const sensePainSelect = document.getElementById("sense-pain");
const senseCommentInput = document.getElementById("sense-comment");
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
updateSessionHeaderDate();

// Histórico
// -------------------------
// FUNCIONES BASE
// -------------------------

function sessionKey() {
  const userPart = currentUserKey ? `${currentUserKey}_` : "";
  return `gym_${userPart}${dateInput.value}_${weekSelect.value}_${daySelect.value}`;
}

function getSessionMode() {
  const savedMode = storage.getItem(SESSION_MODE_KEY);
  return ["manual", "previous", "predefined"].includes(savedMode) ? savedMode : SESSION_MODE_DEFAULT;
}

function setSessionMode(mode) {
  const normalizedMode = ["manual", "previous", "predefined"].includes(mode) ? mode : SESSION_MODE_DEFAULT;
  storage.setItem(SESSION_MODE_KEY, normalizedMode);
  if (step2ModeInputs) {
    step2ModeInputs.forEach(input => {
      input.checked = input.value === normalizedMode;
    });
  }
  setVisible(step2ManualSection, normalizedMode === "manual");
  setVisible(step2PreviousSection, normalizedMode === "previous");
  setVisible(step2PredefinedSection, normalizedMode === "predefined");
}

function getFontScale() {
  const stored = Number(storage.getItem(FONT_SCALE_KEY));
  if (!Number.isFinite(stored)) return 1;
  return Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, stored));
}

function setFontScale(scale) {
  const normalized = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Number(scale) || 1));
  storage.setItem(FONT_SCALE_KEY, normalized.toFixed(2));
  document.documentElement.style.fontSize = `${normalized}rem`;
  return normalized;
}

function setStatus(msg) {
  statusText.textContent = msg;
  setTimeout(() => {
    if (statusText.textContent === msg) statusText.textContent = "";
  }, 1500);
}

function showSaveSessionMessage() {
  if (!saveSessionMessage) return;
  const messages = Array.from({ length: 18 }, (_, index) => t(`message.saveSessionRandom.${index}`));
  const message = messages[Math.floor(Math.random() * messages.length)];
  setRichMessage(saveSessionMessage, t("message.sessionSavedTitle"), message);
  setVisible(saveSessionMessage, true);
  clearSaveSessionError();
}

function showSaveSessionError(message) {
  if (!saveSessionError) return;
  setRichMessage(saveSessionError, t("message.errorTitle"), message);
  setVisible(saveSessionError, true);
}

function clearSaveSessionError() {
  if (!saveSessionError) return;
  saveSessionError.textContent = "";
  setVisible(saveSessionError, false);
}

function showSaveRoutineMessage(message) {
  if (!saveRoutineMessage) return;
  setRichMessage(saveRoutineMessage, t("message.routineSavedTitle"), message);
  setVisible(saveRoutineMessage, true);
  if (saveRoutineError) {
    saveRoutineError.textContent = "";
    setVisible(saveRoutineError, false);
  }
}

function showSaveRoutineError(message) {
  if (!saveRoutineError) return;
  setRichMessage(saveRoutineError, t("message.errorTitle"), message);
  setVisible(saveRoutineError, true);
  if (saveRoutineMessage) {
    saveRoutineMessage.textContent = "";
    setVisible(saveRoutineMessage, false);
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

    updateStepNavigation();
    return isValid;
}


// -------------------------
// CREAR FILAS DE SERIES
// -------------------------

const strengthSetFields = [
  { key: "serie", type: "static" },
  { key: "peso", type: "number", step: "0.5" },
  { key: "reps", type: "number", step: "1" },
  { key: "fallo", type: "checkbox" }
];

const cardioSetFields = [
  { key: "serie", type: "static" },
  { key: "intensidad", type: "number", step: "0.5", placeholderKey: "cardio.placeholderIntensity" },
  { key: "tiempo", type: "number", step: "0.25", placeholderKey: "cardio.placeholderTime" }
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
  const isSuggested = !!setData._suggested;
  const shouldCopyFromPrev = Object.keys(setData).length === 0;
  let resolvedSetData = setData;

  if (setData.repsFallo != null && setData.repsFallo !== "") {
    tr.dataset.repsFallo = String(setData.repsFallo);
  }

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
    if (f.step && f.type === "number") input.step = f.step;
    if (isSuggested) {
      input.title = t("exercise.suggestionApplied", {
        weight: resolvedSetData.peso ?? "-",
        reps: resolvedSetData.reps ?? "-"
      });
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
    markSessionDirty();
    saveSession();
    if (onInputChange) onInputChange();
  });
  actionTd.appendChild(removeBtn);
  tr.appendChild(actionTd);

  tbody.appendChild(tr);
  return tr;
}


// -------------------------
// CREAR UNA TARJETA DE EJERCICIO
// -------------------------

function buildExerciseCard(exData) {
  const card = document.createElement("div");
  card.className = "exercise-card";
  const isCardio = String(exData.musculo || exData.grupo || "").toLowerCase() === "cardio";
  const isWarmup = isWarmupExercise(exData);
  card.dataset.exerciseType = isCardio ? "cardio" : "strength";
  card.dataset.calentamiento = isWarmup ? "true" : "false";
  card.dataset.hacer = exData.hacer || "";
  card.dataset.noHacer = exData.noHacer || "";
  card.dataset.trucos = exData.trucos || "";

  // ====== CABECERA ======
  const header = document.createElement("div");
  header.className = "exercise-header";

  const left = document.createElement("div");
  left.className = "exercise-header-main";

  // Nota: Si el ejercicio es personalizado, exData.hacer/noHacer/trucos serán vacíos
  const musculoDisplay = exData.musculo || "N/A";
  const seccionDisplay = exData.seccion || "N/A";
  const hacerDisplay = exData.hacer || t("exercise.custom.noDescription");
  const noHacerDisplay = exData.noHacer || "N/A";
  const trucosDisplay = exData.trucos || "N/A";


  const titleEl = document.createElement("div");
  titleEl.className = "exercise-title";
  titleEl.textContent = exData.nombre;

  const titleRow = document.createElement("div");
  titleRow.className = "exercise-title-row";
  titleRow.appendChild(titleEl);
  if (isEditingHistory) {
    titleEl.classList.add("history-name-trigger");
    titleEl.setAttribute("role", "button");
    titleEl.setAttribute("aria-label", `Cambiar ejercicio: ${exData.nombre}`);
    titleEl.setAttribute("aria-disabled", historyEditUnlocked ? "false" : "true");
    titleEl.tabIndex = historyEditUnlocked ? 0 : -1;
    titleEl.addEventListener("click", () => openHistoryExercisePicker(card));
    titleEl.addEventListener("keydown", event => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openHistoryExercisePicker(card);
    });
    const nameInput = document.createElement("input");
    nameInput.type = "hidden";
    nameInput.className = "history-exercise-name-input";
    nameInput.value = exData.nombre;
    titleRow.appendChild(nameInput);
  }
  if (isWarmup) {
    const warmupBadge = document.createElement("span");
    warmupBadge.className = "exercise-warmup-badge";
    warmupBadge.textContent = t("exercise.warmup");
    titleRow.appendChild(warmupBadge);
  }

  const metaEl = document.createElement("div");
  metaEl.className = "exercise-meta exercise-muscle-section";
  metaEl.dataset.musculo = musculoDisplay;
  metaEl.dataset.seccion = seccionDisplay;
  metaEl.textContent = `${translateGroupLabel(musculoDisplay)} - ${seccionDisplay}`;

  left.appendChild(titleRow);
  left.appendChild(metaEl);


  const headerActions = document.createElement("div");
  headerActions.className = "exercise-header-actions";
  if (isEditingHistory) {
    const deleteExerciseBtn = document.createElement("button");
    deleteExerciseBtn.type = "button";
    deleteExerciseBtn.className = "btn-danger history-delete-exercise";
    deleteExerciseBtn.textContent = "Eliminar ejercicio";
    deleteExerciseBtn.addEventListener("click", () => {
      if (!historyEditUnlocked) return;
      const currentName = card.querySelector(".history-exercise-name-input")?.value.trim() || exData.nombre;
      const warning = `¿Eliminar “${currentName}” de esta sesión?\n\nSe eliminarán también todas sus series. El cambio será definitivo al sobrescribir la sesión.`;
      if (!confirm(warning)) return;
      card.remove();
    });
    headerActions.appendChild(deleteExerciseBtn);
  }

  header.appendChild(left);
  header.appendChild(headerActions);
  card.appendChild(header);

  // ====== TABLA DE SERIES ======
  const seriesBlock = document.createElement("div");
  seriesBlock.className = "exercise-series-block";
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
  seriesBlock.appendChild(table);
  card.appendChild(seriesBlock);

  const tbody = table.querySelector("tbody");

  const existingNoteFromSets = Array.isArray(exData.sets)
    ? Array.from(new Set(exData.sets.map(s => (s.obs ?? "").trim()).filter(Boolean))).join(" / ")
    : "";
  const exerciseNotesValue = (exData.notes ?? existingNoteFromSets ?? "").trim();

  // Series
  if (exData.sets && exData.sets.length > 0) {
    exData.sets.forEach(s => {
      const normalized = isCardio
        ? {
            intensidad: s.intensidad ?? s.peso ?? "",
            tiempo: s.tiempo ?? s.reps ?? ""
          }
        : s;
      addSetRow(tbody, normalized, null, isCardio ? cardioSetFields : strengthSetFields);
    });
  } else {
    const initialSet = {};
    if (isCardio) {
      const lastSet = getLastCardioSet(exData.nombre);
      if (lastSet) {
        if (lastSet.intensidad != null && lastSet.intensidad !== "") initialSet.intensidad = lastSet.intensidad;
        if (lastSet.tiempo != null && lastSet.tiempo !== "") initialSet.tiempo = lastSet.tiempo;
      }
      addSetRow(tbody, initialSet, null, cardioSetFields);
    } else {
      const lastSet = getLastExerciseSet(exData.nombre);
      if (lastSet) {
        if (lastSet.peso != null && lastSet.peso !== "") initialSet.peso = lastSet.peso;
        if (lastSet.reps != null && lastSet.reps !== "") initialSet.reps = lastSet.reps;
      } else {
        if (Object.keys(initialSet).length === 0) {
          const maxWeight = getMaxWeight(exData.nombre);
          if (maxWeight) initialSet.peso = maxWeight;
        }
      }
      addSetRow(tbody, initialSet, null, strengthSetFields);
    }
  }

  const notesWrap = document.createElement("div");
  notesWrap.className = "exercise-general-notes";
  const notesLabel = document.createElement("label");
  notesLabel.textContent = t("exercise.notes.general");
  const notesInput = document.createElement("textarea");
  notesInput.className = "exercise-notes-input";
  notesInput.rows = 2;
  notesInput.value = exerciseNotesValue || "";
  const persistSessionSafely = () => {
    if (typeof saveSession === "function") {
      saveSession();
    }
  };
  notesInput.addEventListener("input", persistSessionSafely);
  notesInput.addEventListener("change", persistSessionSafely);
  notesWrap.appendChild(notesLabel);
  notesWrap.appendChild(notesInput);
  card.appendChild(notesWrap);

  const addBtn = document.createElement("button");
  addBtn.textContent = "+";
  addBtn.className = "add-set-btn";
  addBtn.setAttribute("aria-label", t("exercise.addSet"));
  addBtn.onclick = () => {
    addSetRow(tbody, {}, null, isCardio ? cardioSetFields : strengthSetFields);
    markSessionDirty();
    saveSession();
  };

  const headerRow = table.querySelector("thead tr");
  const actionHeader = headerRow?.querySelector(".set-action-col") || headerRow?.lastElementChild;
  if (actionHeader) {
    actionHeader.innerHTML = "";
    actionHeader.appendChild(addBtn);
  }

  // ====== ÚLTIMA REFERENCIA ======
  const historyDetails = document.createElement("details");
  historyDetails.className = "exercise-history";
  const historySummary = document.createElement("summary");
  historySummary.textContent = t("exercise.history.label");
  historyDetails.appendChild(historySummary);

  const historyContent = document.createElement("div");
  historyContent.className = "exercise-history-content";
  const lastReference = getLastExerciseReference(exData.nombre);

  if (!lastReference) {
    const emptyHistory = document.createElement("p");
    emptyHistory.className = "exercise-history-empty";
    emptyHistory.textContent = t("exercise.history.none");
    historyContent.appendChild(emptyHistory);
  } else {
    const historyDate = document.createElement("div");
    historyDate.className = "exercise-history-date";
    historyDate.textContent = lastReference.date;
    historyContent.appendChild(historyDate);

    const historyTable = document.createElement("table");
    historyTable.className = "exercise-table exercise-history-table";
    const headerLabels = lastReference.isCardio
      ? ["Serie", "Intensidad", "Tiempo (min)"]
      : ["Serie", "Peso", "Reps", "Fallo"];
    const tableHead = document.createElement("thead");
    const historyHeaderRow = document.createElement("tr");
    headerLabels.forEach(label => {
      const th = document.createElement("th");
      th.textContent = label;
      historyHeaderRow.appendChild(th);
    });
    tableHead.appendChild(historyHeaderRow);
    historyTable.appendChild(tableHead);

    const historyBody = document.createElement("tbody");
    lastReference.sets.forEach((set, index) => {
      const row = document.createElement("tr");
      const values = lastReference.isCardio
        ? [
            set.serie ?? index + 1,
            set.intensidad ?? set.peso ?? "",
            set.tiempo ?? set.reps ?? ""
          ]
        : [
            set.serie ?? index + 1,
            set.peso ?? "",
            set.reps ?? "",
            set.fallo === true || set.fallo === "true" ? "*" : ""
          ];
      values.forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
      });
      historyBody.appendChild(row);
    });
    historyTable.appendChild(historyBody);
    historyContent.appendChild(historyTable);
  }

  historyDetails.appendChild(historyContent);
  card.appendChild(historyDetails);

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

function addExerciseFromTemplate(name, options = {}) {
  if (!name) return;
  const tpl = exerciseTemplates[name] || {};
  const isWarmup = options.calentamiento === true;
  if (!exercisesContainer) exercisesContainer = mainExercisesContainer;
  exercisesContainer.appendChild(
    buildExerciseCard({
      nombre: name,
      musculo: tpl.musculo ?? "N/A",
      seccion: tpl.seccion ?? "N/A",
      hacer: tpl.hacer ?? "",
      noHacer: tpl.noHacer ?? "",
      trucos: tpl.trucos ?? "",
      calentamiento: isWarmup,
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

function normalizeMuscleLabel(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mapMuscleToGroup(label) {
  const raw = normalizeMuscleLabel(label);
  if (!raw) return "";
  if (raw.includes("cardio")) return "Cardio";
  if (raw.includes("pecho") || raw.includes("pectoral")) return "Pecho";
  if (raw.includes("espalda") || raw.includes("dorsal") || raw.includes("trapec")) return "Espalda";
  if (raw.includes("hombro") || raw.includes("delto")) return "Hombros";
  if (raw.includes("bicep") || raw.includes("tricep") || raw.includes("antebrazo") || raw.includes("brazo")) return "Brazos";
  if (
    raw.includes("pierna") ||
    raw.includes("cuadricep") ||
    raw.includes("isquio") ||
    raw.includes("femoral") ||
    raw.includes("gemel") ||
    raw.includes("pantorr") ||
    raw.includes("glute") ||
    raw.includes("aductor") ||
    raw.includes("abductor")
  ) return "Piernas";
  if (raw.includes("core") || raw.includes("abd") || raw.includes("lumbar")) return "Core";
  return "";
}

function resolveExerciseGroup(tpl) {
  if (!tpl) return "Otros";
  const direct = muscleGroupMap[tpl.musculo];
  if (direct) return direct;
  if (tpl.grupo) return tpl.grupo;
  const mapped = mapMuscleToGroup(tpl.musculo);
  return mapped || "Otros";
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

function populatePainExerciseSelect(exerciseNames) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = t("placeholder.selectExercise");
    painExerciseSelect.replaceChildren(placeholder);
    
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
  const includeSensations = options.includeSensations !== false;
  if (!preserveAutoSave) {
    sessionSaveKind = "none";
  }
  sessionIsDirty = false;
  updateAutoSaveLabel();
  exercisesContainer.innerHTML = "";
  senseGeneralInput.value = "";
  senseTirednessInput.value = "";
  if (senseWeightInput) senseWeightInput.value = "";
  sensePainSelect.value = "no";
  painZoneInput.value = "";
  if (senseCommentInput) senseCommentInput.value = "";
  setVisible(painDetailsDiv, false);

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
        calentamiento: isWarmupExercise(ex),
        sets,
        notes: ex.notes ?? ""
      }));
    });
    currentExercises = session.exercises.map(ex => ex.nombre);
  }

  if (includeSensations && session.sensations) {
    senseGeneralInput.value = session.sensations.general ?? "";
    senseTirednessInput.value = session.sensations.tiredness ?? "";
    if (senseWeightInput) senseWeightInput.value = session.sensations.weight ?? "";
    sensePainSelect.value = session.sensations.pain ?? "no";
    painZoneInput.value = session.sensations.painZone ?? "";
    if (senseCommentInput) senseCommentInput.value = session.sensations.comment ?? "";
    savedPainExercise = session.sensations.painExercise ?? "";
    if (sensePainSelect.value === "si") {
      setVisible(painDetailsDiv, true, "flex");
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
  const preserveExerciseIndex = options.preserveExerciseIndex === true;
  const key = sessionKey();
  const saved = JSON.parse(storage.getItem(key) || "null");
  if (!preserveAutoSave) {
    lastAutoSaveTime = null;
  }
  sessionIsDirty = false;

  const week = weekSelect.value;
  const day = daySelect.value;
  const resolved = resolveRoutineKeys(week, day);
  const routine = getAllRoutines()[resolved.weekKey]?.[resolved.dayKey];
  
  exercisesContainer.innerHTML = "";
  
  // 1. Limpiar campos de sensaciones antes de cargar
  senseGeneralInput.value = "";
  senseTirednessInput.value = "";
  sensePainSelect.value = "no";
  painZoneInput.value = "";
  if (senseCommentInput) senseCommentInput.value = "";
  setVisible(painDetailsDiv, false);
  
  let currentExercises = [];
  let savedPainExercise = ""; // Inicializamos variable para guardar el valor guardado
  
  // *Si hay datos guardados, cargarlos aunque la lista esté vacía*
  if (saved && Array.isArray(saved.exercises)) {
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
        calentamiento: isWarmupExercise(ex),
        sets: ex.sets ?? [],
        notes: ex.notes ?? ""
      }));
    });
    
    currentExercises = saved.exercises.map(ex => ex.nombre); 
    
    // Cargar sensaciones guardadas
    if (saved.sensations) {
      senseGeneralInput.value = saved.sensations.general ?? "";
      senseTirednessInput.value = saved.sensations.tiredness ?? "";
      if (senseWeightInput) senseWeightInput.value = saved.sensations.weight ?? "";
      sensePainSelect.value = saved.sensations.pain ?? "no";
      painZoneInput.value = saved.sensations.painZone ?? "";
      if (senseCommentInput) senseCommentInput.value = saved.sensations.comment ?? "";
      savedPainExercise = saved.sensations.painExercise ?? ""; // Almacenamos el valor
      
      if (sensePainSelect.value === 'si') {
          setVisible(painDetailsDiv, true, "flex");
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
        calentamiento: false,
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
  scheduleExercisePagination(!preserveExerciseIndex);
  if (typeof window.loadChartExercises === "function") {
    window.loadChartExercises();
  }
  updateAutoSaveLabel();
}


if (saveRoutineBtn) {
  saveRoutineBtn.onclick = async () => {
    if (!currentUserKey) {
      notifyRoutineError(t("status.selectUserBeforeSaveRoutine"));
      return;
    }
    const routineName = await promptForRoutineName("");
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
    saveSession({ source: "manual" });
    const key = sessionKey();
    const saved = JSON.parse(storage.getItem(key) || "null");
    if (!saved) return alert(t("alert.noDataToday"));
    upsertLocalHistory(saved);
    updateStepStatus();
    setStatus(t("status.sessionSavedLocal"));
    showSaveSessionMessage();
  };
}

function overwriteEditedSession() {
  if (!historyDateInput) return;
  setVisible(editSessionStatus, false);
  const dateStr = historyDateInput.value;
  if (!dateStr) return alert(t("alert.selectDay"));
  let historyWeightValue = "";
  if (historyBodyWeightInput) {
    historyWeightValue = historyBodyWeightInput.value.trim();
    const parsedWeight = historyWeightValue === "" ? null : Number(historyWeightValue);
    if (historyWeightValue !== "" && (!Number.isFinite(parsedWeight) || parsedWeight <= 0)) {
      alert("Introduce un peso corporal válido.");
      return;
    }
  }
  const saved = buildSessionData(editExercisesContainer);
  if (!saved) return alert(t("alert.noDataToday"));
  saved.sensations.weight = historyWeightValue;
  const sessions = getLocalHistory();
  const index = sessions.findIndex(item => item.date === dateStr);
  if (index === -1) {
    showSaveSessionError(t("status.noHistoryDay"));
    return;
  }
  saved.date = dateStr;
  saved.week = sessions[index].week ?? saved.week;
  saved.day = sessions[index].day ?? saved.day;
  saved.key = sessions[index].key || saved.key;
  sessions[index] = { ...sessions[index], ...saved };
  if (saved.key) storage.setItem(saved.key, JSON.stringify(sessions[index]));
  setLocalHistory(sessions);
  window.uploadedHistory = sessions;
  rebuildHistoryData(sessions);
  refreshHistoryUI();
  populateHistoryDaySelect();
  refreshCharts();
  if (typeof renderUserStatsCharts === "function") renderUserStatsCharts();
  setStatus(t("status.sessionSavedLocal"));
  showSaveSessionMessage();
  setHistoryEditorMode(false);
  if (editSessionStatus) {
    editSessionStatus.textContent = t("status.sessionOverwritten");
    setVisible(editSessionStatus, true);
  }
}


// -------------------------
// MANEJADOR DE SENSACIONES
// -------------------------
sensePainSelect.addEventListener('change', () => {
    if (sensePainSelect.value === 'si') {
        setVisible(painDetailsDiv, true, "flex");
    } else {
        setVisible(painDetailsDiv, false);
        // Opcional: limpiar los campos cuando se desactiva el dolor
        painZoneInput.value = ""; 
        painExerciseSelect.value = "";
    }
    saveSession(); 
});

// Añadir listeners para guardar automáticamente y validar
const persistSessionSafely = () => {
  if (typeof saveSession === "function") {
    saveSession();
  }
};
senseGeneralInput.addEventListener("input", persistSessionSafely);
senseTirednessInput.addEventListener("input", persistSessionSafely);
if (senseWeightInput) senseWeightInput.addEventListener("input", persistSessionSafely);
if (senseCommentInput) {
  senseCommentInput.addEventListener("input", persistSessionSafely);
  senseCommentInput.addEventListener("change", persistSessionSafely);
}
painZoneInput.addEventListener("input", persistSessionSafely);
painExerciseSelect.addEventListener("change", persistSessionSafely); // El change es necesario para capturar la selección
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
  const run = () => {
    Promise.resolve(window.exerciseDataReady).finally(callback);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    window.setTimeout(run, 0);
  }
}

onReady(() => {
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
      exercisesContainer = mainExercisesContainer;
      showAllExercises = false;
      editingSessionContext = null;
      historyEditUnlocked = false;
      isEditingHistory = false;
      appState.isEditingHistory = false;
      applyHistorySession(session, { onlyFirstSet: true, includeSensations: false });
      const step3Index = stepPages.indexOf(step3);
      if (step3Index >= 0) setActiveStep(step3Index, { force: true });
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
  const dashboardStartBtn = document.getElementById("dashboard-start-btn");
  const dashboardStatsBtn = document.getElementById("dashboard-stats-btn");
  if (dashboardStartBtn) {
    dashboardStartBtn.addEventListener("click", () => {
      const sessionIndex = stepPages.indexOf(step2);
      if (sessionIndex >= 0) setActiveStep(sessionIndex);
    });
  }
  if (dashboardStatsBtn) {
    dashboardStatsBtn.addEventListener("click", () => {
      const statsIndex = stepPages.indexOf(step8);
      if (statsIndex >= 0) setActiveStep(statsIndex, { force: true, ignoreMax: true });
    });
  }
  if (welcomeStartBtn) {
    const startIndex = stepPages.indexOf(step1);
    const sessionIndex = stepPages.indexOf(stepDashboard);
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
      const isHidden = isElementHidden(welcomeLegalPanel);
      setVisible(welcomeLegalPanel, isHidden);
      if (isHidden) {
        welcomeLegalPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
  if (welcomeInfoBtn) {
    welcomeInfoBtn.addEventListener("click", () => {
      if (!welcomeInfoPanel) return;
      const isHidden = isElementHidden(welcomeInfoPanel);
      setVisible(welcomeInfoPanel, isHidden);
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
  updateHeaderOffsets();
  window.addEventListener("resize", updateHeaderOffsets);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js?v=1.0.2-reluciente").then(reg => {
      reg.update().catch(() => {});
    }).catch(() => {});
  }
  window.__gymAppReady = true;
});

window.addEventListener("load", () => {
  refreshUserSelect();
});
