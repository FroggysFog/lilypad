document.addEventListener('DOMContentLoaded', function () {     

    if (document.querySelector('#companieslist')) {
		new DataTable('#companieslist', {
				"searching": false, 
				"info": false,
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
						"company_name" : "NovaWave LLC",
						"company_image" : "assets/img/icons/company-icon-01.svg",
						"phone" : "+1 875455453",
						"email" : "robertson@example.com",
						"location" : "Germany",
						"tag" : "0",
						"rating" : "4.2",
						"owner" : "Hendry Milner",
						"owner_image": "assets/img/profiles/avatar-01.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Paid Social",
						"won_deals": "5 Deals, $100000",
						"lost_deals": "2 Deals, $80000",
						"created_date": "25 Sep 2025, 01:22 pm"
					},
					{
						"id" : 2,
						"si_no" : "",
						"select" : "",
						"company_name" : "BlueSky Industries",
						"company_image" : "assets/img/icons/company-icon-02.svg",
						"phone" : "+1 989757485",
						"email" : "sharon@example.com",
						"location" : "USA",
						"tag" : "0",
						"rating" : "5.0",
						"owner" : "Guilory Berggren",
						"owner_image": "assets/img/profiles/avatar-06.jpg",
						"status" : "1",
						"Action" : "",
						"source": "Referrals",
						"won_deals": "4 Deals, $120000",
						"lost_deals": "3 Deals, $90000",
						"created_date": "29 Sep 2025, 04:15 pm"
					},
					{
						"id" : 3,
						"si_no" : "",
						"select" : "",
						"company_name" : "SilverHawk",
						"company_image" : "assets/img/icons/company-icon-03.svg",
						"phone" : "+1 546555455",
						"email" : "vaughan12@example.com",
						"location" : "Canada",
						"tag" : "0",
						"rating" : "3.5",
						"owner" : "Jami Carlile",
						"owner_image": "assets/img/profiles/avatar-13.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Campaigns",
						"won_deals": "3 Deals, $110000",
						"lost_deals": "2 Deals, $70000",
						"created_date": "04 Oct 2025, 10:18 am"
					},
					{
						"id" : 4,
						"si_no" : "",
						"select" : "",
						"company_name" : "SummitPeak",
						"company_image" : "assets/img/icons/company-icon-04.svg",
						"phone" : "+1 454478787",
						"email" : "jessica13@example.com",
						"location" : "India",
						"tag" : "0",
						"rating" : "4.5",
						"owner" : "Theresa Nelson",
						"owner_image": "assets/img/profiles/avatar-17.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Google",
						"won_deals": "6 Deals, $200000",
						"lost_deals": "3 Deals, $100000",
						"created_date": "17 Oct 2025, 03:31 pm"
					},
					{
						"id" : 5,
						"si_no" : "",
						"select" : "",
						"company_name" : "RiverStone Ventur",
						"company_image" : "assets/img/icons/company-icon-05.svg",
						"phone" : "+1 124547845",
						"email" : "caroltho3@example.com",
						"location" : "China",
						"tag" : "0",
						"rating" : "4.7",
						"owner" : "Smith Cooper",
						"owner_image": "assets/img/profiles/avatar-14.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Paid Social",
						"won_deals": "3 Deals, $80000",
						"lost_deals": "1 Deal, $40000",
						"created_date": "24 Oct 2025, 09:14 pm"
					},
					{
						"id" : 6,
						"si_no" : "",
						"select" : "",
						"company_name" : "Bright Bridge Grp",
						"company_image" : "assets/img/icons/company-icon-06.svg",
						"phone" : "+1 478845447",
						"email" : "dawnmercha@example.com",
						"location" : "Martin Lewis",
						"tag" : "0",
						"rating" : "5.0",
						"owner" : "Martin Lewis",
						"owner_image": "assets/img/profiles/avatar-20.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Referrals",
						"won_deals": "5 Deals, $95000",
						"lost_deals": "2 Deals, $60000",
						"created_date": "08 Nov 2025, 09:56 am"
					},
					{
						"id" : 7,
						"si_no" : "",
						"select" : "",
						"company_name" : "CoastalStar Co.",
						"company_image" : "assets/img/icons/company-icon-07.svg",
						"phone" : "+1 215544845",
						"email" : "rachel@example.com",
						"location" : "Indonesia",
						"tag" : "0",
						"rating" : "3.1",
						"owner" : "Newell Egan",
						"owner_image": "assets/img/profiles/avatar-15.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Campaigns",
						"won_deals": "4 Deals, $100000",
						"lost_deals": "1 Deal, $50000",
						"created_date": "14 Nov 2025, 04:19 pm"
					},
					{
						"id" : 8,
						"si_no" : "",
						"select" : "",
						"company_name" : "HarborView",
						"company_image" : "assets/img/icons/company-icon-08.svg",
						"phone" : "+1 121145471",
						"email" : "jonelle@example.com",
						"location" : "Cuba",
						"tag" : "2",
						"rating" : "5.0",
						"owner" : "Janet Carlson",
						"owner_image": "assets/img/profiles/avatar-04.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Google",
						"won_deals": "3 Deals, $70000",
						"lost_deals": "3 Deals, $80000",
						"created_date": "23 Nov 2025, 11:14 pm"
					},
					{
						"id" : 9,
						"si_no" : "",
						"select" : "",
						"company_name" : "Golden Gate Ltd",
						"company_image" : "assets/img/icons/company-icon-09.svg",
						"phone" : "+1 321454789",
						"email" : "jonathan@example.com",
						"location" : "Isreal",
						"tag" : "2",
						"rating" : "2.7",
						"owner" : "Craig Brown",
						"owner_image": "assets/img/profiles/avatar-21.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Referrals",
						"won_deals": "6 Deals, $130000",
						"lost_deals": "4 Deals, $100000",
						"created_date": "10 Dec 2025, 06:43 am"
					},
					{
						"id" : 10,
						"si_no" : "",
						"select" : "",
						"company_name" : "Redwood Inc",
						"company_image" : "assets/img/icons/company-icon-10.svg",
						"phone" : "+1 278907145",
						"email" : "brook@example.com",
						"location" : "Colombia",
						"tag" : "2",
						"rating" : "3.0",
						"owner" : "Daniel Byrne",
						"owner_image": "assets/img/profiles/avatar-23.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Campaigns",
						"won_deals": "5 Deals, $90000",
						"lost_deals": "2 Deals, $55000",
						"created_date": "25 Dec 2025, 08:17 pm"
					},
					{
						"id" : 11,
						"si_no" : "",
						"select" : "",
						"company_name" : "SilverHawk",
						"company_image" : "assets/img/icons/company-icon-03.svg",
						"phone" : "+1 546555455",
						"email" : "vaughan12@example.com",
						"location" : "Canada",
						"tag" : "0",
						"rating" : "3.5",
						"owner" : "Jami Carlile",
						"owner_image": "assets/img/profiles/avatar-25.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Paid Social",
						"won_deals": "5 Deals, $100000",
						"lost_deals": "2 Deals, $80000",
						"created_date": "25 Sep 2025, 01:22 pm"
					},
					{
						"id" : 12,
						"si_no" : "",
						"select" : "",
						"company_name" : "SummitPeak",
						"company_image" : "assets/img/icons/company-icon-04.svg",
						"phone" : "+1 454478787",
						"email" : "jessica13@example.com",
						"location" : "India",
						"tag" : "0",
						"rating" : "4.5",
						"owner" : "Theresa Nelson",
						"owner_image": "assets/img/profiles/avatar-26.jpg",
						"status" : "0",
						"Action" : "",
						"source": "Google",
						"won_deals": "3 Deals, $70000",
						"lost_deals": "3 Deals, $80000",
						"created_date": "23 Nov 2025, 11:14 pm"
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
					return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="company-details.html" class="avatar avatar-sm border rounded-circle p-1 me-2"><img class="w-auto h-auto" src="'+row['company_image']+'" alt="User Image"></a><a href="company-details.html" class="d-flex flex-column fw-medium">'+row['company_name']+'</a></h6>';
				}},
				{ "data": "email" },
				{ "render": function (data, type, row) {
						var class_name, status_name;
						if (row['tag'] == "0") {
							class_name = "badge-soft-success";
							status_name = "Collab";
						} else if (row['tag'] == "1") {
							class_name = "badge-soft-warning";
							status_name = "VIP";
						} else if (row['tag'] == "3") {
							class_name = "badge-soft-info";
							status_name = "Premium";
						} else {
							class_name = "badge-soft-primary";
							status_name = "Promotion";
						}
						
						return '<span class="badge badge-tag ' + class_name + '" >' + status_name + '</span>';
				}},
				{ "render": function (data, type, row) {
						return '<div class="d-flex align-items-center mb-0"><a href="javascript:void(0);" class="avatar avatar-xss me-2"><img class="img-fluid rounded-circle" src="' + row['owner_image'] + '" alt="User Image"></a>' + row['owner'] + '</div>';
				}},
				{ "render": function ( data, type, row ){
					return '<ul class="social-links d-flex align-items-center"><li><a href="#"><i class="ti ti-mail"></i></a></li><li><a href="#"><i class="ti ti-phone-check"></i></a></li><li><a href="#"><i class="ti ti-message-circle-share"></i></a></li><li><a href="#"><i class="ti ti-brand-facebook "></i></a></li></ul>';
				}},
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="javascript:void(0);" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_contact"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="company-details.html"><i class="ti ti-eye text-blue-light"></i> Preview</a></div></div>';
				}}
			]
		});
	}
    
});