document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#growth-overview-list')) {
		new DataTable('#growth-overview-list', {
				"searching": false, 
				"info": false,
					"ordering": true,
				"autoWidth": true,
                "paging": false,
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
				"data":[
					{
						"id" : "#EM0020",
						"si_no" : "",
						"star" : "",
						"name" : "12.4%",
						"client" : "Elijah Blackwood",
                        "mail" : "elijah.blackwood@example.com",
						"pro_img" : "assets/img/priority/truellysel.svg",
						"client_img": "assets/img/icons/company-icon-01.svg",
						"piority" : "0",
						"start_date" : "25 Sep 2025",
						"end_date" : "15 Dec 2026",
						"stage" : "3",
						"type" : "Web App",
						"status" : "0",
						"value": "$250,000",
						"hrs": "100",
						"mem_image1" : "assets/img/profiles/avatar-14.jpg",
						"mem_image2": "assets/img/profiles/avatar-15.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
                        "location_image" : "assets/img/flags/us.svg",
                        "location_name" : "USA",
						"budget": "$200000",
						"currently_spend": "$40000",
                        "phone": "+1 82940 37284",
                        "ratevalue" : "100%",
						"rate" : "0",
						"growth" : "12.4%",
						"Action" : ""
					},
					{
						"id" : "#EM0019",
						"si_no" : "",
						"star" : "",
						"name" : "18.4%",
						"client" : "Scarlett Beaumont",
                        "mail" : "scarlett.beaumont@example.com",
						"pro_img" : "assets/img/priority/dreamchat.svg",
						"client_img": "assets/img/icons/company-icon-02.svg",
						"piority" : "0",
						"start_date" : "29 Sep 2025",
						"end_date" : "12 Nov 2026",
						"stage" : "1",
						"type" : "Web App",
						"status" : "3",
						"value": "$50,000",
						"hrs": "80",
						"mem_image1" : "assets/img/profiles/avatar-03.jpg",
						"mem_image2": "assets/img/profiles/avatar-05.jpg",
						"mem_image3": "assets/img/profiles/avatar-06.jpg",
                        "location_image" : "assets/img/flags/ae.svg",
                        "location_name" : "UAE",
						"budget": "$300000",
						"currently_spend": "$120000",
                        "phone": "+1 92643 27945",
                        "ratevalue" : "100%",
						"rate" : "0",
						"growth" : "18.4%",
						"Action" : ""
					},
					{
						"id" : "#EM0018",
						"si_no" : "",
						"star" : "",
						"name" : "8.5%",
						"client" : "Owen Sterling",
                        "mail" : "owen.sterling@example.com",
						"pro_img" : "assets/img/priority/truellysell.svg",
						"client_img": "assets/img/icons/company-icon-03.svg",
						"piority" : "0",
						"start_date" : "05 Oct 2025",
						"end_date" : "06 Oct 2026",
						"stage" : "0",
						"type" : "Web App",
						"status" : "1",
						"value": "$45,000",
						"hrs": "75",
						"mem_image1" : "assets/img/profiles/avatar-04.jpg",
						"mem_image2": "assets/img/profiles/avatar-01.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
                        "location_image" : "assets/img/flags/de.svg",
                        "location_name" : "Germany",
						"budget": "$200000",
						"currently_spend": "$200000",
                        "phone": "+1 92643 275445",
                        "ratevalue" : "85%",
						"rate" : "2",
						"growth" : "8.5%",
						"Action" : ""
					},
					{
						"id" : "#EM0017",
						"si_no" : "",
						"star" : "",
						"name" : "3.0%",
						"client" : "Hazel Davenport",
                        "mail" : "hazel.davenport@example.com",
						"pro_img" : "assets/img/priority/servbook.svg",
						"client_img": "assets/img/icons/company-icon-04.svg",
						"piority" : "0",
						"start_date" : "14 Oct 2025",
						"end_date" : "14 Sep 2026",
						"stage" : "2",
						"type" : "Web App",
						"status" : "0",
						"value": "$780,000",
						"hrs": "60",
						"mem_image1" : "assets/img/profiles/avatar-12.jpg",
						"mem_image2": "assets/img/profiles/avatar-15.jpg",
						"mem_image3": "assets/img/profiles/avatar-13.jpg",
                        "location_image" : "assets/img/flags/fr.svg",
                        "location_name" : "France",
						"budget": "$300000",
						"currently_spend": "$60000",
                        "phone": "+1 93443 27945",
                        "ratevalue" : "30%",
						"rate" : "1",
						"growth" : "3.0%",
						"Action" : ""
					},
					{
						"id" : "#EM0016",
						"si_no" : "",
						"star" : "",
						"name" : "10.0%",
						"client" : "Violet Ainsworth",
                        "mail" : "violet.ainsworth@example.com",
						"pro_img" : "assets/img/priority/dream-pos.svg",
						"client_img": "assets/img/icons/company-icon-05.svg",
						"piority" : "0",
						"start_date" : "15 Nov 2025",
						"end_date" : "23 Aug 2026",
						"stage" : "2",
						"type" : "Web App",
						"status" : "0",
						"value": "$80,000",
						"hrs": "72",
						"mem_image1" : "assets/img/profiles/avatar-10.jpg",
						"mem_image2": "assets/img/profiles/avatar-11.jpg",
						"mem_image3": "assets/img/profiles/avatar-16.jpg",
                        "location_image" : "assets/img/flags/india.svg",
                        "location_name" : "India",
						"budget": "$120000",
						"currently_spend": "$40000",
                        "phone": "+1 92643 27645",
                        "ratevalue" : "100%",
						"rate" : "0",
                        "growth" : "90%",
						"Action" : ""
					},
					{
						"id" : "#EM0015",
						"si_no" : "",
						"star" : "",
						"name" : "8.5%",
						"client" : "Milo Rutherford",
                        "mail" : "milo.rutherford@example.com",
						"pro_img" : "assets/img/priority/project-01.svg",
						"client_img": "assets/img/icons/company-icon-06.svg",
						"piority" : "0",
						"start_date" : "25 Nov 2025",
						"end_date" : "16 Jul 2026",
						"stage" : "1",
						"type" : "Meeting",
						"status" : "1",
						"value": "$40,000",
						"hrs": "96",
						"mem_image1" : "assets/img/profiles/avatar-14.jpg",
						"mem_image2": "assets/img/profiles/avatar-09.jpg",
						"mem_image3": "assets/img/profiles/avatar-08.jpg",
                        "location_image" : "assets/img/flags/brazil.svg",
                        "location_name" : "Brazil",
						"budget": "$200000",
						"currently_spend": "$90000",
                        "phone": "+1 92643 27924",
                        "ratevalue" : "85%",
						"rate" : "2",
						"growth" : "8.5%",
						"Action" : ""
					}
				
				],
			"columns": [
				{ "data": "start_date" },
                { "render": function ( data, type, row ){
					return '<h6 class="d-flex align-items-center fs-14 mb-0 fw-medium"><a href="#" class="avatar avatar-sm border rounded-circle me-2"><img class="rounded-circle" src="'+row['mem_image2']+'" alt="User Image"></a><a href="#">'+row['client']+'</a></h6>';
				}},                 		
              {
                render: function (data, type, row) {

                    var class_name = '';
                    var status_name = row.name; // Correct way

                    if (row.stage == "0") {
                    class_name = "danger";
                    } 
                    else if (row.stage == "1") {
                    class_name = "success";
                    } 
                    else {
                    class_name = "info";
                    }

                    return '<span class="priority badge badge-tag badge-soft-' 
                            + class_name + '">' 
                            + status_name + 
                        '</span>';
                }
                }, 	 
                { "data": "value" },
				{
                render: function (data, type, row) {

                    var class_name = '';
                    var status_name = row.ratevalue; // Correct way

                    if (row.rate == "0") {
                    class_name = "success";
                    } 
                    else if (row.rate == "1") {
                    class_name = "danger";
                    } 
                    else {
                    class_name = "info";
                    }

                    return '<span class="priority badge badge-tag badge-soft-' 
                            + class_name + '">' 
                            + status_name + 
                        '</span>';
                }
                },
                { "data": "growth" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Up" }  else { var class_name = "bg-danger";var status_name ="Down"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}}, 
				
			]
				
		});
	}
});