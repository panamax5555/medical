/**
 * Medical-Deal Homepage Promo Stage
 * Vanilla JS: campaign slider + category tabs
 */
(function () {
  'use strict';

  function MDPromoSlider(el) {
    this.el = el;
    this.track = el.querySelector('.md-promo-slider__track');
    this.slides = el.querySelectorAll('.md-promo-slider__slide');
    this.prevBtn = el.querySelector('.md-promo-slider__arrow--prev');
    this.nextBtn = el.querySelector('.md-promo-slider__arrow--next');
    this.dots = el.querySelectorAll('.md-promo-slider__dot');
    this.dotsContainer = el.querySelector('.md-promo-slider__dots');

    this.currentIndex = 0;
    this.slideCount = this.slides.length;
    this.autoplay = el.getAttribute('data-autoplay') === 'true';
    this.interval = parseInt(el.getAttribute('data-interval'), 10) || 5000;
    this.autoplayTimer = null;
    this.isPaused = false;

    if (this.slideCount < 2) return;
    this.init();
  }

  MDPromoSlider.prototype.init = function () {
    var self = this;
    this.setSlide(0, false);

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', function () { self.prev(); });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', function () { self.next(); });
    }

    if (this.dotsContainer) {
      this.dotsContainer.addEventListener('click', function (e) {
        var dot = e.target.closest('.md-promo-slider__dot');
        if (!dot) return;
        var idx = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(idx) && idx >= 0 && idx < self.slideCount) {
          self.setSlide(idx, true);
        }
      });
    }

    this.el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { self.prev(); }
      if (e.key === 'ArrowRight') { self.next(); }
    });

    if (this.autoplay) {
      this.startAutoplay();
      this.el.addEventListener('mouseenter', function () { self.pauseAutoplay(); });
      this.el.addEventListener('focusin', function () { self.pauseAutoplay(); });
      this.el.addEventListener('mouseleave', function () { self.resumeAutoplay(); });
      this.el.addEventListener('focusout', function (e) {
        if (!self.el.contains(e.relatedTarget)) { self.resumeAutoplay(); }
      });
    }
  };

  MDPromoSlider.prototype.setSlide = function (index, animate) {
    if (index < 0) index = this.slideCount - 1;
    if (index >= this.slideCount) index = 0;
    this.currentIndex = index;

    var offset = -index * 100;
    if (animate !== false) {
      this.track.style.transition = 'transform 0.4s ease';
    } else {
      this.track.style.transition = 'none';
    }
    this.track.style.transform = 'translateX(' + offset + '%)';

    for (var i = 0; i < this.slides.length; i++) {
      this.slides[i].setAttribute('aria-hidden', i === index ? 'false' : 'true');
    }

    for (var d = 0; d < this.dots.length; d++) {
      this.dots[d].classList.toggle('is-active', d === index);
      this.dots[d].setAttribute('aria-current', d === index ? 'true' : 'false');
    }

    if (this.prevBtn) {
      this.prevBtn.setAttribute('aria-label', 'Vorherige Folie');
    }
    if (this.nextBtn) {
      this.nextBtn.setAttribute('aria-label', 'Nächste Folie');
    }
  };

  MDPromoSlider.prototype.next = function () {
    this.setSlide(this.currentIndex + 1, true);
    this.resetAutoplay();
  };

  MDPromoSlider.prototype.prev = function () {
    this.setSlide(this.currentIndex - 1, true);
    this.resetAutoplay();
  };

  MDPromoSlider.prototype.startAutoplay = function () {
    if (!this.autoplay || this.slideCount < 2) return;
    var self = this;
    this.stopAutoplay();
    this.autoplayTimer = setInterval(function () {
      if (!self.isPaused) {
        self.setSlide(self.currentIndex + 1, true);
      }
    }, this.interval);
  };

  MDPromoSlider.prototype.stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  MDPromoSlider.prototype.pauseAutoplay = function () {
    this.isPaused = true;
  };

  MDPromoSlider.prototype.resumeAutoplay = function () {
    this.isPaused = false;
  };

  MDPromoSlider.prototype.resetAutoplay = function () {
    this.stopAutoplay();
    this.startAutoplay();
  };

  /* Category Tabs
     ========================================================================== */
  function MDPromoTabs(el) {
    this.el = el;
    this.buttons = el.querySelectorAll('.md-promo-tabs__btn');
    this.panels = el.querySelectorAll('.md-promo-tabs__panel');
    if (this.buttons.length === 0) return;
    this.init();
  }

  MDPromoTabs.prototype.init = function () {
    var self = this;
    this.activateTab(0);

    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].addEventListener('click', (function (idx) {
        return function () { self.activateTab(idx); };
      })(i));
    }
  };

  MDPromoTabs.prototype.activateTab = function (index) {
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].classList.toggle('is-active', i === index);
      this.buttons[i].setAttribute('aria-selected', i === index ? 'true' : 'false');
    }
    for (var j = 0; j < this.panels.length; j++) {
      this.panels[j].classList.toggle('is-active', j === index);
    }
  };

  /* Init all
     ========================================================================== */
  function initAll() {
    var sliders = document.querySelectorAll('.md-promo-slider[data-autoplay]');
    for (var i = 0; i < sliders.length; i++) {
      new MDPromoSlider(sliders[i]);
    }

    var tabs = document.querySelectorAll('.md-promo-tabs');
    for (var t = 0; t < tabs.length; t++) {
      new MDPromoTabs(tabs[t]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
