/* ==========================================================================
   PLANIFICADOR DE CLASES INCLUSIVAS - LÓGICA JAVASCRIPT
   Funcionalidades: Conmutador de Temas, Checklist reactiva, Buscador de
   Adecuaciones por NEE, Buscador de Vocabulario y Glosario en tiempo real.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. SISTEMA DE TEMAS Y ACCESIBILIDAD
       ========================================================================== */
    const themeButtons = {
        'theme-light': 'theme-light',
        'theme-dark': 'theme-dark',
        'theme-contrast': 'theme-contrast'
    };

    const body = document.body;

    // Recuperar tema preferido de localStorage
    const savedTheme = localStorage.getItem('user-theme') || 'theme-light';
    setTheme(savedTheme);

    // Event Listeners para botones de tema
    Object.keys(themeButtons).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', () => {
                const targetTheme = themeButtons[btnId];
                setTheme(targetTheme);
            });
        }
    });

    function setTheme(themeName) {
        // Remover clases de tema actuales
        body.classList.remove('theme-light', 'theme-dark', 'theme-contrast');
        
        // Agregar la clase de tema seleccionada
        body.classList.add(themeName);
        
        // Guardar preferencia
        localStorage.setItem('user-theme', themeName);

        // Actualizar estados 'aria-checked' en el grupo de radio de accesibilidad
        Object.keys(themeButtons).forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                const isCurrent = themeButtons[btnId] === themeName;
                btn.setAttribute('aria-checked', isCurrent ? 'true' : 'false');
                if (isCurrent) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
    }

    /* ==========================================================================
       2. CONTROLADOR DE PESTAÑAS (CHECKLIST DE PLANIFICACIÓN)
       ========================================================================== */
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Desactivar pestañas actuales
            tabLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            
            // Ocultar paneles actuales
            tabPanels.forEach(p => {
                p.classList.remove('active');
                p.setAttribute('hidden', '');
            });

            // Activar pestaña clickeada
            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');

            // Mostrar panel correspondiente
            const targetPanelId = link.getAttribute('aria-controls');
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
                targetPanel.removeAttribute('hidden');
            }
        });
    });

    /* ==========================================================================
       3. LÓGICA REACTIVA DE CHECKLIST Y BARRA DE PROGRESO
       ========================================================================== */
    const checkboxes = document.querySelectorAll('.DUA-checkbox');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressAria = document.getElementById('progress-bar-aria');
    const btnResetChecklist = document.getElementById('btn-reset-checklist');
    const btnPrintPlan = document.getElementById('btn-print-plan');

    // Cargar estados guardados de la checklist de localStorage
    loadChecklistState();
    updateProgress();

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            saveChecklistState();
            updateProgress();
        });
    });

    // Resetear checklist
    if (btnResetChecklist) {
        btnResetChecklist.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas limpiar todo tu progreso en la checklist de planificación?')) {
                checkboxes.forEach(cb => cb.checked = false);
                saveChecklistState();
                updateProgress();
            }
        });
    }

    // Guardar checklist en localStorage
    function saveChecklistState() {
        const state = [];
        checkboxes.forEach((cb, index) => {
            state.push({ index, checked: cb.checked });
        });
        localStorage.setItem('dua-checklist-state', JSON.stringify(state));
    }

    // Cargar checklist de localStorage
    function loadChecklistState() {
        const savedState = localStorage.getItem('dua-checklist-state');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                state.forEach(item => {
                    if (checkboxes[item.index]) {
                        checkboxes[item.index].checked = item.checked;
                    }
                });
            } catch (e) {
                console.error("Error al cargar el estado de la checklist:", e);
            }
        }
    }

    // Actualizar porcentaje de progreso
    function updateProgress() {
        const total = checkboxes.length;
        if (total === 0) return;
        
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = Math.round((checkedCount / total) * 100);

        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${percentage}% completado (${checkedCount} de ${total} pautas DUA)`;
        }
        if (progressAria) {
            progressAria.setAttribute('aria-valuenow', percentage);
        }
    }

    // Botón de impresión a PDF
    if (btnPrintPlan) {
        btnPrintPlan.addEventListener('click', () => {
            window.print();
        });
    }

    /* ==========================================================================
       4. DATOS Y BUSCADOR DE ADECUACIONES DE ACCESO POR NEE
       ========================================================================== */
    const accommodationsData = {
        fisica: {
            name: 'Discapacidad Física (Alteración Motora/Locomotora)',
            presentation: [
                'Disponer de materiales de clase en formato digital con anterioridad.',
                'Utilizar documentos compatibles con tecnologías asistivas (lectores de pantalla, etc.) si hay impedimentos para escribir.',
                'Permitir que ayudantes o compañeros lean o refuercen instrucciones complejas.'
            ],
            response: [
                'Permitir el uso de computador o dispositivo inteligente personal para toma de apuntes y redacción en evaluaciones.',
                'Flexibilizar el formato de entrega: permitir grabaciones de voz o defensas orales si existe dificultad motora fina para escribir.',
                'Autorizar la grabación de la clase en audio para apoyo en el estudio autónomo.'
            ],
            environment: [
                'Garantizar el acceso autónomo y sin barreras a la sala (rutas sin escalones, rampas adecuadas y ascensores).',
                'Facilitar una ubicación estratégica en la sala con una mesa de altura ajustable y espacio suficiente para silla de ruedas.',
                'Disponer de sillas de apoyo complementarias si hay actividades prácticas que exigen estar de pie.'
            ],
            time: [
                'Otorgar flexibilidad y tiempo adicional en la realización de ejercicios prácticos, tareas y evaluaciones.',
                'Flexibilizar plazos de entrega si el estudiante sufre de fatiga o debe ausentarse por controles de salud.',
                'Coordinar pausas regulares de descanso físico durante el transcurso de clases y talleres largos.'
            ]
        },
        auditiva: {
            name: 'Discapacidad Sensorial Auditiva (Sordera / Hipoacusia)',
            presentation: [
                'Asegurar que todo material audiovisual proyectado en clase (videos, clips) cuente con subtítulos en español.',
                'Proporcionar un guion escrito o transcripción en texto si los videos no poseen subtítulos.',
                'Escribir en la pizarra las instrucciones clave de la sesión de manera sincrónica.',
                'Entregar por escrito (Word, PDF) con anticipación toda la información que se expondrá de manera oral.'
            ],
            response: [
                'Permitir el uso de computador u otras ayudas técnicas de software en evaluaciones orales o escritas.',
                'Facilitar que el estudiante exprese ideas de forma escrita en reemplazo de exposiciones verbales si lo prefiere.',
                'Si cuenta con el servicio institucional **Transvoz**, permitir y autorizar la grabación de la clase para transcripción en vivo.'
            ],
            environment: [
                'Facilitar un asiento estratégico reservado en las primeras filas para favorecer la lectura labiofacial y audición.',
                'Garantizar la presencia cómoda y la ubicación del intérprete de Lengua de Señas Chilena (ILSCh) en la sala.',
                'Mantener un adecuado clima de aula, evitando ruidos de fondo que interfieran con audífonos o implantes cocleares.'
            ],
            time: [
                'Otorgar tiempo adicional para procesar e interpretar instrucciones escritas extensas durante pruebas.',
                'Asegurar un ritmo de explicación pausado, coordinando con el intérprete para que la información fluya adecuadamente.',
                'Planificar pausas cortas para relajar la atención visual continua.'
            ]
        },
        visual: {
            name: 'Discapacidad Sensorial Visual (Ceguera / Baja Visión)',
            presentation: [
                'Entregar materiales y documentos de estudio ordenados en el AVA con suficiente anterioridad en formatos editables (Word, PDF accesibles).',
                'Asegurar que los materiales se puedan transcribir a Braille digital y sean interpretables por lectores de pantalla.',
                'Al proyectar información (Canva, ppt), usar letra grande sin serifas (>14 pt), alto contraste y evitar elementos sobrecargados.',
                'Leer en voz alta todo lo que se escriba en la pizarra o se proyecte en la pantalla.'
            ],
            response: [
                'Permitir la realización de pruebas y tareas en formato enteramente digital utilizando plataformas accesibles (AVA).',
                'Autorizar exámenes orales en reemplazo de pruebas escritas tradicionales.',
                'Permitir que el estudiante grabe sus respuestas en audio en lugar de escribir a mano.'
            ],
            environment: [
                'Reservar un asiento preferencial contiguo a enchufes de corriente para asegurar la conexión del PC portátil.',
                'Asegurar una iluminación uniforme y constante en la sala, evitando deslumbramientos o contrastes lumínicos bruscos.',
                'Orientar al estudiante de forma verbal en el espacio físico y evitar absolutamente cambiar la disposición del mobiliario sin aviso.'
            ],
            time: [
                'Otorgar más tiempo en la ejecución de evaluaciones escritas y lectura de textos largos.',
                'Flexibilizar los plazos de entrega de trabajos prácticos que requieran un procesamiento visual de información.',
                'Permitir descansos visuales durante pruebas extensas.'
            ]
        },
        sordoceguera: {
            name: 'Discapacidad Sensorial Sordoceguera (Disfuncionalidad Auditiva y Visual Conjunta)',
            presentation: [
                'Asegurar materiales de estudio cargados en el AVA con anterioridad para compatibilidad con líneas Braille portátiles.',
                'Priorizar la entrega de material impreso adaptado (Braille o macrotipo de alto contraste) y recursos táctiles.',
                'Establecer comunicación a través de su guía intérprete de forma constante.'
            ],
            response: [
                'Acordar de manera individualizada formatos de evaluación específicos (pruebas orales, digitales Braille, etc.).',
                'Priorizar evaluaciones de carácter práctico y de ejecución manual.',
                'Permitir el uso de software adaptativo especializado en el aula.'
            ],
            environment: [
                'Asignar un espacio físico cómodo y estratégico para el estudiante y su guía intérprete.',
                'Asegurar un entorno libre de obstáculos en pasillos y zonas de desplazamiento.',
                'Mantener una ubicación fija y predecible de todos los recursos.'
            ],
            time: [
                'Otorgar tiempos extendidos significativos para evaluaciones y tareas.',
                'Coordinar con anticipación cualquier cambio en los horarios, rutinas o salas de clases.',
                'Permitir descansos frecuentes debido a la alta carga de fatiga sensorial.'
            ]
        },
        tactil: {
            name: 'Discapacidad Sensorial Táctil (Déficit de Percepción Táctil / Texturas / Dolor)',
            presentation: [
                'Proporcionar información clave de forma visual y auditiva simultánea.',
                'Asegurar materiales teóricos alternativos en el AVA con anterioridad.'
            ],
            response: [
                'Si hay dificultad para la escritura manual, proporcionar formatos de evaluación oral o digital en PC.',
                'Autorizar el uso de grabadoras de voz en clase.'
            ],
            environment: [
                'Disponer de implementos ergonómicos y mobiliario adaptable (mesas y sillas regulables).',
                'Garantizar acceso a enchufes para dispositivos de transcripción digital.'
            ],
            time: [
                'Otorgar mayor tiempo para responder evaluaciones prácticas que involucren manipulación de instrumentos.',
                'Flexibilizar plazos si el estudiante sufre crisis de dolor o debe ausentarse por su condición.'
            ]
        },
        vestibular: {
            name: 'Discapacidad Sensorial Vestibular (Afectación del Equilibrio, Postura y Orientación Espacial)',
            presentation: [
                'Asegurar que las presentaciones del docente tengan fuentes claras, formatos simples, sin animaciones ni transiciones rápidas.',
                'Ofrecer lecturas de refuerzo en el AVA con anterioridad para que el estudiante trabaje de forma autónoma en momentos de crisis.',
                'Evitar proyectar videos con movimientos bruscos de cámara o destellos intensos.'
            ],
            response: [
                'Permitir que el estudiante grabe la sesión o realice tareas teóricas asíncronas en caso de inasistencia por vértigo.',
                'Evitar exigir demostraciones físicas o de equilibrio si el alumno experimenta desequilibrio.'
            ],
            environment: [
                'Garantizar un asiento estratégico reservado alejado de ventanas altas y contiguo a la pared para mayor estabilidad y seguridad.',
                'Mantener el aula con una disposición ordenada, limpia y altamente predecible.',
                'Evitar luces parpadeantes, brillantes o tubos fluorescentes defectuosos en la sala.'
            ],
            time: [
                'Permitir plazos flexibles en la entrega de tareas o rendición de pruebas si se presentan episodios de vértigo o migraña.',
                'Facilitar descansos regulares y pausas para que el estudiante restablezca su orientación.'
            ]
        },
        visceral: {
            name: 'Discapacidad Visceral (Afección de Órganos Internos / Cardiovascular, Digestivo, Endocrino, etc.)',
            presentation: [
                'Facilitar material de estudio de refuerzo de forma digital (AVA) para estudio autónomo en caso de inasistencia por crisis médicas.',
                'Asegurar acceso a la información teórica previa.'
            ],
            response: [
                'Flexibilizar la entrega de trabajos colaborativos, permitiendo que el estudiante participe de forma asíncrona si hay hospitalización o crisis.',
                'Permitir evaluaciones orales o reprogramaciones ágiles de pruebas.'
            ],
            environment: [
                'Ubicar al estudiante en un asiento reservado cercano a la puerta de salida para garantizar un acceso rápido e inmediato a los baños.',
                'Garantizar condiciones de ventilación óptimas en la sala de clases y evitar la exposición directa a la luz solar si hay medicación sensible.',
                'Evaluar el uso de sillas ergonómicas especiales.'
            ],
            time: [
                'Facilitar plazos flexibles y extensiones de tiempo justas para tareas y exámenes en periodos de inasistencia justificada.',
                'Permitir pausas de autocuidado durante evaluaciones largas (toma de medicamentos, visitas al baño).'
            ]
        },
        intelectual: {
            name: 'Discapacidad Intelectual (Dificultades Cognitivas / Aprendizaje)',
            presentation: [
                'Declarar de forma oral y escrita con absoluta claridad el objetivo de la clase y el orden lógico de las actividades.',
                'Segmentar las instrucciones largas en pasos secuenciados, breves y de fácil lectura (apoyados en diagramas).',
                'Complementar explicaciones teóricas abstractas con videos prácticos, metáforas cotidianas y esquemas gráficos.',
                'Destaque títulos, fórmulas y palabras clave usando colores significativos y tipografías claras.'
            ],
            response: [
                'Priorizar exámenes de formato objetivo (opción múltiple, verdadero/falso, completar blancos) con instrucciones claras e inequívocas.',
                'Segmentar los ejercicios en partes pequeñas, permitiendo que el alumno complete una fase antes de pasar a la siguiente.',
                'Ofrecer formatos de respuesta alternativos (evaluaciones orales o demostraciones prácticas).'
            ],
            environment: [
                'Reservar un asiento en primera fila para facilitar el foco y la atención, reduciendo distractores del entorno.',
                'Establecer acuerdos comunitarios en el aula respecto al uso ordenado de celulares y límites de ruido ambiental.'
            ],
            time: [
                'Otorgar tiempo adicional de forma regular para responder evaluaciones y realizar ejercicios de cálculo.',
                'Flexibilizar los plazos de entrega, adaptándolos al ritmo de aprendizaje del estudiante.',
                'Realizar breves pausas de descanso cognitivo entre explicaciones teóricas densas.'
            ]
        },
        psiquica: {
            name: 'Discapacidad Psíquica Mental (Afectación de la Salud Mental / Trastornos de Ansiedad, Depresión, etc.)',
            presentation: [
                'Facilitar material en el AVA con anterioridad para que el estudiante anticipe los contenidos y reduzca los niveles de ansiedad.',
                'Evitar instrucciones ambiguas o con consecuencias punitivas severas, promoviendo una comunicación empática y estructurada.'
            ],
            response: [
                'En exposiciones orales que generen crisis de ansiedad severa, permitir realizarlas frente a un público reducido o en privado ante el docente.',
                'Dar instrucciones por escrito claras y con criterios de evaluación específicos (rúbricas detalladas).'
            ],
            environment: [
                'Mantener un ambiente calmo, predecible y libre de estigmas dentro del aula de clases.',
                'Permitir al estudiante salir temporalmente de la sala de clases para autorregularse en caso de experimentar un ataque de pánico o crisis.',
                'Facilitar el acceso directo a redes de apoyo institucional.'
            ],
            time: [
                'Otorgar flexibilidad y prórrogas en las fechas límite de entrega de trabajos en periodos de crisis de salud mental.',
                'Proporcionar tiempo adicional en exámenes y permitir pausas de autorregulación durante los mismos.'
            ]
        },
        neurodesarrollo: {
            name: 'Condición del Espectro Autista (TEA / CEA)',
            presentation: [
                'Establecer rutinas de clase muy estructuradas, consistentes y anticipar con total claridad el plan de cada sesión.',
                'Evitar la comunicación no verbal implícita; entregar instrucciones paso a paso de forma oral y escrita simultáneamente.',
                'Evitar el uso de lenguaje ambiguo, modismos, ironías, sarcasmo o dobles sentidos sin aclararlos inmediatamente.',
                'Uso sistemático de organizadores gráficos, diagramas de flujo y mapas mentales como apoyo visual.'
            ],
            response: [
                'Evitar evaluaciones sorpresa o sin previo aviso bajo ninguna circunstancia.',
                'Ofrecer formatos de evaluación objetivos y estructurados (cuestionarios digitales, rúbricas sin ambigüedad).',
                'Permitir el uso de PC o grabadoras de audio para registrar las ideas durante las evaluaciones.',
                'Brindar flexibilidad en trabajos colaborativos (definir roles estrictos, mediar en la formación de grupos y permitir alternativas individuales).'
            ],
            environment: [
                'Permitir y autorizar el uso de audífonos con cancelación de ruido o tapones en momentos de trabajo autónomo.',
                'Propiciar un entorno sensorialmente amigable: iluminación constante y suave (evitar parpadeos), colores neutros, reducción de ruidos molestos.',
                'Vigilar activamente el aula para erradicar cualquier comentario agresivo o estigmatizante de compañeros.'
            ],
            time: [
                'Otorgar tiempo adicional en exámenes y programar pausas supervisadas breves de autorregulación sensorial.',
                'Anticipar y programar con suficiente antelación todas las fechas de evaluaciones y entregas de trabajos.',
                'En caso de desregulación emocional/meltdown: guiar con empatía a un espacio tranquilo (zona de confort), no presionar ni invadir verbalmente.'
            ]
        }
    };

    const neeSelect = document.getElementById('nee-select');
    const resultsBox = document.getElementById('accommodations-results');
    const placeholderBox = document.getElementById('accommodations-placeholder');

    const neeName = document.getElementById('selected-nee-name');
    const listPresentation = document.getElementById('acc-presentation');
    const listResponse = document.getElementById('acc-response');
    const listEnvironment = document.getElementById('acc-environment');
    const listTime = document.getElementById('acc-time');

    if (neeSelect) {
        neeSelect.addEventListener('change', () => {
            const val = neeSelect.value;
            const data = accommodationsData[val];
            
            if (data) {
                // Rellenar datos dinámicos
                neeName.textContent = data.name;
                populateList(listPresentation, data.presentation);
                populateList(listResponse, data.response);
                populateList(listEnvironment, data.environment);
                populateList(listTime, data.time);
                
                // Mostrar caja de resultados
                resultsBox.classList.remove('hidden');
                placeholderBox.classList.add('hidden');
                
                // Animación suave de aparición
                resultsBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    function populateList(listElement, itemsArray) {
        listElement.innerHTML = '';
        itemsArray.forEach(text => {
            const li = document.createElement('li');
            li.textContent = text;
            listElement.appendChild(li);
        });
    }

    /* ==========================================================================
       5. DATOS Y BUSCADOR DE VOCABULARIO INCLUSIVO Y GLOSARIO
       ========================================================================== */
    const vocabularyData = [
        { bad: 'Invidente / No vidente', good: 'Persona ciega o persona con discapacidad visual.', reason: 'La ceguera es una condición que no define la totalidad de la persona. Utilizar "persona con..." antepone la dignidad del individuo por delante de su condición de salud.' },
        { bad: 'Lenguaje de Señas', good: 'Lengua de señas.', reason: 'Se denomina "lengua" porque posee una gramática propia, compleja y estructurada, siendo el patrimonio intangible y lengua natural de la comunidad sorda.' },
        { bad: 'Minusválido / Lisiado / Incapaz', good: 'Persona con discapacidad física o persona usuaria de silla de ruedas.', reason: 'El término "minusválido" connota que la persona tiene una valía menor para la sociedad. En el enfoque de derechos, la valía de todas las personas es igual.' },
        { bad: 'Persona con capacidades diferentes / especiales', good: 'Persona con discapacidad.', reason: 'Es un eufemismo condescendiente que diluye la responsabilidad del entorno. Las personas con discapacidad no tienen capacidades "mágicas" o "especiales", enfrentan barreras sociales.' },
        { bad: 'Persona que sufre / víctima de discapacidad', good: 'Persona con discapacidad / persona que presenta discapacidad.', reason: 'Perpetúa una visión trágica y médica que asume que la discapacidad es sinónimo de constante sufrimiento intrínseco y que debe ser remediada o curada.' },
        { bad: 'Retraso mental', good: 'Discapacidad intelectual o discapacidad cognitiva.', reason: 'Es una etiqueta clínica obsoleta cargada de un fuerte estigma social e histórico. "Discapacidad intelectual" describe la condición de manera respetuosa y técnica.' },
        { bad: 'Sordomudo/a', good: 'Persona sorda.', reason: 'Es un concepto errado. Las personas sordas tienen cuerdas vocales sanas y pueden emitir sonidos o hablar. Su limitación es auditiva y no vocal.' },
        { bad: 'Postrado/a', good: 'Persona con dependencia funcional severa (o en situación de dismovilidad).', reason: 'La palabra "postrado" evoca una situación de desahucio. En cambio, "dependencia funcional" define de manera técnica la necesidad de apoyo de terceros.' }
    ];

    const glossaryData = [
        { term: 'Meltdown', desc: 'Crisis de estallido caracterizada por una pérdida temporal del control conductual. Es la respuesta del sistema nervioso ante una sobrecarga sensorial, de frustración o saturación cognitiva y emocional extrema.' },
        { term: 'Shutdown', desc: 'Crisis de implosión similar al meltdown, pero donde la sobrecarga se procesa de forma interna. El individuo se retrae, parece estar desconectado o paralizado y experimenta un alto agotamiento sin exteriorizar conductas desafiantes.' },
        { term: 'Stimming', desc: 'Comportamiento repetitivo de autoestimulación sensorial (ej: aleteo de manos, balanceo, ecolalias). Su función principal es regular el sistema nervioso y recuperar la calma ante entornos sobreestimulantes.' },
        { term: 'Burnout Autista', desc: 'Estado de agotamiento físico, mental y emocional severo que resulta del esfuerzo crónico por camuflar sus rasgos autistas y adaptarse a las demandas neurotípicas de la sociedad.' },
        { term: 'Camuflaje Social (Masking)', desc: 'Habilidad consciente o inconsciente utilizada por personas neurodivergentes (especialmente mujeres) para enmascarar o camuflar sus dificultades de interacción social e imitar conductas normativas.' },
        { term: 'Flexibilidad Cognitiva', desc: 'Capacidad cerebral para alternar el pensamiento entre múltiples conceptos o adaptar de manera fluida las conductas ante cambios inesperados en la rutina o el entorno.' },
        { term: 'Hiperresponsivo / Hiporresponsivo', desc: 'Variabilidad del perfil sensorial. La hiperresponsividad implica un umbral sensorial bajo (reacción exagerada ante ruidos, luces, etc.); la hiporresponsividad implica un umbral sensorial alto (búsqueda de estimulación o aparente indiferencia).' },
        { term: 'Ajustes Razonables', desc: 'Adaptaciones, modificaciones y adecuaciones necesarias y personalizadas del entorno físico, digital o metodológico aplicadas para garantizar la igualdad de oportunidades a personas con discapacidad.' },
        { term: 'Tiflotecnología', desc: 'Conjunto de teorías, recursos y técnicas que adaptan la tecnología digital y física (lectores de pantalla, anotadores Braille, macrotipos) para permitir la autonomía de las personas ciegas.' }
    ];

    const vocabTableBody = document.getElementById('vocab-table-body');
    const glossaryContainer = document.getElementById('glossary-container');
    const vocabSearch = document.getElementById('vocab-search');

    // Inicializar tabla de vocabulario y glosario
    renderVocabulary(vocabularyData);
    renderGlossary(glossaryData);

    if (vocabSearch) {
        vocabSearch.addEventListener('input', () => {
            const query = vocabSearch.value.toLowerCase().trim();
            
            // Filtrar vocabulario
            const filteredVocab = vocabularyData.filter(item => 
                item.bad.toLowerCase().includes(query) || 
                item.good.toLowerCase().includes(query) || 
                item.reason.toLowerCase().includes(query)
            );
            renderVocabulary(filteredVocab);

            // Filtrar glosario
            const filteredGlossary = glossaryData.filter(item => 
                item.term.toLowerCase().includes(query) || 
                item.desc.toLowerCase().includes(query)
            );
            renderGlossary(filteredGlossary);
        });
    }

    function renderVocabulary(data) {
        if (!vocabTableBody) return;
        
        vocabTableBody.innerHTML = '';
        if (data.length === 0) {
            vocabTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No se encontraron términos coincidentes.</td></tr>`;
            return;
        }

        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="term-bad">${item.bad}</span></td>
                <td><span class="term-good">${item.good}</span></td>
                <td>${item.reason}</td>
            `;
            vocabTableBody.appendChild(tr);
        });
    }

    function renderGlossary(data) {
        if (!glossaryContainer) return;

        glossaryContainer.innerHTML = '';
        if (data.length === 0) {
            glossaryContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 24px;">No se encontraron términos en el glosario.</div>`;
            return;
        }

        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'glossary-item';
            div.innerHTML = `
                <h4>${item.term}</h4>
                <p>${item.desc}</p>
            `;
            glossaryContainer.appendChild(div);
        });
    }

});
