'use strict';

//shipment
angular.module('app').controller('CreateShipmentController', [
				'$scope','$rootScope','$modal','$localStorage','$q','$window','Datetime','$location','$alertModal','$confirmModal','$timeout','$state','$filter','ShipmentsV2', 'WarehouseRepository','ShipmentLading','ShipLanding','toaster','ProductsRepository', 'Analytics',
		function($scope , $rootScope ,$modal ,$localStorage,   $q ,  $window,  Datetime,  $location , $alertModal ,$confirmModal, $timeout ,  $state ,  $filter  , ShipmentsV2 , WarehouseRepository , ShipmentLading , ShipLanding , toaster ,  ProductsRepository, Analytics) {
		var flag = true;
		$scope.format = 'dd/MM/yyyy';
		var DatePicker = function (value) {
			var context = {
				value : value,
				opened: false,
				open  : function ($event) {
					$event.stopPropagation();
					$event.preventDefault();
					context.opened = true;
				},
				close  : function () {
					context.opened = false;
				}
			};
			return context;
		};
		var boDauTiengViet = function(str){
                if(!str){
                    return str;
                }
                str= str.toLowerCase();  
                str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");  
                str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");  
                str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");  
                str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");  
                str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");  
                str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");  
                str= str.replace(/đ/g,"d");  
                return str;  
			}
		if(!$rootScope.userFulfillment){
			$state.go('product.thongbao');
		}
		$scope.dt2 = DatePicker();
		var tran = $filter('translate');
		$scope.check_date = function(){
			var myDate1 =  new Date()
			if(Datetime.DateToTimestempt($scope.dt2.value) < Datetime.DateToTimestempt(myDate1)){
				toaster.pop('error',tran('toaster_ss_nitifi'), tran('SHIPC_tab4_toaster_Ngayketthuc'));
				$scope.dt2  = DatePicker(myDate1);
			}
		}
		$scope.step1 = function() {
			$scope.sumbsin = 0;
	         $scope.sumproduct = 0;
			if($rootScope.products != undefined){
				$scope.step1.products = $rootScope.products;
				$scope.sumproduct = 0;
	        	   var sum_product = 0;
	        	   $scope.sumbsin = $scope.step1.products.length;
					angular.forEach($scope.step1.products, function(pro) {
						pro.QuantityFree = pro.quatity;
	                    if(pro.QuantityShipped == undefined){
	                    	pro.QuantityShipped = 1;
	                    	sum_product = sum_product + pro.QuantityShipped;
	                    }else{
	                    	sum_product = sum_product + pro.QuantityShipped;
	                    }
	                });
	        	   $scope.sumproduct =  sum_product;
			}else{
				if(gobackstep ==undefined){
					$scope.step1.products = [];
				}
			}
			if ($scope.step1.products.length >=1){
				 $scope.sumproduct = 0;
	        	   var sum_product = 0;
	        	   $scope.sumbsin = $scope.step1.products.length;
					angular.forEach($scope.step1.products, function(pro) {
	                    if(pro.QuantityShipped == undefined){
	                    	pro.QuantityShipped = 1;
	                    	sum_product = sum_product + pro.QuantityShipped;
	                    }else{
	                    	sum_product = sum_product + pro.QuantityShipped;
	                    }
	                });
	        	   $scope.sumproduct =  sum_product;
			}
            $scope.search = {
                // Default search condition
                condition: {
                    active: 1,
                    type: 'ENTERPRISE',
                    page: 1,
                    page_size: 1000
                },

                // Reset to the default search condition
                resetCondition: function () {
                    $scope.search.condition = {
                        active: 1,
                        page: 1,
                        page_size: 1000
                    }
                },

                // Default search status
                searching: false,

                // Querying for data
                proceed: function () {
                    $scope.search.searching = true;
                    ProductsRepository.find($scope.search.condition).then(function(result) {
                        $scope.search.searching = false;
                        return result;
                    }).then(modellingProducts);
                },
                getCourier: function () {
                	ShipmentsV2.get_data_courier().then(function(result) {
                        $scope.Couriers = result;
                    });
                }
            };
            $scope.selectSku =null;
            $scope.hide_ul_product = true;
            // List of products - the search result
            $scope.products = [];
            var temp_product = []
            var modellingProducts = function(raw) {
                $scope.products = raw.listOf('product');
               if($scope.products.length > temp_product.length){
            	   temp_product = $scope.products;
               }
            };
            $scope.selectSku ={}
            $scope.addsp_new = function(item){
            	$scope.selectSku.Name = item.Name;
            	$scope.temp_product=item;
            	$scope.hide_ul_product = true;
            }
            $scope.showULSp = function(){
            	$scope.hide_ul_product = false;
            	if($scope.selectSku.Name == "" || $scope.selectSku.Name == undefined){
           			if(temp_product && temp_product.length >=1){
           				$scope.products = temp_product;
           			}
           			//$scope.search.proceed();
           		}else{
           			$scope.search.condition.key = $scope.selectSku.Name;
           			var check_product = false;
           			angular.forEach($scope.products, function(pro) {
                       if(boDauTiengViet(pro.Name) && boDauTiengViet($scope.search.condition.key) && boDauTiengViet(pro.Name).indexOf(boDauTiengViet($scope.search.condition.key)) >=0){
                    	   check_product = true;
                       }
           			});
           			if(check_product == false){
           				$scope.search.proceed();
           			}
           		}
            }
            $scope.showULSp_by_forcus = function(){
            	
         	   	$scope.search.searching = true;  
            	if($scope.hide_ul_product== true){
            		$scope.search.searching = false;
            		$scope.selectSku.Name="";
                	$scope.hide_ul_product = false;
            	}else{
            		$scope.hide_ul_product = true;
            		$scope.search.searching = false;
            	}
            }
            
           $scope.changeSKU1 = function(){
        	   if($scope.temp_product == undefined){
          		// toaster.pop('error', 'Vui l�ng ch?n s?n ph?m');
          		toaster.pop('error', tran('SHIPC_tab4_toaster_Vuilongchonsanpham'));
	          	}else{
	          		$scope.changedSKU($scope.temp_product,$scope.select_sku);
	            	$scope.temp_product=undefined;
	          		$scope.selectSku = {};
	          	}
            }
           $scope.changQuantityShipped =function(){
        	   $scope.sumproduct = 0;
        	   var sum_product = 0;
        	   angular.forEach($scope.step1.products, function(pro) {
                   if(pro.QuantityShipped != undefined){
                	   sum_product = sum_product + pro.QuantityShipped;
                   }else{
                	   sum_product = sum_product + pro.QuantityFree;
                   }
               });
        	   $scope.sumproduct =  sum_product;
           }

			$scope.step1.remove = function(product) {
				$scope.step1.products.splice($scope.step1.products.indexOf(product), 1);
				$scope.sumproduct = 0;
				var sum_product = 0;
	        	   angular.forEach($scope.step1.products, function(pro) {
	                   if(pro.QuantityShipped != undefined){
	                	   sum_product = sum_product + pro.QuantityShipped;
	                   }else{
	                	   sum_product = sum_product + pro.QuantityFree;
	                   }
	               });
	        	   $scope.sumproduct =  sum_product;
			};

            $scope.changedSKU = function(Sku,key) {
            	if(key==undefined){
            		key = $scope.step1.products.length;
            	}
                var arr = $filter('filter')($scope.step1.products, {SellerSKU: Sku.SellerSKU});
                if(arr.length<1){
                    $scope.step1.products[key] = Sku;
                    $scope.sumbsin = $scope.step1.products.length;
                    var sum_product = 0;
                    angular.forEach($scope.step1.products, function(pro) {
                        if(pro.QuantityShipped != undefined){
                        	sum_product = sum_product + pro.QuantityShipped;
                        }else{
                        	pro.QuantityShipped = 1;
                        	sum_product = sum_product + pro.QuantityShipped;
                        }
                    });
                    $scope.sumproduct = sum_product;
                }else{
                   // toaster.pop('error', 'S?n ph?m n�y d� du?c ch?n');
                    toaster.pop('error',tran('SHIPC_tab4_toaster_Sanphamnaydaduochon'));
                }
            };
            
			$scope.step1.check = function() {
                angular.forEach($scope.step1.products, function(val,k) {
                    if(!val.SellerSKU){
                        $scope.step1.products.splice(k, 1);
                    }
                });
				var flag = false;
				for(var i = 0; i < $scope.step1.products.length; ++i) {
					if ($scope.step1.products[i].QuantityShipped > $scope.step1.products[i].QuantityFree || $scope.step1.products[i].QuantityShipped < 1)
					{
						//flag = true;
						break;
					}
				}
				if(flag) {
					//toaster.pop('error', 'Vui l�ng nh?p l?i s? lu?ng s?n ph?m');
					toaster.pop('error',tran('SHIPC_tab4_toaster_Vuilongnhaplaisoluong'));
				}else {
					$scope.flow.next();
				}
			};
		};
		// ---------------------------------------------------------------------end step 1
		$scope.HVC = 1;
		$scope.paymentType = 1;
		$scope.select_HVC = 0;
		$scope.step2 = function() {
			var itemList = $scope.step1.products;
			$scope.step2.shipment = {};
			WarehouseRepository.list().then(function(data) {
				if(data._embedded.inventory)
					return data._embedded.inventory
			}).then(function (listTo) {
				$scope.step2.listTo = [];
				$scope.step2.listTo1 = [];
				angular.forEach(listTo, function (item) { 
					if(item.Type && item.Type == 1){
						$scope.step2.listTo.push(item)
					}
					if(item.Type == 0){
						$scope.step2.listTo1.push(item)
					}
				});
				//$scope.step2.listTo = $filter('filter')(listTo,{Type:1,Status:0});
				//$scope.step2.listTo1 = $filter('filter')(listTo,{Type:0});
                if(itemList[0] && itemList[0].InventoryType=="BOXME"){
                    itemList[0].InventoryId = $u.result(itemList[0], 'InventoryIdEn');
                }
                if($scope.step2.listTo1[0] && $scope.step2.listTo1[0].InventoryId){
                	var shipFromPromise = WarehouseRepository.find($scope.step2.listTo1[0].InventoryId);
                }else{
                	var shipFromPromise = WarehouseRepository.find(itemList[0].InventoryId);
                }
				shipFromPromise.then(function(from) {
					$scope.step2.shipment = {
						LabelTemplate   : '',
						Contry			: '237',
						ShipmentStatus  : 'WORKING', 
						ShipmentItems   : $scope.step1.products,
						ShipFromAddress : from,
						TypeTransport	: 1, //1 - boxme van chuyen, 2 - tu van chuyen
						Typepayment 	: parseInt($scope.paymentType), //1-cham 2 nahnh
						WeightChange	: 0 // khoi luong thay doi do nguoi dung nhap
					};
					angular.forEach($scope.step2.shipment.ShipmentItems, function (item) { //check theo id kho cua product
						$scope.step2.shipment.WeightChange = $scope.step2.shipment.WeightChange + (item.Weight * item.QuantityShipped)
					});
				});
				
				if($scope.step2.listTo1[0] && $scope.step2.listTo1[0].InventoryId){
					var shipFromPromise = WarehouseRepository.find($scope.step2.listTo1[0].InventoryId);
				}else{
					var shipFromPromise = WarehouseRepository.find(itemList[0].InventoryId);
				}  
				//var shipFromPromise = WarehouseRepository.find($scope.step2.listTo[0].InventoryId);
				shipFromPromise.then(function(from) {
					$scope.step2.shipment.ShipToAddress =  from;
					if ($scope.step2.shipment.ShipToAddress != undefined && $scope.step2.shipment.ShipFromAddress != undefined){
						ShipmentsV2.get_blance_shipment($scope.step2.shipment).then(function (result) {
							$scope.blance = result;
							$scope.dateblance = parseInt($scope.blance.TimeDelivery)/24
						},function(response){
							if(response.status == 422){
								//toaster.pop('error',response.data.message + '. Vui l�ng ch?n l?i s? lu?ng s?n ph?m');
								toaster.pop('error',tran('SHIPC_tab4_toaster_Vuilongnhaplaisoluong'));
							}
						});
					};
					if($scope.step2.shipment.ShipToAddress.Code != null ||$scope.step2.shipment.ShipToAddress.Code ==undefined){
						ShipmentsV2.get_data_courier_images($scope.step2.shipment.ShipToAddress.Code).then(function(result){
							$scope.imgs = result;
						});
					}
				});
				
			});
			$scope.changetypepayment = function(item){
				if(item){
					$scope.paymentType = item;
					$scope.step2.shipment.Typepayment =parseInt(item);
				}
				if ($scope.step2.shipment.ShipToAddress != undefined && $scope.step2.shipment.ShipFromAddress != undefined){
					ShipmentsV2.get_blance_shipment($scope.step2.shipment).then(function (result) {
						$scope.blance = result;
						$scope.dateblance = parseInt($scope.blance.TimeDelivery)/24
					},function(response){
						if(response.status == 422){
							//toaster.pop('error',response.data.message + '. Vui l�ng ch?n l?i s? lu?ng s?n ph?m');
							toaster.pop('error',response.data.message + ' '+tran('SHIPC_tab4_toaster_Vuilongnhaplaisoluong')+'');
						}
					});
				};
			}
			$scope.tinhtongkhoiluong = function(){
				$scope.step2.shipment.Weight =0;
				if($scope.step2.shipment.ShipmentItems == undefined){
					
				}
				angular.forEach($scope.step2.shipment.ShipmentItems, function (item) { //check theo id kho cua product
					$scope.step2.shipment.Weight = $scope.step2.shipment.Weight + (item.Weight * item.QuantityShipped)
				});
				return $scope.step2.shipment.Weight;
			}
			//var shipFromPromise = WarehouseRepository.find(itemList[0].InventoryId);
			$scope.ChangeEnterprise = function(){
				WarehouseRepository.find($scope.step2.shipment.ShipFromAddress.InventoryId).then(function(from) {
					$scope.step2.shipment.ShipFromAddress= from;

					if ($scope.step2.shipment.ShipToAddress != undefined && $scope.step2.shipment.ShipFromAddress != undefined){
						ShipmentsV2.get_blance_shipment($scope.step2.shipment).then(function (result) {
							$scope.blance = result;
							$scope.dateblance = parseInt($scope.blance.TimeDelivery)/24
						},function(response){
							if(response.status == 422){
								//toaster.pop('error',response.data.message + '. Vui l�ng ch?n l?i s? lu?ng s?n ph?m');
								toaster.pop('error',response.data.message + ' '+tran('SHIPC_tab4_toaster_Vuilongnhaplaisoluong')+'');
							}
						});
					};
				});
				
			}
			//$scope.typetransport ='boxme';
			$scope.ChangeBoxme = function(){
				//Typepayment:1 chuyen phat cham, 2: chuyen phat nhanh
				WarehouseRepository.find($scope.step2.shipment.ShipToAddress.InventoryId).then(function(from) {
					$scope.step2.shipment.ShipToAddress = from;
					if ($scope.step2.shipment.ShipToAddress != undefined && $scope.step2.shipment.ShipFromAddress != undefined){
						ShipmentsV2.get_blance_shipment($scope.step2.shipment).then(function (result) {
							$scope.blance = result;
							$scope.dateblance = parseInt($scope.blance.TimeDelivery)/24
						},function(response){
							if(response.status == 422){
							//	toaster.pop('error',response.data.message + '. Vui l�ng ch?n l?i s? lu?ng s?n ph?m');
								toaster.pop('error',response.data.message + ' '+tran('SHIPC_tab4_toaster_Vuilongnhaplaisoluong')+'');
							}
						});
						if($scope.step2.shipment.ShipToAddress.Code != null ||$scope.step2.shipment.ShipToAddress.Code ==undefined){
							ShipmentsV2.get_data_courier_images($scope.step2.shipment.ShipToAddress.Code).then(function(result){
								$scope.imgs = result;
							});
						}
					}
				});
				
			}
			$scope.tranpost_custumer= true;
			$scope.type_transbm = true;
			$scope.showstranpost = function (){
				if ($scope.step2.shipment.TypeTransport == 2){
					$scope.tranpost_custumer= undefined;
					$scope.type_transbm = false;
				}else{
					$scope.tranpost_custumer= true;
					$scope.type_transbm = true;
				}
			}
			
			
			// Save the shipment
			$scope.step2.shipment.CourierName =undefined;
			$scope.step2.saveShipment = function () {
				
				if($scope.step2.shipment.TrackingSeller ==undefined){
					$scope.step2.shipment.TrackingSeller = null;
				}
				if($scope.step2.shipment.CourierName ==undefined){
					$scope.step2.shipment.CourierName = "";
				}
				$scope.step2.shipment.TypeTransport = parseInt($scope.step2.shipment.TypeTransport);
				if($scope.step2.shipment.TypeTransport != 2){
					$scope.step2.shipment.TypeTransport = 1;
				}
				$scope.step2.shipment.DateReceived = Datetime.DateToTimestempt($scope.dt2.value);
				if($scope.step2.shipment.DateReceived == undefined){
					$scope.step2.shipment.DateReceived = 0; 
				}
				if ($scope.step2.shipment.ShipToAddress == undefined){
					//toaster.pop('error', 'L?i', 'B?n chua ch?n kho mu?n nh?p h�ng t?i');
					toaster.pop('error', tran('SHIPC_tab4_toaster_Banchuanhapkho'));
				}
				if ($scope.step2.shipment.ShipFromAddress == undefined){
					//toaster.pop('error', 'L?i', 'B?n chua ch?n kho h�ng/c?a h�ng l?y h�ng');
					toaster.pop('error', tran('SHIPC_tab4_toaster_Banchuanhapkhohang'));
				}
				if($scope.step2.shipment.TypeTransport == 2 && $scope.step2.shipment.DateReceived == 0){
					//toaster.pop('error', 'L?i', 'N?u b?n t? v?n chuy?n vui l�ng cho Boxme bi?t ng�y d? ki?n h�ng t?i');
					toaster.pop('error', tran('SHIPC_tab4_toaster_Ngaydukien'));
				}else{
					if ($scope.step2.shipment.ShipmentId) {
						return ShipmentsV2
							.saveItemsList(itemList, $scope.step2.shipment.ShipmentId)
							.then(function () {
								return $scope.step2.shipment.ShipmentId
							});
					// If the shipment was a newly created one
					} else {
						flag = false;
						return ShipmentsV2
							.add($scope.step2.shipment)
							.then(function (shipment) {
								return shipment.ShipmentId;
							});
					}
				}
			}
		};
		$scope.goback = function(){
			$scope.flow.back();
		}
		$scope.print_shipmentrachking = function(){
			$window.open( 'http://seller.shipchung.vn/#/print_hvc?code='+$scope.step4.shipment.Tracking+'','_blank');
		}
		$scope.edit_shipment = function(){
			$alertModal.show(
					'B?n c� mu?n s?a y�u c?u nh?p kho hay kh�ng ?',
					'N?u s?a b?n s? quay l?i bu?c 1.',
					'OK'
				).then(function () {
					$window.location.href = '/#/product/shipment/edit-v2/'+$scope.step3.shipment.ShipmentId+'';
					$state.go('product.shipment');
				})
		}
		$scope.gonext = function() {
			$scope.step2.saveShipment().then(function (shipmentId) {
				return ShipmentsV2.findById(shipmentId);
			}).then(function (shipment) {
				$scope.step3.shipment = shipment;
				$scope.step3.products = shipment.ShipmentItems;
				// Intercom
            	try {
            		var metadata = {
                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                 		   active		:"Create shipment",
                 		   link: 		"product/shipment/create-v2",
            		};
            		Intercom('trackEvent', 'Create shipment', metadata);
	            }catch(err) {
				    console.log(err)
				}
	            // Intercom
				$scope.flow.next();
			},function(){
				//toaster.pop('error', 'L?i', 'Y�u c?u c?a b?n kh�ng th�nh c�ng. Vui l�ng th? l?i');
				toaster.pop('error', tran('SHIPC_tab4_toaster_Yeucaukhongthanhcong'));
			})
		};

		$scope.step3 = function () {
			$scope.step3.shouldPrintLabel = ('BOXME' == $rootScope.toInventoryType);
		};

		$scope.step4 = function () {
			$scope.step4.shipment = $scope.step3.shipment;
			$scope.step4.order = {};
			$scope.step4.processing = false;

			$scope.ladingCalculate = function () {
				ShipmentLading($scope.step4.shipment).then(function (fee) {
					$scope.fee = fee;
				}, function () {
					$scope.fee = 'N/A';
				});
			};
			$scope.step4.shipment.status_update = 1;
			ShipmentsV2.update_status_shipment($scope.step4.shipment).then(function () {
				$scope.step4.shipment.ShipmentStatus = ShipmentsV2.statuses.READY_TO_SHIP;
				
			});
			$scope.show_print_shipmentrachking = undefined;
			$scope.step4.finish = function () {
				$scope.step4.processing = true;
				ShipLanding.post($scope.step4.shipment.ShipmentId).then(function () {
					$scope.step4.processing = false;
					ShipmentsV2.update($scope.step4.shipment)
					
					// Intercom
	            	try {
	            		var metadata = {
	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
	                 		   active			:"Update status -> Shipped",
	                 		   link: 		"product/shipment/create-v2",
	            		};
	            		Intercom('trackEvent', 'Create shipment', metadata);
		            }catch(err) {
					    console.log(err)
					}
		            // Intercom
//						.finally(function(){
//							//$location.url('/product/shipment');
//						});
				}, function(resp) {
					var data = resp.data;
					toaster.pop('error', resp.data.message);
					$scope.step4.processing = false;
				});
                $timeout(function() {
                	ShipmentsV2.findById($scope.step4.shipment.ShipmentId).then(function (result){
    					$scope.step4.shipment=result;
    				});
                	$scope.step4.shipment.status_update = 2;
					ShipmentsV2.update_status_shipment($scope.step4.shipment)
                	$scope.show_print_shipmentrachking = true;
                },3000)
				
				//$scope.$emit('refreshOrderList', 'success');
			}
			$scope.step4.finished = function () {
				if(($scope.step4.shipment.Tracking == null && $scope.step2.shipment.TypeTransport==1) || ($scope.step4.shipment.Tracking==undefined && $scope.step2.shipment.TypeTransport==1)){
					$confirmModal.ask('Bạn chưa duyệt vận đơn ?', 'Bạn chua tạo vận đơn để lấy hàng yêu cầu nhập kho này! Nếu bạn chua chuẩn bị xong, bạn có thể bỏ qua bước này và thực hiện sau trong trang danh sách nhập kho.').then(function() {
						$state.go('product.shipment');
	    			});
				}else{
					if ($scope.step2.shipment.TypeTransport==2){
						
						// Intercom
		            	try {
		            		var metadata = {
		                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
		                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
		                 		   active			:"Update status -> Shipped",
		                 		   link: 		"product/shipment/create-v2",
		            		};
		            		Intercom('trackEvent', 'Create shipment', metadata);
			            }catch(err) {
						    console.log(err)
						}
			            // Intercom
					}
					$scope.step4.shipment.status_update = 2;
					ShipmentsV2.update_status_shipment($scope.step4.shipment)
					.finally(function(){
						$location.url('/product/shipment');
					});
				}
				
			}
		};//end step 4
		var gobackstep = undefined;
		$scope.flow = {
			current: 0,
			next: function() {
				$scope.flow.current ++ ;
				if($scope.flow.current==1)
					Analytics.trackPage('Shipment/Create/Step1');
				else if($scope.flow.current==2)
					Analytics.trackPage('Shipment/Create/Step2');
				else if($scope.flow.current==3)
					Analytics.trackPage('Shipment/Create/Step3');
				else if($scope.flow.current==4)
					Analytics.trackPage('Shipment/Create/Step4');
			},
			back:function(){
				$scope.flow.current -- ;
				gobackstep = 1;
				
			},
			init : function () {
				$scope.$watch('flow.current', function(step) {
					$scope['step' + step]();
				});
			}
		};

		if(flag)
		{
			$scope.flow.init();
			$scope.flow.next();
		}
	}])
	

	