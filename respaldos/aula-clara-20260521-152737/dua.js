(function () {
const { duaStagesData } = window.AulaClaraData;
const { bindTabs } = window.AulaClaraTabs;

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
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressHelper = document.getElementById('progress-helper');
    const progressAria = document.getElementById('progress-bar-aria');
    if (!checkboxes.length) return;
    const checkedCount = checkboxes.filter(box => box.checked).length;
    const percentage = Math.round((checkedCount / checkboxes.length) * 100);
    const level = getDuaCoverageLevel(percentage);
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}% cubierto (${checkedCount} de ${checkboxes.length} acciones)`;
    if (progressHelper) progressHelper.textContent = `${level.label}: ${level.text}`;
    if (progressAria) progressAria.setAttribute('aria-valuenow', String(percentage));
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
    const level = getDuaCoverageLevel(percentage);
    return { checked, total, percentage, level, stages };
}

function getDuaCoverageLevel(percentage) {
    if (percentage <= 35) {
        return {
            label: 'Revisión inicial',
            text: 'conviene revisar si hay barreras importantes sin apoyo suficiente antes de implementar la clase.'
        };
    }
    if (percentage <= 70) {
        return {
            label: 'Base en desarrollo',
            text: 'la planificación ya incorpora apoyos, pero puede fortalecerse revisando representación, participación y formas de respuesta.'
        };
    }
    return {
        label: 'Planificación robusta',
        text: 'hay una cobertura amplia del checklist; sigue siendo necesario observar la respuesta del curso y ajustar durante o después de la clase.'
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

window.AulaClaraDua = {
    renderDua,
    resetDuaChecklist,
    updateProgress,
    getDuaStageSummary,
    getDuaCoverageLevel,
    getCheckedDuaItems
};

})();
