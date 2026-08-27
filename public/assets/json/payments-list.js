document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#payments-list')) {
        new DataTable('#payments-list', {
                "searching": false, 
                "info": false,
                    "ordering": true,
                "autoWidth": true,
                "language": {
                    search: ' ',
                    searchPlaceholder: "Search",
                    info: "_START_ - _END_ of _TOTAL_ items",
                    "lengthMenu":     "Show _MENU_ entries",
                    paginate: {
                    next: '<i class="ti ti-chevron-right"></i> ',
                    previous: '<i class="ti ti-chevron-left"></i> '
                },
                    },
                pagingType: "simple_numbers",
                initComplete: (settings, json)=>{
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
                "data":[
                    {
                        "id" : 1,
                        "invoice_id" : "#1254058",
                        "customer" : "NovaWave LLC",
                        "client_img": "assets/img/icons/company-icon-01.svg",
                        "amount" : "$2500",
                        "due_date" : "15 Oct 2025",
                        "payment_method" : "Cash",
                        "transaction_id" : "TXNID1234567890",
                        "Action" : ""
                    },
                    {
                        "id" : 2,
                        "invoice_id" : "#1254057",
                        "customer" : "BlueSky Industries",
                        "client_img": "assets/img/icons/company-icon-02.svg",
                        "amount" : "$1450",
                        "due_date" : "19 Oct 2025",
                        "payment_method" : "Credit",
                        "transaction_id" : "TXNID9876543210",
                        "Action" : ""
                    },
                    {
                        "id" : 3,
                        "invoice_id" : "#1254056",
                        "customer" : "Silver Hawk",
                        "client_img": "assets/img/icons/company-icon-03.svg",
                        "amount" : "$2100",
                        "due_date" : "24 Oct 2025",
                        "payment_method" : "Cash",
                        "transaction_id" : "TXNID2468135790",
                        "Action" : ""
                    },
                    {
                        "id" : 4,
                        "invoice_id" : "#1254055",
                        "customer" : "Summit Peak",
                        "client_img": "assets/img/icons/company-icon-04.svg",
                        "amount" : "$4000",
                        "due_date" : "10 Nov 2025",
                        "payment_method" : "Credit",
                        "transaction_id" : "TXNID1357924680",
                        "Action" : ""
                    },
                    {
                        "id" : 5,
                        "invoice_id" : "#1254054",
                        "customer" : "RiverStone Ventur",
                        "client_img": "assets/img/icons/company-icon-05.svg",
                        "amount" : "$2120",
                        "due_date" : "18 Nov 2025",
                        "payment_method" : "Cash",
                        "transaction_id" : "TXNID0123456789",
                        "Action" : ""
                    },
                    {
                        "id" : 6,
                        "invoice_id" : "#1254053",
                        "customer" : "CoastalStar Co.",
                        "client_img": "assets/img/icons/company-icon-04.svg",
                        "amount" : "$3500",
                        "due_date" : "20 Nov 2025",
                        "payment_method" : "Credit",
                        "transaction_id" : "TXNIDABCDE12345",
                        "Action" : ""
                    },
                    {
                        "id" : 7,
                        "invoice_id" : "#1254052",
                        "customer" : "HarborView",
                        "client_img": "assets/img/icons/company-icon-03.svg",
                        "amount" : "$1230",
                        "due_date" : "07 Dec 2025",
                        "payment_method" : "Cash",
                        "transaction_id" : "TXNID54321XYZ789",
                        "Action" : ""
                    },
                    {
                        "id" : 8,
                        "invoice_id" : "#1254051",
                        "customer" : "Golden Gate Ltd",
                        "client_img": "assets/img/icons/company-icon-02.svg",
                        "amount" : "$3125",
                        "due_date" : "14 Dec 2025",
                        "payment_method" : "Credit",
                        "transaction_id" : "TXNIDQWERTY0987",
                        "Action" : ""
                    },
                    {
                        "id" : 9,
                        "invoice_id" : "#1254050",
                        "customer" : "Redwood Inc",
                        "client_img": "assets/img/icons/company-icon-10.svg",
                        "amount" : "$4180",
                        "due_date" : "22 Dec 2025",
                        "payment_method" : "Cash",
                        "transaction_id" : "TXNID98765ASDF43",
                        "Action" : ""
                    },
                    {
                        "id" : 10,
                        "invoice_id" : "#1254049",
                        "customer" : "NovaWave LLC",
                        "client_img": "assets/img/icons/company-icon-05.svg",
                        "amount" : "$5000",
                        "due_date" : "28 Dec 2025",
                        "payment_method" : "Cash",
                        "transaction_id" : "TXNID1A2B3C4D5E6",
                        "Action" : ""
                    },			
                ],
            "columns": [
                {
                    "render": function (data, type, row) {
                        return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
                    }
                },
                { "render": function ( data, type, row ){
                    return '<a href="#" class="title-name">'+row['invoice_id']+'</a>';
                }},
                
                { "render": function ( data, type, row ){
                    return '<h6 class="d-flex align-items-center fs-14 fw-medium"><a href="company-details.html" class="avatar avatar-sm border rounded-circle me-2"><img class="w-auto h-auto" src="'+row['client_img']+'" alt="User Image"></a><a href="company-details.html">'+row['customer']+'</a></h6>';
                }},  
                { "data": "amount" },                 
                { "data": "due_date" },                 
                { "data": "payment_method" },                 
                { "data": "transaction_id" },				
                { "render": function ( data, type, row ){
                    return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_view"><i class="ti ti-eye text-indigo"></i> Preview</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_payments"><i class="ti ti-trash"></i> Delete</a></div></div>';
                }},
                
            ]
                
        });
    }

});