/*
=============================================
ARCHIVO: ejercicios.js (versión mejorada)
Contiene:
 - Lista de ejercicios con notas técnicas ampliadas
 - Rutinas predefinidas
 * Cada ejercicio incluye ahora "trucos"
=============================================
*/

const exerciseTemplates = {
  // ======= PECHO =======
  "Press pecho en máquina": {
    musculo: "Pectoral",
    seccion: "Media",
    hacer: "Espalda pegada al respaldo, escápulas juntas, hombros abajo y pecho arriba. Empuja sin bloquear los codos y controla la fase negativa.",
    noHacer: "No arquees la lumbar, no adelantes los hombros ni dejes que la máquina te gane en el retorno.",
    trucos: "Imagina que intentas ‘abrazar’ la máquina; piensa en juntar los codos, no en empujar con las manos."
  },

  "Press inclinado mancuernas": {
    musculo: "Pectoral",
    seccion: "Superior",
    hacer: "Banco a 30–45°, escápulas retraídas, baja las mancuernas hacia la parte alta del pecho en un ángulo de 45°.",
    noHacer: "No abras demasiado los codos ni rebotes abajo.",
    trucos: "Piensa en hacer un arco suave con las mancuernas; mantén el pecho ‘mirando’ al techo."
  },

  "Aperturas en máquina/polea": {
    musculo: "Pectoral",
    seccion: "General",
    hacer: "Codos semiflexionados, abre y cierra en arco amplio manteniendo tensión constante.",
    noHacer: "No conviertas el movimiento en un press ni varíes el ángulo del codo.",
    trucos: "Imagina que rodeas un barril. Mantén las manos a la misma altura todo el recorrido."
  },

  "Press declinado mancuernas": {
    musculo: "Pectoral",
    seccion: "Inferior",
    hacer: "Controla la bajada hacia la parte baja del pecho y mantén escápulas atrás.",
    noHacer: "No dejes caer las mancuernas ni abras demasiado.",
    trucos: "Mantén las muñecas firmes: piensa en empujar ‘hacia arriba y un poco hacia atrás’."
  },

  "Cruces desde abajo": {
    musculo: "Pectoral",
    seccion: "Superior",
    hacer: "Poleas bajas hacia arriba en arco, sin tirar con bíceps.",
    noHacer: "No arquees la columna ni abras demasiado el paso.",
    trucos: "Aprieta el pecho dos segundos al finalizar. Piensa en juntar bíceps por delante del pecho."
  },

  "Press máquina vertical": {
    musculo: "Pectoral",
    seccion: "Media",
    hacer: "Hombros abajo, pecho arriba, empuje limpio.",
    noHacer: "No choques los topes ni bloquees codos.",
    trucos: "Ajusta el asiento para que el agarre quede a la altura del pecho — cambia totalmente la activación."
  },


  // ======= HOMBRO =======
  "Press militar mancuernas": {
    musculo: "Deltoides",
    seccion: "Anterior",
    hacer: "Columna neutra, abdomen firme, sube las mancuernas en vertical.",
    noHacer: "No arquees la espalda ni saques pecho en exceso.",
    trucos: "Haz una ligera rotación externa al subir para mantener el hombro más seguro."
  },

  "Press Arnold": {
    musculo: "Deltoides",
    seccion: "Completo",
    hacer: "Rotación controlada, abdomen firme, recorrido completo.",
    noHacer: "No gires rápido ni cargues demasiado.",
    trucos: "Empieza ‘mostrando’ los codos al frente y termina ‘mostrando’ las palmas al techo."
  },

  "Elevaciones laterales": {
    musculo: "Deltoides",
    seccion: "Lateral",
    hacer: "Eleva con el codo hasta la altura del hombro, muñeca relajada.",
    noHacer: "No eleves los hombros ni rices la mancuerna.",
    trucos: "Piensa en verter agua de un jarro: el codo ‘más alto’ que la mano activa mejor el deltoide."
  },

  "Elevaciones frontales": {
    musculo: "Deltoides",
    seccion: "Anterior",
    hacer: "Sube controlado hasta hombro sin impulso.",
    noHacer: "No balancees torso.",
    trucos: "Realiza el movimiento ligeramente en diagonal hacia dentro para respetar la mecánica del hombro."
  },

  "Elevaciones laterales polea": {
    musculo: "Deltoides",
    seccion: "Lateral",
    hacer: "Tensión continua desde abajo, eleva desde el codo.",
    noHacer: "No levantes el trapecio.",
    trucos: "Mantén el cable detrás del cuerpo para un inicio más limpio."
  },


  // ======= ESPALDA =======
  "Jalón al pecho": {
    musculo: "Dorsal",
    seccion: "General",
    hacer: "Saca pecho, tira codos hacia abajo y atrás.",
    noHacer: "No tires con bíceps ni uses impulso.",
    trucos: "Piensa en llevar los codos hacia los bolsillos del pantalón."
  },

  "Jalón supino": {
    musculo: "Dorsal",
    seccion: "Inferior",
    hacer: "Agarre supinado, pecho arriba, barra al esternón.",
    noHacer: "No encierres hombros.",
    trucos: "Usa agarre un poco más cerrado para activar más dorsal y menos bíceps."
  },

  "Jalón estrecho triángulo": {
    musculo: "Dorsal",
    seccion: "Profundo",
    hacer: "Tira hacia el esternón sin inclinarte en exceso.",
    noHacer: "No te eches demasiado hacia atrás.",
    trucos: "Mantén la mirada recta: evita mirar arriba para no perder tensión."
  },

  "Remo polea sentado": {
    musculo: "Dorsal",
    seccion: "Media",
    hacer: "Retracción escapular primero, luego tirón.",
    noHacer: "No redondees y no tires con brazos.",
    trucos: "Aprieta las escápulas dos segundos atrás para mejorar postura."
  },

  "Remo máquina pecho apoyado": {
    musculo: "Dorsal",
    seccion: "Media",
    hacer: "Aísla mejor el dorsal, tirón limpio.",
    noHacer: "No acortes recorrido.",
    trucos: "Juega con la altura del asiento para elegir si quieres más dorsal (alto) o más romboides (bajo)."
  },

  "Remo polea alta ancho": {
    musculo: "Espalda media",
    seccion: "Romboides",
    hacer: "Codos abiertos, tirón hacia cara alta del torso.",
    noHacer: "No conviertas en jalón vertical.",
    trucos: "Mantén los codos por encima de las manos para activar más espalda media."
  },

  "Remo inclinado a dos manos": {
    musculo: "Dorsal",
    seccion: "Media-Baja",
    hacer: "Torso inclinado, tira hacia cadera.",
    noHacer: "No encorvar espalda.",
    trucos: "Empuja el suelo con los talones para estabilizar el core."
  },

  "Pullover polea": {
    musculo: "Dorsal",
    seccion: "Estiramiento",
    hacer: "Brazos casi rectos, movimiento desde hombro.",
    noHacer: "No flexiones demasiado el codo.",
    trucos: "Inclina ligeramente el torso para un estiramiento brutal del dorsal."
  },

  "Reverse fly máquina": {
    musculo: "Deltoides posterior",
    seccion: "Posterior",
    hacer: "Abre manteniendo pecho pegado.",
    noHacer: "No uses trapecio.",
    trucos: "Piensa en separar los codos, no en mover las manos."
  },


  // ======= BRAZO =======
  "Curl bíceps": {
    musculo: "Bíceps",
    seccion: "General",
    hacer: "Supina al subir, codo estable.",
    noHacer: "No balancees.",
    trucos: "Aprieta fuerte arriba dos segundos para realmente aislar."
  },

  "Curl concentrado": {
    musculo: "Bíceps",
    seccion: "Cabeza corta",
    hacer: "Codo fijo en la pierna, subida lenta.",
    noHacer: "No uses impulso.",
    trucos: "Gira la mancuerna al final para máxima activación."
  },

  "Curl Scott": {
    musculo: "Bíceps",
    seccion: "Aislamiento",
    hacer: "Rango controlado, el brazo no se mueve.",
    noHacer: "No levantes el codo.",
    trucos: "Mantén muñeca neutra para evitar sobrecarga."
  },

  "Curl martillo": {
    musculo: "Bíceps/Antebrazo",
    seccion: "Braquiorradial",
    hacer: "Agarre neutro, codo pegado.",
    noHacer: "No gires torso.",
    trucos: "Piensa en elevar el codo ligeramente hacia delante para más braquiorradial."
  },

  "Tríceps en polea": {
    musculo: "Tríceps",
    seccion: "General",
    hacer: "Codos pegados y extensión estricta.",
    noHacer: "No abras codos.",
    trucos: "Inclínate un poco y bloquea los hombros hacia atrás."
  },

  "Tríceps cuerda 1 mano": {
    musculo: "Tríceps",
    seccion: "Aislamiento",
    hacer: "Extiende al máximo hacia abajo y afuera.",
    noHacer: "No gires el tronco.",
    trucos: "Separa ligeramente la mano al final para enfatizar la cabeza larga."
  },


  // ======= PIERNA =======
  "Prensa de piernas": {
    musculo: "Pierna",
    seccion: "Cuádriceps",
    hacer: "Lumbar pegada, rodillas alineadas con punteras.",
    noHacer: "No bloquees rodillas.",
    trucos: "Empuja con la parte externa del pie para activar más cuádriceps."
  },

  "Prensa sumo": {
    musculo: "Glúteo/Aductores",
    seccion: "Lateral/Interna",
    hacer: "Pies anchos y puntas afuera.",
    noHacer: "No colapsar rodillas.",
    trucos: "Empuja el suelo separándolo: activa glúteo medio brutalmente."
  },

  "Extensión cuádriceps": {
    musculo: "Cuádriceps",
    seccion: "Recto femoral",
    hacer: "Alinea rodilla con eje de la máquina.",
    noHacer: "No hagas tirones arriba.",
    trucos: "Pausa de 1–2 segundos arriba para sentir el vasto interno."
  },

  "Extensión cuádriceps isométrica": {
    musculo: "Cuádriceps",
    seccion: "Vasto medial",
    hacer: "Mantén la extensión arriba unos segundos.",
    noHacer: "No relajes de golpe.",
    trucos: "Activa el core mientras contraes para más estabilidad."
  },

  "Curl femoral": {
    musculo: "Femoral",
    seccion: "General",
    hacer: "Cadera neutra, talón hacia glúteo lento.",
    noHacer: "No arquees lumbar.",
    trucos: "Aprieta glúteos para desactivar la cadera y aislar más el femoral."
  },

  "Curl femoral sentado": {
    musculo: "Femoral",
    seccion: "General",
    hacer: "Rodilla en el eje, recorrido completo.",
    noHacer: "No rebotes.",
    trucos: "Inclina ligeramente el torso hacia adelante para mejor estiramiento inicial."
  },

  "Curl femoral 1 pierna": {
    musculo: "Femoral",
    seccion: "Aislamiento",
    hacer: "Rango completo, control total.",
    noHacer: "No hagas compensaciones con cadera.",
    trucos: "Mantén la planta del pie firme para evitar rotaciones."
  },

  "Hack machine": {
    musculo: "Cuádriceps",
    seccion: "Anterior",
    hacer: "Pies más abajo para mayor cuádriceps, baja controlado.",
    noHacer: "No bloquees rodilla.",
    trucos: "Mantén rodillas alineadas con puntas, no las dejes caer hacia dentro."
  },

  "Prensa pies juntos arriba": {
    musculo: "Glúteo/Femoral",
    seccion: "Posterior",
    hacer: "Pies arriba para enfatizar cadera.",
    noHacer: "No levantes lumbar.",
    trucos: "Imagina empujar con los talones: más glúteo."
  },

  "Zancadas mancuernas": {
    musculo: "Glúteo/Cuádriceps",
    seccion: "Funcional",
    hacer: "Paso largo, rodilla alineada.",
    noHacer: "No te hundas hacia delante.",
    trucos: "Empuja fuerte con el talón delantero para activar glúteo."
  },

  "Step-up banco": {
    musculo: "Glúteo/Cuádriceps",
    seccion: "Funcional",
    hacer: "Impulso solo de la pierna que pisa el banco.",
    noHacer: "No uses la pierna de abajo.",
    trucos: "Inclínate muy ligeramente hacia delante para activar más glúteo."
  },

  "Abducción máquina": {
    musculo: "Glúteo medio",
    seccion: "Lateral",
    hacer: "Controla apertura y retorno.",
    noHacer: "No inclinarse hacia delante.",
    trucos: "Inclínate un poco hacia atrás y sujeta el asiento para más rango."
  }
};


// ---------------------------------------------------------
// RUTINAS (sin cambios técnicos, pero listas para ampliación)
// ---------------------------------------------------------

const routines = {
  "Semana 1": {
    "Día 1": [
      "Press pecho en máquina",
      "Press inclinado mancuernas",
      "Aperturas en máquina/polea",
      "Press militar mancuernas",
      "Elevaciones laterales",
      "Tríceps en polea"
    ],
    "Día 2": [
      "Jalón al pecho",
      "Remo polea sentado",
      "Face pull",
      "Curl martillo",
      "Curl bíceps"
    ],
    "Día 3": [
      "Prensa de piernas",
      "Extensión cuádriceps",
      "Curl femoral",
      "Zancadas mancuernas"
    ]
  },

  "Semana 2": {
    "Día 1": [
      "Press declinado mancuernas",
      "Aperturas inclinadas",
      "Press Arnold",
      "Elevaciones frontales",
      "Tríceps cuerda 1 mano"
    ],
    "Día 2": [
      "Jalón supino",
      "Remo máquina pecho apoyado",
      "Pullover polea",
      "Pájaros mancuernas",
      "Curl Scott"
    ],
    "Día 3": [
      "Hack machine",
      "Prensa pies juntos arriba",
      "Curl femoral sentado",
      "Abducción máquina"
    ]
  },

  "Semana 3": {
    "Día 1": [
      "Press máquina vertical",
      "Press neutral grip mancuernas",
      "Cruces desde abajo",
      "Press Arnold",
      "Elevaciones laterales polea"
    ],
    "Día 2": [
      "Jalón estrecho triángulo",
      "Remo inclinado a dos manos",
      "Remo polea alta ancho",
      "Reverse fly máquina",
      "Curl concentrado"
    ],
    "Día 3": [
      "Prensa sumo",
      "Extensión cuádriceps isométrica",
      "Curl femoral 1 pierna",
      "Step-up banco"
    ]
  }
};

// Exportar
window.exerciseTemplates = exerciseTemplates;
window.routines = routines;
