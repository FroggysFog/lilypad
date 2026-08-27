document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#discount-rules-settings')) {
        new DataTable('#discount-rules-settings', {
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
                    "rule_id": "#DIR0020",
                    "rule_name": "Standard Sales Discount",
                    "discount_type": "Percentage",
                    "discount_value": "10%",
                    "min_deal_value": "$3,000",
                    "applicable_product": "All Products",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0019",
                    "rule_name": "Manager Special Discount",
                    "discount_type": "Percentage",
                    "discount_value": "20%",
                    "min_deal_value": "$10,000",
                    "applicable_product": "Enterprise Deals",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0018",
                    "rule_name": "New Customer Flat",
                    "discount_type": "Flat",
                    "discount_value": "$500",
                    "min_deal_value": "$5,000",
                    "applicable_product": "SaaS Basic",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0017",
                    "rule_name": "High Volume Tier",
                    "discount_type": "Percentage",
                    "discount_value": "15%",
                    "min_deal_value": "$25,000",
                    "applicable_product": "All Products",
                    "auto_apply": true,
                    "status": "Inactive"
                },
                {
                    "rule_id": "#DIR0016",
                    "rule_name": "Seasonal Clearance",
                    "discount_type": "Percentage",
                    "discount_value": "25%",
                    "min_deal_value": "$1,000",
                    "applicable_product": "Hardwares",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0015",
                    "rule_name": "Partner Referral",
                    "discount_type": "Flat",
                    "discount_value": "$1,000",
                    "min_deal_value": "$15,000",
                    "applicable_product": "Subscriptions",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0014",
                    "rule_name": "Loyalty Reward",
                    "discount_type": "Percentage",
                    "discount_value": "5%",
                    "min_deal_value": "$500",
                    "applicable_product": "Custom Solutions",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0013",
                    "rule_name": "Executive Override",
                    "discount_type": "Percentage",
                    "discount_value": "30%",
                    "min_deal_value": "$50,000",
                    "applicable_product": "All Products",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0012",
                    "rule_name": "Bundle Discount",
                    "discount_type": "Flat",
                    "discount_value": "$200",
                    "min_deal_value": "$2,500",
                    "applicable_product": "Accessories",
                    "auto_apply": true,
                    "status": "Active"
                },
                {
                    "rule_id": "#DIR0011",
                    "rule_name": "End of Quarter",
                    "discount_type": "Percentage",
                    "discount_value": "12%",
                    "min_deal_value": "$10,000",
                    "applicable_product": "Cloud Storage",
                    "auto_apply": true,
                    "status": "Active"
                }
            ],
            "columns": [
                {
                    "data": "rule_id",
                    "render": function (data, type, row) {
                        return '<a href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_discount">' + data + '</a>';
                    }
                },
                {
                    "data": "rule_name",
                    "render": function (data, type, row) {
                        return '<span class="text-dark fw-medium">' + data + '</span>';
                    }
                },
                {
                    "data": "discount_type",
                    "render": function (data, type, row) {
                        var status_class = "badge-outline-info";
                        if (data === "Flat") { status_class = "badge-outline-pink"; }
                        return '<span class="badge ' + status_class + ' badge-sm">' + data + '</span>';
                    }
                },
                {
                    "data": "discount_value",
                    "render": function (data, type, row) {
                        return '<span class="text-dark">' + data + '</span>';
                    }
                },
                {
                    "data": "min_deal_value",
                    "render": function (data, type, row) {
                        return '<span class="text-dark">' + data + '</span>';
                    }
                },
                {
                    "data": "applicable_product",
                    "render": function (data, type, row) {
                        return '<span class="text-dark">' + data + '</span>';
                    }
                },
                {
                    "data": "auto_apply",
                    "render": function (data, type, row) {
                        var checked = data ? 'checked' : '';
                        return '<div class="form-check form-switch">' +
                            '<input class="form-check-input" type="checkbox" role="switch" ' + checked + '>' +
                            '</div>';
                    }
                },
                {
                    "data": "status",
                    "render": function (data, type, row) {
                        var status_class = "bg-success";
                        if (data === "Inactive") { status_class = "bg-danger"; }
                        return '<span class="badge ' + status_class + ' badge-sm">' + data + '</span>';
                    }
                },
                {
                    "data": null,
                    "render": function (data, type, row) {
                        return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#edit_discount"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_discount"><i class="ti ti-trash"></i> Delete</a></div></div>';
                    }
                }
            ]
        });
    }
});

