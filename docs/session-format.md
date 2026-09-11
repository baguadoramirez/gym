# Formato de sesión

La app guarda el histórico en `localStorage`, separado por usuario. La clave principal por usuario es:

```text
gym_history_v1_<userKey>
```

El valor es un array JSON de sesiones.

## Sesión

```json
{
  "key": "gym_<userKey>_2026-01-10_Semana 1_Día 1",
  "user": "Nombre de usuario",
  "date": "2026-01-10",
  "week": "Semana 1",
  "day": "Día 1",
  "exercises": [],
  "sensations": {},
  "revisions": []
}
```

Campos principales:

- `key`: identificador estable de la sesión. Si falta, se reconstruye con usuario, fecha, semana y día.
- `user`: nombre visible del usuario. Se usa para migraciones legacy.
- `date`: fecha ISO `YYYY-MM-DD`.
- `week`: semana/rutina seleccionada.
- `day`: día/rutina seleccionada.
- `exercises`: lista de ejercicios registrados.
- `sensations`: sensaciones post-entreno.
- `revisions`: snapshots anteriores, limitado actualmente a 10 revisiones.

## Ejercicio

```json
{
  "nombre": "Press banca",
  "musculo": "Pecho",
  "seccion": "Pecho",
  "calentamiento": false,
  "sets": [],
  "notes": ""
}
```

Campos admitidos por compatibilidad:

- Nombre: `nombre`, `name`, `exercise` o `ejercicio`.
- Series: `sets` o `series`.
- Calentamiento: `calentamiento`.

Los campos técnicos de plantilla `hacer`, `noHacer` y `trucos` se eliminan al persistir histórico.

## Serie de fuerza

```json
{
  "serie": 1,
  "peso": 80,
  "reps": 8,
  "rir": 2,
  "fallo": false,
  "repsFallo": null
}
```

`rir` es opcional. Se interpreta como repeticiones en reserva; `0` significa que la serie llegó al límite.

## Serie de cardio

```json
{
  "serie": 1,
  "intensidad": 7,
  "tiempo": 30
}
```

## Sensaciones

```json
{
  "general": 8,
  "tiredness": 5,
  "weight": 76.5,
  "pain": "no",
  "painZone": "",
  "painExercise": "",
  "comment": ""
}
```

## Notas de compatibilidad

- La app sigue leyendo `gym_history_v1` como histórico legacy, pero sólo para sesiones cuyo `user` coincide con el usuario actual.
- También puede hidratar sesiones antiguas guardadas como claves individuales `gym_<userKey>_<date>_<week>_<day>`.
- Las lecturas JSON deben pasar por `readStorageJSON` para tolerar datos corruptos o antiguos sin romper la app.
