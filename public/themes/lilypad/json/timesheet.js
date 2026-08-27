document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#timesheet')) {
        new DataTable('#timesheet', {
            "searching": false,
            "info": false,
            "ordering": true,
            "autoWidth": true,
            "language": {
                search: ' ',
                searchPlaceholder: "Search",
                info: "_START_ - _END_ of _TOTAL_ items",
                "lengthMenu": "Show _MENU_ entries",
                paginate: {
                    next: '<i class="ti ti-chevron-right"></i> ',
                    previous: '<i class="ti ti-chevron-left"></i> '
                },
            },
            pagingType: "simple_numbers",
            initComplete: function(settings, json) {
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
                    "id": 1,
                    "ticket_ID": "#TMS0040",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Trip Flow",
                    "customer_image": "assets/img/icons/time-icon-1.svg",
                    "subject": "Configure travel booking",
                    "date_id": "25 Apr 2026",
                    "hours_id": "8.50 hours",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "ticket_ID": "#TMS0039",
                    "customer_name": "Katherine Brooks",
                    "customer_no": "Installer ",
                    "customers_image": "assets/img/profiles/avatar-18.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Connect Hub",
                    "customer_image": "assets/img/icons/time-icon-2.svg",
                    "subject": "Build real time chat module",
                    "date_id": "03 Apr 2025",
                    "hours_id": "6.35 hours",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 3,
                    "ticket_ID": "#TMS0038",
                    "customer_name": "Samantha Reed",
                    "customer_no": "Human Resources ",
                    "customers_image": "assets/img/profiles/avatar-20.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Gig Market",
                    "customer_image": "assets/img/icons/time-icon-3.svg",
                    "subject": "Develop freelancer module",
                    "date_id": "29 Mar 2026",
                    "hours_id": "7.15 hours",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 4,
                    "ticket_ID": "#TMS0037",
                    "customer_name": "William Anderson",
                    "customer_no": "Data Analytics",
                    "customers_image": "assets/img/profiles/avatar-22.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Book Ease",
                    "customer_image": "assets/img/icons/time-icon-4.svg",
                    "subject": "Implement service scheduling",
                    "date_id": "25 Mar 2026",
                    "hours_id": "6.00 hours",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 5,
                    "ticket_ID": "#TMS0036",
                    "customer_name": "Jonathan Mitchell ",
                    "customer_no": "Facility Manager ",
                    "customers_image": "assets/img/profiles/avatar-23.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Retail POS",
                    "customer_image": "assets/img/icons/time-icon-5.svg",
                    "subject": "Develop inventory modules",
                    "date_id": "17 Mar 2026",
                    "hours_id": "6.40 hours",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 6,
                    "ticket_ID": "#TMS0035",
                    "customer_name": "Jennifer Adams",
                    "customer_no": "Financial Officer",
                    "customers_image": "assets/img/profiles/avatar-24.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Hire Nest",
                    "customer_image": "assets/img/icons/time-icon-6.svg",
                    "subject": "Build job postings",
                    "date_id": "08 Mar 2026",
                    "hours_id": "6.35 hours",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 7,
                    "ticket_ID": "#TMS0035",
                    "customer_name": "Alexander Carter",
                    "customer_no": "Project Manager",
                    "customers_image": "assets/img/profiles/avatar-25.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "People Core",
                    "customer_image": "assets/img/icons/time-icon-7.svg",
                    "subject": "Configure payroll rules",
                    "date_id": "20 Feb 2026",
                    "hours_id": "8.35 hours",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "#TMS0034",
                    "customer_name": "Benjamin Harrison",
                    "customer_no": "Team Lead",
                    "customers_image": "assets/img/profiles/avatar-24.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Care Desk",
                    "customer_image": "assets/img/icons/time-icon-8.svg",
                    "subject": "Develop doctor slot",
                    "date_id": "12 Feb 2026",
                    "hours_id": "9.00 hours",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 9,
                    "ticket_ID": "#TMS0033",
                    "customer_name": "Nicholas Wright ",
                    "customer_no": "Supervisor",
                    "customers_image": "assets/img/profiles/avatar-25.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Wash Flow",
                    "customer_image": "assets/img/icons/time-icon-9.svg",
                    "subject": "Test pickup/delivery flow",
                    "date_id": "15 Jan 2026",
                    "hours_id": "9.40 hours",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 10,
                    "ticket_ID": "#TMS0032",
                    "customer_name": "Alexandra Bennett",
                    "customer_no": "Supervisor",
                    "customers_image": "assets/img/profiles/avatar-26.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Sport Venue",
                    "customer_image": "assets/img/icons/time-icon-10.svg",
                    "subject": "Build venue listings",
                    "date_id": "05 Jan 2026",
                    "hours_id": "7.20 hours",
                    "status": "1",
                    "Action": ""
                }
                ],
            "columns": [
                { "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-normal mb-0"><a href="#" data-bs-toggle="modal" data-bs-target="#edit_timesheet">'+row['ticket_ID']+'</a></h6>';
				}},
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="contact-details.html" class="avatar me-2"><img class="img-fluid rounded-circle" src="' + row['customers_image'] + '" alt="User Image"></a><a href="contact-details.html" class="d-flex flex-column">' + row['customer_name'] + ' <span class="text-body fs-13 fw-normal mt-1">' + row['customer_no'] + ' </span></a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="#" class="avatar border rounded-circle p-2 me-2"><img class="img-fluid rounded-circle" src="' + row['customer_image'] + '" alt="User Image"></a><a href="#" class="d-flex flex-column">' + row['project_id'] + '</a></h6>';
                    }
                },
                { "data": "subject" },
                { "data": "date_id" },
                { "data": "hours_id" },
                {
                    "render": function (data, type, row) {
                        var class_name, status_name;
                        if (row['status'] == "0") {
                            class_name = "bg-success";
                            status_name = "Approved";
                        } else if (row['status'] == "1") {
                            class_name = "bg-purple";
                            status_name = "Pending";
                        } else if (row['status'] == "3") {
                            class_name = "bg-warning";
                            status_name = "Pending";
                        } 
                         else {
                            class_name = "bg-purple";
                            status_name = "Pending";
                        }
                        
                        return '<span class="badge badge-status ' + class_name + '" >' + status_name + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_timesheet"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});