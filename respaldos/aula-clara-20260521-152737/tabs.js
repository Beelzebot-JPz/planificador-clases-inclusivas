(function () {
function bindTabs(tabContainer, panelContainer) {
    const tabButtons = Array.from(tabContainer.querySelectorAll('[role="tab"]'));
    const panels = Array.from(panelContainer.querySelectorAll('[role="tabpanel"]'));
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            activateTab(button, tabButtons, panels);
        });

        button.addEventListener('keydown', event => {
            const currentIndex = tabButtons.indexOf(button);
            let nextIndex = currentIndex;

            if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabButtons.length;
            if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
            if (event.key === 'Home') nextIndex = 0;
            if (event.key === 'End') nextIndex = tabButtons.length - 1;

            if (nextIndex !== currentIndex) {
                event.preventDefault();
                tabButtons[nextIndex].focus();
                activateTab(tabButtons[nextIndex], tabButtons, panels);
            }
        });
    });
}

function activateTab(activeButton, tabButtons, panels) {
    tabButtons.forEach(tab => {
        const isActive = tab === activeButton;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    panels.forEach(panel => {
        const isActive = panel.id === activeButton.getAttribute('aria-controls');
        panel.classList.toggle('active', isActive);
        if (isActive) {
            panel.removeAttribute('hidden');
        } else {
            panel.setAttribute('hidden', '');
        }
    });
}

window.AulaClaraTabs = { bindTabs };

})();
