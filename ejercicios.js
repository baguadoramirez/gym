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
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "Media (Esternal)",
    hacer: "<b>Configura el asiento</b> para que los agarres estén a la altura del medio pecho. <b>Retrae y deprime las escápulas</b> firmemente contra el respaldo. Inicia el empuje desde el pecho (no desde los hombros), manteniendo los codos en un ángulo de 45°-60° respecto al torso. <b>Controla la fase negativa (excéntrica)</b>, volviendo a la posición inicial lentamente (3-4 segundos).",
    noHacer: "<b>No permitas que los hombros se adelanten</b> (protacción escapular) al final del recorrido. No arquees la zona lumbar de forma excesiva. Evita el bloqueo total del codo para mantener la tensión constante.",
    trucos: "Adopta el *Mind-Muscle Connection* (conexión mente-músculo): imagina que intentas <b>'abrazar' la máquina</b>, pensando en juntar los bíceps o los codos en lugar de solo empujar con las manos. Esto maximiza la contracción pectoral."
  },

  "Press inclinado mancuernas": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "Superior (Clavicular)",
    hacer: "Banco ajustado entre <b>30° y 45°</b> (cuanto más bajo, mejor para aislar el pectoral superior). Mantén las <b>escápulas retraídas y pegadas</b> al banco. Baja las mancuernas de forma controlada hacia la parte alta del pecho, con los codos a unos 45° del torso. El movimiento debe ser en <b>arco de dentro a fuera</b> en la bajada.",
    noHacer: "<b>No eleves los hombros</b> hacia las orejas. Evita que las mancuernas 'choquen' abajo o 'reboten'. No permitas que el ángulo del codo se abra a 90°, ya que estresa la articulación del hombro.",
    trucos: "Piensa en empujar las mancuernas <b>'hacia arriba y ligeramente hacia el centro'</b>. Mantén el <b>pecho 'mirando' al techo</b> durante todo el set, esto asegura la activación del pectoral superior y una buena retracción escapular."
  },

  "Press inclinado barra": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "Superior (Clavicular)",
    hacer: "Banco inclinado a 30°–45°. <b>Escápulas retraídas</b> y pies firmes. Baja la barra hacia la parte alta del pecho y empuja en línea vertical.",
    noHacer: "<b>No abras los codos</b> en exceso ni rebotes la barra. Evita perder la retracción escapular.",
    trucos: "Usa un <b>agarre medio</b> y controla la excéntrica 2–3 segundos para maximizar el trabajo del pectoral superior."
  },

  "Aperturas en máquina/polea": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "General (Énfasis en estiramiento)",
    hacer: "<b>Fija los codos en una ligera flexión</b> (semiflexionados) y mantén ese ángulo constante. Abre en un arco amplio hasta sentir un <b>fuerte estiramiento</b> del pectoral. Cierra el movimiento en el centro, apretando la parte interna del pecho.",
    noHacer: "<b>No conviertas el movimiento en un 'press'</b> extendiendo o flexionando los codos durante el recorrido. No uses un peso tan alto que comprometa el rango de movimiento completo.",
    trucos: "Imagina que <b>rodeas un barril</b> para mantener la forma de arco. Al cerrar, <b>haz una pausa de 1 segundo</b> apretando el pectoral y piensa en juntar tus bíceps para una contracción máxima. En polea, cruza las manos ligeramente para una activación final más intensa."
  },

  "Pec deck": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "General (Aislamiento)",
    hacer: "<b>Ajusta el asiento</b> para que los antebrazos/quebrados queden a la altura del medio pecho. <b>Escápulas retraídas</b> contra el respaldo y pecho elevado. Cierra los brazos en un arco controlado hasta juntar los antebrazos/agarres, manteniendo una ligera flexión de codo.",
    noHacer: "<b>No encorves los hombros</b> ni pierdas la retracción escapular. No conviertas el movimiento en un press empujando con los tríceps. Evita acortar el recorrido con pesos excesivos.",
    trucos: "Piensa en <b>juntar los codos</b> en vez de las manos. Haz una <b>pausa de 1 segundo</b> en el cierre para maximizar la contracción interna del pectoral."
  },

  "Press declinado mancuernas": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "Inferior (Abdominal)",
    hacer: "Asegura bien los pies en el soporte. <b>Controla la bajada</b> de las mancuernas hacia la parte más baja del pecho o superior del abdomen. Mantén una <b>retracción escapular muy estricta</b> para proteger los hombros.",
    noHacer: "No dejes caer las mancuernas rápidamente. Evita un exceso de 'rebote' o impulso al final de la fase excéntrica.",
    trucos: "Para una máxima estabilidad, <b>piensa en empujar 'hacia arriba y ligeramente hacia atrás'</b> (en la dirección de la cabeza) y mantén las muñecas completamente firmes y alineadas con los antebrazos."
  },

  "Press declinado barra": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "Inferior (Abdominal)",
    hacer: "Asegura los pies en el soporte. Baja la barra hacia la parte baja del pecho con <b>control total</b> y empuja en vertical.",
    noHacer: "<b>No rebotes la barra</b> ni pierdas la retracción escapular. Evita abrir los codos demasiado.",
    trucos: "Un <b>agarre ligeramente más cerrado</b> puede proteger los hombros y mantener la tensión en el pectoral inferior."
  },

  "Cruces desde abajo": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "Superior (Clavicular)",
    hacer: "Inicia con las poleas en la posición más baja. Da un paso adelante, inclínate ligeramente y <b>mantén el codo semiflexionado</b>. Sube y cruza las manos por delante del pecho hasta la altura de los hombros o cara.",
    noHacer: "<b>No uses los bíceps</b> para tirar; el movimiento debe generarse por la contracción del pectoral superior. Evita arquear la columna o balancear el torso.",
    trucos: "Piensa en <b>juntar los bíceps a la altura de la barbilla</b> o los ojos. <b>Aprieta el pecho dos segundos</b> en el punto álgido del cruce para enfatizar el vientre superior."
  },

  "Press máquina vertical": {
    musculo: "Pectoral",
    grupo: "Pecho",
    seccion: "Media (Esternal)",
    hacer: "<b>Ajusta el asiento de forma crítica</b> para que las asas o el agarre queden exactamente a la altura del medio pecho. Realiza un <b>empuje limpio y recto</b> hacia adelante. Mantén los hombros deprimidos y el pecho elevado.",
    noHacer: "<b>No bloquees los codos</b> al final del recorrido. No permitas que el pecho se hunda durante el movimiento.",
    trucos: "Experimenta con la altura del asiento: si el agarre queda a la altura del pecho, se enfoca más en la sección media. Si está ligeramente más bajo, puedes sentir más la activación superior. <b>Bloquea los pies firmemente en el suelo</b> para generar más estabilidad y fuerza."
  },
  
  // --- EJERCICIOS FALTANTES DE PECHO ---
  "Aperturas inclinadas": {
    musculo: "Pectoral",
    grupo: "Pecho",
    seccion: "Superior (Estiramiento)",
    hacer: "Banco ajustado a 30-45°. <b>Brazos semiflexionados</b>, desciende las mancuernas a los lados lentamente, sintiendo el estiramiento en la parte alta del pecho. Junta las mancuernas en un arco amplio por encima del pecho.",
    noHacer: "No dejes caer los codos por debajo del nivel del banco. <b>No arquees la lumbar</b> al descender el peso.",
    trucos: "Enfócate en <b>separar las manos en la fase excéntrica</b> (bajando) para maximizar el estiramiento del haz clavicular. Piensa en juntar los bíceps, no las manos."
  },

  "Press neutral grip mancuernas": {
    musculo: "Pectoral",
    grupo: "Pecho",
    seccion: "Media/Esternal (Seguridad)",
    hacer: "Agarre neutro (palmas enfrentadas). Esto pone los hombros en una posición más segura. <b>Empuja en un plano vertical</b> y mantén los codos ligeramente más pegados al torso (30°-45°).",
    noHacer: "No separes los codos en exceso. <b>No bloquees la articulación</b> completamente arriba.",
    trucos: "Ideal para el desarrollo de la **parte interna del pectoral**. En el punto superior, intenta 'raspar' las mancuernas una contra otra para asegurar la contracción central."
  },


  // ======= HOMBRO 🎯 =======
  "Press militar mancuernas": {
    musculo: "Deltoides",
    grupo: "Hombros",
    seccion: "Anterior",
    hacer: "Siéntate con la espalda recta o con un ligero apoyo que permita un <b>patrón vertical de empuje</b>. <b>Activa el abdomen (core)</b> para mantener la columna neutra. Sube las mancuernas verticalmente, ligeramente por delante de la cabeza.",
    noHacer: "<b>No arquees la espalda</b> (hiperextensión lumbar) en exceso para terminar la repetición. Evita el *valgus* de codo (que el codo se abra mucho hacia los lados) al bajar.",
    trucos: "Al subir, realiza una <b>ligera rotación externa</b> (como si quisieras acercar las palmas entre sí) para asegurar un mejor 'empaquetamiento' del hombro y mayor seguridad articular."
  },

  "Press militar barra": {
    musculo: "Deltoides",
    grupo: "Hombros",
    seccion: "Anterior",
    hacer: "De pie o sentado, agarre ligeramente más ancho que hombros. Inicia con la barra a la altura del mentón y <b>empuja verticalmente</b> manteniendo el core firme.",
    noHacer: "<b>No arquees la zona lumbar</b>. Evita empujar la barra muy delante de la cabeza.",
    trucos: "Piensa en <b>meter la cabeza entre los brazos</b> al final para alinear hombro y codo."
  },

  "Press Arnold": {
    musculo: "Deltoides",
    grupo: "Hombros",
    seccion: "Completo (Anterior y Lateral)",
    hacer: "<b>Inicia con las palmas mirando hacia ti</b> (agarre supino). A medida que empujas, <b>rota las mancuernas 180°</b> hasta que las palmas miren hacia adelante (agarre prono) en la parte superior. Controla la rotación y el recorrido completo.",
    noHacer: "<b>No gires rápido ni de forma brusca</b>; el movimiento debe ser fluido y controlado. No cargues demasiado peso; este ejercicio se beneficia de un control estricto.",
    trucos: "El movimiento se divide en dos: Press + Elevación frontal (rotación). Piensa en <b>'mostrar' los codos al frente</b> al inicio y terminar <b>'mostrando' las palmas al techo</b> al final. Esto añade tiempo bajo tensión al deltoides anterior."
  },

  "Elevaciones laterales": {
    musculo: "Deltoides",
    grupo: "Hombros",
    seccion: "Lateral (Medial)",
    hacer: "Mantén una ligera flexión de codo constante. <b>Eleva con el codo</b>, detente cuando el brazo esté paralelo al suelo (a la altura del hombro). La <b>muñeca debe estar relajada</b>. Baja de forma controlada (fase excéntrica lenta).",
    noHacer: "<b>No uses impulso o balanceo del torso</b>. Evita elevar el trapecio (encogimiento de hombros) para iniciar o completar el movimiento. No superes la altura del hombro.",
    trucos: "Piensa en <b>verter agua de un jarro</b>: la parte del <b>codo debe estar 'más alta' que la mano</b>. Esto asegura que el deltoides lateral, y no el anterior, sea el motor principal."
  },

  "Elevaciones laterales a una mano": {
    musculo: "Deltoides",
    grupo: "Hombros",
    seccion: "Lateral (Unilateral)",
    hacer: "De pie con una mancuerna, <b>eleva el brazo en el plano del hombro</b> hasta quedar paralelo al suelo. Controla la bajada.",
    noHacer: "<b>No balancees el tronco</b> ni subas por encima del hombro.",
    trucos: "Apoya la mano libre en una superficie para <b>estabilizar el torso</b> y aislar mejor el deltoide."
  },

  "Elevaciones frontales": {
    musculo: "Deltoides",
    grupo: "Hombros",
    seccion: "Anterior",
    hacer: "Realiza el movimiento con agarre prono (palmas hacia abajo), subiendo la mancuerna o barra <b>controladamente hasta la altura del hombro</b> (90° de flexión). Mantén el resto del cuerpo estable.",
    noHacer: "No permitas el <b>balanceo del torso</b> o *kipping* para ayudarte a subir el peso. No superes la altura del hombro, ya que pierde efectividad y puede irritar la articulación.",
    trucos: "Realiza el movimiento <b>ligeramente en diagonal hacia dentro</b> (plano escapular), no directamente hacia adelante. Esto respeta la mecánica natural del hombro y lo hace más seguro y efectivo."
  },

  "Elevaciones laterales polea": {
    musculo: "Deltoides",
    grupo: "Hombros",
    seccion: "Lateral (Medial)",
    hacer: "<b>Colócate frente a la polea</b> (si el cable cruza por detrás) o lateralmente. Inicia con <b>tensión continua desde el punto más bajo</b>. Eleva el peso <b>liderando con el codo</b> y detente a la altura del hombro.",
    noHacer: "<b>No permitas que el trapecio se active</b> al encoger los hombros. Evita inclinar el torso excesivamente.",
    trucos: "Para una activación óptima, mantén el <b>cable detrás del cuerpo</b> (si te colocas frente a la polea) o el agarre <b>cruzado</b> (si estás de lado). Esto crea un ángulo de resistencia más limpio desde el inicio."
  },


  // ======= ESPALDA ⛰️ =======
  "Jalón al pecho": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "General (Ancho)",
    hacer: "<b>Saca el pecho</b> y mantén una ligera inclinación hacia atrás (10°-15°). Tira de la barra llevando los <b>codos hacia abajo y hacia atrás</b>, concentrándote en la contracción de la espalda. La barra debe llegar a la clavícula o parte alta del pecho.",
    noHacer: "<b>No tires excesivamente con los bíceps</b>; concéntrate en la retracción escapular y la acción del dorsal. Evita el balanceo excesivo o el impulso.",
    trucos: "Imagina que intentas llevar los <b>codos hacia los bolsillos traseros</b> del pantalón. Esto redirige el esfuerzo al dorsal ancho y minimiza la participación de los brazos."
  },

  "Jalón supino": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Inferior (Grosor)",
    hacer: "Utiliza un <b>agarre supinado (palmas hacia ti)</b>, idealmente un poco más cerrado que el ancho de hombros. Mantén el <b>pecho arriba</b> y tira la barra hacia la parte baja del esternón. <b>Enfatiza la retracción escapular</b>.",
    noHacer: "<b>No permitas que los hombros se encierren</b> o roten hacia adelante. Evita arquear la espalda excesivamente al final del recorrido.",
    trucos: "El agarre supino recluta más bíceps, así que para activar más el dorsal, usa un <b>agarre ligeramente más cerrado</b> que la distancia biacromial (ancho de hombros). Concéntrate en la <b>depresión y retracción escapular</b>."
  },

  "Jalón estrecho triángulo": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Profundo (Central)",
    hacer: "Utiliza el agarre V (triángulo). <b>Pecho arriba</b>, realiza un tirón vertical limpio hacia el esternón bajo o el abdomen superior. <b>Retrae y deprime las escápulas</b> al final del movimiento.",
    noHacer: "<b>No te eches demasiado hacia atrás</b> ni te balancees; el torso debe moverse ligeramente, pero no debe ser el motor. Evita mirar hacia arriba, lo que podría desalinear el cuello.",
    trucos: "Mantén una <b>mirada neutra (recta)</b> y la cabeza alineada. En la fase excéntrica, <b>permite que las escápulas se estiren</b> ligeramente hacia arriba para un rango de movimiento completo y un mayor estiramiento del dorsal."
  },

  "Remo polea sentado": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Media (Grosor)",
    hacer: "<b>Inicia el movimiento con la retracción escapular</b> (juntar las paletas de la espalda), y luego continúa el tirón con los brazos. Tira del agarre hacia el abdomen o el esternón. <b>Extiende el torso al inicio</b> (permitiendo el estiramiento) y vuelve a la vertical al tirar.",
    noHacer: "<b>No redondees la espalda</b> (cifosis torácica) al soltar el peso. Evita tirar solo con los brazos, descuidando la espalda.",
    trucos: "<b>Aprieta las escápulas dos segundos atrás</b> en la máxima contracción. Para un enfoque en la espalda alta/media (romboides), apunta el agarre hacia el pecho; para dorsal, apúntalo hacia el abdomen."
  },

  "Remo máquina pecho apoyado": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Media (Aislamiento)",
    hacer: "<b>Configura la altura del asiento</b> para que el agarre quede alineado con el torso. Al estar el pecho apoyado, se <b>aísla mejor el dorsal</b> al eliminar la inestabilidad del tronco. <b>Tirón limpio y estricto</b>.",
    noHacer: "No acortes el recorrido. Evita levantar el cuerpo del soporte con el impulso.",
    trucos: "<b>Juega con la altura del asiento</b>: si el tirón es más vertical (agarre bajo), enfocas más en el dorsal. Si el tirón es más horizontal (agarre alto), enfocas más en los romboides y trapecio medio."
  },

  "Remo en máquina guiada": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Media (Grosor)",
    hacer: "Ajusta el asiento para que el agarre quede a la altura del abdomen. <b>Inicia con la retracción escapular</b> y tira llevando los codos hacia atrás de forma controlada.",
    noHacer: "<b>No redondees la espalda</b>. Evita usar impulso con el torso.",
    trucos: "Mantén el pecho abierto y <b>pausa 1 segundo</b> en la contracción para sentir la espalda media."
  },

  "Remo bajo en máquina": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Inferior (Grosor)",
    hacer: "Siéntate con el pecho estable y tira del agarre <b>hacia el abdomen bajo</b>, manteniendo los codos cerca del cuerpo.",
    noHacer: "<b>No te eches hacia atrás</b> en exceso al tirar. Evita encoger los hombros.",
    trucos: "Piensa en llevar los <b>codos a los bolsillos</b> para activar más el dorsal."
  },

  "Jalón en máquina convergente": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Ancho",
    hacer: "Ajusta el asiento y sujeta los agarres. <b>Tira hacia el pecho</b> con un movimiento convergente, manteniendo el pecho elevado.",
    noHacer: "<b>No uses impulso</b> ni balanceo. Evita llevar los codos demasiado hacia atrás.",
    trucos: "Mantén una ligera inclinación hacia atrás y <b>deprime las escápulas</b> al iniciar el tirón."
  },

  "Jalón unilateral en máquina": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Ancho (Unilateral)",
    hacer: "Sujeta un agarre y tira con un solo brazo hacia el costado del pecho, <b>manteniendo el torso estable</b>.",
    noHacer: "<b>No gires el tronco</b> para ayudar al tirón. Evita encoger el hombro.",
    trucos: "Concéntrate en <b>llevar el codo hacia abajo</b> y pausa en la contracción para igualar ambos lados."
  },

  "Pullover en máquina": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Estiramiento",
    hacer: "Ajusta el respaldo y sujeta los agarres. Con <b>codos ligeramente flexionados</b>, lleva los brazos hacia abajo en arco hasta la cadera.",
    noHacer: "<b>No flexiones los codos</b> en exceso. Evita arquear la espalda.",
    trucos: "Mantén el pecho alto y busca un <b>estiramiento profundo</b> del dorsal en la parte alta."
  },

  "Remo polea alta ancho": {
    musculo: "Espalda media",
    grupo: "Espalda",
    seccion: "Romboides y Trapecio Medio",
    hacer: "Utiliza un agarre más ancho y un cable en posición alta. Realiza el tirón con los <b>codos abiertos</b> y dirigiéndolos hacia la parte alta del torso o la cara (como un *Face Pull* horizontal). <b>Enfatiza la retracción escapular</b>.",
    noHacer: "<b>No conviertas el ejercicio en un jalón vertical</b> bajando el agarre hacia el pecho. El codo debe permanecer más abierto.",
    trucos: "Mantén los <b>codos por encima de las manos</b> durante la mayor parte del recorrido. Esto asegura que el plano de movimiento se centre en la retracción horizontal, maximizando la activación de la espalda media."
  },

  "Remo inclinado a dos manos": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Media-Baja (Grosor)",
    hacer: "<b>Mantén el torso inclinado (casi paralelo al suelo)</b>, con la espalda recta y las rodillas ligeramente flexionadas. Tira la barra o mancuernas <b>hacia la cadera</b> (si quieres más dorsal) o hacia el abdomen (si quieres más espalda media).",
    noHacer: "<b>No encorvar la espalda baja (zona lumbar)</b>; mantén la posición inicial. Evita el balanceo excesivo.",
    trucos: "Para una máxima estabilidad del core y la espalda, <b>empuja el suelo con los talones</b> como si fueras a levantarte, sin moverte. Esto 'bloquea' la posición del tronco."
  },

  "Pullover polea": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Estiramiento y Contracción",
    hacer: "Agarre prono, <b>brazos casi rectos</b> (ligera flexión de codo). El movimiento debe ser generado <b>únicamente desde el hombro</b> (extensión del hombro), llevando la barra desde arriba hasta la cadera. Vuelve lentamente permitiendo un estiramiento profundo.",
    noHacer: "<b>No flexiones demasiado el codo</b>; el codo debe permanecer prácticamente fijo. No permitas que el abdomen se extienda (arquearse) al bajar.",
    trucos: "<b>Inclina ligeramente el torso hacia adelante</b> (15°-20°) y mantente firme. Esto facilita un rango de movimiento más amplio y un <b>estiramiento brutal del dorsal</b> en la posición superior."
  },

  "Reverse fly máquina": {
    musculo: "Deltoides posterior",
    grupo: "Hombros",
    seccion: "Posterior",
    hacer: "Siéntate mirando hacia el respaldo, <b>pecho pegado</b> al soporte. <b>Agarre neutro o prono</b>. Abre los brazos en un arco amplio, concentrándote en <b>separar los codos</b> hasta que estén paralelos al torso.",
    noHacer: "<b>No utilices el trapecio</b> para encoger los hombros. Evita separar el pecho del soporte para usar impulso.",
    trucos: "Piensa en <b>separar los codos, no en mover las manos</b>. Esto te ayuda a dirigir el movimiento desde el hombro posterior. Reduce ligeramente el peso y <b>pausa un segundo</b> al abrir completamente."
  },

  // --- EJERCICIOS FALTANTES DE ESPALDA/HOMBRO ---
  "Face pull": {
    musculo: "Deltoides posterior / Trapecio medio",
    grupo: "Hombros",
    seccion: "Hombro sano (Manguito rotador)",
    hacer: "Utiliza cuerda y polea alta, agarre a dos manos. <b>Tira de la cuerda hacia la cara</b>, enfocándote en **rotar externamente los hombros** al finalizar el tirón. Los codos deben apuntar hacia afuera.",
    noHacer: "No tires únicamente con los brazos. <b>No permitas que los codos caigan</b> por debajo del nivel de los hombros.",
    trucos: "Al finalizar el movimiento, imagina que quieres **tocar la pared de atrás con los codos**. Esto maximiza la rotación externa y la activación del manguito rotador y deltoide posterior."
  },

  "Pájaros mancuernas": {
    musculo: "Deltoides posterior",
    grupo: "Hombros",
    seccion: "Posterior",
    hacer: "Siéntate en el borde del banco, inclina el torso hasta que esté **casi paralelo al suelo** (o apoya el pecho en un banco inclinado). <b>Eleva las mancuernas lateralmente</b>, liderando con los codos, hasta la altura de los hombros.",
    noHacer: "<b>No balancees el cuerpo</b>. Evita convertirlo en un encogimiento de trapecio, manteniendo los hombros lejos de las orejas.",
    trucos: "Mantén el **agarre neutro** (palmas hacia atrás) para priorizar el deltoide posterior. Baja el peso lentamente (fase excéntrica) para mejorar el control y el estímulo."
  },


  // ======= BRAZO 💪 =======
  "Curl bíceps": {
    musculo: "Bíceps",
    grupo: "Brazos",
    seccion: "General (Cabeza Larga y Corta)",
    hacer: "Mantén el <b>codo fijo</b> pegado al costado. Realiza la subida con un agarre prono y <b>supina (gira la muñeca) al subir</b>, de forma que las palmas miren al techo en la contracción. Baja controladamente.",
    noHacer: "<b>No balancees el torso</b> para generar impulso. No permitas que los codos se muevan hacia adelante.",
    trucos: "<b>Aprieta el bíceps fuerte arriba durante dos segundos</b>; esto maximiza la activación y la conexión mente-músculo. Al bajar, resiste el peso lentamente para enfatizar la fase excéntrica."
  },

  "Curl alterno con mancuernas": {
    musculo: "Bíceps",
    grupo: "Brazos",
    seccion: "General (Unilateral)",
    hacer: "De pie con una mancuerna en cada mano. Alterna el curl, <b>supinando</b> la muñeca al subir y manteniendo el codo pegado al costado.",
    noHacer: "<b>No gires el torso</b> ni te balances para ayudar el movimiento.",
    trucos: "Pausa 1 segundo arriba en cada repetición para mejorar la contracción."
  },

  "Curl Inclinado con mancuernas": {
    musculo: "Bíceps",
    grupo: "Brazos",
    seccion: "Cabeza larga (Estiramiento)",
    hacer: "Siéntate en un banco inclinado (45°-60°) con la espalda bien apoyada. Deja los brazos colgar y realiza el curl con <b>supinación controlada</b> al subir, manteniendo los codos ligeramente por detrás del torso.",
    noHacer: "<b>No adelantes los hombros</b> ni levantes los codos para ayudar. Evita balancearte o despegar la espalda del banco.",
    trucos: "Piensa en <b>estirar el bíceps abajo</b> antes de cada repetición. Pausa 1 segundo en la parte baja y aprieta arriba sin perder el control."
  },

  "Curl concentrado": {
    musculo: "Bíceps",
    grupo: "Brazos",
    seccion: "Cabeza corta (Pico)",
    hacer: "<b>Codo fijo en la parte interna del muslo</b>, actuando como un soporte. Realiza una <b>subida muy lenta y controlada</b>. Enfócate en la contracción máxima en la parte superior.",
    noHacer: "<b>No uses ningún impulso</b> o rebote. Evita levantar el codo del soporte de la pierna.",
    trucos: "Al finalizar el recorrido, <b>gira la mancuerna ligeramente hacia el dedo meñique</b> (supinación forzada) para una activación máxima de la cabeza corta del bíceps."
  },

  "Curl Scott": {
    musculo: "Bíceps",
    grupo: "Brazos",
    seccion: "Aislamiento (Preacher Curl)",
    hacer: "Ajusta la altura del banco para que la axila esté sobre el borde superior. <b>Mantén el brazo fijo</b> en la almohadilla. Realiza un rango de movimiento completo, subiendo y bajando de forma controlada.",
    noHacer: "<b>No levantes el codo</b> o la axila del soporte en ningún momento. Evita la hiperextensión en la parte baja del movimiento.",
    trucos: "Mantén la <b>muñeca en posición neutra</b> (recta) durante todo el curl para evitar sobrecargar los flexores del antebrazo y dirigir la tensión al bíceps."
  },

  "Curl martillo": {
    musculo: "Bíceps/Antebrazo",
    grupo: "Brazos",
    seccion: "Braquiorradial y Braquial",
    hacer: "<b>Agarre neutro (palmas enfrentadas)</b>. Mantén el codo pegado al costado y realiza el curl de forma estricta. Este ejercicio desarrolla el grosor del brazo.",
    noHacer: "<b>No gires el torso</b> ni te inclines para ayudar el movimiento.",
    trucos: "Para enfatizar más el braquial y el braquiorradial, piensa en <b>elevar el codo ligeramente hacia adelante</b> al subir. Esto cambia el ángulo y maximiza la tensión en esos músculos."
  },

  "Tríceps en polea": {
    musculo: "Tríceps",
    grupo: "Brazos",
    seccion: "General (Cabeza Lateral)",
    hacer: "<b>Codos pegados al cuerpo</b> y hombros 'bloqueados' hacia atrás y abajo. La extensión debe ser <b>estricta y completa</b>, de arriba hacia abajo. Solo se mueve el antebrazo.",
    noHacer: "<b>No separes los codos</b> del torso. Evita flexionar la muñeca (muñeca 'rota').",
    trucos: "<b>Inclínate ligeramente hacia adelante</b> (como un esquí) y bloquea los hombros y codos firmemente hacia atrás. Esto aísla el tríceps y permite una extensión más potente."
  },

  "Tríceps en polea unilateral": {
    musculo: "Tríceps",
    grupo: "Brazos",
    seccion: "Aislamiento (Unilateral)",
    hacer: "Usa un agarre de una mano en polea. <b>Codo fijo</b> pegado al costado y extensión completa del codo.",
    noHacer: "<b>No gires el tronco</b> ni eleves el hombro para ayudar.",
    trucos: "Mantén la muñeca neutra y <b>aprieta 1 segundo</b> abajo para más control."
  },

  "Tríceps cuerda 1 mano": {
    musculo: "Tríceps",
    grupo: "Brazos",
    seccion: "Aislamiento (Énfasis en Lateral)",
    hacer: "<b>Agarre de una sola mano</b> en la cuerda. <b>Extiende el brazo al máximo</b> hacia abajo y hacia afuera, separando la cuerda al final. Control total del rango.",
    noHacer: "<b>No gires el tronco</b> para ayudar la extensión. Evita el balanceo del brazo.",
    trucos: "Al extender el codo, <b>separa ligeramente la mano</b> y realiza una rotación externa de la muñeca. Esto ayuda a enfatizar la cabeza lateral y el punto de 'herradura' del tríceps."
  },

  "Tríceps katana unilateral": {
    musculo: "Tríceps",
    grupo: "Brazos",
    seccion: "Cabeza larga (Unilateral)",
    hacer: "Coloca la polea alta con agarre de una mano. Sitúate de espaldas a la polea, <b>brazo elevado</b> con el codo apuntando al techo y el antebrazo detrás de la cabeza. <b>Extiende el codo</b> hacia arriba y ligeramente al frente manteniendo el hombro estable.",
    noHacer: "<b>No arquees la espalda</b> ni abras el codo hacia los lados. Evita impulsar con el tronco.",
    trucos: "Piensa en <b>'empujar la espada'</b> hacia arriba manteniendo el codo fijo. Una <b>ligera inclinación del torso</b> adelante ayuda a alinear el cable con el antebrazo y aumentar el estiramiento."
  },

  "Tríceps katana cuerda": {
    musculo: "Tríceps",
    grupo: "Brazos",
    seccion: "Cabeza larga (Bilateral)",
    hacer: "Polea alta con cuerda. De espaldas a la polea, coloca la cuerda detrás de la cabeza con los codos apuntando arriba. <b>Extiende ambos codos</b> hacia arriba y ligeramente al frente, separando la cuerda al final.",
    noHacer: "<b>No abras los codos</b> ni dejes que los hombros suban. Evita balancear el torso para ayudar.",
    trucos: "Mantén el <b>pecho elevado</b> y el core firme. Haz una <b>pausa breve</b> arriba para enfatizar la cabeza larga."
  },


  // ======= PIERNA 🦵 =======
  "Prensa de piernas": {
    musculo: "Pierna",
    grupo: "Piernas",
    seccion: "Cuádriceps (Énfasis general)",
    hacer: "<b>Mantén la zona lumbar completamente pegada</b> al respaldo; si se despega, has bajado demasiado. Las rodillas deben estar <b>alineadas con las puntas de los pies</b>. Baja hasta un ángulo de 90° o justo antes de que la lumbar se despegue. Empuja hacia arriba.",
    noHacer: "<b>No bloquees las rodillas</b> al final del recorrido (mantén una microflexión). No permitas que las rodillas 'colapsen' hacia dentro.",
    trucos: "Para enfocar más en los <b>cuádriceps</b>, coloca los pies ligeramente más abajo en la plataforma y concéntrate en <b>empujar con la parte externa del pie</b>."
  },

  "Prensa sumo": {
    musculo: "Glúteo/Aductores",
    grupo: "Piernas",
    seccion: "Lateral/Interna",
    hacer: "<b>Pies en la parte alta y ancha de la plataforma</b>, con las <b>puntas apuntando hacia afuera</b> (rotación externa). Baja controlado y empuja con los talones.",
    noHacer: "<b>No dejes que las rodillas colapsen</b> hacia dentro; deben seguir la dirección de las puntas de los pies.",
    trucos: "Imagina que estás empujando el suelo <b>separándolo con los talones</b>: esto activa el glúteo medio y los aductores de forma brutal, ideal para el desarrollo lateral y de la parte interna del muslo."
  },

  "Extensión cuádriceps": {
    musculo: "Cuádriceps",
    grupo: "Piernas",
    seccion: "Recto Femoral y Vasto Interno",
    hacer: "<b>Alinea la rodilla con el eje de rotación de la máquina</b>. Realiza la extensión de la rodilla de forma controlada hasta la máxima contracción. Mantén la cadera pegada al asiento.",
    noHacer: "<b>No hagas tirones rápidos</b> en la parte superior. Evita levantar el cuerpo del asiento.",
    trucos: "<b>Pausa de 1–2 segundos en la máxima extensión</b> para crear una contracción isométrica. Piensa en activar el <b>vasto interno</b> (la forma de lágrima sobre la rodilla) al apretar la pierna."
  },

  "Extensión cuádriceps unilateral": {
    musculo: "Cuádriceps",
    grupo: "Piernas",
    seccion: "Aislamiento (Unilateral)",
    hacer: "Trabaja una pierna cada vez con <b>control total</b>. Ajusta la máquina para alinear la rodilla con el eje y extiende de forma lenta.",
    noHacer: "<b>No gires la pelvis</b> ni te apoyes con la pierna libre.",
    trucos: "Usa un rango completo y <b>mantén 1 segundo arriba</b> para igualar fuerza entre piernas."
  },

  "Extensión cuádriceps isométrica": {
    musculo: "Cuádriceps",
    grupo: "Piernas",
    seccion: "Vasto Medial (Acortamiento)",
    hacer: "Realiza la extensión normal, pero <b>mantén la contracción máxima arriba durante un tiempo predefinido</b> (ej. 3–5 segundos) antes de la fase excéntrica lenta.",
    noHacer: "No relajes de golpe la tensión en la fase isométrica.",
    trucos: "Mientras mantienes la contracción, <b>activa el core (abdomen)</b> y empuja las manos contra el asiento. Esta co-contracción aumenta la estabilidad y la intensidad del vasto medial (el músculo de la 'lágrima')."
  },

  "Curl femoral": {
    musculo: "Femoral",
    grupo: "Piernas",
    seccion: "General (Sentado o Tumbado)",
    hacer: "<b>Mantén la cadera neutra</b> y pegada al soporte. Lleva el <b>talón hacia el glúteo</b> en un movimiento lento y concentrado. Controla la fase de estiramiento.",
    noHacer: "<b>No arquees la zona lumbar</b> (hiperextensión) para iniciar o terminar la repetición; esto indica que el peso es demasiado alto.",
    trucos: "<b>Aprieta los glúteos</b> antes y durante el movimiento. Esto bloquea la cadera y desactiva la participación de otros músculos, aislando de forma estricta el femoral."
  },

  "Curl femoral sentado": {
    musculo: "Femoral",
    grupo: "Piernas",
    seccion: "General (Máximo Estiramiento)",
    hacer: "<b>Alinea la rodilla con el eje de rotación</b>. Realiza un recorrido completo, permitiendo el estiramiento máximo del femoral en la fase excéntrica.",
    noHacer: "<b>No rebotes</b> al iniciar el movimiento desde la posición de estiramiento.",
    trucos: "<b>Inclina ligeramente el torso hacia adelante</b> al inicio de la repetición. Esta flexión de cadera permite un <b>mejor estiramiento inicial</b> del isquiotibial, lo que resulta en una contracción final más poderosa."
  },

  "Curl femoral 1 pierna": {
    musculo: "Femoral",
    grupo: "Piernas",
    seccion: "Aislamiento y Equilibrio",
    hacer: "Realiza el rango completo con <b>control total</b> de la máquina. Enfócate en la conexión mente-músculo y evita cualquier compensación del tronco o cadera.",
    noHacer: "<b>No hagas compensaciones con la cadera</b> (rotación o levantamiento) para ayudarte a mover el peso.",
    trucos: "Mantén la <b>planta del pie firme</b> contra el soporte o cojín para evitar rotaciones no deseadas en el tobillo y asegurar un enfoque directo en el femoral."
  },

  "Hack machine": {
    musculo: "Cuádriceps",
    grupo: "Piernas",
    seccion: "Anterior (Vasto Lateral)",
    hacer: "<b>Coloca los pies más abajo</b> en la plataforma (cerca del borde) para un mayor énfasis en el cuádriceps. <b>Baja controlado</b> (al menos 90° de flexión) y mantén la espalda totalmente apoyada.",
    noHacer: "<b>No bloquees las rodillas</b> arriba. No permitas que la espalda se despegue o se redondee.",
    trucos: "Mantén las <b>rodillas alineadas con las puntas de los pies</b>, empujándolas activamente hacia afuera (separándolas) al bajar. Esto protege las rodillas y activa mejor los cuádriceps."
  },

  "Prensa pies juntos arriba": {
    musculo: "Glúteo/Femoral",
    grupo: "Piernas",
    seccion: "Posterior (Cadera)",
    hacer: "<b>Pies juntos y colocados en la parte más alta</b> de la plataforma. Esto maximiza la flexión de cadera y el estiramiento de los femorales y glúteos. Baja hasta el punto donde la lumbar no se despegue.",
    noHacer: "<b>No levantes la zona lumbar</b> del respaldo. No rebotes.",
    trucos: "Imagina que estás empujando la plataforma <b>principalmente con los talones</b>. Esto dirige el esfuerzo hacia los glúteos y los isquiotibiales, en lugar de los cuádriceps."
  },

  "Zancadas mancuernas": {
    musculo: "Glúteo/Cuádriceps",
    grupo: "Piernas",
    seccion: "Funcional",
    hacer: "Da un <b>paso largo</b> para un enfoque en el glúteo. La rodilla de la pierna trasera debe bajar verticalmente hacia el suelo, y la <b>rodilla delantera debe estar alineada con el pie</b>. Mantén el torso erguido.",
    noHacer: "<b>No te 'hundas' hacia adelante</b>; el movimiento debe ser vertical. No permitas que la rodilla delantera se meta hacia dentro.",
    trucos: "Al subir, <b>empuja fuerte con el talón delantero</b> y concéntrate en apretar el glúteo de esa pierna. Esto maximiza la activación glútea en el ascenso."
  },

  "Step-up banco": {
    musculo: "Glúteo/Cuádriceps",
    grupo: "Piernas",
    seccion: "Funcional (Unilateral)",
    hacer: "Utiliza un banco cuya altura permita una rodilla a 90°. <b>El impulso debe provenir exclusivamente de la pierna que pisa el banco</b>. Baja lentamente y controla el descenso.",
    noHacer: "<b>No uses la pierna de abajo para dar impulso</b> o 'rebotar'. Evita el balanceo del cuerpo.",
    trucos: "<b>Inclínate muy ligeramente hacia delante</b> con el torso. Esto alinea mejor la cadera y te permite activar más el glúteo en el movimiento de ascenso."
  },

  "Abducción máquina": {
    musculo: "Glúteo medio",
    grupo: "Piernas",
    seccion: "Lateral (Estabilizador)",
    hacer: "<b>Inclínate ligeramente hacia adelante</b> y sujeta firmemente los agarres. <b>Controla la apertura y el retorno</b>; no permitas que las placas se toquen.",
    noHacer: "<b>No te inclines excesivamente</b> hacia adelante o hacia atrás; un ligero ángulo es suficiente. Evita soltar el peso de golpe.",
    trucos: "<b>Inclínate un poco hacia atrás</b> y sujeta el asiento; esto maximiza el rango de movimiento. Mantén una <b>pausa de 1-2 segundos</b> en la máxima apertura para enfatizar el glúteo medio."
  },

  "Flexiones": {
    musculo: "Pectoral / Tríceps",
    grupo: "Pecho",
    seccion: "General",
    hacer: "Cuerpo alineado de pies a cabeza. <b>Activa el core</b> y baja controlando hasta que el pecho se aproxime al suelo. Empuja manteniendo los codos a 30–45° del torso.",
    noHacer: "<b>No hundas la cadera</b> ni eleves el glúteo. No abras los codos en exceso.",
    trucos: "Imagina que <b>empujas el suelo hacia atrás</b>. Para más pecho, inclina ligeramente el torso hacia delante."
  },

  "Flexiones declinadas": {
    musculo: "Pectoral",
    grupo: "Pecho",
    seccion: "Superior",
    hacer: "Pies elevados sobre banco. Mantén el cuerpo firme y baja lentamente hasta que el pecho esté alineado con las manos.",
    noHacer: "<b>No pierdas la alineación corporal</b>. Evita rebotes.",
    trucos: "Cuanto más altos los pies, mayor énfasis en el pectoral superior."
  },

  "Press banca barra": {
    musculo: "Pectoral",
    grupo: "Pecho",
    seccion: "Media (Esternal)",
    hacer: "Escápulas retraídas y pies firmes en el suelo. Baja la barra al esternón medio y empuja verticalmente.",
    noHacer: "<b>No rebotes la barra</b> ni abras los codos a 90°.",
    trucos: "Piensa en <b>empujar el banco con la espalda</b> para mayor estabilidad."
  },

  "Press banca mancuernas": {
    musculo: "Pectoral",
    grupo: "Pecho",
    seccion: "Media (Esternal)",
    hacer: "Acostado en el banco, <b>escápulas retraídas</b> y pies firmes. Baja las mancuernas a la línea del pecho con control y empuja hacia arriba.",
    noHacer: "<b>No choques las mancuernas</b> arriba ni abras los codos demasiado.",
    trucos: "Permite un <b>ligero arco</b> en la bajada para ganar rango y estiramiento del pectoral."
  },

  "Dominadas asistidas máquina": {
    musculo: "Dorsal",
    grupo: "Espalda",
    seccion: "Vertical",
    hacer: "Pecho elevado y tirón iniciando con la <b>depresión escapular</b>. Lleva el pecho hacia la barra.",
    noHacer: "<b>No balancees el cuerpo</b> ni tires solo con los brazos.",
    trucos: "Cuanta menos ayuda, mayor activación del dorsal."
  },

  "Dominadas agarre neutro": {
    musculo: "Dorsal / Bíceps",
    grupo: "Espalda",
    seccion: "Vertical",
    hacer: "<b>Cuelga con agarre neutro</b> (palmas mirando entre sí) y tira del cuerpo hacia arriba hasta que el pecho alcance la barra o agarres. Mantén el core activado y evita balancearte.",
    noHacer: "<b>No uses impulso</b> ni dejes que los hombros se elevan hacia las orejas. Evita redondear la espalda.",
    trucos: "Piensa en <b>apretar los omóplatos</b> al subir y controla la bajada para maximizar el trabajo del dorsal y bíceps."
  },

  "Bicicleta estática": {
    musculo: "Cardio",
    grupo: "Cardio",
    seccion: "Aeróbico",
    hacer: "Pedaleo continuo a ritmo moderado, manteniendo una postura erguida y respiración controlada.",
    noHacer: "No encorves la espalda ni pedalees con excesiva resistencia.",
    trucos: "Ideal como <b>finisher</b> o recuperación activa post-entreno."
  },

  "Elevación de talones en máquina": {
    grupo: "Piernas",
    musculo: "Gemelos",
    seccion: "Sóleo y Gastrocnemio",
    hacer: "<b>Coloca la parte media del pie</b> sobre la plataforma, dejando los talones libres. Realiza una <b>extensión completa del tobillo</b>, subiendo los talones lo más alto posible. Baja lentamente hasta sentir un estiramiento profundo.",
    noHacer: "<b>No rebotes</b> en la parte baja del movimiento. No acortes el recorrido ni flexiones las rodillas en exceso para ayudarte.",
    trucos: "Mantén una <b>pausa de 1–2 segundos arriba</b> en máxima contracción. Para enfatizar el sóleo, realiza el ejercicio con <b>rodillas ligeramente flexionadas</b>; para gastrocnemio, mantenlas extendidas."
  },

  "Elevación de talones en prensa": {
    grupo: "Piernas",
    musculo: "Gemelos",
    seccion: "Sóleo y Gastrocnemio",
    hacer: "<b>Coloca los pies sobre la plataforma</b> con los talones fuera del borde y las rodillas ligeramente flexionadas. Eleva los talones hasta una <b>contracción completa</b> y baja controladamente hasta el estiramiento máximo.",
    noHacer: "<b>No uses impulso</b> ni permitas que la espalda se despegue de la prensa. Evita acortar el rango de movimiento.",
    trucos: "Mantén una <b>pausa breve arriba</b> para sentir la tensión en los gemelos y usa un peso que te permita controlar la bajada."
  },

  // ======= EJERCICIOS BÁSICOS ADICIONALES =======

  "Sentadillas": {
    grupo: "Piernas",
    musculo: "Cuádriceps",
    seccion: "General (Completo)",
    hacer: "<b>Coloca los pies al ancho de hombros</b>, con las puntas ligeramente hacia afuera. Baja lentamente hasta que los muslos queden paralelos al suelo o ligeramente por debajo, manteniendo la espalda recta y el pecho elevado. Empuja con los talones para subir.",
    noHacer: "<b>No dejes que las rodillas se pasen de los dedos de los pies</b>. Evita arquear la espalda o inclinarte excesivamente hacia adelante. No uses impulso o rebote en la bajada.",
    trucos: "Mantén la <b>mirada al frente</b> para ayudar a mantener la columna neutra. Imagina que estás sentándote en una silla invisible. Para mayor estabilidad, <b>activa el core</b> contrayendo el abdomen durante todo el movimiento."
  },

  "Sentadilla goblet": {
    grupo: "Piernas",
    musculo: "Cuádriceps",
    seccion: "General (Técnica y profundidad)",
    hacer: "Sujeta una mancuerna o kettlebell pegada al pecho. <b>Abre los pies al ancho de hombros</b> con puntas ligeramente hacia afuera. Baja controlando la cadera y las rodillas, manteniendo el torso erguido y el peso en los talones. Sube empujando el suelo.",
    noHacer: "<b>No redondees la espalda</b> ni dejes caer el pecho. Evita que las rodillas colapsen hacia adentro. No rebotes al final del recorrido.",
    trucos: "Piensa en <b>llevar los codos hacia dentro de las rodillas</b> al bajar para ganar profundidad. Mantén una <b>pausa de 1 segundo</b> abajo para mejorar control y movilidad."
  },

  "Peso muerto": {
    grupo: "Espalda",
    musculo: "Espalda",
    seccion: "Completa (Énfasis en isquiotibiales y glúteos)",
    hacer: "<b>Coloca los pies al ancho de hombros</b>, agarra la barra con un grip mixto o prono. Mantén la espalda recta, baja la barra deslizándola por las piernas hasta que llegue al suelo o justo por encima. Levanta empujando con los talones y extendiendo las caderas.",
    noHacer: "<b>No redondees la espalda</b> en ningún momento. Evita levantar con los brazos; el movimiento debe venir de las piernas y glúteos. No dejes que la barra se aleje del cuerpo.",
    trucos: "Piensa en <b>'empujar el suelo con los pies'</b> en lugar de tirar con la espalda. Mantén los hombros retraídos y el pecho elevado. Si eres principiante, usa una barra ligera o mancuernas para practicar la forma."
  },

  "Press de banca": {
    grupo: "Pecho",
    musculo: "Pectoral",
    seccion: "Media (Esternal)",
    hacer: "<b>Acuéstate en el banco</b> con los pies firmes en el suelo. Agarra la barra con un grip ligeramente más ancho que los hombros. Baja la barra controladamente hasta tocar el pecho, luego empuja hacia arriba extendiendo los brazos.",
    noHacer: "<b>No arquees la espalda excesivamente</b>. Evita rebotar la barra en el pecho. No dejes que los codos se abran a 90° o más.",
    trucos: "Mantén los <b>hombros retraídos</b> contra el banco. Imagina que estás <b>'aplastando' algo entre las manos</b> al subir. Usa un spotter si es posible para cargas pesadas."
  },

  "Dominadas": {
    grupo: "Espalda",
    musculo: "Espalda",
    seccion: "Superior (Dorsal ancho)",
    hacer: "<b>Cuelga de la barra</b> con un grip prono más ancho que los hombros. Baja lentamente hasta que los brazos queden completamente extendidos, luego tira hacia arriba hasta que la barbilla pase la barra.",
    noHacer: "<b>No uses impulso o balanceo</b>. Evita encogerte de hombros al subir. No dejes que el cuerpo se balancee.",
    trucos: "Si eres principiante, usa asistencia o bandas elásticas. Enfócate en <b>contraer los omóplatos</b> al bajar. Mantén el core activado para evitar el balanceo."
  },

  "Remo con barra": {
    grupo: "Espalda",
    musculo: "Espalda",
    seccion: "Media (Trapecio y romboides)",
    hacer: "<b>Inclínate hacia adelante</b> con las rodillas ligeramente flexionadas. Agarra la barra con un grip prono. Tira de la barra hacia el abdomen, manteniendo los codos cerca del cuerpo, luego baja controladamente.",
    noHacer: "<b>No uses los brazos solos</b>; el movimiento debe venir de la espalda. Evita redondear la espalda. No dejes que los hombros se eleven.",
    trucos: "Piensa en <b>'apretar los omóplatos'</b> al tirar. Mantén la mirada al frente para ayudar con la postura. Para mayor intensidad, usa un grip mixto."
  },

  "Curl de bíceps con barra": {
    grupo: "Brazos",
    musculo: "Bíceps",
    seccion: "Braquial",
    hacer: "<b>De pie con los pies al ancho de hombros</b>, agarra la barra con un grip supino. Flexiona los codos para subir la barra hacia los hombros, manteniendo los codos pegados al torso.",
    noHacer: "<b>No uses impulso del torso</b>. Evita extender los codos completamente en la bajada. No gires las muñecas.",
    trucos: "Mantén los <b>codos fijos</b> al lado del cuerpo. Baja lentamente para mayor tiempo bajo tensión. Imagina que estás <b>'girando' la barra hacia arriba</b>."
  },

  "Extensiones de tríceps": {
    grupo: "Brazos",
    musculo: "Tríceps",
    seccion: "Completo",
    hacer: "<b>De pie o sentado</b>, agarra una mancuerna con ambas manos sobre la cabeza. Baja la mancuerna detrás de la cabeza flexionando los codos, luego extiende los brazos hacia arriba.",
    noHacer: "<b>No dejes que los codos se abran</b>. Evita arquear la espalda. No uses peso excesivo que comprometa la forma.",
    trucos: "Mantén los <b>codos apuntando hacia adelante</b>. Baja lentamente y aprieta el tríceps al final. Usa una mano si es más cómodo."
  },

  "Elevaciones de talones": {
    grupo: "Piernas",
    musculo: "Gemelos",
    seccion: "Gastrocnemio",
    hacer: "<b>De pie con los pies al ancho de hombros</b>, eleva los talones lentamente hasta ponerte de puntillas, luego baja controladamente.",
    noHacer: "<b>No uses impulso</b>. Evita doblar las rodillas. No bajes completamente los talones al suelo entre repeticiones.",
    trucos: "Mantén el <b>core activado</b> para estabilidad. Haz el movimiento lentamente para maximizar la contracción. Puedes hacerlo en una máquina para mayor resistencia."
  },

  "Elevación de talones a una pierna": {
    grupo: "Piernas",
    musculo: "Gemelos",
    seccion: "Gastrocnemio (Unilateral)",
    hacer: "Apoya el peso en una sola pierna y eleva el talón de forma controlada. Mantén el <b>tobillo estable</b> y baja lentamente.",
    noHacer: "<b>No rebotes</b> ni colapses el tobillo hacia dentro.",
    trucos: "Sujétate a un apoyo para equilibrarte y priorizar el rango completo."
  },

  // ======= EJERCICIOS ADICIONALES =======

  // Antebrazos
  "Curl de muñeca": {
    grupo: "Antebrazos",
    musculo: "Antebrazo",
    seccion: "Flexores",
    hacer: "<b>Siéntate con los antebrazos apoyados en los muslos</b>, palmas hacia arriba. Agarra una mancuerna o barra con un grip supino. Flexiona las muñecas hacia arriba, luego baja controladamente.",
    noHacer: "<b>No uses los bíceps</b> para ayudar. Evita mover los antebrazos. No rebotes en la bajada.",
    trucos: "Mantén los <b>antebrazos fijos</b> en los muslos. Baja lentamente para mayor tiempo bajo tensión. Usa peso ligero para enfocarte en la contracción."
  },

  "Extensiones de muñeca": {
    grupo: "Antebrazos",
    musculo: "Antebrazo",
    seccion: "Extensores",
    hacer: "<b>Siéntate con los antebrazos apoyados en los muslos</b>, palmas hacia abajo. Agarra una mancuerna o barra con un grip prono. Extiende las muñecas hacia arriba, luego baja controladamente.",
    noHacer: "<b>No uses los tríceps</b> para ayudar. Evita mover los antebrazos. No rebotes.",
    trucos: "Enfócate en <b>contraer los extensores</b> al final del movimiento. Mantén los antebrazos inmóviles. Ideal para equilibrar con curls de muñeca."
  },

  "Curl inverso con barra": {
    grupo: "Antebrazos",
    musculo: "Antebrazo",
    seccion: "Braquiorradial",
    hacer: "<b>De pie con agarre prono</b> (palmas hacia abajo), codos pegados al torso. Flexiona los codos elevando la barra hasta el antebrazo sin mover los hombros.",
    noHacer: "<b>No balancees el torso</b> para subir el peso. Evita abrir los codos hacia los lados.",
    trucos: "Usa un <b>peso moderado</b> y controla la bajada para maximizar el trabajo del braquiorradial."
  },

  "Curl inverso con mancuernas": {
    grupo: "Antebrazos",
    musculo: "Antebrazo",
    seccion: "Braquiorradial",
    hacer: "<b>De pie con mancuernas</b> y agarre prono, codos pegados al cuerpo. Flexiona los codos elevando las mancuernas sin mover los hombros.",
    noHacer: "<b>No uses impulso</b> del torso. Evita doblar las muñecas.",
    trucos: "Controla la bajada y mantén los <b>codos fijos</b> para aislar el antebrazo."
  },

  "Pronación y supinación con mancuerna": {
    grupo: "Antebrazos",
    musculo: "Antebrazo",
    seccion: "Rotadores",
    hacer: "<b>Siéntate con el antebrazo apoyado</b> en un banco, mano fuera del borde. Sujeta una mancuerna por el extremo y rota lentamente la muñeca hacia adentro (pronación) y hacia afuera (supinación).",
    noHacer: "<b>No muevas el codo ni el hombro</b>. Evita giros bruscos o demasiado rápidos.",
    trucos: "Recorre todo el rango de movimiento con <b>control total</b>. Ideal para equilibrar la fuerza de muñeca y codo."
  },

  "Farmer's walk (Paseo del granjero)": {
    grupo: "Antebrazos",
    musculo: "Antebrazo",
    seccion: "Agarre",
    hacer: "<b>Camina con mancuernas pesadas</b> a los lados, espalda recta y core activo. Mantén los hombros abajo y el paso controlado.",
    noHacer: "<b>No encorves la espalda</b>. Evita pasos cortos y acelerados que comprometan la postura.",
    trucos: "Aprieta fuerte las mancuernas y mantén la <b>mirada al frente</b>. Gran ejercicio para fuerza de agarre."
  },

  // Isquiotibiales (ya tenemos algunos, agregar más)
  "Peso muerto rumano": {
    grupo: "Piernas",
    musculo: "Femoral",
    seccion: "Isquiotibiales (Estiramiento)",
    hacer: "<b>De pie con los pies al ancho de hombros</b>, agarra la barra con un grip prono. Baja la barra deslizándola por las piernas, manteniendo las rodillas ligeramente flexionadas y la espalda recta. Empuja con los talones para subir.",
    noHacer: "<b>No redondees la espalda</b>. Evita flexionar las rodillas excesivamente. No dejes que la barra se aleje del cuerpo.",
    trucos: "Mantén la <b>mirada al frente</b> para mantener la espalda neutra. Siente el estiramiento en los isquiotibiales al bajar. Usa peso moderado para técnica perfecta."
  },

  "Buenos días": {
    grupo: "Piernas",
    musculo: "Femoral",
    seccion: "Isquiotibiales y glúteos",
    hacer: "<b>Coloca la barra sobre los hombros</b>, pies al ancho de hombros. Inclínate hacia adelante desde las caderas, manteniendo la espalda recta y las rodillas ligeramente flexionadas. Vuelve a la posición vertical.",
    noHacer: "<b>No arquees la espalda</b> al bajar. Evita doblar las rodillas demasiado. No uses impulso.",
    trucos: "Piensa en <b>empujar las caderas hacia atrás</b>. Mantén el core activado. Excelente para fortalecer la cadena posterior."
  },

  // Trapecios
  "Encogimientos de hombros": {
    grupo: "Espalda",
    musculo: "Trapecio",
    seccion: "Superior",
    hacer: "<b>De pie con mancuernas a los lados</b>. Eleva los hombros hacia las orejas lo más alto posible, luego baja controladamente.",
    noHacer: "<b>No uses impulso</b> del torso. Evita encogerte de hombros durante otros ejercicios. No gires los hombros.",
    trucos: "Mantén los <b>brazos rectos</b> a los lados. Aprieta fuerte arriba por 1-2 segundos. Ideal para el desarrollo del trapecio superior."
  },

  "Encogimientos con barra": {
    grupo: "Espalda",
    musculo: "Trapecio",
    seccion: "Superior",
    hacer: "<b>De pie agarrando una barra con un grip prono</b>, brazos extendidos. Eleva los hombros hacia arriba, manteniendo los brazos rectos.",
    noHacer: "<b>No flexiones los codos</b>. Evita balancear el cuerpo. No rebotes.",
    trucos: "Usa un <b>peso moderado</b> para evitar lesiones. Enfócate en la contracción máxima. Combínalo con encogimientos de mancuernas para variedad."
  },

  // Hombros (agregar más variaciones)
  "Elevaciones frontales": {
    grupo: "Hombros",
    musculo: "Deltoides",
    seccion: "Anterior",
    hacer: "<b>De pie con mancuernas a los lados</b>. Eleva una mancuerna hacia adelante hasta la altura del hombro, manteniendo el brazo recto, luego baja. Alterna brazos.",
    noHacer: "<b>No uses impulso</b> del torso. Evita elevar el hombro opuesto. No gires la muñeca.",
    trucos: "Mantén el <b>codo ligeramente flexionado</b> para reducir tensión en el hombro. Baja lentamente. Excelente para aislar el deltoides anterior."
  },

  "Elevaciones frontales con barra": {
    grupo: "Hombros",
    musculo: "Deltoides",
    seccion: "Anterior",
    hacer: "<b>De pie agarrando una barra con un grip prono</b>, brazos extendidos. Eleva la barra hacia adelante hasta la altura del pecho, luego baja.",
    noHacer: "<b>No arquees la espalda</b>. Evita flexionar los codos. No uses peso excesivo.",
    trucos: "Mantén los <b>hombros retraídos</b>. Piensa en elevar desde los hombros, no los brazos. Ideal para principiantes."
  },

  "Press Arnold con mancuernas": {
    grupo: "Hombros",
    musculo: "Deltoides",
    seccion: "Completo",
    hacer: "<b>Siéntate o de pie con mancuernas a la altura de los hombros</b>, palmas hacia ti. Presiona hacia arriba mientras rotas las palmas hacia adelante, luego baja invirtiendo la rotación.",
    noHacer: "<b>No bloquees los codos</b> arriba. Evita arquear la espalda. No gires bruscamente.",
    trucos: "La rotación añade <b>tiempo bajo tensión</b> al deltoides posterior. Mantén el core activado. Variación avanzada del press militar."
  },

  
  "Hip Thrust (Empuje de cadera)": {
    grupo: "Piernas",
    musculo: "Glúteo",
    seccion: "Glúteo Mayor (Potencia)",
    hacer: "Apoya las escápulas en un banco y coloca la barra sobre la pelvis. Con los pies firmes, <b>empuja la cadera hacia el techo</b> hasta que el cuerpo forme una línea recta. Aprieta los glúteos 1 segundo arriba.",
    noHacer: "<b>No arquees la espalda lumbar</b> arriba; el movimiento debe nacer de la pelvis. Evita que las rodillas se cierren hacia adentro.",
    trucos: "Mantén la <b>mirada siempre hacia adelante</b> (al frente), no hacia el techo. Esto ayuda a mantener la columna en una posición segura y maximiza la contracción del glúteo."
  },

  "Extensión de cadera en máquina": {
    grupo: "Piernas",
    musculo: "Glúteo",
    seccion: "Glúteo Mayor (Aislamiento)",
    hacer: "Ajusta el apoyo para el pecho y coloca el pie en la plataforma o rodillo. <b>Empuja la cadera hacia atrás y luego extiéndela</b> llevando la pierna hacia atrás de forma controlada.",
    noHacer: "<b>No arquees la espalda</b> para ganar recorrido. Evita usar impulso o balanceo del torso.",
    trucos: "Mantén el <b>core activado</b> y enfócate en apretar el glúteo al final del recorrido. Controla la fase negativa."
  },

  "Extensión de hombros en máquina": {
    grupo: "Hombros",
    musculo: "Deltoides",
    seccion: "Posterior",
    hacer: "Ajusta el asiento para que los brazos queden alineados con el hombro. <b>Empuja los brazos hacia atrás</b> (extensión del hombro) con un recorrido controlado.",
    noHacer: "<b>No encorves la espalda</b> ni adelantes los hombros al final del movimiento. Evita hiperextender el brazo.",
    trucos: "Piensa en <b>llevar los codos hacia atrás</b> y mantener el pecho abierto. Pausa 1 segundo en la contracción."
  },

  "Remo al mentón (Upright Row)": {
    grupo: "Hombros",
    musculo: "Deltoides/Trapecio",
    seccion: "Lateral y Superior",
    hacer: "Sujeta una barra o polea con agarre algo más ancho que los hombros. <b>Tira de los codos hacia el techo</b>, manteniendo la barra pegada al cuerpo hasta que llegue a la altura del pecho.",
    noHacer: "<b>No uses un agarre demasiado estrecho</b> (estresa la muñeca). No subas la barra más arriba de los hombros si sientes molestias articulares.",
    trucos: "Imagina que tienes <b>dos hilos tirando de tus codos</b> hacia arriba. Las manos deben quedar siempre por debajo de la altura de los codos para asegurar que el hombro trabaje correctamente."
  },

  "Press Francés (Skullcrushers)": {
    grupo: "Brazos",
    musculo: "Tríceps",
    seccion: "Cabeza Larga",
    hacer: "Tumbado en un banco, extiende los brazos con una barra EZ. Flexiona solo los codos bajando la barra <b>hacia la frente o ligeramente detrás de la cabeza</b>. Extiende de nuevo sin mover los hombros.",
    noHacer: "<b>No abras los codos</b> hacia los lados durante la bajada. Evita mover los brazos desde el hombro; el único eje de giro debe ser el codo.",
    trucos: "Lleva la barra un poco <b>por detrás de la coronilla</b> en lugar de la frente. Esto mantiene una tensión constante en el tríceps incluso cuando los brazos están extendidos arriba."
  },

  "Fondos en paralelas (Dips)": {
    grupo: "Brazos",
    musculo: "Tríceps",
    seccion: "Cabeza Larga",
    hacer: "Colócate entre dos barras paralelas con los brazos extendidos. Baja el cuerpo flexionando los codos hasta que los hombros queden por debajo de los codos, luego empuja hacia arriba hasta extender los brazos.",
    noHacer: "No bajes demasiado para evitar sobrecargar los hombros. Evita balancearte o usar impulso.",
    trucos: "Mantén el torso ligeramente inclinado hacia adelante para enfatizar el pecho. Si eres principiante, usa asistencia o bandas elásticas."
  },

  "Remo con mancuerna a una mano": {
    grupo: "Espalda",
    musculo: "Dorsales",
    seccion: "Ancha",
    hacer: "Apoya una rodilla y una mano en un banco, con la espalda plana. Con la otra mano, sujeta una mancuerna y tira del codo hacia atrás, llevando la mancuerna hacia la cadera.",
    noHacer: "No gires el torso ni uses impulso. Mantén la espalda recta sin arquearla.",
    trucos: "Imagina que estás remando, llevando el codo lo más alto posible. Cambia de lado para equilibrar el trabajo."
  },

  "Plancha abdominal (Plank)": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Transverso",
    hacer: "Apoya los antebrazos y las puntas de los pies en el suelo, manteniendo el cuerpo en línea recta desde la cabeza hasta los talones. Contrae los abdominales y mantén la posición.",
    noHacer: "No arquees la espalda ni dejes caer las caderas. Evita contener la respiración.",
    trucos: "Mantén la mirada hacia el suelo para alinear el cuello. Empieza con tiempos cortos y aumenta gradualmente."
  },

  "Plancha Abdominal Centrada": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Estabilidad central",
    hacer: "Coloca los antebrazos paralelos, codos debajo de los hombros y el cuerpo en línea recta. <b>Activa abdomen y glúteos</b> para mantener la pelvis neutra.",
    noHacer: "<b>No hundas la zona lumbar</b> ni eleves las caderas. Evita abrir los codos hacia afuera.",
    trucos: "Empuja el suelo con los antebrazos y <b>acerca ligeramente el ombligo a la columna</b>. Respira corto y estable para mantener la tensión."
  },

  "Pallof press": {
    grupo: "Core",
    musculo: "Oblicuos",
    seccion: "Antirotación",
    hacer: "Con una polea o banda a la altura del pecho, <b>aléjate para crear tensión</b>. Sostén el agarre frente al pecho y extiende los brazos al frente sin dejar que el torso rote.",
    noHacer: "<b>No gires el tronco</b> hacia la resistencia. Evita encoger los hombros o arquear la espalda.",
    trucos: "Mantén las <b>costillas abajo</b> y el core firme. Pausa 1-2 segundos con los brazos extendidos."
  },

  "Plancha lateral": {
    grupo: "Core",
    musculo: "Oblicuos",
    seccion: "Lateral",
    hacer: "Apoya un antebrazo y el costado del pie en el suelo, alineando cabeza, tronco y piernas. Eleva la cadera y mantén la posición.",
    noHacer: "<b>No dejes caer la cadera</b> ni gires el torso hacia adelante.",
    trucos: "Aprieta glúteos y abdomen para una línea recta. Puedes elevar el brazo libre para estabilidad."
  },

  "Hollow hold": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Estabilidad",
    hacer: "Túmbate boca arriba, pega la zona lumbar al suelo y eleva <b>hombros y piernas</b> manteniendo la forma de 'banana'.",
    noHacer: "<b>No arquees la espalda baja</b>. Evita subir las piernas demasiado si pierdes la posición lumbar.",
    trucos: "Mantén las costillas <b>hacia abajo</b> y respira corto y controlado."
  },

  "Bird-dog": {
    grupo: "Core",
    musculo: "Estabilizadores",
    seccion: "Antirotación",
    hacer: "En cuadrupedia, <b>extiende brazo y pierna contrarios</b> manteniendo la pelvis estable.",
    noHacer: "<b>No gires la cadera</b> ni arquees la espalda.",
    trucos: "Haz una pausa breve al extender y vuelve lento para controlar la estabilidad."
  },

  "Ab wheel (rueda abdominal)": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Extensión",
    hacer: "De rodillas con la rueda, <b>rueda hacia delante</b> manteniendo el core firme y la espalda neutra.",
    noHacer: "<b>No arquees la zona lumbar</b> al estirar. Evita bajar más de lo que controlas.",
    trucos: "Empieza con recorridos cortos y <b>exhala</b> al volver."
  },

  "Dead bug": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Estabilidad",
    hacer: "Túmbate boca arriba, brazos al techo y rodillas a 90°. <b>Extiende brazo y pierna contrarios</b> sin despegar la zona lumbar del suelo.",
    noHacer: "<b>No arquees la espalda baja</b>. Evita mover la pelvis.",
    trucos: "Exhala al extender y mantén la espalda pegada al suelo. Movimiento lento y controlado."
  },

  "Crunch en polea": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Recto",
    hacer: "De rodillas frente a la polea alta, sujeta la cuerda y flexiona el tronco <b>llevando las costillas hacia la pelvis</b>.",
    noHacer: "<b>No tires con los brazos</b>. Evita mover la cadera hacia atrás.",
    trucos: "Mantén los codos fijos y enfócate en la contracción del abdomen. Controla la subida."
  },

  "Correr en cinta": {
    grupo: "Cardio",
    musculo: "Cardio",
    seccion: "Aeróbico",
    hacer: "Sube a una cinta de correr y camina o corre a un ritmo constante, manteniendo una postura erguida.",
    noHacer: "No te inclines demasiado hacia adelante. Evita pisar con los talones primero para prevenir lesiones.",
    trucos: "Aumenta la velocidad gradualmente. Usa intervalos para variar la intensidad."
  },

  "Bicicleta estática": {
    grupo: "Cardio",
    musculo: "Cardio",
    seccion: "Aeróbico",
    hacer: "Siéntate en la bicicleta estática y pedalea a un ritmo constante, ajustando la resistencia según tu nivel.",
    noHacer: "No pedalees demasiado rápido sin calentar. Evita una postura encorvada.",
    trucos: "Mantén los abdominales contraídos. Incluye intervalos de alta intensidad."
  },

  "Saltar a la comba": {
    grupo: "Cardio",
    musculo: "Cardio",
    seccion: "Aeróbico",
    hacer: "Sujeta una comba con ambas manos y salta sobre ella alternando los pies, manteniendo un ritmo constante.",
    noHacer: "No saltes demasiado alto para evitar fatiga. Evita saltar con los dos pies juntos si eres principiante.",
    trucos: "Empieza despacio y aumenta la velocidad. Usa una superficie acolchada para reducir el impacto."
  },

  "Crunch abdominal": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Recto",
    hacer: "Túmbate boca arriba con las rodillas flexionadas. Levanta los hombros del suelo contrayendo los abdominales, luego baja lentamente.",
    noHacer: "No tires del cuello con las manos. Evita arquear la espalda baja.",
    trucos: "Exhala al subir y inhala al bajar. Mantén el movimiento controlado."
  },

  "Elevación de piernas colgado": {
    grupo: "Core",
    musculo: "Abdominales",
    seccion: "Inferior",
    hacer: "Cuelga de una barra con las manos. Levanta las piernas extendidas hacia arriba hasta formar un ángulo de 90 grados, luego baja lentamente.",
    noHacer: "No balancees el cuerpo. Evita doblar las rodillas si puedes mantenerlas rectas.",
    trucos: "Contrae los abdominales fuertemente. Si es difícil, dobla las rodillas."
  },

  "Russian twists": {
    grupo: "Core",
    musculo: "Oblicuos",
    seccion: "Lateral",
    hacer: "Siéntate con las rodillas flexionadas y los pies en el suelo. Inclínate ligeramente hacia atrás y gira el torso de lado a lado, tocando el suelo con las manos.",
    noHacer: "No gires solo la cabeza. Mantén los pies en el suelo para estabilidad.",
    trucos: "Usa un peso para aumentar la resistencia. Mantén el movimiento lento y controlado."
  }
  
};

const exercisesWithoutMaterial = new Set([
  "Sentadillas",
  "Plancha abdominal (Plank)",
  "Plancha Abdominal Centrada",
  "Plancha lateral",
  "Hollow hold",
  "Bird-dog",
  "Dead bug",
  "Crunch abdominal",
  "Russian twists"
]);

Object.keys(exerciseTemplates).forEach(name => {
  const tpl = exerciseTemplates[name];
  if (!tpl) return;
  if (exercisesWithoutMaterial.has(name)) {
    tpl.sinMaterial = true;
  } else if (tpl.sinMaterial == null) {
    tpl.sinMaterial = false;
  }
});


// ---------------------------------------------------------
// RUTINAS (predefinidas)
// ---------------------------------------------------------

const routines = {
  "Semana 1": {
    "Día 1 – Tren superior (tirón + pecho secundario)": [
      "Jalón al pecho",
      "Remo polea sentado",
      "Remo con barra",
      "Curl de bíceps con barra",
      "Press inclinado mancuernas",
      "Aperturas en máquina/polea"
    ],
    "Día 2 – Tren superior (empuje + hombro y brazos)": [
      "Press de banca",
      "Press inclinado barra",
      "Press militar mancuernas",
      "Elevaciones laterales",
      "Press Francés (Skullcrushers)",
      "Fondos en paralelas (Dips)"
    ],
    "Día 3 – Tren inferior + core": [
      "Sentadillas",
      "Peso muerto",
      "Sentadilla goblet",
      "Elevación de talones en máquina",
      "Plancha abdominal (Plank)",
      "Crunch abdominal"
    ]
  }
};


// Exportar
window.exerciseTemplates = exerciseTemplates;
window.routines = routines;
