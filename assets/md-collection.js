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
      openGroups[i].open = false;
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
      if (openGroups[i] !== target) openGroups[i].open = false;
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

  document.addEventListener('toggle', handleToggle);
  document.addEventListener('click', handleClickOutside);
  document.addEventListener('keydown', handleKeydown);
})();
