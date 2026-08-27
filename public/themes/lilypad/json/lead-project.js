document.addEventListener('DOMContentLoaded', function () { 
    if (document.querySelector('#lead-project')) {
		new DataTable('#lead-project', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"lead" : "Collins",
					"lead_name" : "NovaWave LLC",
					"lead_city" : "Newyork, USA",
					"lead_img" : "assets/img/icons/company-icon-01.svg",
					"phone" : "+1 875455453",
					"status" : "1"
				},
				{
					"id" : 2,
					"lead" : "Konopelski",
					"lead_name" : "BlueSky Industries",
					"lead_city" : "Winchester, KY",
					"lead_img" : "assets/img/icons/company-icon-02.svg",
					"phone" : "+1 989757485",
					"status" : "1"
				},
				{
					"id" : 3,
					"lead" : "Adams",
					"lead_name" : "Silver Hawk",
					"lead_city" : "Jametown, NY",
					"lead_img" : "assets/img/icons/company-icon-03.svg",
					"phone" : "+1 546555455",
					"status" : "1"
				},
				{
					"id" : 4,
					"lead" : "Schumm",
					"lead_name" : "Summit Peak",
					"lead_city" : "Compton, RI",
					"lead_img" : "assets/img/icons/company-icon-04.svg",
					"phone" : "+1 454478787",
					"status" : "2"
				},
				{
					"id" : 5,
					"lead" : "Wisozk",
					"lead_name" : "RiverStone Ltd",
					"lead_city" : "Compton, RI",
					"lead_img" : "assets/img/icons/company-icon-05.svg",
					"phone" : "+1 1245427875",
					"status" : "1"
				}
		
			],
		"columns": [
			{ "render": function ( data, type, row ){
				return '<a href="leads-details.html">'+row['lead']+'</a>';
			}},
			{ "render": function ( data, type, row ){
				return '<div class="d-flex align-items-center"><a href="company-details.html" class="avatar avatar-rounded border"><img class="w-auto h-auto" src="'+row['lead_img']+'" alt="User Image"></a><div class="ms-2"><h6 class="fs-14 fw-medium mb-0"><a href="company-details.html" class="d-flex flex-column">'+row['lead_name']+'</a></h6></div></div>';
			}},
			{ "data": "phone" },
			{ "render": function ( data, type, row ){
				if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Closed" } if(row['status'] == "1") { var class_name = "bg-success";var status_name ="Closed" } else { var class_name = "bg-warning";var status_name ="Contacted"}
				return '<span class="badge badge-pill  '+class_name+'" > '+status_name+'</span>';
			}},
		]
	});
	}
});