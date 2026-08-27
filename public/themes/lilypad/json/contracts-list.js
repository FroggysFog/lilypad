document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#contracts-list')) {
		new DataTable('#contracts-list', {
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
						"id" : "#1493024",
						"si_no" : "",
						"star" : "",
						"subject" : "SEO Proposal",
						"customer" : "NovaWave LLC",
						"client_img": "assets/img/icons/company-icon-01.svg",
						"contract_type" : "Contracts under Seal",
						"contract_value" : "$2,05,426",
						"date" : "15 Aug 2024",
						"end_date" : "15 May 2024",
						"Action" : ""
					},
					{
						"id" : "#1493023",
						"si_no" : "",
						"star" : "",
						"subject" : "Web Design",
						"customer" : "Redwood Inc",
						"client_img": "assets/img/icons/company-icon-10.svg",
						"contract_type" : "Implied Contracts",
						"contract_value" : "$2,105",
						"date" : "15 Sep 2024",
						"end_date" : "15 Apr 2024",
						"Action" : ""
					},
					{
						"id" : "#1493022",
						"si_no" : "",
						"star" : "",
						"subject" : "Logo & Branding",
						"customer" : "HarborView",
						"client_img": "assets/img/icons/company-icon-08.svg",
						"contract_type" : "Implied Contracts",
						"contract_value" : "$4,05,656",
						"date" : "15 Nov 2024",
						"end_date" : "15 Mar 2024",
						"Action" : ""
					},
					{
						"id" : "#1493021",
						"si_no" : "",
						"star" : "",
						"subject" : "Development",
						"customer" : "CoastalStar Co.",
						"client_img": "assets/img/icons/company-icon-07.svg",
						"contract_type" : "Executory Contracts",
						"contract_value" : "$2,05,426",
						"date" : "15 Jun 2024",
						"end_date" : "15 Feb 2024",
						"Action" : ""
					},
					{
						"id" : "#1493020",
						"si_no" : "",
						"star" : "",
						"subject" : "SEO Proposal",
						"customer" : "RiverStone Ventur",
						"client_img": "assets/img/icons/company-icon-05.svg",
						"contract_type" : "Voidable Contracts",
						"contract_value" : "$3,15,145",
						"date" : "15 Oct 2024",
						"end_date" : "15 Jan 2024",
						"Action" : ""
					},
					{
						"id" : "#1493019",
						"si_no" : "",
						"star" : "",
						"subject" : "Web Design",
						"customer" : "Summit  Peak",
						"client_img": "assets/img/icons/company-icon-04.svg",
						"contract_type" : "Unilateral Contracts",
						"contract_value" : "$6,154",
						"date" : "08 Aug 2024",
						"end_date" : "15 Dec 2025",
						"Action" : ""
					},
					{
						"id" : "#1493018",
						"si_no" : "",
						"star" : "",
						"subject" : "Logo",
						"customer" : "Silver Hawk",
						"client_img": "assets/img/icons/company-icon-03.svg",
						"contract_type" : "Unconscionable",
						"contract_value" : "$1,457",
						"date" : "25 Jan 2025 ",
						"end_date" : "15 Nov 2025",
						"Action" : ""
					},
					{
						"id" : "#1493017",
						"si_no" : "",
						"star" : "",
						"subject" : "Branding",
						"customer" : "BlueSky Industries",
						"client_img": "assets/img/icons/company-icon-02.svg",
						"contract_type" : "Express Contracts",
						"contract_value" : "$2,01,464",
						"date" : "12 Aug 2024",
						"end_date" : "15 Sep 2025",
						"Action" : ""
					},
					{
						"id" : "#1493018",
						"si_no" : "",
						"star" : "",
						"subject" : "Development",
						"customer" : "Golden Gate Ltd",
						"client_img": "assets/img/icons/company-icon-09.svg",
						"contract_type" : "Contracts under Seal",
						"contract_value" : "$1,10,145",
						"date" : "07 Dec 2024",
						"end_date" : "15 Aug 2025 ",
						"Action" : ""
					},
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<a href="#" class="title-name">'+row['id']+'</a>';
				}},
				{ "render": function ( data, type, row ){
					return '<a href="#" class="title-name">'+row['subject']+'</a>';
				}},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fw-medium fs-14"><a href="company-details.html" class="avatar border rounded-circle me-2"><img class="w-auto h-auto" src="'+row['client_img']+'" alt="User Image"></a><a href="company-details.html">'+row['customer']+'</a></h6>';
				}},                  
				{ "data": "contract_type" },                 
				{ "data": "date" },                 
				{ "data": "end_date" },				
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_contracts"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-copy text-tertiary"></i> Clone</a><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_view"><i class="ti ti-clipboard-copy text-violet"></i> View Contract</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-checks"></i> Mark as Signed</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-printer"></i> Print</a></div></div>';
				}},
				
			]
				
		});
	}

});