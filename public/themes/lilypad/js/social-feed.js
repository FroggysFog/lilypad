/*
Author       : Dreamstechnologies
Template Name: DreamsEMR - Bootstrap Admin Template
*/
(function () {
    "use strict";

	// Stick Sidebar

	if (window.innerWidth > 767) {
		document.querySelectorAll('.theiaStickySidebar').forEach(el => {
			new TheiaStickySidebar(el, {
				// Settings
				additionalMarginTop: 30
			});
		});
	}

})();
