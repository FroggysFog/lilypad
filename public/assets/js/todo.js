/*
Author       : Dreamstechnologies
Template Name: Dleohr - Bootstrap Admin Template
*/

(function () {
    "use strict";

	// Todo Strike Content
	document.querySelectorAll('.todo-item input').forEach(input => {
		input.addEventListener('click', function () {
			const grandparent = this.parentElement.parentElement;
			if (grandparent) grandparent.classList.toggle('todo-strike');
		});
	});

	document.querySelectorAll('.todo-inbox-check input').forEach(input => {
		input.addEventListener('click', function () {
			const grandparent = this.parentElement.parentElement;
			if (grandparent) grandparent.classList.toggle('todo-strike-content');
		});
	});

	document.querySelectorAll('.todo-list input').forEach(input => {
		input.addEventListener('click', function () {
			const grandparent = this.parentElement.parentElement;
			if (grandparent) grandparent.classList.toggle('todo-strike-content');
		});
	});

})();
