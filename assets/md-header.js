/**
 * Medical-Deal Custom Header JavaScript
 * Vanilla JS, no external libraries
 * Handles: mobile drawer, category dropdown
 */
(function () {
  'use strict';

  var FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function MDHeader(container) {
    if (container.hasAttribute('data-md-header-initialized')) return;
    container.setAttribute('data-md-header-initialized', 'true');

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
    this._onKeyDown = null;
    this._onDocClick = null;

    this.init();
  }

  MDHeader.prototype.init = function () {
    this.bindEvents();
  };

  MDHeader.prototype.bindEvents = function () {
    var self = this;

    if (self.hamburger) {
      self.hamburger.addEventListener('click', function (e) {
        e.preventDefault();
        if (self.isCatOpen) self.closeCategory();
        self.openDrawer();
      });
    }

    if (self.drawerClose) {
      self.drawerClose.addEventListener('click', function () {
        self.closeDrawer();
      });
    }

    if (self.overlay) {
      self.overlay.addEventListener('click', function () {
        self.closeDrawer();
      });
    }

    if (self.catBtn && self.catDropdown) {
      self.catBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (self.isDrawerOpen) self.closeDrawer();
        self.toggleCategory();
      });

      self._onDocClick = function (e) {
        if (
          self.isCatOpen &&
          !self.catBtn.contains(e.target) &&
          !self.catDropdown.contains(e.target)
        ) {
          self.closeCategory();
        }
      };
      document.addEventListener('click', self._onDocClick);
    }

    self._onKeyDown = function (e) {
      if (e.key === 'Escape') {
        if (self.isDrawerOpen) {
          self.closeDrawer();
          return;
        }
        if (self.isCatOpen) {
          self.closeCategory();
        }
      }
    };
    document.addEventListener('keydown', self._onKeyDown);

    if (self.drawer) {
      self.drawer.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          self.closeDrawer();
        }
        if (e.key === 'Tab') {
          self.trapFocus(e);
        }
      });
    }
  };

  MDHeader.prototype.openDrawer = function () {
    if (this.isDrawerOpen) return;
    this.isDrawerOpen = true;
    this.previousActiveElement = document.activeElement;
    this.drawer.classList.add('is-open');
    if (this.hamburger) {
      this.hamburger.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';

    var self = this;
    requestAnimationFrame(function () {
      var firstFocusable = self.drawer.querySelector(FOCUSABLE_SELECTOR);
      if (firstFocusable) firstFocusable.focus();
    });
  };

  MDHeader.prototype.closeDrawer = function () {
    if (!this.isDrawerOpen) return;
    this.isDrawerOpen = false;
    this.drawer.classList.remove('is-open');
    if (this.hamburger) {
      this.hamburger.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';

    if (this.previousActiveElement && this.previousActiveElement.focus) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  };

  MDHeader.prototype.trapFocus = function (e) {
    if (!this.isDrawerOpen) return;
    var focusableElements = this.drawer.querySelectorAll(FOCUSABLE_SELECTOR);
    if (focusableElements.length === 0) return;

    var first = focusableElements[0];
    var last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  MDHeader.prototype.toggleCategory = function () {
    if (this.isCatOpen) {
      this.closeCategory();
    } else {
      this.openCategory();
    }
  };

  MDHeader.prototype.openCategory = function () {
    this.isCatOpen = true;
    this.catBtn.classList.add('is-open');
    this.catDropdown.classList.add('is-open');
    this.catBtn.setAttribute('aria-expanded', 'true');
  };

  MDHeader.prototype.closeCategory = function () {
    this.isCatOpen = false;
    this.catBtn.classList.remove('is-open');
    this.catDropdown.classList.remove('is-open');
    this.catBtn.setAttribute('aria-expanded', 'false');
  };

  function initAll() {
    var containers = document.querySelectorAll('.md-header-section');
    for (var i = 0; i < containers.length; i++) {
      new MDHeader(containers[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (e) {
      var section = document.getElementById('shopify-section-' + e.detail.sectionId);
      if (section) {
        var containers = section.querySelectorAll('.md-header-section');
        for (var i = 0; i < containers.length; i++) {
          new MDHeader(containers[i]);
        }
      }
    });
  }
})();
