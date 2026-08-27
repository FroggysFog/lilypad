document.addEventListener('DOMContentLoaded', function () {

	if (document.querySelector('#smscampaign-list')) {
		new DataTable('#smscampaign-list', {
			"searching": false,
			"info": false,
			"ordering": true,
			"autoWidth": true,
			"language": {
				search: ' ',
				searchPlaceholder: "Search",
				info: "_START_ - _END_ of _TOTAL_ items",
				"lengthMenu": "Show _MENU_ entries",
				paginate: {
					next: '<i class="ti ti-chevron-right"></i> ',
					previous: '<i class="ti ti-chevron-left"></i> '
				},
			},
			pagingType: "simple_numbers",
			initComplete: (settings, json) => {
				const wrapper = settings.tableWrapper;
				const lengthBox = document.querySelector('.datatable-length');
				const pagingBox = document.querySelector('.datatable-paginate');
				const length = wrapper.querySelector('.dt-length');
				const paging = wrapper.querySelector('.dt-paging');
				if (lengthBox && length) lengthBox.appendChild(length);
				if (pagingBox && paging) pagingBox.appendChild(paging);
				wrapper.querySelectorAll('.dt-layout-row:not(.dt-layout-table)').forEach(row => {
					if (!row.querySelector('.dt-length, .dt-paging, .dt-search, .dt-info, .dt-buttons')) row.remove();
				});
			},
			"data": [
				{
					"id": 1,
					"ticket_ID": "SMS001",
					"name": "Renewal Reminder",
					"type": "Active Customers",
					"template": "21 Jul 2026",
					"count": "1524",
					"mem_image1": "assets/img/profiles/avatar-01.jpg",
					"mem_image2": "assets/img/profiles/avatar-02.jpg",
					"mem_image3": "assets/img/profiles/avatar-03.jpg",
					"mem_count": "+5",
					"open": "40.5%",
					"close": "60.5%",
					"close_label": "Failed",
					"status": "0",
					"Action": ""
				},
				{
					"id": 2,
					"ticket_ID": "SMS002",
					"name": "Payment Due Alert",
					"type": "Overdue Accounts",
					"template": "10 Jun 2026",
					"count": "1421",
					"mem_image1": "assets/img/profiles/avatar-04.jpg",
					"mem_image2": "assets/img/profiles/avatar-05.jpg",
					"mem_image3": "assets/img/profiles/avatar-06.jpg",
					"mem_count": "+3",
					"open": "30.5%",
					"close": "40.5%",
					"close_label": "Failed",
					"status": "1",
					"Action": ""
				},
				{
					"id": 3,
					"ticket_ID": "SMS003",
					"name": "New Feature Update",
					"type": "Premium Users",
					"template": "02 Jun 2026",
					"count": "1342",
					"mem_image1": "assets/img/profiles/avatar-07.jpg",
					"mem_image2": "assets/img/profiles/avatar-08.jpg",
					"mem_image3": "assets/img/profiles/avatar-09.jpg",
					"mem_count": "+4",
					"open": "35.5%",
					"close": "10.5%",
					"close_label": "Clicked",
					"status": "0",
					"Action": ""
				},
				{
					"id": 4,
					"ticket_ID": "SMS004",
					"name": "Subscription Expiry",
					"type": "Trial Users",
					"template": "20 May 2026",
					"count": "1212",
					"mem_image1": "assets/img/profiles/avatar-10.jpg",
					"mem_image2": "assets/img/profiles/avatar-11.jpg",
					"mem_image3": "assets/img/profiles/avatar-12.jpg",
					"mem_count": "+5",
					"open": "41.5%",
					"close": "20.5%",
					"close_label": "Failed",
					"status": "2",
					"Action": ""
				},
				{
					"id": 5,
					"ticket_ID": "SMS005",
					"name": "Limited Offer Promo",
					"type": "Inactive Customers",
					"template": "16 Apr 2026",
					"count": "1111",
					"mem_image1": "assets/img/profiles/avatar-13.jpg",
					"mem_image2": "assets/img/profiles/avatar-14.jpg",
					"mem_image3": "assets/img/profiles/avatar-15.jpg",
					"mem_count": "+2",
					"open": "88.5%",
					"close": "11.5%",
					"close_label": "Failed",
					"status": "3",
					"Action": ""
				},
				{
					"id": 6,
					"ticket_ID": "SMS006",
					"name": "Account Verification",
					"type": "New Signups",
					"template": "12 Apr 2026",
					"count": "987",
					"mem_image1": "assets/img/profiles/avatar-16.jpg",
					"mem_image2": "assets/img/profiles/avatar-17.jpg",
					"mem_image3": "assets/img/profiles/avatar-18.jpg",
					"mem_count": "+4",
					"open": "90.5%",
					"close": "10.5%",
					"close_label": "Failed",
					"status": "4",
					"Action": ""
				},
				{
					"id": 7,
					"ticket_ID": "SMS007",
					"name": "Feedback Request",
					"type": "All Customers",
					"template": "09 Mar 2026",
					"count": "876",
					"mem_image1": "assets/img/profiles/avatar-19.jpg",
					"mem_image2": "assets/img/profiles/avatar-20.jpg",
					"mem_image3": "assets/img/profiles/avatar-21.jpg",
					"mem_count": "+5",
					"open": "90.5%",
					"close": "40.5%",
					"close_label": "Failed",
					"status": "0",
					"Action": ""
				},
				{
					"id": 8,
					"ticket_ID": "SMS008",
					"name": "Service Downtime Alert",
					"type": "Feedback-SMS",
					"template": "05 Mar 2026",
					"count": "765",
					"mem_image1": "assets/img/profiles/avatar-01.jpg",
					"mem_image2": "assets/img/profiles/avatar-02.jpg",
					"mem_image3": "assets/img/profiles/avatar-03.jpg",
					"mem_count": "+3",
					"open": "48.5%",
					"close": "75.5%",
					"close_label": "Failed",
					"status": "4",
					"Action": ""
				},
				{
					"id": 9,
					"ticket_ID": "SMS009",
					"name": "Wallet Balance Low",
					"type": "Balance-SMS",
					"template": "24 Feb 2026",
					"count": "654",
					"mem_image1": "assets/img/profiles/avatar-04.jpg",
					"mem_image2": "assets/img/profiles/avatar-05.jpg",
					"mem_image3": "assets/img/profiles/avatar-06.jpg",
					"mem_count": "+3",
					"open": "65.5%",
					"close": "20.5%",
					"close_label": "Failed",
					"status": "2",
					"Action": ""
				},
				{
					"id": 10,
					"ticket_ID": "SMS010",
					"name": "Event Reminder",
					"type": "Event-SMS",
					"template": "16 Feb 2026",
					"count": "543",
					"mem_image1": "assets/img/profiles/avatar-07.jpg",
					"mem_image2": "assets/img/profiles/avatar-08.jpg",
					"mem_image3": "assets/img/profiles/avatar-09.jpg",
					"mem_count": "+5",
					"open": "49.5%",
					"close": "30.5%",
					"close_label": "Failed",
					"status": "0",
					"Action": ""
				}
			],
			"columns": [
				{
					"render": function (data, type, row) {
						return '<h6 class="d-flex align-items-center fs-14 fw-normal mb-0"><a href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit">' + row['ticket_ID'] + '</a></h6>';
					}
				},
				{
					"render": function (data, type, row) {
						return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="#">' + row['name'] + '</a></h6>';
					}
				},
				{
					"render": function (data, type, row) {
						return '<p class="mb-0 badge bg-light text-dark">' + row['type'] + '</p>';
					}
				},
				{ "data": "count" },
				{
					"render": function (data, type, row) {
						return '<ul class="list-progress d-flex gap-3"><li><h6 class="fs-14 fw-semibold mb-1">' + row['open'] + '</h6><p class="fs-13 mb-0">Delivered</p></li><li><h6 class="fs-14 fw-semibold mb-1">' + row['close'] + '</h6><p class="fs-13 mb-0">' + row['close_label'] + '</p></li></ul>';
					}
				},
				{
					"render": function (data, type, row) {
						return '<ul class="avatar-list-stacked avatar-group-sm d-flex align-items-center gap-2"><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="' + row['mem_image1'] + '" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="' + row['mem_image2'] + '" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="' + row['mem_image3'] + '" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0 bg-light fs-10"><a href="#">' + row['mem_count'] + '</a></li></ul>';
					}
				},
				{
					"render": function (data, type, row) {
						if (row['status'] == "0") { var class_name = "success"; var status_name = "Completed" } else if (row['status'] == "1") { var class_name = "warning"; var status_name = "Pending" } else if (row['status'] == "2") { var class_name = "danger"; var status_name = "Bounced" } else if (row['status'] == "3") { var class_name = "teal"; var status_name = "Running" } else { var class_name = "cyan"; var status_name = "Paused" }
						return '<span class="badge badge-pill badge-status bg-' + class_name + '" >' + status_name + '</span>';
					}
				},
				{ "data": "template" },
				{
					"render": function (data, type, row) {
						return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_campaign"><i class="ti ti-trash"></i> Delete</a></div></div>';
					}
				},

			]

		});
	}
});