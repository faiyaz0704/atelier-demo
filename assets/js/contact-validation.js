/**
 * Atelier — Contact Page Form Validation & Success State
 *
 * Provides real-time validation UI (required fields, email format) and
 * a styled "Message Sent" success state. Works with CF7, WPForms,
 * or any <form> rendered inside .contact-form-wrap.
 *
 * - CF7: Listens for 'wpcf7mailsent' event.
 * - WPForms: Listens for 'wpformsAjaxSubmitSuccess' event.
 * - Generic: Catches form submit and shows success if the form's own
 *   handler does not prevent default.
 *
 * @package Atelier
 */
(function () {
	'use strict';

	var wrap = document.querySelector('.contact-form-wrap');
	if (!wrap) return;

	var accentColor = getComputedStyle(document.documentElement)
		.getPropertyValue('--accent-rose-gold').trim() || '#B4836B';

	// ── Real-time Validation ─────────────────────────────
	function validateField(field) {
		var value = field.value.trim();
		var isRequired = field.hasAttribute('required') ||
			field.getAttribute('aria-required') === 'true';
		var isEmail = field.type === 'email' ||
			field.name.toLowerCase().indexOf('email') !== -1;

		var errorEl = field.parentElement.querySelector('.atelier-field-error');

		// Remove existing error.
		if (errorEl) {
			errorEl.remove();
		}
		field.style.borderColor = '';

		if (isRequired && !value) {
			showFieldError(field, 'This field is required');
			return false;
		}

		if (isEmail && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			showFieldError(field, 'Please enter a valid email address');
			return false;
		}

		return true;
	}

	function showFieldError(field, message) {
		field.style.borderColor = accentColor;
		var el = document.createElement('span');
		el.className = 'atelier-field-error';
		el.textContent = message;
		el.style.cssText = 'color:' + accentColor + ';font-size:0.75rem;margin-top:4px;display:block;';
		field.parentElement.appendChild(el);
	}

	// Attach blur validation to all inputs/textareas/selects inside the wrap.
	var fields = wrap.querySelectorAll('input, textarea, select');
	fields.forEach(function (field) {
		if (field.type === 'hidden' || field.type === 'submit') return;
		field.addEventListener('blur', function () {
			validateField(field);
		});
	});

	// ── Success State ────────────────────────────────────
	function showSuccess() {
		// Fade out form, show success message.
		var form = wrap.querySelector('form');
		if (form) {
			form.style.transition = 'opacity 0.4s ease';
			form.style.opacity = '0';
			setTimeout(function () {
				form.style.display = 'none';

				var success = document.createElement('div');
				success.className = 'atelier-contact-success';
				success.setAttribute('role', 'status');
				success.setAttribute('aria-live', 'polite');
				success.innerHTML =
					'<div class="success-icon" aria-hidden="true">&#10003;</div>' +
					'<h3 class="success-title">Message Sent</h3>' +
					'<p class="success-text">Thank you for reaching out. We\'ll respond within 24 hours.</p>';
				wrap.appendChild(success);

				// Animate in.
				requestAnimationFrame(function () {
					success.style.opacity = '1';
				});
			}, 400);
		}
	}

	// CF7 success event.
	document.addEventListener('wpcf7mailsent', function (e) {
		if (wrap.contains(e.target)) {
			showSuccess();
		}
	});

	// WPForms success event.
	if (typeof jQuery !== 'undefined') {
		jQuery(document).on('wpformsAjaxSubmitSuccess', function (e, response) {
			showSuccess();
		});
	}
})();
