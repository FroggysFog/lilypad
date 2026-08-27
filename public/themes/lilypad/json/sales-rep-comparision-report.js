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
                    "sales_id": "#SR301",
                    "name": "Robert Sheldon",
                    "avatar": "assets/img/profiles/avatar-01.jpg",
                    "team": "Digital Marketing Strategy 2026",
                    "deals": "50",
                    "revenue": "$7500",
                    "status": "Approved"
                },
                {
                    "sales_id": "#SR302",
                    "name": "Emma Sandoval",
                    "avatar": "assets/img/profiles/avatar-02.jpg",
                    "team": "Enterprise Software Development",
                    "deals": "60",
                    "revenue": "$2000",
                    "status": "Sent"
                },
                {
                    "sales_id": "#SR303",
                    "name": "Mike Matheson",
                    "avatar": "assets/img/profiles/avatar-03.jpg",
                    "team": "Brand Redesign & Identity",
                    "deals": "70",
                    "revenue": "$1600",
                    "status": "Pending"
                },
                {
                    "sales_id": "#SR304",
                    "name": "Natalie Ensley",
                    "avatar": "assets/img/profiles/avatar-04.jpg",
                    "team": "Cloud Infrastructure Migration",
                    "deals": "80",
                    "revenue": "$600",
                    "status": "Rejected"
                },
                {
                    "sales_id": "#SR305",
                    "name": "Antonio Warthen",
                    "avatar": "assets/img/profiles/avatar-05.jpg",
                    "team": "Mobile App Development",
                    "deals": "100",
                    "revenue": "$2800",
                    "status": "Approved"
                },
                {
                    "sales_id": "#SR306",
                    "name": "Carol Robillard",
                    "avatar": "assets/img/profiles/avatar-06.jpg",
                    "team": "SEO & Content Marketing Package",
                    "deals": "20",
                    "revenue": "$6955",
                    "status": "Sent"
                },
                {
                    "sales_id": "#SR307",
                    "name": "Johny Jacobs",
                    "avatar": "assets/img/profiles/avatar-07.jpg",
                    "team": "Brand Redesign & Identity",
                    "deals": "40",
                    "revenue": "$4785",
                    "status": "Pending"
                },
                {
                    "sales_id": "#SR308",
                    "name": "Helen Morejon",
                    "avatar": "assets/img/profiles/avatar-08.jpg",
                    "team": "Enterprise Software Development",
                    "deals": "30",
                    "revenue": "$2145",
                    "status": "Rejected"
                },
                {
                    "sales_id": "#SR309",
                    "name": "Charles Gipson",
                    "avatar": "assets/img/profiles/avatar-09.jpg",
                    "team": "Mobile App Development",
                    "deals": "70",
                    "revenue": "$3652",
                    "status": "Approved"
                },
                {
                    "sales_id": "#SR310",
                    "name": "Maria Jones",
                    "avatar": "assets/img/profiles/avatar-10.jpg",
                    "team": "Digital Marketing Strategy 2026",
                    "deals": "60",
                    "revenue": "$1425",
                    "status": "Sent"
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
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0">' +
                            '<a href="javascript:void(0);" class="d-flex align-items-center">' +
                            '<span class="avatar avatar-sm me-2"><img class="img-fluid rounded-circle" src="' + row['avatar'] + '" alt="User Image"></span>' +
                            row['name'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['team'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['deals'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['revenue'] + '</span>';
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