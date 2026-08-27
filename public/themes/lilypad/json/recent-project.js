document.addEventListener('DOMContentLoaded', function () {   
    if (document.querySelector('#recent-project')) {
		new DataTable('#recent-project', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"priority_name" : "Truelysell",
					"priority_img" : "assets/img/priority/truellysel.svg",
					"recent_name" : "NovaWave LLC",
					"recent_img" : "assets/img/icons/company-icon-01.svg",
					"client" : "1",
					"due_date" : "23 Nov 2025"
				},
				{
					"id" : 2,
					"priority_name" : "Dreamschat",
					"priority_img" : "assets/img/priority/dreamchat.svg",
					"recent_name" : "BlueSky",
					"recent_img" : "assets/img/icons/company-icon-02.svg",
					"client" : "2",
					"due_date" : "07 Nov 2025"
				},
				{
					"id" : 3,
					"priority_name" : "DreamGigs",
					"priority_img" : "assets/img/priority/truellysell.svg",
					"recent_name" : "Silve Hawk",
					"recent_img" : "assets/img/icons/company-icon-03.svg",
					"client" : "",
					"due_date" : "15 Oct 2025"
				},
				{
					"id" : 4,
					"priority_name" : "Servbook",
					"priority_img" : "assets/img/priority/servbook.svg",
					"recent_name" : "Summit Peak",
					"recent_img" : "assets/img/icons/company-icon-04.svg",
					"client" : "1",
					"due_date" : "29 Sep 2025"
				},
				{
					"id" : 5,
					"priority_name" : "DreamPOS",
					"priority_img" : "assets/img/priority/dream-pos.svg",
					"recent_name" : "RiverStone Ltd",
					"recent_img" : "assets/img/icons/company-icon-05.svg",
					"client" : "2",
					"due_date" : "25 Sep 2025"
				}
				
			],
			
		"columns": [
			{ "render": function ( data, type, row ){
				return '<h2 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="project-details.html" class="avatar avatar-rounded border me-2"><img class="w-auto h-auto" src="'+row['priority_img']+'" alt="User Image"></a><a href="project-details.html">'+row['priority_name']+'</a></h2>';
			}},
			{ "render": function ( data, type, row ){
				return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="company-details.html" class="avatar avatar-rounded border me-2"><img class="w-auto h-auto" src="'+row['recent_img']+'" alt="User Image"></a><a href="company-details.html">'+row['recent_name']+'</a></h6>';
			}},
			{ "render": function ( data, type, row ){
				if(row['client'] == "1") { var class_name = "badge-soft-success border border-success";var status_name ="Low" } if(row['client'] == "2") { var class_name = "badge-soft-warning border border-warning";var status_name ="Medium" } else { var class_name = "badge-soft-danger border border-danger";var status_name ="High"}
				return '<span class="d-inline-flex align-items-center badge badge-pill  '+class_name+'" ><i class="ti ti-square-rounded-filled me-1"></i> '+status_name+'</span>';
			}},
			{ "data": "due_date" },
		]
	});
	}
});