/**
 * Created by Giau on 10/2016.
 * controller cho cac tao order excel step 2
 **/
//#################### CONTROLLER ####################
	app.controller('GetInventController', ['$scope','$stateParams','Invoice',
		     function($scope, $stateParams,Invoice) {
		if ($stateParams.order){
			$scope.order_number = $stateParams.order;
		}
		var type = 0
		if($stateParams.type){
			var type = $stateParams.type;
		}else{
			var type = 0
		}
		$scope.parseFloatValue = function(value)
	    {
	        return parseFloat(value);
	    }
		//$scope.htmlInvoice = BOXME_API+'list_invoice_by_seller/'+$scope.order_number+'';
		$scope.htmlInvoice = ''+BOXME_API+'list_invoice_by_seller/'+$scope.order_number+'/'+type+'';
	}]);
	app.controller('InventController', ['$scope','$stateParams','Invoice','toaster','$timeout','$filter','$rootScope',
	     function($scope, $stateParams,Invoice,toaster,$timeout,$filter,$rootScope) {
		$scope.order_number = 0
		var tran = $filter('translate');
		if ($stateParams.order){
			$scope.order_number = $stateParams.order;
		}
		$scope.parseFloatValue = function(value)
	    {
	        return parseFloat(value);
	    }
		var type = 0
		if($stateParams.type){
			var type = $stateParams.type;
		}else{
			var type = 0
		}
		
		/*if ($stateParams.lang){
			$scope.langView = $stateParams.lang;
		}else{
			if($rootScope.keyLang== 'vi'){
			$scope.langView = "vi"
			}else{
				$scope.langView = "en"
			}
		}*/
		//$scope.htmlInvoice = ''+$scope.template.template+'';
		console.log(type)
		if(type){
			Invoice.get(parseInt(type),$scope.order_number).then(function (result) {
				$scope.template = result;
				$scope.htmlInvoice = ''+$scope.template.template+'';
				}, function (response) {
					$scope.template ="";
		});
		}
		Invoice.get_detail(parseInt(type),$scope.order_number).then(function (result) {
				$scope.dataInvoice = result.value_data;
				$scope.invoice = result.data_template;
				type = result.type;
				if (result.lang_active && result.lang_active.toString() == "vi"){
					$scope.invoice = result.data_template;
				}else{
					$scope.invoice = result.data_template_en;
					$scope.dataInvoice.data_oder_info_shipment_type =  $scope.dataInvoice.data_oder_info_shipment_type_en;
				}
		
			}, function (response) {
				//$scope.dataInvoice ="";
				$timeout(function() {
					Invoice.get_detail(parseInt(type),$scope.order_number).then(function (result) {
						$scope.dataInvoice = result.value_data;
						type = result.type;
						/*if($rootScope.keyLang.toString() == 'vi'){
						}else{
							$scope.invoice = result.data_template_en;
						};*/
						if (result.lang_active && result.lang_active.toString() == "vi"){
							$scope.invoice = result.data_template;
							$scope.dataInvoice
						}else{
							$scope.invoice = result.data_template_en;
							$scope.dataInvoice.data_oder_info_shipment_type =  $scope.dataInvoice.data_oder_info_shipment_type_en;
						}
						}, function (response) {
							$scope.dataInvoice ="";
							$scope.invoice = "";
						});
                }, 2000)
                
			});
		$scope.save = function(data1,data2){
			
			$scope.search={
				'template_data':data1,
				'data_order':data2,
				'lang'		:$rootScope.keyLang,
				'type'		:type
			};
			Invoice.post($scope.search,$scope.order_number).then(function (data) {
				toaster.pop('success', 'Thành công',data.validation_messages);
			},function(res) {
				if(res.status == 422) {
					$scope.search.user ={};
					toaster.pop('error', 'Lỗi','Dữ liệu rỗng');
				} else {
					toaster.pop('error', 'Lỗi','Dữ liệu rỗng');
				}
			});
		}
		
	}]);

	app.controller('InventControllerMau', ['$scope','$stateParams','Invoice','toaster','$timeout','$filter','$rootScope',
               	     function($scope, $stateParams,Invoice,toaster,$timeout,$filter,$rootScope) {
               		$scope.order_number = 0
               		var tran = $filter('translate');
               		$scope.invoice_en = {
               				'title'				:'PURCHASE ORDER',
               				'oder_number_name'	:'ORDER NUMBER',
               				'oder_info_title'	:'BUYER INFORMATION',
               				'oder_info_receiver_fullname'	:'Customer name',
               				'oder_info_receiver_address'	:'Address',
               				'oder_info_receiver_phone'		:'Phone number',
               				'oder_detail_title'				:'ORDER INFORMATION',
               				'oder_info_date_create'			:'Place order',
               				'oder_info_payment_type'		:'Payment method',
               				'oder_info_payment_note'		:'Payment note',
               				'oder_info_shipment_type'		:'Shipping service',
               				'oder_info_date_shipment'		:'Estimate delivery date',
               				'oder_info_order_note'			:'Buyer note',
               				'oder_product_code_name'			:'SKU',
               				'oder_product_name_name'			:'Product name',
               				'oder_product_quatity_name'			:'Quantity',
               				'oder_product_price_name'			:'Price (đ)',
               				'oder_product_total_product_name'	:'Subtotal (đ)',
               				'oder_product_total_order'			:'Total',
               				'oder_note_name'					:'Note',
               				'order_company_info_name'	:'SOJI CO.LTD ',
               				'order_company_descrpition_name'	:'2A NGUYEN THI MINH KHAI ST., DA KAO, DIST1, TP. HCM ',
               				'order_COD_name'	:'Money remittune',
               				'oder_order_number2_name'			:'Order number',
               				'oder_info_receiver2_fullname'		:'Ship to',
               				'oder_info_receiver_address2_name'	:'Address',
               				'oder_info_receiver_phone2_name'	:'Phone number',
               				'oder_info_receiver_note2_name'		:'Note',
               				
               		}
               		$scope.dataInvoice= {
               	    "data_oder_info_date_create": 1480404276,
               	    "data_oder_info_receiver_fullname_data": "LA",
               	    "data_oder_info_receiver_address": "123 Hoàng Mai, Hoàng Văn Thụ, Hà Nội, Việt Nam",
               	    "data_oder_info_receiver_phone": "8401632347570",
               	    "oder_item": [
               	        {
               	            "sku": ".....",
               	            "price": "....",
               	            "quatity": 100,
               	            "name": "đơn test"
               	        }
               	    ],
               	    "data_oder_info_payment_type_en": "Online payment",
               	    "data_oder_info_date_shipment": "...",
               	    "data_oder_info_shipment_type_en": "Economy delivery service",
               	    "data_oder_info_payment_note": "...",
               	    "data_oder_number": "LA test/SC51614224235",
               	    "data_order_total_price": "484000",
               	    "data_oder_info_payment_type": "Người bán và người mua sắp xếp",
               	    "data_cod": "499000",
               	    "data_oder_info_order_note": ".....",
               	    "data_order_note_description": ".....",
               	    "data_oder_info_shipment_type": "Chuyển phát tiết kiệm"

               		},
               		/*$scope.invoice.checkboxDocument = 'Documents'
           			$scope.invoice.checkboxCommercial = 'Commercial sample'
           			$scope.invoice.checkboxMerchandise = 'Merchandise'
           			$scope.invoice.checkboxDangerousGoods = 'Dangerous Goods'
           			$scope.invoice.checkboxGift = 'Gift'
           			$scope.invoice.checkboxHumanitarianDonation = 'Humanitarian Donation'
           			$scope.invoice.checkboxOrther = 'Other_______________'
           			$scope.invoice.checkboxTitle = 'Customs Declaration'*/
           			$scope.invoice = $scope.invoice_en;
           			$scope.invoice.checkboxDocument = 'Tài liệu'
           			$scope.invoice.checkboxCommercial = 'Hợp đồng'
           			$scope.invoice.checkboxMerchandise = 'Hàng hóa'
           			$scope.invoice.checkboxDangerousGoods = 'Hàng nguy hiểm'
           			$scope.invoice.checkboxGift = 'Quà tặng'
           			$scope.invoice.checkboxHumanitarianDonation = 'Hàng nguyên góp'
           			$scope.invoice.checkboxOrther = 'Khác'
           			$scope.invoice.checkboxTitle = 'Tờ khai hải quan'
               		
               		
               	}]);
	app.controller('InventControllerGlobalMau', ['$scope','$stateParams','Invoice','toaster','$timeout','$filter','$rootScope',
               	     function($scope, $stateParams,Invoice,toaster,$timeout,$filter,$rootScope) {
               		$scope.order_number = 0
               		var tran = $filter('translate');
               		$scope.invoice = {
							'from':{
								'title'	:'Sender',
								'phone'	:'Phone',
								'fax'	:'Fax',
								'tax'	:'Tax ID/VAT Number'
							},
							'to':{
								'title'	:'Receiver',
								'phone'	:'Phone',
								'fax'	:'Fax',
								'tax'	:'Tax ID/VAT Number'
							},
							'product':{
								'name'	:'Full Description of Goods',
								'qty'	:'Qty',
								'sku'	:'Commodity Code',
								'price'	:'Unit Value',
								'total_price':'Subtotal Value',
								'weight':'Unit Net Weigh',
								'total_weight':'Gross Weight',
								'contry':'Country of Origin',
							},
							'detail':{
								'product_line'	:'Total Line Items',
								'vat'			:'Payer of GST/VAT',
								'hamr_code'		:'Harm.Comm.Code',
								'invoice_type'	:'Invoice Type',
								'reason_export'	:'Reason for Export',
								'other_charges' :'Other Charges',
								'total_net_weight' 		:'Total Net Weight',
								'total_gross_weight' 	:'Total Gross Weight',
								'currency_code'			:'Currency Code',
								'terms_payment'			:'Terms Of Payment',
								'terms_trade'			:'Terms of Trade',
								'commitment'	:'I/We hereby certify that the information on this Invoice is true and correct and that the contents of this shipment are as stated above.',
								'signarure'		:'SIGNATURE',
							},
							'fields_info':{
								'oder_product_total_order'			:'Total Declared Value',
								'invoice_number':'Invoice Number',
								'date_approve':'Date',
								'export_id':'Export Id',
								'export_code':'Export Code',
								'tracking_code_2':'Waybill Numbe',
	               				'note'					:'Other Remarks',
	               				'shipment_reference'	:'Shipment Reference',
							}
               		}
               		$scope.dataInvoice= {
						'to':{
							'name'		:'Asia',
							'director'	:'Kao',
							'wardDistrict':'singa',
							'city'		:'Manila',
							'phone'		:'0969707171',
							'fax'		:'.....',
							'tax'		:'.....',
							'country'	:'Lao'
						},
						'from':{
							'name'		:'Bach Dang warehouse',
							'director'	:'Giau',
							'wardDistrict':'Phuong 6 Quan Tan Binh',
							'city'		:'Ho Chi Minh',
							'phone'		:'0969707171',
							'fax'		:'.....',
							'tax'		:'.....',
							'country'	:'VietNam'
						},
						'product':[{
							'name'	:'Iphone',
							'qty'	:1,
							'sku'	:'IP6',
							'price'	:'1000',
							'total_price':'1000',
							'weight':'50',
							'total_weight':'50',
							'contry':'Viet Nam',
						}],
						'detail':{
							'vat'			:'Payer of GST/VAT',
							'hamr_code'		:'Harm.Comm.Code',
							'invoice_type'	:'COM',
							'reason_export'	:'Permanent',
							'other_charges' :'Other Charges',
							'total_net_weight' 		:100,
							'total_gross_weight' 	:100,
							'total_price'			:'200000',
							'currency_code'			:'USD',
							'terms_payment'			:'Terms Of Payment',
							'terms_trade'			:'CIP',
							'commitment'	:'I/We hereby certify that the information on this Invoice is true and correct and that the contents of this shipment are as stated above.',
							'signarure'		:'SIGNATURE',
							'copy_right':'2010 DHL International Ltd. All Rights Reserved. Terms and conditions'
						},
						'fields_info':{
							'info':'',
							'invoice_number':'SC12345678',
							'date_approve':'24/12/2016',
							'export_id':'......',
							'export_code':'........',
							'tracking_code_2':'DHL1234',
	           				'note'			:'.........',
	           				'shipment_reference'	:'......',
						}
               		}
               		
               		$scope.save = function(data1,data2){
            			
            			$scope.search={
            				'template_data':data1,
            				'data_order':data2,
            				'lang'		:$rootScope.keyLang,
            				'type'		:'global'
            			};
            			console.log($scope.search)
            			Invoice.post($scope.search,$scope.order_number).then(function (data) {
            				toaster.pop('success', 'Thành công',data.validation_messages);
            			},function(res) {
            				if(res.status == 422) {
            					$scope.search.user ={};
            					toaster.pop('error', 'Lỗi','Dữ liệu rỗng');
            				} else {
            					toaster.pop('error', 'Lỗi','Dữ liệu rỗng');
            				}
            			});
            		}
               		
               	}]);
	app.service('Invoice',
			[ '$http',  'HAL',
				function  ($http,   HAL  ) {
				return {
	     			get: function (data,id) {
	     				return $http({
	     					method: 'GET',
	     					url   : BOXME_API+'list_invoice_by_seller' + "/" + id +"/"+ data,
	     					//params:{:parseInt(data)}
	     				}).then(function (response) {
	     					return response.data;
	     				})
	     			},
	     			get_detail: function (data,id) {
	     				return $http({
	     					method: 'GET',
	     					url   : BOXME_API+'list_invoice_data_by_seller' + "/" + id,
	     					params:{type:parseInt(data)}
	     				}).then(function (response) {
	     					return response.data;
	     				})
	     			},
	     			post: function (condition,id) {
	    				return $http({
	    					method  : 'POST',
	    					url     : BOXME_API+'order_post_invoice_data_by_seller' + "/" + id,
	    					data  : condition
	    				}).then(function (response) {
	    					return HAL.Collection(response.data);
	    				});
	    			},
	     		}
     	}])
				
					     	
  