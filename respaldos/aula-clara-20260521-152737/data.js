(function () {
const referencesData = [
    { code: 'CAST', title: 'CAST: Universal Design for Learning', file: 'https://www.cast.org/what-we-do/universal-design-for-learning/' },
    { code: 'WCAG', title: 'W3C WAI: Web Content Accessibility Guidelines', file: 'https://www.w3.org/WAI/standards-guidelines/wcag/' },
    { code: 'ONU', title: 'Convención sobre los Derechos de las Personas con Discapacidad, artículo 24', file: 'https://www.un.org/development/desa/disabilities/convention-on-the-rights-of-persons-with-disabilities/article-24-education.html' },
    { code: 'UNESCO', title: 'UNESCO GEM Report: Inclusion and education', file: 'https://www.unesco.org/gem-report/en/inclusion' },
    { code: 'OMS', title: 'OMS: Clasificación Internacional del Funcionamiento, la Discapacidad y la Salud', file: 'https://www.who.int/standards/classifications/icf' },
    { code: 'CDC', title: 'CDC: Autism Spectrum Disorder', file: 'https://www.cdc.gov/autism/about/index.html' },
    { code: 'UDL', title: 'Understood: guía práctica de UDL para docentes', file: 'https://www.understood.org/en/articles/understanding-universal-design-for-learning' },
    { code: 'SENADIS', title: 'SENADIS: documentos y herramientas de educación inclusiva', file: 'https://www.senadis.gob.cl/pag/138/435/documentos_y_herramientas' },
    { code: 'MINEDUC', title: 'MINEDUC: Marco general de educación inclusiva', file: 'https://bibliotecadigital.mineduc.cl/handle/20.500.12365/21299' },
    { code: 'LEY 20.422', title: 'Ley 20.422: igualdad de oportunidades e inclusión social de personas con discapacidad', file: 'https://www.bcn.cl/leychile/Navegar?idNorma=1010903' },
    { code: 'LEY TEA', title: 'Ley 21.545: inclusión, atención integral y derechos de personas autistas', file: 'https://www.bcn.cl/leychile/navegar?f=2023-03-10&i=1190123' },
    { code: 'DEC. 83', title: 'Decreto 83: diversificación de la enseñanza y adecuaciones curriculares', file: 'https://www.bcn.cl/leychile/navegar?idNorma=1074511' }
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
            source: 'DUA aplicado',
            intro: 'Conoce al grupo antes de escoger estrategias. No todos los cursos son diversos en el mismo sentido.',
            focus: ['Levantar preferencias, barreras e intereses.', 'Revisar antecedentes compartidos por equipos de apoyo.', 'Observar clima, participación y necesidades de apoyo.'],
            checklist: [
                'Revisé antecedentes disponibles y acuerdos de apoyo autorizados.',
            'Apliqué una encuesta, diálogo o actividad breve para conocer intereses y preferencias.',
            'Identifiqué barreras físicas, sensoriales, digitales o actitudinales del curso.',
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
            'Anticipé alternativas de respuesta: escrita, oral, visual, práctica o digital.'
        ],
        example: 'Para una evaluación aplicada, permite escoger entre informe breve, demostración técnica o defensa oral con pauta común.'
    },
    {
        id: 'integracion',
        label: 'Integración',
        badge: 'En el aula',
            source: 'DUA aplicado',
        intro: 'Observa cómo interactúan los estudiantes con materiales, tiempos, equipos y AVA. La implementación también produce nueva información.',
        focus: ['Monitorear participación real.', 'Ajustar ritmos y apoyos durante la clase.', 'Promover pertenencia y colaboración con roles claros.'],
        checklist: [
            'Expliqué la estructura de la clase y anticipé cambios de rutina.',
            'Usé ejemplos conectados con contextos reales y diversos.',
            'Organicé trabajo colaborativo con roles definidos y monitoreo.',
            'Entregué retroalimentación oportuna centrada en progreso y estrategia.',
            'Permití pausas, aclaraciones o apoyos cuando aparecieron barreras no previstas.'
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
            'Planifiqué una mejora concreta para la siguiente clase.'
        ],
        example: 'Si muchos estudiantes pidieron instrucciones nuevamente, convierte la pauta en una lista visible con ejemplo de entrega esperada.'
    }
];

const resourcesData = [
    { title: 'Ideas y variantes', text: 'Puedes usar herramientas digitales para generar alternativas de actividad, rúbrica o ejemplo, revisando siempre pertinencia y accesibilidad.', source: 'DUA aplicado' },
    { title: 'Participación sin exposición', text: 'Foros, encuestas o tableros colaborativos pueden levantar dudas e intereses sin exigir participación oral inmediata.', source: 'DUA aplicado' },
    { title: 'Material visual accesible', text: 'Todo recurso visual debe cuidar contraste, lectura lineal, subtítulos y texto alternativo cuando corresponda.', source: 'Accesibilidad Digital' }
];

const accommodationsData = {
    fisica: {
        name: 'Discapacidad física o movilidad reducida',
        source: 'Adecuaciones de Acceso',
        context: ['Asegura rutas accesibles, mesa adecuada y espacio de circulación.', 'Coordina ubicación estratégica según movilidad, fatiga o uso de apoyos.'],
        materials: ['Disponibiliza materiales digitales con anticipación.', 'Permite uso de computador, grabación o ayudas técnicas.'],
        methods: ['Flexibiliza formato de actividades prácticas cuando exista dificultad motora.', 'Divide tareas extensas en etapas verificables.'],
        interaction: ['Evita asumir ayuda sin preguntarla; acuerda apoyos con la persona.', 'Considera participación oral, digital o asistida.'],
        time: ['Otorga tiempo adicional o pausas cuando exista fatiga, dolor o barreras de desplazamiento.']
    },
    auditiva: {
        name: 'Discapacidad auditiva',
        source: 'Adecuaciones de Acceso',
        context: ['Facilita asiento con buena visibilidad del docente, intérprete o pizarra.', 'Reduce ruido de fondo y ordena turnos de habla.'],
        materials: ['Entrega instrucciones y contenidos clave por escrito.', 'Asegura subtítulos, transcripciones o guiones de material audiovisual.'],
        methods: ['Apoya explicaciones orales con esquemas, palabras clave y ejemplos escritos.', 'Verifica comprensión sin exponer públicamente.'],
        interaction: ['Respeta lengua de señas, lectura labial, audífonos, implantes o intérprete según corresponda.', 'Habla de frente y evita cubrir la boca.'],
        time: ['Da tiempo adicional para procesar instrucciones escritas extensas o mediadas por interpretación.']
    },
    visual: {
        name: 'Discapacidad visual o baja visión',
        source: 'Adecuaciones de Acceso',
        context: ['Coordina ubicación, iluminación y acceso a enchufes según necesidad.', 'Evita cambiar mobiliario sin avisar.'],
        materials: ['Usa documentos accesibles, editables y compatibles con lector de pantalla.', 'Describe imágenes, gráficos y acciones realizadas en pizarra.'],
        methods: ['No dependas solo del color, la ubicación visual o gestos para comunicar información.', 'Ofrece alternativas táctiles, auditivas o digitales cuando sea pertinente.'],
        interaction: ['Pregunta preferencias de formato: macrotipo, lector de pantalla, audio o Braille digital.', 'Lee en voz alta información proyectada relevante.'],
        time: ['Otorga más tiempo para lectura, navegación, evaluación o producción escrita.']
    },
    sordoceguera: {
        name: 'Sordoceguera',
        source: 'Adecuaciones de Acceso',
        context: ['Asigna lugar cómodo para estudiante y guía intérprete.', 'Anticipa cambios de sala, mobiliario o actividad.'],
        materials: ['Sube materiales al AVA con anticipación y formatos compatibles con líneas Braille.', 'Prioriza recursos táctiles o descripciones textuales claras.'],
        methods: ['Organiza secuencias previsibles, con información esencial claramente jerarquizada.', 'Evita actividades dependientes de estímulos simultáneos no accesibles.'],
        interaction: ['Coordina comunicación a través de guía intérprete cuando corresponda.', 'Confirma acuerdos de apoyo antes de actividades fuera del aula.'],
        time: ['Flexibiliza tiempos de desplazamiento, comunicación, lectura y respuesta.']
    },
    visceral: {
        name: 'Discapacidad visceral u orgánica',
        source: 'Adecuaciones de Acceso',
        context: ['Coordina ubicación cercana a ventilación, salida o servicios si es necesario.', 'Considera mobiliario ergonómico o condiciones ambientales específicas.'],
        materials: ['Mantén contenidos disponibles con anticipación para periodos de ausencia o fatiga.', 'Ofrece alternativas digitales para continuidad.'],
        methods: ['Planifica actividades por tramos para reducir sobrecarga física.', 'Permite participación asincrónica cuando sea razonable.'],
        interaction: ['Resguarda privacidad del diagnóstico y acuerda apoyos directamente con la persona.', 'Evita interpretaciones disciplinarias de pausas o ausencias justificadas.'],
        time: ['Flexibiliza plazos, pausas y asistencia según controles, tratamientos o episodios de salud.']
    },
    intelectual: {
        name: 'Discapacidad intelectual',
        source: 'Adecuaciones de Acceso',
        context: ['Reduce distractores y ubica al estudiante donde pueda pedir apoyo con facilidad.', 'Mantén rutinas claras y predecibles.'],
        materials: ['Usa lectura fácil, glosarios, ejemplos concretos y apoyos visuales simples.', 'Entrega instrucciones en pasos numerados.'],
        methods: ['Modela la tarea antes de pedir desempeño autónomo.', 'Relaciona conceptos abstractos con situaciones reales o manipulables.'],
        interaction: ['Verifica comprensión con preguntas concretas y sin infantilizar.', 'Refuerza avances y estrategias usadas.'],
        time: ['Otorga tiempo adicional y divide evaluaciones o trabajos extensos.']
    },
    psiquica: {
        name: 'Discapacidad psíquica o salud mental',
        source: 'Adecuaciones de Acceso',
            context: ['Procura ambiente calmo, reglas conocidas y acceso claro a redes de apoyo.', 'Evita exposición innecesaria en situaciones de alta ansiedad.'],
        materials: ['Disponibiliza materiales antes de la clase para anticipación.', 'Resume instrucciones críticas por escrito.'],
        methods: ['Mantén estructura consistente y avisa cambios relevantes.', 'Ofrece alternativas graduales para participación oral o grupal.'],
        interaction: ['Usa comunicación clara, respetuosa y no punitiva frente a crisis o ausencias.', 'Acuerda señales o canales de apoyo si corresponde.'],
        time: ['Flexibiliza fechas y pausas cuando existan episodios de salud mental documentados.']
    },
    autismo: {
        name: 'Neurodesarrollo / estudiantes autistas',
        source: 'Autismo',
        context: ['Anticipa estructura, reglas, tiempos de descanso y cambios de rutina.', 'Permite audífonos con cancelación de ruido u otros apoyos sensoriales en trabajo autónomo.'],
        materials: ['Entrega material antes de la clase y usa instrucciones explícitas.', 'Evita ambigüedades, ironías o dobles sentidos no explicados.'],
        methods: ['Divide actividades en pasos y explicita expectativas de logro.', 'Ofrece alternativas para participación social o trabajo grupal.'],
        interaction: ['Reconoce fortalezas: foco, honestidad, organización, memoria o interés intenso.', 'Acuerda apoyos sin exigir divulgación pública de la condición.'],
        time: ['Flexibiliza entregas, pausas y evaluaciones cuando exista sobrecarga o desregulación.'],
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

window.AulaClaraData = {
    referencesData,
    principleCards,
    duaStagesData,
    resourcesData,
    accommodationsData,
    goodPracticesData,
    digitalAccessibilityData,
    vocabularyData,
    autismMyths,
    glossaryData
};

})();
