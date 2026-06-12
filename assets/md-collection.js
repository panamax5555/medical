(function () {
  'use strict';

  var INIT_ATTR = 'data-md-collection-filterbar-initialized';
  if (document.documentElement.hasAttribute(INIT_ATTR)) return;
  document.documentElement.setAttribute(INIT_ATTR, '');

  var SELECTOR_GROUP = '.md-collection-filterbar__group';
  var SELECTOR_BAR = '.md-collection-filterbar';

  function closeAllGroups(bar) {
    if (!bar) return;
    var openGroups = bar.querySelectorAll(SELECTOR_GROUP + '[open]');
    for (var i = 0; i < openGroups.length; i++) {
      openGroups[i].removeAttribute('open');
    }
  }

  function closeAllFilterBars() {
    var bars = document.querySelectorAll(SELECTOR_BAR);
    for (var i = 0; i < bars.length; i++) {
      closeAllGroups(bars[i]);
    }
  }

  function handleToggle(e) {
    var target = e.target;
    if (!target.open) return;
    if (!target.matches(SELECTOR_GROUP)) return;

    var bar = target.closest(SELECTOR_BAR);
    if (!bar) return;

    var openGroups = bar.querySelectorAll(SELECTOR_GROUP + '[open]');
    for (var i = 0; i < openGroups.length; i++) {
      if (openGroups[i] !== target) openGroups[i].removeAttribute('open');
    }
  }

  function handleClickOutside(e) {
    if (e.target.closest(SELECTOR_BAR)) return;
    closeAllFilterBars();
  }

  function handleKeydown(e) {
    if (e.key !== 'Escape') return;
    if (e.target.matches('input, textarea, select')) return;
    closeAllFilterBars();
  }

  document.addEventListener('toggle', handleToggle, true);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);

  function updateMediaDots(media, activeIndex) {
    if (!media) return;
    var dots = media.querySelectorAll('[data-md-card-media-dot]');
    if (!dots.length) return;

    for (var d = 0; d < dots.length; d++) {
      if (d === activeIndex) {
        dots[d].classList.add('is-active');
      } else {
        dots[d].classList.remove('is-active');
      }
    }
  }

  function handleMediaNavClick(e) {
    var button = e.target.closest('[data-md-card-media-prev], [data-md-card-media-next]');
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    var media = button.closest('[data-md-card-media]');
    if (!media) return;

    var track = media.querySelector('[data-md-card-media-track]');
    if (!track) return;

    var slides = track.querySelectorAll('[data-md-card-media-slide]');
    if (slides.length <= 1) return;

    var direction = button.hasAttribute('data-md-card-media-next') ? 1 : -1;

    var currentIndex = parseInt(media.getAttribute('data-md-card-media-index') || '0', 10);
    if (isNaN(currentIndex) || currentIndex < 0 || currentIndex >= slides.length) {
      currentIndex = 0;
    }

    var nextIndex = (currentIndex + direction + slides.length) % slides.length;
    media.setAttribute('data-md-card-media-index', String(nextIndex));

    track.scrollTo({
      left: slides[nextIndex].offsetLeft,
      behavior: 'smooth'
    });
    updateMediaDots(media, nextIndex);
  }

  function handleMediaDotClick(e) {
    var dot = e.target.closest('[data-md-card-media-dot]');
    if (!dot) return;

    e.preventDefault();
    e.stopPropagation();

    var media = dot.closest('[data-md-card-media]');
    if (!media) return;

    var track = media.querySelector('[data-md-card-media-track]');
    if (!track) return;

    var slides = track.querySelectorAll('[data-md-card-media-slide]');
    if (!slides.length) return;

    var index = parseInt(dot.getAttribute('data-md-card-media-dot-index') || '0', 10);
    if (isNaN(index) || index < 0 || index >= slides.length) return;

    media.setAttribute('data-md-card-media-index', String(index));
    track.scrollTo({
      left: slides[index].offsetLeft,
      behavior: 'smooth'
    });
    updateMediaDots(media, index);
  }

  function handleMediaScrollSync(e) {
    var track = e.target;
    if (!track.hasAttribute('data-md-card-media-track')) return;

    var media = track.closest('[data-md-card-media]');
    if (!media) return;

    var slides = track.querySelectorAll('[data-md-card-media-slide]');
    if (!slides.length) return;

    var scrollLeft = track.scrollLeft;
    var closestIndex = 0;
    var closestDistance = Infinity;

    for (var s = 0; s < slides.length; s++) {
      var distance = Math.abs(slides[s].offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = s;
      }
    }

    media.setAttribute('data-md-card-media-index', String(closestIndex));
    updateMediaDots(media, closestIndex);
  }

  var debouncedScrollSync;

  function onDebouncedScrollSync(e) {
    clearTimeout(debouncedScrollSync);
    debouncedScrollSync = setTimeout(function () {
      handleMediaScrollSync(e);
    }, 100);
  }

  document.addEventListener('click', function (e) {
    handleMediaNavClick(e);
    handleMediaDotClick(e);
    handleViewSwitchClick(e);
  });

  document.addEventListener('scroll', onDebouncedScrollSync, true);

  /* ==========================================================================
     View Switch
     ========================================================================== */
  var VIEW_STORAGE_KEY = 'mdCollectionView';

  function getCollectionRoot() {
    return document.querySelector('.md-collection[data-md-view]');
  }

  function setView(view) {
    var root = getCollectionRoot();
    if (!root) return;
    root.setAttribute('data-md-view', view);

    var buttons = document.querySelectorAll('[data-md-view-button]');
    for (var b = 0; b < buttons.length; b++) {
      var btnView = buttons[b].getAttribute('data-md-view-button');
      buttons[b].setAttribute('aria-pressed', btnView === view ? 'true' : 'false');
    }

    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view);
    } catch (e) {}
  }

  function handleViewSwitchClick(e) {
    var button = e.target.closest('[data-md-view-button]');
    if (!button) return;

    e.preventDefault();
    var view = button.getAttribute('data-md-view-button');
    if (view) setView(view);
  }

  function initView() {
    var root = getCollectionRoot();
    if (!root) return;

    var stored;
    try {
      stored = localStorage.getItem(VIEW_STORAGE_KEY);
    } catch (e) {}

    var view = stored || root.getAttribute('data-md-view') || 'grid';
    setView(view);
  }

  initView();

  /* Re-apply view after AJAX filter updates */
  var observer = new MutationObserver(function (mutations) {
    for (var m = 0; m < mutations.length; m++) {
      for (var n = 0; n < mutations[m].addedNodes.length; n++) {
        var node = mutations[m].addedNodes[n];
        if (node.nodeType === 1 && node.matches && node.matches('.md-collection[data-md-view]')) {
          initView();
          return;
        }
      }
    }
  });

  var sectionContainer = document.querySelector('.md-collection[data-md-view]');
  if (sectionContainer && sectionContainer.parentNode) {
    observer.observe(sectionContainer.parentNode, { childList: true, subtree: true });
  }
})();
