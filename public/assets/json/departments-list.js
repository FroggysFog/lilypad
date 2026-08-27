document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#departments-list')) {
        new DataTable('#departments-list', {
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
                    "id": 1,
                    "dept_ID": "#DEP0040",
                    "dept_name": "Sales",
                    "head_name": "Robert Johnson",
                    "head_image": "assets/img/profiles/avatar-14.jpg",
                    "members_count": "18 Members",
                    "location": "USA",
                    "location_flag": "assets/img/flags/us.svg",
                    "status": "Active",
                    "Action": ""
                },
                {
                    "id": 2,
                    "dept_ID": "#DEP0039",
                    "dept_name": "Marketing",
                    "head_name": "Isabella Cooper",
                    "head_image": "assets/img/profiles/avatar-15.jpg",
                    "members_count": "20 Members",
                    "location": "Canada",
                    "location_flag": "assets/img/flags/canada.svg",
                    "status": "Active",
                    "Action": ""
                },
                {
                    "id": 3,
                    "dept_ID": "#DEP0038",
                    "dept_name": "Development",
                    "head_name": "John Smith",
                    "head_image": "assets/img/profiles/avatar-16.jpg",
                    "members_count": "30 Members",
                    "location": "Spain",
                    "location_flag": "assets/img/flags/spain.svg",
                    "status": "Restructuring",
                    "Action": ""
                },
                {
                    "id": 4,
                    "dept_ID": "#DEP0037",
                    "dept_name": "Engineering",
                    "head_name": "Sophia Parker",
                    "head_image": "assets/img/profiles/avatar-17.jpg",
                    "members_count": "12 Members",
                    "location": "India",
                    "location_flag": "assets/img/flags/india.svg",
                    "status": "Restructuring",
                    "Action": ""
                },
                {
                    "id": 5,
                    "dept_ID": "#DEP0036",
                    "dept_name": "Finance",
                    "head_name": "Emma Reynolds",
                    "head_image": "assets/img/profiles/avatar-01.jpg",
                    "members_count": "31 Members",
                    "location": "Brazil",
                    "location_flag": "assets/img/flags/brazil.svg",
                    "status": "Active",
                    "Action": ""
                },
                {
                    "id": 6,
                    "dept_ID": "#DEP0035",
                    "dept_name": "Customer Support",
                    "head_name": "Liam Carter",
                    "head_image": "assets/img/profiles/avatar-02.jpg",
                    "members_count": "44 Members",
                    "location": "Germany",
                    "location_flag": "assets/img/flags/de.svg",
                    "status": "Restructuring",
                    "Action": ""
                },
                {
                    "id": 7,
                    "dept_ID": "#DEP0034",
                    "dept_name": "Product Management",
                    "head_name": "Noah Mitchell",
                    "head_image": "assets/img/profiles/avatar-03.jpg",
                    "members_count": "22 Members",
                    "location": "Mexico",
                    "location_flag": "assets/img/flags/mexico.svg",
                    "status": "Active",
                    "Action": ""
                },
                {
                    "id": 8,
                    "dept_ID": "#DEP0033",
                    "dept_name": "Operations",
                    "head_name": "Mason Hayes",
                    "head_image": "assets/img/profiles/avatar-04.jpg",
                    "members_count": "33 Members",
                    "location": "China",
                    "location_flag": "assets/img/flags/china.svg",
                    "status": "Active",
                    "Action": ""
                },
                {
                    "id": 9,
                    "dept_ID": "#DEP0032",
                    "dept_name": "Legal",
                    "head_name": "Ron Thompson",
                    "head_image": "assets/img/profiles/avatar-05.jpg",
                    "members_count": "22 Members",
                    "location": "Russia",
                    "location_flag": "assets/img/flags/russia.svg",
                    "status": "Restructuring",
                    "Action": ""
                },
                {
                    "id": 10,
                    "dept_ID": "#DEP0031",
                    "dept_name": "Data Analytics",
                    "head_name": "Laura Bennett",
                    "head_image": "assets/img/profiles/avatar-06.jpg",
                    "members_count": "10 Members",
                    "location": "Italy",
                    "location_flag": "assets/img/flags/italy.svg",
                    "status": "Success",
                    "Action": ""
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-normal mb-0"><a href="#" data-bs-toggle="modal" data-bs-target="#edit_department">' + row['dept_ID'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-medium mb-0">' + row['dept_name'] + '</h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="#" class="d-flex align-items-center"><span class="avatar avatar-xs me-2"><img class="img-fluid rounded-circle" src="' + row['head_image'] + '" alt="User Image"></span>' + row['head_name'] + '</a></h6>';
                    }
                },
                { "data": "members_count" },
                {
                    "render": function (data, type, row) {
                        return '<div class="d-flex align-items-center"><img src="' + row['location_flag'] + '" class="me-2 flag-img" alt="Flag" width="20"> ' + row['location'] + '</div>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        var class_name = "bg-success";
                        if (row['status'] == "Restructuring") {
                            class_name = "bg-purple";
                        }
                        return '<span class="badge badge-status ' + class_name + '" >' + row['status'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_department"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_modal"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});