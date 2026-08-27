document.addEventListener('DOMContentLoaded', function () { 

    if (document.querySelector('#emailcampaign-list')) {
		new DataTable('#emailcampaign-list', {
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
						"id" : 2,
						"ticket_ID" : "EC002",
						"name" : "Feature Launch Update",
						"type" : "Product Update",
						"template" : "Update-Template-01",
						"count" : "1421",
						"mem_image1" : "assets/img/profiles/avatar-04.jpg",
						"mem_image2": "assets/img/profiles/avatar-05.jpg",
						"mem_image3": "assets/img/profiles/avatar-06.jpg",
						"start_date" : "25 Sep 2025",
						"end_date" : "29 Sep 2025",
						"created_date" : "25 Sep 2025",
						"open" : "30.5%",
						"close" : "40.5%",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 4,
						"ticket_ID" : "EC006",
						"name" : " Upgrade to Pro",
						"type" : "Free Signups",
						"template" : "Welcome-Template-01",
						"count" : "1342",
						"mem_image1" : "assets/img/profiles/avatar-10.jpg",
						"mem_image2": "assets/img/profiles/avatar-11.jpg",
						"mem_image3": "assets/img/profiles/avatar-12.jpg",
						"start_date" : "25 Sep 2025",
						"end_date" : "29 Sep 2025",
						"created_date" : "25 Sep 2025",
						"open" : "88.5%",
						"close" : "11.5%",
						"status" : "3",
						"Action" : ""
					},
					{
						"id" : 6,
						"ticket_ID" : "EC006",
						"name" : " We Miss You",
						"type" : "Inactive Users",
						"template" : "Reengage-Template-01",
						"count" : "987",
						"mem_image1" : "assets/img/profiles/avatar-16.jpg",
						"mem_image2": "assets/img/profiles/avatar-17.jpg",
						"mem_image3": "assets/img/profiles/avatar-18.jpg",
						"start_date" : "25 Sep 2025",
						"end_date" : "29 Sep 2025",
						"created_date" : "25 Sep 2025",
						"open" : "90.5%",
						"close" : "10.5%",
						"status" : "4",
						"Action" : ""
					},
					{
						"id" : 7,
						"ticket_ID" : "EC007",
						"name" : " Webinar Invitation",
						"type" : "Business Leads",
						"template" : "Event-Template-02",
						"count" : "876",
						"mem_image1" : "assets/img/profiles/avatar-19.jpg",
						"mem_image2": "assets/img/profiles/avatar-20.jpg",
						"mem_image3": "assets/img/profiles/avatar-21.jpg",
						"start_date" : "25 Sep 2025",
						"end_date" : "29 Sep 2025",
						"created_date" : "25 Sep 2025",
						"open" : "90.5%",
						"close" : "15.5%",
						"status" : "2",
						"Action" : ""
					},
					{
						"id" : 8,
						"ticket_ID" : "EC008",
						"name" : " Webinar Invitation",
						"type" : "Lifecycle ",
						"template" : "Lifecycle-Template-01",
						"count" : "876",
						"mem_image1" : "assets/img/profiles/avatar-22.jpg",
						"mem_image2": "assets/img/profiles/avatar-23.jpg",
						"mem_image3": "assets/img/profiles/avatar-24.jpg",
						"start_date" : "25 Sep 2025",
						"end_date" : "29 Sep 2025",
						"created_date" : "25 Sep 2025",
						"open" : "48.5%",
						"close" : "75.5%",
						"status" : "3",
						"Action" : ""
					}
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-normal mb-0"><a href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit">'+row['ticket_ID']+'</a></h6>';
				}},
                { "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="#">'+row['name']+'</a></h6>';
				}},
				{ "data": "type" },
				{ "data": "template" },
				{ "data": "count" },
				{ "render": function ( data, type, row ){
					return '<ul class="list-progress d-flex gap-3"><li><h6 class="fs-14 fw-semibold mb-1">'+row['open']+'</h6><p class="fs-13 mb-0">Opened</p></li><li><h6 class="fs-14 fw-semibold mb-1">'+row['close']+'</h6><p class="fs-13 mb-0">Closed</p></li></ul>';
				}},
				{
					"render": function (data, type, row) {
					return '<ul class="avatar-list-stacked avatar-group-sm d-flex align-items-center gap-2"><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="'+row['mem_image1']+'" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="'+row['mem_image2']+'" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="'+row['mem_image3']+'" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0 bg-light fs-10"><a href="#">3+</a></li></ul>';
					}
				},               			
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "success";var status_name ="Completed" } else if(row['status'] == "1") { var class_name = "warning";var status_name ="Pending" } else if(row['status'] == "2") { var class_name = "danger";var status_name ="Bounced" } else if(row['status'] == "3") { var class_name = "teal";var status_name ="Running" } else { var class_name = "cyan";var status_name ="Paused"}
					return '<span class="badge badge-pill badge-status bg-'+class_name+'" >'+status_name+'</span>';
				}},           
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_campaign"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}},
				
			]
				
		});
	}
});