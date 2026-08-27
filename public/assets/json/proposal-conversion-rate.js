document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#proposal-conversion-rate')) {
        new DataTable('#proposal-conversion-rate', {
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
                    "proposal_id": "#PRO301",
                    "client": "Robert Johnson",
                    "avatar": "assets/img/profiles/avatar-01.jpg",
                    "value": "$7500",
                    "probability": "100%",
                    "timeline": "15 Dec 2027",
                    "status": "Approved"
                },
                {
                    "proposal_id": "#PRO302",
                    "client": "Isabella Cooper",
                    "avatar": "assets/img/profiles/avatar-02.jpg",
                    "value": "$2000",
                    "probability": "20%",
                    "timeline": "12 Nov 2027",
                    "status": "Sent"
                },
                {
                    "proposal_id": "#PRO303",
                    "client": "John Smith",
                    "avatar": "assets/img/profiles/avatar-03.jpg",
                    "value": "$1600",
                    "probability": "65%",
                    "timeline": "06 Oct 2027",
                    "status": "Under Review"
                },
                {
                    "proposal_id": "#PRO304",
                    "client": "Sophia Parker",
                    "avatar": "assets/img/profiles/avatar-04.jpg",
                    "value": "$600",
                    "probability": "2%",
                    "timeline": "14 Sep 2027",
                    "status": "Rejected"
                },
                {
                    "proposal_id": "#PRO305",
                    "client": "Ethan Reynolds",
                    "avatar": "assets/img/profiles/avatar-05.jpg",
                    "value": "$2800",
                    "probability": "100%",
                    "timeline": "23 Aug 2027",
                    "status": "Approved"
                },
                {
                    "proposal_id": "#PRO306",
                    "client": "Liam Carter",
                    "avatar": "assets/img/profiles/avatar-06.jpg",
                    "value": "$6955",
                    "probability": "75%",
                    "timeline": "16 Jul 2027",
                    "status": "Sent"
                },
                {
                    "proposal_id": "#PRO307",
                    "client": "Noah Mitchell",
                    "avatar": "assets/img/profiles/avatar-07.jpg",
                    "value": "$4785",
                    "probability": "100%",
                    "timeline": "09 Jun 2027",
                    "status": "Under Review"
                },
                {
                    "proposal_id": "#PRO308",
                    "client": "Mason Hayes",
                    "avatar": "assets/img/profiles/avatar-08.jpg",
                    "value": "$2145",
                    "probability": "10%",
                    "timeline": "15 May 2027",
                    "status": "Rejected"
                },
                {
                    "proposal_id": "#PRO309",
                    "client": "Ron Thompson",
                    "avatar": "assets/img/profiles/avatar-09.jpg",
                    "value": "$3652",
                    "probability": "60%",
                    "timeline": "19 Apr 2027",
                    "status": "Approved"
                },
                {
                    "proposal_id": "#PRO310",
                    "client": "Leslie Schweiger",
                    "avatar": "assets/img/profiles/avatar-10.jpg",
                    "value": "$1425",
                    "probability": "100%",
                    "timeline": "28 Mar 2027",
                    "status": "Sent"
                }
            ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<a href="#">' + row['proposal_id'] + '</a>';
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
                        var prob_class = "badge-soft-success";
                        var prob = parseInt(row['probability']);
                        if (prob <= 20) {
                            prob_class = "badge-soft-danger";
                        } else if (prob < 100) {
                            prob_class = "badge-soft-info";
                        }
                        return '<span class="badge ' + prob_class + '">' + row['probability'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        return '<span class="fs-14">' + row['timeline'] + '</span>';
                    }
                },
                {
                    "render": function (data, type, row) {
                        var status_class = "bg-success";
                        if (row['status'] == "Sent") { status_class = "bg-info"; }
                        else if (row['status'] == "Under Review") { status_class = "bg-warning"; }
                        else if (row['status'] == "Rejected") { status_class = "bg-danger"; }
                        return '<span class="badge border-0 badge-pill badge-status ' + status_class + '" >' + row['status'] + '</span>';
                    }
                }
            ]
        });
    }
});