document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#attendance-summary-report')) {
        new DataTable('#attendance-summary-report', {
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
                    "period": "25 Apr 2026",
                    "total_working_days": "22 Days",
                    "present_days": "20 Days",
                    "absent_days": "2 Days",
                    "late_entries": "5 Times",
                    "average_work_hours": "8.5h",
                    "attendance_rate": "100%"
                },
                {
                    "period": "03 Apr 2025",
                    "total_working_days": "21 Days",
                    "present_days": "19 Days",
                    "absent_days": "2 Days",
                    "late_entries": "1 time",
                    "average_work_hours": "8.4h",
                    "attendance_rate": "20%"
                },
                {
                    "period": "29 Mar 2026",
                    "total_working_days": "20 Days",
                    "present_days": "18 Days",
                    "absent_days": "2 Days",
                    "late_entries": "1 time",
                    "average_work_hours": "8.3h",
                    "attendance_rate": "85%"
                },
                {
                    "period": "25 Mar 2026",
                    "total_working_days": "22 Days",
                    "present_days": "16 Days",
                    "absent_days": "6 Days",
                    "late_entries": "3 Times",
                    "average_work_hours": "8.2h",
                    "attendance_rate": "30%"
                },
                {
                    "period": "17 Mar 2026",
                    "total_working_days": "23 Days",
                    "present_days": "20 Days",
                    "absent_days": "3 Days",
                    "late_entries": "3 Times",
                    "average_work_hours": "8.1h",
                    "attendance_rate": "100%"
                },
                {
                    "period": "08 Mar 2026",
                    "total_working_days": "24 Days",
                    "present_days": "20 Days",
                    "absent_days": "4 Days",
                    "late_entries": "5 Times",
                    "average_work_hours": "8.0h",
                    "attendance_rate": "85%"
                },
                {
                    "period": "20 Feb 2026",
                    "total_working_days": "25 Days",
                    "present_days": "21 Days",
                    "absent_days": "4 Days",
                    "late_entries": "3 Times",
                    "average_work_hours": "8.9h",
                    "attendance_rate": "100%"
                },
                {
                    "period": "12 Feb 2026",
                    "total_working_days": "26 Days",
                    "present_days": "23 Days",
                    "absent_days": "4 Days",
                    "late_entries": "5 Times",
                    "average_work_hours": "8.8h",
                    "attendance_rate": "40%"
                },
                {
                    "period": "15 Jan 2026",
                    "total_working_days": "27 Days",
                    "present_days": "25 Days",
                    "absent_days": "4 Days",
                    "late_entries": "5 Times",
                    "average_work_hours": "8.4h",
                    "attendance_rate": "80%"
                },
                {
                    "period": "05 Jan 2026",
                    "total_working_days": "28 Days",
                    "present_days": "22 Days",
                    "absent_days": "6 Days",
                    "late_entries": "5 Times",
                    "average_work_hours": "8.5h",
                    "attendance_rate": "100%"
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['period'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['total_working_days'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14 text-success">' + row['present_days'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14 text-danger">' + row['absent_days'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        var late_class = "bg-danger";
                        if (row['late_entries'] == "1 time") { late_class = "bg-info"; }
                        else if (row['late_entries'] == "3 Times") { late_class = "bg-warning"; }
                        return '<span class="badge badge-pill badge-status ' + late_class + '" >' + row['late_entries'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['average_work_hours'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        var att_class = "badge-soft-success";
                        if (row['attendance_rate'] == "20%" || row['attendance_rate'] == "30%" || row['attendance_rate'] == "40%") { att_class = "badge-soft-danger"; }
                        else if (row['attendance_rate'] == "85%" || row['attendance_rate'] == "80%") { att_class = "badge-soft-info"; }
                        return '<span class="badge ' + att_class + '" >' + row['attendance_rate'] + '</span>';
                    }
                }
            ]
        });
    }
});