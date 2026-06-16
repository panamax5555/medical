(function () {
  'use strict';

  var STORAGE_KEY = 'md_wishlist_products';

  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  function isInWishlist(id) {
    return getWishlist().some(function (p) { return p.id === id; });
  }

  function updateBadge() {
    var badge = document.querySelector('.md-header-icons__wishlist-count');
    if (!badge) return;
    var count = getWishlist().length;
    if (count > 0) {
      badge.textContent = count;
      badge.classList.add('md-header-icons__wishlist-count--visible');
    } else {
      badge.textContent = '';
      badge.classList.remove('md-header-icons__wishlist-count--visible');
    }
  }

  function initProductButtons() {
    var buttons = document.querySelectorAll('.md-product-wishlist');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      var productId = btn.getAttribute('data-product-id');
      var productTitle = btn.getAttribute('data-product-title') || '';

      function updateButtonState() {
        var inWishlist = isInWishlist(productId);
        var span = btn.querySelector('span');
        if (inWishlist) {
          if (span) span.textContent = 'Von Merkliste entfernen';
          btn.classList.add('is-active');
          btn.setAttribute('aria-label', 'Von Merkliste entfernen: ' + productTitle);
        } else {
          if (span) span.textContent = 'Zur Merkliste hinzuf\u00fcgen';
          btn.classList.remove('is-active');
          btn.setAttribute('aria-label', 'Zur Merkliste hinzuf\u00fcgen: ' + productTitle);
        }
      }

      updateButtonState();

      btn.addEventListener('click', function () {
        if (isInWishlist(productId)) {
          var items = getWishlist().filter(function (p) { return p.id !== productId; });
          saveWishlist(items);
        } else {
          var items = getWishlist();
          items.push({
            id: btn.getAttribute('data-product-id') || '',
            handle: btn.getAttribute('data-product-handle') || '',
            title: btn.getAttribute('data-product-title') || '',
            url: btn.getAttribute('data-product-url') || '',
            image: btn.getAttribute('data-product-image') || '',
            price: btn.getAttribute('data-product-price') || ''
          });
          saveWishlist(items);
        }
        updateButtonState();
        updateBadge();
      });
    });
  }

  function initWishlistPage() {
    var grid = document.querySelector('.md-wishlist-page__grid');
    if (!grid) return;

    var empty = document.querySelector('.md-wishlist-page__empty');
    var hasProducts = document.querySelector('.md-wishlist-page__has-products');

    var items = getWishlist();

    if (items.length === 0) {
      if (empty) empty.style.display = 'block';
      if (hasProducts) hasProducts.style.display = 'none';
      return;
    }

    if (empty) empty.style.display = 'none';
    if (hasProducts) hasProducts.style.display = 'block';

    grid.innerHTML = '';

    items.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'md-wishlist-card';

      var link = document.createElement('a');
      link.className = 'md-wishlist-card__image-wrap';
      link.href = item.url || '#';
      link.setAttribute('aria-label', item.title || '');

      if (item.image) {
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title || '';
        img.loading = 'lazy';
        img.className = 'md-wishlist-card__image';
        link.appendChild(img);
      } else {
        var placeholder = document.createElement('div');
        placeholder.className = 'md-wishlist-card__placeholder';
        placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        link.appendChild(placeholder);
      }
      card.appendChild(link);

      var body = document.createElement('div');
      body.className = 'md-wishlist-card__body';

      var title = document.createElement('a');
      title.className = 'md-wishlist-card__title';
      title.href = item.url || '#';
      title.textContent = item.title || '';
      body.appendChild(title);

      if (item.price) {
        var price = document.createElement('span');
        price.className = 'md-wishlist-card__price';
        price.textContent = item.price;
        body.appendChild(price);
      }

      var actions = document.createElement('div');
      actions.className = 'md-wishlist-card__actions';

      var viewBtn = document.createElement('a');
      viewBtn.className = 'md-wishlist-card__view-btn';
      viewBtn.href = item.url || '#';
      viewBtn.textContent = 'Zum Produkt';
      actions.appendChild(viewBtn);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'md-wishlist-card__remove-btn';
      removeBtn.textContent = 'Entfernen';
      removeBtn.addEventListener('click', function () {
        var updated = getWishlist().filter(function (p) { return p.id !== item.id; });
        saveWishlist(updated);
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(function () {
          card.remove();
          updateBadge();
          if (getWishlist().length === 0) {
            if (empty) empty.style.display = 'block';
            if (hasProducts) hasProducts.style.display = 'none';
          }
        }, 200);
      });
      actions.appendChild(removeBtn);

      body.appendChild(actions);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateBadge();
      initProductButtons();
      initWishlistPage();
    });
  } else {
    updateBadge();
    initProductButtons();
    initWishlistPage();
  }
})();
