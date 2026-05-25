(function () {
const { accommodationsData, autismMyths, goodPracticesData } = window.UiePlannerData;

const barrierDimensions = [
    { key: 'context', label: 'Contexto' },
    { key: 'materials', label: 'Materiales' },
    { key: 'methods', label: 'Métodos' },
    { key: 'interaction', label: 'Interacción' },
    { key: 'evaluacion', label: 'Evaluaciones' },
    { key: 'tech', label: 'Tecnologías' }
];

const barrierProfiles = {
    fisica:       { context: 4, materials: 2, methods: 2, interaction: 2, evaluacion: 2, tech: 3 },
    auditiva:     { context: 2, materials: 3, methods: 3, interaction: 3, evaluacion: 2, tech: 3 },
    visual:       { context: 2, materials: 4, methods: 2, interaction: 2, evaluacion: 3, tech: 4 },
    sordoceguera: { context: 3, materials: 4, methods: 3, interaction: 4, evaluacion: 3, tech: 4 },
    tactil:       { context: 2, materials: 2, methods: 2, interaction: 1, evaluacion: 2, tech: 2 },
    vestibular:   { context: 4, materials: 2, methods: 2, interaction: 2, evaluacion: 2, tech: 1 },
    visceral:     { context: 3, materials: 2, methods: 2, interaction: 2, evaluacion: 3, tech: 2 },
    intelectual:  { context: 1, materials: 3, methods: 4, interaction: 2, evaluacion: 4, tech: 2 },
    psiquica:     { context: 1, materials: 2, methods: 2, interaction: 3, evaluacion: 3, tech: 2 },
    autismo:      { context: 3, materials: 2, methods: 3, interaction: 4, evaluacion: 3, tech: 2 }
};

const radarColors = ['#2563eb', '#dc2626', '#d97706', '#9333ea'];

const shortConditionNames = {
    fisica: 'Física',
    auditiva: 'Auditiva',
    visual: 'Visual',
    sordoceguera: 'Sordoceguera',
    tactil: 'Táctil',
    vestibular: 'Vestibular',
    visceral: 'Visceral',
    intelectual: 'Intelectual',
    psiquica: 'Psíquica',
    autismo: 'Neurodesarrollo'
};

const categoryLabels = {
    context: 'Contexto aula',
    materials: 'Materiales de estudio',
    methods: 'Métodos de enseñanza',
    interaction: 'Interacción en aula',
    evaluacion: 'De las evaluaciones',
    tech: 'Tecnologías asistivas'
};

// MERGE GUIDE: When adding new recommendations in data.js, check if they overlap
// with existing merge groups below. If they do, add the text to the relevant group's
// `texts` array and adjust `mergedText` to reflect the broader reason.
// If no overlap is found, no action is needed: the recommendation displays normally.
const mergeGroups = [
    {
        category: 'evaluacion',
        texts: [
            'Otorga tiempo adicional para responder evaluaciones cuando sea necesario.',
            'Otorga tiempo adicional para responder evaluaciones si es necesario.',
            'Otorga más tiempo en evaluaciones si es necesario.',
            'Ofrece tiempo adicional si es necesario.',
            'Otorga tiempo adicional y flexibiliza plazos de entrega.'
        ],
        mergedText: 'Otorga tiempo adicional en evaluaciones y flexibiliza plazos según necesidad.'
    },
    {
        category: 'evaluacion',
        texts: [
            'Flexibiliza plazos si el estudiante debe ausentarse por su condición.',
            'Flexibiliza plazos de entrega cuando exista fatiga.',
            'Flexibiliza plazos de entrega y fechas de evaluación según condición de salud.',
            'Flexibiliza fechas y plazos cuando existan episodios documentados.',
            'Flexibiliza entregas, pausas y evaluaciones cuando exista sobrecarga o desregulación.'
        ],
        mergedText: 'Flexibiliza plazos de entrega y fechas de evaluación según la condición.'
    },
    {
        category: 'materials',
        texts: [
            'Disponibiliza materiales digitales con anticipación.',
            'Disponibiliza materiales en AVA con anterioridad para consulta previa.',
            'Disponibiliza materiales antes de la clase para anticipación.',
            'Mantén contenidos disponibles con anticipación para periodos de ausencia o fatiga.'
        ],
        mergedText: 'Disponibiliza materiales con anticipación en el AVA.'
    },
    {
        category: 'interaction',
        texts: [
            'Evita interpretaciones disciplinarias de pausas o ausencias justificadas.',
            'Usa comunicación clara, respetuosa y no punitiva frente a crisis o ausencias.'
        ],
        mergedText: 'Usa comunicación clara y respetuosa frente a crisis, pausas o ausencias justificadas.'
    }
];

const matrixData = {};

const selectedConditionKeys = [];

const conditionGridOrder = ['autismo', 'intelectual', 'sordoceguera', 'fisica', 'visual', 'auditiva', 'visceral', 'psiquica', 'vestibular', 'tactil'];

function ensurePdfMake(callback) {
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js';
    script.onerror = function() {
        alert('No se pudo cargar el generador de PDF. Verifica tu conexión a internet.');
    };
    script.onload = function() {
        var fonts = document.createElement('script');
        fonts.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js';
        fonts.onerror = script.onerror;
        fonts.onload = callback;
        document.head.appendChild(fonts);
    };
    document.head.appendChild(script);
}

function getConditionImpact(key) {
    var profile = barrierProfiles[key];
    if (!profile) return 0;
    return profile.context + profile.materials + profile.methods + profile.interaction + profile.evaluacion + profile.tech;
}

function countConditionRecommendations(key) {
    var data = accommodationsData[key];
    if (!data) return 0;
    return (data.context || []).length + (data.materials || []).length + (data.methods || []).length +
           (data.interaction || []).length + (data.evaluacion || []).length + (data.tech || []).length;
}

function getSelectedConditionKeys() {
    return selectedConditionKeys.slice();
}

function toggleCondition(key) {
    var idx = selectedConditionKeys.indexOf(key);
    if (idx === -1) {
        selectedConditionKeys.push(key);
    } else {
        selectedConditionKeys.splice(idx, 1);
    }
    renderConditionPills();
    renderConditionDetail();
    renderSelectedSupportRecommendations();
}

function initConditionPills(onStudentChange) {
    if (!selectedConditionKeys.length) {
        selectedConditionKeys.push('autismo');
    }

    renderConditionPills();
    renderConditionDetail();

    var genBtn = document.getElementById('btn-generate-plan');
    if (genBtn && genBtn.dataset.bound !== 'true') {
        genBtn.addEventListener('click', function() {
            openPlanModal(onStudentChange);
        });
        genBtn.setAttribute('data-bound', 'true');
    }
}

function renderConditionPills() {
    var container = document.getElementById('condition-pills');
    if (!container) return;

    container.innerHTML = conditionGridOrder.map(function(key) {
        var data = accommodationsData[key];
        if (!data) return '';
        var isSelected = selectedConditionKeys.indexOf(key) !== -1;
        var count = countConditionRecommendations(key);
        return '<button class="condition-pill' + (isSelected ? ' active' : '') + '" data-condition-key="' + key + '">' +
            '<span class="condition-pill-name">' + shortConditionNames[key] + '</span>' +
            '<span class="condition-pill-count">' + count + '</span>' +
            '</button>';
    }).join('');

    container.querySelectorAll('.condition-pill').forEach(function(pill) {
        pill.addEventListener('click', function() {
            toggleCondition(pill.getAttribute('data-condition-key'));
        });
    });
}

function renderConditionDetail() {
    var detail = document.getElementById('condition-detail');
    if (!detail) return;

    if (!selectedConditionKeys.length) {
        detail.innerHTML = '<p class="condition-detail-hint">Selecciona una condición para ver sus recomendaciones de apoyo.</p>';
        return;
    }

    var students = getSelectedSupportStudentGroups();
    var profiles = groupStudentsByProfile(students);

    if (!profiles.length) {
        detail.innerHTML = '<p class="condition-detail-hint">No se encontraron recomendaciones para las condiciones seleccionadas.</p>';
        return;
    }

    var radarHtml = '';
    try {
        radarHtml = renderBarrierMap(students);
    } catch (e) {
        console.error('radar falló:', e.message);
    }

    var profilesHtml = profiles.map(function(group) {
        try { return renderProfileGroup(group); } catch (e) { return ''; }
    }).join('');

    var conditionNames = selectedConditionKeys.map(function(k) {
        var d = accommodationsData[k];
        return d ? d.name : shortConditionNames[k] || k;
    }).join(' + ');

    detail.innerHTML =
        '<div class="results-title-header">' +
            '<div>' +
                '<h3>' + (selectedConditionKeys.length > 1 ? 'Múltiple: ' + conditionNames : conditionNames) + '</h3>' +
                '<p>Las recomendaciones están agrupadas por categoría. Ajusta según observación directa y conversación con el estudiante.</p>' +
            '</div>' +
        '</div>' +
        radarHtml +
        profilesHtml;
}

function getStudentMatrixProfile(studentIndex) {
    const entry = matrixData[studentIndex];
    return entry && entry.applied ? entry.profile : null;
}

function getStudentMatrixScores(studentIndex) {
    const entry = matrixData[studentIndex];
    return entry ? entry.scores || {} : {};
}

function renderSupports() {
    const results = document.getElementById('support-results');
    if (!results) return;
    renderSelectedSupportRecommendations();
}

function renderSelectedSupportRecommendations() {
    const results = document.getElementById('support-results');
    if (!results) return;
    const students = getSelectedSupportStudentGroups();
    const profiles = groupStudentsByProfile(students);
    console.log('renderSelectedSupportRecs: students=' + students.length + ' profiles=' + profiles.length);

    if (!profiles.length) {
        results.classList.add('hidden');
        results.innerHTML = '';
        return;
    }

    results.classList.remove('hidden');
    const hasMultiple = profiles.some(function(p) { return p.conditions.length > 1; });
    const descriptionText = hasMultiple
        ? 'Las recomendaciones se agrupan por perfil de estudiante. Las compartidas entre varias condiciones se fusionan automáticamente y las específicas se identifican con su condición.'
        : 'Las recomendaciones se agrupan por condición para evitar repetir información cuando más de un estudiante requiere el mismo apoyo.';

    var radarHtml = '';
    try {
        var chartStudents = students.filter(function(s) {
            var card = document.querySelector('.support-student-card[data-student-index="' + s.cardIndex + '"]');
            if (!card) return true;
            var cb = card.querySelector('.show-in-chart');
            return cb ? cb.checked : true;
        });
        radarHtml = renderBarrierMap(chartStudents);
    } catch (e) {
        console.error('renderBarrierMap falló:', e.message, e.stack);
        radarHtml = '<p style=\"color:red\">Error en radar: ' + e.message + '</p>';
    }

    var profilesHtml = '';
    try {
        profilesHtml = profiles.map(function(group) {
            try {
                return renderProfileGroup(group);
            } catch (e) {
                console.error('renderProfileGroup falló para grupo con condiciones:', group.conditions.map(function(c){return c.key;}).join(','), e.message);
                return '<p style=\"color:red\">Error en perfil: ' + e.message + '</p>';
            }
        }).join('');
    } catch (e) {
        console.error('Error general en profiles:', e.message);
        profilesHtml = '<p style=\"color:red\">Error en recomendaciones: ' + e.message + '</p>';
    }

    results.innerHTML = `
        <div class="results-title-header">
            <div>
                <span class="source-pill">Adecuaciones de Acceso</span>
                <h3>Recomendaciones para el plan</h3>
                <p>${descriptionText}</p>
            </div>
        </div>
        ${radarHtml}
        ${profilesHtml}
    `;
}

function renderBarrierMap(students) {
    const center = 150;
    const maxRadius = 100;
    const matrixColor = '#7c3aed';
    let hasAnyMatrix = false;
    const profiles = students.slice(0, 4).map((student, index) => {
        const studentIndex = student.cardIndex || (index + 1);
        const matrixProfile = getStudentMatrixProfile(studentIndex);
        if (matrixProfile) {
            hasAnyMatrix = true;
            return {
                label: formatStudentLabel(student),
                conditionLabel: 'Perfil desde matriz (CIF)',
                color: matrixColor,
                values: matrixProfile
            };
        }
        return {
            label: formatStudentLabel(student),
            conditionLabel: formatStudentConditionLabel(student),
            color: radarColors[index % radarColors.length],
            values: mergeConditionProfiles(student.conditions.map(function(c) { return c.key; }))
        };
    });

    const extraCount = Math.max(0, students.length - 4);
    const axisPoints = barrierDimensions.map((_, index) => radarPoint(center, maxRadius, index, barrierDimensions.length));
    const rings = [1, 2, 3, 4].map(level => {
        const points = barrierDimensions.map((_, index) => radarPoint(center, (maxRadius / 4) * level, index, barrierDimensions.length));
        return `<polygon points="${points.map(point => `${point.x},${point.y}`).join(' ')}" class="radar-ring"></polygon>`;
    }).join('');
    const axes = axisPoints.map(point => `<line x1="${center}" y1="${center}" x2="${point.x}" y2="${point.y}" class="radar-axis"></line>`).join('');
    const labels = axisPoints.map((point, index) => {
        const labelPoint = radarPoint(center, maxRadius + 22, index, barrierDimensions.length);
        return `<text x="${labelPoint.x}" y="${labelPoint.y}" class="radar-label">${barrierDimensions[index].label}</text>`;
    }).join('');
    const polygons = profiles.map(profile => {
        const points = barrierDimensions.map((dimension, index) => {
            const radius = (Math.max(0, Math.min(4, profile.values[dimension.key] || 0)) / 4) * maxRadius;
            return radarPoint(center, radius, index, barrierDimensions.length);
        });
        return `
            <polygon points="${points.map(point => `${point.x},${point.y}`).join(' ')}" class="radar-profile" style="--profile-color: ${profile.color};"></polygon>
            ${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="3.5" class="radar-dot" style="--profile-color: ${profile.color};"></circle>`).join('')}
        `;
    }).join('');

    return `
        <div class="barrier-map-panel">
            <div class="resource-heading">
                <span class="source-pill">Mapa orientativo</span>
                <h3>Mapa de barreras y apoyos del plan</h3>
                <p>${hasAnyMatrix
                    ? 'Los perfiles que provienen de la matriz de acceso (CIF/OMS) aparecen en púrpura. Los demás derivan de las condiciones seleccionadas. Ningún dato diagnostica: ajusta con observación.'
                    : 'Este gráfico no diagnostica ni describe a la persona. Solo ayuda a visualizar dónde podrían requerirse apoyos según las condiciones seleccionadas y debe ajustarse con observación, conversación y evidencia.'}</p>
            </div>
            <div class="barrier-map-layout">
                <div class="radar-wrap" aria-label="Gráfico radar de apoyos posibles">
                    <svg viewBox="0 0 300 300" role="img" aria-labelledby="radar-title">
                        <title id="radar-title">Mapa orientativo de barreras y apoyos</title>
                        ${rings}
                        ${axes}
                        ${polygons}
                        ${labels}
                    </svg>
                </div>
                <div class="radar-side">
                    <div class="radar-legend">
                        ${profiles.map(profile => `
                            <span><i style="--profile-color: ${profile.color};"></i>${profile.label}: ${profile.conditionLabel}</span>
                        `).join('')}
                        ${extraCount ? `<span class="small-note">+ ${extraCount} estudiante(s) no graficados para evitar saturación visual.</span>` : ''}
                    </div>
                    <div class="radar-scale">
                        <span><strong>1</strong> Apoyo bajo</span>
                        <span><strong>2</strong> Apoyo moderado</span>
                        <span><strong>3</strong> Apoyo alto</span>
                        <span><strong>4</strong> Requiere coordinación</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function mergeConditionProfiles(conditionKeys) {
    return barrierDimensions.reduce((profile, dimension) => {
        profile[dimension.key] = conditionKeys.reduce((max, key) => {
            const value = barrierProfiles[key]?.[dimension.key] || 0;
            return Math.max(max, value);
        }, 0);
        return profile;
    }, {});
}

function formatStudentConditionLabel(student) {
    const names = student.conditions.map(condition => condition.name).filter(Boolean);
    if (!names.length) return 'Sin condición seleccionada';
    if (names.length === 1) return names[0];
    return `Múltiples (${names.join(', ')})`;
}

function radarPoint(center, radius, index, total) {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
    return {
        x: Number((center + Math.cos(angle) * radius).toFixed(2)),
        y: Number((center + Math.sin(angle) * radius).toFixed(2))
    };
}

function supportRecommendationGroup(grouped) {
    const data = grouped.condition;
    return `
        <article class="support-recommendation-group">
            <div class="results-title-header">
                <div>
                    <span class="source-pill">${data.source}</span>
                    <h3>${data.name}</h3>
                    <p><strong>Aplica a:</strong> ${grouped.students.map(student => formatStudentLabel(student)).join(', ')}</p>
                </div>
            </div>
            <div class="support-grid">
                ${supportCategory('Contexto aula', data.context)}
                ${supportCategory('Materiales de estudio', data.materials)}
                ${supportCategory('Métodos de enseñanza', data.methods)}
                ${supportCategory('Interacción en aula', data.interaction)}
                ${supportCategory('De las evaluaciones', data.evaluacion)}
                ${supportCategory('Tecnologías asistivas', data.tech)}
            </div>
            ${data.highlights ? `
                <div class="context-panel">
                    <h4>Apoyos destacados para esta condición</h4>
                    <div class="mini-grid">
                        ${data.highlights.map(item => `
                            <article class="mini-card">
                                <h5>${item.title}</h5>
                                <p>${item.text}</p>
                            </article>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.regulation ? `
                <div class="regulation-panel">
                    <div class="resource-heading">
                        <span class="source-pill">Autismo</span>
                        <h4>Desregulación emocional y conductual</h4>
                        <p>Orientación pedagógica de apoyo, no protocolo clínico. La desregulación suele responder a sobrecarga, ansiedad, cambios inesperados o estímulos desencadenantes.</p>
                    </div>
                    <div class="regulation-grid">
                        ${data.regulation.map(group => `
                            <article class="regulation-card">
                                <h5>${group.title}</h5>
                                <ul class="acc-list">
                                    ${group.items.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                            </article>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.source === 'Autismo' ? `
                <div class="myths-panel">
                    <div class="resource-heading">
                        <span class="source-pill">Autismo</span>
                        <h4>Mitos y trato en autismo</h4>
                        <p>Estas orientaciones ayudan a evitar prejuicios al acompañar la práctica docente.</p>
                    </div>
                    <div class="myths-grid">
                        ${autismMyths.map(item => `<article class="myth-item">${item}</article>`).join('')}
                    </div>
                </div>
            ` : ''}
        </article>
    `;
}

function renderGoodPractices() {
    const container = document.getElementById('good-practices');
    if (!container) return;
    container.innerHTML = `
        <div class="resource-heading">
            <span class="source-pill">Adecuaciones de Acceso</span>
            <h3>Buenas prácticas antes de seleccionar una adecuación</h3>
        </div>
        <div class="good-grid">
            ${goodPracticesData.map(item => `
                <article class="mini-card">
                    <h4>${item.title}</h4>
                    <p>${item.text}</p>
                </article>
            `).join('')}
        </div>
    `;
}

function supportCategory(title, items) {
    return `
        <article class="acc-card">
            <h4>${title}</h4>
            <ul class="acc-list">${items.map(item => `<li>${item}</li>`).join('')}</ul>
        </article>
    `;
}

function renderSupportStudents(onStudentChange = () => {}) {
    const container = document.getElementById('support-students');
    const addBtn = document.getElementById('add-student-btn');
    if (!container) return;

    var count = Number(container.getAttribute('data-student-count')) || 1;
    count = Math.max(1, Math.min(8, count));
    container.setAttribute('data-student-count', String(count));

    const existingCards = container.querySelectorAll('.support-student-card');
    const existingCount = existingCards.length;

    if (count > existingCount) {
        for (var i = existingCount; i < count; i++) {
            container.appendChild(createStudentCard(i + 1));
        }
    } else if (count < existingCount) {
        for (var i = existingCount - 1; i >= count; i--) {
            var removedIndex = existingCards[i].getAttribute('data-student-index');
            delete matrixData[removedIndex];
            existingCards[i].remove();
        }
    }

    container.querySelectorAll('.support-student-card:not([data-events-bound])').forEach(function(card) {
        var studentIndex = card.getAttribute('data-student-index');

        card.querySelectorAll('.condition-check, .student-name').forEach(function(input) {
            input.addEventListener('input', onStudentChange);
            input.addEventListener('change', onStudentChange);
            input.addEventListener('input', renderSelectedSupportRecommendations);
            input.addEventListener('change', renderSelectedSupportRecommendations);
            input.addEventListener('change', function() {
                updateConditionSummaries(studentIndex);
                updateAddButton();
                updateRemoveButtons();
            });
        });

        card.querySelectorAll('.show-in-chart').forEach(function(cb) {
            cb.addEventListener('change', renderSelectedSupportRecommendations);
        });

        card.querySelectorAll('input[type="radio"][name^="student-matrix"]').forEach(function(radio) {
            radio.addEventListener('change', function() { updateStudentMatrixBadge(studentIndex); });
        });

        var applyBtn = card.querySelector('[id^="apply-matrix-"]');
        var clearBtn = card.querySelector('[id^="clear-matrix-"]');
        if (applyBtn) applyBtn.addEventListener('click', function() { applyStudentMatrix(studentIndex); });
        if (clearBtn) clearBtn.addEventListener('click', function() { clearStudentMatrix(studentIndex); });

        var removeBtn = card.querySelector('.btn-remove-student');
        if (removeBtn) {
            removeBtn.addEventListener('click', function() { removeLastStudent(onStudentChange); });
        }

        card.setAttribute('data-events-bound', '');
    });

    if (addBtn && addBtn.dataset.bound !== 'true') {
        addBtn.addEventListener('click', function() { addStudentCard(onStudentChange); });
        addBtn.setAttribute('data-bound', 'true');
    }

    updateRemoveButtons();
    updateAddButton();
    updateConditionSummaries();
    renderSelectedSupportRecommendations();
    onStudentChange();
}

function createStudentCard(studentIndex) {
    var wrapper = document.createElement('article');
    wrapper.className = 'support-student-card';
    wrapper.setAttribute('data-student-index', String(studentIndex));

    var activities = window.UiePlannerData.accessMatrixActivities;
    var matrixRows = activities.map(function(act) {
        var cells = [4, 3, 2, 1].map(function(val) {
            return '<td class="matrix-col-score">' +
                '<label class="matrix-radio-group">' +
                '<input type="radio" name="student-matrix-' + studentIndex + '-' + act.id + '" value="' + val + '">' +
                '<span>' + val + '</span>' +
                '</label></td>';
        }).join('');
        return '<tr><td class="matrix-activity-label">' + act.label + '</td>' + cells + '</tr>';
    }).join('');

    wrapper.innerHTML =
        '<h4>Estudiante ' + studentIndex + '</h4>' +
        '<label for="student-name-' + studentIndex + '">Nombre del estudiante (opcional)</label>' +
        '<input id="student-name-' + studentIndex + '" class="text-control student-name" type="text" placeholder="Si queda vacío se usará Estudiante ' + studentIndex + '">' +
        '<div class="student-card-status" id="student-status-' + studentIndex + '">Sin apoyos definidos</div>' +
        '<label class="radar-visibility-toggle">' +
            '<input type="checkbox" class="show-in-chart" checked>' +
            '<span>Mostrar en gráfico</span>' +
        '</label>' +
        '<details class="condition-dropdown">' +
            '<summary>' +
                '<span class="condition-summary-text">Seleccionar condiciones</span>' +
                '<span class="condition-summary-count" id="condition-count-' + studentIndex + '">Sin selección</span>' +
            '</summary>' +
            '<div class="condition-checklist" aria-label="Condiciones del estudiante ' + studentIndex + '">' +
                Object.keys(accommodationsData).map(function(key) {
                    return '<label class="condition-option"><input type="checkbox" class="condition-check" value="' + key + '"><span>' + accommodationsData[key].name + '</span></label>';
                }).join('') +
            '</div>' +
        '</details>' +
        '<details class="student-matrix-toggle">' +
            '<summary>' +
                '<span>Matriz de acceso (CIF/OMS)</span>' +
                '<span class="student-matrix-badge" id="student-matrix-badge-' + studentIndex + '"></span>' +
            '</summary>' +
            '<div class="student-matrix-wrap">' +
                '<table class="student-matrix-table">' +
                    '<thead><tr><th>Actividad</th><th class="matrix-col-score">4</th><th class="matrix-col-score">3</th><th class="matrix-col-score">2</th><th class="matrix-col-score">1</th></tr></thead>' +
                    '<tbody>' + matrixRows + '</tbody>' +
                '</table>' +
                '<div class="student-matrix-legend">' +
                    '<span><strong>4</strong> Compatibilidad perfecta</span>' +
                    '<span><strong>3</strong> Compatibilidad buena</span>' +
                    '<span><strong>2</strong> Compatibilidad parcial</span>' +
                    '<span><strong>1</strong> Incompatibilidad</span>' +
                '</div>' +
            '</div>' +
            '<div class="student-matrix-actions">' +
                '<button class="btn btn-primary btn-sm" id="apply-matrix-' + studentIndex + '" type="button">Aplicar puntajes</button>' +
                '<button class="btn btn-secondary btn-sm" id="clear-matrix-' + studentIndex + '" type="button">Limpiar</button>' +
            '</div>' +
        '</details>' +
        '<button class="btn-remove-student" type="button" title="Eliminar estudiante" style="display:none">&times;</button>';

    wrapper.setAttribute('data-matrix-ready', '');

    return wrapper;
}

function addStudentCard(onStudentChange) {
    var container = document.getElementById('support-students');
    if (!container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count >= 8) return;
    container.setAttribute('data-student-count', String(count + 1));
    renderSupportStudents(onStudentChange);
}

function removeLastStudent(onStudentChange) {
    var container = document.getElementById('support-students');
    if (!container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count <= 1) return;
    var cards = container.querySelectorAll('.support-student-card');
    if (cards.length > 0) {
        cards[cards.length - 1].remove();
        var matrixIdx = String(cards.length);
        delete matrixData[matrixIdx];
    }
    container.setAttribute('data-student-count', String(count - 1));
    updateRemoveButtons();
    updateAddButton();
    updateConditionSummaries();
    renderSelectedSupportRecommendations();
    if (typeof onStudentChange === 'function') onStudentChange();
}

function updateAddButton() {
    var addBtn = document.getElementById('add-student-btn');
    var container = document.getElementById('support-students');
    if (!addBtn || !container) return;
    var count = Number(container.getAttribute('data-student-count')) || 1;
    if (count >= 8) {
        addBtn.style.display = 'none';
        return;
    }
    var cards = container.querySelectorAll('.support-student-card');
    var lastCard = cards[cards.length - 1];
    if (!lastCard) {
        addBtn.style.display = 'none';
        return;
    }
    var hasCondition = lastCard.querySelectorAll('.condition-check:checked').length > 0;
    addBtn.style.display = hasCondition ? '' : 'none';
}

function updateRemoveButtons() {
    var container = document.getElementById('support-students');
    if (!container) return;
    var cards = container.querySelectorAll('.support-student-card');
    var count = Number(container.getAttribute('data-student-count')) || 1;
    cards.forEach(function(card, index) {
        var btn = card.querySelector('.btn-remove-student');
        if (!btn) return;
        if (count > 1 && index === cards.length - 1) {
            btn.style.display = '';
        } else {
            btn.style.display = 'none';
        }
    });
}

function renderReferenceCatalog() {
    var conditionKeys = Object.keys(accommodationsData);

    var items = conditionKeys.map(function(key) {
        var data = accommodationsData[key];
        var catsHtml = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].map(function(cat) {
            var arr = data[cat];
            if (!arr || !arr.length) return '';
            var listItems = arr.slice(0, 4).map(function(r) { return '<li>' + r + '</li>'; }).join('');
            var extra = arr.length > 4 ? '<li class="ref-more">+ ' + (arr.length - 4) + ' más</li>' : '';
            return '<div class="ref-cat"><strong>' + (categoryLabels[cat] || cat) + '</strong><ul>' + listItems + extra + '</ul></div>';
        }).join('');

        return '<details class="ref-condition">' +
            '<summary><span>' + data.name + '</span></summary>' +
            '<div class="ref-body">' + catsHtml + '</div>' +
            '</details>';
    }).join('');

    return '<div class="results-title-header">' +
        '<div>' +
            '<h3>Recomendaciones por condición</h3>' +
            '<p>Catálogo de referencia para apoyar a cualquier estudiante según su condición. Selecciona condiciones en la ficha de arriba para ver solo las relevantes.</p>' +
        '</div>' +
    '</div>' +
    '<div class="ref-catalog">' + items + '</div>';
}

function updateConditionSummaries(studentIndex) {
    document.querySelectorAll('.support-student-card').forEach(card => {
        var idx = card.getAttribute('data-student-index');
        var selected = Array.from(card.querySelectorAll('.condition-check:checked'))
            .map(box => accommodationsData[box.value]?.name)
            .filter(Boolean);
        var count = document.getElementById('condition-count-' + idx);
        if (count) {
            count.textContent = selected.length
                ? `${selected.length} seleccionada(s)`
                : 'Sin selección';
            count.title = selected.join(', ');
        }
        updateStudentStatusBadge(idx);
    });
}

function getSelectedSupportStudentGroups() {
    var cards = document.querySelectorAll('.support-student-card');

    if (cards.length) {
        console.log('getSelectedSupportStudentGroups: cards encontradas=' + cards.length);
        return Array.from(cards).map(card => {
            const index = card.dataset.studentIndex;
            const name = card.querySelector('.student-name')?.value.trim();
            const checked = Array.from(card.querySelectorAll('.condition-check:checked'));
            console.log('  card ' + index + ': checkboxes checked=' + checked.length);
            const conditions = checked
                .map(box => {
                    var key = box.value;
                    var data = accommodationsData[key];
                    if (!data) console.warn('  WARN: accommodationsData[' + key + '] no existe');
                    return { key: key, ...data };
                })
                .filter(item => item.name);
            return {
                label: `Estudiante ${index}`,
                cardIndex: Number(index),
                name,
                conditions
            };
        }).filter(function(student) {
            console.log('  filtro: card ' + student.cardIndex + ' tiene ' + student.conditions.length + ' condiciones');
            return student.conditions.length;
        });
    }

    if (selectedConditionKeys.length) {
        return [{
            label: 'Perfil seleccionado',
            cardIndex: 1,
            name: '',
            conditions: selectedConditionKeys.map(function(key) {
                var data = accommodationsData[key];
                return data ? { key: key, ...data } : null;
            }).filter(Boolean)
        }];
    }

    return [];
}

function recommendationCategories(condition) {
    return [
        { title: 'Contexto aula', items: condition.context },
        { title: 'Materiales de estudio', items: condition.materials },
        { title: 'Métodos de enseñanza', items: condition.methods },
        { title: 'Interacción en aula', items: condition.interaction },
        { title: 'De las evaluaciones', items: condition.evaluacion },
        { title: 'Tecnologías asistivas', items: condition.tech }
    ];
}

function countRecommendations(condition) {
    return recommendationCategories(condition).reduce((total, group) => total + group.items.length, 0);
}

function groupStudentsByCondition(students) {
    const map = new Map();
    students.forEach(student => {
        student.conditions.forEach(condition => {
            if (!map.has(condition.key)) {
                map.set(condition.key, { condition, students: [] });
            }
            map.get(condition.key).students.push({
                label: student.label,
                name: student.name,
                cardIndex: student.cardIndex
            });
        });
    });
    return Array.from(map.values());
}

function formatStudentLabel(student) {
    return student.name || student.label;
}

function groupStudentsByProfile(students) {
    const map = new Map();
    students.forEach(function(student) {
        const key = student.conditions.map(function(c) { return c.key; }).sort().join('|');
        if (!map.has(key)) {
            map.set(key, { conditions: student.conditions.slice(), students: [] });
        }
        map.get(key).students.push({ label: student.label, name: student.name, cardIndex: student.cardIndex });
    });
    return Array.from(map.values());
}

function getMergedRecommendations(conditionKeys) {
    const categories = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'];
    const result = {};

    categories.forEach(function(cat) {
        const allItems = [];
        conditionKeys.forEach(function(key) {
            const condition = accommodationsData[key];
            if (condition && condition[cat]) {
                condition[cat].forEach(function(text) {
                    allItems.push({ text: text, conditionKey: key, shortName: shortConditionNames[key] || key });
                });
            }
        });

        const applicableMerges = mergeGroups.filter(function(group) {
            if (group.category !== cat) return false;
            const matchCount = group.texts.filter(function(t) {
                return allItems.some(function(item) { return item.text === t; });
            }).length;
            return matchCount >= 2;
        });

        const mergedItems = [];
        const usedTexts = {};

        applicableMerges.forEach(function(group) {
            group.texts.forEach(function(text) { usedTexts[text] = true; });
            mergedItems.push({ text: group.mergedText, isMerged: true, shortNames: [] });
        });

        allItems.forEach(function(item) {
            if (usedTexts[item.text]) return;
            const existing = mergedItems.find(function(m) { return m.text === item.text && !m.isMerged; });
            if (existing) {
                if (existing.shortNames.indexOf(item.shortName) === -1) {
                    existing.shortNames.push(item.shortName);
                }
                return;
            }
            mergedItems.push({
                text: item.text,
                isMerged: false,
                shortNames: conditionKeys.length > 1 ? [item.shortName] : []
            });
        });

        result[cat] = mergedItems;
    });

    return result;
}

function renderProfileGroup(group) {
    const conditionKeys = group.conditions.map(function(c) { return c.key; });
    const conditionNames = group.conditions.map(function(c) { return c.name; });
    const sources = [];
    group.conditions.forEach(function(c) {
        if (sources.indexOf(c.source) === -1) sources.push(c.source);
    });
    const studentNames = group.students.map(function(s) { return formatStudentLabel(s); }).join(', ');
    const hasMultiple = conditionKeys.length > 1;
    var merged;
    try {
        merged = getMergedRecommendations(conditionKeys);
    } catch (e) {
        console.error('getMergedRecommendations falló:', e.message);
        throw e;
    }
    const hasAutism = conditionKeys.indexOf('autismo') !== -1;

    const sourcePills = sources.map(function(s) { return '<span class="source-pill">' + s + '</span>'; }).join(' ');

    const categoriesHtml = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'].map(function(cat) {
        const items = merged[cat];
        if (!items || !items.length) return '';
        const itemsHtml = items.map(function(item) {
            let tag = '';
            if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                tag = ' <span class="condition-tag">' + item.shortNames.join(', ') + '</span>';
            }
            return '<li>' + item.text + tag + '</li>';
        }).join('');
        return '<article class="acc-card"><h4>' + categoryLabels[cat] + '</h4><ul class="acc-list">' + itemsHtml + '</ul></article>';
    }).join('');

    let highlightHtml = '';
    let regulationHtml = '';
    let mythsHtml = '';

    if (hasAutism) {
        const autismData = accommodationsData.autismo;
        if (autismData.highlights) {
            highlightHtml = '<div class="context-panel"><h4>Apoyos destacados para esta condición</h4><div class="mini-grid">' +
                autismData.highlights.map(function(item) {
                    return '<article class="mini-card"><h5>' + item.title + '</h5><p>' + item.text + '</p></article>';
                }).join('') + '</div></div>';
        }
        if (autismData.regulation) {
            regulationHtml = '<div class="regulation-panel"><div class="resource-heading"><span class="source-pill">Autismo</span><h4>Desregulación emocional y conductual</h4><p>Orientación pedagógica de apoyo, no protocolo clínico. La desregulación suele responder a sobrecarga, ansiedad, cambios inesperados o estímulos desencadenantes.</p></div><div class="regulation-grid">' +
                autismData.regulation.map(function(regGroup) {
                    return '<article class="regulation-card"><h5>' + regGroup.title + '</h5><ul class="acc-list">' +
                        regGroup.items.map(function(item) { return '<li>' + item + '</li>'; }).join('') + '</ul></article>';
                }).join('') + '</div></div>';
        }
        mythsHtml = '<div class="myths-panel"><div class="resource-heading"><span class="source-pill">Autismo</span><h4>Mitos y trato en autismo</h4><p>Estas orientaciones ayudan a evitar prejuicios al acompañar la práctica docente.</p></div><div class="myths-grid">' +
            autismMyths.map(function(item) { return '<article class="myth-item">' + item + '</article>'; }).join('') + '</div></div>';
    }

    return '<article class="support-recommendation-group">' +
        '<div class="results-title-header"><div>' +
        sourcePills + ' ' +
        '<h3>' + conditionNames.join(' · ') + '</h3>' +
        '<p><strong>Aplica a:</strong> ' + studentNames + '</p>' +
        '</div></div>' +
        '<div class="support-grid">' + categoriesHtml + '</div>' +
        highlightHtml + regulationHtml + mythsHtml +
        '</article>';
}


function readStudentMatrixScores(studentIndex) {
    var scores = {};
    var activities = window.UiePlannerData.accessMatrixActivities;
    activities.forEach(function(act) {
        var checked = document.querySelector('input[name="student-matrix-' + studentIndex + '-' + act.id + '"]:checked');
        scores[act.id] = checked ? Number(checked.value) : 0;
    });
    return scores;
}

function computeRadarProfile(scores) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var dims = { context: [], materials: [], methods: [], interaction: [], evaluacion: [], tech: [] };

    activities.forEach(function(act) {
        var score = scores[act.id] || 0;
        if (!score) return;
        var radarValue = 5 - score;
        act.dims.forEach(function(dim) {
            dims[dim].push(radarValue);
        });
    });

    return barrierDimensions.reduce(function(profile, dim) {
        var values = dims[dim.key] || [1];
        profile[dim.key] = values.length ? Math.max.apply(null, values) : 1;
        return profile;
    }, {});
}

function computeConditionSuggestions(scores) {
    var activities = window.UiePlannerData.accessMatrixActivities;
    var weights = {};

    activities.forEach(function(act) {
        var score = scores[act.id] || 0;
        if (score <= 2 && score >= 1) {
            var weight = 3 - score;
            act.conds.forEach(function(cond) {
                weights[cond] = (weights[cond] || 0) + weight;
            });
        }
    });

    var entries = Object.keys(weights).map(function(k) { return { key: k, weight: weights[k] }; });
    entries.sort(function(a, b) { return b.weight - a.weight; });

    var threshold = 2;
    var suggested = entries.filter(function(e) { return e.weight >= threshold; }).map(function(e) { return e.key; });

    return suggested;
}

function applyStudentMatrix(studentIndex) {
    var scores = readStudentMatrixScores(studentIndex);
    var scored = Object.values(scores).filter(function(v) { return v > 0; });
    if (!scored.length) return;

    var profile = computeRadarProfile(scores);
    var suggested = computeConditionSuggestions(scores);

    matrixData[studentIndex] = { scores: scores, profile: profile, applied: true };

    var card = document.querySelector('.support-student-card[data-student-index="' + studentIndex + '"]');
    if (card) {
        card.querySelectorAll('.condition-check').forEach(function(box) {
            box.checked = suggested.indexOf(box.value) !== -1;
        });
        updateConditionSummaries(studentIndex);
    }

    updateStudentMatrixBadge(studentIndex);
    updateAddButton();
    updateRemoveButtons();
    renderSelectedSupportRecommendations();
}

function clearStudentMatrix(studentIndex) {
    delete matrixData[studentIndex];

    var card = document.querySelector('.support-student-card[data-student-index="' + studentIndex + '"]');
    if (card) {
        card.querySelectorAll('input[type="radio"][name^="student-matrix"]').forEach(function(radio) {
            radio.checked = false;
        });
    }

    updateStudentMatrixBadge(studentIndex);
    updateStudentStatusBadge(studentIndex);
    renderSelectedSupportRecommendations();
}

function updateStudentMatrixBadge(studentIndex) {
    var badge = document.getElementById('student-matrix-badge-' + studentIndex);
    if (!badge) return;
    var scores = readStudentMatrixScores(studentIndex);
    var scored = Object.values(scores).filter(function(v) { return v > 0; }).length;
    badge.textContent = scored ? scored + '/11' : '';
    updateStudentStatusBadge(studentIndex);
}

function updateStudentStatusBadge(studentIndex) {
    var status = document.getElementById('student-status-' + studentIndex);
    if (!status) return;

    var card = document.querySelector('.support-student-card[data-student-index="' + studentIndex + '"]');
    var hasConditions = card ? card.querySelectorAll('.condition-check:checked').length > 0 : false;
    var hasMatrix = !!matrixData[studentIndex] && matrixData[studentIndex].applied;
    var hasMatrixScores = Object.values(readStudentMatrixScores(studentIndex)).filter(function(v) { return v > 0; }).length > 0;

    if (hasMatrix) {
        status.textContent = 'Con matriz de acceso aplicada';
        status.className = 'student-card-status status-matrix';
    } else if (hasConditions) {
        status.textContent = 'Con condiciones seleccionadas';
        status.className = 'student-card-status status-conditions';
    } else if (hasMatrixScores) {
        status.textContent = 'Matriz sin aplicar';
        status.className = 'student-card-status status-pending';
    } else {
        status.textContent = 'Sin apoyos definidos';
        status.className = 'student-card-status';
    }
}

function openPlanModal(onStudentChange) {
    var overlay = document.getElementById('plan-modal-overlay');
    if (!overlay) return;
    overlay.style.display = '';
    document.body.style.overflow = 'hidden';
    renderPlanStudents();
    bindPlanModalEvents(onStudentChange);
}

function closePlanModal() {
    var overlay = document.getElementById('plan-modal-overlay');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

function getPlanMode() {
    var active = document.querySelector('.plan-modal-tab.active');
    return active ? active.getAttribute('data-tab') : 'basic';
}

function renderPlanStudents() {
    var container = document.getElementById('plan-students');
    var countSelect = document.getElementById('plan-student-count');
    if (!container || !countSelect) return;

    var count = Number(countSelect.value) || 1;
    var mode = getPlanMode();

    container.innerHTML = '';
    for (var i = 1; i <= count; i++) {
        container.appendChild(createPlanStudentCard(i, mode));
    }
}

function createPlanStudentCard(index, mode) {
    var card = document.createElement('article');
    card.className = 'plan-student-card';

    var html = '<h4>Estudiante ' + index + '</h4>';

    if (mode === 'personalized') {
        html += '<div class="plan-personal-fields">' +
            '<label for="plan-name-' + index + '">Nombre (opcional)</label>' +
            '<input id="plan-name-' + index + '" class="text-control plan-student-name" type="text" placeholder="Ej: Juan Pérez">' +
            '<label for="plan-rut-' + index + '">RUT (opcional)</label>' +
            '<input id="plan-rut-' + index + '" class="text-control plan-student-rut" type="text" placeholder="Ej: 12.345.678-9">' +
            '<label for="plan-career-' + index + '">Carrera (opcional)</label>' +
            '<input id="plan-career-' + index + '" class="text-control plan-student-career" type="text" placeholder="Ej: Ingeniería en Informática">' +
            '</div>';
    }

    html += '<details class="plan-condition-list">' +
        '<summary>Seleccionar condiciones</summary>' +
        '<div class="plan-checklist">' +
        Object.keys(accommodationsData).map(function(key) {
            return '<label class="plan-check-option">' +
                '<input type="checkbox" class="plan-condition-check" value="' + key + '">' +
                '<span>' + accommodationsData[key].name + '</span></label>';
        }).join('') +
        '</div>' +
        '</details>';

    if (mode === 'personalized') {
        var activities = window.UiePlannerData.accessMatrixActivities;
        var matrixRows = activities.map(function(act) {
            var cells = [4, 3, 2, 1].map(function(val) {
                return '<td class="matrix-col-score"><label class="matrix-radio-group">' +
                    '<input type="radio" name="plan-matrix-' + index + '-' + act.id + '" value="' + val + '">' +
                    '<span>' + val + '</span></label></td>';
            }).join('');
            return '<tr><td class="matrix-activity-label">' + act.label + '</td>' + cells + '</tr>';
        }).join('');

        html += '<details class="plan-matrix-toggle">' +
            '<summary>Matriz de acceso (CIF/OMS) — opcional</summary>' +
            '<div class="student-matrix-wrap"><table class="student-matrix-table">' +
            '<thead><tr><th>Actividad</th><th class="matrix-col-score">4</th><th class="matrix-col-score">3</th><th class="matrix-col-score">2</th><th class="matrix-col-score">1</th></tr></thead>' +
            '<tbody>' + matrixRows + '</tbody></table>' +
            '<div class="student-matrix-legend">' +
            '<span><strong>4</strong> Compatibilidad perfecta</span>' +
            '<span><strong>3</strong> Compatibilidad buena</span>' +
            '<span><strong>2</strong> Compatibilidad parcial</span>' +
            '<span><strong>1</strong> Incompatibilidad</span></div></div></details>';
    }

    card.innerHTML = html;
    return card;
}

function bindPlanModalEvents(onStudentChange) {
    var closeBtn = document.getElementById('plan-modal-close');
    var overlay = document.getElementById('plan-modal-overlay');
    var countSelect = document.getElementById('plan-student-count');
    var tabs = document.querySelectorAll('.plan-modal-tab');
    var genBtn = document.getElementById('btn-generate-pdf');

    if (closeBtn && closeBtn.dataset.bound !== 'true') {
        closeBtn.addEventListener('click', closePlanModal);
        closeBtn.setAttribute('data-bound', 'true');
    }

    if (overlay && overlay.dataset.bound !== 'true') {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closePlanModal();
        });
        overlay.setAttribute('data-bound', 'true');
    }

    if (countSelect && countSelect.dataset.boundPlan !== 'true') {
        countSelect.addEventListener('change', renderPlanStudents);
        countSelect.setAttribute('data-boundPlan', 'true');
    }

    tabs.forEach(function(tab) {
        if (tab.dataset.boundPlan !== 'true') {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.plan-modal-tab').forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                renderPlanStudents();
            });
            tab.setAttribute('data-boundPlan', 'true');
        }
    });

    if (genBtn && genBtn.dataset.bound !== 'true') {
        genBtn.addEventListener('click', generatePlanPDF);
        genBtn.setAttribute('data-bound', 'true');
    }

    var emailBtn = document.getElementById('btn-generate-email');
    if (emailBtn && emailBtn.dataset.bound !== 'true') {
        emailBtn.addEventListener('click', generatePlanEmail);
        emailBtn.setAttribute('data-bound', 'true');
    }
}

function collectPlanStudents() {
    var mode = getPlanMode();
    var students = [];
    var cards = document.querySelectorAll('.plan-student-card');

    cards.forEach(function(card, i) {
        var checked = card.querySelectorAll('.plan-condition-check:checked');
        if (!checked.length && mode === 'basic') return;

        var conditions = Array.from(checked).map(function(cb) {
            var data = accommodationsData[cb.value];
            return data ? { key: cb.value, name: data.name } : null;
        }).filter(Boolean);

        if (!conditions.length) return;

        var student = {
            index: i + 1,
            name: mode === 'personalized' ? (card.querySelector('.plan-student-name')?.value?.trim() || '') : '',
            rut: mode === 'personalized' ? (card.querySelector('.plan-student-rut')?.value?.trim() || '') : '',
            career: mode === 'personalized' ? (card.querySelector('.plan-student-career')?.value?.trim() || '') : '',
            conditions: conditions
        };
        students.push(student);
    });

    return students;
}

function generatePlanPDF() {
    var students = collectPlanStudents();
    if (!students.length) {
        alert('Selecciona al menos una condición para algún estudiante.');
        return;
    }

    var mode = getPlanMode();
    var includeDua = document.getElementById('plan-include-dua')?.checked || false;
    var includeCharts = document.getElementById('plan-include-charts')?.checked || false;

    var docDef;
    try {
        docDef = buildPlanPDFDocument(students, mode, includeDua, includeCharts);
    } catch (e) {
        console.error('Error construyendo documento PDF:', e);
        alert('Error al construir el documento: ' + e.message);
        return;
    }

    ensurePdfMake(function() {
        try {
            if (!window.pdfMake || typeof window.pdfMake.createPdf !== 'function') {
                alert('La librería de PDF no se cargó correctamente. Verifica tu conexión.');
                return;
            }
            window.pdfMake.createPdf(docDef).download('plan-de-apoyo.pdf');
        } catch (e) {
            console.error('Error generando PDF:', e);
            alert('Error al generar el PDF: ' + e.message);
        }
    });
}

function buildPlanPDFDocument(students, mode, includeDua, includeCharts) {
    var today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
    var content = [];

    content.push({ text: 'Plan de apoyo docente', style: 'title' });
    content.push({ text: 'Generado el ' + today, style: 'subtitle', margin: [0, 4, 0, 20] });

    students.forEach(function(student, sIdx) {
        var label = student.name || ('Estudiante ' + student.index);
        var subtitle = [label];
        if (student.rut) subtitle.push('RUT: ' + student.rut);
        if (student.career) subtitle.push('Carrera: ' + student.career);

        content.push({ text: subtitle.join(' | '), style: 'studentTitle', margin: [0, 10, 0, 6] });

        student.conditions.forEach(function(cond) {
            content.push({ text: cond.name, style: 'conditionName', margin: [0, 6, 0, 4] });

            var data = accommodationsData[cond.key];
            if (!data) return;

            var cats = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'];
            var catNames = { context: 'Contexto aula', materials: 'Materiales de estudio', methods: 'Métodos de enseñanza', interaction: 'Interacción en aula', evaluacion: 'De las evaluaciones', tech: 'Tecnologías asistivas' };

            cats.forEach(function(cat) {
                var items = data[cat];
                if (!items || !items.length) return;
                content.push({ text: catNames[cat], style: 'catHeader', margin: [0, 6, 0, 2] });
                items.forEach(function(item) {
                    content.push({ text: '• ' + item, style: 'recItem', margin: [10, 1, 0, 1] });
                });
            });
        });
    });

    if (includeDua) {
        content.push({ text: '', pageBreak: 'before' });
        content.push({ text: 'Checklist DUA', style: 'title' });
        content.push({ text: 'Marca las acciones que te comprometes a implementar.', style: 'subtitle', margin: [0, 4, 0, 14] });

        var duaStages = window.UiePlannerData.duaStagesData || [];

        if (duaStages.length) {
            duaStages.forEach(function(stage) {
                content.push({ text: stage.label + ' — ' + stage.badge, style: 'catHeader', margin: [0, 8, 0, 4] });
                var items = stage.checklist || [];
                items.forEach(function(item) {
                    content.push({ text: '☐ ' + item, style: 'recItem', margin: [10, 2, 0, 2] });
                });
            });
        } else {
            content.push({ text: 'No se encontraron principios DUA definidos.', style: 'recItem', margin: [10, 4, 0, 4] });
        }
    }

    content.push({ text: '', margin: [0, 16, 0, 0] });
    content.push({ text: 'Leyenda: Estas recomendaciones son orientativas según la condición indicada. Deben ajustarse con observación directa, conversación con el estudiante y evidencia del aula. No constituyen un diagnóstico.', style: 'legend' });

    return {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: content,
        styles: {
            title: { fontSize: 18, bold: true, color: '#111827' },
            subtitle: { fontSize: 11, color: '#6B7280' },
            studentTitle: { fontSize: 14, bold: true, color: '#236A4B', margin: [0, 4, 0, 2] },
            conditionName: { fontSize: 12, bold: true, color: '#374151' },
            catHeader: { fontSize: 10, bold: true, color: '#6B7280', italics: true },
            recItem: { fontSize: 10, color: '#374151', lineHeight: 1.4 },
            legend: { fontSize: 8, color: '#9CA3AF', italics: true, margin: [0, 20, 0, 0] }
        },
        defaultStyle: { font: 'Helvetica' }
    };
}

function downloadDuaChecklist() {
    var checkedDua = window.UiePlannerDua.getCheckedDuaItems() || [];

    var summary = window.UiePlannerDua.getDuaStageSummary();
    var today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
    var content = [];

    content.push({ text: 'Checklist DUA para la clase', style: 'title' });
    content.push({ text: 'Generado el ' + today, style: 'subtitle', margin: [0, 4, 0, 14] });
    content.push({ text: 'Marca las acciones que te comprometes a implementar.', style: 'subtitle', margin: [0, 0, 0, 14] });

    var stages = window.UiePlannerData.duaStagesData || [];
    stages.forEach(function(stage) {
        var stageChecked = summary.stages.find(function(s) { return s.label === stage.label; });
        var items = stage.checklist || [];
        if (stageChecked && stageChecked.items.length) {
            content.push({ text: stage.label + ' — ' + stage.badge + ' (' + stageChecked.items.length + ' seleccionadas)', style: 'catHeader', margin: [0, 8, 0, 4] });
            items.forEach(function(item) {
                var isChecked = stageChecked.items.some(function(si) { return si.text === item; });
                content.push({ text: (isChecked ? '☑ ' : '☐ ') + item, style: 'recItem', margin: [10, 2, 0, 2] });
            });
        } else {
            content.push({ text: stage.label + ' — ' + stage.badge + ' (sin selección)', style: 'catHeader', margin: [0, 8, 0, 4] });
            items.forEach(function(item) {
                content.push({ text: '☐ ' + item, style: 'recItem', margin: [10, 2, 0, 2] });
            });
        }
    });

    content.push({ text: '', margin: [0, 14, 0, 0] });
    content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE.', style: 'legend' });

    var docDef = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: content,
        styles: {
            title: { fontSize: 18, bold: true, color: '#111827' },
            subtitle: { fontSize: 11, color: '#6B7280' },
            catHeader: { fontSize: 11, bold: true, color: '#236A4B', margin: [0, 4, 0, 2] },
            recItem: { fontSize: 10, color: '#374151', lineHeight: 1.4 },
            legend: { fontSize: 8, color: '#9CA3AF', italics: true }
        },
        defaultStyle: { font: 'Helvetica' }
    };

    ensurePdfMake(function() {
        try {
            if (!window.pdfMake || typeof window.pdfMake.createPdf !== 'function') {
                alert('La librería de PDF no se cargó correctamente. Verifica tu conexión.');
                return;
            }
            window.pdfMake.createPdf(docDef).download('checklist-dua.pdf');
        } catch (e) {
            console.error('Error generando PDF DUA:', e);
            alert('Error al generar el PDF: ' + e.message);
        }
    });
}

function generatePlanEmail() {
    var students = collectPlanStudents();
    if (!students.length) {
        alert('Selecciona al menos una condición para algún estudiante.');
        return;
    }

    var mode = getPlanMode();
    var includeDua = document.getElementById('plan-include-dua')?.checked || false;
    var today = new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

    var body = 'Plan de apoyo docente\n' +
        'Generado: ' + today + '\n\n' +
        'ESTUDIANTES Y CONDICIONES\n' +
        '------------------------\n\n';

    students.forEach(function(student) {
        var label = student.name || ('Estudiante ' + student.index);
        body += label + '\n';
        if (student.rut) body += 'RUT: ' + student.rut + '\n';
        if (student.career) body += 'Carrera: ' + student.career + '\n';
        body += 'Condiciones: ' + student.conditions.map(function(c) { return c.name; }).join(', ') + '\n\n';

        student.conditions.forEach(function(cond) {
            body += cond.name + ':\n';
            var data = accommodationsData[cond.key];
            if (!data) return;
            var cats = ['context', 'materials', 'methods', 'interaction', 'evaluacion', 'tech'];
            var catNames = { context: 'Contexto aula', materials: 'Materiales', methods: 'Métodos', interaction: 'Interacción', evaluacion: 'Evaluaciones', tech: 'Tecnologías' };
            cats.forEach(function(cat) {
                var items = data[cat];
                if (!items || !items.length) return;
                body += '  ' + catNames[cat] + ':\n';
                items.forEach(function(item) { body += '    - ' + item + '\n'; });
            });
            body += '\n';
        });
    });

    if (includeDua) {
        body += 'CHECKLIST DUA\n-------------\n\n';
        var stages = window.UiePlannerData.duaStagesData || [];
        stages.forEach(function(stage) {
            body += stage.label + ':\n';
            (stage.checklist || []).forEach(function(item) { body += '  ☐ ' + item + '\n'; });
            body += '\n';
        });
    }

    body += '\nLeyenda: Estas recomendaciones son orientativas. Ajusta según observación directa y conversación con el estudiante.\n';
    body += 'Generado desde el Planificador Inclusivo UIE.';

    var subject = 'Plan de apoyo docente - ' + today;
    var mailto = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = mailto;
}

window.UiePlannerSupports = {
    renderSupports,
    renderSelectedSupportRecommendations,
    renderGoodPractices,
    renderSupportStudents,
    addStudentCard,
    removeLastStudent,
    updateAddButton,
    updateRemoveButtons,
    updateConditionSummaries,
    getSelectedSupportStudentGroups,
    recommendationCategories,
    countRecommendations,
    groupStudentsByCondition,
    groupStudentsByProfile,
    getMergedRecommendations,
    renderProfileGroup,
    renderReferenceCatalog,
    initConditionPills,
    renderConditionPills,
    renderConditionDetail,
    toggleCondition,
    getSelectedConditionKeys,
    categoryLabels,
    shortConditionNames,
    formatStudentLabel,
    applyStudentMatrix,
    clearStudentMatrix,
    updateStudentMatrixBadge,
    updateStudentStatusBadge,
    getStudentMatrixProfile,
    getStudentMatrixScores,
    openPlanModal,
    closePlanModal,
    generatePlanPDF,
    generatePlanEmail,
    downloadDuaChecklist
};

})();
