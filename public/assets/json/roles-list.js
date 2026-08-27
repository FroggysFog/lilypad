document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#roles_list')) {
		new DataTable('#roles_list', {
			"searching": false, 
				"info": false,
					"ordering": true,
				"autoWidth": true,
				"language": {
					search: ' ',
					searchPlaceholder: "Search",
					info: "_START_ - _END_ of _TOTAL_ items",
					"lengthMenu":     "Show _MENU_ entries",
					paginate: {
					next: '<i class="ti ti-chevron-right"></i> ',
					previous: '<i class="ti ti-chevron-left"></i> '
				},
					},
				pagingType: "simple_numbers",
				initComplete: (settings, json)=>{
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
				"data":[
					{
						"id" : 1,
						"si_no" : "",
						"roles_name" : "Admin",
						"created" : "25 Sep 2025, 12:12 pm",
						"Action" : ""
					},
					{
						"id" : 2,
						"si_no" : "",
						"roles_name" : "Company Owner",
						"created" : "27 Sep 2025, 07:40 am",
						"Action" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"roles_name" : "Deal Owner",
						"created" : "29 Sep 2025, 08:20 am",
						"Action" : ""
					},
					{
						"id" : 4,
						"si_no" : "",
						"roles_name" : "Project Manager",
						"created" : "25 Sep 2025, 12:12 pm",
						"Action" : ""
					},
					{
						"id" : 5,
						"si_no" : "",
						"roles_name" : "Client",
						"created" : "15 Oct 2025, 06:18 pm",
						"Action" : ""
					},
					{
						"id" : 6,
						"si_no" : "",
						"roles_name" : "Lead",
						"created" : "29 Oct 2025, 03:10 pm",
						"Action" : ""
					}
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "data": "roles_name" },
				{ "data": "created" },
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_role"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="permission.html"><i class="ti ti-shield"></i> Permission</a></div></div>';
				}}
			]
		});
	}

});