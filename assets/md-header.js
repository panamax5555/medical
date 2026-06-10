/**
 * Medical-Deal Custom Header JavaScript
 * Vanilla JS: mobile drawer drilldown, desktop category flyout
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
    this.drawerPanel = container.querySelector('.md-header-drawer__panel');
    this.hamburger = container.querySelector('.md-header-hamburger');
    this.drawerClose = container.querySelector('.md-header-drawer__close');
    this.overlay = container.querySelector('.md-header-drawer__overlay');

    this.catBtn = container.querySelector('.md-header-catbtn');
    this.catFlyout = container.querySelector('.md-header-catflyout');
    this.railLinks = container.querySelectorAll('.md-header-catflyout__rail-link');
    this.panelContents = container.querySelectorAll('.md-header-catflyout__panel-content');

    this.isDrawerOpen = false;
    this.isCatOpen = false;
    this.activeCatIndex = 0;
    this.previousActiveElement = null;
    this._onKeyDown = null;
    this._onDocClick = null;

    this.init();
  }

  MDHeader.prototype.init = function () {
    this.bindEvents();
    if (this.railLinks.length > 0) {
      this.activateCategory(0);
    }
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

    if (self.catBtn && self.catFlyout) {
      self.catBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (self.isDrawerOpen) self.closeDrawer();
        self.toggleCategory();
      });

      self._onDocClick = function (e) {
        if (
          self.isCatOpen &&
          !self.catBtn.contains(e.target) &&
          !self.catFlyout.contains(e.target)
        ) {
          self.closeCategory();
        }
      };
      document.addEventListener('click', self._onDocClick);

      for (var r = 0; r < self.railLinks.length; r++) {
        self.railLinks[r].addEventListener('mouseenter', function (el) {
          return function () {
            var idx = parseInt(el.getAttribute('data-cat-index'), 10);
            if (!isNaN(idx)) self.activateCategory(idx);
          };
        }(self.railLinks[r]));

        self.railLinks[r].addEventListener('focus', function (el) {
          return function () {
            var idx = parseInt(el.getAttribute('data-cat-index'), 10);
            if (!isNaN(idx)) self.activateCategory(idx);
          };
        }(self.railLinks[r]));
      }
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

      var drillBtns = self.drawer.querySelectorAll('[data-drilldown-target]');
      for (var d = 0; d < drillBtns.length; d++) {
        drillBtns[d].addEventListener('click', function (el) {
          return function (e) {
            e.preventDefault();
            self.openDrilldown(el.getAttribute('data-drilldown-target'));
          };
        }(drillBtns[d]));
      }

      var backBtns = self.drawer.querySelectorAll('.md-header-drawer__back');
      for (var b = 0; b < backBtns.length; b++) {
        backBtns[b].addEventListener('click', function () {
          self.closeDrilldown();
        });
      }
    }
  };

  /* Drawer
     ========================================================================== */
  MDHeader.prototype.openDrawer = function () {
    if (this.isDrawerOpen) return;
    this.isDrawerOpen = true;
    this.previousActiveElement = document.activeElement;
    if (this.hamburger) this.hamburger.setAttribute('aria-expanded', 'true');
    this.drawer.classList.remove('is-closing');
    this.drawer.classList.add('is-open');
    this.openLevel('main');
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
    if (this.hamburger) this.hamburger.setAttribute('aria-expanded', 'false');

    this.drawer.classList.add('is-closing');
    this.drawer.classList.remove('is-open');

    var self = this;
    var didFinish = false;
    var fallbackTimer = null;

    function finishClose() {
      if (didFinish) return;
      didFinish = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);
      self.drawerPanel.removeEventListener('transitionend', onTransitionEnd);
      self.drawer.classList.remove('is-closing');
      document.body.style.overflow = '';
      if (self.previousActiveElement && self.previousActiveElement.focus) {
        self.previousActiveElement.focus();
        self.previousActiveElement = null;
      }
    }

    function onTransitionEnd() {
      finishClose();
    }

    self.drawerPanel.addEventListener('transitionend', onTransitionEnd);
    fallbackTimer = setTimeout(finishClose, 350);
  };

  MDHeader.prototype.openDrilldown = function (target) {
    this.openLevel(target);
  };

  MDHeader.prototype.closeDrilldown = function () {
    this.openLevel('main');
  };

  MDHeader.prototype.openLevel = function (level) {
    var allLevels = this.drawer.querySelectorAll('.md-header-drawer__level');
    var targetClass = '.md-header-drawer__level--' + (level === 'main' ? 'main' : 'child[data-drilldown-level="' + level + '"]');
    var targetEl = this.drawer.querySelector(targetClass);

    for (var i = 0; i < allLevels.length; i++) {
      allLevels[i].classList.remove('is-active');
    }
    if (targetEl) {
      targetEl.classList.add('is-active');
      var backBtn = targetEl.querySelector('.md-header-drawer__back');
      if (backBtn) {
        requestAnimationFrame(function () { backBtn.focus(); });
      }
    }
  };

  MDHeader.prototype.trapFocus = function (e) {
    if (!this.isDrawerOpen) return;
    var activeEl = this.drawer.querySelector('.md-header-drawer__level.is-active');
    if (!activeEl) return;
    var focusableElements = activeEl.querySelectorAll(FOCUSABLE_SELECTOR);
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

  /* Category Flyout
     ========================================================================== */
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
    this.catBtn.setAttribute('aria-expanded', 'true');
    this.catFlyout.classList.add('is-open');
    this.activateCategory(this.activeCatIndex);
  };

  MDHeader.prototype.closeCategory = function () {
    this.isCatOpen = false;
    this.catBtn.classList.remove('is-open');
    this.catBtn.setAttribute('aria-expanded', 'false');
    this.catFlyout.classList.remove('is-open');
  };

  MDHeader.prototype.activateCategory = function (index) {
    this.activeCatIndex = index;
    for (var i = 0; i < this.railLinks.length; i++) {
      this.railLinks[i].classList.toggle('is-active', i === index);
    }
    for (var j = 0; j < this.panelContents.length; j++) {
      this.panelContents[j].classList.toggle('is-active', j === index);
    }
  };

  /* Init
     ========================================================================== */
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
