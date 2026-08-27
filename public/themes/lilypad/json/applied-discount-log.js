document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#applied-discount-log')) {
        new DataTable('#applied-discount-log', {
            "searching": true,
            "info": false,
            "ordering": true,
            "autoWidth": true,
            "searching": false,
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
                document.querySelectorAll('.card-header input').forEach(function (input) {
                    input.addEventListener('keyup', function () {
                        new DataTable('#applied-discount-log').search(this.value).draw();
                    });
                });
            },
            "data": [
                {
                    "discount_id": "#DIR0020",
                    "deal_id": "#DEL0020",
                    "requested_by": {
                        "name": "Albert Morgan",
                        "avatar": "assets/img/users/user-01.jpg"
                    },
                    "requested_discount": "10%",
                    "approved_discount": "08%",
                    "final_deal_value": "$3,000",
                    "approval_status": "Approved"
                },
                {
                    "discount_id": "#DIR0019",
                    "deal_id": "#DEL0019",
                    "requested_by": {
                        "name": "Katherine Brooks",
                        "avatar": "assets/img/users/user-40.jpg"
                    },
                    "requested_discount": "20%",
                    "approved_discount": "16%",
                    "final_deal_value": "$10,000",
                    "approval_status": "Approved"
                },
                {
                    "discount_id": "#DIR0018",
                    "deal_id": "#DEL0018",
                    "requested_by": {
                        "name": "Samantha Reed",
                        "avatar": "assets/img/users/user-02.jpg"
                    },
                    "requested_discount": "12%",
                    "approved_discount": "12%",
                    "final_deal_value": "$5,000",
                    "approval_status": "Approved"
                },
                {
                    "discount_id": "#DIR0017",
                    "deal_id": "#DEL0017",
                    "requested_by": {
                        "name": "William Anderson",
                        "avatar": "assets/img/users/user-01.jpg"
                    },
                    "requested_discount": "15%",
                    "approved_discount": "0%",
                    "final_deal_value": "$25,000",
                    "approval_status": "Rejected"
                },
                {
                    "discount_id": "#DIR0016",
                    "deal_id": "#DEL0016",
                    "requested_by": {
                        "name": "Jonathan Mitchell",
                        "avatar": "assets/img/users/user-04.jpg"
                    },
                    "requested_discount": "05%",
                    "approved_discount": "5%",
                    "final_deal_value": "$1,000",
                    "approval_status": "Approved"
                },
                {
                    "discount_id": "#DIR0015",
                    "deal_id": "#DEL0015",
                    "requested_by": {
                        "name": "Jennifer Adams",
                        "avatar": "assets/img/users/user-05.jpg"
                    },
                    "requested_discount": "08%",
                    "approved_discount": "8%",
                    "final_deal_value": "$15,000",
                    "approval_status": "Approved"
                },
                {
                    "discount_id": "#DIR0014",
                    "deal_id": "#DEL0014",
                    "requested_by": {
                        "name": "Alexander Carter",
                        "avatar": "assets/img/users/user-06.jpg"
                    },
                    "requested_discount": "10%",
                    "approved_discount": "10%",
                    "final_deal_value": "$5000",
                    "approval_status": "Rejected"
                },
                {
                    "discount_id": "#DIR0013",
                    "deal_id": "#DEL0013",
                    "requested_by": {
                        "name": "Benjamin Harrison",
                        "avatar": "assets/img/users/user-07.jpg"
                    },
                    "requested_discount": "15%",
                    "approved_discount": "0%",
                    "final_deal_value": "$50,000",
                    "approval_status": "Approved"
                },
                {
                    "discount_id": "#DIR0012",
                    "deal_id": "#DEL0012",
                    "requested_by": {
                        "name": "Nicholas Wright",
                        "avatar": "assets/img/users/user-08.jpg"
                    },
                    "requested_discount": "10%",
                    "approved_discount": "08%",
                    "final_deal_value": "$18,000",
                    "approval_status": "Approved"
                },
                {
                    "discount_id": "#DIR0011",
                    "deal_id": "#DEL0011",
                    "requested_by": {
                        "name": "Alexandra Bennett",
                        "avatar": "assets/img/users/user-09.jpg"
                    },
                    "requested_discount": "12%",
                    "approved_discount": "12%",
                    "final_deal_value": "$10,000",
                    "approval_status": "Approved"
                }
            ],
            "columns": [
                {
                    "data": "discount_id",
                    "render": function (data, type, row) {
                        return '<a href="javascript:void(0);" class="text-blue" data-bs-toggle="modal" data-bs-target="#edit_discount">' + data + '</a>';
                    }
                },
                {
                    "data": "deal_id",
                    "render": function (data, type, row) {
                        return '<a href="javascript:void(0);" class="text-blue">' + data + '</a>';
                    }
                },
                {
                    "data": "requested_by",
                    "render": function (data, type, row) {
                        return '<div class="d-flex align-items-center">' +
                            '<a href="javascript:void(0);" class="avatar avatar-sm avatar-rounded me-2 flex-shrink-0">' +
                            '<img src="' + data.avatar + '" alt="Img">' +
                            '</a>' +
                            '<h6 class="fs-14 fw-medium mb-0"><a href="javascript:void(0);">' + data.name + '</a></h6>' +
                            '</div>';
                    }
                },
                {
                    "data": "requested_discount",
                    "render": function (data, type, row) {
                        return '<span class="text-dark">' + data + '</span>';
                    }
                },
                {
                    "data": "approved_discount",
                    "render": function (data, type, row) {
                        return '<span class="text-dark">' + data + '</span>';
                    }
                },
                {
                    "data": "final_deal_value",
                    "render": function (data, type, row) {
                        return '<span class="text-dark">' + data + '</span>';
                    }
                },
                {
                    "data": "approval_status",
                    "render": function (data, type, row) {
                        var status_class = "bg-success";
                        if (data === "Rejected") { status_class = "bg-danger"; }
                        return '<span class="badge ' + status_class + ' badge-sm">' + data + '</span>';
                    }
                },
                {
                    "data": null,
                    "orderable": false,
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_discount"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_discount"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});