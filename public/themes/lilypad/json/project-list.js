document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#project-list')) {
		new DataTable('#project-list', {
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
						"id" : "#12145",
						"si_no" : "",
						"star" : "",
						"name" : "Truelysell",
						"client" : "NovaWave LLC",
						"pro_img" : "assets/img/priority/truellysel.svg",
						"client_img": "assets/img/icons/company-icon-01.svg",
						"piority" : "0",
						"start_date" : "25 Sep 2025",
						"end_date" : "15 Oct 2025",
						"stage" : "3",
						"type" : "Web App",
						"status" : "0",
						"value": "$03,50,000",
						"hrs": "100",
						"mem_image1" : "assets/img/profiles/avatar-14.jpg",
						"mem_image2": "assets/img/profiles/avatar-15.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
						"budget": "$200000",
						"currently_spend": "$40000",
						"Action" : ""
					},
					{
						"id" : "#12146",
						"si_no" : "",
						"star" : "",
						"name" : "Dreamschat",
						"client" : "BlueSky Industries",
						"pro_img" : "assets/img/priority/dreamchat.svg",
						"client_img": "assets/img/icons/company-icon-02.svg",
						"piority" : "0",
						"start_date" : "29 Sep 2025",
						"end_date" : "19 Oct 2025",
						"stage" : "1",
						"type" : "Web App",
						"status" : "1",
						"value": "$02,15,000",
						"hrs": "80",
						"mem_image1" : "assets/img/profiles/avatar-03.jpg",
						"mem_image2": "assets/img/profiles/avatar-05.jpg",
						"mem_image3": "assets/img/profiles/avatar-06.jpg",
						"budget": "$300000",
						"currently_spend": "$120000",
						"Action" : ""
					},
					{
						"id" : "#12147",
						"si_no" : "",
						"star" : "",
						"name" : "Truelysell",
						"client" : "SilverHawk",
						"pro_img" : "assets/img/priority/truellysell.svg",
						"client_img": "assets/img/icons/company-icon-03.svg",
						"piority" : "0",
						"start_date" : "05 Oct 2025",
						"end_date" : "12 Oct 2025",
						"stage" : "0",
						"type" : "Web App",
						"status" : "0",
						"value": "$01,45,000",
						"hrs": "75",
						"mem_image1" : "assets/img/profiles/avatar-04.jpg",
						"mem_image2": "assets/img/profiles/avatar-01.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
						"budget": "$200000",
						"currently_spend": "$200000",
						"Action" : ""
					},
					{
						"id" : "#12148",
						"si_no" : "",
						"star" : "",
						"name" : "Servbook",
						"client" : "SummitPeak",
						"pro_img" : "assets/img/priority/servbook.svg",
						"client_img": "assets/img/icons/company-icon-04.svg",
						"piority" : "0",
						"start_date" : "14 Oct 2025",
						"end_date" : "24 Oct 2025",
						"stage" : "2",
						"type" : "Web App",
						"status" : "1",
						"value": "$02,15,000",
						"hrs": "60",
						"mem_image1" : "assets/img/profiles/avatar-12.jpg",
						"mem_image2": "assets/img/profiles/avatar-15.jpg",
						"mem_image3": "assets/img/profiles/avatar-13.jpg",
						"budget": "$300000",
						"currently_spend": "$60000",
						"Action" : ""
					},
					{
						"id" : "#12149",
						"si_no" : "",
						"star" : "",
						"name" : "DreamPOS",
						"client" : "RiverStone Ventur",
						"pro_img" : "assets/img/priority/dream-pos.svg",
						"client_img": "assets/img/icons/company-icon-05.svg",
						"piority" : "0",
						"start_date" : "15 Nov 2025",
						"end_date" : "22 Nov 2025",
						"stage" : "2",
						"type" : "Web App",
						"status" : "2",
						"value": "$03,64,000",
						"hrs": "72",
						"mem_image1" : "assets/img/profiles/avatar-10.jpg",
						"mem_image2": "assets/img/profiles/avatar-11.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
						"budget": "$120000",
						"currently_spend": "$40000",
						"Action" : ""
					},
					{
						"id" : "#12150",
						"si_no" : "",
						"star" : "",
						"name" : "Kofejob",
						"client" : "CoastalStar Co.",
						"pro_img" : "assets/img/priority/project-01.svg",
						"client_img": "assets/img/icons/company-icon-06.svg",
						"piority" : "0",
						"start_date" : "25 Nov 2025",
						"end_date" : "09 Dec 2025",
						"stage" : "1",
						"type" : "Meeting",
						"status" : "0",
						"value": "$02,12,000",
						"hrs": "96",
						"mem_image1" : "assets/img/profiles/avatar-14.jpg",
						"mem_image2": "assets/img/profiles/avatar-09.jpg",
						"mem_image3": "assets/img/profiles/avatar-08.jpg",
						"budget": "$200000",
						"currently_spend": "$90000",
						"Action" : ""
					},
					{
						"id" : "#12151",
						"si_no" : "",
						"star" : "",
						"name" : "Doccure",
						"client" : "HarborView",
						"pro_img" : "assets/img/priority/project-02.svg",
						"client_img": "assets/img/icons/company-icon-07.svg",
						"piority" : "0",
						"start_date" : "08 Dec 2025",
						"end_date" : "16 Dec 2025",
						"stage" : "0",
						"type" : "Web App",
						"status" : "1",
						"value": "$04,18,000",
						"hrs": "85",
						"mem_image1" : "assets/img/profiles/avatar-06.jpg",
						"mem_image2": "assets/img/profiles/avatar-07.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
						"budget": "$200000",
						"currently_spend": "$195000",
						"Action" : ""
					},
					{
						"id" : "#12152",
						"si_no" : "",
						"star" : "",
						"name" : "Best@laundry",
						"client" : "Golden Gate Ltd",
						"pro_img" : "assets/img/priority/best.svg",
						"client_img": "assets/img/icons/company-icon-08.svg",
						"piority" : "0",
						"start_date" : "21 Dec 2025",
						"end_date" : "13 Jan 2024",
						"stage" : "0",
						"type" : "Meeting",
						"status" : "2",
						"value": "$01,23,000",
						"hrs": "65",
						"mem_image1" : "assets/img/profiles/avatar-04.jpg",
						"mem_image2": "assets/img/profiles/avatar-15.jpg",
						"mem_image3": "assets/img/profiles/avatar-05.jpg",
						"budget": "$230000",
						"currently_spend": "$220000",
						"Action" : ""
					},
					{
						"id" : "#12153",
						"si_no" : "",
						"star" : "",
						"name" : "POS",
						"client" : "CoastalStar Inc",
						"pro_img" : "assets/img/priority/dream-pos.svg",
						"client_img": "assets/img/icons/company-icon-06.svg",
						"piority" : "0",
						"start_date" : "01 Jan 2024",
						"end_date" : "11 Jan 2024",
						"stage" : "1",
						"type" : "Web App",
						"status" : "1",
						"value": "$03,64,000",
						"hrs": "60",
						"mem_image1" : "assets/img/profiles/avatar-08.jpg",
						"mem_image2": "assets/img/profiles/avatar-12.jpg",
						"mem_image3": "assets/img/profiles/avatar-04.jpg",
						"budget": "$200000",
						"currently_spend": "$177777 ",
						"Action" : ""
					},
					{
						"id" : "#12153",
						"si_no" : "",
						"star" : "",
						"name" : "Bookserv",
						"client" : "Redwood Inc",
						"pro_img" : "assets/img/priority/servbook.svg",
						"client_img": "assets/img/icons/company-icon-09.svg",
						"piority" : "0",
						"start_date" : "12 Jan 2024",
						"end_date" : "29 Jan 2024",
						"stage" : "1",
						"type" : "Meeting",
						"status" : "1",
						"value": " $04,10,000",
						"hrs": "56",
						"mem_image1" : "assets/img/profiles/avatar-12.jpg",
						"mem_image2": "assets/img/profiles/avatar-14.jpg",
						"mem_image3": "assets/img/profiles/avatar-01.jpg",
						"budget": "$300000",
						"currently_spend": "$100000 ",
						"Action" : ""
					},
					{
						"id" : "#12153",
						"si_no" : "",
						"star" : "",
						"name" : "Dreamchat",
						"client" : "Redwood Inc",
						"pro_img" : "assets/img/priority/sports.svg",
						"client_img": "assets/img/icons/company-icon-09.svg",
						"piority" : "0",
						"start_date" : "16 Jan 2024",
						"end_date" : "25 Jan 2024",
						"stage" : "1",
						"type" : "Meeting",
						"status" : "1",
						"value": "$02,19,000",
						"hrs": "55",
						"mem_image1" : "assets/img/profiles/avatar-08.jpg",
						"mem_image2": "assets/img/profiles/avatar-15.jpg",
						"mem_image3": "assets/img/profiles/avatar-12.jpg",
						"budget": "$400000",
						"currently_spend": "$200000 ",
						"Action" : ""
					},
					{
						"id" : "#12153",
						"si_no" : "",
						"star" : "",
						"name" : "Sports",
						"client" : "Ventur",
						"pro_img" : "assets/img/priority/best.svg",
						"client_img": "assets/img/icons/company-icon-08.svg",
						"piority" : "0",
						"start_date" : "12 Jan 2024",
						"end_date" : "29 Jan 2024",
						"stage" : "1",
						"type" : "Web App",
						"status" : "1",
						"value": "$01,23,000",
						"hrs": "63",
						"mem_image1" : "assets/img/profiles/avatar-01.jpg",
						"mem_image2": "assets/img/profiles/avatar-11.jpg",
						"mem_image3": "assets/img/profiles/avatar-14.jpg",
						"budget": "$300000",
						"currently_spend": "$100000 ",
						"Action" : ""
					}
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select"><i class="ti ti-star-filled fs-16"></i></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-medium"><a href="project-details.html" class="avatar border rounded-circle me-2"><img class="w-auto h-auto" src="'+row['pro_img']+'" alt="User Image"></a><a href="project-details.html">'+row['name']+'</a></h6>';
				}},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 fw-medium"><a href="company-details.html" class="avatar avatar-sm border rounded-circle me-2"><img class="w-auto h-auto" src="'+row['client_img']+'" alt="User Image"></a><a href="company-details.html">'+row['client']+'</a></h6>';
				}},   
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "danger";var status_name ="High" } else if(row['status'] == "1") { var class_name = "warning";var status_name ="Medium" }  else { var class_name = "success";var status_name ="Low"}
					return '<span class="priority badge badge-tag badge-soft-'+class_name+'" ><i class="ti ti-square-rounded-filled me-1"></i>'+status_name+'</span>';
				}},    
				{ "data": "start_date" },                 
				{ "data": "end_date" },
				{
					"render": function (data, type, row) {
							if(row['stage'] == "0") { var class_name = "success";var status_name ="Completed" } else if(row['stage'] == "1") { var class_name = "info";var status_name ="Develop" } else if(row['stage'] == "2") { var class_name = "warning";var status_name ="Design"}  else  { var class_name = "violet";var status_name ="Plan"}
					return '<div class="pipeline-progress d-flex align-items-center"><div class="progress"><div class="progress-bar progress-bar-'+class_name+'" role="progressbar"></div></div><span>'+status_name+'</span></div>';
					}
				},   
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" }  else { var class_name = "bg-danger";var status_name ="Inactive"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},       
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item " data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_project"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-clipboard-copy text-green"></i> Clone this Project</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-printer"></i> Print</a><a class="dropdown-item" href="javascript:void(0);"><i class="ti ti-subtask"></i> Add New Task</a></div></div>';
				}},
				
			]
				
		});
	}
});