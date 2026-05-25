(function () {
const { glossaryData, vocabularyData } = window.UiePlannerData;
const { initTheme } = window.UiePlannerTheme;
const { renderGlossary, renderReferences, renderVocabulary, filterLanguageContent } = window.UiePlannerContent;
const { renderDua, resetDuaChecklist } = window.UiePlannerDua;
const { renderGoodPractices, renderSupports, initConditionPills } = window.UiePlannerSupports;
const { bindSectionNavigation } = window.UiePlannerNavigation;

function initApp() {
    if (document.body.dataset.appReady === 'true') return;
    document.body.dataset.appReady = 'true';
    initTheme();
    renderDua();
    renderSupports();
    renderGoodPractices();
    renderVocabulary(vocabularyData);
    renderGlossary(glossaryData);
    renderReferences();
    bindGlobalActions();
    bindSectionNavigation();
    initConditionPills();
}

function bindGlobalActions() {
    var reset = document.getElementById('btn-reset-checklist');
    var search = document.getElementById('vocab-search');
    var duaDownload = document.getElementById('btn-download-dua');

    if (reset) {
        reset.addEventListener('click', function() {
            if (confirm('¿Limpiar todas las decisiones DUA seleccionadas?')) {
                resetDuaChecklist();
            }
        });
    }

    if (search) {
        search.addEventListener('input', function() { filterLanguageContent(search.value); });
    }

    if (duaDownload) {
        duaDownload.addEventListener('click', function() {
            var duas = window.UiePlannerDua.getCheckedDuaItems();
            if (!duas.length) {
                alert('Selecciona al menos una decisión DUA antes de descargar la checklist.');
                return;
            }
            if (typeof window.UiePlannerSupports.downloadDuaChecklist === 'function') {
                window.UiePlannerSupports.downloadDuaChecklist();
            } else {
                alert('El generador de PDF no está disponible.');
            }
        });
    }
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
