document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#countrieslist')) {
		new DataTable('#countrieslist', {
				"searching": false, 
				"info": false,
					"ordering": true,
				"autoWidth": true,
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
				"data": [
					{
						"id": 1,
						"si_no": "",
						"select" : "",
						"country_code": "US",
						"country_id": "840",
						"country_image":"assets/img/country/country-01.svg",
						"country_name": "United States",
						"Action": ""
					},
					{
						"id": 2,
						"si_no": "",
						"select" : "",
						"country_code": "CAN",
						"country_id": "124",
						"country_image":"assets/img/country/country-02.svg",
						"country_name": "Canada",
						"Action": ""
					},
					{
						"id": 3,
						"si_no": "",
						"select" : "",
						"country_code": "ES",
						"country_id": "34",
						"country_image":"assets/img/country/country-03.svg",
						"country_name": "Spain",
						"Action": ""
					},
					{
						"id": 4,
						"si_no": "",
						"select" : "",
						"country_code": "IN",
						"country_id": "356",
						"country_image":"assets/img/country/country-04.svg",
						"country_name": "India",
						"Action": ""
					},
					{
						"id": 5,
						"si_no": "",
						"select" : "",
						"country_code": "BR",
						"country_id": "076",
						"country_image":"assets/img/country/country-05.svg",
						"country_name": "Brazil",
						"Action": ""
					},
					{
						"id": 6,
						"si_no": "",
						"select" : "",
						"country_code": "DE",
						"country_id": "49",
						"country_image":"assets/img/country/country-06.svg",
						"country_name": "Germany",
						"Action": ""
					},
					{
						"id": 7,
						"si_no": "",
						"select" : "",
						"country_code": "MX",
						"country_id": "52",
						"country_image":"assets/img/country/country-07.svg",
						"country_name": "Mexico",
						"Action": ""
					},
					{
						"id": 8,
						"si_no": "",
						"select" : "",
						"country_code": "CN",
						"country_id": "156",
						"country_image":"assets/img/country/country-08.svg",
						"country_name": "China",
						"Action": ""
					},
					{
						"id": 9,
						"si_no": "",
						"select" : "",
						"country_code": "RU",
						"country_id": "7",
						"country_image":"assets/img/country/country-09.svg",
						"country_name": "Russia",
						"Action": ""
					},
					{
						"id": 10,
						"si_no": "",
						"select" : "",
						"country_code": "IT",
						"country_id": "39",
						"country_image":"assets/img/country/country-10.svg",
						"country_name": "Italy",
						"Action": ""
					}
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select"><i class="ti ti-star-filled fs-16"></i></div>';
				}},
				{ "data": "country_code" },
				{ "data": "country_id" },
				{ "render": function ( data, type, row ){
					return '<a href="javascript:void(0);" class="table-imgname flag-image">' +
					'<span class="location-flag-img me-2"><img src="'+ row['country_image']+'" class="img-fluid" alt="img"></span>' +
					'<span>'+ row['country_name'] +'</span>'+
					'</a> ';
				}},               
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_country"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_country"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
		});
	}

});