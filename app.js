(function () {
const { glossaryData, vocabularyData } = window.UiePlannerData;
const { initTheme } = window.UiePlannerTheme;
const { renderGlossary, renderReferences, renderVocabulary, filterLanguageContent } = window.UiePlannerContent;
const { renderDua, resetDuaChecklist } = window.UiePlannerDua;
const { renderGoodPractices, renderSupports, renderSupportStudents } = window.UiePlannerSupports;
const { bindSectionNavigation } = window.UiePlannerNavigation;
const { initReports, renderPlanSummary } = window.UiePlannerReport;

function initApp() {
    if (document.body.dataset.appReady === 'true') return;
    document.body.dataset.appReady = 'true';
    initTheme();
    renderDua(renderPlanSummary);
    renderSupports();
    renderGoodPractices();
    renderVocabulary(vocabularyData);
    renderGlossary(glossaryData);
    renderReferences();
    bindGlobalActions();
    bindSectionNavigation();
    renderSupportStudents(renderPlanSummary);
    renderPlanSummary();
}

function bindGlobalActions() {
    const reset = document.getElementById('btn-reset-checklist');
    const search = document.getElementById('vocab-search');
    const shareDua = document.getElementById('btn-share-dua');

    if (reset) {
        reset.addEventListener('click', function() {
            if (confirm('¿Limpiar todas las decisiones DUA seleccionadas?')) {
                resetDuaChecklist(renderPlanSummary);
            }
        });
    }

    if (search) {
        search.addEventListener('input', () => filterLanguageContent(search.value));
    }

    if (shareDua) {
        shareDua.addEventListener('click', function() {
            var title = document.getElementById('cart-title');
            var intro = document.getElementById('report-intro');
            if (title) title.textContent = 'Compartir plan de apoyo docente';
            if (intro) intro.textContent = 'Descarga el PDF del plan o abre un correo con un mensaje base editable. Por seguridad del navegador, el PDF debe adjuntarse manualmente al correo.';
            renderPlanSummary();
            var dialog = document.getElementById('report-dialog');
            if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
        });
    }

    initReports();
}

try {
    initApp();
} catch (error) {
    console.error('No se pudo inicializar el planificador inclusivo.', error);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
}
})();
