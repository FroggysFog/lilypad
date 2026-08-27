document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('#pages')) {
		new DataTable('#pages', {
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
				"data":[
					{
						"id" : 1,
						"pages" :"Dashboard",
						"page_slug" : "Dashboard",
						"status" : "0"
						
					},
					{
						"id" : 2,
						"pages" :"Contacts",
						"page_slug" : "Contacts",
						"status" : "1"
						
					},
					{
						"id" : 3,
						"pages" :"Home",
						"page_slug" : "Home",
						"status" : "0"
						
					},
					{
						"id" : 4,
						"pages" :"Landing Pages",
						"page_slug" : "Landing Pages",
						"status" : "0"
						
					},
					{
						"id" : 5,
						"pages" :"Reports & Analytics",
						"page_slug" : "Reports & Analytics",
						"status" : "0"
						
					},
					{
						"id" : 6,
						"pages" :"Terms & Conditions",
						"page_slug" : "Terms & Conditions",
						"status" : "0"
						
					},
					{
						"id" : 7,
						"pages" :"Categories",
						"page_slug" : "Categories",
						"status" : "0"
						
					},
					{
						"id" : 8,
						"pages" :"Privacy Policy",
						"page_slug" : "Privacy Policy",
						"status" : "0"
						
					},
					{
						"id" : 9,
						"pages" :"FAQ",
						"page_slug" : "FAQ",
						"status" : "0"
						
					},
					{
						"id" : 10,
						"pages" :"About Us",
						"page_slug" : "About Us",
						"status" : "0"
						
					},
				],
			"columns": [
				{
					"render": function (data, type, row) {
						return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
					}
				},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select"><i class="ti ti-star-filled fs-16"></i></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<span class="title-name">'+row['pages']+'</span>';
				}},
				{ "data": "page_slug" },
				{
					"render": function (data, type, row) {
							if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
				return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
					}
				}, 
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow d-inline-flex btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="edit-page.html"><i class="ti ti-edit text-blue"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_contact"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
				
		});
	}
});