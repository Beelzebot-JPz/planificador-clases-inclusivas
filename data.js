(function () {
const referencesData = [
    { code: 'DUA 3.0', title: 'Diseño Universal para el Aprendizaje, versión 3.0', source: 'CAST', url: 'https://udlguidelines.cast.org/' },
    { code: 'ORG', title: 'Organizador gráfico DUA 3.0 (español)', source: 'CAST', url: 'https://udlguidelines.cast.org/static/udlg3-graphicorganizer_spanish_update_8142024.pdf' },
    { code: 'DUA Duoc', title: 'Experiencia DUA en Duoc UC', source: 'Duoc UC' },
    { code: 'ADE', title: 'Guía de Adecuaciones Curriculares de Acceso', source: 'Duoc UC' },
    { code: 'ACC', title: 'Guía de Introducción a la Accesibilidad Digital', source: 'Duoc UC' },
    { code: 'AUT', title: 'Orientaciones docentes para estudiantes del espectro autista', source: 'Duoc UC' },
    { code: 'VOC', title: 'Orientaciones para un vocabulario inclusivo', source: 'Duoc UC' },
    { code: 'PRÁCTICA', title: 'Cuadernillo de apoyo: De la formación a la práctica', source: 'Duoc UC' },
    { code: 'CAST', title: 'Universal Design for Learning', source: 'CAST', url: 'https://www.cast.org/' },
    { code: 'WCAG', title: 'Web Content Accessibility Guidelines 2.2', source: 'W3C WAI', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
    { code: 'UNE LF', title: 'UNE 153101:2018 EX Lectura Fácil: pautas y recomendaciones para elaborar documentos', source: 'AENOR' },
    { code: 'VALIDACIÓN LF', title: 'UNE 153102:2018 EX: guía en Lectura Fácil para validadores de documentos', source: 'AENOR' },
    { code: 'LEY 20.422', title: 'Ley 20.422: igualdad de oportunidades e inclusión social de personas con discapacidad', source: 'Chile' },
    { code: 'LEY TEA', title: 'Ley 21.545: inclusión, atención integral y derechos de personas autistas', source: 'Chile' },
    { code: 'LEY 21.015', title: 'Ley 21.015: inclusión laboral de personas con discapacidad', source: 'Chile' },
    { code: 'LEY 21.690', title: 'Ley 21.690: actualiza normas de inclusión laboral de personas con discapacidad', source: 'Chile' },
    { code: 'SENADIS', title: 'Inclusión laboral, trabajo como derecho y entornos accesibles', source: 'SENADIS' },
    { code: 'SENADIS 21.015', title: 'Orientaciones y preguntas frecuentes sobre Ley de Inclusión Laboral', source: 'SENADIS' },
    { code: 'OIT FP', title: 'Inclusión de personas con discapacidad en la formación profesional', source: 'OIT' },
    { code: 'OIT TVET', title: 'Sistemas técnico-profesionales inclusivos para personas con discapacidad', source: 'OIT' },
    { code: 'CAR CURSO', title: 'Plantilla editable: Caracterización inicial del curso', source: 'Duoc UC' },
    { code: 'COLAB', title: 'Checklist de prácticas colaborativas inclusivas', source: 'Duoc UC' },
    { code: 'RETRO', title: 'Infografía: Yo retroalimento para todos', source: 'Duoc UC' },
    { code: 'LENG', title: 'Infografía: Mis palabras crean una comunidad inclusiva', source: 'Duoc UC' },
    { code: 'CRISIS', title: 'Infografía: Cómo apoyar a un estudiante que se descompensa en mi aula', source: 'Duoc UC' },
    { code: 'CIERRE', title: 'Plantilla de reflexión de cierre de semestre', source: 'Duoc UC' }
];

const principleCards = [
    {
        icon: '01',
        title: 'Modelo social',
        text: 'La discapacidad aparece en la interacción con barreras del entorno. La tarea docente es anticiparlas, reducirlas y abrir participación.',
        source: 'Vocabulario Inclusivo'
    },
    {
        icon: '02',
        title: 'Agencia del aprendiz',
        text: 'El Marco DUA 3.0 orienta el diseño hacia estudiantes con propósito, reflexión, autenticidad, estrategia y acción.',
        source: 'Marco DUA 3.0'
    },
    {
        icon: '03',
        title: 'Ajustes cuando persisten barreras',
        text: 'Las adecuaciones de acceso entregan recursos, tiempos, apoyos o formatos sin modificar los resultados de aprendizaje.',
        source: 'Adecuaciones de Acceso'
    }
];

const duaStagesData = [
    {
        id: 'exploracion',
        label: 'Exploración',
        badge: 'Antes de decidir',
            source: 'Experiencia DUA Duoc UC',
            intro: 'Conoce al grupo antes de escoger estrategias. No todos los cursos son diversos en el mismo sentido.',
            focus: ['Levantar preferencias, barreras e intereses.', 'Revisar antecedentes compartidos por equipos de apoyo.', 'Observar rutinas, comprensión, motivación, sensibilidad sensorial, movilidad y participación socioemocional.'],
            checklist: [
                'Revisé antecedentes disponibles y acuerdos de apoyo autorizados.',
            'Apliqué una encuesta, diálogo o actividad breve para conocer intereses y preferencias.',
            'Identifiqué barreras físicas, sensoriales, digitales o actitudinales del curso.',
            'Caractericé el curso observando adaptación a rutinas, comunicación, motivación, sensibilidad sensorial, movilidad y participación socioemocional.',
            'Detecté posibles distractores, fuentes de ansiedad o momentos de baja previsibilidad.',
            'Consideré identidades, experiencias y capital cultural del estudiantado al diseñar ejemplos.'
        ],
        example: 'Antes de iniciar una unidad, pregunta qué formatos ayudan más a comprender: demostración, guía paso a paso, video breve, práctica acompañada o lectura.'
    },
    {
        id: 'preparacion',
        label: 'Preparación',
        badge: 'Diseño de la sesión',
        source: 'Marco DUA 3.0',
        intro: 'Diseña opciones alineadas al objetivo de aprendizaje: elección, representación flexible y formas variadas de respuesta.',
        focus: ['Aclarar propósito y criterios de logro.', 'Preparar materiales accesibles y editables.', 'Planificar apoyos sin bajar exigencias.'],
        checklist: [
            'Definí objetivos claros y los comuniqué en más de un formato.',
            'Incluí opciones de elección auténtica vinculadas al objetivo.',
            'Preparé materiales con estructura, contraste, fuente legible y texto alternativo.',
            'Diseñé instrucciones paso a paso con tiempos, roles y criterios explícitos.',
            'Anticipé alternativas de respuesta: escrita, oral, visual, práctica o digital.',
            'Preparé vocabulario, símbolos o conceptos clave con ejemplos y apoyos visuales.'
        ],
        example: 'Para una evaluación aplicada, permite escoger entre informe breve, demostración técnica o defensa oral con pauta común.'
    },
    {
        id: 'integracion',
        label: 'Integración',
        badge: 'En el aula',
            source: 'Experiencia DUA Duoc UC',
        intro: 'Observa cómo interactúan los estudiantes con materiales, tiempos, equipos y AVA. La implementación también produce nueva información.',
        focus: ['Monitorear participación real.', 'Ajustar ritmos y apoyos durante la clase.', 'Promover pertenencia, colaboración con roles claros y retroalimentación formativa.'],
        checklist: [
            'Expliqué la estructura de la clase y anticipé cambios de rutina.',
            'Usé ejemplos conectados con contextos reales y diversos.',
            'Organicé trabajo colaborativo con roles definidos, normas de convivencia e instrucciones orales, escritas y visuales.',
            'Entregué retroalimentación oportuna, clara y empática, usando texto, audio, video o ejemplos según necesidad.',
            'Consideré tanto el proceso de colaboración como el producto final al retroalimentar.',
            'Permití pausas, aclaraciones o apoyos cuando aparecieron barreras no previstas.',
            'Verifiqué comprensión durante la clase con preguntas, reformulación o ejemplos antes de avanzar.'
        ],
        example: 'En trabajo grupal, asigna roles visibles: coordinación, registro, vocería y control de tiempos, permitiendo ajustes si un rol genera sobrecarga.'
    },
    {
        id: 'optimizacion',
        label: 'Optimización',
        badge: 'Mejora continua',
        source: 'Marco DUA 3.0',
        intro: 'Después de implementar, revisa evidencias y decide qué mantener, ajustar o retirar. La inclusión es un ciclo, no un evento.',
        focus: ['Revisar datos de participación y logro.', 'Detectar nuevas barreras.', 'Documentar decisiones útiles para la próxima versión.'],
        checklist: [
            'Analicé qué apoyos aumentaron participación, comprensión o autonomía.',
            'Pregunté al curso qué facilitó o dificultó el aprendizaje.',
            'Ajusté materiales del AVA según accesibilidad, claridad y navegación.',
            'Registré apoyos que conviene reutilizar o personalizar.',
            'Planifiqué una mejora concreta para la siguiente clase.',
            'Dejé criterios, pasos y recursos visibles para que el estudiante pueda revisar su avance.',
            'Incluí una breve autoevaluación o cierre metacognitivo para reconocer estrategias útiles.'
        ],
        example: 'Si muchos estudiantes pidieron instrucciones nuevamente, convierte la pauta en una lista visible con ejemplo de entrega esperada.'
    }
];

const resourcesData = [
    { title: 'Ideas y variantes', text: 'Puedes usar herramientas digitales para generar alternativas de actividad, rúbrica o ejemplo, revisando siempre pertinencia y accesibilidad.', source: 'Experiencia DUA Duoc UC' },
    { title: 'Participación sin exposición', text: 'Foros, encuestas o tableros colaborativos pueden levantar dudas e intereses sin exigir participación oral inmediata.', source: 'Experiencia DUA Duoc UC' },
    { title: 'Material visual accesible', text: 'Todo recurso visual debe cuidar contraste, lectura lineal, subtítulos y texto alternativo cuando corresponda.', source: 'Accesibilidad Digital' }
];

const accommodationsData = {
    fisica: {
        name: 'Discapacidad física o movilidad reducida',
        source: 'Adecuaciones de Acceso',
        context: [
            'Asegura rutas accesibles, mesa adecuada y espacio de circulación.',
            'Coordina ubicación estratégica según movilidad, fatiga o uso de apoyos.',
            'Otorga tiempo adicional o pausas cuando exista fatiga, dolor o barreras de desplazamiento.'
        ],
        materials: [
            'Disponibiliza materiales digitales con anticipación.'
        ],
        methods: [
            'Flexibiliza formato de actividades prácticas cuando exista dificultad motora.',
            'Divide tareas extensas en etapas verificables.'
        ],
        interaction: [
            'Evita asumir ayuda sin preguntarla; acuerda apoyos con la persona.',
            'Considera participación oral, digital o asistida.'
        ],
        evaluacion: [
            'Si hay dificultad en expresión oral, otorga tiempo adicional para exposiciones.',
            'Ofrece exponer solo frente al docente si la ansiedad lo requiere.',
            'Flexibiliza plazos de entrega cuando exista fatiga.'
        ],
        tech: [
            'Permite uso de computador, grabación o ayudas técnicas.',
            'Facilita acceso a tecnologías de apoyo para escritura o comunicación.'
        ]
    },
    auditiva: {
        name: 'Discapacidad auditiva',
        source: 'Adecuaciones de Acceso',
        context: [
            'Facilita asiento con buena visibilidad del docente, intérprete o pizarra.',
            'Reduce ruido de fondo y ordena turnos de habla.'
        ],
        materials: [
            'Entrega instrucciones y contenidos clave por escrito.',
            'Asegura subtítulos, transcripciones o guiones de material audiovisual.',
            'Da tiempo adicional para procesar instrucciones escritas extensas o mediadas por interpretación.'
        ],
        methods: [
            'Apoya explicaciones orales con esquemas, palabras clave y ejemplos escritos.',
            'Verifica comprensión sin exponer públicamente.'
        ],
        interaction: [
            'Respeta lengua de señas, lectura labial, audífonos, implantes o intérprete según corresponda.',
            'Habla de frente y evita cubrir la boca.'
        ],
        evaluacion: [
            'Entrega por escrito toda la información que se daría en forma oral durante la evaluación.',
            'Permite el uso de recursos de apoyo habituales en evaluaciones orales o escritas.'
        ],
        tech: [
            'Facilita el uso de intérprete de lengua de señas, Transvoz u otras tecnologías de transcripción.'
        ]
    },
    visual: {
        name: 'Discapacidad visual o baja visión',
        source: 'Adecuaciones de Acceso',
        context: [
            'Coordina ubicación, iluminación y acceso a enchufes según necesidad.',
            'Evita cambiar mobiliario sin avisar.'
        ],
        materials: [
            'Usa documentos accesibles, editables y compatibles con lector de pantalla.',
            'Describe imágenes, gráficos y acciones realizadas en pizarra.',
            'Otorga más tiempo para lectura y navegación de materiales.'
        ],
        methods: [
            'No dependas solo del color, la ubicación visual o gestos para comunicar información.',
            'Ofrece alternativas táctiles, auditivas o digitales cuando sea pertinente.'
        ],
        interaction: [
            'Pregunta preferencias de formato: macrotipo, lector de pantalla, audio o Braille digital.',
            'Lee en voz alta información proyectada relevante.'
        ],
        evaluacion: [
            'Permite realizar evaluaciones por medios digitales y plataformas virtuales.',
            'Dispón el material escrito con anticipación para su adaptación.',
            'Otorga más tiempo en evaluaciones si es necesario.'
        ],
        tech: [
            'Asegura compatibilidad con lectores de pantalla y dispositivos Braille.',
            'Revisa accesibilidad con herramientas como Blackboard Ally.'
        ]
    },
    sordoceguera: {
        name: 'Sordoceguera',
        source: 'Adecuaciones de Acceso',
        context: [
            'Asigna lugar cómodo para estudiante y guía intérprete.',
            'Anticipa cambios de sala, mobiliario o actividad.',
            'Flexibiliza tiempos de desplazamiento y comunicación.'
        ],
        materials: [
            'Sube materiales al AVA con anticipación y formatos compatibles con líneas Braille.',
            'Prioriza recursos táctiles o descripciones textuales claras.'
        ],
        methods: [
            'Organiza secuencias previsibles, con información esencial claramente jerarquizada.',
            'Evita actividades dependientes de estímulos simultáneos no accesibles.'
        ],
        interaction: [
            'Coordina comunicación a través de guía intérprete cuando corresponda.',
            'Confirma acuerdos de apoyo antes de actividades fuera del aula.'
        ],
        evaluacion: [
            'Acuerda formatos de evaluación que permitan expresar los aprendizajes.',
            'Prioriza evaluaciones de ejecución práctica cuando sea posible.'
        ],
        tech: [
            'Asegura que la tecnología usada sea compatible con líneas Braille y guía intérprete.'
        ]
    },
    tactil: {
        name: 'Discapacidad sensorial táctil',
        source: 'Adecuaciones de Acceso',
        context: [
            'Asegura mobiliario ergonómico (mesa y silla ajustables) según necesidad.',
            'Reserva asiento con acceso a enchufe para trabajo en dispositivo electrónico si hay dificultad de escritura manual.'
        ],
        materials: [
            'Disponibiliza materiales en AVA con anterioridad para consulta previa.'
        ],
        methods: [
            'En actividades con manipulación de instrumentos, anticípate a las necesidades y ofrece alternativas.'
        ],
        interaction: [
            'Permite salir de la sala si el estudiante lo requiere.'
        ],
        evaluacion: [
            'Ofrece formatos alternativos (digital u oral) ante dificultades de escritura manual.',
            'Otorga tiempo adicional para responder evaluaciones cuando sea necesario.',
            'Flexibiliza plazos si el estudiante debe ausentarse por su condición.'
        ],
        tech: [
            'Permite el uso de dispositivos electrónicos como alternativa a la escritura manual.'
        ]
    },
    vestibular: {
        name: 'Discapacidad sensorial vestibular',
        source: 'Adecuaciones de Acceso',
        context: [
            'Mantén la sala ordenada y predecible, con iluminación adecuada y sin luces parpadeantes.',
            'Reserva asiento contiguo a una pared, lejos de ventanas con altura o brillos intensos.',
            'Evita movimientos bruscos o cambios repentinos que puedan generar desequilibrio.'
        ],
        materials: [
            'Usa fuentes claras y formatos simples, sin animaciones ni transiciones innecesarias.',
            'Ofrece textos de refuerzo para trabajo autónomo en formato amigable.'
        ],
        methods: [
            'Evita exceso de estímulos visuales y auditivos durante las clases.',
            'Si usas videos con estímulos intensos, avisa con anticipación para que el estudiante tome resguardos.'
        ],
        interaction: [
            'Permite que el estudiante se mueva o se retire de la sala si es necesario.',
            'En trabajos en equipo, entrega instrucciones y roles definidos con anticipación.'
        ],
        evaluacion: [
            'Otorga tiempo adicional para responder evaluaciones si es necesario.',
            'Flexibiliza plazos si el estudiante debe ausentarse por su condición.'
        ],
        tech: [
            'Evita tecnologías con estímulos visuales intensos o parpadeantes en evaluaciones.'
        ]
    },
    visceral: {
        name: 'Discapacidad visceral u orgánica',
        source: 'Adecuaciones de Acceso',
        context: [
            'Coordina ubicación cercana a ventilación, salida o servicios si es necesario.',
            'Considera mobiliario ergonómico o condiciones ambientales específicas.',
            'Flexibiliza pausas y asistencia según controles, tratamientos o episodios de salud.'
        ],
        materials: [
            'Mantén contenidos disponibles con anticipación para periodos de ausencia o fatiga.',
            'Ofrece alternativas digitales para continuidad.'
        ],
        methods: [
            'Planifica actividades por tramos para reducir sobrecarga física.',
            'Permite participación asincrónica cuando sea razonable.'
        ],
        interaction: [
            'Resguarda privacidad del diagnóstico y acuerda apoyos directamente con la persona.',
            'Evita interpretaciones disciplinarias de pausas o ausencias justificadas.'
        ],
        evaluacion: [
            'Flexibiliza plazos de entrega y fechas de evaluación según condición de salud.',
            'Otorga tiempo adicional para responder evaluaciones si es necesario.'
        ],
        tech: [
            'Facilita plataformas digitales para continuidad cuando el estudiante no pueda asistir.'
        ]
    },
    intelectual: {
        name: 'Discapacidad intelectual',
        source: 'Adecuaciones de Acceso',
        context: [
            'Reduce distractores y ubica al estudiante donde pueda pedir apoyo con facilidad.',
            'Mantén rutinas claras y predecibles.'
        ],
        materials: [
            'Usa lectura fácil, glosarios, ejemplos concretos y apoyos visuales simples.',
            'Entrega instrucciones en pasos numerados.'
        ],
        methods: [
            'Modela la tarea antes de pedir desempeño autónomo.',
            'Relaciona conceptos abstractos con situaciones reales o manipulables.'
        ],
        interaction: [
            'Verifica comprensión con preguntas concretas y sin infantilizar.',
            'Refuerza avances y estrategias usadas.'
        ],
        evaluacion: [
            'Entrega con anticipación y por escrito las fechas de evaluaciones.',
            'Segmenta instrucciones con pasos breves, a modo de lista de verificación.',
            'Prefiere preguntas directas y guiadas, evita enunciados extensos o ambiguos.',
            'Ofrece formatos alternativos (práctico, oral, visual) para comprobar aprendizajes.',
            'Otorga tiempo adicional y flexibiliza plazos de entrega.'
        ],
        tech: [
            'Apoya con organizadores gráficos digitales y calendarios de estudio.'
        ]
    },
    psiquica: {
        name: 'Discapacidad psíquica o salud mental',
        source: 'Adecuaciones de Acceso',
        context: [
            'Procura ambiente calmo, reglas conocidas y acceso claro a redes de apoyo.',
            'Evita exposición innecesaria en situaciones de alta ansiedad.'
        ],
        materials: [
            'Disponibiliza materiales antes de la clase para anticipación.',
            'Resume instrucciones críticas por escrito.'
        ],
        methods: [
            'Mantén estructura consistente y avisa cambios relevantes.',
            'Ofrece alternativas graduales para participación oral o grupal.'
        ],
        interaction: [
            'Usa comunicación clara, respetuosa y no punitiva frente a crisis o ausencias.',
            'Acuerda señales o canales de apoyo si corresponde.'
        ],
        evaluacion: [
            'Ofrece flexibilidad para presentaciones orales: opción sin público o solo frente al docente.',
            'Flexibiliza fechas y plazos cuando existan episodios documentados.',
            'Otorga tiempo adicional para responder evaluaciones si es necesario.'
        ],
        tech: [
            'Permite entrega de trabajos por medios digitales cuando la presencialidad sea una barrera.'
        ]
    },
    autismo: {
        name: 'Condición del Neurodesarrollo',
        source: 'Autismo',
        context: [
            'Anticipa estructura, reglas, tiempos de descanso y cambios de rutina.',
            'Permite audífonos con cancelación de ruido u otros apoyos sensoriales en trabajo autónomo.'
        ],
        materials: [
            'Entrega material antes de la clase y usa instrucciones explícitas.',
            'Evita ambigüedades, ironías o dobles sentidos no explicados.'
        ],
        methods: [
            'Divide actividades en pasos y explicita expectativas de logro.',
            'Ofrece alternativas para participación social o trabajo grupal.'
        ],
        interaction: [
            'Reconoce fortalezas: foco, honestidad, organización, memoria o interés intenso.',
            'Acuerda apoyos sin exigir divulgación pública de la condición.'
        ],
        evaluacion: [
            'Flexibiliza entregas, pausas y evaluaciones cuando exista sobrecarga o desregulación.',
            'Brinda información adicional durante la evaluación si el estudiante muestra signos de estrés.',
            'Ofrece tiempo adicional si es necesario.'
        ],
        tech: [
            'Permite el uso de audífonos con cancelación de ruido durante trabajo autónomo y evaluaciones.'
        ],
        highlights: [
            { title: 'Anticipación', text: 'Comunica estructura, actividades, tiempos y cambios antes de la clase.' },
            { title: 'Claridad', text: 'Define expectativas, reglas de participación y criterios de evaluación sin ambigüedades.' },
            { title: 'Trabajo grupal', text: 'Usa roles explícitos, retroalimentación y opción de reuniones individuales si aparecen dificultades.' },
            { title: 'Desregulación', text: 'Prioriza calma, flexibilidad, reducción de estímulos y coordinación con apoyos especializados.' }
        ],
        regulation: [
            {
                title: 'Antes',
                items: [
                    'Anticipa cambios de rutina, evaluaciones, trabajos grupales y transiciones.',
                    'Acuerda una forma discreta para pedir pausa o apoyo.',
                    'Identifica posibles sobrecargas sensoriales: ruido, luces, tiempos extensos o instrucciones ambiguas.'
                ]
            },
            {
                title: 'Durante',
                items: [
                    'Mantén un tono calmo, claro y breve.',
                    'Reduce estímulos y ofrece un espacio o pausa segura si es posible.',
                    'Evita confrontar, exigir explicación inmediata o exponer a la persona frente al curso.'
                ]
            },
            {
                title: 'Después',
                items: [
                    'Retoma la comunicación cuando la persona esté disponible para hacerlo.',
                    'Revisa qué desencadenó la situación y qué ajuste puede prevenirla.',
                    'Coordina apoyos especializados cuando corresponda, resguardando privacidad y dignidad.'
                ]
            }
        ]
    }
};

const goodPracticesData = [
    {
        title: 'Primero elimina barreras generales',
        text: 'Aplica DUA y ajustes de aula antes de pensar en una medida individual. Las adecuaciones se usan cuando persisten barreras específicas.'
    },
    {
        title: 'No bajes el estándar',
        text: 'Una adecuación de acceso cambia recursos, apoyos, tiempos o formatos, pero mantiene los resultados de aprendizaje.'
    },
    {
        title: 'Acuerda con la persona',
        text: 'Consulta preferencias y necesidades reales; no todas las personas con una misma discapacidad requieren el mismo apoyo.'
    },
    {
        title: 'Cuida continuidad y privacidad',
        text: 'Registra acuerdos útiles para próximas clases y resguarda información personal o diagnóstica.'
    }
];

const digitalAccessibilityData = [
    {
        id: 'materiales',
        label: 'Materiales',
        source: 'Accesibilidad Digital',
        intro: 'Un documento accesible permite ajustar lectura, navegar estructura y comprender información sin depender solo de lo visual.',
        items: [
            'Usa fuentes sin serifas y tamaño mínimo de 11 puntos; consulta preferencias si hay baja visión.',
            'Organiza con encabezados jerárquicos, listas reales y párrafos no justificados.',
            'Mantén contraste suficiente y no uses color como única señal.',
            'Describe imágenes, gráficos y mapas conceptuales con texto alternativo breve y útil.'
        ]
    },
    {
        id: 'audiovisual',
        label: 'Audiovisual',
        source: 'Accesibilidad Digital',
        intro: 'Los videos y audios necesitan alternativas para estudiantes sordos, con baja visión, dificultades de procesamiento o entornos sin sonido.',
        items: [
            'Incluye subtítulos o transcripciones para videos y podcasts.',
            'Agrega audiodescripción o explicación textual cuando la imagen aporte información clave.',
            'Evita efectos visuales o sonoros que puedan generar molestias o sobrecarga.',
            'Permite controlar reproducción, pausa y revisión del contenido.'
        ]
    },
    {
        id: 'ava',
        label: 'AVA / Blackboard',
        source: 'Accesibilidad Digital',
        intro: 'La navegación digital debe ser clara, predecible y compatible con tecnologías asistivas.',
        items: [
            'Publica recursos con nombres descriptivos y orden lógico.',
            'Evita documentos escaneados como imagen cuando se requiere lectura de texto.',
            'Entrega instrucciones, plazos y criterios en un lugar visible.',
                'Revisa accesibilidad con Blackboard Ally, validadores WCAG u otra herramienta disponible.'
        ]
    },
    {
        id: 'checklist',
        label: 'Checklist rápida',
        source: 'Accesibilidad Digital',
        intro: 'Antes de publicar un recurso, verifica lo esencial.',
        items: [
            '¿El objetivo y la forma de uso están claros?',
            '¿El texto tiene estructura, contraste y tamaño adecuados?',
            '¿Las imágenes tienen descripción o son marcadas como decorativas?',
            '¿Videos y audios tienen subtítulos, transcripción o alternativa?',
            '¿La actividad puede completarse con teclado o tecnología de apoyo?'
        ]
    }
];

const vocabularyData = [
    { bad: 'Minusválido/a', good: 'Persona con discapacidad o persona usuaria de silla de ruedas', why: 'Evita asociar discapacidad con menor valor personal.' },
    { bad: 'Persona con capacidades diferentes', good: 'Persona con discapacidad', why: 'Evita eufemismos que ocultan las barreras del entorno.' },
    { bad: 'Sordomudo/a', good: 'Persona sorda o persona con discapacidad auditiva', why: 'La sordera no implica imposibilidad de comunicarse.' },
    { bad: 'Lenguaje de señas', good: 'Lengua de señas', why: 'Reconoce que es una lengua de una comunidad lingüística.' },
    { bad: 'Invidente / no vidente', good: 'Persona ciega o persona con discapacidad visual', why: 'Nombra la condición sin negar otras formas de percepción.' },
    { bad: 'Sufre discapacidad', good: 'Persona con discapacidad', why: 'Evita presentar la discapacidad como tragedia individual.' },
    { bad: 'Retraso mental', good: 'Persona con discapacidad intelectual', why: 'Usa terminología vigente y respetuosa.' },
    { bad: 'Autista como etiqueta totalizante', good: 'Persona autista o estudiante autista, según preferencia', why: 'Reconoce identidad y evita reducir a la persona a un diagnóstico.' }
];

const autismMyths = [
    'No todas las personas autistas presentan las mismas características ni requieren los mismos apoyos.',
    'La comunicación puede ser oral, escrita, visual, gestual o mediada por apoyos.',
    'La desregulación no es mala conducta: suele responder a sobrecarga, ansiedad o estímulos desencadenantes.',
    'Durante una desregulación, confrontar, ironizar o exigir explicación inmediata puede aumentar la sobrecarga.',
    'Las fortalezas también importan: justicia social, honestidad, foco, organización e intereses intensos pueden enriquecer el aprendizaje.'
];

const glossaryData = [
    { term: 'Accesibilidad universal', desc: 'Condición que permite que entornos, procesos, productos y servicios sean comprensibles y utilizables por todas las personas.' },
    { term: 'Ajustes razonables', desc: 'Modificaciones necesarias y pertinentes para asegurar participación en igualdad de condiciones sin imponer carga desproporcionada.' },
    { term: 'Barreras', desc: 'Factores físicos, comunicacionales, digitales, sociales o actitudinales que limitan participación y aprendizaje.' },
    { term: 'Lectura fácil', desc: 'Forma de redactar y presentar información con palabras simples, estructura clara y apoyos para comprensión.' },
    { term: 'Macrotipo', desc: 'Texto ampliado para personas con baja visión, ajustado según necesidad real y no como solución automática.' },
    { term: 'Desregulación emocional o sensorial', desc: 'Respuesta intensa ante sobrecarga sensorial o emocional; requiere calma, reducción de estímulos, respeto y apoyos acordados.' },
    { term: 'Neurodiversidad', desc: 'Reconocimiento de la variabilidad neurológica humana como parte natural de la diversidad.' },
    { term: 'Texto alternativo', desc: 'Descripción breve y funcional de una imagen para transmitir su propósito a quienes no la perciben visualmente.' }
];

const accessMatrixActivities = [
    { id: 'escribir',      label: 'Escribir',                         dims: ['evaluacion','tech'],          conds: ['fisica','tactil','intelectual'] },
    { id: 'leer',          label: 'Leer',                             dims: ['materials'],                  conds: ['visual','sordoceguera','intelectual'] },
    { id: 'hablar',        label: 'Hablar',                           dims: ['interaction'],                conds: ['auditiva','sordoceguera','autismo','psiquica'] },
    { id: 'recordar',      label: 'Recordar cosas',                   dims: ['methods'],                    conds: ['intelectual','psiquica','autismo'] },
    { id: 'examenes',      label: 'Rendir exámenes',                  dims: ['evaluacion'],                 conds: ['fisica','auditiva','visual','sordoceguera','tactil','vestibular','visceral','intelectual','psiquica','autismo'] },
    { id: 'practicos',     label: 'Participar en ramos prácticos',    dims: ['methods','interaction'],      conds: ['fisica','auditiva','visual','sordoceguera','tactil','vestibular','autismo','visceral'] },
    { id: 'sala_clases',   label: 'Participar en la sala de clases',  dims: ['interaction','context'],      conds: ['auditiva','visual','sordoceguera','autismo','psiquica'] },
    { id: 'sociales',      label: 'Participar en actividades sociales',dims: ['interaction'],               conds: ['auditiva','sordoceguera','autismo','psiquica'] },
    { id: 'practicas_rec', label: 'Participar en actividades prácticas',dims: ['interaction','context'],     conds: ['fisica','vestibular','auditiva','visual'] },
    { id: 'ayuda',         label: 'Obtener ayuda',                    dims: ['interaction'],                conds: ['auditiva','sordoceguera','autismo','psiquica','intelectual'] },
    { id: 'acceder',       label: 'Acceder a la institución',         dims: ['context'],                    conds: ['fisica','visual','vestibular'] }
];

window.UiePlannerData = {
    referencesData,
    principleCards,
    duaStagesData,
    resourcesData,
    accommodationsData,
    goodPracticesData,
    digitalAccessibilityData,
    vocabularyData,
    autismMyths,
    glossaryData,
    accessMatrixActivities
};

})();
