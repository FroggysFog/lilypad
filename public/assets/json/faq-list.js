document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#faqlist')) {
		new DataTable('#faqlist', {
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
						"select": "",
						"questions": "What is a CRM and why should I use it?",
						"category": "Services",
						"answers": "organize contacts, manage sales pipelines, track communication,",
						"created_at": "25 Sep 2025, 01:22 pm",
						"status": "1",
						"Action": ""
					},
					{
						"id": 2,
						"si_no": "",
						"select": "",
						"questions": "How do I add a new contact or company?",
						"category": "Advertising",
						"answers": "Go to the Contacts or Companies tab, click “Add New”, and fill in the form",
						"created_at": "29 Sep 2025, 08:12 am",
						"status": "1",
						"Action": ""
					},
					{
						"id": 3,
						"si_no": "",
						"select": "",
						"questions": "What’s the difference between a Lead, Contact, and Deal?",
						"category": "Services",
						"answers": "A potential customer who hasn't been qualified yet.",
						"created_at": "02 Oct 2025, 02:32 pm",
						"status": "1",
						"Action": ""
					},
					{
						"id": 4,
						"si_no": "",
						"select": "",
						"questions": "How do I track my calls, emails, and meetings?",
						"category": "Services",
						"answers": "You can log activities manually under the contact or deal record",
						"created_at": "11 Oct 2025, 02:32 pm",
						"status": "1",
						"Action": ""
					},
					{
						"id": 5,
						"si_no": "",
						"select": "",
						"questions": "What is the sales pipeline and how do I use it?",
						"category": "Media",
						"answers": "The pipeline shows your deals in different stages",
						"created_at": "04 Nov 2025, 04:22 pm",
						"status": "1",
						"Action": ""
					},
					{
						"id": 6,
						"si_no": "",
						"select": "",
						"questions": "How can I set reminders or follow-up tasks?",
						"category": "Content Marketing",
						"answers": "You can create a task under a contact or deal, and set a due date and reminder.",
						"created_at": "16 Nov 2025, 10:51 pm",
						"status": "1",
						"Action": ""
					},
					{
						"id": 7,
						"si_no": "",
						"select": "",
						"questions": "Can I collaborate with my team in the CRM?",
						"category": "Health Care",
						"answers": "Yes! You can assign deals, tag teammates in notes.",
						"created_at": "25 Nov 2025, 03:43 pm",
						"status": "1",
						"Action": ""
					},
					{
						"id": 8,
						"si_no": "",
						"select": "",
						"questions": "How do I use the CRM on my phone?",
						"category": "Services",
						"answers": "Most CRMs offer a mobile app for iOS and Android.",
						"created_at": "07 Dec 2025, 11:22 am",
						"status": "1",
						"Action": ""
					},
					{
						"id": 9,
						"si_no": "",
						"select": "",
						"questions": "Is my data automatically saved and synced?",
						"category": "Social Marketing",
						"answers": "Yes. All updates are saved automatically and synced across devices and users in real time.",
						"created_at": "15 Dec 2025, 08:17 am",
						"status": "1",
						"Action": ""
					},
					{
						"id": 10,
						"si_no": "",
						"select": "",
						"questions": "Who do I contact if I need help?",
						"category": "Media",
						"answers": "You can reach out to your CRM admin, use the Help Center.",
						"created_at": "29 Dec 2025, 01:22 pm",
						"status": "1",
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
				{ "data": "questions" },
				{ "data": "category" },
				{ "data": "answers" },
				{ "data": "created_at" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Active" } if(row['status'] == "1") { var class_name = "bg-success";var status_name ="Active" } else { var class_name = "bg-danger";var status_name ="Inactive"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},                 
				{ "render": function ( data, type, row ){
					return '<div class="dropdown table-action"><a href="#" class="action-icon btn btn-xs shadow btn-icon btn-outline-light" data-bs-toggle="dropdown" aria-expanded="false"><i class="ti ti-dots-vertical"></i></a><div class="dropdown-menu dropdown-menu-right"><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#edit_faq"><i class="ti ti-edit"></i> Edit</a><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#delete_faq"><i class="ti ti-trash"></i> Delete</a></div></div>';
				}}
			]
		});
	}
    
});