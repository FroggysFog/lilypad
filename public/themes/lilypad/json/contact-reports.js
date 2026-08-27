document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#contact_reports')) {
		new DataTable('#contact_reports', {
			"searching": false,
			"info": false,
			"ordering": true,
			"autoWidth": true,
			"language": {
				search: ' ',
				searchPlaceholder: "Search",
				info: "_START_ - _END_ of _TOTAL_ items",
				"lengthMenu": "Show _MENU_ entries",
				paginate: {
					next: '<i class="ti ti-chevron-right"></i> ',
					previous: '<i class="ti ti-chevron-left"></i> '
				},
			},
			pagingType: "simple_numbers",
			initComplete: function(settings, json) {
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
					"id" : 1,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Darlee Robertson",
					"customer_image" : "assets/img/profiles/avatar-19.jpg",
					"customer_no" : "Facility Manager",
					"phone" : "1234567890",
					"location_image" : "assets/img/flags/us.svg",
					"location_name" : "USA",
					"tag" : "0",
					"rating" : "4.2",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				},
				{
					"id" : 2,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Sharon Roy",
					"customer_image" : "assets/img/profiles/avatar-20.jpg",
					"customer_no" : "Installer",
					"phone" : "+1 989757485",
					"location_image" : "assets/img/flags/ae.svg",
					"location_name" : "UAE",
					"tag" : "2",
					"rating" : "5.0",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "1",
				},
				{
					"id" : 3,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Vaughan Lewis",
					"customer_image" : "assets/img/profiles/avatar-21.jpg",
					"customer_no" : "Senior  Manager",
					"phone" : "+1 546555455",
					"location_image" : "assets/img/flags/de.svg",
					"location_name" : "Germany",
					"tag" : "0",
					"rating" : "3.5",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				},
				{
					"id" : 4,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Jessica Louise",
					"customer_image" : "assets/img/profiles/avatar-23.jpg",
					"customer_no" : "Test Engineer",
					"phone" : "+1 454478787",
					"location_image" : "assets/img/flags/fr.svg",
					"location_name" : "France",
					"tag" : "1",
					"rating" : "4.5",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				},
				{
					"id" : 5,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Carol Thomas",
					"customer_image" : "assets/img/profiles/avatar-16.jpg",
					"customer_no" : "UI /UX Designer",
					"phone" : "+1 124547845",
					"location_image" : "assets/img/flags/india.svg",
					"location_name" : "India",
					"tag" : "0",
					"rating" : "4.7",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				},
				{
					"id" : 6,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Dawn Mercha",
					"customer_image" : "assets/img/profiles/avatar-22.jpg",
					"customer_no" : "Technician",
					"phone" : "+1 478845447",
					"location_image" : "assets/img/flags/brazil.svg",
					"location_name" : "Brazil",
					"tag" : "1",
					"rating" : "5.0",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				},
				{
					"id" : 7,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Rachel Hampton",
					"customer_image" : "assets/img/profiles/avatar-24.jpg",
					"customer_no" : "Software Developer",
					"phone" : "+1 215544845",
					"location_image" : "assets/img/flags/mexico.svg",
					"location_name" : "Mexico",
					"tag" : "2",
					"rating" : "3.1",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				},
				{
					"id" : 8,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Jonelle Curtiss",
					"customer_image" : "assets/img/profiles/avatar-25.jpg",
					"customer_no" : "Supervisor",
					"phone" : "+1 121145471",
					"location_image" : "assets/img/flags/china.svg",
					"location_name" : "China",
					"tag" : "1",
					"rating" : "5.0",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				},
				{
					"id" : 9,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Jonathan Smith",
					"customer_image" : "assets/img/profiles/avatar-26.jpg",
					"customer_no" : "Team Lead Dev",
					"phone" : "+1 321454789",
					"location_image" : "assets/img/flags/russia.svg",
					"location_name" : "Russia",
					"tag" : "0",
					"rating" : "2.7",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				}
				,
				{
					"id" : 10,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Brook Carter",
					"customer_image" : "assets/img/profiles/avatar-01.jpg",
					"customer_no" : "Team Lead Dev ",
					"phone" : "+1 278907145",
					"location_image" : "assets/img/flags/fr.svg",
					"location_name" : "France",
					"tag" : "2",
					"rating" : "3.0",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				}
				,
				{
					"id" : 11,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Eric Adams",
					"customer_image" : "assets/img/profiles/avatar-06.jpg",
					"customer_no" : "HR Manager",
					"phone" : "+1 19023-78104",
					"location_image" : "assets/img/flags/italy.svg",
					"location_name" : "Italy",
					"tag" : "3",
					"rating" : "3.0",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				}
				,
				{
					"id" : 12,
					"si_no" : "",
					"select" : "",
					"customer_name" : "Richard Cooper",
					"customer_image" : "assets/img/profiles/avatar-05.jpg",
					"customer_no" : "Devops Engineer",
					"phone" : "+1 18902-63904",
					"location_image" : "assets/img/flags/canada.svg",
					"location_name" : "Canada",
					"tag" : "1",
					"rating" : "3.0",
					"owner_image": "assets/img/profiles/avatar-14.jpg",
					"status" : "0",
				}
				
			],
			"columns": [
				{
					"render": function (data, type, row) {
						return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
					}
				},
				{
					"render": function (data, type, row) {
						return '<div class="set-star rating-select"><i class="ti ti-star-filled fs-16"></i></div>';
					}
				},
				{
					"render": function (data, type, row) {
						return '<h6 class="d-flex align-items-center fs-14 fw-medium mb-0"><a href="contact-details.html" class="avatar me-2"><img class="img-fluid rounded-circle" src="' + row['customer_image'] + '" alt="User Image"></a><a href="contact-details.html" class="d-flex flex-column">' + row['customer_name'] + ' <span class="text-body fs-13 fw-normal mt-1">' + row['customer_no'] + ' </span></a></h6>';
					}
				},
				{ "data": "phone" },
				{
					"render": function (data, type, row) {
						var class_name, status_name;
						if (row['tag'] == "0") {
							class_name = "badge-soft-success";
							status_name = "Collab";
						} else if (row['tag'] == "1") {
							class_name = "badge-soft-warning";
							status_name = "VIP";
						} else if (row['tag'] == "3") {
							class_name = "badge-soft-info";
							status_name = "Premium";
						} else {
							class_name = "badge-soft-primary";
							status_name = "Promotion";
						}
						
						return '<span class="badge badge-tag ' + class_name + '" >' + status_name + '</span>';
					}
				},
				{ 
					"render": function (data, type, row) {
						return '<div class="d-flex align-items-center mb-0"><a href="contact-details.html" class="avatar avatar-xss me-2"><img class="img-fluid rounded-circle" src="' + row['location_image'] + '" alt="User Image"></a>' + row['location_name'] + '</div>';
					}
				},
				{
					"render": function (data, type, row) {
						return '<div class="set-star"><span><i class="ti ti-star-filled text-warning"></i> ' + row['rating'] + ' </span></div>';
					}
				},
				{
					"render": function (data, type, row) {
						return '<ul class="social-links d-flex align-items-center"><li><a href="#"><i class="ti ti-mail"></i></a></li><li><a href="#"><i class="ti ti-phone-check"></i></a></li><li><a href="#"><i class="ti ti-message-circle-share"></i></a></li></li><li><a href="#"><i class="ti ti-brand-facebook "></i></a></li></ul>';
					}
				},
				{
					"render": function (data, type, row) {
							if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
				return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
					}
				}
			]
		});
		
	}
    
});