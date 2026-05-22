(function () {
const { accommodationsData, autismMyths, goodPracticesData } = window.AulaClaraData;

function renderSupports() {
    const select = document.getElementById('support-select');
    const results = document.getElementById('support-results');
    if (!select || !results) return;
    const entries = Object.entries(accommodationsData);
    select.innerHTML = `<option value="">Elige una opción para ver apoyos</option>` + entries.map(([key, value]) => `<option value="${key}">${value.name}</option>`).join('');
    select.addEventListener('change', () => {
        const data = accommodationsData[select.value];
        if (!data) {
            results.classList.add('hidden');
            results.innerHTML = '';
            return;
        }
        results.classList.remove('hidden');
        results.innerHTML = `
            <div class="results-title-header">
                <div>
                    <span class="source-pill">${data.source}</span>
                    <h3>${data.name}</h3>
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
        `;
    });
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
    const count = Math.max(1, Math.min(8, Number(countInput.value) || 1));
    countInput.value = String(count);
    container.innerHTML = Array.from({ length: count }, (_, index) => `
        <article class="support-student-card" data-student-index="${index + 1}">
            <h4>Estudiante ${index + 1}</h4>
            <label for="student-name-${index + 1}">Nombre del alumno</label>
            <input id="student-name-${index + 1}" class="text-control student-name" type="text" placeholder="Ej: Camila Rojas">
            <label for="student-rut-${index + 1}">RUT del alumno</label>
            <input id="student-rut-${index + 1}" class="text-control student-rut" type="text" placeholder="Ej: 12.345.678-9">
                <div class="condition-checklist" aria-label="Condiciones o necesidades del estudiante ${index + 1}">
                ${Object.entries(accommodationsData).map(([key, condition]) => `
                    <label class="condition-option">
                        <input type="checkbox" class="condition-check" value="${key}">
                        <span>${condition.name}</span>
                    </label>
                `).join('')}
            </div>
        </article>
    `).join('');
    container.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', onStudentChange);
        input.addEventListener('change', onStudentChange);
    });
    onStudentChange();
}

function getSelectedSupportStudentGroups() {
    return Array.from(document.querySelectorAll('.support-student-card')).map(card => {
        const index = card.dataset.studentIndex;
        const name = card.querySelector('.student-name')?.value.trim();
        const rut = card.querySelector('.student-rut')?.value.trim();
        const conditions = Array.from(card.querySelectorAll('.condition-check:checked'))
            .map(box => ({ key: box.value, ...accommodationsData[box.value] }))
            .filter(item => item.name);
        return {
            label: `Estudiante ${index}`,
            name,
            rut,
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
                name: student.name,
                rut: student.rut
            });
        });
    });
    return Array.from(map.values());
}

function formatStudentLabel(student) {
    const base = student.name || student.label;
    return `${base}${student.rut ? ` (RUT ${student.rut})` : ''}`;
}


window.AulaClaraSupports = {
    renderSupports,
    renderGoodPractices,
    renderSupportStudents,
    getSelectedSupportStudentGroups,
    recommendationCategories,
    countRecommendations,
    groupStudentsByCondition,
    formatStudentLabel
};

})();
