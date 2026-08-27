document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#proposal-report')) {
        new DataTable('#proposal-report', {
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
                    "proposal": "Digital Marketing Strategy 2026",
                    "client": "Robert Johnson",
                    "avatar": "assets/img/profiles/avatar-01.jpg",
                    "value": "$7500",
                    "submitted_date": "15 Dec 2026",
                    "due_date": "15 Dec 2027",
                    "status": "Approved"
                },
                {
                    "proposal": "Enterprise Software Development",
                    "client": "Isabella Cooper",
                    "avatar": "assets/img/profiles/avatar-02.jpg",
                    "value": "$2000",
                    "submitted_date": "12 Nov 2026",
                    "due_date": "12 Nov 2027",
                    "status": "Sent"
                },
                {
                    "proposal": "Brand Redesign & Identity",
                    "client": "John Smith",
                    "avatar": "assets/img/profiles/avatar-03.jpg",
                    "value": "$1600",
                    "submitted_date": "06 Oct 2026",
                    "due_date": "06 Oct 2027",
                    "status": "Pending"
                },
                {
                    "proposal": "Cloud Infrastructure Migration",
                    "client": "Sophia Parker",
                    "avatar": "assets/img/profiles/avatar-04.jpg",
                    "value": "$600",
                    "submitted_date": "14 Sep 2026",
                    "due_date": "14 Sep 2027",
                    "status": "Rejected"
                },
                {
                    "proposal": "Mobile App Development",
                    "client": "Ethan Reynolds",
                    "avatar": "assets/img/profiles/avatar-05.jpg",
                    "value": "$2800",
                    "submitted_date": "23 Aug 2026",
                    "due_date": "23 Aug 2027",
                    "status": "Approved"
                },
                {
                    "proposal": "SEO & Content Marketing Package",
                    "client": "Liam Carter",
                    "avatar": "assets/img/profiles/avatar-06.jpg",
                    "value": "$6955",
                    "submitted_date": "16 Jul 2026",
                    "due_date": "16 Jul 2027",
                    "status": "Sent"
                },
                {
                    "proposal": "Brand Redesign & Identity",
                    "client": "Noah Mitchell",
                    "avatar": "assets/img/profiles/avatar-07.jpg",
                    "value": "$4785",
                    "submitted_date": "09 Jun 2026",
                    "due_date": "09 Jun 2027",
                    "status": "Pending"
                },
                {
                    "proposal": "Enterprise Software Development",
                    "client": "Mason Hayes",
                    "avatar": "assets/img/profiles/avatar-08.jpg",
                    "value": "$2145",
                    "submitted_date": "15 May 2026",
                    "due_date": "15 May 2027",
                    "status": "Rejected"
                },
                {
                    "proposal": "Mobile App Development",
                    "client": "Ron Thompson",
                    "avatar": "assets/img/profiles/avatar-09.jpg",
                    "value": "$3652",
                    "submitted_date": "19 Apr 2026",
                    "due_date": "19 Apr 2027",
                    "status": "Approved"
                },
                {
                    "proposal": "Digital Marketing Strategy 2026",
                    "client": "Leslie Schweiger",
                    "avatar": "assets/img/profiles/avatar-10.jpg",
                    "value": "$1425",
                    "submitted_date": "28 Mar 2026",
                    "due_date": "28 Mar 2027",
                    "status": "Sent"
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['proposal'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0">' +
                            '<a href="javascript:void(0);" class="d-flex align-items-center">' +
                            '<span class="avatar avatar-sm me-2"><img class="img-fluid rounded-circle" src="' + row['avatar'] + '" alt="User Image"></span>' +
                            row['client'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['value'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['submitted_date'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['due_date'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        var status_class = "bg-success";
                        if (row['status'] == "Sent") { status_class = "bg-info"; }
                        else if (row['status'] == "Pending") { status_class = "bg-warning"; }
                        else if (row['status'] == "Rejected") { status_class = "bg-danger"; }
                        return '<span class="badge border-0 badge-pill badge-status ' + status_class + '" >' + row['status'] + '</span>';
                    }
                }
            ]
        });
    }
});