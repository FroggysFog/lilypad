document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#proposals-list')) {
		new DataTable('#proposals-list', {
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
						"sent_to" : "NovaWave LLC",
						"pro_img" : "assets/img/priority/truellysel.svg",
						"client_img": "assets/img/icons/company-icon-01.svg",
						"total_value" : "$2,05,426",
						"project" : "Truelysell",
						"piority" : "0",
						"created_date": "21 May 2024",
						"date" : "15 May 2024",
						"open_till" : "15 Aug 2025",
						"status" : "0",
						"status_name" : "Accepted",
						"Action" : ""
					},
					{
						"id" : "#1493023",
						"si_no" : "",
						"star" : "",
						"subject" : "Web Design",
						"sent_to" : "Redwood Inc",
						"pro_img" : "assets/img/priority/project-01.svg",
						"client_img": "assets/img/icons/company-icon-10.svg",
						"total_value" : "$2,105",
						"project" : "Dreamsports",
						"piority" : "0",
						"created_date": "15 Apr 2024",
						"date" : "16 Jan 2024",
						"open_till" : "15 Sep 2024",
						"status" : "1",
						"status_name" : "Declined",
						"Action" : ""
					},
					{
						"id" : "#1493022",
						"si_no" : "",
						"star" : "",
						"subject" : "Logo & Branding",
						"sent_to" : "HarborView",
						"pro_img" : "assets/img/priority/best.svg",
						"client_img": "assets/img/icons/company-icon-08.svg",
						"total_value" : "$4,05,656",
						"project" : "Best@laundry",
						"piority" : "0",
						"created_date": "12  Mar 2024",
						"date" : "17 Sep 2024",
						"open_till" : "15 Nov 2024",
						"status" : "2",
						"status_name" : "Deleted",
						"Action" : ""
					},
					{
						"id" : "#1493021",
						"si_no" : "",
						"star" : "",
						"subject" : "Development",
						"sent_to" : "CoastalStar Co.",
						"pro_img" : "assets/img/priority/project-02.svg",
						"client_img": "assets/img/icons/company-icon-07.svg",
						"total_value" : "$2,05,426",
						"project" : "Doccure",
						"piority" : "0",
						"created_date": "15 Feb 2024",
						"date" : "18 May 2024",
						"open_till" : "15 Jun 2024",
						"status" : "4",
						"status_name" : "Draft",
						"Action" : ""
					},
					{
						"id" : "#1493020",
						"si_no" : "",
						"star" : "",
						"subject" : "SEO Proposal",
						"sent_to" : "RiverStone Ventur",
						"pro_img" : "assets/img/priority/project-01.svg",
						"client_img": "assets/img/icons/company-icon-05.svg",
						"total_value" : "$3,15,145",
						"project" : "Kofejob",
						"piority" : "0",
						"created_date": "15 Jan 2024",
						"date" : "19 Aug 2024",
						"open_till" : "15 Oct 2024",
						"status" : "3",
						"status_name" : "Sent",
						"Action" : ""
					},
					{
						"id" : "#1493019",
						"si_no" : "",
						"star" : "",
						"subject" : "Web Design",
						"sent_to" : "Summit  Peak",
						"pro_img" : "assets/img/priority/dream-pos.svg",
						"client_img": "assets/img/icons/company-icon-04.svg",
						"total_value" : "$6,154",
						"project" : "DreamPOS",
						"piority" : "0",
						"created_date": "15 Dec 2025",
						"date" : "20 May 2024",
						"open_till" : "08 Aug 2024",
						"status" : "4",
						"status_name" : "Draft",
						"Action" : ""
					},
					{
						"id" : "#1493018",
						"si_no" : "",
						"star" : "",
						"subject" : "Logo",
						"sent_to" : "Silver Hawk",
						"pro_img" : "assets/img/priority/servbook.svg",
						"client_img": "assets/img/icons/company-icon-03.svg",
						"total_value" : "$1,457",
						"project" : "Servbook",
						"piority" : "0",
						"created_date": "15 Nov 2025",
						"date" : "22 Aug 2024",
						"open_till" : "25 Jan 2025",
						"status" : "5",
						"status_name" : "Open",
						"Action" : ""
					},
					{
						"id" : "#1493017",
						"si_no" : "",
						"star" : "",
						"subject" : "Branding",
						"sent_to" : "BlueSky Industries",
						"pro_img" : "assets/img/priority/truellysell.svg",
						"client_img": "assets/img/icons/company-icon-02.svg",
						"total_value" : "$2,01,464",
						"project" : "Truelysell",
						"piority" : "0",
						"created_date": "15 Sep 2025",
						"date" : "15 May 2024",
						"open_till" : "12 Aug 2024",
						"status" : "0",
						"status_name" : "Accepted",
						"Action" : ""
					},
					{
						"id" : "#1493018",
						"si_no" : "",
						"star" : "",
						"subject" : "Development",
						"sent_to" : "Golden Gate Ltd",
						"pro_img" : "assets/img/priority/dreamchat.svg",
						"client_img": "assets/img/icons/company-icon-09.svg",
						"total_value" : "$1,10,145",
						"project" : "Dreamschat",
						"piority" : "0",
						"created_date": "15 Aug 2025",
						"date" : "14 Aug 2024",
						"open_till" : "07 Dec 2024 ",	
						"status" : "1",
						"status_name" : "Declined",
						"Action" : ""
					},
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<a href="#" class="title-name" >'+row['id']+'</a>';
				}},
				{ "render": function ( data, type, row ){
					return '<a href="#" class="title-name">'+row['subject']+'</a>';
				}},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fw-medium fs-14"><a href="company-details.html" class="avatar avatar-sm border rounded-circle me-2"><img class="w-auto h-auto" src="'+row['client_img']+'" alt="User Image"></a><a href="company-details.html">'+row['sent_to']+'</a></h6>';
				}},
				{ "data": "total_value" },  
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fw-medium fs-14"><a href="#" class="avatar avatar-sm border rounded-circle me-2"><img class="w-auto h-auto" src="'+row['pro_img']+'" alt="User Image"></a><a href="#">'+row['project']+'</a></h6>';
				}},
				{ "data": "created_date" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "success";var status_name ="Accepted" } else if(row['status'] == "1") { var class_name = "warning";var status_name ="Declined" } else if(row['status'] == "2") { var class_name = "danger";var status_name ="Deleted" } else if(row['status'] == "3") { var class_name = "green";var status_name ="Sent" } else if(row['status'] == "4") { var class_name = "info";var status_name ="Draft" } else { var class_name = "purple";var status_name ="Paused"} 
					return '<span class="badge badge-pill badge-status bg-'+class_name+'" >'+status_name+'</span>';
				}},      
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_proposals"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-clipboard-copy text-green"></i> View Proposal</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-checks"></i> Mark as Accpeted</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-file text-tertiary"></i> Mark as Draft</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-sticker text-blue"></i> Mark ad Declined</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-subtask text-pink"></i> Convert to estimate</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-file-invoice text-tertiary"></i> Convert to Invoice</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-printer"></i> Print</a></div></div>';
				}},
				
			]
				
		});
	}

});