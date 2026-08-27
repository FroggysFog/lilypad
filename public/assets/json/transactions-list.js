document.addEventListener('DOMContentLoaded', function () {

    if (document.querySelector('#transactions_list')) {
		new DataTable('#transactions_list', {
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
						"select" : "",
						"type" : "Wallet Topup",
						"amount" : "+$650",
						"date": "25 Sep 2025, 01:22 PM",
						"payment_type":"Paypal",
						"status": "1"
					},
					{
						"id" : 2,
						"si_no" : "",
						"select" : "",
						"type" : "Purchase",
						"amount" : "-350",
						"date": "27 Sep 2025, 04:18 PM",
						"payment_type":"Cash",
						"status": "0"
					},
					{
						"id" : 3,
						"si_no" : "",
						"select" : "",
						"type" : "Refund",
						"amount" : "+$100",
						"date": "29 Sep 2025, 10:08 AM",
						"payment_type":"Paypal",
						"status": "1"
					},
					{
						"id" : 4,
						"si_no" : "",
						"select" : "",
						"type" : "Wallet Topup",
						"amount" : "+$650",
						"date": "05 Oct 2025, 09:43 AM",
						"payment_type":"Cash",
						"status": "1"
					},
					{
						"id" : 5,
						"si_no" : "",
						"select" : "",
						"type" : "Wallet Topup",
						"amount" : "+$650",
						"date": "17 Oct 2025, 01:22 AM",
						"payment_type":"Paypal",
						"status": "0"
					},
					{
						"id" : 6,
						"si_no" : "",
						"select" : "",
						"type" : "Wallet Topup",
						"amount" : "+$650",
						"date": "22 Oct 2025, 06:32 PM",
						"payment_type":"Cash",
						"status": "1"
					},
					{
						"id" : 7,
						"si_no" : "",
						"select" : "",
						"type" : "Refund",
						"amount" : "+$500",
						"date": "05 May 2025, 10:45 AM",
						"payment_type":"Cash",
						"status": "1"
					},
					{
						"id" : 8,
						"si_no" : "",
						"select" : "",
						"type" : "Wallet Topup",
						"amount" : "+$380",
						"date": "03 May 2025, 09:45 AM",
						"payment_type":"Cash",
						"status": "1"
					},
					{
						"id" : 9,
						"si_no" : "",
						"select" : "",
						"type" : "Refund",
						"amount" : "+$290",
						"date": "15 Feb 2025, 02:02 PM",
						"payment_type":"PayPal",
						"status": "1"
					},
					{
						"id" : 10,
						"si_no" : "",
						"select" : "",
						"type" : "Wallet Topup",
						"amount" : "+$380",
						"date": "25 Feb 2025, 01:22 PM",
						"payment_type":"Cash",
						"status": "1"
					}
				],
			"columns": [
				{ "render": function ( data, type, row ){
					return '<div class="form-check form-check-md"><input class="form-check-input" type="checkbox"></div>';
				}},
				{ "render": function ( data, type, row ){
					return '<div class="set-star rating-select filled"><i class="ti ti-star-filled fs-16"></i></div>';
				}},
				{ "data": "type" },
				{ "data": "amount" },
				{ "data": "date" },
				{ "data": "payment_type" },
				{ "render": function ( data, type, row ){
					if(row['status'] == "0") { var class_name = "bg-success";var status_name ="Completed" } if(row['status'] == "1") { var class_name = "bg-success";var status_name ="Completed" } else { var class_name = "bg-danger";var status_name ="Cancel"}
					return '<span class="badge badge-pill badge-status '+class_name+'" >'+status_name+'</span>';
				}},
			]
		});
	}

});