document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#Leads-conversion-time-report')) {
        new DataTable('#Leads-conversion-time-report', {
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
            initComplete: function (settings, json) {
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
                    "sales_id": "#T301",
                    "team_name": "Business Development",
                    "total_members": "50",
                    "total_deals": "40",
                    "target_achieved": "100%",
                    "status": "Excellent"
                },
                {
                    "sales_id": "#T302",
                    "team_name": "Brand & Communications",
                    "total_members": "60",
                    "total_deals": "50",
                    "target_achieved": "20%",
                    "status": "Good"
                },
                {
                    "sales_id": "#T303",
                    "team_name": "Application Development",
                    "total_members": "70",
                    "total_deals": "60",
                    "target_achieved": "85%",
                    "status": "Average"
                },
                {
                    "sales_id": "#T304",
                    "team_name": "Systems Engineering",
                    "total_members": "80",
                    "total_deals": "70",
                    "target_achieved": "30%",
                    "status": "Poor"
                },
                {
                    "sales_id": "#T305",
                    "team_name": "Accounting & Finance",
                    "total_members": "100",
                    "total_deals": "90",
                    "target_achieved": "100%",
                    "status": "Excellent"
                },
                {
                    "sales_id": "#T306",
                    "team_name": "Customer Support",
                    "total_members": "20",
                    "total_deals": "10",
                    "target_achieved": "85%",
                    "status": "Good"
                },
                {
                    "sales_id": "#T307",
                    "team_name": "Product Management",
                    "total_members": "40",
                    "total_deals": "30",
                    "target_achieved": "100%",
                    "status": "Average"
                },
                {
                    "sales_id": "#T308",
                    "team_name": "Business Operations",
                    "total_members": "30",
                    "total_deals": "20",
                    "target_achieved": "40%",
                    "status": "Poor"
                },
                {
                    "sales_id": "#T309",
                    "team_name": "Legal & Compliance",
                    "total_members": "70",
                    "total_deals": "60",
                    "target_achieved": "80%",
                    "status": "Excellent"
                },
                {
                    "sales_id": "#T310",
                    "team_name": "Business Intelligence",
                    "total_members": "60",
                    "total_deals": "50",
                    "target_achieved": "100%",
                    "status": "Good"
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-normal mb-0"><a href="javascript:void(0);">' + row['sales_id'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-medium mb-0">' +
                            '<a href="javascript:void(0);">' + row['team_name'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['total_members'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['total_deals'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        var target_val = parseInt(row['target_achieved']);
                        var badge_class = "badge-soft-success";
                        if (target_val < 50) { badge_class = "badge-soft-danger"; }
                        else if (target_val < 90) { badge_class = "badge-soft-info"; }
                        return '<span class="badge ' + badge_class + '">' + row['target_achieved'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        var status_class = "bg-success";
                        if (row['status'] == "Good") { status_class = "bg-info"; }
                        else if (row['status'] == "Average") { status_class = "bg-warning"; }
                        else if (row['status'] == "Poor") { status_class = "bg-danger"; }
                        return '<span class="badge border-0 badge-pill badge-status ' + status_class + '" >' + row['status'] + '</span>';
                    }
                }
            ]
        });
    }
});