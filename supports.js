(function () {
const { accommodationsData, autismMyths, goodPracticesData } = window.UiePlannerData;

const barrierDimensions = [
    { key: 'comprension', label: 'Comprensión' },
    { key: 'materiales', label: 'Materiales' },
    { key: 'participacion', label: 'Participación' },
    { key: 'regulacion', label: 'Regulación' },
    { key: 'tiempo', label: 'Tiempo' },
    { key: 'acceso', label: 'Acceso' }
];

const barrierProfiles = {
    fisica: { comprension: 1, materiales: 2, participacion: 2, regulacion: 1, tiempo: 3, acceso: 4 },
    auditiva: { comprension: 2, materiales: 3, participacion: 3, regulacion: 1, tiempo: 2, acceso: 2 },
    visual: { comprension: 2, materiales: 4, participacion: 2, regulacion: 1, tiempo: 3, acceso: 3 },
    sordoceguera: { comprension: 3, materiales: 4, participacion: 4, regulacion: 2, tiempo: 4, acceso: 4 },
    visceral: { comprension: 1, materiales: 2, participacion: 2, regulacion: 2, tiempo: 4, acceso: 3 },
    intelectual: { comprension: 4, materiales: 3, participacion: 2, regulacion: 2, tiempo: 3, acceso: 1 },
    psiquica: { comprension: 2, materiales: 2, participacion: 3, regulacion: 4, tiempo: 3, acceso: 1 },
    autismo: { comprension: 3, materiales: 2, participacion: 4, regulacion: 4, tiempo: 3, acceso: 2 }
};

const radarColors = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];

const shortConditionNames = {
    fisica: 'Física',
    auditiva: 'Auditiva',
    visual: 'Visual',
    sordoceguera: 'Sordoceguera',
    visceral: 'Visceral',
    intelectual: 'Intelectual',
    psiquica: 'Psíquica',
    autismo: 'Autismo'
};

const categoryLabels = {
    context: 'Contexto de aula',
    materials: 'Materiales',
    methods: 'Metodología',
    interaction: 'Interacción y evaluación',
    time: 'Tiempos y flexibilidad'
};

// MERGE GUIDE: When adding new recommendations in data.js, check if they overlap
// with existing merge groups below. If they do, add the text to the relevant group's
// `texts` array and adjust `mergedText` to reflect the broader reason.
// If no overlap is found, no action is needed: the recommendation displays normally.
const mergeGroups = [
    {
        category: 'time',
        texts: [
            'Otorga tiempo adicional o pausas cuando exista fatiga, dolor o barreras de desplazamiento.',
            'Da tiempo adicional para procesar instrucciones escritas extensas o mediadas por interpretación.',
            'Otorga más tiempo para lectura, navegación, evaluación o producción escrita.',
            'Flexibiliza tiempos de desplazamiento, comunicación, lectura y respuesta.',
            'Flexibiliza plazos, pausas y asistencia según controles, tratamientos o episodios de salud.',
            'Otorga tiempo adicional y divide evaluaciones o trabajos extensos.',
            'Flexibiliza fechas y pausas cuando existan episodios de salud mental documentados.',
            'Flexibiliza entregas, pausas y evaluaciones cuando exista sobrecarga o desregulación.'
        ],
        mergedText: 'Flexibiliza tiempos, pausas y plazos según necesidad del estudiante.'
    },
    {
        category: 'materials',
        texts: [
            'Disponibiliza materiales digitales con anticipación.',
            'Mantén contenidos disponibles con anticipación para periodos de ausencia o fatiga.',
            'Disponibiliza materiales antes de la clase para anticipación.'
        ],
        mergedText: 'Disponibiliza materiales con anticipación en el AVA.'
    },
    {
        category: 'materials',
        texts: [
            'Entrega instrucciones y contenidos clave por escrito.',
            'Resume instrucciones críticas por escrito.'
        ],
        mergedText: 'Entrega instrucciones y contenidos clave por escrito.'
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
    const profiles = students.slice(0, 4).map((student, index) => ({
        label: formatStudentLabel(student),
        conditionLabel: formatStudentConditionLabel(student),
        color: radarColors[index % radarColors.length],
        values: mergeConditionProfiles(student.conditions.map(condition => condition.key))
    }));
    const extraCount = Math.max(0, students.length - profiles.length);
    const center = 150;
    const maxRadius = 100;
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
                <p>Este gráfico no diagnostica ni describe a la persona. Solo ayuda a visualizar dónde podrían requerirse apoyos según las condiciones seleccionadas y debe ajustarse con observación, conversación y evidencia.</p>
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
                ${supportCategory('Contexto de aula', data.context)}
                ${supportCategory('Materiales', data.materials)}
                ${supportCategory('Metodología', data.methods)}
                ${supportCategory('Interacción y evaluación', data.interaction)}
                ${supportCategory('Tiempos y flexibilidad', data.time)}
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
        card.querySelectorAll('input').forEach(function(input) {
            input.addEventListener('input', onStudentChange);
            input.addEventListener('change', onStudentChange);
            input.addEventListener('input', renderSelectedSupportRecommendations);
            input.addEventListener('change', renderSelectedSupportRecommendations);
            input.addEventListener('change', updateConditionSummaries);
        });
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
    wrapper.innerHTML = `
        <h4>Estudiante ${studentIndex}</h4>
        <label for="student-name-${studentIndex}">Nombre del estudiante opcional</label>
        <input id="student-name-${studentIndex}" class="text-control student-name" type="text" placeholder="Si queda vacío se usará Estudiante ${studentIndex}">
        <details class="condition-dropdown">
            <summary>
                <span class="condition-summary-text">Seleccionar condiciones o necesidades</span>
                <span class="condition-summary-count">Sin selección</span>
            </summary>
            <div class="condition-checklist" aria-label="Condiciones o necesidades del estudiante ${studentIndex}">
                ${Object.entries(accommodationsData).map(([key, condition]) => `
                    <label class="condition-option">
                        <input type="checkbox" class="condition-check" value="${key}">
                        <span>${condition.name}</span>
                    </label>
                `).join('')}
            </div>
        </details>
    `;
    return wrapper;
}

function updateConditionSummaries() {
    document.querySelectorAll('.support-student-card').forEach(card => {
        const selected = Array.from(card.querySelectorAll('.condition-check:checked'))
            .map(box => accommodationsData[box.value]?.name)
            .filter(Boolean);
        const count = card.querySelector('.condition-summary-count');
        if (!count) return;
        count.textContent = selected.length
            ? `${selected.length} seleccionada(s)`
            : 'Sin selección';
        count.title = selected.join(', ');
    });
}

function getSelectedSupportStudentGroups() {
    return Array.from(document.querySelectorAll('.support-student-card')).map(card => {
        const index = card.dataset.studentIndex;
        const name = card.querySelector('.student-name')?.value.trim();
        const conditions = Array.from(card.querySelectorAll('.condition-check:checked'))
            .map(box => ({ key: box.value, ...accommodationsData[box.value] }))
            .filter(item => item.name);
        return {
            label: `Estudiante ${index}`,
            name,
            conditions
        };
    }).filter(student => student.conditions.length);
}

function recommendationCategories(condition) {
    return [
        { title: 'Contexto de aula', items: condition.context },
        { title: 'Materiales', items: condition.materials },
        { title: 'Metodología', items: condition.methods },
        { title: 'Interacción y evaluación', items: condition.interaction },
        { title: 'Tiempos y flexibilidad', items: condition.time }
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
                name: student.name
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
        map.get(key).students.push({ label: student.label, name: student.name });
    });
    return Array.from(map.values());
}

function getMergedRecommendations(conditionKeys) {
    const categories = ['context', 'materials', 'methods', 'interaction', 'time'];
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

    const categoriesHtml = ['context', 'materials', 'methods', 'interaction', 'time'].map(function(cat) {
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
    formatStudentLabel
};

})();
