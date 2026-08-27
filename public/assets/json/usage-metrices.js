document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#usage-metrices')) {
        new DataTable('#usage-metrices', {
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
                    "subject": "Advanced",
                    "phone": "1234567890",
                    "users_id": "50",
                    "date_id": "25 Apr 2026",
                    "storage_id": "16",
                    "limit_id": "20 ",
                    "api_id": "50,350",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "ticket_ID": "#TKT0019",
                    "tenat_name": "Veridian Systems",
                    "subject": "Invoice Mismatch",
                    "phone": "1234567890",
                    "users_id": "40",
                    "date_id": "25 Apr 2026",
                    "storage_id": "65",
                    "limit_id": "100",
                    "api_id": "42,270",
                    "status": "2",
                    "Action": ""
                },
                {
                    "id": 3,
                    "ticket_ID": "#TKT0018",
                    "tenat_name": "Nebula Cloud",
                    "subject": "Payment Timeout",
                    "phone": "9876543210",
                    "users_id": "60",
                    "date_id": "25 Apr 2026",
                    "storage_id": "32",
                    "limit_id": "50",
                    "api_id": "35,800",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 4,
                    "ticket_ID": "#TKT0017",
                    "tenat_name": "Alpha Solutions",
                    "subject": "UI Bug Report",
                    "phone": "1122334455",
                    "users_id": "70",
                    "date_id": "25 Apr 2026",
                    "storage_id": "42",
                    "limit_id": "50",
                    "api_id": "80,145",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 5,
                    "ticket_ID": "#TKT0016",
                    "tenat_name": "Quantum Leap",
                    "subject": "API Integration Fail",
                    "phone": "5566778899",
                    "users_id": "45",
                    "date_id": "25 Apr 2026",
                    "storage_id": "17",
                    "limit_id": "20",
                    "api_id": "26,112",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 6,
                    "ticket_ID": "#TKT0015",
                    "tenat_name": "Eco-Stream",
                    "subject": "Dashboard Not Loading",
                    "phone": "4433221100",
                    "users_id": "35",
                    "date_id": "25 Apr 2026",
                    "storage_id": "26",
                    "limit_id": "50",
                    "api_id": "32,350",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 7,
                    "ticket_ID": "#TKT0014",
                    "tenat_name": "Zenith Corp",
                    "subject": "Password Reset Help",
                    "phone": "6677889900",
                    "users_id": "52",
                    "date_id": "25 Apr 2026",
                    "storage_id": "58",
                    "limit_id": "100",
                    "api_id": "24,578",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "#TKT0013",
                    "tenat_name": "Velocity Labs",
                    "subject": "Data Export Issue",
                    "phone": "7788990011",
                    "users_id": "35",
                    "date_id": "25 Apr 2026",
                    "storage_id": "30",
                    "limit_id": "100",
                    "api_id": "38,148",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 9,
                    "ticket_ID": "#TKT0012",
                    "tenat_name": "Titanium Media",
                    "subject": "Subscription Renewal",
                    "phone": "8899001122",
                    "users_id": "80",
                    "date_id": "25 Apr 2026",
                    "storage_id": "60",
                    "limit_id": "100",
                    "api_id": "92,653",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 10,
                    "ticket_ID": "#TKT0011",
                    "tenat_name": "Blue Chip Inc",
                    "subject": "Mobile App Crash",
                    "phone": "9900112233",
                    "users_id": "35",
                    "date_id": "25 Apr 2026",
                    "storage_id": "14",
                    "limit_id": "20",
                    "api_id": "72,876",
                    "status": "1",
                    "Action": ""
                }
                ],
            "columns": [
                { "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-normal mb-0"><a href="#" data-bs-toggle="modal" data-bs-target="#view_details">'+row['ticket_ID']+'</a></h6>';
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
                        if (row['status'] == "0") {
                            class_name = "bg-success";
                            status_name = "Active";
                        }
                         else {
                            class_name = "bg-danger";
                            status_name = "Inactive";
                        }
                        
                        return '<span class="badge badge-status ' + class_name + '" >' + status_name + '</span>';
                    }
                },
                { "data": "users_id" },
                { "data": "storage_id" },
                { "data": "limit_id" },
                { "data": "api_id" },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#"  data-bs-toggle="modal" data-bs-target="#view_details"><i class="ti ti-eye text-blue-light"></i> View Details</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});