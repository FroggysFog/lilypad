document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#email-marketing')) {
        new DataTable('#email-marketing', {
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
                    "ticket_ID": "Trial Users",
                    "total_id": "301",
                    "active_id": "201",
                    "percent_id": "1.5%",
                    "stage": "0",
                    "date_id": "19 Nov 2026",
                    "Action": ""
                },
                {
                    "id": 2,
                    "ticket_ID": "Promotional Offers",
                    "total_id": "302",
                    "active_id": "202",
                    "percent_id": "2.5%",
                    "stage": "0",
                    "date_id": "12 Nov 2026",
                    "Action": ""
                },
                {
                    "id": 3,
                    "ticket_ID": "Webinar Attendees",
                    "total_id": "303",
                    "active_id": "202",
                    "percent_id": "3.5%",
                    "stage": "0",
                    "date_id": "06 Oct 2026",
                    "Action": ""
                },
                {
                    "id": 4,
                    "ticket_ID": "Monthly Newsletter",
                    "total_id": "504",
                    "active_id": "202",
                    "percent_id": "0.1%",
                    "stage": "0",
                    "date_id": "14 Sep 2026",
                    "Action": ""
                },
                {
                    "id": 5,
                    "ticket_ID": "Industry News",
                    "total_id": "305",
                    "active_id": "202",
                    "percent_id": "0.4%",
                    "stage": "1",
                    "date_id": "23 Aug 2026",
                    "Action": ""
                },
                {
                    "id": 6,
                    "ticket_ID": "Webinar Attendees",
                    "total_id": "306",
                    "active_id": "202",
                    "percent_id": "1.4%",
                    "stage": "1",
                    "date_id": "16 Jul 2026",
                    "Action": ""
                },
                {
                    "id": 7,
                    "ticket_ID": "Trial Users",
                    "total_id": "307",
                    "active_id": "202",
                    "percent_id": "6.8%",
                    "stage": "1",
                    "date_id": "09 Jun 2026",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "Promotional Offers",
                    "total_id": "308",
                    "active_id": "202",
                    "percent_id": "7.2%",
                    "stage": "0",
                    "date_id": "15 May 2026",
                    "Action": ""
                },
                {
                    "id": 9,
                    "ticket_ID": "Industry News",
                    "total_id": "305",
                    "active_id": "202",
                    "percent_id": "5.8%",
                    "stage": "0",
                    "date_id": "19 Apr 2026",
                    "Action": ""
                },
                {
                    "id": 10,
                    "ticket_ID": "Webinar Attendees",
                    "total_id": "310",
                    "active_id": "202",
                    "percent_id": "0.6%",
                    "stage": "0",
                    "date_id": "28 Mar 2026",
                    "Action": ""
                }
                ],
            "columns": [
                { "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-medium"><a href="#">'+row['ticket_ID']+'</a></h6>';
				}}, 
                { "data": "total_id" },
                { "data": "active_id" },
                { 
                "render": function (data, type, row) {
                    let class_name = (row.stage === "0") ? "success" : "danger";
                    let status_name = row.percent_id;

                    return '<span class="text-' + class_name + '">' 
                        + status_name + 
                        '</span>';
                }
                },
                { "data": "date_id" },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});