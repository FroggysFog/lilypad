document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#categories_list')) {
		new DataTable('#categories_list', {
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
				"title": "Sales Optimization",
				"created_date": "17 Dec 2025",
				"status": "0"
			},
			{
				"id": 2,
				"title": "Automation",
				"created_date": "11 Dec 2025",
				"status": "0"
			},
			{
				"id": 3,
				"title": "Marketing",
				"created_date": "23 Nov 2025",
				"status": "0"
			},
			{
				"id": 4,
				"title": "Implementation",
				"created_date": "12 Nov 2025",
				"status": "0"
			},
			{
				"id": 5,
				"title": "Product Features",
				"created_date": "07 Nov 2025",
				"status": "0"
			},
			{
				"id": 6,
				"title": "Data & Analytics",
				"created_date": "15 Oct 2025",
				"status": "1"
			},
			{
				"id": 7,
				"title": "Customization",
				"created_date": "04 Oct 2025",
				"status": "1"
			},
			{
				"id": 8,
				"title": "Future & Trends",
				"created_date": "29 Sep 2025",
				"status": "0"
			},
			{
				"id": 9,
				"title": "Training & Adoption",
				"created_date": "25 Sep 2025",
				"status": "1"
			},
			{
				"id": 10,
				"title": "Security",
				"created_date": "17 Sep 2025",
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
						return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow d-inline-flex btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_categories"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_categories"><i class="ti ti-trash"></i> Delete</a></div></div>';
					}
				}
			],
		});
	}

});