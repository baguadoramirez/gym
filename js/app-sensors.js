/* SPDX-License-Identifier: GPL-3.0-or-later · Copyright (C) 2026 Borja Aguado */
// Análisis de las grabaciones de los sensores del móvil (pestaña Tests).
// Cada muestra: { t (s), ax, ay, az (m/s², con gravedad), gx, gy, gz (°/s) }
(() => {
  const mean = values => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
  const rms = values => Math.sqrt(mean(values.map(value => value * value)));
  const std = values => {
    const average = mean(values);
    return Math.sqrt(mean(values.map(value => (value - average) ** 2)));
  };

  // Media móvil centrada de `windowSeconds`; suaviza sin desplazar la señal en el tiempo
  const smooth = (values, times, windowSeconds) => {
    const half = windowSeconds / 2;
    let start = 0;
    let end = 0;
    let sum = 0;
    return values.map((_, index) => {
      while (end < values.length && times[end] <= times[index] + half) sum += values[end++];
      while (times[start] < times[index] - half) sum -= values[start++];
      return sum / (end - start);
    });
  };

  // Desviación típica en una ventana centrada de `windowSeconds`
  const localStd = (values, times, windowSeconds) => {
    const average = smooth(values, times, windowSeconds);
    const squares = smooth(values.map(value => value * value), times, windowSeconds);
    return squares.map((square, index) => Math.sqrt(Math.max(0, square - (average[index] ** 2))));
  };

  // Intervalo entre muestras; se acota para que un hueco en los eventos no dispare la integración
  const getSteps = times => times.map((time, index) => (
    index === 0 ? 0 : Math.min(Math.max(time - times[index - 1], 0), 0.1)
  ));

  const integrate = (values, steps) => {
    let total = 0;
    return values.map((value, index) => {
      if (index > 0) total += ((value + values[index - 1]) / 2) * steps[index];
      return total;
    });
  };

  // Resta la recta de mínimos cuadrados: elimina el sesgo del giroscopio integrado
  const detrend = (values, times) => {
    const tMean = mean(times);
    const vMean = mean(values);
    let num = 0;
    let den = 0;
    times.forEach((time, index) => {
      num += (time - tMean) * (values[index] - vMean);
      den += (time - tMean) ** 2;
    });
    const slope = den ? num / den : 0;
    return values.map((value, index) => value - (vMean + slope * (times[index] - tMean)));
  };

  const normalizeSamples = samples => {
    const valid = (Array.isArray(samples) ? samples : []).filter(sample => (
      sample && [sample.t, sample.ax, sample.ay, sample.az].every(Number.isFinite)
    ));
    const t0 = valid.length ? valid[0].t : 0;
    return valid.map(sample => ({
      t: sample.t - t0,
      ax: sample.ax,
      ay: sample.ay,
      az: sample.az,
      gx: Number.isFinite(sample.gx) ? sample.gx : 0,
      gy: Number.isFinite(sample.gy) ? sample.gy : 0,
      gz: Number.isFinite(sample.gz) ? sample.gz : 0
    }));
  };

  // Pallof: cuánto giran y se mueven las manos durante el aguante (menos es mejor)
  const analyzePallof = rawSamples => {
    const samples = normalizeSamples(rawSamples);
    if (samples.length < 20) return null;
    const times = samples.map(sample => sample.t);
    const steps = getSteps(times);
    const axes = ["gx", "gy", "gz"];

    const rates = axes.map(axis => {
      const values = samples.map(sample => sample[axis]);
      const bias = mean(values);
      return values.map(value => value - bias);
    });
    const rateMagnitude = times.map((_, index) => Math.hypot(...rates.map(axis => axis[index])));

    const angles = axes.map(axis => detrend(integrate(samples.map(sample => sample[axis]), steps), times));
    const deviation = smooth(times.map((_, index) => Math.hypot(...angles.map(axis => axis[index]))), times, 0.1);

    // Aceleración lineal: se quita la gravedad con una media móvil de 1 s
    const linear = ["ax", "ay", "az"].map(axis => {
      const values = samples.map(sample => sample[axis]);
      const gravity = smooth(values, times, 1);
      return values.map((value, index) => value - gravity[index]);
    });
    const linearMagnitude = times.map((_, index) => Math.hypot(...linear.map(axis => axis[index])));

    return {
      duration: times[times.length - 1],
      rotationRms: rms(rateMagnitude),
      maxDeviation: Math.max(...deviation),
      deviationRms: rms(deviation),
      linearRms: rms(linearMagnitude),
      series: { t: times, value: deviation }
    };
  };

  // Puntos de giro de la posición: un máximo o mínimo cuenta cuando la señal se aleja `threshold` de él
  const findPivots = (values, threshold, includeTrailing = true) => {
    const pivots = [];
    let mode = 0;
    let maxIndex = 0;
    let minIndex = 0;
    let candidate = 0;
    for (let index = 1; index < values.length; index += 1) {
      const value = values[index];
      if (mode === 0) {
        if (value > values[maxIndex]) maxIndex = index;
        if (value < values[minIndex]) minIndex = index;
        if (values[maxIndex] - values[minIndex] >= threshold) {
          if (maxIndex > minIndex) {
            pivots.push({ type: "low", index: minIndex });
            mode = 1;
            candidate = maxIndex;
          } else {
            pivots.push({ type: "high", index: maxIndex });
            mode = -1;
            candidate = minIndex;
          }
        }
      } else if (mode === 1) {
        if (value > values[candidate]) candidate = index;
        else if (values[candidate] - value >= threshold) {
          pivots.push({ type: "high", index: candidate });
          mode = -1;
          candidate = index;
        }
      } else if (value < values[candidate]) {
        candidate = index;
      } else if (value - values[candidate] >= threshold) {
        pivots.push({ type: "low", index: candidate });
        mode = 1;
        candidate = index;
      }
    }
    // Si la grabación acaba arriba, esa subida también cuenta
    if (mode === 1 && includeTrailing) pivots.push({ type: "high", index: candidate });
    return pivots;
  };

  const MIN_REP_ROM = 0.15;

  // Dominadas: recorrido vertical de cada repetición. El móvil va en un bolsillo o en la cintura.
  const analyzePullups = rawSamples => {
    const samples = normalizeSamples(rawSamples);
    if (samples.length < 20) return null;
    const times = samples.map(sample => sample.t);
    const steps = getSteps(times);
    const n = samples.length;

    // La gravedad marca la vertical. Funciona con cualquier convenio de signo del navegador.
    const magnitude = samples.map(sample => Math.hypot(sample.ax, sample.ay, sample.az));
    // Quieto de verdad: poca variación y un módulo cercano al habitual (en el punto alto de la
    // repetición la aceleración también varía poco, pero su módulo se aleja de la gravedad)
    const sortedMagnitude = magnitude.slice().sort((a, b) => a - b);
    const typicalMagnitude = sortedMagnitude[Math.floor(n / 2)];
    const magnitudeStd = localStd(magnitude, times, 0.3);
    const gravitySamples = samples.filter((_, index) => (
      magnitudeStd[index] < 0.4 && Math.abs(magnitude[index] - typicalMagnitude) < 0.3
    ));
    const reference = gravitySamples.length > n * 0.1 ? gravitySamples : samples;
    const gravity = ["ax", "ay", "az"].map(axis => mean(reference.map(sample => sample[axis])));
    const gravityNorm = Math.hypot(...gravity) || 9.81;
    const up = gravity.map(value => value / gravityNorm);
    const vertical = smooth(samples.map(sample => (
      (sample.ax * up[0]) + (sample.ay * up[1]) + (sample.az * up[2]) - gravityNorm
    )), times, 0.1);

    // Quieto (colgado o parado): la velocidad vale cero; corrige la deriva de la integración
    // Solo cuentan los tramos quietos de al menos 0,2 s: un instante con aceleración cero no basta
    const localMean = smooth(vertical, times, 0.3);
    const verticalStd = localStd(vertical, times, 0.3);
    const still = vertical.map((_, index) => verticalStd[index] < 0.25 && Math.abs(localMean[index]) < 0.3);
    for (let start = 0; start < n;) {
      let end = start;
      while (end < n && still[end] === still[start]) end += 1;
      if (still[start] && times[end - 1] - times[start] < 0.2) still.fill(false, start, end);
      start = end;
    }

    const velocity = new Array(n).fill(0);
    let index = 0;
    while (index < n) {
      if (still[index]) {
        velocity[index] = 0;
        index += 1;
        continue;
      }
      const start = index;
      while (index < n && !still[index]) index += 1;
      const end = index;
      let current = 0;
      for (let i = start; i < end; i += 1) {
        if (i > 0) current += ((vertical[i] + vertical[i - 1]) / 2) * steps[i];
        velocity[i] = current;
      }
      if (end < n) {
        const closing = current + ((vertical[end] + vertical[end - 1]) / 2) * steps[end];
        const span = times[end] - times[Math.max(start - 1, 0)] || 1;
        for (let i = start; i < end; i += 1) {
          velocity[i] -= closing * ((times[i] - times[Math.max(start - 1, 0)]) / span);
        }
      }
    }

    const position = integrate(velocity, steps);
    // Sin quietud al final, la última subida no tiene corrección de deriva: no se cuenta
    const pivots = findPivots(position, 0.1, still[n - 1]);
    const reps = [];
    pivots.forEach((pivot, pivotIndex) => {
      const previous = pivots[pivotIndex - 1];
      if (pivot.type !== "high" || previous?.type !== "low") return;
      const rom = position[pivot.index] - position[previous.index];
      if (rom < MIN_REP_ROM) return;
      // La subida empieza al dejar el punto bajo y acaba al llegar arriba (sin contar pausas)
      let riseStart = previous.index;
      while (riseStart < pivot.index && position[riseStart + 1] - position[previous.index] < 0.005) riseStart += 1;
      let riseEnd = riseStart;
      while (riseEnd < pivot.index && position[pivot.index] - position[riseEnd] > 0.005) riseEnd += 1;
      const duration = times[riseEnd] - times[riseStart];
      reps.push({
        rom,
        duration,
        meanVelocity: duration > 0 ? rom / duration : null,
        peakVelocity: Math.max(...velocity.slice(riseStart, riseEnd + 1)),
        highTime: times[pivot.index]
      });
    });

    const roms = reps.map(rep => rep.rom);
    const lowest = Math.min(...position);
    return {
      duration: times[n - 1],
      reps,
      romMean: roms.length ? mean(roms) : null,
      romSd: roms.length > 1 ? std(roms) : null,
      meanVelocity: reps.length ? mean(reps.map(rep => rep.meanVelocity).filter(Number.isFinite)) : null,
      series: { t: times, value: position.map(value => value - lowest) }
    };
  };

  // Reduce una serie para guardarla sin llenar el almacenamiento
  const downsample = (series, maxPoints = 400) => {
    const length = series?.t?.length || 0;
    const stride = Math.max(1, Math.ceil(length / maxPoints));
    const t = [];
    const value = [];
    for (let index = 0; index < length; index += stride) {
      t.push(Number(series.t[index].toFixed(3)));
      value.push(Number(series.value[index].toFixed(4)));
    }
    return { t, value };
  };

  const api = { analyzePallof, analyzePullups, downsample, findPivots };
  globalThis.GymSensors = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
