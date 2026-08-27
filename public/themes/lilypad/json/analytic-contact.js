document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#analytic-contact')) {
		new DataTable('#analytic-contact', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"lead_name" : "Elizabeth Morgan",
					"lead_city" : "Product Manager",
					"lead_img" : "assets/img/profiles/avatar-09.jpg",
					"phone" : "+1 87545 54503",
					"email" : "caroo3@example.com",
					"date" : "10 May 2025"
				},
				{
					"id" : 2,
					"lead_name" : "Katherine Brooks",
					"lead_city" : "Installer",
					"lead_img" : "assets/img/profiles/avatar-22.jpg",
					"phone" : "+1 98975 17485",
					"email" : "dercha@example.com",
					"date" : "02 May 2025"
				},
				{
					"id" : 3,
					"lead_name" : "Samantha Reed",
					"lead_city" : "Human Resources",
					"lead_img" : "assets/img/profiles/avatar-08.jpg",
					"phone" : "+1 54655 25455",
					"email" : "rael@example.com",
					"date" : "28 Apr 2025"
				},
				{
					"id" : 4,
					"lead_name" : "William Anderson",
					"lead_city" : "Data Analytics",
					"lead_img" : "assets/img/profiles/avatar-24.jpg",
					"phone" : "+1 45447 58787",
					"email" : "joe@example.com",
					"date" : "16 Apr 2025"
				},
				{
					"id" : 5,
					"lead_name" : "Jonathan Mitchell",
					"lead_city" : "Facility Manager",
					"lead_img" : "assets/img/profiles/avatar-23.jpg",
					"phone" : "+1 12454 27845",
					"email" : "rael@example.com",
					"date" : "05 Apr 2025"
				}
		
			],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="d-flex align-items-center"><a href="contact-details.html" class="avatar"><img class="img-fluid rounded-circle" src="'+row['lead_img']+'" alt="User Image"></a><div class="ms-2"><h6 class="fs-14 fw-medium mb-1"><a href="contact-details.html" class="d-flex flex-column fw-medium">'+row['lead_name']+'</a></h6><span class="text-body fs-13 d-inline-block">'+row['lead_city']+' </span></div></div>';
				}},
				{ "data": "phone" },
				{ "data": "date" }
			]
		});
	}

});