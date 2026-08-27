document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#leads_list')) {
		new DataTable('#leads_list', {
				"searching": false, 
				"info": false,
					"ordering": true,
				"autoWidth": true,"autoWidth": true,
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
						"company_name" : "NovaWave LLC",
						"company_image" : "assets/img/icons/company-icon-01.svg",
						"company_address" : "Newyork, USA",
						"phone" : "+1 875455453",
						"email" : "robertson@example.com",
						"created_date" : "25 Sep 2025, 01:22 pm",
						"owner" : "Jami Carlile",
						"owner_image": "assets/img/profiles/avatar-13.jpg",
						"source" : "Paid Social",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 2,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Sharon Roy",
				     	"customer_image" : "assets/img/profiles/avatar-20.jpg",
						"company_name" : "BlueSky Industries",
						"company_image" : "assets/img/icons/company-icon-02.svg",
						"company_address" : "Winchester, KY",
						"phone" : "+1 989757485",
						"email" : "sharon@example.com",
						"created_date" : "29 Sep 2025, 04:15 pm",
						"owner" : "Theresa Nelson",
						"owner_image": "assets/img/profiles/avatar-17.jpg",
						"source" : "Referrals",
						"status" : "2",
						"Action" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Vaughan Lewis",
				    	"customer_image" : "assets/img/profiles/avatar-21.jpg",
						"company_name" : "SilverHawk",
						"company_image" : "assets/img/icons/company-icon-03.svg",
						"company_address" : "Jametown, NY",
						"phone" : "+1 546555455",
						"email" : "vaughan12@example.com",
						"created_date" : "04 Oct 2025, 10:18 am",
						"owner" : "Smith Cooper",
						"owner_image": "assets/img/profiles/avatar-14.jpg",
						"source" : "Campaigns",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 4,
						"si_no" : "",
						"select" : "",
				 		"customer_name" : "Jessica Louise",
					    "customer_image" : "assets/img/profiles/avatar-23.jpg",
						"company_name" : "SummitPeak",
						"company_image" : "assets/img/icons/company-icon-04.svg",
						"company_address" : "Compton, RI",
						"phone" : "+1 454478787",
						"email" : "jessica13@example.com",
						"created_date" : "17 Oct 2025, 03:31 pm",
						"owner" : "Martin Lewis",
						"owner_image": "assets/img/profiles/avatar-20.jpg",
						"source" : "Google",
						"status" : "3",
						"Action" : ""
					},
					{
						"id" : 5,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Carol Thomas",
				    	"customer_image" : "assets/img/profiles/avatar-16.jpg",
						"company_name" : "RiverStone Ventur",
						"company_image" : "assets/img/icons/company-icon-05.svg",
						"company_address" : "Dayton, OH",
						"phone" : "+1 124547845",
						"email" : "caroltho3@example.com",
						"created_date" : "24 Oct 2025, 09:14 pm",
						"owner" : "Newell Egan",
						"owner_image": "assets/img/profiles/avatar-15.jpg",
						"source" : "Paid Social",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 6,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Dawn Mercha",
					    "customer_image" : "assets/img/profiles/avatar-22.jpg",
						"company_name" : "Bright Bridge Grp",
						"company_image" : "assets/img/icons/company-icon-06.svg",
						"company_address" : "Lafayette, LA",
						"phone" : "+1 478845447",
						"email" : "dawnmercha@example.com",
						"created_date" : "08 Nov 2025, 09:56 am",
						"owner" : "Janet Carlson",
						"owner_image": "assets/img/profiles/avatar-04.jpg",
						"source" : "Referrals",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 7,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Rachel Hampton",
					    "customer_image" : "assets/img/profiles/avatar-24.jpg",
						"company_name" : "CoastalStar Co.",
						"company_image" : "assets/img/icons/company-icon-07.svg",
						"company_address" : "Centerville, VA",
						"phone" : "+1 215544845",
						"email" : "rachel@example.com",
						"created_date" : "14 Nov 2025, 04:19 pm",
						"owner" : "Craig Brown",
						"owner_image": "assets/img/profiles/avatar-21.jpg",
						"source" : "Campaigns",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 8,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Jonelle Curtiss",
					    "customer_image" : "assets/img/profiles/avatar-25.jpg",
						"company_name" : "HarborView",
						"company_image" : "assets/img/icons/company-icon-08.svg",
						"company_address" : "Providence, RI",
						"phone" : "+1 121145471",
						"email" : "jonelle@example.com",
						"created_date" : "23 Nov 2025, 11:14 pm",
						"owner" : "Daniel Byrne",
						"owner_image": "assets/img/profiles/avatar-23.jpg",
						"source" : "Google",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 9,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Jonathan Smith",
					    "customer_image" : "assets/img/profiles/avatar-26.jpg",
						"company_name" : "Golden Gate Ltd",
						"company_image" : "assets/img/icons/company-icon-09.svg",
						"company_address" : "Swayzee, IN",
						"phone" : "+1 321454789",
						"email" : "jonathan@example.com",
						"created_date" : "10 Dec 2025, 06:43 am",
						"owner" : "Jami Carlile",
						"owner_image": "assets/img/profiles/avatar-25.jpg",
						"source" : "Paid Social",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 10,
						"si_no" : "",
						"select" : "",
						"customer_name" : "Richard Cooper",
				    	"customer_image" : "assets/img/profiles/avatar-05.jpg",
						"company_name" : "Redwood Inc",
						"company_image" : "assets/img/icons/company-icon-10.svg",
						"company_address" : "Florida City, FL",
						"phone" : "+1 278907145",
						"email" : "brook@example.com",
						"created_date" : "25 Dec 2025, 08:17 pm",
						"owner" : "Theresa Nelson",
						"owner_image": "assets/img/profiles/avatar-26.jpg",
						"source" : "Referrals",
						"status" : "1",
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
				{
					"render": function (data, type, row) {
						return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="leads-details.html" class="avatar me-2"><img class="img-fluid rounded-circle" src="' + row['customer_image'] + '" alt="User Image"></a><a href="leads-details.html" class="d-flex flex-column">' + row['customer_name']  + ' </span></a></h6>';
					}
				},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="company-details.html" class="avatar border rounded p-1 me-2 rounded-circle"><img class="w-auto h-auto" src="'+row['company_image']+'" alt="User Image"></a><a href="company-details.html" class="d-flex flex-column">'+row['company_name']+'<span class="text-body fs-13 mt-1 fw-normal">'+row['company_address']+' </span></a></h6>';
				}},
				{ "data": "phone" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Closed" } else if(row['status'] == "1") { var class_name = "bg-danger";var status_name ="Lost" } else if(row['status'] == "2") { var class_name = "bg-info";var status_name ="Not Contacted"}
					else { var class_name = "bg-warning";var status_name ="Contacted"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},				
				{ "render": function (data, type, row) {
						return '<div class="d-flex align-items-center mb-0"><a href="javascript:void(0);" class="avatar avatar-xs me-2"><img class="img-fluid rounded-circle" src="' + row['owner_image'] + '" alt="User Image"></a>' + row['owner'] + '</div>';
				}},
				{ "data": "created_date" },
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_lead"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="#"><i class="ti ti-clipboard-copy text-blue-light"></i> Clone</a></div></div>';
				}}
			]
		});
	}
    
});