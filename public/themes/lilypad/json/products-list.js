document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#products-list')) {
        new DataTable('#products-list', {
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
                    "ticket_ID": "#PRD114",
                    "tenat_name": "Barcode Scanner",
                    "subject": "Hardware",
                    "phone": "BARHARD",
                    "data_id": "$7500",
                    "tax": "18",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "ticket_ID": "#PRD115",
                    "tenat_name": "Cyber Security Suite ",
                    "subject": "Cloud",
                    "phone": "CLDPLAN",
                    "data_id": "$2000",
                    "tax": "16",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 3,
                    "ticket_ID": "#PRD116",
                    "tenat_name": "Digital Marketing Pack",
                    "subject": "Security",
                    "phone": "SECSTD",
                    "data_id": "$1600",
                    "tax": "12",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 4,
                    "ticket_ID": "#PRD117",
                    "tenat_name": "Marketing Reporting Tool ",
                    "subject": "Marketing",
                    "phone": "MRKTPKG",
                    "data_id": "$600",
                    "tax": "4",
                    "status": "4",
                    "Action": ""
                },
                {
                    "id": 5,
                    "ticket_ID": "#PRD118",
                    "tenat_name": "Financial Reporting Tool",
                    "subject": "Finance",
                    "phone": "FINREP",
                    "data_id": "$2800",
                    "tax": "6",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 6,
                    "ticket_ID": "#PRD119",
                    "tenat_name": "Logistics Tracking System",
                    "subject": "Logistics",
                    "phone": "LOGTRK",
                    "data_id": "$6955",
                    "tax": "4",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 7,
                    "ticket_ID": "#PRD120",
                    "tenat_name": "User Training Program",
                    "subject": "Training",
                    "phone": "TRNPRO",
                    "data_id": "$4785",
                    "tax": "8",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "#PRD121",
                    "tenat_name": "Annual Maintenance Service",
                    "subject": "Service",
                    "phone": "AMS001",
                    "data_id": "$2145",
                    "tax": "12",
                    "status": "4",
                    "Action": ""
                },
                {
                    "id": 9,
                    "ticket_ID": "#PRD122",
                    "tenat_name": "Technical Support Plan",
                    "subject": "Support",
                    "phone": "SUPSTD",
                    "data_id": "$3652",
                    "tax": "10",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 10,
                    "ticket_ID": "#PRD123",
                    "tenat_name": "Cloud Backup Solution",
                    "subject": "Cloud",
                    "phone": "CLDBKP",
                    "data_id": "$1452",
                    "tax": "16",
                    "status": "0",
                    "Action": ""
                }
                
                ],
            "columns": [
                { "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-normal mb-0"><a href="product-details.html">'+row['ticket_ID']+'</a></h6>';
				}},
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-medium mb-0"><a href="product-details.html" class="d-flex flex-column">' + row['tenat_name'] + '</a></h6>';
                    }
                },
                { "data": "subject" },
                { "data": "phone" },
                { "data": "data_id" },
                { "data": "tax" },
                {
                    "render": function (data, type, row) {
                        var class_name, status_name;
                        if (row['status'] == "0") {
                            class_name = "bg-success";
                            status_name = "Active";
                        } else if (row['status'] == "1") {
                            class_name = "bg-cyan";
                            status_name = "Inactive";
                        } else if (row['status'] == "3") {
                            class_name = "bg-warning";
                            status_name = "Pending";
                        } 
                         else {
                            class_name = "bg-danger";
                            status_name = "Inactive";
                        }
                        
                        return '<span class="badge badge-status ' + class_name + '" >' + status_name + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_product"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="product-details.html"><i class="ti ti-eye text-blue-light"></i> View Details</a></div></div>';
                    }
                }
            ]
        });
    }
});