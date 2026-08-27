/*
Author       : Dreamstechnologies
Template Name: DreamsEMR - Bootstrap Admin Template
*/
(function () {
    "use strict";

	function toggleMoreMenu(menuSelector, buttonSelector) {
		if (document.querySelectorAll(menuSelector).length > 0) {
			document.querySelectorAll(menuSelector).forEach(el => el.style.display = 'none');
			document.querySelectorAll(buttonSelector).forEach(btn => {
				btn.addEventListener('click', function () {
					this.textContent = this.textContent === "Less" ? "Show More" : "Less";
					document.querySelectorAll(menuSelector).forEach(el => {
						const isHidden = window.getComputedStyle(el).display === 'none';
						el.style.display = isHidden ? '' : 'none';
					});
				});
			});
		}
	}

	// View all Show hide One
	toggleMoreMenu('.more-menu', '.viewall-button');
	toggleMoreMenu('.more-menu-2', '.viewall-button-2');
	toggleMoreMenu('.more-menu-3', '.viewall-button-3');

	// Compose Mail Popup
	const composeMailBtn = document.getElementById('compose_mail');
	if (composeMailBtn) {
		composeMailBtn.addEventListener('click', function () {
			const backdrop = document.createElement('div');
			backdrop.className = 'modal-backdrop fade show';
			document.body.appendChild(backdrop);
			const composeView = document.getElementById('compose-view');
			if (composeView) composeView.classList.add('show');
		});
	}

	const composeCloseBtn = document.getElementById('compose-close');
	if (composeCloseBtn) {
		composeCloseBtn.addEventListener('click', function () {
			document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
			const composeView = document.getElementById('compose-view');
			if (composeView) composeView.classList.remove('show');
		});
	}

})();
