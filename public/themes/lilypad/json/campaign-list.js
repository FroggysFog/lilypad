document.addEventListener('DOMContentLoaded', function () { 

    if (document.querySelector('#campaign-list')) {
		new DataTable('#campaign-list', {
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
						"si_no" : "",
						"star" : "",
						"name" : "Distribution",
						"type" : "Public Relations",
						"mem_image1" : "assets/img/profiles/avatar-14.jpg",
						"mem_image2": "assets/img/profiles/avatar-15.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
						"start_date" : "25 Sep 2025",
						"end_date" : "29 Sep 2025",
						"created_date" : "25 Sep 2025",
						"open" : "40.5%",
						"close" : "20.5%",
						"unscubscribe" : "30.5%",
						"delivered" : "70.5%",
						"converstion" : "35.0%",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 2,
						"si_no" : "",
						"star" : "",
						"name" : "Merchandising",
						"type" : "Content Marketing",
						"mem_image1" : "assets/img/profiles/avatar-17.jpg",
						"mem_image2": "assets/img/profiles/avatar-18.jpg",
						"mem_image3": "assets/img/profiles/avatar-19.jpg",
						"start_date" : "03 Oct 2025",
						"end_date" : "16 Oct 2025",
						"created_date" : "03 Oct 2025",
						"open" : "65.5%",
						"close" : "83.5%",
						"unscubscribe" : "67.5%",
						"delivered" : "32.0%",
						"converstion" : "22.5%",
						"status" : "1",
						"Action" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"star" : "",
						"name" : "Pricing",
						"type" : "Social Marketing",
						"mem_image1" : "assets/img/profiles/avatar-20.jpg",
						"mem_image2": "assets/img/profiles/avatar-21.jpg",
						"mem_image3": "assets/img/profiles/avatar-22.jpg",
						"start_date" : "17 Oct 2025",
						"end_date" : "28 Oct 2025",
						"created_date" : "17 Oct 2025",
						"open" : "64.0%",
						"close" : "97.0%",
						"unscubscribe" : "14.5%",
						"delivered" : "38.5%",
						"converstion" : "53.0%",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 4,
						"si_no" : "",
						"star" : "",
						"name" : "Increased sales",
						"type" : "Brand",
						"mem_image1" : "assets/img/profiles/avatar-23.jpg",
						"mem_image2": "assets/img/profiles/avatar-24.jpg",
						"mem_image3": "assets/img/profiles/avatar-25.jpg",
						"start_date" : "07 Nov 2025",
						"end_date" : "14 Nov 2025",
						"created_date" : "07 Nov 2025",
						"open" : "32.5%",
						"close" : "57.0%",
						"unscubscribe" : "26.3%",
						"delivered" : "65.8%",
						"converstion" : "17.4%",
						"status" : "2",
						"Action" : ""
					},
					{
						"id" : 5,
						"si_no" : "",
						"star" : "",
						"name" : "Brand recognition",
						"type" : "Sales",
						"mem_image1" : "assets/img/profiles/avatar-26.jpg",
						"mem_image2": "assets/img/profiles/avatar-27.jpg",
						"mem_image3": "assets/img/profiles/avatar-01.jpg",
						"start_date" : "19 Nov 2025",
						"end_date" : "26 Nov 2025",
						"created_date" : "19 Nov 2025",
						"open" : "72.6%",
						"close" : "53.5%",
						"unscubscribe" : "16.5%",
						"delivered" : "83.0%",
						"converstion" : "29.3%",
						"status" : "3",
						"Action" : ""
					},
					{
						"id" : 6,
						"si_no" : "",
						"star" : "",
						"name" : "Enhanced brand",
						"type" : "Media",
						"mem_image1" : "assets/img/profiles/avatar-02.jpg",
						"mem_image2": "assets/img/profiles/avatar-03.jpg",
						"mem_image3": "assets/img/profiles/avatar-04.jpg",
						"start_date" : "02 Dec 2025",
						"end_date" : "13 Dec 2025",
						"created_date" : "02 Dec 2025",
						"open" : "56.3%",
						"close" : "20.5%",
						"unscubscribe" : "30.5%",
						"delivered" : "70.5%",
						"converstion" : "35.0%",
						"status" : "4",
						"Action" : ""
					},
					{
						"id" : 7,
						"si_no" : "",
						"star" : "",
						"name" : "Repeat customers",
						"type" : "Rebranding",
						"mem_image1" : "assets/img/profiles/avatar-06.jpg",
						"mem_image2": "assets/img/profiles/avatar-07.jpg",
						"mem_image3": "assets/img/profiles/avatar-08.jpg",
						"start_date" : "17 Dec 2025",
						"end_date" : "27 Dec 2025",
						"created_date" : "17 Dec 2025",
						"open" : "63.2%",
						"close" : "20.5%",
						"unscubscribe" : "30.5%",
						"delivered" : "70.5%",
						"converstion" : "87.8%",
						"status" : "0",
						"Action" : ""
					},
					{
						"id" : 8,
						"si_no" : "",
						"star" : "",
						"name" : "Competitor ",
						"type" : "Product launch",
						"mem_image1" : "assets/img/profiles/avatar-09.jpg",
						"mem_image2": "assets/img/profiles/avatar-10.jpg",
						"mem_image3": "assets/img/profiles/avatar-11.jpg",
						"start_date" : "06 Jan 2024",
						"end_date" : "17 Jan 2024",
						"created_date" : "06 Jan 2024",
						"open" : "40.5%",
						"close" : "52.7%",
						"unscubscribe" : "13.5%",
						"delivered" : "70.5%",
						"converstion" : "35.0%",
						"status" : "4",
						"Action" : ""
					}
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select"><i class="ti ti-star-filled"></i></div>';
				}},
				{ "data": "name" },
				{ "data": "type" },
				{ "render": function ( data, type, row ){
					return '<ul class="list-progress d-flex gap-3"><li><h6 class="fs-14 fw-semibold mb-1">'+row['open']+'</h6><p class="fs-13 mb-0">Opened</p></li><li><h6 class="fs-14 fw-semibold mb-1">'+row['close']+'</h6><p class="fs-13 mb-0">Closed</p></li><li><h6 class="fs-14 fw-semibold mb-1">'+row['unscubscribe']+'</h6><p class="fs-13 mb-0">Unsubscribe</p></li><li><h6 class="fs-14 fw-semibold mb-1">'+row['delivered']+'</h6><p class="fs-13 mb-0">Delivered</p></li><li><h6 class="fs-14 fw-semibold mb-1">'+row['converstion']+'</h6><p class="fs-13 mb-0">Conversation</p></li></ul>';
				}},
				{
					"render": function (data, type, row) {
					return '<ul class="avatar-list-stacked avatar-group-sm"><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="'+row['mem_image1']+'" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="'+row['mem_image2']+'" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0"><a href="#"><img src="'+row['mem_image3']+'" alt="img"></a></li><li class="avatar avatar-rounded flex-shrink-0 bg-light fs-10"><a href="#">3+</a></li></ul>';
					}
				},               			
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "success";var status_name ="Success" } else if(row['status'] == "1") { var class_name = "warning";var status_name ="Pending" } else if(row['status'] == "2") { var class_name = "danger";var status_name ="Bounced" } else if(row['status'] == "3") { var class_name = "green";var status_name ="Running" } else { var class_name = "info";var status_name ="Paused"}
					return '<span class="badge badge-pill badge-status bg-'+class_name+'" >'+status_name+'</span>';
				}},           
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_campaign"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}},
				
			]
				
		});
	}
});