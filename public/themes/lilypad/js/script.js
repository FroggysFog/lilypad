/*
Author       : Dreamstechnologies
Template Name: CRMS - Bootstrap Admin Template
*/

(function () {
    "use strict";

	// Variables declarations
	const wrapper = document.querySelector('.main-wrapper');
	const overlay = document.createElement('div');
	overlay.className = 'sidebar-overlay';
	if (wrapper) {
		wrapper.parentNode.insertBefore(overlay, wrapper);
	}

	// Toggle Mobile Menu
	document.addEventListener('click', function (e) {
		if (!e.target.closest('#mobile_btn')) return;
		e.preventDefault();
		wrapper.classList.toggle('slide-nav');
		overlay.classList.toggle('opened');
		document.documentElement.classList.toggle('menu-opened');
	});

	// Close sidebar on close button click
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.sidebar-close, .sidebar-overlay')) return;
		wrapper.classList.remove('slide-nav');
		overlay.classList.remove('opened');
		document.documentElement.classList.remove('menu-opened');
	});

	// Sidebar
	function initSidebarMenu() {
		const menuLinks = document.querySelectorAll('.sidebar-menu a');

		menuLinks.forEach(link => {
			link.addEventListener('click', function (e) {
				const isMini = document.body.classList.contains('mini-sidebar');
				
				// Expand sidebar on clicking any icon in mini-sidebar mode
				if (isMini) {
					document.body.classList.remove('mini-sidebar');
					document.body.classList.remove('expand-menu');
					const toggleBtn = document.getElementById('toggle_btn');
					const toggleBtn2 = document.getElementById('toggle_btn2');
					if (toggleBtn) toggleBtn.classList.add('active');
					if (toggleBtn2) toggleBtn2.classList.add('active');
				}

				const submenu = link.nextElementSibling && link.nextElementSibling.tagName === 'UL' ? link.nextElementSibling : null;

				if (link.parentElement.classList.contains('submenu')) {
					e.preventDefault();

					const isAlreadyOpen = link.classList.contains('subdrop');

					// Remove active and subdrop from ALL other submenu links across the sidebar
					document.querySelectorAll('.sidebar-menu li.submenu > a').forEach(a => {
						if (a !== link && !a.contains(link)) {
							a.classList.remove('subdrop', 'active');
							const siblingSubmenu = a.nextElementSibling;
							if (siblingSubmenu && siblingSubmenu.tagName === 'UL') {
								slideUp(siblingSubmenu, 200);
							}
						}
					});

					if (!isAlreadyOpen || isMini) {
						if (submenu) slideDown(submenu, 300);
						link.classList.add('subdrop', 'active');
					} else {
						link.classList.remove('subdrop', 'active');
						if (submenu) slideUp(submenu, 250);
					}
				} else {
					// Non-submenu direct link clicked
					document.querySelectorAll('.sidebar-menu a').forEach(a => {
						if (a !== link) a.classList.remove('active');
					});
					link.classList.add('active');
				}
			});
		});

		// Expand parent menus if active link is inside
		document.querySelectorAll('.sidebar-menu ul li.submenu a.active').forEach(activeLink => {
			let parent = activeLink.closest('li.submenu');
			while (parent) {
				const a = parent.querySelector(':scope > a');
				if (a) {
					a.classList.add('active', 'subdrop');
					const next = a.nextElementSibling;
					if (next && next.tagName === 'UL') next.style.display = '';
				}
				parent = parent.parentElement ? parent.parentElement.closest('li.submenu') : null;
			}
		});
	}

	// Slide animation helpers (jQuery slideDown/slideUp equivalents)
	function slideUp(el, duration = 300) {
		el.style.overflow = 'hidden';
		el.style.height = el.offsetHeight + 'px';
		el.style.transition = `height ${duration}ms ease`;
		el.offsetHeight; // force reflow
		el.style.height = '0px';
		window.setTimeout(() => {
			el.style.display = 'none';
			el.style.removeProperty('height');
			el.style.removeProperty('overflow');
			el.style.removeProperty('transition');
		}, duration);
	}

	function slideDown(el, duration = 300) {
		el.style.removeProperty('display');
		let display = window.getComputedStyle(el).display;
		if (display === 'none') display = 'block';
		el.style.display = display;
		const height = el.offsetHeight;
		el.style.overflow = 'hidden';
		el.style.height = '0px';
		el.style.transition = `height ${duration}ms ease`;
		el.offsetHeight; // force reflow
		el.style.height = height + 'px';
		window.setTimeout(() => {
			el.style.removeProperty('height');
			el.style.removeProperty('overflow');
			el.style.removeProperty('transition');
		}, duration);
	}

	function slideToggle(el, duration = 300) {
		if (window.getComputedStyle(el).display === 'none') {
			slideDown(el, duration);
		} else {
			slideUp(el, duration);
		}
	}

	function fadeIn(el, duration = 400) {
		el.style.opacity = 0;
		el.style.removeProperty('display');
		let display = window.getComputedStyle(el).display;
		if (display === 'none') display = 'block';
		el.style.display = display;
		el.style.transition = `opacity ${duration}ms ease`;
		el.offsetHeight; // force reflow
		el.style.opacity = 1;
		window.setTimeout(() => {
			el.style.removeProperty('transition');
		}, duration);
	}

	// Initialize Sidebar
	initSidebarMenu();

	// Star Filled
	document.addEventListener('DOMContentLoaded', function () {
		setTimeout(function () {
			document.querySelectorAll('.rating-select').forEach(el => {
				el.addEventListener('click', function () {
					this.classList.toggle('filled');
				});
			});
		}, 100);
	});

	// Editor
	if (document.querySelectorAll('.editor').length > 0) {
		document.querySelectorAll('.editor').forEach((editor) => {
			new Quill(editor, {
				theme: 'snow'
			});
		});
	}

	// Multiple Image
	if (document.querySelectorAll('.multiple-img').length > 0) {
		document.querySelectorAll('.multiple-img').forEach(el => {
			new Choices(el, {
				allowHTML: true,
				searchEnabled: false,
				shouldSort: false,
				callbackOnCreateTemplates: function (template) {
					return {
						item: ({ classNames }, data) => {
							const imageUrl = data.customProperties && data.customProperties.image ? data.customProperties.image : '';
							return template(`
								<div class="${classNames.item} ${data.highlighted ? classNames.highlightedState : classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
									${imageUrl ? `<img src="${imageUrl}" class="img-flag me-1" width="16" alt="flag">` : ''}${data.label}
								</div>
							`);
						},
						choice: ({ classNames }, data) => {
							const imageUrl = data.customProperties && data.customProperties.image ? data.customProperties.image : '';
							return template(`
								<div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" data-select-text="${this.config.itemSelectText}" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
									${imageUrl ? `<img src="${imageUrl}" class="img-flag me-1" width="16" alt="flag">` : ''}${data.label}
								</div>
							`);
						}
					};
				}
			});
		});
	}

	// Collapes Header
	if (document.querySelectorAll('#collapse-header').length > 0) {
		const collapseHeader = document.getElementById('collapse-header');
		if (collapseHeader) {
			collapseHeader.addEventListener('click', function () {
				this.classList.toggle('active');
				document.body.classList.toggle('header-collapse');
			});
		}
	}

	// Toggle Button
	document.addEventListener('click', function (e) {
		if (!e.target.closest('#toggle_btn, #toggle_btn2')) return;
		const trigger = e.target.closest('#toggle_btn, #toggle_btn2');
		const body = document.body;
		const html = document.documentElement;
		const isMini = body.classList.contains('mini-sidebar');
		const isFullWidth = html.getAttribute('data-layout') === 'full-width';
		const isHidden = html.getAttribute('data-layout') === 'hidden';

		if (isMini) {
			body.classList.remove('mini-sidebar');
			trigger.classList.add('active');
			localStorage.setItem('screenModeNightTokenState', 'night');
			setTimeout(function () {
				document.querySelectorAll('.header-left').forEach(el => el.classList.add('active'));
			}, 100);
		} else {
			body.classList.add('mini-sidebar');
			trigger.classList.remove('active');
			localStorage.removeItem('screenModeNightTokenState');
			setTimeout(function () {
				document.querySelectorAll('.header-left').forEach(el => el.classList.remove('active'));
			}, 100);
		}

		// data-layout="full-width", apply full-width class to <body>
		if (isFullWidth) {
			body.classList.add('full-width');
			body.classList.remove('mini-sidebar');
			document.querySelectorAll('.sidebar-overlay').forEach(el => el.classList.add('opened'));
			document.addEventListener('click', function (e2) {
				if (!e2.target.closest('.sidebar-close')) return;
				document.body.classList.remove('full-width');
			});
		} else {
			body.classList.remove('full-width');
		}

		// data-layout="hidden", apply hidden-layout class to <body>
		if (isHidden) {
			body.classList.toggle('hidden-layout');
			body.classList.remove('mini-sidebar');
			document.addEventListener('click', function (e2) {
				if (!e2.target.closest('.sidebar-close')) return;
				document.body.classList.remove('full-width');
			});
		}

		return false;
	});

	// Filter Close
	document.addEventListener('DOMContentLoaded', () => {
		document.querySelectorAll('.close-filter-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const dropdown = btn.closest('.dropdown');
				if (!dropdown) return;
				const toggle = dropdown.querySelector('[data-bs-toggle="dropdown"]');
				if (!toggle) return;
				const dropdownInstance = bootstrap.Dropdown.getInstance(toggle) || new bootstrap.Dropdown(toggle);
				dropdownInstance.hide();
			});
		});
	});

	// Tooltip
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
	const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

	// Input Mask
	document.querySelectorAll('[data-toggle="input-mask"]').forEach(input => {
		const format = input.getAttribute('data-mask-format');
		const reverse = input.getAttribute('data-reverse') === 'true';
		if (format && typeof Inputmask !== 'undefined') {
			Inputmask({
				mask: format.replace(/0/g, '9'),
				reverse: reverse
			}).mask(input);
		}
	});

	// Form Validation
	document.querySelectorAll('.needs-validation').forEach(form => {
		form.addEventListener('submit', event => {
			if (!form.checkValidity()) {
				event.preventDefault();
				event.stopPropagation();
			}
			form.classList.add('was-validated');
		}, false);
	});

	// Choices
	function initChoices() {
		document.querySelectorAll('[data-choices]').forEach(item => {
			const config = {
				allowHTML: true
			};
			const attrs = item.attributes;
			if (attrs['data-choices-groups']) {
				config.placeholderValue = 'This is a placeholder set in the config';
			}
			if (attrs['data-choices-search-false']) {
				config.searchEnabled = false;
			}
			if (attrs['data-choices-search-true']) {
				config.searchEnabled = true;
			}
			if (attrs['data-choices-removeItem']) {
				config.removeItemButton = true;
			}
			if (attrs['data-choices-sorting-false']) {
				config.shouldSort = false;
			}
			if (attrs['data-choices-sorting-true']) {
				config.shouldSort = true;
			}
			if (attrs['data-choices-multiple-remove']) {
				config.removeItemButton = true;
			}
			if (attrs['data-choices-limit']) {
				config.maxItemCount = parseInt(attrs['data-choices-limit'].value);
			}
			if (attrs['data-choices-editItem-true']) {
				config.editItems = true;
			}
			if (attrs['data-choices-editItem-false']) {
				config.editItems = false;
			}
			if (attrs['data-choices-text-unique-true']) {
				config.duplicateItemsAllowed = false;
			}
			if (attrs['data-choices-text-disabled-true']) {
				config.addItems = false;
			}
			const instance = new Choices(item, config);
			if (attrs['data-choices-text-disabled-true']) {
				instance.disable();
			}
		});
	}

	// Call it when the DOM is ready
	document.addEventListener('DOMContentLoaded', initChoices);

	// Initialize Flatpickr on elements with data-provider="flatpickr"
	document.querySelectorAll('[data-provider="flatpickr"]').forEach(el => {
		const config = {
			disableMobile: true
		};
		if (el.hasAttribute('data-date-format')) {
			config.dateFormat = el.getAttribute('data-date-format');
		}
		if (el.hasAttribute('data-enable-time')) {
			config.enableTime = true;
			config.dateFormat = config.dateFormat ? `${config.dateFormat} H:i` : 'Y-m-d H:i';
		}
		if (el.hasAttribute('data-altFormat')) {
			config.altInput = true;
			config.altFormat = el.getAttribute('data-altFormat');
		}
		if (el.hasAttribute('data-minDate')) {
			config.minDate = el.getAttribute('data-minDate');
		}
		if (el.hasAttribute('data-maxDate')) {
			config.maxDate = el.getAttribute('data-maxDate');
		}
		if (el.hasAttribute('data-default-date')) {
			config.defaultDate = el.getAttribute('data-default-date');
		}
		if (el.hasAttribute('data-multiple-date')) {
			config.mode = 'multiple';
		}
		if (el.hasAttribute('data-range-date')) {
			config.mode = 'range';
		}
		if (el.hasAttribute('data-inline-date')) {
			config.inline = true;
			config.defaultDate = el.getAttribute('data-inline-date');
		}
		if (el.hasAttribute('data-disable-date')) {
			config.disable = el.getAttribute('data-disable-date').split(',');
		}
		if (el.hasAttribute('data-week-number')) {
			config.weekNumbers = true;
		}
		flatpickr(el, config);
	});

	// Time Picker
	document.querySelectorAll('[data-provider="timepickr"]').forEach(item => {
		const attrs = item.attributes;
		const config = {
			enableTime: true,
			noCalendar: true,
			dateFormat: "H:i"
		};
		if (attrs["data-time-hrs"]) {
			config.time_24hr = true;
		}
		if (attrs["data-min-time"]) {
			config.minTime = attrs["data-min-time"].value;
		}
		if (attrs["data-max-time"]) {
			config.maxTime = attrs["data-max-time"].value;
		}
		if (attrs["data-default-time"]) {
			config.defaultDate = attrs["data-default-time"].value;
		}
		if (attrs["data-time-inline"]) {
			config.inline = true;
			config.defaultDate = attrs["data-time-inline"].value;
		}
		flatpickr(item, config);
	});

	// Select2 -> Choices.js
	document.querySelectorAll('[data-toggle="select2"]').forEach(el => {
		const config = { allowHTML: true };

		// Placeholder
		if (el.getAttribute('data-placeholder')) {
			config.placeholderValue = el.getAttribute('data-placeholder');
		}

		// Allow clear
		if (el.getAttribute('data-allow-clear') === 'true') {
			config.removeItemButton = true;
		}

		// Tags input (user can enter new values)
		if (el.getAttribute('data-tags') === 'true') {
			config.addItems = true;
			config.duplicateItemsAllowed = false;
		}

		// Maximum selection
		if (el.getAttribute('data-max-selections')) {
			config.maxItemCount = parseInt(el.getAttribute('data-max-selections'));
		}

		// AJAX (for dynamic search)
		const ajaxUrl = el.getAttribute('data-ajax--url');
		if (ajaxUrl) {
			const choicesInstance = new Choices(el, Object.assign({}, config, { searchEnabled: true }));
			let debounceTimer;
			choicesInstance.input.element.addEventListener('input', function (event) {
				clearTimeout(debounceTimer);
				const term = event.target.value;
				debounceTimer = setTimeout(function () {
					fetch(`${ajaxUrl}?q=${encodeURIComponent(term)}&page=1`)
						.then(res => res.json())
						.then(data => {
							const items = (data.items || []).map(item => ({ value: item.id, label: item.text }));
							choicesInstance.clearChoices();
							choicesInstance.setChoices(items, 'value', 'label', true);
						});
				}, 250);
			});
			return;
		}

		// Init Choices with config
		new Choices(el, config);
	});

	// Select 2 -> Choices.js
	function initSelectChoices(root = document) {
		root.querySelectorAll('.select').forEach(el => {
			if (el.dataset.choicesBound) return;
			try {
				new Choices(el, {
					allowHTML: true,
					searchEnabled: false,
					shouldSort: false
				});
				// Only mark it bound once it really is, so a select that failed
				// here can still be picked up by a later pass instead of being
				// left as a bare browser select.
				el.dataset.choicesBound = 'true';
			} catch (err) {
				console.error('Choices could not be initialised on', el, err);
			}
		});
	}
	if (document.querySelectorAll('.select').length > 0) {
		initSelectChoices();
	}

	// Offcanvas and modal forms are in the markup from the start, but catch any
	// select that was not enhanced on the first pass when the panel is opened.
	document.addEventListener('show.bs.offcanvas', e => initSelectChoices(e.target));
	document.addEventListener('show.bs.modal', e => initSelectChoices(e.target));

	// Popover
	const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
	const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

	// Toasts
	document.addEventListener('DOMContentLoaded', function () {
		const toastPlacement = document.getElementById('toastPlacement');
		const placementSelect = document.getElementById('selectToastPlacement');
		if (toastPlacement && placementSelect) {
			const originalClass = toastPlacement.className;
			placementSelect.addEventListener('change', function () {
				toastPlacement.className = `${originalClass} ${this.value}`.trim();
			});
		}
	});

	// Datatable
	// Columns marked `no-sort` in the markup (checkbox and action columns) must
	// not be orderable - re-sorting them shuffles the rows under the checkboxes.
	if (window.DataTable) {
		DataTable.defaults.columnDefs = [{ targets: 'no-sort', orderable: false }];
	}

	if (document.querySelectorAll('.datatable').length > 0) {
		document.querySelectorAll('.datatable').forEach(table => {
			new DataTable(table, {
				searching: true,
				layout: {
					topStart: 'search',
					topEnd: null,
					bottomStart: 'pageLength',
					bottomEnd: 'paging'
				},
				pagingType: 'simple_numbers',
				ordering: true,
				language: {
					search: ' ',
					lengthMenu: 'Show _MENU_ entries',
					searchPlaceholder: "Search",
					info: "_START_ - _END_ of _TOTAL_ items",
					paginate: {
						next: '<i class="ti ti-arrow-right"></i>',
						previous: '<i class="ti ti-arrow-left"></i> '
					},
				},
				responsive: true,
				autoWidth: false,
				initComplete: function (settings) {
					const wrapper = settings.tableWrapper;
					const search = wrapper.querySelector('.dt-search');
					const length = wrapper.querySelector('.dt-length');
					const paging = wrapper.querySelector('.dt-paging');
					const tableSearch = document.getElementById('tableSearch');
					const searchInput = document.querySelector('.search-input');
					const lengthBox = document.querySelector('.datatable-length');
					const pagingBox = document.querySelector('.datatable-paginate');
					if (search && (tableSearch || searchInput)) (tableSearch || searchInput).appendChild(search);
					if (lengthBox && length) lengthBox.appendChild(length);
					if (pagingBox && paging) pagingBox.appendChild(paging);
					wrapper.querySelectorAll('.dt-layout-row:not(.dt-layout-table)').forEach(row => {
						if (!row.querySelector('.dt-length, .dt-paging, .dt-search, .dt-info, .dt-buttons')) row.remove();
					});
				},
			});
		});
	}

	// Filter
	document.addEventListener("DOMContentLoaded", () => {
		const closeBtn = document.getElementById("close-filter");
		const filterDropdown = document.getElementById("filter-dropdown");
		if (closeBtn && filterDropdown) {
			closeBtn.addEventListener("click", () => {
				filterDropdown.classList.remove("show");
			});
		}
	});

	// Toggle Password
	document.addEventListener('click', function (e) {
		const trigger = e.target.closest('.toggle-password');
		if (!trigger) return;
		const icon = trigger.querySelector('i');
		const inputGroup = trigger.closest('.input-group');
		const input = inputGroup ? inputGroup.querySelector('.pass-input') : null;
		if (!input) return;
		if (input.getAttribute('type') === 'password') {
			input.setAttribute('type', 'text');
			icon.classList.remove('ti-eye-off');
			icon.classList.add('ti-eye');
		} else {
			input.setAttribute('type', 'password');
			icon.classList.remove('ti-eye');
			icon.classList.add('ti-eye-off');
		}
	});

	// Date range preset helpers (flatpickr-based replacement for daterangepicker)
	function formatRangeLabel(start, end) {
		const opts = { day: '2-digit', month: 'short', year: '2-digit' };
		const startStr = start.toLocaleDateString('en-GB', opts).replace(/ /g, ' ');
		const endStr = end.toLocaleDateString('en-GB', opts).replace(/ /g, ' ');
		return `${startStr} - ${endStr}`;
	}

	function startOfDay(d) {
		const nd = new Date(d);
		nd.setHours(0, 0, 0, 0);
		return nd;
	}

	function addDays(d, days) {
		const nd = new Date(d);
		nd.setDate(nd.getDate() + days);
		return nd;
	}

	function startOfMonth(d) {
		return new Date(d.getFullYear(), d.getMonth(), 1);
	}

	function endOfMonth(d) {
		return new Date(d.getFullYear(), d.getMonth() + 1, 0);
	}

	function getPresetRanges() {
		const today = startOfDay(new Date());
		const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
		return {
			'Today': [today, today],
			'Yesterday': [addDays(today, -1), addDays(today, -1)],
			'Last 7 Days': [addDays(today, -6), today],
			'Last 30 Days': [addDays(today, -29), today],
			'This Month': [startOfMonth(today), endOfMonth(today)],
			'Last Month': [startOfMonth(lastMonthDate), endOfMonth(lastMonthDate)]
		};
	}

	function buildRangeDropdownMenu(fp, ranges, onSelect) {
		const menu = document.createElement('div');
		menu.className = 'daterangepicker-preset-menu dropdown-menu';
		Object.keys(ranges).forEach(label => {
			const item = document.createElement('a');
			item.href = 'javascript:void(0);';
			item.className = 'dropdown-item';
			item.textContent = label;
			item.addEventListener('click', () => {
				const [start, end] = ranges[label];
				onSelect(start, end);
				menu.classList.remove('show');
			});
			menu.appendChild(item);
		});
		return menu;
	}

	function initDateRangePicker(container, labelSelector) {
		if (typeof flatpickr === 'undefined') return;
		const ranges = getPresetRanges();
		const defaultStart = ranges['Last 30 Days'][0];
		const defaultEnd = ranges['Last 30 Days'][1];
		const labelEl = container.querySelector(labelSelector);

		const updateLabel = (start, end) => {
			if (labelEl) labelEl.innerHTML = formatRangeLabel(start, end);
		};

		const fp = flatpickr(container, {
			mode: 'range',
			disableMobile: true,
			defaultDate: [defaultStart, defaultEnd],
			onClose: function (selectedDates) {
				if (selectedDates.length === 2) {
					updateLabel(selectedDates[0], selectedDates[1]);
				}
			},
			onReady: function (selectedDates, dateStr, instance) {
				const menu = buildRangeDropdownMenu(instance, ranges, (start, end) => {
					instance.setDate([start, end], true);
					updateLabel(start, end);
				});
				instance.calendarContainer.insertBefore(menu, instance.calendarContainer.firstChild);
			}
		});

		updateLabel(defaultStart, defaultEnd);
		return fp;
	}

	// Date Range Picker
	if (document.getElementById('reportrange')) {
		initDateRangePicker(document.getElementById('reportrange'), 'span');
	}

	// Reportrange
	document.querySelectorAll('.reportrange').forEach(el => {
		initDateRangePicker(el, 'span');
	});

	// Custom Country Code Selector
	if (document.querySelectorAll('.phone').length > 0) {
		document.querySelectorAll(".phone").forEach(input => {
			window.intlTelInput(input, {
				utilsScript: "assets/plugins/intltelinput/js/utils.js",
			});
		});
	}

	// Select Table Checkbox
	const rowCheckboxSelector = '.form-check.form-check-md input[type="checkbox"]';

	// The rows a master checkbox controls: the body rows of its own table when
	// it sits in one, so redrawn rows (pagination, search, sorting) are picked
	// up on every read.
	function selectAllRows(master) {
		const table = master.closest('table');
		return [...(table
			? table.querySelectorAll('tbody ' + rowCheckboxSelector)
			: document.querySelectorAll(rowCheckboxSelector))].filter(cb => cb !== master);
	}

	function syncSelectAll(master) {
		const rows = selectAllRows(master);
		const checked = rows.filter(cb => cb.checked).length;
		master.checked = rows.length > 0 && checked === rows.length;
		master.indeterminate = checked > 0 && checked < rows.length;
	}

	function bindSelectAll(checkboxId) {
		const master = document.getElementById(checkboxId);
		if (!master) return;

		master.addEventListener('change', function () {
			const isChecked = this.checked;
			this.indeterminate = false;
			selectAllRows(this).forEach(cb => {
				cb.checked = isChecked;
			});
		});

		// Row checkbox -> master state
		document.addEventListener('change', function (e) {
			const cb = e.target;
			if (cb === master || !cb.matches || !cb.matches(rowCheckboxSelector)) return;
			if (!selectAllRows(master).includes(cb)) return;
			syncSelectAll(master);
		});

		// Rows replaced by a datatable redraw start out unchecked
		const table = master.closest('table');
		if (table) table.addEventListener('draw', () => syncSelectAll(master));
	}
	bindSelectAll('select-all');
	bindSelectAll('select-all-2');
	bindSelectAll('select-all-3');

	// Full Screen
	if (document.querySelectorAll('.btnFullscreen').length) {
		const toggleFullscreen = function () {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			} else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				}
			}
		};
		document.querySelectorAll('.btnFullscreen').forEach(el => el.addEventListener('click', toggleFullscreen));
	}

	// Aprrearence Settings
	document.querySelectorAll('.theme-image').forEach(el => {
		el.addEventListener('click', function () {
			document.querySelectorAll('.theme-image').forEach(i => i.classList.remove('active'));
			this.classList.add('active');
		});
	});

	// Sticky Sidebar
	if (window.innerWidth > 767) {
		document.querySelectorAll('.theiaStickySidebar').forEach(el => {
			new TheiaStickySidebar(el, {
				additionalMarginTop: 30
			});
		});
	}

	// Date Range Picker
	document.querySelectorAll('.daterangepick').forEach(el => {
		initDateRangePicker(el, 'span');
	});

	// Card Drag (jQuery UI sortable -> HTML5 Drag and Drop)
	document.querySelectorAll('.kanban-drag-wrap').forEach(column => {
		column.addEventListener('dragover', function (e) {
			e.preventDefault();
			const dragging = document.querySelector('.kanban-card.dragging');
			if (!dragging) return;
			const afterElement = getDragAfterElement(column, e.clientY);
			if (afterElement == null) {
				column.appendChild(dragging.closest('[draggable="true"]') || dragging);
			} else {
				column.insertBefore(dragging.closest('[draggable="true"]') || dragging, afterElement);
			}
		});
	});

	function getDragAfterElement(container, y) {
		const draggableElements = [...container.querySelectorAll('[draggable="true"]:not(.dragging)')];
		return draggableElements.reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		}, { offset: Number.NEGATIVE_INFINITY }).element;
	}

	function initKanbanDrag() {
		document.querySelectorAll('.kanban-drag-wrap .kanban-card').forEach(card => {
			const draggableItem = card.closest('[draggable]') || card;
			draggableItem.setAttribute('draggable', 'true');
			draggableItem.addEventListener('dragstart', function () {
				card.classList.add('dragging');
			});
			draggableItem.addEventListener('dragend', function () {
				card.classList.remove('dragging');
			});
		});
	}
	if (document.querySelectorAll('.kanban-drag-wrap').length > 0) {
		initKanbanDrag();
	}

	// Otp Verfication
	document.querySelectorAll('.digit-group input').forEach(input => {
		input.setAttribute('maxlength', 1);

		input.addEventListener('keyup', function (e) {
			const parent = input.closest('.digit-group');
			const key = e.keyCode;
			const prevId = input.dataset.previous;
			const nextId = input.dataset.next;
			const prevInput = prevId ? parent.querySelector(`#${prevId}`) : null;
			const nextInput = nextId ? parent.querySelector(`#${nextId}`) : null;

			if (key === 8 || key === 37) {
				if (prevInput) prevInput.select();
			} else if (
				(key >= 48 && key <= 57) || // 0-9
				(key >= 65 && key <= 90) || // A-Z
				(key >= 96 && key <= 105) || // numpad 0-9
				key === 39 // right arrow
			) {
				if (nextInput) {
					nextInput.select();
				} else if (parent.dataset.autosubmit) {
					parent.closest('form') && parent.closest('form').submit();
				}
			}
		});
		input.addEventListener('keyup', function () {
			input.classList.toggle('active', input.value !== '');
		});
	});

	// Coming Soon
	if (document.querySelectorAll('.comming-soon').length > 0) {
		const dayEl = document.querySelector('.days');
		const hourEl = document.querySelector('.hours');
		const minuteEl = document.querySelector('.minutes');
		const secondEl = document.querySelector('.seconds');
		const countdownDate = new Date('Nov 26, 2026 16:00:00').getTime();
		const timer = setInterval(() => {
			const now = Date.now();
			const distance = countdownDate - now;
			if (distance <= 0) {
				clearInterval(timer);
				document.querySelector('.comming-soon').innerHTML = '<h1>EXPIRED</h1>';
				return;
			}
			const days = Math.floor(distance / (1000 * 60 * 60 * 24));
			const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((distance % (1000 * 60)) / 1000);

			dayEl.textContent = days;
			hourEl.textContent = hours;
			minuteEl.textContent = minutes;
			secondEl.textContent = seconds;
		}, 1000);
	}

	// Add new invoice input on '+' click
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.add-invoices')) return;
		e.preventDefault();

		const newInvoice = `
			<tr class="invoices-list-item">
				<td><input type="text" class="form-control" /></td>
				<td><input type="text" class="form-control" /></td>
				<td><input type="number" class="form-control" /></td>
				<td><input type="number" class="form-control" /></td>
				<td><input type="text" class="form-control" readonly /></td>
				<td><button class="btn remove-invoices btn-sm border shadow-sm p-2 d-flex align-items-center justify-content-center rounded fs-14">
					<i class="ti ti-trash"></i>
				</button></td>
			</tr>
		`;

		const list = document.querySelector('.invoices-list');
		if (!list) return;
		const rows = list.querySelectorAll('tr');
		const lastRow = rows[rows.length - 1];
		lastRow.insertAdjacentHTML('beforebegin', newInvoice);
	});

	// Add new invoice input on '+' click
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.add-invoices-two')) return;
		e.preventDefault();

		const newInvoice = `
			<tr class="invoices-list-item">
				<td>
					<div class="input-table input-table-descripition">
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<select class="select">
							<option>0%</option>
							<option>5%</option>
						</select>
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<a href="#" class="btn btn-icon btn-sm remove-invoices text-danger">
						<i class="ti ti-xbox-x"></i>
					</a>
				</td>
			</tr>`;

		const list = document.querySelector('.invoices-list-two');
		if (!list) return;
		const rows = list.querySelectorAll('tr');
		const lastRow = rows[rows.length - 1];
		lastRow.insertAdjacentHTML('afterend', newInvoice);

		setTimeout(function () {
			setTimeout(function () {
				initSelectChoices(list);
			}, 100);
		}, 100);
	});

	// Add new invoice input on '+' click
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.add-invoices-3')) return;
		e.preventDefault();

		const newInvoice = `
			<tr class="invoices-list-item">
				<td>
					<div class="input-table input-table-descripition">
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<div>
						<select class="select">
							<option>0%</option>
							<option>5%</option>
						</select>
					</div>
				</td>
				<td>
					<div>
						<input type="text" class="form-control">
					</div>
				</td>
				<td>
					<a href="#" class="btn btn-icon btn-sm remove-invoices text-danger">
						<i class="ti ti-xbox-x"></i>
					</a>
				</td>
			</tr>`;

		const list = document.querySelector('.invoices-list-3');
		if (!list) return;
		const rows = list.querySelectorAll('tr');
		const lastRow = rows[rows.length - 1];
		lastRow.insertAdjacentHTML('afterend', newInvoice);

		setTimeout(function () {
			setTimeout(function () {
				initSelectChoices(list);
			}, 100);
		}, 100);
	});

	// Remove Invoices input on trash icon click
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.remove-invoices')) return;
		e.preventDefault();
		e.target.closest('.invoices-list-item').remove();
	});

	// Theme Color
	document.querySelectorAll('.themecolorset').forEach(el => {
		el.addEventListener('click', function () {
			document.querySelectorAll('.themecolorset').forEach(i => i.classList.remove('active'));
			this.classList.add('active');
		});
	});

	// Add Comment
	if (document.querySelectorAll('.add-comment').length > 0) {
		document.querySelectorAll('.add-comment').forEach(el => {
			el.addEventListener('click', function () {
				const wrap = this.closest('.notes-editor').querySelector('.note-edit-wrap');
				if (wrap) slideToggle(wrap);
			});
		});
		document.querySelectorAll('.add-cancel').forEach(el => {
			el.addEventListener('click', function () {
				const wrap = this.closest('.note-edit-wrap');
				if (wrap) slideUp(wrap);
			});
		});
	}

	// Contact Wizard
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.add-info-fieldset .wizard-next-btn')) return;
		const fieldset = e.target.closest('fieldset');
		const nextFieldset = fieldset.nextElementSibling;
		const progressBar = document.querySelector('.progress-bar-wizard');

		fieldset.style.display = 'none'; // Hide current step
		if (nextFieldset) fadeIn(nextFieldset, 600); // Show next step with fade

		// Update progress bar state
		if (progressBar) {
			const active = progressBar.querySelector('.active');
			if (active) {
				active.classList.remove('active');
				active.classList.add('activated');
				const next = active.nextElementSibling;
				if (next) next.classList.add('active');
			}
		}
	});

	// Add Sign
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.trash-sign')) return;
		e.target.closest('.sign-cont').remove();
		return false;
	});
	document.addEventListener('click', function (e) {
		if (!e.target.closest('.add-sign')) return;
		e.preventDefault();

		const signcontent = '<div class="row sign-cont">' +
			'<div class="col-md-6">' +
				'<div class="form-wrap mb-3">' +
					'<input class="form-control" type="text" placeholder="Enter Name">' +
				'</div>' +
			'</div>' +
			'<div class="col-md-6">' +
				'<div class="d-flex align-items-center mb-3">' +
					'<div class="form-wrap w-100 me-3">' +
					'<input class="form-control" type="text" placeholder="Email Address">' +
					'</div>' +
					'<div class="input-btn">' +
						'<a href="javascript:void(0);" class="trash-sign"><i class="ti ti-trash"></i></a>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>';
		const signContentEls = document.querySelectorAll('.sign-content > div');
		const lastChild = signContentEls[signContentEls.length - 1];
		if (lastChild) lastChild.insertAdjacentHTML('afterend', signcontent);
		return false;
	});

	// Delete Reason
	const deleteReasonEl = document.getElementById('deleteReason');
	if (deleteReasonEl) {
		deleteReasonEl.addEventListener('change', function (e) {
			const value = e.target.value;
			const otherReasonBox = document.getElementById('otherReasonBox');
			if (!otherReasonBox) return;
			if (value === 'others') {
				slideDown(otherReasonBox);
			} else {
				slideUp(otherReasonBox);
			}
		});
	}

	// add new product
	document.addEventListener('DOMContentLoaded', function () {
		// ADD NEW ROW
		document.addEventListener('click', function (e) {
			if (!e.target.closest('.add-new-product')) return;
			e.preventDefault();

			let newRow = `
				<tr class="product-list">
					<td class="product-select">
						<select class="select">
							<option>Select</option>
							<option>Barcode Scanner</option>
							<option>Cyber Security Suite</option>
							<option>Digital Marketing Pack</option>
							<option>Financial Reporting Tool</option>
						</select>
					</td>
					<td><input class="form-control"></td>
					<td><input class="form-control"></td>
					<td>
						<select class="select">
							<option>0 %</option>
							<option>50 %</option>
							<option>60 %</option>
							<option>80 %</option>
							<option>100 %</option>
						</select>
					</td>
					<td><input class="form-control"></td>
					<td>
						<a href="#" class="text-danger remove-product">
							<i class="ti ti-xbox-x"></i>
						</a>
					</td>
				</tr>
			`;

			const tbody = document.querySelector('table tbody');
			if (!tbody) return;
			tbody.insertAdjacentHTML('beforeend', newRow);

			setTimeout(function () {
				setTimeout(function () {
					initSelectChoices(tbody);
				}, 100);
			}, 100);
		});

		// REMOVE ROW
		document.addEventListener('click', function (e) {
			if (!e.target.closest('.remove-product')) return;
			e.preventDefault();
			e.target.closest('tr').remove();
		});
	});


	document.addEventListener("DOMContentLoaded", () => {
		const bars = document.querySelectorAll('.circular-progress');

		bars.forEach(bar => {
			// 1. Get values from data attributes
			const progress = bar.getAttribute('data-progress') || 0;
			const color = bar.getAttribute('data-color') || '#000'; // Default black if missing

			// 2. Map HTML data to CSS variables
			bar.style.setProperty('--pg', `${progress}%`);
			bar.style.setProperty('--clr', color);

			// 3. Update text
			const text = bar.querySelector('.value');
			if (text) text.innerText = `${progress}%`;
		});
	});


	// copy text
	document.addEventListener('click', function (e) {
		const btn = e.target.closest('.copy-text');
		if (!btn) return;

		const inputGroup = btn.closest('.input-group');
		const input = inputGroup ? inputGroup.querySelector('input') : null;
		if (!input) return;

		navigator.clipboard.writeText(input.value).then(function () {

			// Change tooltip text
			btn.setAttribute('data-bs-original-title', 'Copied!');

			// Show tooltip
			const tooltipInstance = bootstrap.Tooltip.getInstance(btn) || new bootstrap.Tooltip(btn);
			tooltipInstance.show();

			// Hide after 1 sec
			setTimeout(function () {
				tooltipInstance.hide();
			}, 1000);

		});

	});


	document.addEventListener('DOMContentLoaded', function () {

		function loadPeriods(container, type, selectedValue = null) {

			const periodSelect = container.querySelector(".period-select");
			const periodWrapper = container.querySelector(".period-wrapper");
			const currentYear = new Date().getFullYear();

			if (!periodSelect || !periodWrapper) return;

			periodSelect.innerHTML = '';

			if (!type) {
				periodWrapper.classList.add("d-none");
				return;
			}

			periodWrapper.classList.remove("d-none");

			if (type === "month") {

				const months = [
					"Jan", "Feb", "Mar", "Apr", "May", "Jun",
					"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
				];

				months.forEach(function (month) {
					const value = month + "-" + currentYear;
					const selected = (value === selectedValue) ? "selected" : "";
					periodSelect.insertAdjacentHTML('beforeend',
						`<option value="${value}" ${selected}>
							${month} ${currentYear}
						</option>`
					);
				});

			} else if (type === "quarter") {

				for (let i = 1; i <= 4; i++) {

					const value = "Q" + i + "-" + currentYear;
					const selected = (value === selectedValue) ? "selected" : "";

					periodSelect.insertAdjacentHTML('beforeend',
						`<option value="${value}" ${selected}>
							${value}
						</option>`
					);
				}
			}
		}

		// On Change (Works for multiple forms + modals)
		document.addEventListener("change", function (e) {
			if (!e.target.closest('.period-type')) return;
			const container = e.target.closest(".period-container");
			const type = e.target.value;

			loadPeriods(container, type);
		});

		// Edit Mode Support
		window.setEditPeriod = function (containerSelector, type, value) {

			const container = document.querySelector(containerSelector);
			if (!container) return;

			const periodType = container.querySelector(".period-type");
			if (periodType) periodType.value = type;
			loadPeriods(container, type, value);
		};

	});


})();
