(function () {
const { digitalAccessibilityData, glossaryData, principleCards, referencesData, resourcesData, vocabularyData } = window.AulaClaraData;
const { bindTabs } = window.AulaClaraTabs;

function renderPrinciples() {
    const container = document.getElementById('principle-grid');
    if (!container) return;
    container.innerHTML = principleCards.map(card => `
        <article class="principle-card">
            <span class="number-token">${card.icon}</span>
            <h3>${card.title}</h3>
            <p>${card.text}</p>
            <span class="source-pill">${card.source}</span>
        </article>
    `).join('');
}

function renderResources() {
    const container = document.getElementById('resource-band');
    if (!container) return;
    container.innerHTML = `
        <div class="resource-heading">
            <span class="section-kicker">Apoyos opcionales</span>
            <h3>Herramientas digitales al servicio de una decisión pedagógica</h3>
        </div>
        <div class="resource-grid">
            ${resourcesData.map(item => `
                <article class="resource-card">
                    <h4>${item.title}</h4>
                    <p>${item.text}</p>
                    <span class="source-pill">${item.source}</span>
                </article>
            `).join('')}
        </div>
    `;
}

function renderAccessibility() {
    const tabs = document.getElementById('access-tabs');
    const panels = document.getElementById('access-panels');
    if (!tabs || !panels) return;
    tabs.innerHTML = digitalAccessibilityData.map((item, index) => `
        <button class="tab-link ${index === 0 ? 'active' : ''}" id="access-tab-${item.id}" type="button" role="tab" aria-selected="${index === 0}" aria-controls="access-panel-${item.id}">
            ${item.label}
        </button>
    `).join('');
    panels.innerHTML = digitalAccessibilityData.map((item, index) => `
        <div class="tab-panel ${index === 0 ? 'active' : ''}" id="access-panel-${item.id}" role="tabpanel" aria-labelledby="access-tab-${item.id}" ${index === 0 ? '' : 'hidden'}>
            <div class="panel-intro">
                <div>
                    <span class="source-pill">${item.source}</span>
                    <h3>${item.label}</h3>
                    <p>${item.intro}</p>
                </div>
            </div>
            <div class="access-list">
                ${item.items.map((text, indexItem) => `
                    <article class="access-item">
                        <span class="number-token">${String(indexItem + 1).padStart(2, '0')}</span>
                        <p>${text}</p>
                    </article>
                `).join('')}
            </div>
        </div>
    `).join('');
    bindTabs(tabs, panels);
}

function renderVocabulary(data) {
    const table = document.getElementById('vocab-table-body');
    if (!table) return;
    table.innerHTML = data.length
        ? data.map(item => `
            <tr>
                <td><span class="term-bad">${item.bad}</span></td>
                <td><span class="term-good">${item.good}</span></td>
                <td>${item.why}</td>
            </tr>
        `).join('')
        : `<tr><td colspan="3" class="empty-cell">No se encontraron términos.</td></tr>`;
}

function renderGlossary(data) {
    const container = document.getElementById('glossary-container');
    if (!container) return;
    container.innerHTML = data.length
        ? data.map(item => `
            <article class="glossary-item">
                <h4>${item.term}</h4>
                <p>${item.desc}</p>
            </article>
        `).join('')
        : `<p class="empty-cell">No se encontraron conceptos en el glosario.</p>`;
}

function renderReferences() {
    const container = document.getElementById('references-grid');
    if (!container) return;
    container.innerHTML = referencesData.map(item => `
        <a class="ref-card" href="${encodeURI(item.file)}" target="_blank" rel="noopener">
            <span class="ref-icon">${item.code}</span>
            <span class="ref-card-details">
                <span class="ref-card-title">${item.title}</span>
                <span class="ref-card-meta">${item.file}</span>
            </span>
        </a>
    `).join('');
}

function normalize(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterLanguageContent(query) {
    const normalized = normalize(query);
    const filteredVocab = vocabularyData.filter(item => normalize(`${item.bad} ${item.good} ${item.why}`).includes(normalized));
    const filteredGlossary = glossaryData.filter(item => normalize(`${item.term} ${item.desc}`).includes(normalized));
    renderVocabulary(filteredVocab);
    renderGlossary(filteredGlossary);
}

window.AulaClaraContent = {
    renderAccessibility,
    renderGlossary,
    renderPrinciples,
    renderReferences,
    renderResources,
    renderVocabulary,
    filterLanguageContent,
    normalize
};

})();
