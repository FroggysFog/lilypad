document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#milestone-id')) {
        new DataTable('#milestone-id', {
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
                    "ticket_ID": "#MLT0040",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Trip Flow",
                    "customer_image": "assets/img/icons/time-icon-1.svg",
                    "subject": "2 Milestones",
                    "date_id": "25 Apr 2026",
                    "hours_id": "8.50 hours",
                    "stage": "0",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "ticket_ID": "#MLT0039",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Connect Hub",
                    "customer_image": "assets/img/icons/time-icon-2.svg",
                    "subject": "2 Milestones",
                    "date_id": "25 Apr 2026",
                    "hours_id": "8.50 hours",
                    "stage": "1",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 3,
                    "ticket_ID": "#MLT0038",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Gig Market",
                    "customer_image": "assets/img/icons/time-icon-3.svg",
                    "subject": "3 Milestones",
                    "date_id": "29 Mar 2026",
                    "hours_id": "8.50 hours",
                    "stage": "0",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 4,
                    "ticket_ID": "#MLT0037",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Book Ease",
                    "customer_image": "assets/img/icons/time-icon-4.svg",
                    "subject": "2 Milestones",
                    "date_id": "17 Mar 2026",
                    "hours_id": "8.50 hours",
                    "stage": "0",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 5,
                    "ticket_ID": "#MLT0036",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Retail POS",
                    "customer_image": "assets/img/icons/time-icon-5.svg",
                    "subject": "3 Milestones",
                    "date_id": "10 Mar 2026",
                    "hours_id": "8.50 hours",
                    "stage": "1",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 6,
                    "ticket_ID": "#MLT0035",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Hire Nest",
                    "customer_image": "assets/img/icons/time-icon-6.svg",
                    "subject": "1 Milestones",
                    "date_id": "25 Feb 2026",
                    "hours_id": "8.50 hours",
                    "stage": "0",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 7,
                    "ticket_ID": "#MLT0034",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "People Core",
                    "customer_image": "assets/img/icons/time-icon-7.svg",
                    "subject": "3 Milestones",
                    "date_id": "17 Feb 2026",
                    "hours_id": "8.50 hours",
                    "stage": "3",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "#MLT0033",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Care Desk",
                    "customer_image": "assets/img/icons/time-icon-8.svg",
                    "subject": "2 Milestones",
                    "date_id": "10 Feb 2026",
                    "hours_id": "8.50 hours",
                    "stage": "1",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 9,
                    "ticket_ID": "#MLT0032",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Wash Flow",
                    "customer_image": "assets/img/icons/time-icon-9.svg",
                    "subject": "3 Milestones",
                    "date_id": "02 Feb 2026",
                    "hours_id": "8.50 hours",
                    "stage": "0",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "#MLT0031",
                    "customer_name": "Albert Morgan",
                    "customer_no": "Product Manager",
                    "customers_image": "assets/img/profiles/avatar-14.jpg",
                    "name_id": "Albert Morgan",
                    "project_id": "Sport Venue",
                    "customer_image": "assets/img/icons/time-icon-10.svg",
                    "subject": "2 Milestones",
                    "date_id": "25 Jan 2026",
                    "hours_id": "8.50 hours",
                    "stage": "2",
                    "status": "1",
                    "Action": ""
                }
                ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="#" class="avatar border rounded-circle p-2 me-2"><img class="img-fluid rounded-circle" src="' + row['customer_image'] + '" alt="User Image"></a><a href="#" class="d-flex flex-column">' + row['project_id'] + '</a></h6>';
                    }
                },
                { "data": "ticket_ID" },
                { "data": "subject" },
                { "data": "date_id" },
                {
                    "render": function (data, type, row) {

                        var class_name = "";
                        var status_name = "";
                        var progress_width = 0;

                        // Dynamic logic
                        if (row['stage'] == "0") { 
                            class_name = "success";
                            progress_width = 100;
                            status_name = "100%";
                        } 
                        else if (row['stage'] == "1") {
                            class_name = "warning";
                            progress_width = 60;
                            status_name = "60%";
                        } 
                        else if (row['stage'] == "2") {
                            class_name = "warning";
                            progress_width = 70;
                            status_name = "70%";
                        }
                        else if (row['stage'] == "3") {
                            class_name = "warning";
                            progress_width = 40;
                            status_name = "40%";
                        }

                        return `
                            <div class="pipeline-progress d-flex align-items-center">
                                <div class="progress bg-light" style="width:100px; margin-right:10px;">
                                    <div class="progress-bar bg-${class_name}" 
                                        role="progressbar" 
                                        style="width:${progress_width}%"
                                        aria-valuenow="${progress_width}" 
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                    </div>
                                </div>
                                <span class="text-body">${status_name}</span>
                            </div>
                        `;
                    }
                },
                {
                    "render": function (data, type, row) {
                        var class_name, status_name;
                        if (row['status'] == "0") {
                            class_name = "bg-success";
                            status_name = "Completed";
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
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_milestone"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});