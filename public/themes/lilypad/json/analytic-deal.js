document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#analytic-deal')) {
		new DataTable('#analytic-deal', {
			"searching": false, 
			"info": false,
			"ordering": false,
			"paging":false,
			"data":[
				{
					"id" : 1,
					"name" : "Collins",
					"stage" : "Conversation",
					"value" : "$04,51,000",
					"probability" : "85%",
					"email" : "caroo3@example.com",
					"status" : "0"
				},
				{
					"id" : 2,
					"name" : "Konopelski",
					"stage" : "Pipeline",
					"value" : "$04,14,800",
					"probability" : "15%",
					"status" : "1"
				},
				{
					"id" : 3,
					"name" : "Adams",
					"stage" : "Won",
					"value" : "$04,14,800",
					"probability" : "95%",
					"status" : "2"
				},
				{
					"id" : 4,
					"name" : "Schumm",
					"stage" : "Lost",
					"value" : "$9,14,400",
					"probability" : "47%",
					"status" : "2"
				},
				{
					"id" : 5,
					"name" : "Wisozk",
					"stage" : "Follow Up",
					"value" : "$11,14,400",
					"probability" : "98%",
					"status" : "2"
				}
		
			],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<a href="deals-details.html"> '+row['name']+'</a>';
				}},
				{ "data": "stage" },
				{ "data": "value" },
				{ "data": "probability" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-info";var status_name ="Open" } else if(row['status'] == "1") { var class_name = "bg-danger";var status_name ="Lost" } else { var class_name = "bg-success";var status_name ="Won"}
					return '<span class="badge badge-pill badge-status '+class_name+'" > '+status_name+'</span>';
				}},
			]
		});
	}

});