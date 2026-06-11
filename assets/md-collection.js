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

  function handleMediaNavClick(e) {
    var button = e.target.closest('[data-md-card-media-prev], [data-md-card-media-next]');
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    var media = button.closest('[data-md-card-media]');
    if (!media) return;

    var track = media.querySelector('[data-md-card-media-track]');
    if (!track) return;

    var direction = button.hasAttribute('data-md-card-media-next') ? 1 : -1;
    var amount = track.clientWidth;
    var scrollMax = track.scrollWidth - track.clientWidth;

    if (direction > 0 && track.scrollLeft + amount > scrollMax) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    if (direction < 0 && track.scrollLeft - amount < 0) {
      track.scrollTo({ left: scrollMax, behavior: 'smooth' });
      return;
    }

    track.scrollBy({
      left: direction * amount,
      behavior: 'smooth'
    });
  }

  document.addEventListener('click', handleMediaNavClick);
})();
