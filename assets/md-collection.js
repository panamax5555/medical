(function () {
  'use strict';

  document.addEventListener('toggle', function (e) {
    var target = e.target;
    if (!target.open) return;
    if (!target.classList.contains('md-collection-filterbar__group')) return;

    var bar = target.closest('.md-collection-filterbar');
    if (!bar) return;

    var groups = bar.querySelectorAll('.md-collection-filterbar__group[open]');
    for (var i = 0; i < groups.length; i++) {
      if (groups[i] !== target) groups[i].open = false;
    }
  });
})();
