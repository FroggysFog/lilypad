document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#analytic-company')) {
		new DataTable('#analytic-company', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"lead_name" : "NovaWaveLLC",
					"lead_img" : "assets/img/icons/company-icon-01.svg",
					"phone" : "+1 87545 54503",
					"email" : "caroo3@example.com",
					"date" : "10 May 2025"
				},
				{
					"id" : 2,
					"lead_name" : "BlueSky Industries",
					"lead_img" : "assets/img/icons/company-icon-02.svg",
					"phone" : "+1 98975 17485",
					"email" : "dercha@example.com",
					"date" : "02 May 2025"
				},
				{
					"id" : 3,
					"lead_name" : "Silver Hawk",
					"lead_img" : "assets/img/icons/company-icon-03.svg",
					"phone" : "+1 54655 25455",
					"email" : "rael@example.com",
					"date" : "28 Apr 2025"
				},
				{
					"id" : 4,
					"lead_name" : "Summit  Peak",
					"lead_img" : "assets/img/icons/company-icon-04.svg",
					"phone" : "+1 45447 58787",
					"email" : "joe@example.com",
					"date" : "16 Apr 2025"
				},
				{
					"id" : 5,
					"lead_name" : "RiverStone Ltd",
					"lead_img" : "assets/img/icons/company-icon-05.svg",
					"phone" : "+1 12454 27845",
					"email" : "joe@example.com",
					"date" : "05 Apr 2025"
				},
				{
					"id" : 6,
					"lead_name" : "Redwood Inc",
					"lead_img" : "assets/img/icons/company-icon-06.svg",
					"phone" : "+1 46789 27845",
					"email" : "sharon@example.com",
					"date" : "15 Nov 2025"
				}
		
			],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="d-flex align-items-center"><a href="company-details.html" class="avatar avatar-rounded border"><img class="w-auto h-auto" src="'+row['lead_img']+'" alt="User Image"></a><div class="ms-2"><h6 class="fs-14 fw-medium mb-0"><a href="company-details.html">'+row['lead_name']+'</a></h6></div></div>';
				}},
				{ "data": "phone" },
				{ "data": "date" }
			]
		});
	}
});