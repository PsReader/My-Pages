/**
 * ==============================================================================
 * DYNAMIC WEBSITE FUNCTIONALITY
 * ==============================================================================
 * Interactive UI components: accordions, active navigation highlighting, and
 * scroll-to-top.
 */

// Share one search-index request between the homepage browser and navbar suggestions.
window.loadLOTMSearchIndex = window.loadLOTMSearchIndex || (() => {
  let request;
  return () => {
    if (!request) {
      request = fetch('search-index.json')
        .then(response => {
          if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
          return response.json();
        })
        .catch(error => { request = null; throw error; });
    }
    return request;
  };
})();

/* ============================================================================= */
/* ACCORDION COMPONENT */
/* ============================================================================= */

/**
 * Sets up accordion functionality
 * Allows toggling of accordion items with automatic close of others
 */
function setAccordionContent(content, expanded) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isVisible = getComputedStyle(content).display !== 'none';
  const computedHeight = parseFloat(getComputedStyle(content).height) || content.getBoundingClientRect().height;
  const computedOpacity = parseFloat(getComputedStyle(content).opacity) || 1;
  if (content.getAnimations) content.getAnimations().forEach(animation => animation.cancel());

  if (reducedMotion || typeof content.animate !== 'function') {
    content.style.display = expanded ? 'block' : 'none';
    content.classList.toggle('active', expanded);
    content.style.height = '';
    content.style.opacity = '';
    content.style.overflow = '';
    return;
  }

  if (expanded) {
    content.style.display = 'block';
    content.classList.add('active');
    content.style.overflow = 'hidden';
    content.style.height = 'auto';
    content.style.opacity = '1';
    const targetHeight = parseFloat(getComputedStyle(content).height) || content.scrollHeight;
    content.style.height = '0px';
    content.style.opacity = '0';
    void content.offsetHeight;
    const animation = content.animate(
      [{ height: '0px', opacity: 0 }, { height: `${targetHeight}px`, opacity: 1 }],
      { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
    animation.onfinish = () => {
      content.style.height = 'auto';
      content.style.opacity = '';
      content.style.overflow = '';
      animation.cancel();
    };
    return;
  }

  if (!isVisible) return;
  content.style.display = 'block';
  content.style.height = `${computedHeight}px`;
  content.style.opacity = String(computedOpacity);
  content.style.overflow = 'hidden';
  void content.offsetHeight;
  const animation = content.animate(
    [{ height: `${computedHeight}px`, opacity: computedOpacity }, { height: '0px', opacity: 0 }],
    { duration: 250, easing: 'cubic-bezier(0.4, 0, 1, 1)' }
  );
  animation.onfinish = () => {
    content.style.display = 'none';
    content.classList.remove('active');
    content.style.height = '';
    content.style.opacity = '';
    content.style.overflow = '';
    animation.cancel();
  };
}

function setupAccordions() {
  const accordionHeaders = document.querySelectorAll('[data-accordion-header]');

  accordionHeaders.forEach(header => {
    const toggle = function(event) {
      if (event && event.target.closest && event.target.closest('a')) return
      const headerRow = this.closest('.accordion-header-row');
      const content = headerRow ? headerRow.nextElementSibling : this.nextElementSibling;
      if (!content || !content.hasAttribute('data-accordion-content')) return;
      const expanded = this.getAttribute('aria-expanded') === 'true';

      // Close all other accordions
      document.querySelectorAll('[data-accordion-content]').forEach(item => {
        if (item !== content) {
          const previousHeader = item.previousElementSibling?.querySelector('[data-accordion-header]') || item.previousElementSibling;
          if (previousHeader) {
            previousHeader.classList.remove('active');
            previousHeader.setAttribute('aria-expanded', 'false');
          }
          setAccordionContent(item, false);
        }
      });

      // Toggle current accordion
      const willExpand = !expanded;
      this.classList.toggle('active', willExpand);
      this.setAttribute('aria-expanded', String(willExpand));
      setAccordionContent(content, willExpand);
    };

    header.addEventListener('click', toggle);
    header.setAttribute('aria-expanded', 'false');

    // Native buttons already activate on Enter/Space; keep support for legacy role-buttons.
    if (header.tagName !== 'BUTTON') {
      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle.call(this);
        }
      });
    }
  });
}

/* ============================================================================= */
/* NAVIGATION HIGHLIGHTING */
/* ============================================================================= */

/**
 * Highlights the current page link in navigation
 * Compares current page with navigation links and applies active styling
 */
function setupActiveNavigation() {
  const currentPage =
    window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.topnav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active-page');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ============================================================================= */
/* TAROT CLUB BACK NAVIGATION */
/* ============================================================================= */

/**
 * Points every .tarot-back link back to the page the visitor came from,
 * unless that page is this one. Shared so the Tarot Club family of pages
 * does not each carry an inline copy.
 */
function setupTarotBackNavigation() {
  const back = document.querySelectorAll('.tarot-back');
  if (back.length === 0) return;
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const ref = document.referrer || '';
  const m = ref.match(/([^\/]+\.html)(?:\?|$)/);
  if (m && m[1] !== currentPage && m[1].indexOf('.html') !== -1) {
    back.forEach(a => a.setAttribute('href', m[1]));
  }
}

/* ============================================================================= */
/* TAROT TABLE CAPTION */
/* ============================================================================= */

/**
 * Fills the caption under the dealt hand with the hovered or focused card.
 * Runs only on pages that carry the .tarot-caption and .tarot-card markup.
 */
function setupTarotTable() {
  const caption = document.querySelector('.tarot-caption');
  if (!caption) return;

  const profileUrls = {
    'Klein Moretti': 'Klein%20Moretti.html',
    'Audrey Hall': 'Audrey%20Hall.html',
    'Alger Wilson': 'Alger%20Wilson.html',
    'Derrick Berg': 'Derrick%20Berg.html',
    'Fors Wall': 'Fors%20Wall.html',
    'Emlyn White': 'Emlyn%20White.html',
    'Cattleya': 'Cattleya.html',
    'Leonard Mitchell': 'Leonard%20Mitchell.html',
    'Xio Derecha': 'Xio%20Derecha.html',
    'Lumian Lee': 'Lumian%20Lee.html',
    'Sharron': 'Sharron.html',
    'Franca Roland': 'Franca%20Roland.html'
  };

  const setText = function() {
    const label = this.getAttribute('data-name') || '';
    const character = Object.keys(profileUrls).find(name => label.includes(name));
    caption.textContent = '';
    if (character) {
      const link = document.createElement('a');
      link.href = profileUrls[character];
      link.className = 'character-link';
      link.textContent = label;
      caption.appendChild(link);
    } else {
      caption.textContent = label;
    }
    this.classList.add('chosen');
  };
  const clearText = function() {
    caption.textContent = '';
    this.classList.remove('chosen');
  };

  document.querySelectorAll('.tarot-card').forEach(card => {
    card.addEventListener('mouseenter', setText);
    card.addEventListener('mouseleave', clearText);
    card.addEventListener('focus', setText);
    card.addEventListener('blur', clearText);
    card.addEventListener('click', setText);
  });
}

/**
 * Deals the cards into the fan once, the first time the fan scrolls into view.
 * Falls back to the settled state immediately for reduced-motion users and
 * browsers without IntersectionObserver.
 */
function setupTarotFanReveal() {
  const fan = document.querySelector('.tarot-fan');
  if (!fan) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)) {
    fan.classList.add('seated');
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('seated');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  io.observe(fan);
}

/* ============================================================================= */
/* PARTICIPANT CHIPS */
/* ============================================================================= */

/**
 * Decorates every "Participants:" line on the Gatherings page so each named
 * member is wrapped in a chip bearing that member's pathway glyph. Unmatched
 * text (new-member labels, "and", roles) survives untouched. No data is lost.
 */
const PART_CARDS = {
  'Klein Moretti': 'Fool_Symbol2_hd.webp',
  'The Fool': 'Fool_Symbol2_hd.webp',
  'Mr. Fool': 'Fool_Symbol2_hd.webp',
  'Mr. World': 'Fool_Symbol2_hd.webp',
  'The World': 'Fool_Symbol2_hd.webp',
  'Gehrman Sparrow': 'Fool_Symbol2_hd.webp',
  'Audrey Hall': 'Visionary_Symbol2.webp',
  'Alger Wilson': 'Tyrant_Symbol2.webp',
  'Derrick Berg': 'Sun_Symbol2.webp',
  'Fors Wall': 'Door_Symbol2_hd.webp',
  'Emlyn White': 'Moon_Symbol2.webp',
  'Cattleya': 'Hermit_Symbol2.webp',
  'Leonard Mitchell': 'Darkness_Symbol2.webp',
  'Xio Derecha': 'Justiciar_Symbol2.webp'
};

function setupParticipantChips() {
  const order = Object.keys(PART_CARDS).sort((a, b) => b.length - a.length);

  document.querySelectorAll('p').forEach(p => {
    if (!p.textContent.trim().startsWith('Participants')) return;
    let html = p.innerHTML;
    order.forEach(name => {
      html = html.split(name).join(
        '<span class="participant-chip">' +
        '<img src="images/' + PART_CARDS[name] + '" width="18" height="18" alt="' + name + '">' +
        '<span>' + name + '</span></span>'
      );
    });
    p.innerHTML = html;
  });
}

/**
 * Rotates the featured quote block on the homepage. Only quote/attribute
 * text changes; no layout shift. Static first quote for reduced-motion
 * users and when the block is absent.
 */
const FEATURED_QUOTES = [
  {
    text: 'Free things cost the most.',
    attr: 'Klein Moretti on Lord of Mysteries, Chapter 5'
  },
  {
    text: 'The oldest and strongest emotion of mankind is fear, and the oldest and strongest fear is the fear of the unknown.',
    attr: 'Klein Moretti on Lord of Mysteries, Chapter 9'
  },
  {
    text: 'A true professor can communicate with people gently and politely.',
    attr: 'Klein to Melissa on Lord of Mysteries, Chapter 98'
  },
  {
    text: 'Fate never repeats itself indefinitely. It always brings us some surprises.',
    attr: 'Klein Moretti on Lord of Mysteries, Chapter 153'
  }
];

function setupQuoteRotator() {
  const textEl = document.getElementById('featuredQuote');
  const attrEl = document.getElementById('featuredQuoteAttr');
  if (!textEl || !attrEl) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let index = 0;
  let timer = null;
  const rotate = () => {
    index = (index + 1) % FEATURED_QUOTES.length;
    textEl.textContent = '"' + FEATURED_QUOTES[index].text + '"';
    attrEl.textContent = FEATURED_QUOTES[index].attr;
  };
  const start = () => { if (!timer && !document.hidden) timer = setInterval(rotate, 6000); };
  const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  start();
}

/* ============================================================================= */
/* SCROLL TO TOP BUTTON */
/* ============================================================================= */

/**
 * Sets up scroll-to-top button functionality
 * Shows button when scrolled down, hides at top
 */
function setupScrollToTop() {
  const scrollBtn = document.getElementById('scrollToTop');

  if (scrollBtn) {
    scrollBtn.type = 'button';
    scrollBtn.tabIndex = -1;
    scrollBtn.setAttribute('aria-hidden', 'true');
    let framePending = false;
    const updateVisibility = () => {
      if (framePending) return;
      framePending = true;
      requestAnimationFrame(() => {
        const visible = window.scrollY > 300;
        scrollBtn.classList.toggle('is-visible', visible);
        scrollBtn.tabIndex = visible ? 0 : -1;
        scrollBtn.setAttribute('aria-hidden', String(!visible));
        framePending = false;
      });
    };
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('pageshow', updateVisibility);

    scrollBtn.addEventListener('click', function() {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  }
}

/* ============================================================================= */
/* MEMBER PROFILE TABS */
/* ============================================================================= */

/** Keeps the active profile tab synchronized with the URL hash and scroll target. */
function setupMemberTabs() {
  const tabs = Array.from(document.querySelectorAll('.member-tabs a[href^="#"]'));
  if (!tabs.length) return;

  const setActive = function() {
    const hash = window.location.hash || '#overview';
    tabs.forEach(tab => tab.classList.toggle('active', tab.getAttribute('href') === hash));
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
    });
  });
  window.addEventListener('hashchange', setActive);
  setActive();
}

/* ============================================================================= */
/* CHARACTER SUMMARY TOOLTIPS */
/* ============================================================================= */

const CHARACTER_SUMMARIES = {
  'Klein Moretti': 'The Fool and leader of the Tarot Club, central to Lord of Mysteries.',
  'Audrey Hall': 'Justice of the Tarot Club and a Beyonder of the Visionary Pathway.',
  'Alger Wilson': 'The Hanged Man, a veteran sailor and captain of the Blue Avenger.',
  'Derrick Berg': 'The Sun and a survivor of the City of Silver.',
  'Fors Wall': 'The Magician, a writer connected to the Abraham Family and Door Pathway.',
  'Emlyn White': 'The Moon, a Sanguine and Beyonder of the Moon Pathway.',
  'Cattleya': 'The Hermit and a powerful scholar with ties to the sea and pirates.',
  'Leonard Mitchell': 'The Star, a poet and Church of the Evernight Goddess member.',
  'Xio Derecha': 'Judgement, an MI9 operative and Beyonder of the Justiciar Pathway.',
  'Lumian Lee': 'The Chariot and protagonist of Circle of Inevitability.',
  'Sharron': 'Temperance, a formidable member tied to the Rose School of Thought.',
  'Franca Roland': 'The Empress, a Demoness Pathway Beyonder from Book Two.',
  'Jenna': 'A Minor Arcana member and Demoness Pathway Beyonder active in Trier.',
  'Anthony Reid': 'A Minor Arcana member associated with the Visionary Pathway.',
  'Maric': 'A Minor Arcana member connected to Temperance and the Chained Pathway.',
  'Will Auceptin': 'An auxiliary Tarot Club contact associated with the Wheel of Fortune.',
  'Pallez Zoroast': 'An ancient Error Pathway figure who advises Leonard Mitchell.',
  'Azik Eggers': 'A mysterious history professor whose past reaches into death and rebirth.',
  'Reinette Tinekerr': 'The Fool’s messenger and an ally of the Temperance faction.'
};

function setupCharacterTooltips() {
  const links = document.querySelectorAll('a.character-link[data-character]');
  if (!links.length) return;
  let tooltip = document.getElementById('characterTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'characterTooltip';
    tooltip.className = 'character-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tooltip);
  }

  let activeLink = null;
  const hide = () => {
    tooltip.classList.remove('is-visible');
    tooltip.setAttribute('aria-hidden', 'true');
    if (activeLink) activeLink.removeAttribute('aria-describedby');
    activeLink = null;
  };
  const show = link => {
    if (activeLink && activeLink !== link) activeLink.removeAttribute('aria-describedby');
    const name = link.getAttribute('data-character');
    tooltip.innerHTML = '<strong id="characterTooltipName"></strong><span></span><em>Open profile →</em>';
    tooltip.querySelector('strong').textContent = name;
    tooltip.querySelector('span').textContent = CHARACTER_SUMMARIES[name] || 'Open this character profile for a concise summary.';
    tooltip.setAttribute('aria-labelledby', 'characterTooltipName');
    tooltip.setAttribute('aria-hidden', 'false');
    link.setAttribute('aria-describedby', 'characterTooltip');
    activeLink = link;
    tooltip.classList.add('is-visible');
    const rect = link.getBoundingClientRect();
    const gap = 10;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - tooltip.offsetWidth - 12));
    let top = rect.bottom + gap;
    if (top + tooltip.offsetHeight > window.innerHeight - 12) top = rect.top - tooltip.offsetHeight - gap;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${Math.max(12, top)}px`;
  };

  links.forEach(link => {
    link.addEventListener('mouseenter', () => show(link));
    link.addEventListener('focus', () => show(link));
    link.addEventListener('mouseleave', hide);
    link.addEventListener('blur', hide);
  });
  window.addEventListener('scroll', hide, {passive: true});
  window.addEventListener('resize', hide);
}


function setupImageLoading() {
  document.querySelectorAll('img').forEach((img, index) => {
    if (index > 0 && !img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });
}


/* ============================================================================= */
/* NOVEL REVEALS */
/* ============================================================================= */
function setupNovelReveals() {
  const cards = Array.from(document.querySelectorAll('.novel-volume-card, .novel-intro'));
  const isVolumePage = /Volume\s+\d+/i.test(document.title);
  const chapters = isVolumePage ? Array.from(document.querySelectorAll('h3')) : [];
  chapters.forEach((heading, index) => {
    heading.classList.add('novel-chapter-heading', 'reveal-ready');
    heading.style.setProperty('--reveal-delay', `${Math.min(index * 70, 280)}ms`);
    const copy = heading.nextElementSibling;
    if (copy && copy.tagName === 'P') {
      copy.classList.add('novel-chapter-copy', 'reveal-ready');
      copy.style.setProperty('--reveal-delay', `${Math.min(index * 70 + 60, 340)}ms`);
    }
  });
  const items = [...cards, ...chapters.flatMap(h => [h, h.nextElementSibling]).filter(Boolean)];
  if (!items.length) return;
  items.forEach((item, index) => {
    item.classList.add('reveal-ready');
    if (!item.style.getPropertyValue('--reveal-delay')) item.style.setProperty('--reveal-delay', `${Math.min(index * 65, 420)}ms`);
  });
  const show = item => item.classList.add('is-visible');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    items.forEach(show);
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { show(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: .08, rootMargin: '0px 0px -30px' });
  items.forEach(item => observer.observe(item));
}


function setupResponsiveTables() {
  document.querySelectorAll('table').forEach(table => {
    const wrapper = table.parentElement;
    if (!wrapper) return;
    if (table.scrollWidth > wrapper.clientWidth || ['auto', 'scroll'].includes(getComputedStyle(wrapper).overflowX)) {
      wrapper.classList.add('table-scroll');
      if (!wrapper.hasAttribute('role')) wrapper.setAttribute('role', 'region');
      if (!wrapper.hasAttribute('aria-label')) wrapper.setAttribute('aria-label', 'Scrollable reference table');
      if (!wrapper.hasAttribute('tabindex')) wrapper.setAttribute('tabindex', '0');
    }
  });
}

/* ============================================================================= */
/* INITIALIZATION */
/* ============================================================================= */

/**
 * Initializes all interactive components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  setupAccordions();
  setupActiveNavigation();
  setupTarotBackNavigation();
  setupScrollToTop();
  setupTarotTable();
  setupTarotFanReveal();
  setupParticipantChips();
  setupQuoteRotator();
  setupMemberTabs();
  setupCharacterTooltips();
  setupImageLoading();
  setupNovelReveals();
  setupResponsiveTables();
});
