document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#activity-task')) {
		new DataTable('#activity-task', {
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
						"id" : 4,
						"checkbox": "",
						"title" : "Store and manage contact data",
						"due_date" : "19 Oct 2025, 02:35 pm",
						"owner" : "Craig Brown",
						"owner_image": "assets/img/profiles/avatar-21.jpg",
						"created_date" : "14 Oct 2025, 01:25 pm",
						"status" : "2",
						"action": ""
					},
					{
						"id" : 7,
						"checkbox": "",
						"title" : "Built landing pages",
						"due_date" : "25 Nov 2025, 01:40 pm",
						"owner" : "Daniel Byrne",
						"owner_image": "assets/img/profiles/avatar-23.jpg",
						"created_date" : "20 Nov 2025, 08:20 am",
						"status" : "2",
						"action": ""
					}
			
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "data": "title" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "badge badge-soft-info border-0";var status_name ="Meeting";var icon_class_name = "user-share" } else if(row['status'] == "1") { var class_name = "badge badge-soft-warning border-0";var status_name ="Email";var icon_class_name = "mail" } else if(row['status'] == "2") { var class_name = "badge badge-soft-danger border-0";var status_name ="Task";var icon_class_name = "subtask" } else { var class_name = "badge badge-soft-success border-0";var status_name ="Calls";var icon_class_name = "phone" }
					return '<span class="badge activity-badge '+class_name+'" ><i class="ti ti-'+icon_class_name+' me-1"></i>'+status_name+'</span>';
				}},    
				{ "data": "due_date" },
				{ "render": function (data, type, row) {
                    return '<div class="d-flex align-items-center mb-0"><a href="javascript:void(0);" class="avatar avatar-xss me-2"><img class="img-fluid rounded-circle" src="' + row['owner_image'] + '" alt="User Image"></a>' + row['owner'] + '</div>';
				}},
				{ "data": "created_date" },
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_activity"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}},
			]
		});
	}

});