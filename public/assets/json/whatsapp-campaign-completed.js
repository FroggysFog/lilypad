document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#whatsapp-campaign-list')) {
        new DataTable('#whatsapp-campaign-list', {
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
                    "campaign_ID": "WHA003",
                    "name": "New Feature Update",
                    "audience_segment": "Premium Users",
                    "message_template": "Feature-SMS",
                    "sent_count": "1342",
                    "read_rate": "35.5%",
                    "reply_rate": "10.5%",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 2,
                    "campaign_ID": "WHA007",
                    "name": "Feedback Request",
                    "audience_segment": "All Customers",
                    "message_template": "Alert-SMS",
                    "sent_count": "876",
                    "read_rate": "90.5%",
                    "reply_rate": "40.5%",
                    "status": "0",
                    "Action": ""
                },
                {
                    "id": 3,
                    "campaign_ID": "WHA010",
                    "name": "Event Reminder",
                    "audience_segment": "Event-SMS",
                    "message_template": "Event-SMS",
                    "sent_count": "543",
                    "read_rate": "49.5%",
                    "reply_rate": "30.5%",
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
                        return '<span class="badge bg-light text-dark">' + row['audience_segment'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<p class="mb-0">' + row['message_template'] + '</p>';
                    }
                },
                { "data": "sent_count" },
                {
                    "render": function (data, type, row) {
                        return '<ul class="list-progress d-flex gap-3"><li><h6 class="fs-14 fw-semibold mb-1">' + row['read_rate'] + '</h6><p class="fs-13 mb-0">Read Rate</p></li><li><h6 class="fs-14 fw-semibold mb-1">' + row['reply_rate'] + '</h6><p class="fs-13 mb-0">Reply Rate</p></li></ul>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        if (row['status'] == "0") { var class_name = "success"; var status_name = "Completed" } else if (row['status'] == "1") { var class_name = "warning"; var status_name = "Pending" } else if (row['status'] == "2") { var class_name = "danger"; var status_name = "Bounced" } else if (row['status'] == "3") { var class_name = "teal"; var status_name = "Running" } else { var class_name = "cyan"; var status_name = "Paused" }
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