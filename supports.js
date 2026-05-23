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

function renderSupports() {
    const results = document.getElementById('support-results');
    if (!results) return;
    renderSelectedSupportRecommendations();
}

function renderSelectedSupportRecommendations() {
    const results = document.getElementById('support-results');
    if (!results) return;
    const students = getSelectedSupportStudentGroups();
    const groupedConditions = groupStudentsByCondition(students);

    if (!groupedConditions.length) {
        results.classList.add('hidden');
        results.innerHTML = '';
        return;
    }

    results.classList.remove('hidden');
    results.innerHTML = `
        <div class="results-title-header">
            <div>
                <span class="source-pill">Adecuaciones de Acceso</span>
                <h3>Recomendaciones para el plan</h3>
                <p>Las recomendaciones se agrupan por condición para evitar repetir información cuando más de un estudiante requiere el mismo apoyo.</p>
            </div>
        </div>
        ${renderBarrierMap(students)}
        ${groupedConditions.map(grouped => supportRecommendationGroup(grouped)).join('')}
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
        let debounceTimer = null;
        countInput.addEventListener('focus', () => countInput.select());
        countInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => renderSupportStudents(onStudentChange), 400);
        });
        countInput.addEventListener('change', () => renderSupportStudents(onStudentChange));
        countInput.dataset.boundStudents = 'true';
    }
    const previousStudents = readStudentDrafts();
    const count = Math.max(1, Math.min(8, Number(countInput.value) || 1));
    countInput.value = String(count);
    container.innerHTML = Array.from({ length: count }, (_, index) => `
        <article class="support-student-card" data-student-index="${index + 1}">
            <h4>Estudiante ${index + 1}</h4>
            <label for="student-name-${index + 1}">Nombre del estudiante opcional</label>
            <input id="student-name-${index + 1}" class="text-control student-name" type="text" placeholder="Si queda vacío se usará Estudiante ${index + 1}">
            <details class="condition-dropdown">
                <summary>
                    <span class="condition-summary-text">Seleccionar condiciones o necesidades</span>
                    <span class="condition-summary-count">Sin selección</span>
                </summary>
                <div class="condition-checklist" aria-label="Condiciones o necesidades del estudiante ${index + 1}">
                    ${Object.entries(accommodationsData).map(([key, condition]) => `
                        <label class="condition-option">
                            <input type="checkbox" class="condition-check" value="${key}">
                            <span>${condition.name}</span>
                        </label>
                    `).join('')}
                </div>
            </details>
        </article>
    `).join('');
    restoreStudentDrafts(previousStudents);
    updateConditionSummaries();
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', onStudentChange);
        input.addEventListener('change', onStudentChange);
        input.addEventListener('input', renderSelectedSupportRecommendations);
        input.addEventListener('change', renderSelectedSupportRecommendations);
        input.addEventListener('change', updateConditionSummaries);
    });
    renderSelectedSupportRecommendations();
    onStudentChange();
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

function readStudentDrafts() {
    const drafts = new Map();
    document.querySelectorAll('.support-student-card').forEach(card => {
        const index = card.dataset.studentIndex;
        drafts.set(index, {
            name: card.querySelector('.student-name')?.value || '',
            conditions: Array.from(card.querySelectorAll('.condition-check:checked')).map(box => box.value)
        });
    });
    return drafts;
}

function restoreStudentDrafts(drafts) {
    document.querySelectorAll('.support-student-card').forEach(card => {
        const draft = drafts.get(card.dataset.studentIndex);
        if (!draft) return;
        const nameInput = card.querySelector('.student-name');
        if (nameInput) nameInput.value = draft.name;
        card.querySelectorAll('.condition-check').forEach(box => {
            box.checked = draft.conditions.includes(box.value);
        });
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
    formatStudentLabel
};

})();
