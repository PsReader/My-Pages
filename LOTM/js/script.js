/**
 * ==============================================================================
 * DYNAMIC WEBSITE FUNCTIONALITY
 * ==============================================================================
 * Comprehensive JavaScript module for interactive UI components including tabs,
 * accordions, modals, filters, smooth scrolling, lazy loading, and animations.
 */

/* ============================================================================= */
/* TAB COMPONENT */
/* ============================================================================= */

/**
 * Sets up tab functionality
 * Attaches click handlers to tab buttons and shows/hides tab content
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll('[data-tab-button]');
  const tabContents = document.querySelectorAll('[data-tab-content]');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab-button');

      // Hide all tabs and remove active state
      tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
      });

      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));

      // Show selected tab and mark button as active
      const selectedTab = document.querySelector(
        `[data-tab-content="${tabName}"]`
      );
      if (selectedTab) {
        selectedTab.style.display = 'block';
        selectedTab.classList.add('active');
        this.classList.add('active');
      }
    });
  });
}

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
    header.addEventListener('click', function() {
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
    });
  });
}

/* ============================================================================= */
/* SMOOTH SCROLL */
/* ============================================================================= */

/**
 * Sets up smooth scrolling for anchor links
 * Smooth animation when clicking links with href starting with #
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/* ============================================================================= */
/* MODAL COMPONENT */
/* ============================================================================= */

/**
 * Sets up modal/dialog functionality
 * Handles opening, closing, and clicking outside to close
 */
function setupModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
  const modals = document.querySelectorAll('[data-modal]');
  const closeButtons = document.querySelectorAll('[data-modal-close]');

  // Open modal on trigger click
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal-trigger');
      const modal = document.querySelector(`[data-modal="${modalId}"]`);
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
      }
    });
  });

  // Close modal on close button click
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const modal = this.closest('[data-modal]');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
      }
    });
  });

  // Close modal when clicking outside content
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
        this.classList.remove('active');
      }
    });
  });
}

/* ============================================================================= */
/* FILTER COMPONENT */
/* ============================================================================= */

/**
 * Sets up item filtering functionality
 * Filters items based on selected filter button
 */
function setupFilters() {
  const filterButtons = document.querySelectorAll('[data-filter]');

  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const filterValue = this.getAttribute('data-filter');
      const items = document.querySelectorAll('[data-filter-item]');

      // Update active button state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Filter and display/hide items
      items.forEach(item => {
        if (
          filterValue === 'all' ||
          item.getAttribute('data-filter-item') === filterValue
        ) {
          item.style.display = 'block';
          item.classList.add('fade-in');
        } else {
          item.style.display = 'none';
        }
      });
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
    window.location.pathname.split('/').pop() || 'LOTMhome.html';
  const navLinks = document.querySelectorAll('.topnav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'LOTMhome.html')) {
      link.classList.add('active-page');
      link.style.color = '#FFD700';
      link.style.fontWeight = 'bold';
    }
  });
}

/* ============================================================================= */
/* LAZY IMAGE LOADING */
/* ============================================================================= */

/**
 * Sets up lazy loading for images
 * Uses Intersection Observer API for performance optimization
 */
function setupLazyLoading() {
  const images = document.querySelectorAll('img[data-lazy]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = entry.target.getAttribute('data-lazy');
          entry.target.removeAttribute('data-lazy');
          imageObserver.unobserve(entry.target);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
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
/* SCROLL ANIMATIONS */
/* ============================================================================= */

/**
 * Sets up scroll animations using Intersection Observer
 * Adds animation classes to elements as they come into view
 */
function setupScrollAnimation() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-on-scroll');
      }
    });
  }, observerOptions);

  document
    .querySelectorAll('[data-animate]')
    .forEach(el => observer.observe(el));
}

/* ============================================================================= */
/* INITIALIZATION */
/* ============================================================================= */

/**
 * Initializes all interactive components when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  setupTabs();
  setupAccordions();
  setupSmoothScroll();
  setupModals();
  setupFilters();
  setupActiveNavigation();
  setupLazyLoading();
  setupScrollToTop();
});

/**
 * Sets up scroll animations after page load
 */
window.addEventListener('load', setupScrollAnimation);
