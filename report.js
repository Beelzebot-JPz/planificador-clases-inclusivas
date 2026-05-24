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
        printButton.addEventListener('click', function() {
            if (!hasReportContent()) {
                renderPlanSummary();
                return;
            }
            printButton.disabled = true;
            printButton.textContent = 'Generando PDF...';
            ensurePdfMake(function() {
                generatePdfMake();
                printButton.disabled = false;
                printButton.textContent = 'Descargar PDF';
            });
        });
    }
    if (emptyDuaButton) emptyDuaButton.addEventListener('click', () => goToReportSource('planificar'));
    if (emptySupportsButton) emptySupportsButton.addEventListener('click', () => goToReportSource('apoyos'));
    if (emptyCloseButton) emptyCloseButton.addEventListener('click', closeReportDialog);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeReportDialog();
    });

    document.querySelectorAll('.btn-open-report').forEach(button => {
        button.addEventListener('click', () => {
            configureReportDialog();
            renderPlanSummary();
            const dialog = document.getElementById('report-dialog');
            if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
        });
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

function imageToBase64(url, callback) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        var canvas = document.createElement('canvas');
        var maxW = 400;
        var scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL('image/png'));
    };
    img.onerror = function() {
        callback(null);
    };
    img.src = url;
}

function ensurePdfMake(callback) {
    if (window.pdfMake) { callback(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js';
    script.onerror = function() {
        restorePrintButton();
        alert('No se pudo generar el PDF. Verifica tu conexión a internet.');
    };
    var fonts = document.createElement('script');
    fonts.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js';
    var loaded = 0;
    function onLoad() {
        loaded++;
        if (loaded === 2) callback();
    }
    script.onload = onLoad;
    fonts.onload = onLoad;
    fonts.onerror = script.onerror;
    document.head.appendChild(script);
    document.head.appendChild(fonts);
}

function restorePrintButton() {
    var btn = document.getElementById('btn-print-recommendations');
    if (btn) {
        btn.disabled = false;
        btn.textContent = 'Descargar PDF';
    }
}

function generatePdfMake() {
    var checkedDua = getCheckedDuaItems();
    var students = getSelectedSupportStudentGroups();
    var groupedConditions = groupStudentsByCondition(students);
    var duaSummary = getDuaStageSummary();

    imageToBase64('Logo UIE/UIE.png', function(logoBase64) {
        var content = [];
        var goodPracticesNumber = checkedDua.length ? 2 : 1;

        // Header with logo
        var headerColumns = [];
        if (logoBase64) {
            headerColumns.push({
                image: logoBase64,
                width: 130,
                margin: [0, 0, 14, 0]
            });
        }
        headerColumns.push({
            stack: [
                { text: 'Unidad de Inclusión Educativa', style: 'headerOrg' },
                { text: 'Equipo de Inclusión Académica · Duoc UC Campus Arauco', style: 'headerMeta' },
                { text: formatReportDate(), style: 'headerMeta' }
            ],
            alignment: 'right'
        });
        content.push({ columns: headerColumns, columnGap: 8 });
        content.push({ canvas: [{ type: 'line', x1: 0, y1: 8, x2: 515, y2: 8, lineWidth: 2, lineColor: '#b42318' }] });
        content.push({ text: '' });

        // Title
        content.push({ text: REPORT_TITLE, style: 'mainTitle' });
        content.push({ text: 'Documento orientativo para acordar una base DUA de clase y, cuando corresponda, adecuaciones curriculares de acceso para estudiantes registrados.', style: 'introText' });
        content.push({ text: '' });

        // DUA Section
        if (checkedDua.length) {
            content.push({ text: '1. Base DUA para toda la clase', style: 'sectionTitle' });
            content.push({ text: [{ text: 'Decisiones seleccionadas: ', bold: true }, duaSummary.checked + '.'], style: 'bodyText' });
            content.push({ text: [{ text: 'Lectura orientadora: ', bold: true }, duaSummary.level.label + '. ' + duaSummary.level.text], style: 'bodyText' });
            content.push({ text: 'Estas decisiones describen la base común de clase: apoyos pedagógicos generales para anticipar barreras, diversificar la participación y sostener el resultado de aprendizaje.', style: 'bodyText' });
            content.push({ text: '' });

            duaSummary.stages.forEach(function(stage) {
                if (!stage.items.length) return;
                content.push({ text: stage.label, style: 'subSectionTitle' });
                content.push({ ul: stage.items.map(function(item) { return item.text; }) });
                content.push({ text: '' });
            });
        }

        // Good Practices
        content.push({ text: goodPracticesNumber + '. Buenas prácticas generales para adecuaciones', style: 'sectionTitle' });
        content.push({
            ul: goodPracticesData.map(function(item) {
                return { text: [{ text: item.title + ': ', bold: true }, item.text] };
            })
        });
        content.push({ text: '' });

        // Conditions grouped
        var firstSupportNumber = goodPracticesNumber + 1;
        groupedConditions.forEach(function(grouped, index) {
            content.push({ text: (index + firstSupportNumber) + '. ' + grouped.condition.name, style: 'sectionTitle' });
            content.push({ text: [{ text: 'Aplica a: ', bold: true }, grouped.students.map(function(s) { return formatStudentLabel(s); }).join(', ')], style: 'bodyText' });
            content.push({ text: '' });

            recommendationCategories(grouped.condition).forEach(function(group) {
                content.push({ text: group.title, style: 'subSectionTitle' });
                content.push({ ul: group.items });
                content.push({ text: '' });
            });

            content.push({ text: 'Fuente: ' + grouped.condition.source, style: 'sourceText' });
            content.push({ text: '' });
        });

        // Follow-up
        var followUpNum = firstSupportNumber + groupedConditions.length;
        content.push({ text: followUpNum + '. Seguimiento y mejora', style: 'sectionTitle' });
        content.push({
            ul: [
                '¿Qué barrera apareció o persistió durante la clase?',
                '¿Qué apoyo favoreció comprensión, participación, autonomía o bienestar?',
                '¿La retroalimentación fue clara, oportuna y centrada en el proceso?',
                '¿Las instrucciones y recursos estuvieron disponibles en formatos accesibles?',
                '¿Qué ajuste concreto conviene mantener, retirar o probar en la próxima clase?'
            ]
        });
        content.push({ text: '' });

        // Footer
        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] });
        content.push({ text: '' });
        content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE. Orientaciones alineadas con documentación institucional y fuentes disponibles en Apoyos adicionales / Referencias.', style: 'footerText' });

        var docDefinition = {
            content: content,
            styles: {
                headerOrg: { fontSize: 13, bold: true, color: '#b42318' },
                headerMeta: { fontSize: 8.5, color: '#6b7280' },
                mainTitle: { fontSize: 20, bold: true, color: '#111827', margin: [0, 0, 0, 8] },
                introText: { fontSize: 10.5, color: '#4b5563', margin: [0, 0, 0, 16], italics: true },
                sectionTitle: { fontSize: 14, bold: true, color: '#111827', margin: [0, 14, 0, 8] },
                subSectionTitle: { fontSize: 11, bold: true, color: '#b42318', margin: [0, 10, 0, 4] },
                bodyText: { fontSize: 10.5, color: '#111827', margin: [0, 3, 0, 3] },
                sourceText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 3, 0, 3] },
                footerText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 6, 0, 0], italics: true }
            },
            defaultStyle: { fontSize: 10.5, color: '#111827', font: 'Roboto' },
            pageMargins: [40, 40, 40, 40]
        };

        try {
            pdfMake.createPdf(docDefinition).download('plan-apoyo-docente.pdf');
        } catch(e) {
            restorePrintButton();
        }
    });
}

window.UiePlannerReport = {
    initReports,
    renderPlanSummary,
    updatePrintableRecommendations
};
})();
