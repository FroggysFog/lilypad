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
                    "deal_id": "#DEL0020",
                    "deal_name": "Annual Software Subscription",
                    "deal_value": "$7,811,800",
                    "discount": "10%",
                    "final_value": "$7,030,620",
                    "status": "Won",
                    "owner": "Elizabeth Morgan",
                    "owner_image": "assets/img/profiles/avatar-20.jpg",
                    "closed_date": "08 May 2026",
                    "win_probability": "70%"
                },
                {
                    "deal_id": "#DEL0019",
                    "deal_name": "CRM Onboarding Package",
                    "deal_value": "$7,214,078",
                    "discount": "08%",
                    "final_value": "$6,636,951",
                    "status": "Lost",
                    "owner": "Katherine Brooks",
                    "owner_image": "assets/img/profiles/avatar-19.jpg",
                    "closed_date": "13 Apr 2025",
                    "win_probability": "40%"
                },
                {
                    "deal_id": "#DEL0018",
                    "deal_name": "Enterprise Plan Upgrade",
                    "deal_value": "$4,14,800",
                    "discount": "05%",
                    "final_value": "$3,94,060",
                    "status": "Won",
                    "owner": "Samantha Reed",
                    "owner_image": "assets/img/profiles/avatar-18.jpg",
                    "closed_date": "02 Apr 2026",
                    "win_probability": "95%"
                },
                {
                    "deal_id": "#DEL0017",
                    "deal_name": "BrightWorks Campaign",
                    "deal_value": "$1,611,400",
                    "discount": "10%",
                    "final_value": "$1,450,260",
                    "status": "Won",
                    "owner": "William Anderson",
                    "owner_image": "assets/img/profiles/avatar-17.jpg",
                    "closed_date": "28 Mar 2026",
                    "win_probability": "10%"
                },
                {
                    "deal_id": "#DEL0016",
                    "deal_name": "Sales Pipeline Optimization",
                    "deal_value": "$09,05,947",
                    "discount": "15%",
                    "final_value": "$7,70,054",
                    "status": "Open",
                    "owner": "Jonathan Mitchell",
                    "owner_image": "assets/img/profiles/avatar-16.jpg",
                    "closed_date": "23 Mar 2026",
                    "win_probability": "47%"
                },
                {
                    "deal_id": "#DEL0015",
                    "deal_name": "CRM Migration Project",
                    "deal_value": "$03,12,500",
                    "discount": "20%",
                    "final_value": "$2,50,000",
                    "status": "Won",
                    "owner": "Jennifer Adams",
                    "owner_image": "assets/img/profiles/avatar-15.jpg",
                    "closed_date": "20 Mar 2026",
                    "win_probability": "15%"
                },
                {
                    "deal_id": "#DEL0014",
                    "deal_name": "Multi-Store License Renewal",
                    "deal_value": "$9,05,947",
                    "discount": "10%",
                    "final_value": "$8,15,352",
                    "status": "Won",
                    "owner": "Alexander Carter",
                    "owner_image": "assets/img/profiles/avatar-14.jpg",
                    "closed_date": "26 Feb 2026",
                    "win_probability": "10%"
                },
                {
                    "deal_id": "#DEL0013",
                    "deal_name": "Custom Feature Development",
                    "deal_value": "$04,51,000",
                    "discount": "05%",
                    "final_value": "$4,28,450",
                    "status": "Open",
                    "owner": "Benjamin Harrison",
                    "owner_image": "assets/img/profiles/avatar-13.jpg",
                    "closed_date": "15 Feb 2026",
                    "win_probability": "90%"
                },
                {
                    "deal_id": "#DEL0012",
                    "deal_name": "SkyHigh Annual Booking",
                    "deal_value": "$11,14,400",
                    "discount": "15%",
                    "final_value": "$9,47,240",
                    "status": "Lost",
                    "owner": "Nicholas Wright",
                    "owner_image": "assets/img/profiles/avatar-12.jpg",
                    "closed_date": "21 Jan 2026",
                    "win_probability": "99%"
                },
                {
                    "deal_id": "#DEL0011",
                    "deal_name": "SkyHigh Annual Booking",
                    "deal_value": "$04,51,000",
                    "discount": "08%",
                    "final_value": "$4,14,920",
                    "status": "Won",
                    "owner": "Alexandra Bennett",
                    "owner_image": "assets/img/profiles/avatar-11.jpg",
                    "closed_date": "07 Jan 2026",
                    "win_probability": "90%"
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-normal mb-0"><a href="deals-details.html">' + row['deal_id'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="fs-14 fw-medium mb-0"><a href="deals-details.html">' + row['deal_name'] + '</a></h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['deal_value'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['discount'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['final_value'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        if (row['status'] == "Won") { var class_name = "bg-success"; }
                        else if (row['status'] == "Lost") { var class_name = "bg-danger"; }
                        else { var class_name = "bg-info"; }
                        return '<span class="badge border-0 badge-pill badge-status ' + class_name + '" >' + row['status'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0">' +
                            '<span class="avatar avatar-sm me-2"><img class="img-fluid rounded-circle" src="' + row['owner_image'] + '" alt="User Image"></span>' +
                            row['owner'] + '</h6>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['closed_date'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['win_probability'] + '</span>';
                    }
                }
            ]
        });
    }
});