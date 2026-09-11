(() => {
  const numberOrNull = value => {
    if (value == null || value === "") return null;
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getExercises = session => (
    session?.exercises || session?.ejercicios || session?.data?.exercises || []
  );

  const getSets = exercise => exercise?.sets || exercise?.series || [];

  const getExerciseName = exercise => (
    exercise?.nombre || exercise?.name || exercise?.exercise || exercise?.ejercicio || ""
  );

  const isWarmup = exercise => (
    exercise?.calentamiento === true || exercise?.calentamiento === "true"
  );

  const getBodyWeight = session => numberOrNull(
    session?.sensations?.weight ?? session?.sensations?.peso ?? session?.sensations?.pes
  );

  const sessionTime = session => {
    const parsed = new Date(`${session?.date || ""}T12:00:00`).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getNearestBodyWeight = (session, sessions = []) => {
    const ownWeight = getBodyWeight(session);
    if (ownWeight != null) return ownWeight;
    const targetTime = sessionTime(session);
    if (targetTime == null) return null;
    let nearest = null;
    let nearestTime = -Infinity;
    sessions.forEach(candidate => {
      const weight = getBodyWeight(candidate);
      const time = sessionTime(candidate);
      if (weight == null || time == null || time > targetTime || time <= nearestTime) return;
      nearest = weight;
      nearestTime = time;
    });
    return nearest;
  };

  const getTemplate = (exercise, templates = {}) => templates[getExerciseName(exercise)] || {};

  const getLoadMode = (exercise, templates = {}) => {
    const mode = exercise?.cargaCorporal ?? getTemplate(exercise, templates)?.cargaCorporal;
    return mode === "sumar" || mode === "restar" ? mode : "";
  };

  const isCardio = (exercise, templates = {}) => {
    const template = getTemplate(exercise, templates);
    const group = exercise?.grupo || template?.grupo || "";
    if (String(group).toLocaleLowerCase("es") === "cardio") return true;
    const sets = getSets(exercise);
    return sets.length > 0 && sets.every(set => (
      numberOrNull(set?.tiempo ?? set?.time) != null
      && numberOrNull(set?.reps ?? set?.repeticiones) == null
    ));
  };

  const getSetEffectiveLoad = (set, exercise, bodyWeight, templates = {}) => {
    const externalWeight = numberOrNull(set?.peso ?? set?.weight);
    const mode = getLoadMode(exercise, templates);
    if (!mode) return externalWeight;
    if (bodyWeight == null) return null;
    if (mode === "sumar") return bodyWeight + (externalWeight || 0);
    if (externalWeight == null) return null;
    return Math.max(0, bodyWeight - externalWeight);
  };

  const isLoadImprovement = (current, previous, mode = "") => {
    const currentValue = numberOrNull(current);
    const previousValue = numberOrNull(previous);
    if (currentValue == null || previousValue == null) return false;
    return mode === "restar" ? currentValue < previousValue : currentValue > previousValue;
  };

  const calculateExerciseVolume = (exercise, options = {}) => {
    if (!exercise || isWarmup(exercise) || isCardio(exercise, options.templates)) return 0;
    return getSets(exercise).reduce((total, set) => {
      const reps = numberOrNull(set?.reps ?? set?.repeticiones);
      const load = getSetEffectiveLoad(set, exercise, options.bodyWeight, options.templates);
      return total + (reps != null && reps > 0 && load != null ? reps * load : 0);
    }, 0);
  };

  const calculateSetPerformance = (set, exercise, options = {}) => {
    const reps = numberOrNull(set?.reps ?? set?.repeticiones);
    const load = getSetEffectiveLoad(set, exercise, options.bodyWeight, options.templates);
    return reps != null && reps > 0 && load != null ? load * (1 + (reps / 30)) : null;
  };

  const calculateExercisePerformance = (exercise, options = {}) => {
    if (!exercise || isWarmup(exercise) || isCardio(exercise, options.templates)) return null;
    const values = getSets(exercise)
      .map(set => calculateSetPerformance(set, exercise, options))
      .filter(value => value != null);
    if (!values.length) return null;
    const best = Math.max(...values);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      best,
      retention: best > 0 ? (average / best) * 100 : null
    };
  };

  const calculateSessionVolume = (session, options = {}) => {
    const sessions = Array.isArray(options.sessions) ? options.sessions : [];
    const bodyWeight = getNearestBodyWeight(session, sessions);
    return getExercises(session).reduce((total, exercise) => (
      total + calculateExerciseVolume(exercise, {
        bodyWeight,
        templates: options.templates || {}
      })
    ), 0);
  };

  const api = {
    numberOrNull,
    getBodyWeight,
    getNearestBodyWeight,
    getLoadMode,
    getSetEffectiveLoad,
    isLoadImprovement,
    isCardio,
    calculateExerciseVolume,
    calculateSetPerformance,
    calculateExercisePerformance,
    calculateSessionVolume
  };

  globalThis.GymMetrics = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
