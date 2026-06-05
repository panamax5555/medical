/**
 * Medical-Deal Custom Header JavaScript
 * Vanilla JS, no external libraries
 * Handles: mobile drawer, category dropdown, sticky header
 */

(function () {
  'use strict';

  const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  class MDHeader {
    constructor(container) {
      this.container = container;
      this.drawer = container.querySelector('.md-header-drawer');
      this.hamburger = container.querySelector('.md-header-hamburger');
      this.drawerClose = container.querySelector('.md-header-drawer__close');
      this.overlay = container.querySelector('.md-header-drawer__overlay');
      this.catBtn = container.querySelector('.md-header-catbtn');
      this.catDropdown = container.querySelector('.md-header-catdropdown');
      this.isDrawerOpen = false;
      this.isCatOpen = false;
      this.previousActiveElement = null;

      this.init();
    }

    init() {
      this.bindEvents();
    }

    bindEvents() {
      if (this.hamburger) {
        this.hamburger.addEventListener('click', (e) => {
          e.preventDefault();
          this.openDrawer();
        });
      }

      if (this.drawerClose) {
        this.drawerClose.addEventListener('click', () => this.closeDrawer());
      }

      if (this.overlay) {
        this.overlay.addEventListener('click', () => this.closeDrawer());
      }

      if (this.catBtn && this.catDropdown) {
        this.catBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleCategory();
        });

        document.addEventListener('click', (e) => {
          if (
            this.isCatOpen &&
            !this.catBtn.contains(e.target) &&
            !this.catDropdown.contains(e.target)
          ) {
            this.closeCategory();
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.isDrawerOpen) {
            this.closeDrawer();
          }
          if (this.isCatOpen) {
            this.closeCategory();
          }
        }
      });

      if (this.drawer) {
        this.drawer.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            this.closeDrawer();
          }
          if (e.key === 'Tab') {
            this.trapFocus(e);
          }
        });
      }
    }

    openDrawer() {
      if (this.isDrawerOpen) return;
      this.isDrawerOpen = true;
      this.previousActiveElement = document.activeElement;
      this.drawer.classList.add('is-open');
      document.body.style.overflow = 'hidden';

      requestAnimationFrame(() => {
        const firstFocusable = this.drawer.querySelector(FOCUSABLE_SELECTOR);
        if (firstFocusable) firstFocusable.focus();
      });
    }

    closeDrawer() {
      if (!this.isDrawerOpen) return;
      this.isDrawerOpen = false;
      this.drawer.classList.remove('is-open');
      document.body.style.overflow = '';

      if (this.previousActiveElement && this.previousActiveElement.focus) {
        this.previousActiveElement.focus();
        this.previousActiveElement = null;
      }
    }

    trapFocus(e) {
      if (!this.isDrawerOpen) return;
      const focusableElements = this.drawer.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    toggleCategory() {
      if (this.isCatOpen) {
        this.closeCategory();
      } else {
        this.openCategory();
      }
    }

    openCategory() {
      this.isCatOpen = true;
      this.catBtn.classList.add('is-open');
      this.catDropdown.classList.add('is-open');
      this.catBtn.setAttribute('aria-expanded', 'true');
    }

    closeCategory() {
      this.isCatOpen = false;
      this.catBtn.classList.remove('is-open');
      this.catDropdown.classList.remove('is-open');
      this.catBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function initAll() {
    const containers = document.querySelectorAll('.md-header-section');
    containers.forEach((container) => new MDHeader(container));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
