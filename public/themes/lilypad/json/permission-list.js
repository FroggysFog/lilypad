document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#permission_list')) {
		new DataTable('#permission_list', {
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
						"si_no" : "",
						"module" : "Dashboard",
						"sub_module" : "Dashboard",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 2,
						"si_no" : "",
						"module" : "Contacts",
						"sub_module" : "Contacts",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 3,
						"si_no" : "",
						"module" : "Companies",
						"sub_module" : "Companies",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 4,
						"si_no" : "",
						"module" : "Leads",
						"sub_module" : "Leads",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 5,
						"si_no" : "",
						"module" : "Deals",
						"sub_module" : "Deals",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 6,
						"si_no" : "",
						"module" : "Pipelines",
						"sub_module" : "Pipelines",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 7,
						"si_no" : "",
						"module" : "Compaign",
						"sub_module" : "Compaign",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 8,
						"si_no" : "",
						"module" : "Projects",
						"sub_module" : "Projects",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 9,
						"si_no" : "",
						"module" : "Tasks",
						"sub_module" : "Tasks",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					},
					{
						"id" : 10,
						"si_no" : "",
						"module" : "Activity",
						"sub_module" : "Activity",
						"create" : "",
						"edit" : "",
						"view" : "",
						"delete" : "",
						"allow" : ""
					}
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "data": "module" },
				{ "data": "sub_module" },
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}}
			]
		});
	}

});