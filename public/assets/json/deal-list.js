document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#deal_list')) {
		new DataTable('#deal_list', {
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
				"data": [
					{
						"id": 1,
						"Deal_Name": "Collins",
						"Stage": "Qualify To Buy",
						"Deal_Value": "$04,51,000",
						"tag1": "Collab",
						"close_date": "25 Sep 2025",
						"created_date" : "25 Sep 2025, 01:22 pm",
						"owner" : "Hendry Milner",
						"source" : "Paid Social",
						"Probability": "90%",
						"Status": "0"
					},
					{
						"id": 2,
						"Deal_Name": "Konopelski",
						"Stage": "Proposal Made",
						"Deal_Value": "$03,12,500",
						"tag1": "Rated",
						"close_date": "29 Sep 2025",
						"created_date" : "29 Sep 2025, 04:15 pm",
						"owner" : "Guilory Berggren",
						"source" : "Referrals",
						"Probability": "15 %",
						"Status": "1"
					},
					{
						"id": 3,
						"Deal_Name": "Adams",
						"Stage": "Contact Made",
						"Deal_Value": "$04,14,800",
						"tag1": "Rejected",
						"close_date": "04 Oct 2025",
						"created_date" : "04 Oct 2025, 10:18 am",
						"owner" : "Jami Carlile",
						"source" : "Campaigns",
						"Probability": "95 %",
						"Status": "0"
					},
					{
						"id": 4,
						"Deal_Name": "Schumm",
						"Stage": "Qualify To Buy",
						"Deal_Value": "$11,14,400",
						"tag1": "Collab",
						"close_date": "15 Oct 2025",
						"created_date" : "17 Oct 2025, 03:31 pm",
						"owner" : "Theresa Nelson",
						"source" : "Google",
						"Probability": "99 %",
						"Status": "0"
					},
					{
						"id": 5,
						"Deal_Name": "Wisozk",
						"Stage": "Presentation",
						"Deal_Value": "$16,11,400",
						"tag1": "Rated",
						"close_date": "27 Oct 2025",
						"created_date" : "24 Oct 2025, 09:14 pm",
						"owner" : "Smith Cooper",
						"source" : "Paid Social",
						"Probability": "10 %",
						"Status": "2"
					},
					{
						"id": 6,
						"Deal_Name": "Heller",
						"Stage": "Appointment",
						"Deal_Value": "$78,11,800",
						"tag1": "Rated",
						"close_date": "07 Nov 2025",
						"created_date" : "08 Nov 2025, 09:56 am",
						"owner" : "Martin Lewis",
						"source" : "Referrals",
						"Probability": "70 %",
						"Status": "0"
					},
					{
						"id": 7,
						"Deal_Name": "Gutkowski",
						"Stage": "Proposal Made",
						"Deal_Value": "$09,05,947",
						"tag1": "Promotion",
						"close_date": "12 Nov 2025",
						"created_date" : "14 Nov 2025, 04:19 pm",
						"owner" : "Newell Egan",
						"source" : "Campaigns",
						"Probability": "10 %",
						"Status": "2"
					},
					{
						"id": 8,
						"Deal_Name": "Walter",
						"Stage": "Qualify To Buy",
						"Deal_Value": "$04,51,000",
						"tag1": "Rejected",
						"close_date": "23 Nov 2025",
						"created_date" : "23 Nov 2025, 11:14 pm",
						"owner" : "Janet Carlson",
						"source" : "Google",
						"Probability": "90 %",
						"Status": "0"
					},
					{
						"id": 9,
						"Deal_Name": "Hansen",
						"Stage": "Appointment",
						"Deal_Value": "$72,14,078",
						"tag1": "Collab",
						"close_date": "11 Dec 2025",
						"created_date" : "10 Dec 2025, 06:43 am",
						"owner" : "Craig Brown",
						"source" : "Paid Social",
						"Probability": "40 %",
						"Status": "0"
					},
					{
						"id": 10,
						"Deal_Name": "Leuschke",
						"Stage": "Proposal Made",
						"Deal_Value": "$09,05,947",
						"tag1": "Rated",
						"close_date": "17 Dec 2025",
						"created_date" : "25 Dec 2025, 08:17 pm",
						"owner" : "Daniel Byrne",
						"source" : "Referrals",
						"Probability": "47 %",
						"Status": "1"
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
					return '<a href="deals-details.html" class="title-name">'+row['Deal_Name']+'</a>';
				}},
				{ "data": "Stage" },
				{ "data": "Deal_Value" },
				{ "render": function ( data, type, row ){
					if(row['tag1'] == "Collab") { var class_name = "badge-soft-success";var status_name ="Collab" }else if(row['tag1'] == "Rated") { var class_name = "badge-soft-warning";var status_name ="Rated" } else if(row['tag1'] == "Promotion"){ var class_name = "badge-soft-info";var status_name ="Promotion"} else { var class_name = "badge-soft-danger";var status_name ="Rejected"}
					return '<span class="badge badge-tag '+class_name+'" >'+status_name+'</span>';
				}},
				{ "data": "close_date" },
				{ "data": "Probability" },
				{ "render": function ( data, type, row ){
					if(row['Status'] == "0") { var class_name = "bg-success";var status_name ="Won" }else if(row['Status'] == "1"){ var class_name = "bg-danger";var status_name ="Lost"} else { var class_name = "bg-purple";var status_name ="open"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#"><i class="ti ti-bounce-right"></i> Add Activity</a><a class="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#offcanvas_edit" href="#"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_deal"><i class="ti ti-trash"></i> Delete</a><a class="dropdown-item" href="deals-details.html"><i class="ti ti-eye text-blue-light"></i> Preview</a></div></div>';
				}}
			]
		});
	}

});