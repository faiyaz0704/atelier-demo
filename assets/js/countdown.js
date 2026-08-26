/**
 * Atelier — Countdown Timer (Gift Box Lid Lift)
 *
 * Reads target date from wp_localize_script (atelierCountdown.targetDate).
 * Falls back to 7 days from now if not set.
 *
 * @package Atelier
 */
(function () {
	'use strict';

	var timerSectionEl = document.getElementById('timer-section');
	if (!timerSectionEl) return;

	var COUNTDOWN_DURATION = 7 * 24 * 60 * 60 * 1000;
	var targetDate;

	// Read from localized data or default to 7 days out.
	if (typeof atelierCountdown !== 'undefined' && atelierCountdown.targetDate) {
		targetDate = new Date(atelierCountdown.targetDate).getTime();
	} else {
		targetDate = new Date().getTime() + COUNTDOWN_DURATION;
	}

	var giftBoxLid = document.getElementById('gift-box-lid');
	var giftBoxGlow = document.getElementById('gift-box-glow');
	var giftBoxShadow = document.getElementById('gift-box-shadow');
	var countdownInterval = null;
	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

	// Get accent color RGB from CSS variable.
	var accentRGB = getComputedStyle(document.documentElement)
		.getPropertyValue('--accent-rose-gold-rgb').trim() || '180, 131, 107';

	function updateCountdown() {
		var now = new Date().getTime();
		var difference = targetDate - now;

		if (difference <= 0) {
			timerSectionEl.classList.add('completed');
			if (countdownInterval) clearInterval(countdownInterval);
			return;
		}

		// Calculate progress for lid tilt animation.
		var startTime = targetDate - COUNTDOWN_DURATION;
		var elapsed = now - startTime;
		var progress = Math.max(0, Math.min(elapsed / COUNTDOWN_DURATION, 1));

		var lidTilt = progress * 12;
		var glowIntensity = 0.03 + (progress * 0.09);
		var shadowDepth = 0.3 + (progress * 0.4);

		if (!reducedMotion.matches && giftBoxLid && giftBoxGlow && giftBoxShadow) {
			giftBoxLid.style.setProperty('--lid-tilt', lidTilt);
			giftBoxGlow.style.setProperty('--glow-intensity', glowIntensity);
			giftBoxGlow.style.background =
				'radial-gradient(ellipse at center, rgba(' + accentRGB + ',' + glowIntensity + ') 0%, transparent 65%)';
			giftBoxLid.style.transform = 'rotateX(' + lidTilt + 'deg)';
			giftBoxShadow.style.opacity = shadowDepth;
		}

		// Calculate time units.
		var days = Math.floor(difference / (1000 * 60 * 60 * 24));
		var hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		var minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
		var seconds = Math.floor((difference % (1000 * 60)) / 1000);

		setDigitHTML('days-val', days.toString().padStart(2, '0'));
		setDigitHTML('hours-val', hours.toString().padStart(2, '0'));
		setDigitHTML('minutes-val', minutes.toString().padStart(2, '0'));
		setDigitHTML('seconds-val', seconds.toString().padStart(2, '0'));
	}

	function setDigitHTML(elementId, valueString) {
		var digitContainer = document.getElementById(elementId);
		if (!digitContainer) return;
		var digits = valueString.split('');

		if (digitContainer.children.length !== digits.length) {
			digitContainer.innerHTML = '';
			digits.forEach(function (dig) {
				var span = document.createElement('span');
				span.className = 'timer-digit';
				span.textContent = dig;
				digitContainer.appendChild(span);
			});
			return;
		}

		for (var i = 0; i < digits.length; i++) {
			var span = digitContainer.children[i];
			if (span.textContent !== digits[i]) {
				if (reducedMotion.matches) {
					span.textContent = digits[i];
					continue;
				}
				span.classList.add('changing');
				(function (s, d) {
					setTimeout(function () {
						s.textContent = d;
						s.classList.remove('changing');
					}, 300);
				})(span, digits[i]);
			}
		}
	}

	countdownInterval = setInterval(updateCountdown, 1000);
	updateCountdown();
})();
