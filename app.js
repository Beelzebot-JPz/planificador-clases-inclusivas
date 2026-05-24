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
    var reset = document.getElementById('btn-reset-checklist');
    var search = document.getElementById('vocab-search');

    if (reset) {
        reset.addEventListener('click', function() {
            if (confirm('¿Limpiar todas las decisiones DUA seleccionadas?')) {
                resetDuaChecklist(renderPlanSummary);
            }
        });
    }

    if (search) {
        search.addEventListener('input', function() { filterLanguageContent(search.value); });
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
