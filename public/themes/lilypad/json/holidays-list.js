document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#holidays-list')) {
        new DataTable('#holidays-list', {
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
                    "holiday_id": "#HD301",
                    "name": "Republic Day",
                    "date": "15 Dec 2026",
                    "day": "Monday",
                    "location_flag": "assets/img/flags/us.svg",
                    "location_name": "USA",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD302",
                    "name": "Holi",
                    "date": "12 Nov 2026",
                    "day": "Saturday",
                    "location_flag": "assets/img/flags/canada.svg",
                    "location_name": "Canada",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD303",
                    "name": "Good Friday",
                    "date": "06 Oct 2026",
                    "day": "Friday",
                    "location_flag": "assets/img/flags/spain.svg",
                    "location_name": "Spain",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD304",
                    "name": "Company Foundation Day",
                    "date": "14 Sep 2026",
                    "day": "Wednesday",
                    "location_flag": "assets/img/flags/india.svg",
                    "location_name": "India",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD305",
                    "name": "Independence Day",
                    "date": "23 Aug 2026",
                    "day": "Saturday",
                    "location_flag": "assets/img/flags/brazil.svg",
                    "location_name": "Brazil",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD306",
                    "name": "Ganesh Chaturthi",
                    "date": "16 Jul 2026",
                    "day": "Wednesday",
                    "location_flag": "assets/img/flags/de.svg",
                    "location_name": "Germany",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD307",
                    "name": "Gandhi Jayanti",
                    "date": "09 Jun 2026",
                    "day": "Friday",
                    "location_flag": "assets/img/flags/mexico.svg",
                    "location_name": "Mexico",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD308",
                    "name": "Diwali",
                    "date": "15 May 2026",
                    "day": "Monday",
                    "location_flag": "assets/img/flags/china.svg",
                    "location_name": "China",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD309",
                    "name": "Christmas",
                    "date": "19 Apr 2026",
                    "day": "Friday",
                    "location_flag": "assets/img/flags/russia.svg",
                    "location_name": "Russia",
                    "status": "Active"
                },
                {
                    "holiday_id": "#HD310",
                    "name": "New Year Eve",
                    "date": "28 Mar 2026",
                    "day": "Thursday",
                    "location_flag": "assets/img/flags/italy.svg",
                    "location_name": "Italy",
                    "status": "Active"
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-normal mb-0"><a href="#" data-bs-toggle="modal" data-bs-target="#edit_holiday">' + row['holiday_id'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<p class="fs-14 mb-0">' + row['name'] + '</p>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<p class="fs-14 mb-0">' + row['date'] + '</p>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<p class="fs-14 mb-0">' + row['day'] + '</p>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<div class="d-flex align-items-center gap-2"><img src="' + row['location_flag'] + '" class="avatar avatar-xs rounded-circle" alt="img">' + row['location_name'] + '</div>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="badge badge-pill badge-status bg-success">' + row['status'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_holiday"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_holiday"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});