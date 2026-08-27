document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#leads_reports')) {
		new DataTable('#leads_reports', {
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
						"select" : "",
						"lead_image" : "assets/img/users/avatar-4.jpg",
						"lead_name" : "Elizabeth Morgan",
						"company_name" : "NovaWave LLC",
						"company_image" : "assets/img/company/company-01.svg",
						"company_address" : "New York, USA",
						"phone" : "+1 875455453",
						"created_date" : "25 Sep 2025, 01:22 pm",
						"owner_image" : "assets/img/profiles/avatar-01.jpg",
						"owner" : "Robert Johnson",
						"status" : "0",
					},
					{
						"id" : 2,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/avatar-8.jpg",
						"lead_name" : "Katherine Brooks",
						"company_name" : "BlueSky Industries",
						"company_image" : "assets/img/company/company-02.svg",
						"company_address" : "Toronto, Canada",
						"phone" : "+1 98975 17485",
						"created_date" : "03 Feb 2025, 09:45 AM",
						"owner_image" : "assets/img/profiles/avatar-04.jpg",
						"owner" : "Isabella Cooper",
						"status" : "1",
					},
					{
						"id" : 3,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/user-02.jpg",
						"lead_name" : "Samantha Reed",
						"company_name" : "Silver Hawk",
						"company_image" : "assets/img/company/company-03.svg",
						"company_address" : "London, UK",
						"phone" : "+1 54655 25455",
						"created_date" : "14 Mar 2025, 06:10 PM",
						"owner_image" : "assets/img/profiles/avatar-03.jpg",
						"owner" : "John Smith",
						"status" : "0",
					},
					{
						"id" : 4,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/user-03.jpg",
						"lead_name" : "William Anderson",
						"company_name" : "Summit  Peak",
						"company_image" : "assets/img/company/company-04.svg",
						"company_address" : "Sydney, Australia",
						"phone" : "+1 45447 58787",
						"created_date" : "29 Apr 2025, 11:00 AM",
						"owner_image" : "assets/img/profiles/avatar-07.jpg",
						"owner" : "Sophia Parker",
						"status" : "2",
					},
					{
						"id" : 5,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/profiles/avatar-10.jpg",
						"lead_name" : "Jonathan Mitchell",
						"company_name" : "RiverStone Ltd",
						"company_image" : "assets/img/company/company-05.svg",
						"company_address" : "Berlin, Germany",
						"phone" : "+1 12454 27845",
						"created_date" : "07 May 2025, 04:35 PM",
						"owner_image" : "assets/img/profiles/avatar-08.jpg",
						"owner" : "Ethan Reynolds",
						"status" : "0",
					},
					{
						"id" : 6,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/user-06.jpg",
						"lead_name" : "Jennifer Adams",
						"company_name" : "Bright Bridge Grp",
						"company_image" : "assets/img/company/company-06.svg",
						"company_address" : "Tokyo, Japan",
						"phone" : "+1 47884 75447",
						"created_date" : "18 Jun 2025, 08:20 AM",
						"owner_image" : "assets/img/profiles/avatar-09.jpg",
						"owner" : "Liam Carter",
						"status" : "0",
					},
					{
						"id" : 7,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/user-11.jpg",
						"lead_name" : "Alexander Carter",
						"company_name" : "CoastalStar Co.",
						"company_image" : "assets/img/company/company-07.svg",
						"company_address" : "Paris, France",
						"phone" : "+1 21554 34845",
						"created_date" : "18 Apr 2025, 08:00 AM",
						"owner_image" : "assets/img/profiles/avatar-11.jpg",
						"owner" : "Noah Mitchell",
						"status" : "0",
					},
					{
						"id" : 8,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/user-12.jpg",
						"lead_name" : "Benjamin Harrison",
						"company_name" : "HarborView",
						"company_image" : "assets/img/company/company-08.svg",
						"company_address" : "Dubai, UAE",
						"phone" : "+1 12114 65471",
						"created_date" : "05 Feb 2025, 10:45 AM",
						"owner_image" : "assets/img/profiles/avatar-16.jpg",
						"owner" : "Mason Hayes",
						"status" : "0",
					},
					{
						"id" : 9,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/user-14.jpg",
						"lead_name" : "Nicholas Wright",
						"company_name" : "Golden Gate Ltd",
						"company_image" : "assets/img/company/company-09.svg",
						"company_address" : "Mumbai, India",
						"phone" : "+1 32145 54789",
						"created_date" : "15 Jan 2025, 02:02 PM",
						"owner_image" : "assets/img/profiles/avatar-17.jpg",
						"owner" : "Ron Thompson",
						"status" : "0",
					},
					{
						"id" : 10,
						"si_no" : "",
						"select" : "",
						"lead_image" : "assets/img/users/user-16.jpg",
						"lead_name" : "Alexandra Bennett",
						"company_name" : "Redwood Inc",
						"company_image" : "assets/img/company/company-10.svg",
						"company_address" : "Tokyo, Japan",
						"phone" : "+1 27890 17145",
						"created_date" : "12 Mar 2025, 08:00 PM",
						"owner_image" : "assets/img/profiles/avatar-17.jpg",
						"owner" : "James Bennett",
						"status" : "3",
					}
				],
			"columns": [
				{ "render": function (data, type, row) {
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select"><i class="ti ti-star-filled fs-16"></i></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex fs-14 align-items-center fw-medium mb-0"><a href="#" class="avatar avatar-rounded border me-2"><img src="'+row['lead_image']+'" alt="User Image"></a><a href="#" class="d-flex flex-column">'+row['lead_name']+'</a></h6>';
				}},
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex fs-14 align-items-center fw-medium mb-0"><a href="company-details.html" class="avatar rounded-circle border me-2"><img class="w-auto h-auto" src="'+row['company_image']+'" alt="User Image"></a><a href="company-details.html" class="d-flex flex-column">'+row['company_name']+'<span class="text-body fs-13 fw-normal mt-1">'+row['company_address']+' </span></a></h6>';
				}},
				{ "data": "phone" },
				{
					"render": function (data, type, row) {
						var class_name, status_name;
						if (row['status'] == "0") {
							class_name = "bg-success";
							status_name = "Closed";
						} else if (row['status'] == "1") {
							class_name = "bg-info";
							status_name = "Not Closed";
						} else if (row['status'] == "2") {
							class_name = "bg-warning";
							status_name = "Contacted";
						} else {
							class_name = "bg-danger";
							status_name = "Lost";
						}
						
						return '<span class="badge badge-tag ' + class_name + '" >' + status_name + '</span>';
					}
				},
				{ "data": "created_date" },
				{ "render": function ( data, type, row ){
					return '<h6 class="d-flex fs-14 align-items-center fw-medium mb-0"><a href="#" class="avatar avatar-rounded border me-2"><img src="'+row['owner_image']+'" alt="User Image"></a><a href="#" class="d-flex flex-column">'+row['owner']+'</a></h6>';
				}}
				
			]
		});
	}

});