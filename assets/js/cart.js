/**
 * Atelier — Cart Quantity Buttons
 *
 * +/- buttons trigger WooCommerce's native "Update Cart" button click
 * with a 600ms debounce. Does NOT just dispatch change events.
 *
 * @package Atelier
 */
(function ($) {
	'use strict';

	if (typeof $ === 'undefined') return;

	var debounceTimer = null;
	var DEBOUNCE_MS = 600;

	function triggerCartUpdate() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(function () {
			var updateBtn = $('button[name="update_cart"]');
			if (updateBtn.length) {
				updateBtn.removeAttr('disabled').attr('aria-disabled', 'false');
				updateBtn.trigger('click');
			}
		}, DEBOUNCE_MS);
	}

	// Delegate to handle dynamically replaced cart HTML (WC AJAX).
	$(document.body).on('click', '.atelier-qty-plus', function (e) {
		e.preventDefault();
		var input = $(this).siblings('.qty');
		if (!input.length) input = $(this).closest('.quantity').find('.qty');
		var val = parseFloat(input.val()) || 0;
		var max = parseFloat(input.attr('max'));
		var step = parseFloat(input.attr('step')) || 1;

		if (max && val >= max) return;

		input.val(val + step);
		triggerCartUpdate();
	});

	$(document.body).on('click', '.atelier-qty-minus', function (e) {
		e.preventDefault();
		var input = $(this).siblings('.qty');
		if (!input.length) input = $(this).closest('.quantity').find('.qty');
		var val = parseFloat(input.val()) || 0;
		var min = parseFloat(input.attr('min'));
		var step = parseFloat(input.attr('step')) || 1;

		if (typeof min === 'undefined' || isNaN(min)) min = 1;
		if (val <= min) return;

		input.val(val - step);
		triggerCartUpdate();
	});

	// Also trigger update on manual qty input changes.
	$(document.body).on('change', '.woocommerce-cart-form .qty', function () {
		triggerCartUpdate();
	});

})(jQuery);
