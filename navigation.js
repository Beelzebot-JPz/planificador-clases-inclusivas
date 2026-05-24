(function () {
function bindSectionNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a[data-view]'));
    const sections = Array.from(document.querySelectorAll('.section-card[id][data-view]'));

    if (!sections.length) return;

    const defaultView = navLinks[0]?.dataset.view || sections[0].dataset.view;

    const sectionById = function(id) { return sections.find(function(s) { return s.id === id; }); };
    const firstSectionForView = function(view) { return sections.find(function(s) { return s.dataset.view === view; }); };

    const additionalMenuId = 'apoyos-adicionales';

    const shouldShowSection = function(section, view, activeId) {
        if (section.dataset.view !== view) return false;
        if (view !== 'adicionales') return true;
        if (activeId === additionalMenuId) return section.id === additionalMenuId;
        return section.id === activeId;
    };

    const setActiveState = function(view, activeId) {
        navLinks.forEach(function(link) {
            const isActive = link.dataset.view === view;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        sections.forEach(function(section) {
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

    const activate = function(targetId, shouldScroll) {
        if (shouldScroll === undefined) shouldScroll = true;
        const target = sectionById(targetId) || firstSectionForView(defaultView);
        if (!target) return;

        const view = target.dataset.view;
        const primaryTarget = target.id;
        setActiveState(view, primaryTarget);

        if (window.location.hash !== '#' + primaryTarget) {
            history.pushState(null, '', '#' + primaryTarget);
        }

        if (shouldScroll) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        closeMobileMenu();
    };

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            activate(link.getAttribute('href').slice(1));
        });
    });

    document.addEventListener('click', function(event) {
        const link = event.target.closest('a[href^="#"]');
        if (!link || link.closest('.nav-links')) return;
        if (!sectionById(link.getAttribute('href').slice(1))) return;
        event.preventDefault();
        activate(link.getAttribute('href').slice(1));
    });

    window.addEventListener('hashchange', function() {
        var id = window.location.hash.slice(1);
        activate(id, false);
    });

    bindMobileMenu();
    activate(window.location.hash.slice(1) || 'inicio', false);
}

function bindMobileMenu() {
    const hamburger = document.getElementById('hamburger-btn');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('menu-overlay');

    if (!hamburger || !navMenu || !overlay) return;

    function openMenu() {
        navMenu.classList.add('open');
        hamburger.classList.add('open');
        overlay.classList.add('active');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Cerrar menú');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
        hamburger.focus();
    }

    function closeMenu() {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        overlay.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
    }

    window.closeMobileMenu = closeMenu;

    hamburger.addEventListener('click', function() {
        if (navMenu.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu.classList.contains('open')) {
            closeMenu();
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 980 && navMenu.classList.contains('open')) {
            closeMenu();
        }
    });
}

window.UiePlannerNavigation = { bindSectionNavigation };

})();
