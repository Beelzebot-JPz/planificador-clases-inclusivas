(function () {
const { goodPracticesData } = window.AulaClaraData;
const { getCheckedDuaItems, getDuaStageSummary } = window.AulaClaraDua;
const { formatStudentLabel, getSelectedSupportStudentGroups, groupStudentsByCondition, recommendationCategories, renderSupportStudents } = window.AulaClaraSupports;

let reportMode = 'dua';

function initReports() {
    const emailButton = document.getElementById('btn-email-recommendations');
    const printButton = document.getElementById('btn-print-recommendations');
    const clearButton = document.getElementById('btn-clear-recommendations');

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
            document.querySelectorAll('.student-name, .student-rut').forEach(input => input.value = '');
            renderPlanSummary();
        });
    }

    document.querySelectorAll('.btn-open-report').forEach(button => {
        button.addEventListener('click', () => {
            reportMode = button.dataset.reportMode || 'dua';
            configureReportMode();
            renderPlanSummary();
            const dialog = document.getElementById('report-dialog');
            if (dialog && typeof dialog.showModal === 'function') {
                dialog.showModal();
            }
        });
    });

    const supportStudentCount = document.getElementById('support-student-count');
    if (supportStudentCount) {
        supportStudentCount.addEventListener('change', () => renderSupportStudents(renderPlanSummary));
        supportStudentCount.addEventListener('input', () => renderSupportStudents(renderPlanSummary));
    }

    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing-recommendations');
    });
}

function configureReportMode() {
    const intro = document.getElementById('report-intro');
    const supportStudentsPanel = document.getElementById('support-students-panel');
    const title = document.getElementById('cart-title');
    if (reportMode === 'supports') {
        if (title) title.textContent = 'Compartir informe de adecuaciones';
        if (intro) intro.textContent = 'Indica cuántos estudiantes requieren apoyos acordados, registra nombre y RUT, y selecciona sus condiciones para ordenar el PDF.';
        if (supportStudentsPanel) supportStudentsPanel.classList.remove('hidden');
    } else if (reportMode === 'combined') {
        if (title) title.textContent = 'Compartir informe combinado';
        if (intro) intro.textContent = 'Integra acciones DUA marcadas y apoyos por estudiante en un solo documento formal.';
        if (supportStudentsPanel) supportStudentsPanel.classList.remove('hidden');
    } else {
        if (title) title.textContent = 'Compartir informe DUA';
        if (intro) intro.textContent = 'Comparte las acciones DUA marcadas en el checklist con un formato breve y formal.';
        if (supportStudentsPanel) supportStudentsPanel.classList.add('hidden');
    }
}

function renderPlanSummary() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();

    if (reportMode === 'dua') {
        if (!checkedDua.length) {
            container.innerHTML = '<p class="cart-empty">Marca acciones del checklist DUA para preparar el informe.</p>';
            updatePrintableRecommendations();
            return;
        }
        const duaSummary = getDuaStageSummary();
        container.innerHTML = `
            <article class="cart-item">
                <strong>Planificación DUA</strong>
                <span>Cobertura del checklist DUA</span>
                <p>${duaSummary.checked} de ${duaSummary.total} acciones marcadas: ${duaSummary.percentage}% cubierto. ${duaSummary.level.label}.</p>
            </article>
        `;
        updatePrintableRecommendations();
        return;
    }

    if (reportMode === 'combined') {
        const duaSummary = getDuaStageSummary();
        const groupedConditions = groupStudentsByCondition(students);
        if (!checkedDua.length && !students.length) {
            container.innerHTML = '<p class="cart-empty">Marca acciones DUA y selecciona condiciones de apoyo para preparar el informe combinado.</p>';
            updatePrintableRecommendations();
            return;
        }
        container.innerHTML = `
            <article class="cart-item">
                <strong>Planificación DUA</strong>
                <span>${checkedDua.length ? 'Acciones marcadas' : 'Pendiente'}</span>
                <p>${duaSummary.checked} de ${duaSummary.total} acciones marcadas: ${duaSummary.percentage}% cubierto. ${duaSummary.level.label}.</p>
            </article>
            <article class="cart-item">
                <strong>Apoyos específicos</strong>
                <span>${students.length ? `${students.length} estudiante(s), ${groupedConditions.length} condición(es)` : 'Pendiente'}</span>
                <p>${students.length ? groupedConditions.map(grouped => grouped.condition.name).join(', ') : 'Selecciona estudiantes y condiciones para completar esta parte.'}</p>
            </article>
        `;
        updatePrintableRecommendations();
        return;
    }

    if (!students.length) {
            container.innerHTML = '<p class="cart-empty">Selecciona al menos una condición para un estudiante con apoyos acordados.</p>';
        updatePrintableRecommendations();
        return;
    }

    container.innerHTML = groupStudentsByCondition(students).map(grouped => `
        <article class="cart-item">
            <strong>${grouped.condition.name}</strong>
            <span>Aplica a ${grouped.students.length} estudiante(s)</span>
            <p>${grouped.students.map(student => formatStudentLabel(student)).join(', ')}</p>
        </article>
    `).join('');
    updatePrintableRecommendations();
}

function buildRecommendationMessage() {
    const advisor = document.getElementById('advisor-name')?.value.trim();
    const context = document.getElementById('case-context')?.value.trim();
    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const groupedConditions = groupStudentsByCondition(students);

    const lines = [
        'Hola,',
        '',
        reportMode === 'supports'
            ? 'Comparto las recomendaciones acordadas para orientar la práctica docente con estudiantes que requieren apoyos específicos.'
            : reportMode === 'combined'
                ? 'Comparto el informe combinado con acciones DUA y apoyos específicos acordados.'
                : 'Comparto el informe de acciones DUA marcadas para apoyar la planificación inclusiva de la clase.',
        ''
    ];

    if (context) lines.push('Contexto:', context, '');

    if (reportMode === 'dua' || reportMode === 'combined') {
        const duaSummary = getDuaStageSummary();
        lines.push(`Cobertura del checklist DUA: ${duaSummary.percentage}% cubierto (${duaSummary.checked} de ${duaSummary.total} acciones).`);
        lines.push(`${duaSummary.level.label}: ${duaSummary.level.text}`);
        duaSummary.stages.forEach(stage => {
            lines.push('', `${stage.label}: ${stage.percentage}% (${stage.checked} de ${stage.total})`);
            stage.items.forEach(item => lines.push(`- ${item.text}`));
        });
        lines.push('');
    }

    if (reportMode === 'supports' || reportMode === 'combined') {
        lines.push('Buenas prácticas generales');
        goodPracticesData.forEach(item => lines.push(`- ${item.title}: ${item.text}`));
        lines.push('');

        groupedConditions.forEach(grouped => {
            lines.push(grouped.condition.name);
            lines.push(`Aplica a: ${grouped.students.map(student => formatStudentLabel(student)).join(', ')}`);
            recommendationCategories(grouped.condition).forEach(category => {
                lines.push(`${category.title}:`);
                category.items.forEach(item => lines.push(`- ${item}`));
            });
            lines.push('');
        });
    }

    lines.push('Sugerencia: revisar estas medidas junto al estudiante y ajustarlas según respuesta, participación y resultados de aprendizaje.');
    if (advisor) lines.push('', 'Saludos,', advisor);
    return lines.join('\n');
}

function openRecommendationEmail() {
    if (reportMode === 'dua' && !getCheckedDuaItems().length) return;
    if (reportMode === 'supports' && !getSelectedSupportStudentGroups().length) return;
    if (reportMode === 'combined' && !getCheckedDuaItems().length && !getSelectedSupportStudentGroups().length) return;
    const email = document.getElementById('teacher-email')?.value.trim() || '';
    const subject = reportMode === 'supports'
        ? 'Informe de adecuaciones y apoyos específicos'
        : reportMode === 'combined'
            ? 'Informe combinado de planificación inclusiva y apoyos'
            : 'Informe DUA de planificación inclusiva';
    const body = buildEmailCoverMessage();
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function buildEmailCoverMessage() {
    const advisor = document.getElementById('advisor-name')?.value.trim();
    const context = document.getElementById('case-context')?.value.trim();
    const lines = [
        'Hola,',
        '',
        reportMode === 'supports'
            ? 'Comparto el informe de adecuaciones y apoyos específicos acordado. El detalle se encuentra en el PDF adjunto.'
            : reportMode === 'combined'
                ? 'Comparto el informe combinado de planificación inclusiva y apoyos específicos. El detalle se encuentra en el PDF adjunto.'
                : 'Comparto el informe DUA de planificación inclusiva. El detalle se encuentra en el PDF adjunto.',
        ''
    ];
    if (context) lines.push('Contexto breve:', context, '');
    lines.push('Quedo atento/a a comentarios o ajustes.');
    if (advisor) lines.push('', 'Saludos,', advisor);
    return lines.join('\n');
}

function updatePrintableRecommendations() {
    const sheet = document.getElementById('recommendations-print');
    if (!sheet) return;
    const advisor = document.getElementById('advisor-name')?.value.trim();
    const context = document.getElementById('case-context')?.value.trim();
    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const groupedConditions = groupStudentsByCondition(students);

    if (reportMode === 'dua') {
        const duaSummary = getDuaStageSummary();
        sheet.innerHTML = `
            <h2>Informe DUA de planificación inclusiva</h2>
            ${advisor ? `<p><strong>Responsable:</strong> ${advisor}</p>` : ''}
            ${context ? `<p><strong>Contexto:</strong> ${context}</p>` : ''}
            <article>
                <h3>Cobertura del checklist DUA</h3>
                <p><strong>Cobertura total:</strong> ${duaSummary.percentage}% (${duaSummary.checked} de ${duaSummary.total} acciones marcadas).</p>
                <p><strong>Lectura orientadora:</strong> ${duaSummary.level.label}. ${duaSummary.level.text}</p>
                <p>Este porcentaje no califica la clase ni exige cumplir el 100%. Ayuda a revisar si la planificación considera variedad de apoyos, opciones de participación y reducción de barreras. La calidad depende de que las acciones elegidas sean pertinentes para el objetivo, el grupo y las barreras reales.</p>
            </article>
            ${checkedDua.length ? `
                ${duaSummary.stages.map(stage => `
                    <article>
                        <h3>${stage.label}</h3>
                        <p><strong>Cobertura de la etapa:</strong> ${stage.percentage}% (${stage.checked} de ${stage.total} acciones marcadas).</p>
                        ${stage.items.length ? `<ul>${stage.items.map(item => `<li>${item.text}</li>`).join('')}</ul>` : '<p>No se marcaron acciones en esta etapa.</p>'}
                    </article>
                `).join('')}
            ` : '<p>No hay acciones DUA marcadas.</p>'}
        `;
        return;
    }

    if (reportMode === 'combined') {
        const duaSummary = getDuaStageSummary();
        sheet.innerHTML = `
            <h2>Informe combinado de planificación inclusiva y apoyos</h2>
            ${advisor ? `<p><strong>Responsable:</strong> ${advisor}</p>` : ''}
            ${context ? `<p><strong>Contexto:</strong> ${context}</p>` : ''}
            <article>
                <h3>1. Cobertura del checklist DUA</h3>
                <p><strong>Cobertura total:</strong> ${duaSummary.percentage}% (${duaSummary.checked} de ${duaSummary.total} acciones marcadas).</p>
                <p><strong>Lectura orientadora:</strong> ${duaSummary.level.label}. ${duaSummary.level.text}</p>
                <p>Este porcentaje no califica la clase. Ayuda a revisar si la planificación considera variedad de apoyos, opciones de participación y reducción de barreras.</p>
            </article>
            ${checkedDua.length ? `
                ${duaSummary.stages.map(stage => `
                    <article>
                        <h3>${stage.label}</h3>
                        <p><strong>Cobertura de la etapa:</strong> ${stage.percentage}% (${stage.checked} de ${stage.total} acciones marcadas).</p>
                        ${stage.items.length ? `<ul>${stage.items.map(item => `<li>${item.text}</li>`).join('')}</ul>` : '<p>No se marcaron acciones en esta etapa.</p>'}
                    </article>
                `).join('')}
            ` : '<article><h3>Acciones DUA</h3><p>No hay acciones DUA marcadas.</p></article>'}
            <article>
                <h3>2. Buenas prácticas generales para apoyos específicos</h3>
                <ul>${goodPracticesData.map(item => `<li><strong>${item.title}:</strong> ${item.text}</li>`).join('')}</ul>
            </article>
            ${groupedConditions.length ? groupedConditions.map(grouped => `
                <article>
                    <h3>${grouped.condition.name}</h3>
                    <p><strong>Aplica a:</strong> ${grouped.students.map(student => formatStudentLabel(student)).join(', ')}</p>
                    ${recommendationCategories(grouped.condition).map(group => `
                        <h4>${group.title}</h4>
                        <ul>${group.items.map(item => `<li>${item}</li>`).join('')}</ul>
                    `).join('')}
                    <p><em>Fuente: ${grouped.condition.source}</em></p>
                </article>
            `).join('') : '<article><h3>Apoyos específicos</h3><p>No hay estudiantes o condiciones seleccionadas.</p></article>'}
        `;
        return;
    }

    sheet.innerHTML = `
            <h2>Informe de adecuaciones y apoyos específicos</h2>
        ${advisor ? `<p><strong>Responsable:</strong> ${advisor}</p>` : ''}
        ${context ? `<p><strong>Contexto:</strong> ${context}</p>` : ''}
        <article>
            <h3>Buenas prácticas generales</h3>
            <ul>${goodPracticesData.map(item => `<li><strong>${item.title}:</strong> ${item.text}</li>`).join('')}</ul>
        </article>
        ${groupedConditions.length ? groupedConditions.map(grouped => `
            <article>
                <h3>${grouped.condition.name}</h3>
                <p><strong>Aplica a:</strong> ${grouped.students.map(student => formatStudentLabel(student)).join(', ')}</p>
                ${recommendationCategories(grouped.condition).map(group => `
                    <h4>${group.title}</h4>
                    <ul>${group.items.map(item => `<li>${item}</li>`).join('')}</ul>
                `).join('')}
                <p><em>Fuente: ${grouped.condition.source}</em></p>
            </article>
        `).join('') : '<p>No hay estudiantes o condiciones seleccionadas.</p>'}
    `;
}


window.AulaClaraReport = {
    initReports,
    renderPlanSummary,
    updatePrintableRecommendations
};

})();
