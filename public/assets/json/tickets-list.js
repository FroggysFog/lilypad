document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#tickets-list')) {
		new DataTable('#tickets-list', {
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
						"select" : "",
						"ticket_id" : "#TK0020",
						"subject" : "Support for theme",
						"assigned_name" : "Richard Bennett",
						"assigned_image" : "assets/img/profiles/avatar-02.jpg",
						"created" : "25 Jan 2025, 01:22 PM",
						"customer_name" : "Darlee Robertson",
						"customer_image" : "assets/img/profiles/avatar-19.jpg",
						"customer_no" : "Facility Manager",
						"priority" : "1",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 2,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0019",
						"subject" : "verify your email",
						"assigned_name" : "Elizabeth Collins",
						"assigned_image" : "assets/img/profiles/avatar-01.jpg",
						"created" : "03 Feb 2025, 09:45 AM",
						"customer_name" : "Sharon Roy",
						"customer_image" : "assets/img/profiles/avatar-20.jpg",
						"customer_no" : "Installer",
						"priority" : "0",
						"status" : "3",
						"Action" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0018",
						"subject" : "Calling for help",
						"assigned_name" : "Michel Dubois",
						"assigned_image" : "assets/img/profiles/avatar-04.jpg",
						"created" : "14 Mar 2025, 06:10 PM",
						"customer_name" : "Vaughan Lewis",
						"customer_image" : "assets/img/profiles/avatar-21.jpg",
						"customer_no" : "Senior  Manager",
						"priority" : "2",
						"status" : "2",
						"Action" : ""
					},
					{
						"id" : 4,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0017",
						"subject" : "Management",
						"assigned_name" : "Esther Williams",
						"assigned_image" : "assets/img/profiles/avatar-03.jpg",
						"created" : "29 Apr 2025, 11:00 AM",
						"customer_name" : "Jessica Louise",
						"customer_image" : "assets/img/profiles/avatar-23.jpg",
						"customer_no" : "Test Engineer",
						"priority" : "1",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 5,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0016",
						"subject" : "Calling for help",
						"assigned_name" : "Wilson Clarke",
						"assigned_image" : "assets/img/profiles/avatar-05.jpg",
						"created" : "07 May 2025, 04:35 PM",
						"customer_name" : "Carol Thomas",
						"customer_image" : "assets/img/profiles/avatar-16.jpg",
						"customer_no" : "UI /UX Designer",
						"priority" : "0",
						"status" : "3",
						"Action" : ""
					},
					{
						"id" : 6,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0015",
						"subject" : "Support for theme",
						"assigned_name" : "Walter Thompson",
						"assigned_image" : "assets/img/profiles/avatar-06.jpg",
						"created" : "18 Jun 2025, 08:20 AM",
						"customer_name" : "Dawn Mercha",
						"customer_image" : "assets/img/profiles/avatar-22.jpg",
						"customer_no" : "Technician",
						"priority" : "2",
						"status" : "2",
						"Action" : ""
					},
					{
						"id" : 7,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0014",
						"subject" : "Password Reset",
						"assigned_name" : "Noah Mitchell",
						"assigned_image" : "assets/img/profiles/avatar-07.jpg",
						"created" : "18 Apr 2025, 08:00 AM",
						"customer_name" : "Alexander Carter",
						"customer_image" : "assets/img/profiles/avatar-27.jpg",
						"customer_no" : "Project Manager",
						"priority" : "1",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 8,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0013",
						"subject" : "Error 502 on Dashboard",
						"assigned_name" : "Mason Hayes",
						"assigned_image" : "assets/img/profiles/avatar-24.jpg",
						"created" : "05 Feb 2025, 10:45 AM",
						"customer_name" : "Benjamin Harrison",
						"customer_image" : "assets/img/profiles/avatar-16.jpg",
						"customer_no" : "Team Lead",
						"priority" : "0",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 9,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0012",
						"subject" : "Plan Upgrade Inquiry",
						"assigned_name" : "Ron Thompson",
						"assigned_image" : "assets/img/profiles/avatar-25.jpg",
						"created" : "15 Jan 2025, 02:02 PM",
						"customer_name" : "Nicholas Wright",
						"customer_image" : "assets/img/profiles/avatar-20.jpg",
						"customer_no" : "Supervisor",
						"priority" : "2",
						"status" : "3",
						"Action" : ""
					},
					{
						"id" : 10,
						"si_no" : "",
						"select" : "",
						"ticket_id" : "#TK0011",
						"subject" : "Event Collaboration Request",
						"assigned_name" : "James Bennett",
						"assigned_image" : "assets/img/profiles/avatar-10.jpg",
						"created" : "12 Mar 2025, 08:00 PM",
						"customer_name" : "Alexandra Bennett",
						"customer_image" : "assets/img/profiles/avatar-26.jpg",
						"customer_no" : "Marketing",
						"priority" : "1",
						"status" : "2",
						"Action" : ""
					},
				],
			"columns": [
				{
					"render": function (data, type, row) {
						return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
					}
				},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select"><i class="ti ti-star-filled"></i></div>';
				}},
				{
					"render": function (data, type, row) {
						return '<a href="ticket-details.html">'+ row['ticket_id'] +'</a>';
					}
				},
				{ "data": "subject" },
				{
					"render": function (data, type, row) {
						return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="javascript:void(0);" class="avatar avatar-xs me-2"><img class="img-fluid rounded-circle" src="' + row['assigned_image'] + '" alt="User Image"></a><a href="javascript:void(0);" class="d-flex flex-column">' + row['assigned_name'] + '</a></h6>';
					}
				},
				{ "data": "created" },
				{
					"render": function (data, type, row) {
						return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="javascript:void(0);" class="avatar me-2"><img class="img-fluid rounded-circle" src="' + row['customer_image'] + '" alt="User Image"></a><a href="javascript:void(0);" class="d-flex flex-column">' + row['customer_name'] + ' <span class="text-body fs-13 fw-normal mt-1">' + row['customer_no'] + ' </span></a></h6>';
					}
				},
				{ "render": function ( data, type, row ){
					if(row['priority'] == "0") { var class_name = "badge-soft-warning";var status_name ="Medium" }else if(row['priority'] == "1") { var class_name = "badge-soft-success";var status_name ="Low" } else { var class_name = "badge-soft-danger";var status_name ="High"}
					return '<span class="badge badge-tag '+class_name+'" >'+status_name+'</span>';
				}},
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Resolved" }else if(row['status'] == "1") { var class_name = "bg-danger";var status_name ="Closed" }else if(row['status'] == "2") { var class_name = "bg-warning";var status_name ="Pending" } else { var class_name = "bg-info";var status_name ="Open"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_ticket"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_ticket"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
		});
	}

});