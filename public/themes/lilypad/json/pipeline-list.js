document.addEventListener('DOMContentLoaded', function () { 

    if (document.querySelector('#pipeline-list')) {
		new DataTable('#pipeline-list', {
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
						"name" : "Sales",
						"deal_value" : "$4,50,664",
						"no_deal" : "315",
						"stage" : "0",
						"createdat" : "25 Sep 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 2,
						"si_no" : "",
						"name" : "Marketing",
						"deal_value" : "$3,12,893",
						"no_deal" : "447",
						"stage" : "0",
						"createdat" : "29 Sep 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"name" : "Email",
						"deal_value" : "$2,89,274",
						"no_deal" : "654",
						"stage" : "1",
						"createdat" : "15 Oct 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 4,
						"si_no" : "",
						"name" : "Chats",
						"deal_value" : "$1,59,326",
						"no_deal" : "768",
						"stage" : "0",
						"createdat" : "29 Oct 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 5,
						"si_no" : "",
						"name" : "Operational",
						"deal_value" : "$2,90,173",
						"no_deal" : "142",
						"stage" : "0",
						"createdat" : "03 Nov 2025",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 6,
						"si_no" : "",
						"name" : "Collaborative",
						"deal_value" : "$4,51,417",
						"no_deal" : "315",
						"stage" : "2",
						"createdat" : "17 Nov 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 7,
						"si_no" : "",
						"name" : "Differentiate",
						"deal_value" : "$3,17,589",
						"no_deal" : "478",
						"stage" : "3",
						"createdat" : "23 Nov 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 8,
						"si_no" : "",
						"name" : "Interact ",
						"deal_value" : "$1,69,146",
						"no_deal" : "664",
						"stage" : "4",
						"createdat" : "09 Dec 2025",
						"status" : "1",
						"Action" : ""
					}
					
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<span class="title-name">'+row['name']+'</span>';
				}},
				{ "data": "deal_value" },
				{ "data": "no_deal" },
				{
					"render": function (data, type, row) {
							if(row['stage'] == "0") { var class_name = "success";var status_name ="Win" } else if(row['stage'] == "1") { var class_name = "violet";var status_name ="In Pipeline" } else if(row['stage'] == "2") { var class_name = "green";var status_name ="Conversation"} else if(row['stage'] == "2") { var class_name = "info";var status_name ="Follow Up"} else  { var class_name = "danger";var status_name ="Lost"}
					return '<div class="pipeline-progress d-flex align-items-center"><div class="progress"><div class="progress-bar progress-bar-'+class_name+'" role="progressbar"></div></div><span>'+status_name+'</span></div>';
					}
				},                      
				{ "data": "createdat" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } if(row['status'] == "1") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}},
				
			]
				
		});
	}
});