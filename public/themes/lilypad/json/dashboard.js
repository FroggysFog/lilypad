document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#deal-project')) {
		new DataTable('#deal-project', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"deal_name" : "Annual Software",
					"stage" : "Appointment",
					"deal_value" : "$19,94,938",
					"owner_name" : "Robert Johnson",
					"owner_img" : "assets/img/profiles/avatar-21.jpg",
					"tags" : "0",
					"probability" : "90%",
					"status" : "3"
				},
				{
					"id" : 2,
					"deal_name" : "CRM Onboarding",
					"stage" : "Appointment",
					"deal_value" : "$15,44,540",
					"owner_name" : "Isabella Cooper",
					"owner_img" : "assets/img/profiles/avatar-04.jpg",
					"tags" : "1",
					"probability" : "90%",
					"status" : "1"
				},
				{
					"id" : 3,
					"deal_name" : "Enterprise Plan",
					"stage" : "Contact Made",
					"deal_value" : "$10,36,390",
					"owner_name" : "John Smith",
					"owner_img" : "assets/img/profiles/avatar-06.jpg",
					"tags" : "2",
					"probability" : "80%",
					"status" : "3"
				},
				{
					"id" : 4,
					"deal_name" : "BrightWorks",
					"stage" : "Presentation",
					"deal_value" : "$16,11,420",
					"owner_name" : "Sophia Parker",
					"owner_img" : "assets/img/profiles/avatar-12.jpg",
					"tags" : "0",
					"probability" : "72%",
					"status" : "3"
				},
				{
					"id" : 5,
					"deal_name" : "Sales Pipeline",
					"stage" : "Proposal Made",
					"deal_value" : "$90,59,472",
					"owner_name" : "Emma Reynolds",
					"owner_img" : "assets/img/profiles/avatar-18.jpg",
					"tags" : "3",
					"probability" : "60%",
					"status" : "2"
				}
		
			],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<a href="deals_details" class="fw-medium">'+row['deal_name']+'</a>';
				}},
				{ "data": "stage" },
				{ "data": "deal_value" },
				{ "render": function ( data, type, row ){
					if(row['tags'] == "0") { var class_name = "badge-soft-secondary border-secondary";var tags_name ="Rated" } 
					else if(row['tags'] == "1") { var class_name = "badge-soft-success border-success";var tags_name ="Collab" }                 
					else if(row['status'] == "2") { var class_name = "badge-soft-danger border-danger";var tags_name ="Rejected" } 
					else { var class_name = "badge-soft-purple border-purple";var tags_name ="Promotion"}
					return '<span class="badge badge-pill border '+class_name+'" >'+tags_name+'</span>';
				}},
				{ "render": function ( data, type, row ){
					return '<p class="d-flex align-items-center fs-14 mb-0"><a href="#" class="avatar avatar-sm avatar-rounded border me-2"><img class="img-fluid" src="'+row['owner_img']+'" alt="User Image"></a><a href="#">'+row['owner_name']+'</a></p>';
				}},   
				{ "render": function ( data, type, row ){ 
					return '<p class="text-dark">'+row['probability']+'</p>'; 
				}},         
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-indigo";var status_name ="Open" } 
					else if(row['status'] == "1") { var class_name = "bg-danger";var status_name ="Lost" } 
					else if(row['status'] == "2") { var class_name = "bg-indigo";var status_name ="Open" }else { var class_name = "bg-success";var status_name ="Won"}
					return '<span class="badge badge-pill  '+class_name+'" >'+status_name+'</span>';
				}},
			]
		});
	}

	if (document.querySelector('#recent-deals')) {
		new DataTable('#recent-deals', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"deal_name" : "SkyHigh Annual Booking",
					"stage" : "Appointment",
					"deal_value" : "$78,11,800",
					"status" : "0"
				},		
				{
					"id" : 2,
					"deal_name" : "CRM Onboarding Package",
					"stage" : "Appointment",
					"deal_value" : "$72,11,289",
					"status" : "1"
				},		
				{
					"id" : 3,
					"deal_name" : "Enterprise Plan Upgrade",
					"stage" : "Appointment",
					"deal_value" : "$16,11,457",
					"status" : "0"
				},		
				{
					"id" : 4,
					"deal_name" : "CRM Migration Project",
					"stage" : "Appointment",
					"deal_value" : "$85,11,789",
					"status" : "0"
				},		
				{
					"id" : 5,
					"deal_name" : "Project Management",
					"stage" : "Appointment",
					"deal_value" : "$65,12,589",
					"status" : "0"
				},		
			],
			"columns": [				
				{ "render": function ( data, type, row ){ 
					return '<p class="text-dark fw-medium mb-1"><a href="deals_details.html">'+row['deal_name']+'</a></p><p class="mb-0">'+row['stage']+'</p>'; 
				}},   
				{ "render": function ( data, type, row ){ 
					return '<p class="text-dark mb-0">'+row['deal_value']+'</p>'; 
				}},   
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-soft-success text-success";var status_name ="Won" } 
					else { var class_name = "bg-soft-danger text-danger";var status_name ="Lost"}
					return '<span class="badge badge-pill  '+class_name+'" >'+status_name+'</span>';
				}},
			]
		});
	}

	if (document.querySelector('#executive-project')) {
		new DataTable('#executive-project', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"executive_img" : "assets/img/profiles/avatar-25.jpg",
					"executive_name" : "Robert Johnson",
					"deal" : "98",
					"deal-status" : "0",
					"revenue" : "$7500",
					"conversion" : "0",
					"conversion_name" : "100%",
					"status" : "0",
				},		
				{
					"id" : 2,
					"executive_img" : "assets/img/profiles/avatar-04.jpg",
					"executive_name" : "Isabella Cooper",
					"deal" : "87",
					"deal-status" : "0",
					"revenue" : "$2000",
					"conversion" : "0",
					"conversion_name" : "100%",
					"status" : "0",
				},		
				{
					"id" : 3,
					"executive_img" : "assets/img/profiles/avatar-27.jpg",
					"executive_name" : "John Smith",
					"deal" : "56",
					"deal-status" : "1",
					"revenue" : "$1600",
					"conversion" : "1",
					"conversion_name" : "85%",
					"status" : "1",
				},		
				{
					"id" : 4,
					"executive_img" : "assets/img/profiles/avatar-07.jpg",
					"executive_name" : "Sophia Parker",
					"deal" : "10",
					"deal-status" : "2",
					"revenue" : "$600",
					"conversion" : "2",
					"conversion_name" : "30%",
					"status" : "2",
				},		
				{
					"id" : 5,
					"executive_img" : "assets/img/profiles/avatar-08.jpg",
					"executive_name" : "Ethan Reynolds",
					"deal" : "87",
					"deal-status" : "0",
					"revenue" : "$2800",
					"conversion" : "0",
					"conversion_name" : "100%",
					"status" : "0",
				},			
				{
					"id" : 6,
					"executive_img" : "assets/img/profiles/avatar-09.jpg",
					"executive_name" : "Liam Carter",
					"deal" : "87",
					"deal-status" : "1",
					"revenue" : "$6955",
					"conversion" : "1",
					"conversion_name" : "85%",
					"status" : "2",
				},		
			],
			"columns": [				
				{ "render": function ( data, type, row ){
					return '<p class="d-flex align-items-center fs-14 mb-0"><a href="#" class="avatar avatar-sm avatar-rounded border me-2"><img class="img-fluid" src="'+row['executive_img']+'" alt="User Image"></a><a href="#">'+row['executive_name']+'</a></p>';
				}},     
				{ "render": function ( data, type, row ) {
						// 1. Initialize variables at the top so they are always "defined"
						var class_name = "";
						var deal_text = row['deal'] ? row['deal'] : ""; 

						// 2. Assign classes based on the status
						if (row['deal-status'] == "0") { 
							class_name = "text-success";
						} 
						else if (row['deal-status'] == "1") { 
							class_name = "text-info";
						}
						else { 
							class_name = "text-danger";
						}

					return '<p class="fw-medium mb-0 ' + class_name + '">' + deal_text + '</p>';
				}},
				{ "data": "revenue" },
				{ "render": function ( data, type, row ) {
						// 1. Initialize variables at the top so they are always "defined"
						var class_name = "";
						var conv_text = row['conversion_name'] ? row['conversion_name'] : ""; 

						// 2. Assign classes based on the status
						if (row['conversion'] == "0") { 
							class_name = "badge-soft-success";
						} 
						else if (row['conversion'] == "1") { 
							class_name = "badge-soft-info";
						}
						else { 
							class_name = "badge-soft-primary";
						}

					return '<span class="badge badge-pill ' + class_name + '">' + conv_text + '</span>';
				}},
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success text-white";var status_name ="Excellent" } 
					else if(row['status'] == "1") { var class_name = "bg-info text-white"; var status_name ="Good"}
					else { var class_name = "bg-danger text-white";var status_name ="Average"}
					return '<span class="badge badge-pill  '+class_name+'" >'+status_name+'</span>';
				}},
			]
		});
	}

});