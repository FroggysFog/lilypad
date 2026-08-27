document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#calls-list')) {
		new DataTable('#calls-list', {
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
						"id" : "1",
						"si_no" : "",
						"title" : "Busy",
						"created_date" : "25 Feb 2025, 01:22 PM",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "2",
						"si_no" : "",
						"title" : "No Answer",
						"created_date" : "03 Apr 2025, 09:45 AM",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "3",
						"si_no" : "",
						"title" : "Wrong Number",
						"created_date" : "14 Apr 2025, 11:11 AM",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "4",
						"si_no" : "",
						"title" : "Unavailable",
						"created_date" : "12 May 2025, 01:09 AM",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "5",
						"si_no" : "",
						"title" : "Technical Issue",
						"created_date" : "28 May 2025, 07:08 AM",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "6",
						"si_no" : "",
						"title" : "Bug Report",
						"created_date" : "01 July 2025, 02:15 AM",
						"status" : "1",
						"action" : ""
					},
					{
						"id" : "7",
						"si_no" : "",
						"title" : "Customer Call",
						"created_date" : "20 Jul 2025, 10:25 AM",
						"status" : "1",
						"action" : ""
					},
					{
						"id" : "8",
						"si_no" : "",
						"title" : "Management Call",
						"created_date" : "16 Sep 2025, 02:10 PM",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "9",
						"si_no" : "",
						"title" : "Support Call",
						"created_date" : "10 Oct 2025, 10:15 AM",
						"status" : "1",
						"action" : ""
					},
					{
						"id" : "10",
						"si_no" : "",
						"title" : "Sales Call",
						"created_date" : "01 Nov 2025, 01:32 PM",
						"status" : "0",
						"action" : ""
					},
			
				],
			"columns": [
				{
					"render": function (data, type, row) {
						return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
					}
				},
				{ "render": function ( data, type, row ){
					return '<span class="title-name">'+row['title']+'</span>';
				}},
				{ "data": "created_date" },
				{
					"render": function (data, type, row) {
							if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
				return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
					}
				}, 
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_calls"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_calls"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
				
		});
	}

});