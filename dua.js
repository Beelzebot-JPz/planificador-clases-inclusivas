(function () {
const { duaStagesData } = window.UiePlannerData;
const { bindTabs } = window.UiePlannerTabs;

function renderDua(onChecklistChange = () => {}) {
    const tabs = document.getElementById('dua-tabs');
    const panels = document.getElementById('dua-panels');
    if (!tabs || !panels) return;

    tabs.innerHTML = duaStagesData.map((stage, index) => `
        <button class="tab-link ${index === 0 ? 'active' : ''}" id="tab-${stage.id}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="panel-${stage.id}">
            <span class="tab-num">${index + 1}</span>${stage.label}
        </button>
    `).join('');

    panels.innerHTML = duaStagesData.map((stage, index) => `
        <div class="tab-panel ${index === 0 ? 'active' : ''}" id="panel-${stage.id}" data-stage="${stage.id}" role="tabpanel" aria-labelledby="tab-${stage.id}" ${index === 0 ? '' : 'hidden'}>
            <div class="panel-intro">
                <div>
                    <span class="badge-stage">${stage.badge}</span>
                    <h3>${stage.label}</h3>
                    <p>${stage.intro}</p>
                </div>
                <span class="source-pill">${stage.source}</span>
            </div>
            <div class="focus-grid">
                ${stage.focus.map(item => `<div class="focus-card">${item}</div>`).join('')}
            </div>
            <div class="checklist-items">
                ${stage.checklist.map((item, itemIndex) => `
                    <label class="check-item">
                        <input type="checkbox" class="DUA-checkbox" data-check-id="${stage.id}-${itemIndex}">
                        <span class="check-box-custom"></span>
                        <span class="check-text">${item}</span>
                    </label>
                `).join('')}
            </div>
            <div class="example-box">
                <strong>Ejemplo aplicado:</strong>
                <p>${stage.example}</p>
            </div>
        </div>
    `).join('');

    bindTabs(tabs, panels);
    bindChecklist(onChecklistChange);
}

function bindChecklist(onChecklistChange) {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    const savedState = JSON.parse(localStorage.getItem('dua-checklist-state') || '{}');
    checkboxes.forEach(box => {
        box.checked = Boolean(savedState[box.dataset.checkId]);
        box.addEventListener('change', () => {
            const state = {};
            checkboxes.forEach(item => {
                state[item.dataset.checkId] = item.checked;
            });
            localStorage.setItem('dua-checklist-state', JSON.stringify(state));
            updateProgress();
            onChecklistChange();
        });
    });
    updateProgress();
}

function updateProgress() {
    const checkboxes = Array.from(document.querySelectorAll('.DUA-checkbox'));
    const progressText = document.getElementById('progress-text');
    const progressHelper = document.getElementById('progress-helper');
    if (!checkboxes.length) return;
    const checkedCount = checkboxes.filter(box => box.checked).length;
    const level = getDuaCoverageLevel(checkedCount, checkboxes.length);
    if (progressText) {
        progressText.textContent = checkedCount === 1
            ? '1 decisión seleccionada'
            : `${checkedCount} decisiones seleccionadas`;
    }
    if (progressHelper) progressHelper.textContent = `${level.label}: ${level.text}`;
}

function getDuaStageSummary() {
    const items = getCheckedDuaItems();
    const stages = duaStagesData.map(stage => {
        const stageItems = items.filter(item => item.stageId === stage.id);
        const total = stage.checklist.length;
        const checked = stageItems.length;
        const percentage = total ? Math.round((checked / total) * 100) : 0;
        return {
            id: stage.id,
            label: stage.label,
            checked,
            total,
            percentage,
            items: stageItems
        };
    });
    const total = stages.reduce((sum, stage) => sum + stage.total, 0);
    const checked = stages.reduce((sum, stage) => sum + stage.checked, 0);
    const percentage = total ? Math.round((checked / total) * 100) : 0;
    const level = getDuaCoverageLevel(checked, total);
    return { checked, total, percentage, level, stages };
}

function getDuaCoverageLevel(checked, total = 0) {
    if (checked === 0) {
        return {
            label: 'Maleta vacía',
            text: 'elige las decisiones DUA que usarás como base común de la clase antes de agregar adecuaciones específicas.'
        };
    }
    if (checked <= Math.max(4, Math.ceil(total * 0.25))) {
        return {
            label: 'Base inicial',
            text: 'ya hay decisiones útiles; revisa si también estás cubriendo claridad, participación, materiales y expresión del aprendizaje.'
        };
    }
    return {
        label: 'Base consistente',
        text: 'la clase cuenta con una selección clara de herramientas DUA; ahora agrega adecuaciones solo si hay estudiantes que lo requieren.'
    };
}

function getCheckedDuaItems() {
    return Array.from(document.querySelectorAll('.DUA-checkbox:checked')).map(box => {
        const panel = box.closest('.tab-panel');
        const stageId = panel?.dataset.stage;
        const stageData = duaStagesData.find(stage => stage.id === stageId);
        const stage = stageData?.label || (panel ? document.querySelector(`[aria-controls="${panel.id}"]`)?.textContent.trim().replace(/^\d+/, '').trim() : 'DUA');
        const text = box.closest('.check-item')?.querySelector('.check-text')?.textContent.trim() || '';
        return { stage, stageId, text };
    }).filter(item => item.text);
}

function resetDuaChecklist(onChecklistChange = () => {}) {
    document.querySelectorAll('.DUA-checkbox').forEach(box => {
        box.checked = false;
    });
    localStorage.removeItem('dua-checklist-state');
    updateProgress();
    onChecklistChange();
}

window.UiePlannerDua = {
    renderDua,
    resetDuaChecklist,
    updateProgress,
    getDuaStageSummary,
    getDuaCoverageLevel,
    getCheckedDuaItems
};

})();
