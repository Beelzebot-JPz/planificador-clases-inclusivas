(function () {
const { goodPracticesData } = window.UiePlannerData;
const { getCheckedDuaItems, getDuaStageSummary } = window.UiePlannerDua;
const { formatStudentLabel, getSelectedSupportStudentGroups, groupStudentsByCondition, recommendationCategories } = window.UiePlannerSupports;

const REPORT_TITLE = 'Plan de apoyo docente para la clase';

function initReports() {
    const emailButton = document.getElementById('btn-email-recommendations');
    const printButton = document.getElementById('btn-print-recommendations');
    const emptyDuaButton = document.getElementById('btn-empty-dua');
    const emptySupportsButton = document.getElementById('btn-empty-supports');
    const emptyCloseButton = document.getElementById('btn-empty-close');

    if (emailButton) emailButton.addEventListener('click', openRecommendationEmail);
    if (printButton) {
        printButton.addEventListener('click', () => {
            if (!hasReportContent()) {
                renderPlanSummary();
                return;
            }
            generatePdf();
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

    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing-recommendations');
    });
}

function configureReportDialog() {
    const title = document.getElementById('cart-title');
    const intro = document.getElementById('report-intro');
    if (title) title.textContent = 'Compartir plan de apoyo docente';
    if (intro) intro.textContent = 'Descarga el PDF del plan o abre un correo con un mensaje base editable. Por seguridad del navegador, el PDF debe adjuntarse manualmente al correo.';
}

function renderPlanSummary() {
    const container = document.getElementById('cart-items');
    if (!container) return;

    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const duaSummary = getDuaStageSummary();
    const groupedConditions = groupStudentsByCondition(students);

    if (!checkedDua.length && !students.length) {
        setReportEmptyMode(true);
        container.innerHTML = `
            <div class="report-empty-state" role="status">
                <strong>Aún no hay información para generar el plan.</strong>
                <p>Selecciona al menos una decisión DUA o registra estudiantes con apoyos acordados en Adecuaciones curriculares. Con esos datos se podrá descargar un PDF formal o abrir un correo con mensaje base editable.</p>
            </div>
        `;
        clearPrintableRecommendations();
        return;
    }

    setReportEmptyMode(false);
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
    if (!hasReportContent()) {
        renderPlanSummary();
        return;
    }

    const body = buildEmailCoverMessage();
    const mailto = `mailto:?subject=${encodeURIComponent(REPORT_TITLE)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
}

function buildEmailCoverMessage() {
    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const groupedConditions = groupStudentsByCondition(students);
    const lines = [
        'Hola,',
        '',
        'Comparto el plan de apoyo docente acordado para la clase.',
        '',
        'El plan considera:',
        `- Base DUA: ${checkedDua.length ? `${checkedDua.length} decisión(es) seleccionada(s)` : 'sin decisiones DUA seleccionadas'}.`,
        `- Adecuaciones curriculares de acceso: ${students.length ? `${students.length} estudiante(s) con apoyos acordados` : 'sin estudiantes registrados'}.`
    ];
    if (groupedConditions.length) {
        lines.push(`- Condiciones consideradas: ${groupedConditions.map(grouped => grouped.condition.name).join(', ')}.`);
    }
    lines.push(
        '',
        'Adjunto el PDF con el detalle de las recomendaciones para su revisión y seguimiento.',
        '',
        'Quedo atento/a a comentarios o ajustes.'
    );
    return lines.join('\n');
}

function hasReportContent() {
    return getCheckedDuaItems().length > 0 || getSelectedSupportStudentGroups().length > 0;
}

function setReportEmptyMode(isEmpty) {
    document.querySelector('.cart-fields')?.classList.toggle('hidden', isEmpty);
    document.querySelector('.cart-actions')?.classList.toggle('hidden', isEmpty);
    document.getElementById('report-empty-actions')?.classList.toggle('hidden', !isEmpty);
}

function closeReportDialog() {
    const dialog = document.getElementById('report-dialog');
    if (dialog?.open) dialog.close();
}

function goToReportSource(sectionId) {
    closeReportDialog();
    if (window.location.hash === `#${sectionId}`) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    window.location.hash = sectionId;
}

function clearPrintableRecommendations() {
    const sheet = document.getElementById('recommendations-print');
    if (sheet) sheet.innerHTML = '';
}

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[character]));
}

function formatReportDate() {
    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date());
}

function updatePrintableRecommendations() {
    const sheet = document.getElementById('recommendations-print');
    if (!sheet) return;

    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const groupedConditions = groupStudentsByCondition(students);
    const duaSummary = getDuaStageSummary();

    if (!checkedDua.length && !students.length) {
        clearPrintableRecommendations();
        return;
    }

    const goodPracticesNumber = checkedDua.length ? 2 : 1;
    const firstSupportNumber = goodPracticesNumber + 1;

    sheet.innerHTML = `
        <header class="print-report-header">
            <div class="print-brand">
                <img class="print-logo" src="Logo%20UIE/UIE.png" alt="Unidad de Inclusión Educativa">
            </div>
            <div class="print-report-meta">
                <span>Plan de apoyo docente</span>
                <span>Equipo de Inclusión Académica · Duoc UC Campus Arauco</span>
                <span>${formatReportDate()}</span>
            </div>
        </header>
        <h1>${REPORT_TITLE}</h1>
        <p class="print-intro">Documento orientativo para acordar una base DUA de clase y, cuando corresponda, adecuaciones curriculares de acceso para estudiantes registrados.</p>
        ${checkedDua.length ? `
            <section class="print-report-section">
                <h2>1. Base DUA para toda la clase</h2>
                <p><strong>Decisiones seleccionadas:</strong> ${duaSummary.checked}.</p>
                <p><strong>Lectura orientadora:</strong> ${duaSummary.level.label}. ${duaSummary.level.text}</p>
                <p>Estas decisiones describen la base común de clase: apoyos pedagógicos generales para anticipar barreras, diversificar la participación y sostener el resultado de aprendizaje.</p>
                ${duaSummary.stages.map(stage => `
                    <div class="print-subsection">
                        <h3>${stage.label}</h3>
                        ${stage.items.length ? `<ul>${stage.items.map(item => `<li>${item.text}</li>`).join('')}</ul>` : '<p>No se seleccionaron decisiones en esta etapa.</p>'}
                    </div>
                `).join('')}
            </section>
        ` : ''}
        <section class="print-report-section">
            <h2>${goodPracticesNumber}. Buenas prácticas generales para adecuaciones</h2>
            <ul>${goodPracticesData.map(item => `<li><strong>${item.title}:</strong> ${item.text}</li>`).join('')}</ul>
        </section>
        ${groupedConditions.map((grouped, index) => `
            <section class="print-report-section">
                <h2>${index + firstSupportNumber}. ${grouped.condition.name}</h2>
                <p><strong>Aplica a:</strong> ${grouped.students.map(student => escapeHtml(formatStudentLabel(student))).join(', ')}</p>
                ${recommendationCategories(grouped.condition).map(group => `
                    <h3>${group.title}</h3>
                    <ul>${group.items.map(item => `<li>${item}</li>`).join('')}</ul>
                `).join('')}
                <p class="print-source">Fuente: ${grouped.condition.source}</p>
            </section>
        `).join('')}
        <section class="print-report-section">
            <h2>Seguimiento y mejora</h2>
            <ul>
                <li>¿Qué barrera apareció o persistió durante la clase?</li>
                <li>¿Qué apoyo favoreció comprensión, participación, autonomía o bienestar?</li>
                <li>¿La retroalimentación fue clara, oportuna y centrada en el proceso?</li>
                <li>¿Las instrucciones y recursos estuvieron disponibles en formatos accesibles?</li>
                <li>¿Qué ajuste concreto conviene mantener, retirar o probar en la próxima clase?</li>
            </ul>
        </section>
        <footer class="print-report-footer">
            Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.
        </footer>
    `;
}

function generatePdf() {
    updatePrintableRecommendations();
    const sheet = document.getElementById('recommendations-print');
    if (!sheet) return;

    const printButton = document.getElementById('btn-print-recommendations');
    if (printButton) {
        printButton.disabled = true;
        printButton.textContent = 'Generando PDF...';
    }

    const clone = sheet.cloneNode(true);
    clone.style.display = 'block';
    clone.style.position = 'fixed';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = '210mm';
    clone.style.background = '#fff';
    clone.style.color = '#111827';
    clone.style.padding = '18mm';
    clone.style.fontFamily = "'Atkinson Hyperlegible', 'Inter', sans-serif";
    clone.style.fontSize = '12pt';
    clone.style.lineHeight = '1.5';
    document.body.appendChild(clone);

    const opt = {
        margin: 0,
        filename: 'plan-apoyo-docente.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
        document.body.removeChild(clone);
        if (printButton) {
            printButton.disabled = false;
            printButton.textContent = 'Descargar PDF';
        }
    }).catch(() => {
        document.body.removeChild(clone);
        if (printButton) {
            printButton.disabled = false;
            printButton.textContent = 'Descargar PDF';
        }
    });
}

window.UiePlannerReport = {
    initReports,
    renderPlanSummary,
    updatePrintableRecommendations
};
})();
