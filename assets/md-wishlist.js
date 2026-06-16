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

  function getCurrentVariantId(btn) {
    var form = btn.closest('form');
    if (!form) return null;
    var input = form.querySelector('input[name="id"]');
    if (!input) return null;
    return input.value || null;
  }

  function getWishlistItemFromButton(btn) {
    var productId = btn.getAttribute('data-product-id') || '';
    var baseUrl = btn.getAttribute('data-product-url') || '';
    var variantId = getCurrentVariantId(btn);
    var id = variantId || productId;
    var url = baseUrl;
    if (variantId) {
      url = baseUrl.indexOf('?') > -1 ? baseUrl + '&variant=' + variantId : baseUrl + '?variant=' + variantId;
    }
    return {
      id: id,
      productId: productId,
      variantId: variantId || '',
      handle: btn.getAttribute('data-product-handle') || '',
      title: btn.getAttribute('data-product-title') || '',
      url: url,
      image: btn.getAttribute('data-product-image') || '',
      price: btn.getAttribute('data-product-price') || ''
    };
  }

  function updateProductButtonState(btn) {
    var currentId = getCurrentVariantId(btn) || btn.getAttribute('data-product-id') || '';
    var inWishlist = isInWishlist(currentId);
    var productTitle = btn.getAttribute('data-product-title') || '';

    if (btn.classList.contains('md-card-wishlist')) {
      if (inWishlist) {
        btn.classList.add('is-active');
        btn.setAttribute('aria-label', 'Vom Merkzettel entfernen: ' + productTitle);
      } else {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-label', 'Zum Merkzettel hinzuf\u00fcgen: ' + productTitle);
      }
    } else {
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
  }

  function handleButtonClick(btn, event) {
    event.preventDefault();
    event.stopPropagation();

    var item = getWishlistItemFromButton(btn);
    var existingIndex = -1;

    getWishlist().forEach(function (p, i) {
      if (p.id === item.id) existingIndex = i;
    });

    if (existingIndex > -1) {
      var items = getWishlist();
      items.splice(existingIndex, 1);
      saveWishlist(items);
    } else {
      var items = getWishlist();
      items.push(item);
      saveWishlist(items);
    }

    updateProductButtonState(btn);
    updateBadge();
  }

  function initProductButtons() {
    var allButtons = document.querySelectorAll('.md-product-wishlist, .md-card-wishlist');
    if (!allButtons.length) return;

    allButtons.forEach(function (btn) {
      updateProductButtonState(btn);

      btn.addEventListener('click', function (event) {
        handleButtonClick(btn, event);
      });
    });

    var productPageBtn = document.querySelector('.md-product-wishlist');
    if (productPageBtn) {
      var productForm = productPageBtn.closest('form');
      if (productForm) {
        var variantInput = productForm.querySelector('input[name="id"]');
        if (variantInput) {
          variantInput.addEventListener('change', function () {
            updateProductButtonState(productPageBtn);
          });
        }
      }
    }
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

  function initClearButton() {
    var clearBtn = document.querySelector('.md-wishlist-page__clear');
    if (!clearBtn) return;

    clearBtn.addEventListener('click', function () {
      saveWishlist([]);
      var grid = document.querySelector('.md-wishlist-page__grid');
      var empty = document.querySelector('.md-wishlist-page__empty');
      var hasProducts = document.querySelector('.md-wishlist-page__has-products');
      if (grid) grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
      if (hasProducts) hasProducts.style.display = 'none';
      updateBadge();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateBadge();
      initProductButtons();
      initWishlistPage();
      initClearButton();
    });
  } else {
    updateBadge();
    initProductButtons();
    initWishlistPage();
    initClearButton();
  }
})();
