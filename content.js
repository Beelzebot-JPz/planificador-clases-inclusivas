(function () {
const { glossaryData, principleCards, referencesData, vocabularyData } = window.UiePlannerData;

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
        <li>
            <strong>${item.code}</strong>
            ${item.file ? `<a href="${encodeURI(item.file)}" target="_blank" rel="noopener">${item.title}</a>` : `<span>${item.title}</span>`}
        </li>
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

window.UiePlannerContent = {
    renderGlossary,
    renderPrinciples,
    renderReferences,
    renderVocabulary,
    filterLanguageContent,
    normalize
};

})();
