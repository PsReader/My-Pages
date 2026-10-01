/**
 * ==============================================================================
 * DYNAMIC WEBSITE FUNCTIONALITY
 * ==============================================================================
 * Interactive UI components: accordions, active navigation highlighting, and
 * scroll-to-top.
 */

/* ============================================================================= */
/* ACCORDION COMPONENT */
/* ============================================================================= */

/**
 * Sets up accordion functionality
 * Allows toggling of accordion items with automatic close of others
 */
function setupAccordions() {
  const accordionHeaders = document.querySelectorAll('[data-accordion-header]');

  accordionHeaders.forEach(header => {
    const toggle = function(event) {
      if (event && event.target.closest && event.target.closest('a')) return
      const content = this.nextElementSibling;

      // Close all other accordions
      document.querySelectorAll('[data-accordion-content]').forEach(item => {
        if (item !== content) {
          item.style.display = 'none';
          item.previousElementSibling.classList.remove('active');
        }
      });

      // Toggle current accordion
      this.classList.toggle('active');
      content.style.display =
        content.style.display === 'block' ? 'none' : 'block';
      this.setAttribute('aria-expanded', this.classList.contains('active') ? 'true' : 'false');
    };

    header.addEventListener('click', toggle);
    header.setAttribute('aria-expanded', 'false');

    // Keyboard support for role="button" headers
    header.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.call(this);
      }
    });
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
      link.style.color = '#FFD700';
      link.style.fontWeight = 'bold';
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

  const setText = function() {
    caption.textContent = this.getAttribute('data-name') || '';
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
  'Klein Moretti': 'Fool_Symbol2.webp',
  'The Fool': 'Fool_Symbol2.webp',
  'Mr. Fool': 'Fool_Symbol2.webp',
  'Mr. World': 'Fool_Symbol2.webp',
  'The World': 'Fool_Symbol2.webp',
  'Gehrman Sparrow': 'Fool_Symbol2.webp',
  'Audrey Hall': 'Visionary_Symbol2.webp',
  'Alger Wilson': 'Tyrant_Symbol2.webp',
  'Derrick Berg': 'Sun_Symbol2.webp',
  'Fors Wall': 'Door_Symbol2.webp',
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
    attr: '— Klein Moretti on Lord of Mysteries, Chapter 5'
  },
  {
    text: 'The oldest and strongest emotion of mankind is fear, and the oldest and strongest fear is the fear of the unknown.',
    attr: '— Klein Moretti on Lord of Mysteries, Chapter 9'
  },
  {
    text: 'A true professor can communicate with people gently and politely.',
    attr: '— Klein to Melissa on Lord of Mysteries, Chapter 98'
  },
  {
    text: 'Fate never repeats itself indefinitely. It always brings us some surprises.',
    attr: '— Klein Moretti on Lord of Mysteries, Chapter 153'
  }
];

function setupQuoteRotator() {
  const textEl = document.getElementById('featuredQuote');
  const attrEl = document.getElementById('featuredQuoteAttr');
  if (!textEl || !attrEl) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let index = 0;
  setInterval(() => {
    index = (index + 1) % FEATURED_QUOTES.length;
    textEl.textContent = '"' + FEATURED_QUOTES[index].text + '"';
    attrEl.textContent = FEATURED_QUOTES[index].attr;
  }, 6000);
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
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'block';
      } else {
        scrollBtn.style.display = 'none';
      }
    });

    scrollBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
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
});