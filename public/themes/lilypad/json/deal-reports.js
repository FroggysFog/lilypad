document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#deal_reports')) {
		new DataTable('#deal_reports', {
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
						"Deal_Name": "Annual Software Subscription",
						"Stage": "Appointment",
						"Deal_Value": "$04,51,000",
						"tag": "0",
						"close_date": "25 Sep 2025",
						"Probability": "90%",
						"Status": "0"
					},
					{
						"id": 2,
						"Deal_Name": " CRM Onboarding Package",
						"Stage": "Appointment",
						"Deal_Value": "$03,12,500",
						"tag": "1",
						"close_date": "29 Sep 2025",
						"Probability": "15 %",
						"Status": "1"
					},
					{
						"id": 3,
						"Deal_Name": "Enterprise Plan Upgrade",
						"Stage": "Contact Made",
						"Deal_Value": "$04,14,800",
						"tag": "3",
						"close_date": "04 Oct 2025",
						"Probability": "95 %",
						"Status": "0"
					},
					{
						"id": 4,
						"Deal_Name": "BrightWorks Campaign",
						"Stage": "Presentation",
						"Deal_Value": "$11,14,400",
						"tag": "0",
						"close_date": "15 Oct 2025",
						"Probability": "99 %",
						"Status": "0"
					},
					{
						"id": 5,
						"Deal_Name": "Sales Pipeline Optimization",
						"Stage": "Proposal Made",
						"Deal_Value": "$16,11,400",
						"tag": "0",
						"close_date": "27 Oct 2025",
						"Probability": "10 %",
						"Status": "2"
					},
					{
						"id": 6,
						"Deal_Name": "CRM Migration Project",
						"Stage": "Proposal Made",
						"Deal_Value": "$78,11,800",
						"tag": "0",
						"close_date": "07 Nov 2025",
						"Probability": "70 %",
						"Status": "0"
					},
					{
						"id": 7,
						"Deal_Name": "Multi-Store License Renewal",
						"Stage": "Proposal Made",
						"Deal_Value": "$09,05,947",
						"tag": "2",
						"close_date": "12 Nov 2025",
						"Probability": "10 %",
						"Status": "2"
					},
					{
						"id": 8,
						"Deal_Name": " Custom Feature Development",
						"Stage": "Qualify To Buy",
						"Deal_Value": "$04,51,000",
						"tag": "3",
						"close_date": "23 Nov 2025",
						"Probability": "90 %",
						"Status": "0"
					},
					{
						"id": 9,
						"Deal_Name": "SkyHigh Annual Booking",
						"Stage": "Qualify To Buy",
						"Deal_Value": "$72,14,078",
						"tag": "1",
						"close_date": "11 Dec 2025",
						"Probability": "40 %",
						"Status": "0"
					},
					{
						"id": 10,
						"Deal_Name": "BlueOcean Funding Round",
						"Stage": "Qualify To Buy",
						"Deal_Value": "$09,05,947",
						"tag": "1",
						"close_date": "17 Dec 2025",
						"Probability": "47 %",
						"Status": "1"
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
					return '<a href="deals-details.html" class="title-name">'+row['Deal_Name']+'</a>';
				}},
				{ "data": "Stage" },
				{ "data": "Deal_Value" },
				{ "render": function ( data, type, row ){
					if(row['tag'] == "0") { var class_name = "badge-soft-warning";var status_name ="Rated" }else if(row['tag'] == "1"){ var class_name = "badge-soft-danger";var status_name ="Collab"}else if(row['tag'] == "2"){ var class_name = "badge-soft-primary";var status_name ="Promotion"} else { var class_name = "badge-soft-danger";var status_name ="Rejected"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
				{ "data": "close_date" },
				{ "data": "Probability" },
				{ "render": function ( data, type, row ){
					if(row['Status'] == "0") { var class_name = "bg-success";var status_name ="Won" }else if(row['Status'] == "1"){ var class_name = "bg-danger";var status_name ="Lost"} else { var class_name = "bg-indigo";var status_name ="open"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
			]
		});
	}

});