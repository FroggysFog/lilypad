document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#leave-balance-summary-report')) {
        new DataTable('#leave-balance-summary-report', {
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
                    "leave_type": "Annual leave",
                    "allocated": "22 Days",
                    "remaining": "20 Days",
                    "used": "2 Days",
                    "pending": "-",
                    "utilization": "100%"
                },
                {
                    "leave_type": "Sick Leave",
                    "allocated": "21 Days",
                    "remaining": "19 Days",
                    "used": "2 Days",
                    "pending": "-",
                    "utilization": "20%"
                },
                {
                    "leave_type": "Casual Leave",
                    "allocated": "20 Days",
                    "remaining": "18 Days",
                    "used": "2 Days",
                    "pending": "-",
                    "utilization": "85%"
                },
                {
                    "leave_type": "Annual Leave",
                    "allocated": "22 Days",
                    "remaining": "16 Days",
                    "used": "6 Days",
                    "pending": "3",
                    "utilization": "30%"
                },
                {
                    "leave_type": "Maternity Leave",
                    "allocated": "23 Days",
                    "remaining": "20 Days",
                    "used": "3 Days",
                    "pending": "2",
                    "utilization": "100%"
                },
                {
                    "leave_type": "Sick Leave",
                    "allocated": "24 Days",
                    "remaining": "20 Days",
                    "used": "4 Days",
                    "pending": "-",
                    "utilization": "85%"
                },
                {
                    "leave_type": "Annual Leave",
                    "allocated": "25 Days",
                    "remaining": "21 Days",
                    "used": "4 Days",
                    "pending": "1",
                    "utilization": "100%"
                },
                {
                    "leave_type": "Sick Leave",
                    "allocated": "26 Days",
                    "remaining": "23 Days",
                    "used": "4 Days",
                    "pending": "-",
                    "utilization": "40%"
                },
                {
                    "leave_type": "Annual Leave",
                    "allocated": "27 Days",
                    "remaining": "25 Days",
                    "used": "4 Days",
                    "pending": "-",
                    "utilization": "80%"
                },
                {
                    "leave_type": "Sick Leave",
                    "allocated": "28 Days",
                    "remaining": "22 Days",
                    "used": "6 Days",
                    "pending": "-",
                    "utilization": "100%"
                }
            ],
            "columns": [
                {
                    "data": "leave_type",
                    "render": function (data, type, row) {
                        return '<span class="text-dark">' + data + '</span>';
                    }
                },
                {
                    "data": "allocated",
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + data + '</span>';
                    }
                },
                {
                    "data": "remaining",
                    "render": function (data, type, row) {
                        return '<span class="fs-14 text-success">' + data + '</span>';
                    }
                },
                {
                    "data": "used",
                    "render": function (data, type, row) {
                        return '<span class="fs-14 text-danger">' + data + '</span>';
                    }
                },
                {
                    "data": "pending",
                    "render": function (data, type, row) {
                        if (data === "-") {
                            return '<span class="fs-14">' + data + '</span>';
                        }
                        return '<span class="badge badge-soft-warning badge-sm">' + data + '</span>';
                    }
                },
                {
                    "data": "utilization",
                    "render": function (data, type, row) {
                        var status_class = "badge-soft-success";
                        if (data === "20%") { status_class = "badge-soft-danger"; }
                        else if (data === "100%") { status_class = "badge-soft-success"; }
                        else if (data === "85%") { status_class = "badge-soft-info"; }
                        else if (data === "30%") { status_class = "badge-soft-danger"; }
                        else if (data === "40%") { status_class = "badge-soft-danger"; }
                        else if (data === "80%") { status_class = "badge-soft-info"; }
                        return '<span class="badge ' + status_class + ' badge-sm">' + data + '</span>';
                    }
                }
            ]
        });
    }
});
