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
                    "source": "Phone calls",
                    "campaign": "CRM Lead Gen",
                    "status": "Closed",
                    "owner_name": "Robert Johnson",
                    "owner_image": "assets/img/profiles/avatar-14.jpg",
                    "created_date": "25 Apr 2026",
                    "probability": "100%"
                },
                {
                    "lead_id": "#LED0019",
                    "lead_name": "Katherine Brooks",
                    "lead_image": "assets/img/profiles/avatar-19.jpg",
                    "source": "Social Media",
                    "campaign": "Product Awareness",
                    "status": "Not Closed",
                    "owner_name": "Isabella Cooper",
                    "owner_image": "assets/img/profiles/avatar-15.jpg",
                    "created_date": "03 Apr 2025",
                    "probability": "80%"
                },
                {
                    "lead_id": "#LED0018",
                    "lead_name": "Samantha Reed",
                    "lead_image": "assets/img/profiles/avatar-18.jpg",
                    "source": "Referral Sites",
                    "campaign": "Demo Signup Drive",
                    "status": "Closed",
                    "owner_name": "John Smith",
                    "owner_image": "assets/img/profiles/avatar-16.jpg",
                    "created_date": "29 Mar 2026",
                    "probability": "95%"
                },
                {
                    "lead_id": "#LED0017",
                    "lead_name": "William Anderson",
                    "lead_image": "assets/img/profiles/avatar-17.jpg",
                    "source": "Campaigns",
                    "campaign": "Retarget Leads",
                    "status": "Contacted",
                    "owner_name": "Sophia Parker",
                    "owner_image": "assets/img/profiles/avatar-17.jpg",
                    "created_date": "25 Mar 2026",
                    "probability": "84%"
                },
                {
                    "lead_id": "#LED0016",
                    "lead_name": "Jonathan Mitchell",
                    "lead_image": "assets/img/profiles/avatar-16.jpg",
                    "source": "Web Analytics",
                    "campaign": "New Feature Launch",
                    "status": "Closed",
                    "owner_name": "Ethan Reynolds",
                    "owner_image": "assets/img/profiles/avatar-01.jpg",
                    "created_date": "17 Mar 2026",
                    "probability": "92%"
                },
                {
                    "lead_id": "#LED0015",
                    "lead_name": "Jennifer Adams",
                    "lead_image": "assets/img/profiles/avatar-15.jpg",
                    "source": "Campaigns",
                    "campaign": "Customer Stories",
                    "status": "Closed",
                    "owner_name": "Liam Carter",
                    "owner_image": "assets/img/profiles/avatar-02.jpg",
                    "created_date": "08 Mar 2026",
                    "probability": "90%"
                },
                {
                    "lead_id": "#LED0014",
                    "lead_name": "Alexander Carter",
                    "lead_image": "assets/img/profiles/avatar-14.jpg",
                    "source": "Google",
                    "campaign": "Referral Campaign",
                    "status": "Closed",
                    "owner_name": "Noah Mitchell",
                    "owner_image": "assets/img/profiles/avatar-03.jpg",
                    "created_date": "20 Feb 2026",
                    "probability": "88%"
                },
                {
                    "lead_id": "#LED0013",
                    "lead_name": "Benjamin Harrison",
                    "lead_image": "assets/img/profiles/avatar-13.jpg",
                    "source": "Campaigns",
                    "campaign": "B2B Outreach",
                    "status": "Closed",
                    "owner_name": "Mason Hayes",
                    "owner_image": "assets/img/profiles/avatar-04.jpg",
                    "created_date": "12 Feb 2026",
                    "probability": "97%"
                },
                {
                    "lead_id": "#LED0012",
                    "lead_name": "Nicholas Wright",
                    "lead_image": "assets/img/profiles/avatar-12.jpg",
                    "source": "Insights",
                    "campaign": "Seasonal Deals",
                    "status": "Closed",
                    "owner_name": "Ron Thompson",
                    "owner_image": "assets/img/profiles/avatar-05.jpg",
                    "created_date": "15 Jan 2026",
                    "probability": "95%"
                },
                {
                    "lead_id": "#LED0011",
                    "lead_name": "Alexandra Bennett",
                    "lead_image": "assets/img/profiles/avatar-11.jpg",
                    "source": "Google",
                    "campaign": "Influencer Promo",
                    "status": "Lost",
                    "owner_name": "Leslie Schweiger",
                    "owner_image": "assets/img/profiles/avatar-10.jpg",
                    "created_date": "05 Jan 2026",
                    "probability": "91%"
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
                        return '<span class="fs-14">' + row['campaign'] + '</span>';
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
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0">' +
                            '<a href="javascript:void(0);" class="d-flex align-items-center">' +
                            '<span class="avatar avatar-sm me-2"><img class="img-fluid rounded-circle" src="' + row['owner_image'] + '" alt="User Image"></span>' +
                            row['owner_name'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['created_date'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['probability'] + '</span>';
                    }
                }
            ]
        });
    }
});