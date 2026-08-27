document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#social-campaign-completed')) {
        new DataTable('#social-campaign-completed', {
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
            initComplete: (settings, json) => {
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
            "data": [
                {
                    "id": 1,
                    "campaign_ID": "SOC003",
                    "name": "Demo Signup Drive",
                    "platform": "Twitter",
                    "objective": "Conversion",
                    "start_date": "04 Jun 2026",
                    "end_date": "08 Jun 2026",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "campaign_ID": "SOC007",
                    "name": "Referral Campaign",
                    "platform": "Facebook",
                    "objective": "Lead Generation",
                    "start_date": "11 Mar 2026",
                    "end_date": "13 Mar 2026",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 3,
                    "campaign_ID": "SOC010",
                    "name": "Influencer Promo",
                    "platform": "Instagram",
                    "objective": "Brand Awareness",
                    "start_date": "20 Feb 2026",
                    "end_date": "22 Feb 2026",
                    "status": "0",
                    "Action": ""
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-normal mb-0"><a href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit">' + row['campaign_ID'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-medium mb-0"><a href="#">' + row['name'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<p class="mb-0">' + row['platform'] + '</p>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<p class="mb-0">' + row['objective'] + '</p>';
                    }
                },
                { "data": "start_date" },
                { "data": "end_date" },
                {
                    "render": function (data, type, row) {
                        var class_name = "success"; var status_name = "Completed";
                        return '<span class="badge badge-pill badge-status bg-' + class_name + '" >' + status_name + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_campaign"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                },

            ]

        });
    }
});