document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#delete_request')) {
		new DataTable('#delete_request', {
			"searching": false, 
			"info": false,
				"ordering": true,
				"autoWidth": true,
			"language": {
				search: ' ',
				searchPlaceholder: "Search",
				info: "_START_ - _END_ of _TOTAL_ items",
				lengthMenu:     "Show _MENU_ entries",
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
                        "created" : "25 Sep 2025, 12:12 pm",
                        "delete_request": "25 Sep 2025, 12:12 pm",
                        "reason": "No longer using service",
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
                        "created" : "27 Sep 2025, 07:40 am",
                        "delete_request" : "27 Sep 2025, 07:40 am",
                        "reason": "Privacy concerns",
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
                        "created" : "29 Sep 2025, 08:20 am",
                        "delete_request": "29 Sep 2025, 08:20 am",
                        "reason": "Duplicate account",
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
                        "created" : "25 Sep 2025, 12:12 pm",
                        "delete_request": "25 Sep 2025, 12:12 pm",
                        "reason": "Technical issues",
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
                        "created" : "02 Oct 2025, 10:10 am",
                        "delete_request": "02 Oct 2025, 10:10 am",
                        "reason": "Receiving too many emails",
                        "status" : "1",
                        "Action" : ""
                    },
                    {
                        "id" : 6,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Dawn Mercha",
                        "customer_image" : "assets/img/profiles/avatar-22.jpg",
                        "customer_no" : "Technician",
                        "created" : "17 Oct 2025, 04:25 pm",
                        "delete_request": "17 Oct 2025, 04:25 pm",
                        "reason": "Privacy concerns",
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
                        "created" : "28 Oct 2025, 07:16 am",
                        "delete_request": "28 Oct 2025, 07:16 am",
                        "reason": "Duplicate account",
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
                        "created" : "08 Nov 2025, 06:10 am",
                        "delete_request": "08 Nov 2025, 06:10 am",
                        "reason": "No longer using service",
                        "status" : "1",
                        "Action" : ""
                    },
                    {
                        "id" : 9,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Jonathan Smith",
                        "customer_image" : "assets/img/profiles/avatar-26.jpg",
                        "customer_no" : "Team Lead Dev",
                        "created" : "15 Nov 2025, 11:50 am",
                        "delete_request": "15 Nov 2025, 11:50 am",
                        "reason": "No longer using service",
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
                        "created" : "25 Nov 2025, 06:34 pm",
                        "delete_request": "25 Nov 2025, 06:34 pm",
                        "reason": "Privacy concerns",
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
                { "render": function ( data, type, row ){
                    return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="javascript:void(0);" class="avatar avatar-rounded me-2"><img src="'+row['customer_image']+'" alt="User Image"></a><a href="javascript:void(0);" class="d-flex flex-column">'+row['customer_name']+' <span class="text-body fs-13 fw-normal d-inline-block mt-1">'+row['customer_no']+' </span></a></h2>';
                }},
                { "data": "created" },
                { "data": "delete_request" },
                { "data": "reason" },
                { "render": function ( data, type, row ){
                if(row['status'] == "0") { var class_name = "bg-danger";var status_name ="Rejected" } else { var class_name = "bg-warning";var status_name ="Pending"}
                return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
                }},
                { "render": function ( data, type, row ){
                    return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#approve_request"><i class="ti ti-check"></i> Approve</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#reject_request"><i class="ti ti-x"></i> Reject</a></div></div>';
                }}
            ]
        });
	}
});