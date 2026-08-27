document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#testimonials_list')) {
        new DataTable('#testimonials_list', {
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
                        "customer_designation" : "Facility Manager",
                        "content" : "Our team cut customer onboarding time by 60% after ",
                        "createdat" : "25 Sep 2025, 01:22pm",
                        "status" : "0",
                        "Action" : ""
                    },
                    {
                        "id" : 2,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Sharon Roy",
                        "customer_image" : "assets/img/profiles/avatar-20.jpg",
                        "customer_designation" : "Installer",
                        "content" : "Incredibly intuitive, and their support is top-notch.",
                        "createdat" : "29 Sep 2025, 08:12 am",
                        "status" : "0",
                        "Action" : ""
                    },
                    {
                        "id" : 3,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Vaughan Lewis",
                        "customer_image" : "assets/img/profiles/avatar-21.jpg",
                        "customer_designation" : "Senior  Manager",
                        "content" : "Everything arrived on time, and I’ve already placed.",
                        "createdat" : "02 Oct 2025, 10:15 am",
                        "status" : "1",
                        "Action" : ""
                    },
                    {
                        "id" : 4,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Jessica Louise",
                        "customer_image" : "assets/img/profiles/avatar-23.jpg",
                        "customer_designation" : "Test Engineer",
                        "content" : "The product quality and customer service blew.",
                        "createdat" : "11 Oct 2025, 02:32 pm",
                        "status" : "1",
                        "Action" : ""
                    },
                    {
                        "id" : 5,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Carol Thomas",
                        "customer_image" : "assets/img/profiles/avatar-16.jpg",
                        "customer_designation" : "UI /UX Designer",
                        "content" : "I was hesitant to shop online, but the product quality",
                        "createdat" : "4 Nov 2025, 04:22 pm",
                        "status" : "0",
                        "Action" : ""
                    },
                    {
                        "id" : 6,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Dawn Mercha",
                        "customer_image" : "assets/img/profiles/avatar-22.jpg",
                        "customer_designation" : "Technician",
                        "content" : "Strategic advice we got from Apex Consulting",
                        "createdat" : "16 Nov 2025, 10:51 pm",
                        "status" : "1",
                        "Action" : ""
                    },
                    {
                        "id" : 7,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Rachel Hampton",
                        "customer_image" : "assets/img/profiles/avatar-24.jpg",
                        "customer_designation" : "Software Developer",
                        "content" : "The confidence and skills to land my first tech job",
                        "createdat" : "25 Nov 2025, 3:43 pm",
                        "status" : "1",
                        "Action" : ""
                    },
                    {
                        "id" : 8,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Jonelle Curtiss",
                        "customer_image" : "assets/img/profiles/avatar-25.jpg",
                        "customer_designation" : "Supervisor",
                        "content" : "They're now a core part of our growth team.",
                        "createdat" : "07 Dec 2025, 11:22 am",
                        "status" : "1",
                        "Action" : ""
                    },
                    {
                        "id" : 9,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Jonathan Smith",
                        "customer_image" : "assets/img/profiles/avatar-26.jpg",
                        "customer_designation" : "Team Lead Dev",
                        "content" : "The instructors genuinely care, and the real-world",
                        "createdat" : "15 Dec 2025, 8:17 am",
                        "status" : "1",
                        "Action" : ""
                    }
                    ,
                    {
                        "id" : 10,
                        "si_no" : "",
                        "select" : "",
                        "customer_name" : "Eric Adams",
                        "customer_image" : "assets/img/profiles/avatar-06.jpg",
                        "customer_designation" : "HR Manager",
                        "content" : "This course gave me the confidence and skills to land.",
                        "createdat" : "29 Dec 2025, 1:22 pm",
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
                    return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="#" class="avatar avatar-rounded me-2"><img src="'+row['customer_image']+'" alt="User Image"></a><a href="javascript:void(0);" class="d-flex flex-column">'+row['customer_name']+'<span class="text-body fw-normal fs-13 d-inline-block mt-1">'+row['customer_designation']+' </span></a></h2>';
                }},
                {
                    "render": function (data, type, row) {
                        let starsHtml = '<div class="set-star rating-select filled">';
                        for (let i = 0; i < 5; i++) {
                        starsHtml += '<i class="ti ti-star-filled fs-16 me-1"></i>';
                        }
                        starsHtml += '</div>';
                        return starsHtml;
                    }
                    },
                    
                { "data": "content" },
                { "data": "createdat" },
                { "render": function ( data, type, row ){
                    if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } if(row['status'] == "1") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
                    return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
                }},
                { "render": function ( data, type, row ){
                    return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#"  data-bs-toggle="modal" data-bs-target="#edit_testimonial"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_testimonial"><i class="ti ti-trash"></i> Delete</a></div></div>';
                }},
                
            ]
                
        });
    }
    
});