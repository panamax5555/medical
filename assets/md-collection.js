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
    e.stopPropagation();
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

  document.addEventListener('shopify:section:load', function (e) {
    if (e.target && e.target.querySelector && e.target.querySelector('.md-collection[data-md-view]')) {
      initView();
    }
  });

  /* ==========================================================================
     Quantity Buttons
     ========================================================================== */
  function handleQuantityClick(e) {
    var button = e.target.closest('[data-md-quantity-minus], [data-md-quantity-plus]');
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    var form = button.closest('form');
    if (!form) return;

    var input = form.querySelector('.md-card-product__quantity-input');
    if (!input) return;

    var current = parseInt(input.value, 10);
    if (isNaN(current)) current = 1;

    var min = parseInt(input.getAttribute('min'), 10);
    if (isNaN(min)) min = 1;

    var delta = button.hasAttribute('data-md-quantity-plus') ? 1 : -1;
    var next = current + delta;
    if (next < min) next = min;

    input.value = next;
  }

  /* ==========================================================================
     Variant Dropdown
     ========================================================================== */
  function closeAllVariantMenus() {
    var menus = document.querySelectorAll('.md-card-product__variant-menu.is-open');
    for (var i = 0; i < menus.length; i++) {
      menus[i].classList.remove('is-open');
      var dd = menus[i].closest('[data-md-variant-dropdown]');
      if (dd) {
        var trigger = dd.querySelector('[data-md-variant-trigger]');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    }
  }

  function handleVariantTriggerClick(e) {
    var trigger = e.target.closest('[data-md-variant-trigger]');
    if (!trigger) return;

    e.preventDefault();
    e.stopPropagation();

    var dropdown = trigger.closest('[data-md-variant-dropdown]');
    if (!dropdown) return;

    var menu = dropdown.querySelector('[data-md-variant-menu]');
    if (!menu) return;

    if (menu.classList.contains('is-open')) {
      menu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      closeAllVariantMenus();
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  }

  function handleVariantOptionClick(e) {
    var option = e.target.closest('[data-md-variant-option]');
    if (!option) return;

    e.preventDefault();
    e.stopPropagation();

    if (option.disabled) return;

    var dropdown = option.closest('[data-md-variant-dropdown]');
    if (!dropdown) return;

    var card = option.closest('.md-card-product');
    if (!card) return;

    // Update hidden input in the purchase form
    var purchaseForm = card.querySelector('.md-card-product__purchase');
    if (purchaseForm) {
      var hiddenInput = purchaseForm.querySelector('input[name="id"]');
      if (hiddenInput) {
        hiddenInput.value = option.getAttribute('data-variant-id');
      }
    }

    // Update trigger UI
    var trigger = dropdown.querySelector('[data-md-variant-trigger]');
    var triggerLabel = dropdown.querySelector('[data-md-variant-trigger-label]');
    var triggerImage = dropdown.querySelector('[data-md-variant-trigger-image]');
    var triggerDot = dropdown.querySelector('[data-md-variant-trigger-dot]');

    if (triggerLabel) {
      triggerLabel.textContent = option.getAttribute('data-variant-title') || '';
    }

    if (triggerImage) {
      var imgSrc = option.getAttribute('data-variant-image');
      if (imgSrc) {
        triggerImage.src = imgSrc;
        triggerImage.style.display = '';
      } else {
        triggerImage.style.display = 'none';
      }
    }

    var isAvailable = option.getAttribute('data-variant-available') === 'true';
    if (triggerDot) {
      if (isAvailable) {
        triggerDot.classList.add('is-available');
      } else {
        triggerDot.classList.remove('is-available');
      }
    }

    // Update prices
    var priceEl = card.querySelector('[data-md-purchase-price]');
    if (priceEl) {
      var price = option.getAttribute('data-variant-price');
      var comparePrice = option.getAttribute('data-variant-compare-price');
      var current = priceEl.querySelector('.md-card-product__purchase-price-current');
      var old = priceEl.querySelector('.md-card-product__purchase-price-old');

      if (current && price) current.textContent = price;

      if (old) {
        if (comparePrice) {
          old.textContent = comparePrice;
          old.style.display = '';
        } else {
          old.style.display = 'none';
        }
      }
    }

    // Update unit price in purchase meta
    var purchaseMeta = card.querySelector('.md-card-product__purchase-meta');
    if (purchaseMeta) {
      var unitPriceEl = purchaseMeta.querySelector('.md-card-product__purchase-unit-price');
      if (unitPriceEl) {
        var unitPrice = option.getAttribute('data-variant-unit-price');
        var refValue = option.getAttribute('data-variant-unit-ref-value');
        var refUnit = option.getAttribute('data-variant-unit-ref-unit');
        if (unitPrice && refUnit) {
          unitPriceEl.textContent = unitPrice + ' / ' + (refValue || '1') + ' ' + refUnit;
          unitPriceEl.style.display = '';
        } else if (unitPrice) {
          unitPriceEl.textContent = unitPrice;
          unitPriceEl.style.display = '';
        } else {
          unitPriceEl.style.display = 'none';
        }
      }
    }

    // Update inventory
    var inventoryEl = card.querySelector('[data-md-purchase-inventory]');
    if (inventoryEl) {
      inventoryEl.textContent = isAvailable ? 'Auf Lager' : (document.querySelector('[data-md-sold-out-text]')?.textContent || 'Ausverkauft');
      inventoryEl.style.color = isAvailable ? 'var(--md-collection-success)' : 'rgba(var(--color-foreground), 0.45)';
    }

    // Update submit button
    var submitBtn = card.querySelector('[data-md-purchase-submit]');
    if (submitBtn) {
      if (isAvailable) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'In den Warenkorb';
      } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Ausverkauft';
      }
    }

    // Mark active option
    var options = dropdown.querySelectorAll('[data-md-variant-option]');
    for (var o = 0; o < options.length; o++) {
      if (options[o] === option) {
        options[o].classList.add('is-active');
        options[o].setAttribute('aria-selected', 'true');
      } else {
        options[o].classList.remove('is-active');
        options[o].setAttribute('aria-selected', 'false');
      }
    }

    // Close menu
    var menu = dropdown.querySelector('[data-md-variant-menu]');
    if (menu) menu.classList.remove('is-open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function handleClickOutsideVariant(e) {
    if (!e.target.closest('[data-md-variant-dropdown]')) {
      closeAllVariantMenus();
    }
  }

  function handleEscapeVariant(e) {
    if (e.key === 'Escape') {
      closeAllVariantMenus();
    }
  }

  document.addEventListener('click', function (e) {
    handleQuantityClick(e);
    handleVariantTriggerClick(e);
    handleVariantOptionClick(e);
    handleClickOutsideVariant(e);
  });

  document.addEventListener('keydown', function (e) {
    handleEscapeVariant(e);
  });
})();
