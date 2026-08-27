document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#analytic-lead')) {
		new DataTable('#analytic-lead', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"name" : "Collins",
					"lead_name" : "NovaWaveLLC",
					"lead_img" : "assets/img/icons/company-icon-01.svg",
					"lead_city" : "Newyork, USA",
					"phone" : "+1 87545 54503",
					"status" : "0"
				},
				{
					"id" : 2,
					"name" : "Konopelski",
					"lead_name" : "BlueSky",
					"lead_img" : "assets/img/icons/company-icon-02.svg",
					"lead_city" : "Winchester, KY",
					"phone" : "+1 98975 17485",
					"status" : "2"
				},
				{
					"id" : 3,
					"name" : "Adams",
					"lead_name" : "Silver Hawk",
					"lead_img" : "assets/img/icons/company-icon-03.svg",
					"lead_city" : "Jametown, NY",
					"phone" : "+1 54655 25455",
					"status" : "0"
				},
				{
					"id" : 4,
					"name" : "Schumm",
					"lead_name" : "Summit Peak",
					"lead_img" : "assets/img/icons/company-icon-04.svg",
					"lead_city" : "Compton, RI",
					"phone" : "+1 45447 58787",
					"status" : "2"
				},
				{
					"id" : 5,
					"name" : "Wisozk",
					"lead_name" : "RiverStone Ltd",
					"lead_img" : "assets/img/icons/company-icon-05.svg",
					"lead_city" : "Dayton, OH",
					"phone" : "+1 12454 27845",
					"status" : "0"
				}
		
			],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<a href="leads-details.html"> '+row['name']+'</a>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="d-flex align-items-center"><a href="leads-details.html" class="avatar avatar-rounded border"><img class="w-auto h-auto" src="'+row['lead_img']+'" alt="User Image"></a><div class="ms-2"><h6 class="fs-14 fw-medium mb-0"><a href="leads-details.html" class="d-flex flex-column">'+row['lead_name']+'</a></h6></div></div>';
				}},
				{ "data": "phone" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Closed" } else if(row['status'] == "1") { var class_name = "bg-pending";var status_name ="Not Contacted" } else { var class_name = "bg-warning";var status_name ="Contacted"}
					return '<span class="badge badge-pill text-white '+class_name+'" > '+status_name+'</span>';
				}},
			]
		});
	}
});