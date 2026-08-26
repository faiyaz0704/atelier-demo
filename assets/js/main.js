/**
 * Atelier — Main JavaScript
 *
 * Navigation, hero carousel, scroll reveal, drag carousels, accordions.
 * All vanilla JS, IIFE-wrapped, passive listeners, rAF-throttled.
 *
 * @package Atelier
 */

/* ==========================================================
   Navigation — Scroll State (passive, rAF-throttled)
   ========================================================== */
(function () {
	'use strict';

	var nav = document.getElementById('main-nav');
	if (!nav) return;

	var ticking = false;

	function onScroll() {
		if (!ticking) {
			requestAnimationFrame(function () {
				if (window.scrollY > 40) {
					nav.classList.add('scrolled');
				} else {
					nav.classList.remove('scrolled');
				}
				ticking = false;
			});
			ticking = true;
		}
	}

	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
})();

/* ==========================================================
   Hamburger — Mobile Menu Toggle
   ========================================================== */
(function () {
	'use strict';

	var btn = document.getElementById('hamburger-btn');
	var menu = document.getElementById('mobile-nav');
	if (!btn || !menu) return;

	var focusableEls = null;
	var firstFocusable = null;
	var lastFocusable = null;

	function openMenu() {
		btn.setAttribute('aria-expanded', 'true');
		menu.classList.add('open');
		menu.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';

		// Focus trap setup.
		focusableEls = menu.querySelectorAll('a, button');
		if (focusableEls.length) {
			firstFocusable = focusableEls[0];
			lastFocusable = focusableEls[focusableEls.length - 1];
			firstFocusable.focus();
		}
	}

	function closeMenu() {
		btn.setAttribute('aria-expanded', 'false');
		menu.classList.remove('open');
		menu.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
		btn.focus();
	}

	btn.addEventListener('click', function () {
		var isOpen = btn.getAttribute('aria-expanded') === 'true';
		if (isOpen) {
			closeMenu();
		} else {
			openMenu();
		}
	});

	// Close on Escape.
	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && menu.classList.contains('open')) {
			closeMenu();
		}

		// Focus trap.
		if (e.key === 'Tab' && menu.classList.contains('open') && focusableEls) {
			if (e.shiftKey) {
				if (document.activeElement === firstFocusable) {
					e.preventDefault();
					lastFocusable.focus();
				}
			} else {
				if (document.activeElement === lastFocusable) {
					e.preventDefault();
					firstFocusable.focus();
				}
			}
		}
	});

	// Close on link click.
	var mobileLinks = menu.querySelectorAll('.mobile-link');
	mobileLinks.forEach(function (link) {
		link.addEventListener('click', closeMenu);
	});
})();

/* ==========================================================
   Hero Carousel — Multi-transition slideshow
   ========================================================== */
(function () {
	'use strict';

	var slides = document.querySelectorAll('.hero-slide');
	var indicators = document.querySelectorAll('.hero-indicator');
	if (slides.length < 2) return;

	var current = 0;
	var total = slides.length;
	var interval = 6000;
	var timer = null;
	var transitioning = false;
	var transitions = ['fade', 'curtain', 'zoomOut'];
	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	function getTransition(index) {
		return transitions[index % transitions.length];
	}

	function goTo(next) {
		if (transitioning || next === current) return;
		transitioning = true;

		var type = getTransition(next);
		var currentSlide = slides[current];
		var nextSlide = slides[next];

		// Clear all states.
		slides.forEach(function (s) {
			s.className = 'hero-slide';
			s.setAttribute('aria-hidden', 'true');
		});

		if (reducedMotion.matches || type === 'fade') {
			currentSlide.classList.add('fade-out');
			nextSlide.classList.add('active');
		} else if (type === 'curtain') {
			currentSlide.classList.add('under');
			nextSlide.classList.add('curtain-prepare');
			requestAnimationFrame(function () {
				requestAnimationFrame(function () {
					nextSlide.classList.add('curtain-reveal');
				});
			});
		} else if (type === 'zoomOut') {
			nextSlide.classList.add('active');
			currentSlide.classList.add('zoom-out-prep');
			requestAnimationFrame(function () {
				currentSlide.classList.add('zoom-out-active');
			});
		}

		nextSlide.setAttribute('aria-hidden', 'false');

		// Update indicators.
		indicators.forEach(function (ind, i) {
			ind.classList.toggle('active', i === next);
			ind.setAttribute('aria-selected', i === next ? 'true' : 'false');
		});

		current = next;

		setTimeout(function () {
			transitioning = false;
		}, 2000);
	}

	function autoPlay() {
		timer = setInterval(function () {
			goTo((current + 1) % total);
		}, interval);
	}

	function resetAutoPlay() {
		clearInterval(timer);
		autoPlay();
	}

	// Indicator clicks.
	indicators.forEach(function (ind, i) {
		ind.addEventListener('click', function () {
			goTo(i);
			resetAutoPlay();
		});
	});

	// Pause on hidden tab.
	document.addEventListener('visibilitychange', function () {
		if (document.hidden) {
			clearInterval(timer);
		} else {
			autoPlay();
		}
	});

	autoPlay();
})();

/* ==========================================================
   Scroll Reveal — IntersectionObserver
   ========================================================== */
(function () {
	'use strict';

	var revealElements = document.querySelectorAll('.reveal');
	if (!revealElements.length) return;

	if (!('IntersectionObserver' in window)) {
		revealElements.forEach(function (el) { el.classList.add('revealed'); });
		return;
	}

	var observer = new IntersectionObserver(function (entries, obs) {
		entries.forEach(function (entry) {
			if (entry.isIntersecting) {
				entry.target.classList.add('revealed');
				obs.unobserve(entry.target);
			}
		});
	}, {
		root: null,
		threshold: 0.1,
		rootMargin: '0px 0px -80px 0px'
	});

	revealElements.forEach(function (el) {
		observer.observe(el);
	});
})();

/* ==========================================================
   Draggable Carousel — Shared initializer
   ========================================================== */
(function () {
	'use strict';

	function initCarousel(containerId, prevId, nextId) {
		var container = document.getElementById(containerId);
		var btnLeft = document.getElementById(prevId);
		var btnRight = document.getElementById(nextId);
		if (!container) return;

		var isDown = false;
		var startX, scrollLeft, velocity = 0, lastX, lastTime;
		var dragDistance = 0;
		var animationId = null;
		var isHovered = false;
		var isInteracting = false;
		var resumeTimeout = null;
		var autoScrollSpeed = 0.8;
		var autoScrollId = null;
		var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

		container.addEventListener('mouseenter', function () { isHovered = true; });
		container.addEventListener('mouseleave', function () { isHovered = false; });

		if (btnLeft) {
			btnLeft.addEventListener('click', function () {
				triggerInteractionDelay();
				container.scrollBy({ left: -324, behavior: 'smooth' });
			});
		}
		if (btnRight) {
			btnRight.addEventListener('click', function () {
				triggerInteractionDelay();
				container.scrollBy({ left: 324, behavior: 'smooth' });
			});
		}

		function triggerInteractionDelay() {
			isInteracting = true;
			if (resumeTimeout) clearTimeout(resumeTimeout);
			resumeTimeout = setTimeout(function () { isInteracting = false; }, 3000);
		}

		function dragStart(e) {
			isDown = true;
			container.classList.add('active');
			dragDistance = 0;
			triggerInteractionDelay();
			if (animationId) cancelAnimationFrame(animationId);
			var pageX = e.type.startsWith('touch') ? e.touches[0].pageX : e.pageX;
			startX = pageX - container.offsetLeft;
			scrollLeft = container.scrollLeft;
			lastX = pageX;
			lastTime = performance.now();
			velocity = 0;
		}

		function dragEnd() {
			if (!isDown) return;
			isDown = false;
			container.classList.remove('active');
			var decelerate = function () {
				if (Math.abs(velocity) < 0.2) { isInteracting = false; return; }
				container.scrollLeft -= velocity;
				velocity *= 0.92;
				animationId = requestAnimationFrame(decelerate);
			};
			animationId = requestAnimationFrame(decelerate);
		}

		function dragMove(e) {
			if (!isDown) return;
			triggerInteractionDelay();
			var pageX = e.type.startsWith('touch') ? e.touches[0].pageX : e.pageX;
			var x = pageX - container.offsetLeft;
			var walk = (x - startX) * 1.5;
			container.scrollLeft = scrollLeft - walk;
			dragDistance = Math.abs(pageX - (startX + container.offsetLeft));
			var now = performance.now();
			var dt = now - lastTime;
			if (dt > 0) { velocity = ((pageX - lastX) / dt) * 12; }
			lastX = pageX;
			lastTime = now;
		}

		container.addEventListener('mousedown', dragStart);
		container.addEventListener('mouseleave', dragEnd);
		container.addEventListener('mouseup', dragEnd);
		container.addEventListener('mousemove', dragMove);
		container.addEventListener('touchstart', dragStart, { passive: true });
		container.addEventListener('touchend', dragEnd, { passive: true });
		container.addEventListener('touchmove', dragMove, { passive: true });

		container.addEventListener('click', function (e) {
			if (dragDistance > 8) { e.preventDefault(); e.stopPropagation(); }
		});

		function performAutoScroll() {
			if (!isDown && !isHovered && !isInteracting && !reducedMotion.matches && !document.hidden) {
				container.scrollLeft += autoScrollSpeed;
				if (container.scrollLeft >= (container.scrollWidth - container.clientWidth - 1)) {
					container.scrollLeft = 0;
				}
			}
			autoScrollId = requestAnimationFrame(performAutoScroll);
		}

		document.addEventListener('visibilitychange', function () {
			if (document.hidden && autoScrollId) {
				cancelAnimationFrame(autoScrollId);
				autoScrollId = null;
			} else if (!document.hidden && !autoScrollId) {
				autoScrollId = requestAnimationFrame(performAutoScroll);
			}
		});

		autoScrollId = requestAnimationFrame(performAutoScroll);
	}

	// Init all carousels present on page.
	initCarousel('carousel-container', 'carousel-prev', 'carousel-next');
	initCarousel('also-like-carousel', 'also-like-prev', 'also-like-next');
})();

/* ==========================================================
   Accordion — Single-open, smooth height transition
   ========================================================== */
(function () {
	'use strict';

	var triggers = document.querySelectorAll('.accordion-trigger, .faq-trigger');
	if (!triggers.length) return;

	function closeAll(except, scope) {
		var scopeTriggers = scope
			? scope.querySelectorAll('.accordion-trigger, .faq-trigger')
			: triggers;

		scopeTriggers.forEach(function (t) {
			if (t === except) return;
			var panel = document.getElementById(t.getAttribute('aria-controls'));
			t.setAttribute('aria-expanded', 'false');
			if (panel) {
				panel.style.maxHeight = '0';
				panel.setAttribute('aria-hidden', 'true');
			}
		});
	}

	triggers.forEach(function (trigger) {
		trigger.addEventListener('click', function () {
			var isOpen = trigger.getAttribute('aria-expanded') === 'true';
			var panelId = trigger.getAttribute('aria-controls');
			var panel = document.getElementById(panelId);
			var scope = trigger.closest('.accordion, .faq-list');

			closeAll(isOpen ? null : trigger, scope);

			if (!isOpen) {
				trigger.setAttribute('aria-expanded', 'true');
				if (panel) {
					panel.style.maxHeight = panel.scrollHeight + 'px';
					panel.setAttribute('aria-hidden', 'false');
				}
			} else {
				trigger.setAttribute('aria-expanded', 'false');
				if (panel) {
					panel.style.maxHeight = '0';
					panel.setAttribute('aria-hidden', 'true');
				}
			}
		});
	});
})();

/* ==========================================================
   Product Gallery — Thumbnail switching
   ========================================================== */
(function () {
	'use strict';

	var thumbs = document.querySelectorAll('.gallery-thumb');
	var mainContainer = document.getElementById('gallery-main');
	if (!thumbs.length || !mainContainer) return;

	var mainImages = mainContainer.querySelectorAll('.gallery-main-img');

	thumbs.forEach(function (thumb) {
		thumb.addEventListener('click', function () {
			var idx = parseInt(thumb.getAttribute('data-index'), 10);

			// Update thumbs.
			thumbs.forEach(function (t) {
				t.classList.remove('active-thumb');
				t.setAttribute('aria-pressed', 'false');
			});
			thumb.classList.add('active-thumb');
			thumb.setAttribute('aria-pressed', 'true');

			// Update main images.
			mainImages.forEach(function (img) {
				var imgIdx = parseInt(img.getAttribute('data-index'), 10);
				img.classList.remove('active-img', 'entering', 'exiting');

				if (imgIdx === idx) {
					img.classList.add('entering');
					img.style.opacity = '';
					img.style.zIndex = '';
					setTimeout(function () {
						img.classList.remove('entering');
						img.classList.add('active-img');
					}, 550);
				} else {
					img.style.opacity = '0';
					img.style.zIndex = '1';
				}
			});
		});
	});
})();

/* ==========================================================
   Search Overlay Modal Controller
   ========================================================== */
(function () {
	'use strict';

	var searchTriggers = document.querySelectorAll('.search-trigger, [href="#search"]');
	var searchModal = document.getElementById('search-modal');
	var searchClose = document.getElementById('search-modal-close');
	var searchInput = document.getElementById('header-search-input');

	if (!searchModal) return;

	function openSearch(e) {
		if (e) e.preventDefault();
		searchModal.classList.add('active');
		searchModal.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
		if (searchInput) {
			setTimeout(function () {
				searchInput.focus();
			}, 100);
		}
	}

	function closeSearch() {
		searchModal.classList.remove('active');
		searchModal.setAttribute('aria-hidden', 'true');
		document.body.style.overflow = '';
	}

	searchTriggers.forEach(function (btn) {
		btn.addEventListener('click', openSearch);
	});

	if (searchClose) {
		searchClose.addEventListener('click', closeSearch);
	}

	searchModal.addEventListener('click', function (e) {
		if (e.target === searchModal) {
			closeSearch();
		}
	});

	document.addEventListener('keydown', function (e) {
		if (e.key === 'Escape' && searchModal.classList.contains('active')) {
			closeSearch();
		}
	});
})();
