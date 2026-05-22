(function () {
function bindSectionNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[data-view]'));
    const sections = Array.from(document.querySelectorAll('.section-card[id][data-view]'));

    if (!sections.length) return;

    const defaultView = navLinks[0]?.dataset.view || sections[0].dataset.view;

    const sectionById = id => sections.find(section => section.id === id);
    const firstSectionForView = view => sections.find(section => section.dataset.view === view);

    const additionalMenuId = 'apoyos-adicionales';

    const shouldShowSection = (section, view, activeId) => {
        if (section.dataset.view !== view) return false;
        if (view !== 'adicionales') return true;
        if (activeId === additionalMenuId) return section.id === additionalMenuId;
        return section.id === activeId;
    };

    const setActiveState = (view, activeId) => {
        navLinks.forEach(link => {
            const isActive = link.dataset.view === view;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        sections.forEach(section => {
            const isVisible = shouldShowSection(section, view, activeId);
            section.classList.toggle('view-hidden', !isVisible);
            section.classList.toggle('section-active', isVisible && section.id === activeId);
            if (isVisible) {
                section.removeAttribute('hidden');
            } else {
                section.setAttribute('hidden', '');
            }
        });
    };

    const activate = (targetId, shouldScroll = true) => {
        const target = sectionById(targetId) || firstSectionForView(defaultView);
        if (!target) return;

        const view = target.dataset.view;
        const primaryTarget = target.id;
        setActiveState(view, primaryTarget);

        if (window.location.hash !== `#${primaryTarget}`) {
            history.pushState(null, '', `#${primaryTarget}`);
        }

        if (shouldScroll) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const id = link.getAttribute('href').slice(1);
            activate(id);
        });
    });

    document.addEventListener('click', event => {
        const clickedElement = event.target instanceof Element ? event.target : event.target.parentElement;
        const link = clickedElement?.closest('a[href^="#"]');
        if (!link || link.closest('.nav-links')) return;

        const id = link.getAttribute('href').slice(1);
        if (!sectionById(id)) return;

        event.preventDefault();
        activate(id);
    });

    window.addEventListener('hashchange', () => {
        const id = window.location.hash.slice(1);
        activate(id, false);
    });

    activate(window.location.hash.slice(1) || 'inicio', false);
}

window.UiePlannerNavigation = { bindSectionNavigation };

})();
