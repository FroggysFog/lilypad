document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#email-engagement')) {
        new DataTable('#email-engagement', {
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
                    "ticket_ID": "15 Dec 2026",
                    "total_id": "1000",
                    "active_id": "500",
                    "clicks_id": "301",
                    "date_id": "100",
                    "percent_id": "12.9%",
                    "stage": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "ticket_ID": "27 Nov 2026",
                    "total_id": "9000",
                    "active_id": "300",
                    "clicks_id": "200",
                    "date_id": "143",
                    "percent_id": "21.5%",
                    "stage": "1",
                    "Action": ""
                },
                {
                    "id": 3,
                    "ticket_ID": "06 Oct 2026",
                    "total_id": "1000",
                    "active_id": "300",
                    "clicks_id": "203",
                    "date_id": "100",
                    "percent_id": "14.2%",
                    "stage": "1",
                    "Action": ""
                },
                {
                    "id": 4,
                    "ticket_ID": "24 Sep 2026",
                    "total_id": "2000",
                    "active_id": "440",
                    "clicks_id": "350",
                    "date_id": "310",
                    "percent_id": "40.2%",
                    "stage": "1",
                    "Action": ""
                },
                {
                    "id": 5,
                    "ticket_ID": "14 Sep 2026",
                    "total_id": "3000",
                    "active_id": "202",
                    "clicks_id": "193",
                    "date_id": "190",
                    "percent_id": "15.8%",
                    "stage": "0",
                    "Action": ""
                },
                {
                    "id": 6,
                    "ticket_ID": "23 Aug 2026",
                    "total_id": "4000",
                    "active_id": "200",
                    "clicks_id": "160",
                    "date_id": "160",
                    "percent_id": "18.2%",
                    "stage": "1",
                    "Action": ""
                },
                {
                    "id": 7,
                    "ticket_ID": "15 Aug 2026",
                    "total_id": "5000",
                    "active_id": "400",
                    "clicks_id": "303",
                    "date_id": "301",
                    "percent_id": "19.2%",
                    "stage": "0",
                    "Action": ""
                },
                {
                    "id": 8,
                    "ticket_ID": "25 July 2026",
                    "total_id": "4000",
                    "active_id": "600",
                    "clicks_id": "503",
                    "date_id": "400",
                    "percent_id": "18.2%",
                    "stage": "1",
                    "Action": ""
                },
                {
                    "id": 9,
                    "ticket_ID": "09 Jun 2026",
                    "total_id": "3000",
                    "active_id": "700",
                    "clicks_id": "603",
                    "date_id": "400",
                    "percent_id": "51.2%",
                    "stage": "0",
                    "Action": ""
                },
                {
                    "id": 10,
                    "ticket_ID": "15 May 2026",
                    "total_id": "8000",
                    "active_id": "700",
                    "clicks_id": "503",
                    "date_id": "400",
                    "percent_id": "19.2%",
                    "stage": "1",
                    "Action": ""
                }
                ],
            "columns": [
                { "data": "ticket_ID" },
                { "data": "total_id" },
                { "data": "active_id" },
                { "data": "clicks_id" },
                { "data": "date_id" },
                { 
                "render": function (data, type, row) {
                    let class_name = (row.stage === "0") ? "success" : "danger";
                    let status_name = row.percent_id;

                    return '<span class="text-' + class_name + '">' 
                        + status_name + 
                        '</span>';
                }
                },
                
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});