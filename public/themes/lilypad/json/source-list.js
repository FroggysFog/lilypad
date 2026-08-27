document.addEventListener('DOMContentLoaded', function () {   
    if (document.querySelector('#source_list')) {
		new DataTable('#source_list', {
			searching: false,
			info: false,
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
			initComplete: function(settings, json) {
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
				"title": "Phone Calls",
				"created_date": "25 Jan 2025, 01:22 PM",
				"status": "0"
			},
			{
				"id": 2,
				"title": "Social Media",
				"created_date": "29 Sep 2025, 04:15 pm",
				"status": "1"
			},
			{
				"id": 3,
				"title": "Referral Sites",
				"created_date": "04 Oct 2025, 10:18 am",
				"status": "0"
			},
			{
				"id": 4,
				"title": "Web Analytics",
				"created_date": "17 Oct 2025, 03:31 pm",
				"status": "0"
			},
			{
				"id": 5,
				"title": "Previous Purchases",
				"created_date": "24 Oct 2025, 09:14 pm",
				"status": "0"
			},
			{
				"id": 6,
				"title": "Lead & Opportunity",
				"created_date": "08 Nov 2025, 09:56 am",
				"status": "0"
			},
			{
				"id": 7,
				"title": "Image-based Features",
				"created_date": "14 Nov 2025, 04:19 pm",
				"status": "0"
			},
			{
				"id": 8,
				"title": "Bots",
				"created_date": "23 Nov 2025, 11:14 pm",
				"status": "0"
			},
			{
				"id": 9,
				"title": "Insights",
				"created_date": "10 Dec 2025, 06:43 am",
				"status": "0"
			},
			{
				"id": 10,
				"title": "Commerce",
				"created_date": "25 Dec 2025, 08:17 pm",
				"status": "0"
			}
			],
			columns: [
			{
				"render": function (data, type, row) {
						return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}
			},
			{ "render": function ( data, type, row ){
				return '<span class="title-name">'+row['title']+'</span>';
			}},
			{ data: "created_date" },
			{
				render: function (data, type, row) {
				if (row["status"] == "1") {
					var class_name = "bg-success";
					var status_name = "Active";
				}
				if (row["status"] == "0") {
					var class_name = "bg-success";
					var status_name = "Active";
				} else {
					var class_name = "bg-danger";
					var status_name = "Inactive";
				}
				return (
					'<span class="badge badge-pill badge-status ' +
					class_name +
					'" >' +
					status_name +
					"</span>"
				);
				},
			},

			{
					"render": function (data, type, row) {
						return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow d-inline-flex btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_source"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_source"><i class="ti ti-trash"></i> Delete</a></div></div>';
					}
				}
			],
		});
	} 
});