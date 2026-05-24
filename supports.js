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

const radarColors = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];

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

    results.innerHTML = `
        <div class="results-title-header">
            <div>
                <span class="source-pill">Adecuaciones de Acceso</span>
                <h3>Recomendaciones para el plan</h3>
                <p>${descriptionText}</p>
            </div>
        </div>
        ${renderBarrierMap(students)}
        ${profiles.map(group => renderProfileGroup(group)).join('')}
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
    const countInput = document.getElementById('support-student-count');
    if (!container || !countInput) return;
    if (countInput.dataset.boundStudents !== 'true') {
        countInput.addEventListener('change', () => renderSupportStudents(onStudentChange));
        countInput.dataset.boundStudents = 'true';
    }
    const count = Math.max(1, Math.min(8, Number(countInput.value) || 1));
    countInput.value = String(count);

    const existingCards = container.querySelectorAll('.support-student-card');
    const existingCount = existingCards.length;

    if (count > existingCount) {
        for (var i = existingCount; i < count; i++) {
            container.appendChild(createStudentCard(i + 1));
        }
    } else if (count < existingCount) {
        for (var i = existingCount - 1; i >= count; i--) {
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
            input.addEventListener('change', function() { updateConditionSummaries(studentIndex); });
        });

        card.querySelectorAll('input[type="radio"][name^="student-matrix"]').forEach(function(radio) {
            radio.addEventListener('change', function() { updateStudentMatrixBadge(studentIndex); });
        });

        var applyBtn = card.querySelector('[id^="apply-matrix-"]');
        var clearBtn = card.querySelector('[id^="clear-matrix-"]');
        if (applyBtn) applyBtn.addEventListener('click', function() { applyStudentMatrix(studentIndex); });
        if (clearBtn) clearBtn.addEventListener('click', function() { clearStudentMatrix(studentIndex); });

        card.setAttribute('data-events-bound', '');
    });

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
        '</details>';

    wrapper.setAttribute('data-matrix-ready', '');

    return wrapper;
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
    return Array.from(document.querySelectorAll('.support-student-card')).map(card => {
        const index = card.dataset.studentIndex;
        const name = card.querySelector('.student-name')?.value.trim();
        const checked = Array.from(card.querySelectorAll('.condition-check:checked'));
        const conditions = checked
            .map(box => ({ key: box.value, ...accommodationsData[box.value] }))
            .filter(item => item.name);
        return {
            label: `Estudiante ${index}`,
            cardIndex: Number(index),
            name,
            conditions
        };
    }).filter(student => student.conditions.length);
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
    const merged = getMergedRecommendations(conditionKeys);
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

window.UiePlannerSupports = {
    renderSupports,
    renderSelectedSupportRecommendations,
    renderGoodPractices,
    renderSupportStudents,
    updateConditionSummaries,
    getSelectedSupportStudentGroups,
    recommendationCategories,
    countRecommendations,
    groupStudentsByCondition,
    groupStudentsByProfile,
    getMergedRecommendations,
    renderProfileGroup,
    categoryLabels,
    shortConditionNames,
    formatStudentLabel,
    applyStudentMatrix,
    clearStudentMatrix,
    updateStudentMatrixBadge,
    updateStudentStatusBadge,
    getStudentMatrixProfile,
    getStudentMatrixScores
};

})();
