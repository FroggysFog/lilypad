document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#manage-users-list')) {
		new DataTable('#manage-users-list', {
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
						"customer_name" : "Darlee Robertson",
						"customer_image" : "assets/img/profiles/avatar-19.jpg",
						"customer_no" : "Facility Manager",
						"phone" : "1234567890",
						"email" : "robertson@example.com",
						"location" : "Germany",
						"created" : "25 Sep 2025, 12:12 pm",
						"last_activity": "2 mins ago",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 2,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Sharon Roy",
						"customer_image" : "assets/img/profiles/avatar-20.jpg",
						"customer_no" : "Installer",
						"phone" : "+1 989757485",
						"email" : "sharon@example.com",
						"location" : "USA",
						"created" : "27 Sep 2025, 07:40 am",
						"last_activity": "5 mins ago",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Vaughan Lewis",
						"customer_image" : "assets/img/profiles/avatar-21.jpg",
						"customer_no" : "Senior  Manager",
						"phone" : "+1 546555455",
						"email" : "vaughan12@example.com",
						"location" : "Canada",
						"created" : "29 Sep 2025, 08:20 am",
						"last_activity": "2 days ago",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 4,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Jessica Louise",
						"customer_image" : "assets/img/profiles/avatar-23.jpg",
						"customer_no" : "Test Engineer",
						"phone" : "+1 454478787",
						"email" : "jessica13@example.com",
						"location" : "India",
						"created" : "25 Sep 2025, 12:12 pm",
						"last_activity": "2 mins ago",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 5,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Carol Thomas",
						"customer_image" : "assets/img/profiles/avatar-16.jpg",
						"customer_no" : "UI /UX Designer",
						"phone" : "+1 124547845",
						"email" : "caroltho3@example.com",
						"location" : "China",
						"created" : "02 Oct 2025, 10:10 am",
						"last_activity": "Online",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 6,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Dawn Mercha",
						"customer_image" : "assets/img/profiles/avatar-22.jpg",
						"customer_no" : "Technician",
						"phone" : "+1 478845447",
						"email" : "dawnmercha@example.com",
						"location" : "Martin Lewis",
						"created" : "17 Oct 2025, 04:25 pm",
						"last_activity": "3 days ago",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 7,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Rachel Hampton",
						"customer_image" : "assets/img/profiles/avatar-24.jpg",
						"customer_no" : "Software Developer",
						"phone" : "+1 215544845",
						"email" : "rachel@example.com",
						"location" : "Indonesia",
						"created" : "28 Oct 2025, 07:16 am",
						"last_activity": "10 days ago",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 8,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Jonelle Curtiss",
						"customer_image" : "assets/img/profiles/avatar-25.jpg",
						"customer_no" : "Supervisor",
						"phone" : "+1 121145471",
						"email" : "jonelle@example.com",
						"location" : "Cuba",
						"created" : "08 Nov 2025, 06:10 am",
						"last_activity": "1 week go",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 9,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Jonathan Smith",
						"customer_image" : "assets/img/profiles/avatar-26.jpg",
						"customer_no" : "Team Lead Dev",
						"phone" : "+1 321454789",
						"email" : "jonathan@example.com",
						"location" : "Isreal",
						"created" : "15 Nov 2025, 11:50 am",
						"last_activity": "1 day ago",
						"status" : "0",
						"Action" : ""
					}
					,
					{
						"id" : 10,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Brook Carter",
						"customer_image" : "assets/img/profiles/avatar-01.jpg",
						"customer_no" : "Team Lead Dev ",
						"phone" : "+1 278907145",
						"email" : "brook@example.com",
						"location" : "Colombia",
						"created" : "25 Nov 2025, 06:34 pm",
						"last_activity": "8 mins ago",
						"status" : "0",
						"Action" : ""
					}
					
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select"><i class="ti ti-star-filled fs-16"></i></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="javascript:void(0);" class="avatar avatar-rounded me-2"><img src="'+row['customer_image']+'" alt="User Image"></a><a href="javascript:void(0);" class="d-flex flex-column">'+row['customer_name']+' <span class="text-body fs-13 mt-1 d-inline-block fw-normal">'+row['customer_no']+' </span></a></h6>';
				}},
				{ "data": "phone" },
				{ "data": "email" },
				{ "data": "created" },
				{ "data": "last_activity" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_contact"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
		});
	}
});