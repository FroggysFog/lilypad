document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#blog-comment-list')) {
		new DataTable('#blog-comment-list', {
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
						"email" : "robertson@example.com",
						"message" : "Great tips! I’ll definitely try these out with my sales team.",
						"created" : "17 Dec 2025",
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
						"email" : "sharon@example.com",
						"message" : "Automation is a game-changer. Thanks for sharing this.",
						"created" : "11 Dec 2025",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Vaughan Lewis",
						"customer_image" : "assets/img/profiles/avatar-21.jpg",
						"customer_no" : "Senior  Manager",
						"email" : "vaughan12@example.com",
						"message" : "Can you recommend tools that work best for integration?",
						"created" : "23 Nov 2025",
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
						"email" : "jessica13@example.com",
						"message" : "Really helpful guide. Saved me from repeating old errors.",
						"created" : "12 Nov 2025",
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
						"email" : "caroltho3@example.com",
						"message" : "Looking forward to trying out these new features!",
						"created" : "07 Nov 2025",
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
						"email" : "dawnmercha@example.com",
						"message" : "Love the focus on data-driven decisions.",
						"created" : "15 Oct 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 7,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Rachel Hampton",
						"customer_image" : "assets/img/profiles/avatar-24.jpg",
						"customer_no" : "Software Developer",
						"email" : "rachel@example.com",
						"message" : "Customization has really improved our workflow.",
						"created" : "04 Oct 2025",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 8,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Jonelle Curtiss",
						"customer_image" : "assets/img/profiles/avatar-25.jpg",
						"customer_no" : "Supervisor",
						"email" : "jonelle@example.com",
						"message" : "Excited to see how these trends will shape the future.",
						"created" : "29 Sep 2025",
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
						"email" : "jonathan@example.com",
						"message" : "User training is so important. Thanks for the insights.",
						"created" : "25 Sep 2025",
						"status" : "1",
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
						"email" : "brook@example.com",
						"message" : "This is a must-read for anyone handling sensitive data.",
						"created" : "17 Sep 2025",
						"status" : "0",
						"Action" : ""
					}
					
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
						return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="javascript:void(0);" class="avatar me-2"><img class="img-fluid rounded-circle" src="' + row['customer_image'] + '" alt="User Image"></a><a href="javascript:void(0);" class="d-flex flex-column">' + row['customer_name'] + ' <span class="text-body fs-13 fw-normal mt-1">' + row['customer_no'] + ' </span></a></h6>';
					}
				},
				{ "data": "email" },
				{ "data": "message" },
				{ "data": "created" },
				{
					"render": function (data, type, row) {
							if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Publish" } else { var class_name = "bg-danger";var status_name ="Unpublish"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
					}
				},
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_comments"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_comments"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
		});
	}

});