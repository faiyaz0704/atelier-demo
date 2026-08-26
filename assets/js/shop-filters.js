/**
 * Atelier — Shop Filters & Sorting
 *
 * Client-side filtering by data-category and sorting by data-price.
 * Works with WooCommerce's ul.products output.
 *
 * @package Atelier
 */
(function () {
	'use strict';

	var filterBtns = document.querySelectorAll('.filter-btn');
	var sortSelect = document.getElementById('sort-select');
	var resultCount = document.getElementById('result-count');
	var grid = document.querySelector('.shop-grid, ul.products');

	if (!grid) return;

	var cards = Array.from(grid.querySelectorAll('.product-card, li.product'));
	var currentFilter = 'all';

	// ── Filtering ────────────────────────────────────────
	function filterCards(filter) {
		currentFilter = filter;
		var visibleCount = 0;

		cards.forEach(function (card) {
			var cats = (card.getAttribute('data-category') || '').toLowerCase();
			var show = (filter === 'all') || cats.indexOf(filter.toLowerCase()) !== -1;

			if (show) {
				card.style.display = '';
				card.removeAttribute('data-hidden');
				visibleCount++;
			} else {
				card.style.display = 'none';
				card.setAttribute('data-hidden', 'true');
			}
		});

		if (resultCount) {
			resultCount.textContent = visibleCount + (visibleCount === 1 ? ' Piece' : ' Pieces');
		}
	}

	filterBtns.forEach(function (btn) {
		btn.addEventListener('click', function () {
			filterBtns.forEach(function (b) {
				b.classList.remove('active');
				b.setAttribute('aria-selected', 'false');
			});
			btn.classList.add('active');
			btn.setAttribute('aria-selected', 'true');

			filterCards(btn.getAttribute('data-filter'));

			// Re-apply current sort.
			if (sortSelect) {
				sortCards(sortSelect.value);
			}
		});
	});

	// Check URL param on load (e.g. ?cat=outerwear)
	try {
		var urlParams = new URLSearchParams(window.location.search);
		var catParam = urlParams.get('cat') || urlParams.get('category');
		if (catParam) {
			filterBtns.forEach(function (b) {
				if (b.getAttribute('data-filter').toLowerCase() === catParam.toLowerCase()) {
					filterBtns.forEach(function (el) {
						el.classList.remove('active');
						el.setAttribute('aria-selected', 'false');
					});
					b.classList.add('active');
					b.setAttribute('aria-selected', 'true');
					filterCards(catParam);
				}
			});
		}
	} catch (e) {}

	// ── Sorting ──────────────────────────────────────────
	function sortCards(sortBy) {
		var sorted = cards.slice();

		switch (sortBy) {
			case 'price-low':
				sorted.sort(function (a, b) {
					return parseFloat(a.getAttribute('data-price') || 0) -
					       parseFloat(b.getAttribute('data-price') || 0);
				});
				break;
			case 'price-high':
				sorted.sort(function (a, b) {
					return parseFloat(b.getAttribute('data-price') || 0) -
					       parseFloat(a.getAttribute('data-price') || 0);
				});
				break;
			case 'newest':
				sorted.sort(function (a, b) {
					return parseInt(a.getAttribute('data-order') || 0) -
					       parseInt(b.getAttribute('data-order') || 0);
				});
				break;
			default:
				// Default order — restore original DOM order.
				sorted.sort(function (a, b) {
					return parseInt(a.getAttribute('data-order') || 0) -
					       parseInt(b.getAttribute('data-order') || 0);
				});
				break;
		}

		// Re-append sorted elements.
		sorted.forEach(function (card) {
			grid.appendChild(card);
		});
	}

	if (sortSelect) {
		sortSelect.addEventListener('change', function () {
			sortCards(this.value);
		});
	}

	// Handle mobile sort select.
	var sortSelectMobile = document.getElementById('sort-select-mobile');
	if (sortSelectMobile) {
		sortSelectMobile.addEventListener('change', function () {
			if (sortSelect) {
				sortSelect.value = this.value;
			}
			sortCards(this.value);
		});
	}

	// ── Sticky filter bar shadow on scroll ───────────────
	var filterBar = document.getElementById('filter-bar');
	if (filterBar) {
		var ticking = false;
		window.addEventListener('scroll', function () {
			if (!ticking) {
				requestAnimationFrame(function () {
					var rect = filterBar.getBoundingClientRect();
					var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 80;
					if (rect.top <= headerH + 2) {
						filterBar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
					} else {
						filterBar.style.boxShadow = 'none';
					}
					ticking = false;
				});
				ticking = true;
			}
		}, { passive: true });
	}
})();
