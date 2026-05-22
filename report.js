(function () {
const { goodPracticesData } = window.UiePlannerData;
const { getCheckedDuaItems, getDuaStageSummary } = window.UiePlannerDua;
const { formatStudentLabel, getSelectedSupportStudentGroups, groupStudentsByCondition, recommendationCategories, renderSupportStudents } = window.UiePlannerSupports;

const REPORT_TITLE = 'Plan de apoyo docente para la clase';

function initReports() {
    const emailButton = document.getElementById('btn-email-recommendations');
    const printButton = document.getElementById('btn-print-recommendations');
    const clearButton = document.getElementById('btn-clear-recommendations');
    const supportStudentCount = document.getElementById('support-student-count');

    if (emailButton) emailButton.addEventListener('click', openRecommendationEmail);
    if (printButton) {
        printButton.addEventListener('click', () => {
            updatePrintableRecommendations();
            document.body.classList.add('printing-recommendations');
            window.print();
        });
    }
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            document.querySelectorAll('.condition-check').forEach(box => box.checked = false);
            document.querySelectorAll('.student-name').forEach(input => input.value = '');
            renderPlanSummary();
        });
    }

    document.querySelectorAll('.btn-open-report').forEach(button => {
        button.addEventListener('click', () => {
            configureReportDialog();
            renderPlanSummary();
            const dialog = document.getElementById('report-dialog');
            if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
        });
    });

    if (supportStudentCount) {
        supportStudentCount.addEventListener('change', () => renderSupportStudents(renderPlanSummary));
        supportStudentCount.addEventListener('input', () => renderSupportStudents(renderPlanSummary));
    }

    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing-recommendations');
    });
}

function configureReportDialog() {
    const title = document.getElementById('cart-title');
    const intro = document.getElementById('report-intro');
    const supportStudentsPanel = document.getElementById('support-students-panel');
    if (title) title.textContent = 'Compartir plan de apoyo docente';
    if (intro) intro.textContent = 'Descarga el PDF o prepara un correo breve. Solo indica cuántos estudiantes requieren apoyo, su nombre si corresponde y las condiciones acordadas.';
    if (supportStudentsPanel) supportStudentsPanel.classList.remove('hidden');
}

function renderPlanSummary() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const duaSummary = getDuaStageSummary();
    const groupedConditions = groupStudentsByCondition(students);

    if (!checkedDua.length && !students.length) {
        container.innerHTML = '<p class="cart-empty">Selecciona decisiones DUA y, si corresponde, estudiantes con apoyos acordados para preparar el plan.</p>';
        updatePrintableRecommendations();
        return;
    }

    container.innerHTML = `
        <article class="cart-item">
            <strong>Base DUA para la clase</strong>
            <span>${checkedDua.length ? `${checkedDua.length} decisión(es) seleccionada(s)` : 'Sin decisiones seleccionadas'}</span>
            <p>${checkedDua.length ? `${duaSummary.level.label}. ${duaSummary.level.text}` : 'Puedes compartir el plan solo con adecuaciones, aunque se recomienda revisar primero la base DUA.'}</p>
        </article>
        <article class="cart-item">
            <strong>Adecuaciones acordadas</strong>
            <span>${students.length ? `${students.length} estudiante(s), ${groupedConditions.length} condición(es)` : 'Sin estudiantes registrados'}</span>
            <p>${students.length ? groupedConditions.map(grouped => grouped.condition.name).join(', ') : 'Agrega estudiantes solo cuando existan apoyos específicos que registrar.'}</p>
        </article>
    `;
    updatePrintableRecommendations();
}

function openRecommendationEmail() {
    if (!getCheckedDuaItems().length && !getSelectedSupportStudentGroups().length) return;
    const email = document.getElementById('teacher-email')?.value.trim() || '';
    const body = buildEmailCoverMessage();
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(REPORT_TITLE)}&body=${encodeURIComponent(body)}`;
}

function buildEmailCoverMessage() {
    const context = document.getElementById('case-context')?.value.trim();
    const lines = [
        'Hola,',
        '',
        'Comparto el plan de apoyo docente acordado. El detalle debe adjuntarse como PDF descargado desde la herramienta.',
        ''
    ];
    if (context) lines.push('Contexto breve:', context, '');
    lines.push('Quedo atento/a a comentarios o ajustes.');
    return lines.join('\n');
}

function updatePrintableRecommendations() {
    const sheet = document.getElementById('recommendations-print');
    if (!sheet) return;

    const context = document.getElementById('case-context')?.value.trim();
    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const groupedConditions = groupStudentsByCondition(students);
    const duaSummary = getDuaStageSummary();

    sheet.innerHTML = `
        <h2>${REPORT_TITLE}</h2>
        ${context ? `<p><strong>Contexto:</strong> ${context}</p>` : ''}
        <article>
            <h3>1. Base DUA para toda la clase</h3>
            <p><strong>Decisiones seleccionadas:</strong> ${duaSummary.checked}.</p>
            <p><strong>Lectura orientadora:</strong> ${duaSummary.level.label}. ${duaSummary.level.text}</p>
            <p>Esta sección no califica la clase ni exige completar todas las opciones. Resume decisiones pedagógicas pertinentes para reducir barreras y sostener el resultado de aprendizaje.</p>
        </article>
        ${checkedDua.length ? `
            ${duaSummary.stages.map(stage => `
                <article>
                    <h3>${stage.label}</h3>
                    ${stage.items.length ? `<ul>${stage.items.map(item => `<li>${item.text}</li>`).join('')}</ul>` : '<p>No se seleccionaron decisiones en esta etapa.</p>'}
                </article>
            `).join('')}
        ` : '<article><h3>Base DUA</h3><p>No hay decisiones DUA seleccionadas.</p></article>'}
        <article>
            <h3>2. Buenas prácticas generales para adecuaciones</h3>
            <ul>${goodPracticesData.map(item => `<li><strong>${item.title}:</strong> ${item.text}</li>`).join('')}</ul>
        </article>
        ${groupedConditions.length ? groupedConditions.map((grouped, index) => `
            <article>
                <h3>${index + 3}. ${grouped.condition.name}</h3>
                <p><strong>Aplica a:</strong> ${grouped.students.map(student => formatStudentLabel(student)).join(', ')}</p>
                ${recommendationCategories(grouped.condition).map(group => `
                    <h4>${group.title}</h4>
                    <ul>${group.items.map(item => `<li>${item}</li>`).join('')}</ul>
                `).join('')}
                <p><em>Fuente: ${grouped.condition.source}</em></p>
            </article>
        `).join('') : '<article><h3>Apoyos específicos</h3><p>No hay estudiantes o condiciones seleccionadas.</p></article>'}
        <article>
            <h3>Seguimiento y mejora</h3>
            <ul>
                <li>¿Qué barrera apareció o persistió durante la clase?</li>
                <li>¿Qué apoyo favoreció comprensión, participación, autonomía o bienestar?</li>
                <li>¿La retroalimentación fue clara, oportuna y centrada en el proceso?</li>
                <li>¿Las instrucciones y recursos estuvieron disponibles en formatos accesibles?</li>
                <li>¿Qué ajuste concreto conviene mantener, retirar o probar en la próxima clase?</li>
            </ul>
        </article>
    `;
}

window.UiePlannerReport = {
    initReports,
    renderPlanSummary,
    updatePrintableRecommendations
};
})();
