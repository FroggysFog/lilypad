document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#social-campaign-archived')) {
        new DataTable('#social-campaign-archived', {
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
                    "campaign_ID": "SOC001",
                    "name": "CRM Lead Gen",
                    "platform": "Linked In",
                    "objective": "Lead Generation",
                    "start_date": "23 Jul 2026",
                    "end_date": "25 Jul 2026",
                    "status": "3",
                    "Action": ""
                },
                {
                    "id": 2,
                    "campaign_ID": "SOC002",
                    "name": "Product Awareness",
                    "platform": "Facebook",
                    "objective": "Brand Awareness",
                    "start_date": "14 Jun 2026",
                    "end_date": "22 Jun 2026",
                    "status": "1",
                    "Action": ""
                },
                {
                    "id": 4,
                    "campaign_ID": "SOC004",
                    "name": "Retarget Leads",
                    "platform": "Linked In",
                    "objective": "Lead Nurturing",
                    "start_date": "23 May 2026",
                    "end_date": "25 May 2026",
                    "status": "2",
                    "Action": ""
                },
                {
                    "id": 5,
                    "campaign_ID": "SOC005",
                    "name": "New Feature Launch",
                    "platform": "Instagram",
                    "objective": "Engagement",
                    "start_date": "19 Apr 2026",
                    "end_date": "21 Apr 2026",
                    "status": "3",
                    "Action": ""
                },
                {
                    "id": 6,
                    "campaign_ID": "SOC006",
                    "name": "Customer Stories",
                    "platform": "Linked In",
                    "objective": "Trust Building",
                    "start_date": "17 Apr 2026",
                    "end_date": "19 Apr 2026",
                    "status": "4",
                    "Action": ""
                },
                {
                    "id": 8,
                    "campaign_ID": "SOC008",
                    "name": "B2B Outreach",
                    "platform": "Linked In",
                    "objective": "Lead Generation",
                    "start_date": "08 Mar 2026",
                    "end_date": "10 Mar 2026",
                    "status": "4",
                    "Action": ""
                },
                {
                    "id": 9,
                    "campaign_ID": "SOC009",
                    "name": "Seasonal Deals",
                    "platform": "Twitter",
                    "objective": "Promotion",
                    "start_date": "01 Mar 2026",
                    "end_date": "03 Mar 2026",
                    "status": "2",
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
                        if (row['status'] == "0") { var class_name = "success"; var status_name = "Completed" }
                        else if (row['status'] == "1") { var class_name = "warning"; var status_name = "Pending" }
                        else if (row['status'] == "2") { var class_name = "danger"; var status_name = "Bounced" }
                        else if (row['status'] == "3") { var class_name = "teal"; var status_name = "Running" }
                        else { var class_name = "cyan"; var status_name = "Paused" }
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