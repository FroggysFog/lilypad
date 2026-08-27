/*
Author       : Dreamstechnologies
Template Name: DreamsEMR - Bootstrap Admin Template
*/

(function () {
    "use strict";

	function on(selector, event, handler) {
		document.querySelectorAll(selector).forEach(el => el.addEventListener(event, handler));
	}

	//Top Online Contacts
	if (document.querySelectorAll('.chat-close').length > 0) {
		// layout content remove
		on('.chat-close', 'click', function () {
			document.querySelectorAll('.chat').forEach(el => el.classList.remove('show'));
		});
	}

	on('.close_profile', 'click', function () {
		document.querySelectorAll('.right-side-contact').forEach(el => {
			el.classList.add('hide-right-sidebar');
			el.classList.remove('show-right-sidebar');
		});
		if (window.innerWidth > 991 && window.innerWidth < 1201) {
			document.querySelectorAll('.chat').forEach(el => el.style.marginLeft = '0');
		}
		if (window.innerWidth < 992) {
			document.querySelectorAll('.chat').forEach(el => el.classList.remove('hide-chatbar'));
		}
	});

	if (document.querySelectorAll('.emoj-action').length > 0) {
		on('.emoj-action', 'click', function () {
			document.querySelectorAll('.emoj-group-list').forEach(el => {
				el.style.display = (window.getComputedStyle(el).display === 'none') ? '' : 'none';
			});
		});
	}

	if (document.querySelectorAll('.emoj-action-foot').length > 0) {
		on('.emoj-action-foot', 'click', function () {
			document.querySelectorAll('.emoj-group-list-foot').forEach(el => {
				el.style.display = (window.getComputedStyle(el).display === 'none') ? '' : 'none';
			});
		});
	}

	//Chat Resize

	on('.close_profile', 'click', function () {
		document.querySelectorAll('.right-user-side').forEach(el => el.classList.remove('open-message'));
		document.querySelectorAll('.chat-center-blk .card-comman').forEach(el => el.classList.add('chat-center-space'));
	});
	on('.profile-open', 'click', function () {
		document.querySelectorAll('.right-user-side').forEach(el => el.classList.remove('add-setting'));
		document.querySelectorAll('.chat-center-blk .card-comman').forEach(el => el.classList.remove('chat-center-space'));
	});

	//Call Resize
	on('.close_profile', 'click', function () {
		document.querySelectorAll('.right-user-side').forEach(el => el.classList.remove('open-message'));
		document.querySelectorAll('.video-screen-inner').forEach(el => el.classList.remove('video-space'));
		document.querySelectorAll('.right-side-party').forEach(el => el.classList.remove('open-message'));
		document.querySelectorAll('.meeting-list').forEach(el => el.classList.remove('add-meeting'));
		const chatRoom = document.getElementById('chat-room');
		if (chatRoom) chatRoom.classList.remove('open-chats');
		document.querySelectorAll('.main-img').forEach(el => el.classList.remove('main-img-hide'));
		document.querySelectorAll('.join-video').forEach(el => el.classList.remove('main-img-hide'));
		document.querySelectorAll('.call-user-side').forEach(el => el.classList.add('add-setting'));
	});

	const showMessageBtn = document.getElementById('show-message');
	if (showMessageBtn) {
		showMessageBtn.addEventListener('click', function () {
			const chatRoom = document.getElementById('chat-room');
			if (chatRoom) chatRoom.classList.add('open-chats');
			document.querySelectorAll('.right-side-party').forEach(el => el.classList.remove('open-message'));
			document.querySelectorAll('.main-img').forEach(el => el.classList.add('main-img-hide'));
			document.querySelectorAll('.join-video').forEach(el => el.classList.add('main-img-hide'));
		});
	}

	//Chat Search Visible
	on('.chat-search-btn', 'click', function () {
		document.querySelectorAll('.chat-search').forEach(el => el.classList.add('visible-chat'));
	});
	on('.close-btn-chat', 'click', function () {
		document.querySelectorAll('.chat-search').forEach(el => el.classList.remove('visible-chat'));
	});
	on('.chat-search .form-control', 'keyup', function () {
		const value = this.value.toLowerCase();
		document.querySelectorAll('.chat .chat-body .messages .chats').forEach(chat => {
			chat.style.display = chat.textContent.toLowerCase().indexOf(value) > -1 ? '' : 'none';
		});
	});
	on('.guest-off', 'click', function () {
		this.classList.toggle('activate');
		document.querySelectorAll('.chat-active-users').forEach(el => el.classList.toggle('show-active-users'));
	});

})();
