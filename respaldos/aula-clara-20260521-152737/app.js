(function () {
const { glossaryData, vocabularyData } = window.AulaClaraData;
const { initTheme } = window.AulaClaraTheme;
const { renderAccessibility, renderGlossary, renderPrinciples, renderReferences, renderResources, renderVocabulary, filterLanguageContent } = window.AulaClaraContent;
const { renderDua, resetDuaChecklist } = window.AulaClaraDua;
const { renderGoodPractices, renderSupports, renderSupportStudents } = window.AulaClaraSupports;
const { bindSectionNavigation } = window.AulaClaraNavigation;
const { initReports, renderPlanSummary } = window.AulaClaraReport;

function initApp() {
    if (document.body.dataset.appReady === 'true') return;
    document.body.dataset.appReady = 'true';
    initTheme();
    renderPrinciples();
    renderDua(renderPlanSummary);
    renderResources();
    renderSupports();
    renderGoodPractices();
    renderAccessibility();
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

    if (reset) {
        reset.addEventListener('click', () => resetDuaChecklist(renderPlanSummary));
    }

    if (search) {
        search.addEventListener('input', () => filterLanguageContent(search.value));
    }

    initReports();
}

try {
    initApp();
} catch (error) {
    console.error('No se pudo inicializar el planificador inclusivo.', error);
}
})();
