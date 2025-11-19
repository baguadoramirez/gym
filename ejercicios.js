/*
=============================================
ARCHIVO: ejercicios.js (versión mejorada - V4)
Contiene:
 - Lista de ejercicios con notas técnicas AMPLIADAS y MEJORADAS
 - Rutinas predefinidas
 * Se han añadido los ejercicios faltantes de las rutinas
=============================================
*/

const exerciseTemplates = {
  // ======= PECHO 💎 =======
  "Press pecho en máquina": {
    musculo: "Pectoral",
    seccion: "Media (Esternal)",
    hacer: "<b>Configura el asiento</b> para que los agarres estén a la altura del medio pecho. <b>Retrae y deprime las escápulas</b> firmemente contra el respaldo. Inicia el empuje desde el pecho (no desde los hombros), manteniendo los codos en un ángulo de 45°-60° respecto al torso. <b>Controla la fase negativa (excéntrica)</b>, volviendo a la posición inicial lentamente (3-4 segundos).",
    noHacer: "<b>No permitas que los hombros se adelanten</b> (protacción escapular) al final del recorrido. No arquees la zona lumbar de forma excesiva. Evita el bloqueo total del codo para mantener la tensión constante.",
    trucos: "Adopta el *Mind-Muscle Connection* (conexión mente-músculo): imagina que intentas <b>'abrazar' la máquina</b>, pensando en juntar los bíceps o los codos en lugar de solo empujar con las manos. Esto maximiza la contracción pectoral."
  },

  "Press inclinado mancuernas": {
    musculo: "Pectoral",
    seccion: "Superior (Clavicular)",
    hacer: "Banco ajustado entre <b>30° y 45°</b> (cuanto más bajo, mejor para aislar el pectoral superior). Mantén las <b>escápulas retraídas y pegadas</b> al banco. Baja las mancuernas de forma controlada hacia la parte alta del pecho, con los codos a unos 45° del torso. El movimiento debe ser en <b>arco de dentro a fuera</b> en la bajada.",
    noHacer: "<b>No eleves los hombros</b> hacia las orejas. Evita que las mancuernas 'choquen' abajo o 'reboten'. No permitas que el ángulo del codo se abra a 90°, ya que estresa la articulación del hombro.",
    trucos: "Piensa en empujar las mancuernas <b>'hacia arriba y ligeramente hacia el centro'</b>. Mantén el <b>pecho 'mirando' al techo</b> durante todo el set, esto asegura la activación del pectoral superior y una buena retracción escapular."
  },

  "Aperturas en máquina/polea": {
    musculo: "Pectoral",
    seccion: "General (Énfasis en estiramiento)",
    hacer: "<b>Fija los codos en una ligera flexión</b> (semiflexionados) y mantén ese ángulo constante. Abre en un arco amplio hasta sentir un <b>fuerte estiramiento</b> del pectoral. Cierra el movimiento en el centro, apretando la parte interna del pecho.",
    noHacer: "<b>No conviertas el movimiento en un 'press'</b> extendiendo o flexionando los codos durante el recorrido. No uses un peso tan alto que comprometa el rango de movimiento completo.",
    trucos: "Imagina que <b>rodeas un barril</b> para mantener la forma de arco. Al cerrar, <b>haz una pausa de 1 segundo</b> apretando el pectoral y piensa en juntar tus bíceps para una contracción máxima. En polea, cruza las manos ligeramente para una activación final más intensa."
  },

  "Press declinado mancuernas": {
    musculo: "Pectoral",
    seccion: "Inferior (Abdominal)",
    hacer: "Asegura bien los pies en el soporte. <b>Controla la bajada</b> de las mancuernas hacia la parte más baja del pecho o superior del abdomen. Mantén una <b>retracción escapular muy estricta</b> para proteger los hombros.",
    noHacer: "No dejes caer las mancuernas rápidamente. Evita un exceso de 'rebote' o impulso al final de la fase excéntrica.",
    trucos: "Para una máxima estabilidad, <b>piensa en empujar 'hacia arriba y ligeramente hacia atrás'</b> (en la dirección de la cabeza) y mantén las muñecas completamente firmes y alineadas con los antebrazos."
  },

  "Cruces desde abajo": {
    musculo: "Pectoral",
    seccion: "Superior (Clavicular)",
    hacer: "Inicia con las poleas en la posición más baja. Da un paso adelante, inclínate ligeramente y <b>mantén el codo semiflexionado</b>. Sube y cruza las manos por delante del pecho hasta la altura de los hombros o cara.",
    noHacer: "<b>No uses los bíceps</b> para tirar; el movimiento debe generarse por la contracción del pectoral superior. Evita arquear la columna o balancear el torso.",
    trucos: "Piensa en <b>juntar los bíceps a la altura de la barbilla</b> o los ojos. <b>Aprieta el pecho dos segundos</b> en el punto álgido del cruce para enfatizar el vientre superior."
  },

  "Press máquina vertical": {
    musculo: "Pectoral",
    seccion: "Media (Esternal)",
    hacer: "<b>Ajusta el asiento de forma crítica</b> para que las asas o el agarre queden exactamente a la altura del medio pecho. Realiza un <b>empuje limpio y recto</b> hacia adelante. Mantén los hombros deprimidos y el pecho elevado.",
    noHacer: "<b>No bloquees los codos</b> al final del recorrido. No permitas que el pecho se hunda durante el movimiento.",
    trucos: "Experimenta con la altura del asiento: si el agarre queda a la altura del pecho, se enfoca más en la sección media. Si está ligeramente más bajo, puedes sentir más la activación superior. <b>Bloquea los pies firmemente en el suelo</b> para generar más estabilidad y fuerza."
  },
  
  // --- EJERCICIOS FALTANTES DE PECHO ---
  "Aperturas inclinadas": {
    musculo: "Pectoral",
    seccion: "Superior (Estiramiento)",
    hacer: "Banco ajustado a 30-45°. <b>Brazos semiflexionados</b>, desciende las mancuernas a los lados lentamente, sintiendo el estiramiento en la parte alta del pecho. Junta las mancuernas en un arco amplio por encima del pecho.",
    noHacer: "No dejes caer los codos por debajo del nivel del banco. <b>No arquees la lumbar</b> al descender el peso.",
    trucos: "Enfócate en <b>separar las manos en la fase excéntrica</b> (bajando) para maximizar el estiramiento del haz clavicular. Piensa en juntar los bíceps, no las manos."
  },

  "Press neutral grip mancuernas": {
    musculo: "Pectoral",
    seccion: "Media/Esternal (Seguridad)",
    hacer: "Agarre neutro (palmas enfrentadas). Esto pone los hombros en una posición más segura. <b>Empuja en un plano vertical</b> y mantén los codos ligeramente más pegados al torso (30°-45°).",
    noHacer: "No separes los codos en exceso. <b>No bloquees la articulación</b> completamente arriba.",
    trucos: "Ideal para el desarrollo de la **parte interna del pectoral**. En el punto superior, intenta 'raspar' las mancuernas una contra otra para asegurar la contracción central."
  },


  // ======= HOMBRO 🎯 =======
  "Press militar mancuernas": {
    musculo: "Deltoides",
    seccion: "Anterior",
    hacer: "Siéntate con la espalda recta o con un ligero apoyo que permita un <b>patrón vertical de empuje</b>. <b>Activa el abdomen (core)</b> para mantener la columna neutra. Sube las mancuernas verticalmente, ligeramente por delante de la cabeza.",
    noHacer: "<b>No arquees la espalda</b> (hiperextensión lumbar) en exceso para terminar la repetición. Evita el *valgus* de codo (que el codo se abra mucho hacia los lados) al bajar.",
    trucos: "Al subir, realiza una <b>ligera rotación externa</b> (como si quisieras acercar las palmas entre sí) para asegurar un mejor 'empaquetamiento' del hombro y mayor seguridad articular."
  },

  "Press Arnold": {
    musculo: "Deltoides",
    seccion: "Completo (Anterior y Lateral)",
    hacer: "<b>Inicia con las palmas mirando hacia ti</b> (agarre supino). A medida que empujas, <b>rota las mancuernas 180°</b> hasta que las palmas miren hacia adelante (agarre prono) en la parte superior. Controla la rotación y el recorrido completo.",
    noHacer: "<b>No gires rápido ni de forma brusca</b>; el movimiento debe ser fluido y controlado. No cargues demasiado peso; este ejercicio se beneficia de un control estricto.",
    trucos: "El movimiento se divide en dos: Press + Elevación frontal (rotación). Piensa en <b>'mostrar' los codos al frente</b> al inicio y terminar <b>'mostrando' las palmas al techo</b> al final. Esto añade tiempo bajo tensión al deltoides anterior."
  },

  "Elevaciones laterales": {
    musculo: "Deltoides",
    seccion: "Lateral (Medial)",
    hacer: "Mantén una ligera flexión de codo constante. <b>Eleva con el codo</b>, detente cuando el brazo esté paralelo al suelo (a la altura del hombro). La <b>muñeca debe estar relajada</b>. Baja de forma controlada (fase excéntrica lenta).",
    noHacer: "<b>No uses impulso o balanceo del torso</b>. Evita elevar el trapecio (encogimiento de hombros) para iniciar o completar el movimiento. No superes la altura del hombro.",
    trucos: "Piensa en <b>verter agua de un jarro</b>: la parte del <b>codo debe estar 'más alta' que la mano</b>. Esto asegura que el deltoides lateral, y no el anterior, sea el motor principal."
  },

  "Elevaciones frontales": {
    musculo: "Deltoides",
    seccion: "Anterior",
    hacer: "Realiza el movimiento con agarre prono (palmas hacia abajo), subiendo la mancuerna o barra <b>controladamente hasta la altura del hombro</b> (90° de flexión). Mantén el resto del cuerpo estable.",
    noHacer: "No permitas el <b>balanceo del torso</b> o *kipping* para ayudarte a subir el peso. No superes la altura del hombro, ya que pierde efectividad y puede irritar la articulación.",
    trucos: "Realiza el movimiento <b>ligeramente en diagonal hacia dentro</b> (plano escapular), no directamente hacia adelante. Esto respeta la mecánica natural del hombro y lo hace más seguro y efectivo."
  },

  "Elevaciones laterales polea": {
    musculo: "Deltoides",
    seccion: "Lateral (Medial)",
    hacer: "<b>Colócate frente a la polea</b> (si el cable cruza por detrás) o lateralmente. Inicia con <b>tensión continua desde el punto más bajo</b>. Eleva el peso <b>liderando con el codo</b> y detente a la altura del hombro.",
    noHacer: "<b>No permitas que el trapecio se active</b> al encoger los hombros. Evita inclinar el torso excesivamente.",
    trucos: "Para una activación óptima, mantén el <b>cable detrás del cuerpo</b> (si te colocas frente a la polea) o el agarre <b>cruzado</b> (si estás de lado). Esto crea un ángulo de resistencia más limpio desde el inicio."
  },


  // ======= ESPALDA ⛰️ =======
  "Jalón al pecho": {
    musculo: "Dorsal",
    seccion: "General (Ancho)",
    hacer: "<b>Saca el pecho</b> y mantén una ligera inclinación hacia atrás (10°-15°). Tira de la barra llevando los <b>codos hacia abajo y hacia atrás</b>, concentrándote en la contracción de la espalda. La barra debe llegar a la clavícula o parte alta del pecho.",
    noHacer: "<b>No tires excesivamente con los bíceps</b>; concéntrate en la retracción escapular y la acción del dorsal. Evita el balanceo excesivo o el impulso.",
    trucos: "Imagina que intentas llevar los <b>codos hacia los bolsillos traseros</b> del pantalón. Esto redirige el esfuerzo al dorsal ancho y minimiza la participación de los brazos."
  },

  "Jalón supino": {
    musculo: "Dorsal",
    seccion: "Inferior (Grosor)",
    hacer: "Utiliza un <b>agarre supinado (palmas hacia ti)</b>, idealmente un poco más cerrado que el ancho de hombros. Mantén el <b>pecho arriba</b> y tira la barra hacia la parte baja del esternón. <b>Enfatiza la retracción escapular</b>.",
    noHacer: "<b>No permitas que los hombros se encierren</b> o roten hacia adelante. Evita arquear la espalda excesivamente al final del recorrido.",
    trucos: "El agarre supino recluta más bíceps, así que para activar más el dorsal, usa un <b>agarre ligeramente más cerrado</b> que la distancia biacromial (ancho de hombros). Concéntrate en la <b>depresión y retracción escapular</b>."
  },

  "Jalón estrecho triángulo": {
    musculo: "Dorsal",
    seccion: "Profundo (Central)",
    hacer: "Utiliza el agarre V (triángulo). <b>Pecho arriba</b>, realiza un tirón vertical limpio hacia el esternón bajo o el abdomen superior. <b>Retrae y deprime las escápulas</b> al final del movimiento.",
    noHacer: "<b>No te eches demasiado hacia atrás</b> ni te balancees; el torso debe moverse ligeramente, pero no debe ser el motor. Evita mirar hacia arriba, lo que podría desalinear el cuello.",
    trucos: "Mantén una <b>mirada neutra (recta)</b> y la cabeza alineada. En la fase excéntrica, <b>permite que las escápulas se estiren</b> ligeramente hacia arriba para un rango de movimiento completo y un mayor estiramiento del dorsal."
  },

  "Remo polea sentado": {
    musculo: "Dorsal",
    seccion: "Media (Grosor)",
    hacer: "<b>Inicia el movimiento con la retracción escapular</b> (juntar las paletas de la espalda), y luego continúa el tirón con los brazos. Tira del agarre hacia el abdomen o el esternón. <b>Extiende el torso al inicio</b> (permitiendo el estiramiento) y vuelve a la vertical al tirar.",
    noHacer: "<b>No redondees la espalda</b> (cifosis torácica) al soltar el peso. Evita tirar solo con los brazos, descuidando la espalda.",
    trucos: "<b>Aprieta las escápulas dos segundos atrás</b> en la máxima contracción. Para un enfoque en la espalda alta/media (romboides), apunta el agarre hacia el pecho; para dorsal, apúntalo hacia el abdomen."
  },

  "Remo máquina pecho apoyado": {
    musculo: "Dorsal",
    seccion: "Media (Aislamiento)",
    hacer: "<b>Configura la altura del asiento</b> para que el agarre quede alineado con el torso. Al estar el pecho apoyado, se <b>aísla mejor el dorsal</b> al eliminar la inestabilidad del tronco. <b>Tirón limpio y estricto</b>.",
    noHacer: "No acortes el recorrido. Evita levantar el cuerpo del soporte con el impulso.",
    trucos: "<b>Juega con la altura del asiento</b>: si el tirón es más vertical (agarre bajo), enfocas más en el dorsal. Si el tirón es más horizontal (agarre alto), enfocas más en los romboides y trapecio medio."
  },

  "Remo polea alta ancho": {
    musculo: "Espalda media",
    seccion: "Romboides y Trapecio Medio",
    hacer: "Utiliza un agarre más ancho y un cable en posición alta. Realiza el tirón con los <b>codos abiertos</b> y dirigiéndolos hacia la parte alta del torso o la cara (como un *Face Pull* horizontal). <b>Enfatiza la retracción escapular</b>.",
    noHacer: "<b>No conviertas el ejercicio en un jalón vertical</b> bajando el agarre hacia el pecho. El codo debe permanecer más abierto.",
    trucos: "Mantén los <b>codos por encima de las manos</b> durante la mayor parte del recorrido. Esto asegura que el plano de movimiento se centre en la retracción horizontal, maximizando la activación de la espalda media."
  },

  "Remo inclinado a dos manos": {
    musculo: "Dorsal",
    seccion: "Media-Baja (Grosor)",
    hacer: "<b>Mantén el torso inclinado (casi paralelo al suelo)</b>, con la espalda recta y las rodillas ligeramente flexionadas. Tira la barra o mancuernas <b>hacia la cadera</b> (si quieres más dorsal) o hacia el abdomen (si quieres más espalda media).",
    noHacer: "<b>No encorvar la espalda baja (zona lumbar)</b>; mantén la posición inicial. Evita el balanceo excesivo.",
    trucos: "Para una máxima estabilidad del core y la espalda, <b>empuja el suelo con los talones</b> como si fueras a levantarte, sin moverte. Esto 'bloquea' la posición del tronco."
  },

  "Pullover polea": {
    musculo: "Dorsal",
    seccion: "Estiramiento y Contracción",
    hacer: "Agarre prono, <b>brazos casi rectos</b> (ligera flexión de codo). El movimiento debe ser generado <b>únicamente desde el hombro</b> (extensión del hombro), llevando la barra desde arriba hasta la cadera. Vuelve lentamente permitiendo un estiramiento profundo.",
    noHacer: "<b>No flexiones demasiado el codo</b>; el codo debe permanecer prácticamente fijo. No permitas que el abdomen se extienda (arquearse) al bajar.",
    trucos: "<b>Inclina ligeramente el torso hacia adelante</b> (15°-20°) y mantente firme. Esto facilita un rango de movimiento más amplio y un <b>estiramiento brutal del dorsal</b> en la posición superior."
  },

  "Reverse fly máquina": {
    musculo: "Deltoides posterior",
    seccion: "Posterior",
    hacer: "Siéntate mirando hacia el respaldo, <b>pecho pegado</b> al soporte. <b>Agarre neutro o prono</b>. Abre los brazos en un arco amplio, concentrándote en <b>separar los codos</b> hasta que estén paralelos al torso.",
    noHacer: "<b>No utilices el trapecio</b> para encoger los hombros. Evita separar el pecho del soporte para usar impulso.",
    trucos: "Piensa en <b>separar los codos, no en mover las manos</b>. Esto te ayuda a dirigir el movimiento desde el hombro posterior. Reduce ligeramente el peso y <b>pausa un segundo</b> al abrir completamente."
  },

  // --- EJERCICIOS FALTANTES DE ESPALDA/HOMBRO ---
  "Face pull": {
    musculo: "Deltoides posterior / Trapecio medio",
    seccion: "Hombro sano (Manguito rotador)",
    hacer: "Utiliza cuerda y polea alta, agarre a dos manos. <b>Tira de la cuerda hacia la cara</b>, enfocándote en **rotar externamente los hombros** al finalizar el tirón. Los codos deben apuntar hacia afuera.",
    noHacer: "No tires únicamente con los brazos. <b>No permitas que los codos caigan</b> por debajo del nivel de los hombros.",
    trucos: "Al finalizar el movimiento, imagina que quieres **tocar la pared de atrás con los codos**. Esto maximiza la rotación externa y la activación del manguito rotador y deltoide posterior."
  },

  "Pájaros mancuernas": {
    musculo: "Deltoides posterior",
    seccion: "Posterior",
    hacer: "Siéntate en el borde del banco, inclina el torso hasta que esté **casi paralelo al suelo** (o apoya el pecho en un banco inclinado). <b>Eleva las mancuernas lateralmente</b>, liderando con los codos, hasta la altura de los hombros.",
    noHacer: "<b>No balancees el cuerpo</b>. Evita convertirlo en un encogimiento de trapecio, manteniendo los hombros lejos de las orejas.",
    trucos: "Mantén el **agarre neutro** (palmas hacia atrás) para priorizar el deltoide posterior. Baja el peso lentamente (fase excéntrica) para mejorar el control y el estímulo."
  },


  // ======= BRAZO 💪 =======
  "Curl bíceps": {
    musculo: "Bíceps",
    seccion: "General (Cabeza Larga y Corta)",
    hacer: "Mantén el <b>codo fijo</b> pegado al costado. Realiza la subida con un agarre prono y <b>supina (gira la muñeca) al subir</b>, de forma que las palmas miren al techo en la contracción. Baja controladamente.",
    noHacer: "<b>No balancees el torso</b> para generar impulso. No permitas que los codos se muevan hacia adelante.",
    trucos: "<b>Aprieta el bíceps fuerte arriba durante dos segundos</b>; esto maximiza la activación y la conexión mente-músculo. Al bajar, resiste el peso lentamente para enfatizar la fase excéntrica."
  },

  "Curl concentrado": {
    musculo: "Bíceps",
    seccion: "Cabeza corta (Pico)",
    hacer: "<b>Codo fijo en la parte interna del muslo</b>, actuando como un soporte. Realiza una <b>subida muy lenta y controlada</b>. Enfócate en la contracción máxima en la parte superior.",
    noHacer: "<b>No uses ningún impulso</b> o rebote. Evita levantar el codo del soporte de la pierna.",
    trucos: "Al finalizar el recorrido, <b>gira la mancuerna ligeramente hacia el dedo meñique</b> (supinación forzada) para una activación máxima de la cabeza corta del bíceps."
  },

  "Curl Scott": {
    musculo: "Bíceps",
    seccion: "Aislamiento (Preacher Curl)",
    hacer: "Ajusta la altura del banco para que la axila esté sobre el borde superior. <b>Mantén el brazo fijo</b> en la almohadilla. Realiza un rango de movimiento completo, subiendo y bajando de forma controlada.",
    noHacer: "<b>No levantes el codo</b> o la axila del soporte en ningún momento. Evita la hiperextensión en la parte baja del movimiento.",
    trucos: "Mantén la <b>muñeca en posición neutra</b> (recta) durante todo el curl para evitar sobrecargar los flexores del antebrazo y dirigir la tensión al bíceps."
  },

  "Curl martillo": {
    musculo: "Bíceps/Antebrazo",
    seccion: "Braquiorradial y Braquial",
    hacer: "<b>Agarre neutro (palmas enfrentadas)</b>. Mantén el codo pegado al costado y realiza el curl de forma estricta. Este ejercicio desarrolla el grosor del brazo.",
    noHacer: "<b>No gires el torso</b> ni te inclines para ayudar el movimiento.",
    trucos: "Para enfatizar más el braquial y el braquiorradial, piensa en <b>elevar el codo ligeramente hacia adelante</b> al subir. Esto cambia el ángulo y maximiza la tensión en esos músculos."
  },

  "Tríceps en polea": {
    musculo: "Tríceps",
    seccion: "General (Cabeza Lateral)",
    hacer: "<b>Codos pegados al cuerpo</b> y hombros 'bloqueados' hacia atrás y abajo. La extensión debe ser <b>estricta y completa</b>, de arriba hacia abajo. Solo se mueve el antebrazo.",
    noHacer: "<b>No separes los codos</b> del torso. Evita flexionar la muñeca (muñeca 'rota').",
    trucos: "<b>Inclínate ligeramente hacia adelante</b> (como un esquí) y bloquea los hombros y codos firmemente hacia atrás. Esto aísla el tríceps y permite una extensión más potente."
  },

  "Tríceps cuerda 1 mano": {
    musculo: "Tríceps",
    seccion: "Aislamiento (Énfasis en Lateral)",
    hacer: "<b>Agarre de una sola mano</b> en la cuerda. <b>Extiende el brazo al máximo</b> hacia abajo y hacia afuera, separando la cuerda al final. Control total del rango.",
    noHacer: "<b>No gires el tronco</b> para ayudar la extensión. Evita el balanceo del brazo.",
    trucos: "Al extender el codo, <b>separa ligeramente la mano</b> y realiza una rotación externa de la muñeca. Esto ayuda a enfatizar la cabeza lateral y el punto de 'herradura' del tríceps."
  },


  // ======= PIERNA 🦵 =======
  "Prensa de piernas": {
    musculo: "Pierna",
    seccion: "Cuádriceps (Énfasis general)",
    hacer: "<b>Mantén la zona lumbar completamente pegada</b> al respaldo; si se despega, has bajado demasiado. Las rodillas deben estar <b>alineadas con las puntas de los pies</b>. Baja hasta un ángulo de 90° o justo antes de que la lumbar se despegue. Empuja hacia arriba.",
    noHacer: "<b>No bloquees las rodillas</b> al final del recorrido (mantén una microflexión). No permitas que las rodillas 'colapsen' hacia dentro.",
    trucos: "Para enfocar más en los <b>cuádriceps</b>, coloca los pies ligeramente más abajo en la plataforma y concéntrate en <b>empujar con la parte externa del pie</b>."
  },

  "Prensa sumo": {
    musculo: "Glúteo/Aductores",
    seccion: "Lateral/Interna",
    hacer: "<b>Pies en la parte alta y ancha de la plataforma</b>, con las <b>puntas apuntando hacia afuera</b> (rotación externa). Baja controlado y empuja con los talones.",
    noHacer: "<b>No dejes que las rodillas colapsen</b> hacia dentro; deben seguir la dirección de las puntas de los pies.",
    trucos: "Imagina que estás empujando el suelo <b>separándolo con los talones</b>: esto activa el glúteo medio y los aductores de forma brutal, ideal para el desarrollo lateral y de la parte interna del muslo."
  },

  "Extensión cuádriceps": {
    musculo: "Cuádriceps",
    seccion: "Recto Femoral y Vasto Interno",
    hacer: "<b>Alinea la rodilla con el eje de rotación de la máquina</b>. Realiza la extensión de la rodilla de forma controlada hasta la máxima contracción. Mantén la cadera pegada al asiento.",
    noHacer: "<b>No hagas tirones rápidos</b> en la parte superior. Evita levantar el cuerpo del asiento.",
    trucos: "<b>Pausa de 1–2 segundos en la máxima extensión</b> para crear una contracción isométrica. Piensa en activar el <b>vasto interno</b> (la forma de lágrima sobre la rodilla) al apretar la pierna."
  },

  "Extensión cuádriceps isométrica": {
    musculo: "Cuádriceps",
    seccion: "Vasto Medial (Acortamiento)",
    hacer: "Realiza la extensión normal, pero <b>mantén la contracción máxima arriba durante un tiempo predefinido</b> (ej. 3–5 segundos) antes de la fase excéntrica lenta.",
    noHacer: "No relajes de golpe la tensión en la fase isométrica.",
    trucos: "Mientras mantienes la contracción, <b>activa el core (abdomen)</b> y empuja las manos contra el asiento. Esta co-contracción aumenta la estabilidad y la intensidad del vasto medial (el músculo de la 'lágrima')."
  },

  "Curl femoral": {
    musculo: "Femoral",
    seccion: "General (Sentado o Tumbado)",
    hacer: "<b>Mantén la cadera neutra</b> y pegada al soporte. Lleva el <b>talón hacia el glúteo</b> en un movimiento lento y concentrado. Controla la fase de estiramiento.",
    noHacer: "<b>No arquees la zona lumbar</b> (hiperextensión) para iniciar o terminar la repetición; esto indica que el peso es demasiado alto.",
    trucos: "<b>Aprieta los glúteos</b> antes y durante el movimiento. Esto bloquea la cadera y desactiva la participación de otros músculos, aislando de forma estricta el femoral."
  },

  "Curl femoral sentado": {
    musculo: "Femoral",
    seccion: "General (Máximo Estiramiento)",
    hacer: "<b>Alinea la rodilla con el eje de rotación</b>. Realiza un recorrido completo, permitiendo el estiramiento máximo del femoral en la fase excéntrica.",
    noHacer: "<b>No rebotes</b> al iniciar el movimiento desde la posición de estiramiento.",
    trucos: "<b>Inclina ligeramente el torso hacia adelante</b> al inicio de la repetición. Esta flexión de cadera permite un <b>mejor estiramiento inicial</b> del isquiotibial, lo que resulta en una contracción final más poderosa."
  },

  "Curl femoral 1 pierna": {
    musculo: "Femoral",
    seccion: "Aislamiento y Equilibrio",
    hacer: "Realiza el rango completo con <b>control total</b> de la máquina. Enfócate en la conexión mente-músculo y evita cualquier compensación del tronco o cadera.",
    noHacer: "<b>No hagas compensaciones con la cadera</b> (rotación o levantamiento) para ayudarte a mover el peso.",
    trucos: "Mantén la <b>planta del pie firme</b> contra el soporte o cojín para evitar rotaciones no deseadas en el tobillo y asegurar un enfoque directo en el femoral."
  },

  "Hack machine": {
    musculo: "Cuádriceps",
    seccion: "Anterior (Vasto Lateral)",
    hacer: "<b>Coloca los pies más abajo</b> en la plataforma (cerca del borde) para un mayor énfasis en el cuádriceps. <b>Baja controlado</b> (al menos 90° de flexión) y mantén la espalda totalmente apoyada.",
    noHacer: "<b>No bloquees las rodillas</b> arriba. No permitas que la espalda se despegue o se redondee.",
    trucos: "Mantén las <b>rodillas alineadas con las puntas de los pies</b>, empujándolas activamente hacia afuera (separándolas) al bajar. Esto protege las rodillas y activa mejor los cuádriceps."
  },

  "Prensa pies juntos arriba": {
    musculo: "Glúteo/Femoral",
    seccion: "Posterior (Cadera)",
    hacer: "<b>Pies juntos y colocados en la parte más alta</b> de la plataforma. Esto maximiza la flexión de cadera y el estiramiento de los femorales y glúteos. Baja hasta el punto donde la lumbar no se despegue.",
    noHacer: "<b>No levantes la zona lumbar</b> del respaldo. No rebotes.",
    trucos: "Imagina que estás empujando la plataforma <b>principalmente con los talones</b>. Esto dirige el esfuerzo hacia los glúteos y los isquiotibiales, en lugar de los cuádriceps."
  },

  "Zancadas mancuernas": {
    musculo: "Glúteo/Cuádriceps",
    seccion: "Funcional",
    hacer: "Da un <b>paso largo</b> para un enfoque en el glúteo. La rodilla de la pierna trasera debe bajar verticalmente hacia el suelo, y la <b>rodilla delantera debe estar alineada con el pie</b>. Mantén el torso erguido.",
    noHacer: "<b>No te 'hundas' hacia adelante</b>; el movimiento debe ser vertical. No permitas que la rodilla delantera se meta hacia dentro.",
    trucos: "Al subir, <b>empuja fuerte con el talón delantero</b> y concéntrate en apretar el glúteo de esa pierna. Esto maximiza la activación glútea en el ascenso."
  },

  "Step-up banco": {
    musculo: "Glúteo/Cuádriceps",
    seccion: "Funcional (Unilateral)",
    hacer: "Utiliza un banco cuya altura permita una rodilla a 90°. <b>El impulso debe provenir exclusivamente de la pierna que pisa el banco</b>. Baja lentamente y controla el descenso.",
    noHacer: "<b>No uses la pierna de abajo para dar impulso</b> o 'rebotar'. Evita el balanceo del cuerpo.",
    trucos: "<b>Inclínate muy ligeramente hacia delante</b> con el torso. Esto alinea mejor la cadera y te permite activar más el glúteo en el movimiento de ascenso."
  },

  "Abducción máquina": {
    musculo: "Glúteo medio",
    seccion: "Lateral (Estabilizador)",
    hacer: "<b>Inclínate ligeramente hacia adelante</b> y sujeta firmemente los agarres. <b>Controla la apertura y el retorno</b>; no permitas que las placas se toquen.",
    noHacer: "<b>No te inclines excesivamente</b> hacia adelante o hacia atrás; un ligero ángulo es suficiente. Evita soltar el peso de golpe.",
    trucos: "<b>Inclínate un poco hacia atrás</b> y sujeta el asiento; esto maximiza el rango de movimiento. Mantén una <b>pausa de 1-2 segundos</b> en la máxima apertura para enfatizar el glúteo medio."
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