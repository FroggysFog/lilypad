document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#reason-list')) {
		new DataTable('#reason-list', {
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
						"title" : "Client went silent",
						"created_date" : "25 Sep 2025, 01:22 pm",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "2",
						"si_no" : "",
						"title" : "Don't have the budget",
						"created_date" : "29 Sep 2025, 10:20 pm",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "3",
						"si_no" : "",
						"title" : "Doesn't pick up the phone, doesn't respond",
						"created_date" : "04 Oct 2025, 08:30 am",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "4",
						"si_no" : "",
						"title" : "Lack of expertise",
						"created_date" : "17 Oct 2025, 11:45 am",
						"status" : "1",
						"action" : ""
					},
					{
						"id" : "5",
						"si_no" : "",
						"title" : "Not responsible",
						"created_date" : "26 Oct 2025, 04:10 pm",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "6",
						"si_no" : "",
						"title" : "They couldn't afford our services",
						"created_date" : "08 Nov 2025, 05:23 am",
						"status" : "0",
						"action" : ""
					},
					{
						"id" : "7",
						"si_no" : "",
						"title" : "Went with our competitor",
						"created_date" : "11 Nov 2025, 02:32 pm",
						"status" : "0",
						"action" : ""
					}
			
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
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow d-inline-flex btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_lost_reason"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_lost_reason"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
				
		});
	}
    
});