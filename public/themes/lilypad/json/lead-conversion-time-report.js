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
                    "lead_id": "#LED0020",
                    "lead_name": "Elizabeth Morgan",
                    "lead_image": "assets/img/profiles/avatar-20.jpg",
                    "source": "Phone calls",
                    "created_date": "25 Apr 2026",
                    "converted_date": "08 May 2026",
                    "conversion_days": "13",
                    "status": "At Risk"
                },
                {
                    "lead_id": "#LED0019",
                    "lead_name": "Katherine Brooks",
                    "lead_image": "assets/img/profiles/avatar-19.jpg",
                    "source": "Social Media",
                    "created_date": "03 Apr 2025",
                    "converted_date": "13 Apr 2025",
                    "conversion_days": "10",
                    "status": "At Risk"
                },
                {
                    "lead_id": "#LED0018",
                    "lead_name": "Samantha Reed",
                    "lead_image": "assets/img/profiles/avatar-18.jpg",
                    "source": "Referral Sites",
                    "created_date": "29 Mar 2026",
                    "converted_date": "02 Apr 2026",
                    "conversion_days": "04",
                    "status": "Paused"
                },
                {
                    "lead_id": "#LED0017",
                    "lead_name": "William Anderson",
                    "lead_image": "assets/img/profiles/avatar-17.jpg",
                    "source": "Campaigns",
                    "created_date": "25 Mar 2026",
                    "converted_date": "28 Mar 2026",
                    "conversion_days": "03",
                    "status": "On Track"
                },
                {
                    "lead_id": "#LED0016",
                    "lead_name": "Jonathan Mitchell",
                    "lead_image": "assets/img/profiles/avatar-16.jpg",
                    "source": "Web Analytics",
                    "created_date": "17 Mar 2026",
                    "converted_date": "23 Mar 2026",
                    "conversion_days": "06",
                    "status": "At Risk"
                },
                {
                    "lead_id": "#LED0015",
                    "lead_name": "Jennifer Adams",
                    "lead_image": "assets/img/profiles/avatar-15.jpg",
                    "source": "Campaigns",
                    "created_date": "08 Mar 2026",
                    "converted_date": "20 Mar 2026",
                    "conversion_days": "12",
                    "status": "Breached"
                },
                {
                    "lead_id": "#LED0014",
                    "lead_name": "Alexander Carter",
                    "lead_image": "assets/img/profiles/avatar-14.jpg",
                    "source": "Google",
                    "created_date": "20 Feb 2026",
                    "converted_date": "26 Feb 2026",
                    "conversion_days": "06",
                    "status": "At Risk"
                },
                {
                    "lead_id": "#LED0013",
                    "lead_name": "Benjamin Harrison",
                    "lead_image": "assets/img/profiles/avatar-13.jpg",
                    "source": "Campaigns",
                    "created_date": "12 Feb 2026",
                    "converted_date": "15 Feb 2026",
                    "conversion_days": "03",
                    "status": "On Track"
                },
                {
                    "lead_id": "#LED0012",
                    "lead_name": "Nicholas Wright",
                    "lead_image": "assets/img/profiles/avatar-12.jpg",
                    "source": "Insights",
                    "created_date": "15 Jan 2026",
                    "converted_date": "21 Jan 2026",
                    "conversion_days": "06",
                    "status": "Paused"
                },
                {
                    "lead_id": "#LED0011",
                    "lead_name": "Alexandra Bennett",
                    "lead_image": "assets/img/profiles/avatar-11.jpg",
                    "source": "Google",
                    "created_date": "05 Jan 2026",
                    "converted_date": "07 Jan 2026",
                    "conversion_days": "02",
                    "status": "On Track"
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-normal mb-0"><a href="leads-details.html">' + row['lead_id'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0">' +
                            '<a href="leads-details.html" class="d-flex align-items-center">' +
                            '<span class="avatar avatar-sm me-2"><img class="img-fluid rounded-circle" src="' + row['lead_image'] + '" alt="User Image"></span>' +
                            row['lead_name'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['source'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['created_date'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['converted_date'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['conversion_days'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        if (row['status'] == "At Risk") { var class_name = "badge-soft-pink"; }
                        else if (row['status'] == "Paused") { var class_name = "badge-soft-primary"; }
                        else if (row['status'] == "On Track") { var class_name = "badge-soft-success"; }
                        else { var class_name = "badge-soft-danger"; }
                        return '<span class="badge border-0 badge-pill badge-status ' + class_name + '" ><i class="ti ti-point-filled fs-12 me-1"></i>' + row['status'] + '</span>';
                    }
                }
            ]
        });
    }
});