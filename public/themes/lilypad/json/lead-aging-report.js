document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#Leads-list')) {
        new DataTable('#Leads-list', {
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
                    "status": "Closed",
                    "days_in_status": "12",
                    "aging_bucket": "08-14 Days",
                    "last_activity": "25 Apr 2026",
                    "owner_name": "Robert Johnson",
                    "owner_image": "assets/img/profiles/avatar-14.jpg",
                    "rating": "0"
                },
                {
                    "lead_id": "#LED0019",
                    "lead_name": "Katherine Brooks",
                    "lead_image": "assets/img/profiles/avatar-19.jpg",
                    "status": "Not Closed",
                    "days_in_status": "05",
                    "aging_bucket": "03-07 Days",
                    "last_activity": "03 Apr 2025",
                    "owner_name": "Isabella Cooper",
                    "owner_image": "assets/img/profiles/avatar-15.jpg",
                    "rating": "2"
                },
                {
                    "lead_id": "#LED0018",
                    "lead_name": "Samantha Reed",
                    "lead_image": "assets/img/profiles/avatar-18.jpg",
                    "status": "Closed",
                    "days_in_status": "20",
                    "aging_bucket": "15+ Days",
                    "last_activity": "29 Mar 2026",
                    "owner_name": "John Smith",
                    "owner_image": "assets/img/profiles/avatar-16.jpg",
                    "rating": "3"
                },
                {
                    "lead_id": "#LED0017",
                    "lead_name": "William Anderson",
                    "lead_image": "assets/img/profiles/avatar-17.jpg",
                    "status": "Contacted",
                    "days_in_status": "13",
                    "aging_bucket": "8-14 Days",
                    "last_activity": "25 Mar 2026",
                    "owner_name": "Sophia Parker",
                    "owner_image": "assets/img/profiles/avatar-17.jpg",
                    "rating": "0"
                },
                {
                    "lead_id": "#LED0016",
                    "lead_name": "Jonathan Mitchell",
                    "lead_image": "assets/img/profiles/avatar-16.jpg",
                    "status": "Closed",
                    "days_in_status": "04",
                    "aging_bucket": "3-7 Days",
                    "last_activity": "17 Mar 2026",
                    "owner_name": "Ethan Reynolds",
                    "owner_image": "assets/img/profiles/avatar-01.jpg",
                    "rating": "2"
                },
                {
                    "lead_id": "#LED0015",
                    "lead_name": "Jennifer Adams",
                    "lead_image": "assets/img/profiles/avatar-15.jpg",
                    "status": "Closed",
                    "days_in_status": "17",
                    "aging_bucket": "15+ Days",
                    "last_activity": "08 Mar 2026",
                    "owner_name": "Liam Carter",
                    "owner_image": "assets/img/profiles/avatar-02.jpg",
                    "rating": "3"
                },
                {
                    "lead_id": "#LED0014",
                    "lead_name": "Alexander Carter",
                    "lead_image": "assets/img/profiles/avatar-14.jpg",
                    "status": "Closed",
                    "days_in_status": "04",
                    "aging_bucket": "3-7 Days",
                    "last_activity": "20 Feb 2026",
                    "owner_name": "Noah Mitchell",
                    "owner_image": "assets/img/profiles/avatar-03.jpg",
                    "rating": "2"
                },
                {
                    "lead_id": "#LED0013",
                    "lead_name": "Benjamin Harrison",
                    "lead_image": "assets/img/profiles/avatar-13.jpg",
                    "status": "Closed",
                    "days_in_status": "21",
                    "aging_bucket": "15+ Days",
                    "last_activity": "12 Feb 2026",
                    "owner_name": "Mason Hayes",
                    "owner_image": "assets/img/profiles/avatar-04.jpg",
                    "rating": "3"
                },
                {
                    "lead_id": "#LED0012",
                    "lead_name": "Nicholas Wright",
                    "lead_image": "assets/img/profiles/avatar-12.jpg",
                    "status": "Closed",
                    "days_in_status": "01",
                    "aging_bucket": "0-2 Days",
                    "last_activity": "15 Jan 2026",
                    "owner_name": "Ron Thompson",
                    "owner_image": "assets/img/profiles/avatar-05.jpg",
                    "rating": "1"
                },
                {
                    "lead_id": "#LED0011",
                    "lead_name": "Alexandra Bennett",
                    "lead_image": "assets/img/profiles/avatar-11.jpg",
                    "status": "Lost",
                    "days_in_status": "25",
                    "aging_bucket": "15+ Days",
                    "last_activity": "05 Jan 2026",
                    "owner_name": "Leslie Schweiger",
                    "owner_image": "assets/img/profiles/avatar-10.jpg",
                    "rating": "3"
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
                        var class_name = "bg-success";
                        if (row['status'] == "Not Closed") {
                            class_name = "bg-info";
                        } else if (row['status'] == "Contacted") {
                            class_name = "bg-warning";
                        } else if (row['status'] == "Lost") {
                            class_name = "bg-danger";
                        }
                        return '<span class="badge badge-status ' + class_name + '">' + row['status'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['days_in_status'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['aging_bucket'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['last_activity'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0">' +
                            '<a href="javascript:void(0);" class="d-flex align-items-center">' +
                            '<span class="avatar avatar-sm me-2"><img class="img-fluid rounded-circle" src="' + row['owner_image'] + '" alt="User Image"></span>' +
                            row['owner_name'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        if (row['rating'] == "0") { var class_name = "badge-soft-danger"; var status_name = "High" }
                        else if (row['rating'] == "1") { var class_name = "badge-soft-success"; var status_name = "low" }
                        else if (row['rating'] == "2") { var class_name = "badge-soft-warning"; var status_name = "Medium" }
                        else { var class_name = "badge-soft-purple"; var status_name = "Critical" }
                        return '<span class="badge border-0 badge-pill badge-status ' + class_name + '" ><i class="ti ti-point-filled fs-12 me-1"></i>' + status_name + '</span>';
                    }
                }
            ]
        });
    }
});