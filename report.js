(function () {
const { goodPracticesData } = window.UiePlannerData;
const { getCheckedDuaItems, getDuaStageSummary } = window.UiePlannerDua;
const { formatStudentLabel, getSelectedSupportStudentGroups, groupStudentsByCondition, groupStudentsByProfile, getMergedRecommendations, categoryLabels, shortConditionNames, recommendationCategories } = window.UiePlannerSupports;

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
    const profiles = groupStudentsByProfile(students);
    const duaSummary = getDuaStageSummary();
    const hasDua = checkedDua.length > 0;
    const hasSupports = students.length > 0;
    const conditionCount = profiles.reduce(function(count, p) { return count + p.conditions.length; }, 0);

    if (!hasDua && !hasSupports) {
        setReportEmptyMode(true);
        container.innerHTML = `
            <div class="report-empty-state" role="status">
                <strong>Aún no hay información para generar el plan.</strong>
                <p>Selecciona decisiones DUA, registra estudiantes con apoyos acordados, o ambos. Con esos datos se podrá descargar un PDF o abrir un correo con mensaje base editable.</p>
            </div>
        `;
        clearPrintableRecommendations();
        return;
    }

    setReportEmptyMode(false);

    var items = '';
    if (hasDua) {
        items += `
            <article class="cart-item">
                <strong>Base DUA para la clase</strong>
                <span>${checkedDua.length} decisión(es) seleccionada(s)</span>
                <p>${duaSummary.level.label}. ${duaSummary.level.text}</p>
            </article>`;
    }
    if (hasSupports) {
        items += `
            <article class="cart-item">
                <strong>Adecuaciones acordadas</strong>
                <span>${students.length} estudiante(s), ${conditionCount} condición(es)</span>
                <p>${profiles.map(function(p) { return p.conditions.map(function(c) { return c.name; }).join(' · '); }).join('; ')}</p>
            </article>`;
    }
    if (!hasDua && hasSupports) {
        items += `
            <article class="cart-item" style="border-color: color-mix(in oklch, var(--accent) 30%, var(--border));">
                <strong>Base DUA sin seleccionar</strong>
                <span>Se recomienda completar</span>
                <p>Se sugiere revisar la base DUA antes de compartir el plan.</p>
                <a class="btn btn-primary" href="#planificar" onclick="document.getElementById('report-dialog').close();" style="margin-top:8px;">Ir a Planificar DUA</a>
            </article>`;
    }
    if (hasDua && !hasSupports) {
        items += `
            <article class="cart-item" style="border-color: color-mix(in oklch, var(--accent) 30%, var(--border));">
                <strong>Adecuaciones sin registrar</strong>
                <span>Opcional</span>
                <p>Puedes agregar adecuaciones curriculares de acceso si hay estudiantes que requieren apoyos específicos.</p>
                <a class="btn btn-primary" href="#apoyos" onclick="document.getElementById('report-dialog').close();" style="margin-top:8px;">Ir a Adecuaciones</a>
            </article>`;
    }
    container.innerHTML = items;
    updatePrintableRecommendations();
}

function openRecommendationEmail() {
    if (!hasReportContent()) {
        renderPlanSummary();
        return;
    }

    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const profiles = groupStudentsByProfile(students);
    const body = buildEmailBody(checkedDua, students, profiles);
    const mailto = `mailto:?subject=${encodeURIComponent(REPORT_TITLE)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
}

function buildEmailBody(checkedDua, students, profiles) {
    const lines = [
        'Hola,',
        '',
        'Comparto el plan de apoyo docente acordado para la clase.',
        '',
        'El plan considera:',
        `- Base DUA: ${checkedDua.length ? `${checkedDua.length} decisión(es) seleccionada(s)` : 'sin decisiones DUA seleccionadas'}.`,
        `- Adecuaciones curriculares de acceso: ${students.length ? `${students.length} estudiante(s) con apoyos acordados` : 'sin estudiantes registrados'}.`
    ];
    if (profiles.length) {
        lines.push(`- Perfiles considerados: ${profiles.map(function(p) { return p.conditions.map(function(c) { return c.name; }).join(' · '); }).join('; ')}.`);
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

function getReportData() {
    const checkedDua = getCheckedDuaItems();
    const students = getSelectedSupportStudentGroups();
    const profiles = groupStudentsByProfile(students);
    const duaSummary = getDuaStageSummary();
    return { checkedDua: checkedDua, students: students, profiles: profiles, duaSummary: duaSummary };
}

function renderProfileSection(grouped, index, firstSupportNumber) {
    var conditionKeys = grouped.conditions.map(function(c) { return c.key; });
    var conditionNames = grouped.conditions.map(function(c) { return c.name; });
    var studentNames = grouped.students.map(function(s) { return escapeHtml(formatStudentLabel(s)); }).join(', ');
    var hasMultiple = conditionKeys.length > 1;
    var merged = getMergedRecommendations(conditionKeys);
    var sources = [];
    grouped.conditions.forEach(function(c) {
        if (sources.indexOf(c.source) === -1) sources.push(c.source);
    });

    var categoriesHtml = ['context', 'materials', 'methods', 'interaction', 'time'].map(function(cat) {
        var items = merged[cat];
        if (!items || !items.length) return '';
        var itemsHtml = items.map(function(item) {
            var tag = '';
            if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                tag = ' (' + item.shortNames.join(', ') + ')';
            }
            return '<li>' + item.text + tag + '</li>';
        }).join('');
        return '<h3>' + categoryLabels[cat] + '</h3><ul>' + itemsHtml + '</ul>';
    }).join('');

    return `
        <section class="print-report-section">
            <h2>${index + firstSupportNumber}. ${conditionNames.join(' · ')}</h2>
            <p><strong>Aplica a:</strong> ${studentNames}</p>
            ${categoriesHtml}
            <p class="print-source">Fuente: ${sources.join(', ')}</p>
        </section>
    `;
}

function renderProfilePdfSection(grouped, index, firstSupportNumber) {
    var conditionKeys = grouped.conditions.map(function(c) { return c.key; });
    var conditionNames = grouped.conditions.map(function(c) { return c.name; });
    var studentNames = grouped.students.map(function(s) { return formatStudentLabel(s); }).join(', ');
    var hasMultiple = conditionKeys.length > 1;
    var merged = getMergedRecommendations(conditionKeys);
    var sources = [];
    grouped.conditions.forEach(function(c) {
        if (sources.indexOf(c.source) === -1) sources.push(c.source);
    });

    var content = [];
    content.push({ text: (index + firstSupportNumber) + '. ' + conditionNames.join(' · '), style: 'sectionTitle' });
    content.push({ text: [{ text: 'Aplica a: ', bold: true }, studentNames], style: 'bodyText' });
    content.push({ text: '' });

    ['context', 'materials', 'methods', 'interaction', 'time'].forEach(function(cat) {
        var items = merged[cat];
        if (!items || !items.length) return;
        content.push({ text: categoryLabels[cat], style: 'subSectionTitle' });
        content.push({ ul: items.map(function(item) {
            if (!item.isMerged && hasMultiple && item.shortNames.length > 0) {
                return item.text + ' (' + item.shortNames.join(', ') + ')';
            }
            return item.text;
        }) });
        content.push({ text: '' });
    });

    content.push({ text: 'Fuente: ' + sources.join(', '), style: 'sourceText' });
    content.push({ text: '' });
    return content;
}

function updatePrintableRecommendations() {
    const sheet = document.getElementById('recommendations-print');
    if (!sheet) return;

    var data = getReportData();
    var checkedDua = data.checkedDua;
    var students = data.students;
    var profiles = data.profiles;
    var duaSummary = data.duaSummary;

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
        ${profiles.map((grouped, index) => renderProfileSection(grouped, index, firstSupportNumber)).join('')}
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
        try {
            callback(canvas.toDataURL('image/png'));
        } catch (e) {
            callback(null);
        }
    };
    img.onerror = function() {
        var altUrl = url.indexOf(' ') !== -1 ? url.replace(/ /g, '%20') : url.replace(/%20/g, ' ');
        if (altUrl !== url) {
            imageToBase64(altUrl, callback);
        } else {
            callback(null);
        }
    };
    img.src = url;
}

function ensurePdfMake(callback, onError) {
    if (window.pdfMake) { callback(); return; }
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js';
    script.onerror = function() {
        restorePrintButton();
        if (onError) onError();
        else alert('No se pudo generar el PDF. Verifica tu conexión a internet.');
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
    var data = getReportData();
    var checkedDua = data.checkedDua;
    var students = data.students;
    var profiles = data.profiles;
    var duaSummary = data.duaSummary;

    imageToBase64('Logo UIE/UIE.png', function(logoBase64) {
        var content = [];
        var goodPracticesNumber = checkedDua.length ? 2 : 1;

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

        content.push({ text: REPORT_TITLE, style: 'mainTitle' });
        content.push({ text: 'Documento orientativo para acordar una base DUA de clase y, cuando corresponda, adecuaciones curriculares de acceso para estudiantes registrados.', style: 'introText' });
        content.push({ text: '' });

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

        content.push({ text: goodPracticesNumber + '. Buenas prácticas generales para adecuaciones', style: 'sectionTitle' });
        content.push({
            ul: goodPracticesData.map(function(item) {
                return { text: [{ text: item.title + ': ', bold: true }, item.text] };
            })
        });
        content.push({ text: '' });

        var firstSupportNumber = goodPracticesNumber + 1;
        profiles.forEach(function(grouped, index) {
            var sectionContent = renderProfilePdfSection(grouped, index, firstSupportNumber);
            sectionContent.forEach(function(item) { content.push(item); });
        });

        var followUpNum = firstSupportNumber + profiles.length;
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

function generateDuaPdf() {
    var duaSummary = getDuaStageSummary();
    var checkedDua = getCheckedDuaItems();

    if (!checkedDua.length) {
        restorePrintButton();
        return;
    }

    imageToBase64('Logo UIE/UIE.png', function(logoBase64) {
        var content = [];

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

        content.push({ text: 'Base DUA para la clase', style: 'mainTitle' });
        content.push({ text: [{ text: 'Decisiones seleccionadas: ', bold: true }, duaSummary.checked + '.'], style: 'bodyText' });
        content.push({ text: [{ text: 'Lectura orientadora: ', bold: true }, duaSummary.level.label + '. ' + duaSummary.level.text], style: 'bodyText' });
        content.push({ text: '' });

        duaSummary.stages.forEach(function(stage) {
            if (!stage.items.length) return;
            content.push({ text: stage.label, style: 'subSectionTitle' });
            content.push({ ul: stage.items.map(function(item) { return item.text; }) });
            content.push({ text: '' });
        });

        content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] });
        content.push({ text: '' });
        content.push({ text: 'Documento generado desde el Planificador Inclusivo UIE.', style: 'footerText' });

        var docDefinition = {
            content: content,
            styles: {
                headerOrg: { fontSize: 13, bold: true, color: '#b42318' },
                headerMeta: { fontSize: 8.5, color: '#6b7280' },
                mainTitle: { fontSize: 20, bold: true, color: '#111827', margin: [0, 0, 0, 8] },
                subSectionTitle: { fontSize: 11, bold: true, color: '#b42318', margin: [0, 10, 0, 4] },
                bodyText: { fontSize: 10.5, color: '#111827', margin: [0, 3, 0, 3] },
                footerText: { fontSize: 8.5, color: '#9ca3af', margin: [0, 6, 0, 0], italics: true }
            },
            defaultStyle: { fontSize: 10.5, color: '#111827', font: 'Roboto' },
            pageMargins: [40, 40, 40, 40]
        };

        try {
            pdfMake.createPdf(docDefinition).download('base-dua-clase.pdf');
        } catch(e) {
            var btn = document.getElementById('btn-print-dua');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Descargar selección DUA';
            }
        }
    });
}

window.UiePlannerReport = {
    initReports,
    renderPlanSummary,
    updatePrintableRecommendations,
    ensurePdfMake,
    generateDuaPdf,
    generatePdfMake
};
})();