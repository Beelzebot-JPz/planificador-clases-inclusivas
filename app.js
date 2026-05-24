(function () {
const { glossaryData, vocabularyData } = window.UiePlannerData;
const { initTheme } = window.UiePlannerTheme;
const { renderGlossary, renderReferences, renderVocabulary, filterLanguageContent } = window.UiePlannerContent;
const { renderDua, resetDuaChecklist, getCheckedDuaItems } = window.UiePlannerDua;
const { renderGoodPractices, renderSupports, renderSupportStudents } = window.UiePlannerSupports;
const { bindSectionNavigation } = window.UiePlannerNavigation;
const { initReports, renderPlanSummary, ensurePdfMake, generateDuaPdf } = window.UiePlannerReport;

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
    const printDua = document.getElementById('btn-print-dua');

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

    if (printDua) {
        printDua.addEventListener('click', function() {
            var checkedDua = getCheckedDuaItems();
            if (!checkedDua.length) {
                renderPlanSummary();
                return;
            }
            printDua.disabled = true;
            printDua.textContent = 'Generando PDF...';
            ensurePdfMake(function() {
                generateDuaPdf();
                printDua.disabled = false;
                printDua.textContent = 'Descargar selección DUA';
            }, function() {
                printDua.disabled = false;
                printDua.textContent = 'Descargar selección DUA';
                alert('No se pudo generar el PDF. Verifica tu conexión a internet.');
            });
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
