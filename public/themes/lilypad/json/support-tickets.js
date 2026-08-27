document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#support-tickets')) {
        new DataTable('#support-tickets', {
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
                    "ticket_ID": "#TKT0020",
                    "tenat_name": "Sunburst Tech",
                    "subject": "Login Access Error",
                    "phone": "1234567890",
                    "agent_id": "Robert Johnson",
                    "date_id": "25 Apr 2026",
                    "tag": "0",
                    "rating": "0",
                    "customer_image": "assets/img/profiles/avatar-14.jpg",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "ticket_ID": "#TKT0019",
                    "tenat_name": "Veridian Systems",
                    "subject": "Invoice Mismatch",
                    "phone": "1234567890",
                    "agent_id": "Isabella Cooper",
                    "date_id": "03 Apr 2025",
                    "tag": "1",
                    "rating": "3",
                    "customer_image": "assets/img/profiles/avatar-15.jpg",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 3,
                    "ticket_ID": "#TKT0018",
                    "tenat_name": "Nebula Cloud",
                    "subject": "Payment Timeout",
                    "phone": "9876543210",
                    "agent_id": "Marcus Wright",
                    "date_id": "29 Mar 2026",
                    "tag": "3",
                    "rating": "1",
                    "customer_image": "assets/img/profiles/avatar-16.jpg",
                    "status": "2",
                    "Action": ""
                },
                {
                    "id": 4,
                    "ticket_ID": "#TKT0017",
                    "tenat_name": "Alpha Solutions",
                    "subject": "UI Bug Report",
                    "phone": "1122334455",
                    "agent_id": "Sophia Martinez",
                    "date_id": "25 Mar 2026",
                    "tag": "2",
                    "rating": "2",
                    "customer_image": "assets/img/profiles/avatar-17.jpg",
                    "status": "2",
                    "Action": ""
                },
                {
                    "id": 5,
                    "ticket_ID": "#TKT0016",
                    "tenat_name": "Quantum Leap",
                    "subject": "API Integration Fail",
                    "phone": "5566778899",
                    "agent_id": "Robert Johnson",
                    "date_id": "17 Mar 2026",
                    "tag": "1",
                    "rating": "2",
                    "customer_image": "assets/img/profiles/avatar-01.jpg",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 6,
                    "ticket_ID": "#TKT0015",
                    "tenat_name": "Eco-Stream",
                    "subject": "Dashboard Not Loading",
                    "phone": "4433221100",
                    "agent_id": "Emily Davis",
                    "date_id": "27 Apr 2026",
                    "tag": "3",
                    "rating": "0",
                    "customer_image": "assets/img/profiles/avatar-02.jpg",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 7,
                    "ticket_ID": "#TKT0014",
                    "tenat_name": "Zenith Corp",
                    "subject": "Password Reset Help",
                    "phone": "6677889900",
                    "agent_id": "Isabella Cooper",
                    "date_id": "28 Apr 2026",
                    "tag": "2",
                    "rating": "5",
                    "customer_image": "assets/img/profiles/avatar-03.jpg",
                    "status": "2",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "#TKT0013",
                    "tenat_name": "Velocity Labs",
                    "subject": "Data Export Issue",
                    "phone": "7788990011",
                    "agent_id": "Marcus Wright",
                    "date_id": "28 Apr 2026",
                    "tag": "1",
                    "rating": "1",
                    "customer_image": "assets/img/profiles/avatar-04.jpg",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 9,
                    "ticket_ID": "#TKT0012",
                    "tenat_name": "Titanium Media",
                    "subject": "Subscription Renewal",
                    "phone": "8899001122",
                    "agent_id": "Sophia Martinez",
                    "date_id": "29 Apr 2026",
                    "tag": "0",
                    "rating": "4",
                    "customer_image": "assets/img/profiles/avatar-05.jpg",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 10,
                    "ticket_ID": "#TKT0011",
                    "tenat_name": "Blue Chip Inc",
                    "subject": "Mobile App Crash",
                    "phone": "9900112233",
                    "agent_id": "Emily Davis",
                    "date_id": "29 Apr 2026",
                    "tag": "1",
                    "rating": "0",
                    "customer_image": "assets/img/profiles/avatar-06.jpg",
                    "status": "1",
                    "Action": ""
                }
                ],
            "columns": [
                { "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-normal mb-0"><a href="tenant-ticket-details.html">'+row['ticket_ID']+'</a></h6>';
				}},
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-medium mb-0"><a href="contact-details.html" class="d-flex flex-column">' + row['tenat_name'] + '</a></h6>';
                    }
                },
                { "data": "subject" },
                {
                    "render": function (data, type, row) {
                        var class_name, status_name;
                        if (row['tag'] == "0") {
                            class_name = "badge-soft-teal";
                            status_name = "Authentication";
                        } else if (row['tag'] == "1") {
                            class_name = "badge-soft-cyan";
                            status_name = "Billing";
                        } else if (row['tag'] == "3") {
                            class_name = "badge-soft-pink";
                            status_name = "Performance";
                        } else if (row['tag'] == "4") {
                            class_name = "badge-soft-indigo";
                            status_name = "Reports";
                        }
                         else {
                            class_name = "badge-soft-orange";
                            status_name = "Notifications";
                        }
                        
                        return '<span class="badge badge-tag ' + class_name + '" >' + status_name + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="contact-details.html" class="avatar avatar-xs me-2"><img class="img-fluid rounded-circle" src="' + row['customer_image'] + '" alt="User Image"></a><a href="contact-details.html" class="d-flex flex-column">' + row['agent_id'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                            if(row['rating'] == "0") { var class_name = "badge-soft-danger";var status_name ="High" } 
                            else if (row['rating'] == "1") { var class_name = "badge-soft-success";var status_name ="low"} 
                            else { var class_name = "badge-soft-warning";var status_name ="Medium"}
                            return '<span class="badge border-0 badge-pill badge-status '+class_name+'" ><i class="ti ti-point-filled fs-12 me-1"></i>'+status_name+'</span>';
                    }
                },
                { "data": "date_id" },
                {
                    "render": function (data, type, row) {
                        var class_name, status_name;
                        if (row['status'] == "0") {
                            class_name = "bg-success";
                            status_name = "Resloved";
                        } else if (row['status'] == "1") {
                            class_name = "bg-cyan";
                            status_name = "Open";
                        } else if (row['status'] == "3") {
                            class_name = "bg-warning";
                            status_name = "Pending";
                        } 
                         else {
                            class_name = "bg-danger";
                            status_name = "Closed";
                        }
                        
                        return '<span class="badge badge-status ' + class_name + '" >' + status_name + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_ticket"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="tenant-ticket-details.html"><i class="ti ti-eye text-blue-light"></i> View Details</a></div></div>';
                    }
                }
            ]
        });
    }
});