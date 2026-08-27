document.addEventListener('DOMContentLoaded', function () { 

    if (document.querySelector('#deals-project')) {
		new DataTable('#deals-project', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"deal_name" : "SkyHigh Annual Booking",
					"stage" : "Appointment",
					"deal_value" : "$04,51,000",
					"status" : "2"
				},
				{
					"id" : 2,
					"deal_name" : "CRM Onboarding Package",
					"stage" : "Contact Made",
					"deal_value" : "$72,14,078",
					"status" : "1"
				},
				{
					"id" : 3,
					"deal_name" : "Enterprise Plan Upgrade",
					"stage" : "Presentation",
					"deal_value" : "$04,14,800",
					"status" : "2"
				},
				{
					"id" : 4,
					"deal_name" : "CRM Migration Project",
					"stage" : "Proposal Made",
					"deal_value" : "$16,11,400",
					"status" : "1"
				},
				{
					"id" : 5,
					"deal_name" : "Sales Automation",
					"stage" : "Presentation",
					"deal_value" : "$09,05,947",
					"status" : "2"
				},
				{
					"id" : 6,
					"deal_name" : "Premium Subscription",
					"stage" : "Qualify To Buy",
					"deal_value" : "$05,05,578",
					"status" : "1"
				},
				{
					"id" : 7,
					"deal_name" : "Revenue Accelerator",
					"stage" : "Contact Made",
					"deal_value" : "$15,25,123",
					"status" : "1"
				}
		
			],
		"columns": [
			{ "render": function ( data, type, row ){
				return '<a href="deals-details.html" class="fw-medium">'+row['deal_name']+'</a>';
			}},
			{ "data": "stage" },
			{ "data": "deal_value" },
			{ "render": function ( data, type, row ){
				if(row['status'] == "0") { var class_name = "bg-pending";var status_name ="Open" } if(row['status'] == "1") { var class_name = "bg-danger";var status_name ="Lost" } else { var class_name = "bg-success";var status_name ="Won"}
				return '<span class="badge badge-pill  '+class_name+'" >'+status_name+'</span>';
			}},
		]
	});
	}

});