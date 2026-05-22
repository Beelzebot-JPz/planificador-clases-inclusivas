(function () {
function bindSectionNavigation() {
    const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
    const sections = Array.from(document.querySelectorAll('.section-card[id]'));

    if (!sections.length) return;

    const setActiveLink = id => {
        navLinks.forEach(link => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
        sections.forEach(section => {
            section.classList.toggle('section-active', section.id === id);
        });
    };

    const updateActiveLink = () => {
        const anchorLine = Math.min(180, window.innerHeight * 0.35);
        const current = sections.find(section => {
            const rect = section.getBoundingClientRect();
            return rect.top <= anchorLine && rect.bottom >= anchorLine;
        }) || sections
            .map(section => ({ section, distance: Math.abs(section.getBoundingClientRect().top - anchorLine) }))
            .sort((a, b) => a.distance - b.distance)[0].section;
        setActiveLink(current.id);
    };

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const id = link.getAttribute('href').slice(1);
            setActiveLink(id);
        });
    });

    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('hashchange', () => window.setTimeout(updateActiveLink, 80));
    updateActiveLink();
    window.setTimeout(updateActiveLink, 120);
}

window.AulaClaraNavigation = { bindSectionNavigation };

})();
