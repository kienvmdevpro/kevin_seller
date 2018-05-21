'use strict';

//shipment
angular.module('app').controller('EditShipmentControllerV2',
	[   '$scope','$rootScope','$localStorage','$window','Datetime','$location','$stateParams','$alertModal','$confirmModal','$timeout','$state','$filter','ShipmentsV2','WarehouseRepository','ShipmentLading','ShipLanding','toaster','ProductsRepository','Analytics',
function($scope , $rootScope , $localStorage,  $window,  Datetime,  $location , $stateParams,  $alertModal , $confirmModal,  $timeout , $state , $filter , ShipmentsV2 , WarehouseRepository , ShipmentLading , ShipLanding , toaster , ProductsRepository,  Analytics) {	
		// Cached shipment promise for multiple time querying
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
			$scope.dt2 = DatePicker();
			var shipmentPromise = ShipmentsV2.findById($stateParams.id);
			$scope.sumproduct = 0;
     	   	var sum_product = 0;
     	   $scope.step1 = function() {
     		    $scope.sumbsin = 0;
   	         	$scope.sumproduct = 0;
	   			shipmentPromise.then(function (shipment) {
	   				$scope.sumproduct = 0;
	        	   var sum_product = 0;
	        	   if(shipment.ShipmentStatus != "Working"){
	        		   toaster.pop('error', 'Không thể cập nhật vận đơn ở trạng thái này');
	        		   $state.go('product.shipment');
	        	   }
					$scope.step1.products = shipment.get('ShipmentItems');
					angular.forEach($scope.step1.products, function(pro) {
						pro.QuantityFree = pro.quatity;
	                    if(pro.Name == undefined){
	                    	pro.Name = pro.ProductName;
	                    }
	                    if(pro.QuantityShipped == undefined){
		                    	pro.QuantityShipped = pro.QuantityFree;
		                    	sum_product = sum_product + pro.QuantityFree;
		                    }else{
		                    	sum_product = sum_product + pro.QuantityShipped;
		                    }
	                });
					$scope.sumproduct =  sum_product;
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
				})
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
               var modellingProducts = function(raw) {
                   $scope.products = raw.listOf('product');
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
               			$scope.search.proceed();
               		}else{
               			$scope.search.condition.key = $scope.selectSku.Name;
                   		$scope.search.proceed();
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
             		 toaster.pop('error', 'Vui lòng chọn sản phẩm');
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
   			 //
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
                       toaster.pop('error', 'Sản phẩm này đã được chọn');
                   }
               };
               //
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
	   					toaster.pop('error', 'Vui lòng nhập lại số lượng sản phẩm');
	   				}else {
	   					$scope.flow.next();
	   				}
	   			};
   		};//end step 1
   		$scope.HVC = 1;
		$scope.paymentType = 1;
		$scope.select_HVC = 0;
			//step 2
		   		$scope.step2 = function() {
		   			var itemList = $scope.step1.products;
					$scope.step2.shipment = {};
					WarehouseRepository.list().then(function(data) {
						angular.forEach(data.listOf('inventory'), function(wms) {
							wms.InventoryId = parseInt (wms.InventoryId);
	                       });
						return data.listOf('inventory');
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
		                if(itemList[0].InventoryType=="BOXME"){
		                    itemList[0].InventoryId = $u.result(itemList[0], 'InventoryIdEn');
		                }
						shipmentPromise.then(function (shipment) {
							//$scope.step1.products = shipment.get('ShipmentItems');
			   				
			   				$scope.step2.shipment = {
									LabelTemplate   : '',
									ShipmentStatus  : shipment.ShipmentStatus, 
									ShipmentItems   : $scope.step1.products,
									//ShipFromAddress : shipment.ShipToAddress,
									//TypeTransport	: 1, //1 - boxme van chuyen, 2 - tu van chuyen
									TypeTransport	: shipment.TypeTransport,
									Typepayment 	: parseInt($scope.paymentType),
									RequestCode		:shipment.RequestCode,
									ShipmentId		:shipment.ShipmentId
							}
			   				if ($scope.step2.shipment.TypeTransport == 2){
								$scope.tranpost_custumer= undefined;
							}else{
								$scope.tranpost_custumer= true;
							}
							if ($scope.step2.shipment.TypeTransport == 1){
								$scope.tranpost_custumer= true;
								$scope.type_transbm = true;
							}else{
								$scope.tranpost_custumer= undefined;
								$scope.type_transbm = false;
							}
			   				var shipFromPromise = WarehouseRepository.find(shipment.ShipToAddress.InventoryId);
							shipFromPromise.then(function(from) {
								$scope.step2.shipment.ShipFromAddress =  from;
							});
			   				var shipFromPromise = WarehouseRepository.find(shipment.ShipFromAddress.InventoryId);
							shipFromPromise.then(function(from) {
								$scope.step2.shipment.ShipToAddress =  from;
								if ($scope.step2.shipment.ShipToAddress != undefined && $scope.step2.shipment.ShipFromAddress != undefined){
									ShipmentsV2.get_blance_shipment($scope.step2.shipment).then(function (result) {
										$scope.blance = result;
										$scope.dateblance = parseInt($scope.blance.TimeDelivery)/24
									},function(response){
										if(response.status == 422){
											toaster.pop('error',response.data.message + '. Vui lòng chọn lại số lượng sản phẩm');
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
					});
		   			
					$scope.changetypepayment = function(item){
						$scope.paymentType = item;
						$scope.step2.shipment.Typepayment =parseInt(item);
						if ($scope.step2.shipment.ShipToAddress != undefined && $scope.step2.shipment.ShipFromAddress != undefined){
							ShipmentsV2.get_blance_shipment($scope.step2.shipment).then(function (result) {
								$scope.blance = result;
								$scope.dateblance = parseInt($scope.blance.TimeDelivery)/24
							},function(response){
								if(response.status == 422){
									toaster.pop('error',response.data.message + '. Vui lòng chọn lại số lượng sản phẩm');
								}
							});
						};
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
										toaster.pop('error',response.data.message + '. Vui lòng chọn lại số lượng sản phẩm');
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
										toaster.pop('error',response.data.message + '. Vui lòng chọn lại số lượng sản phẩm');
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
						// If the shipment was merged with
						// the previous
						
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
							toaster.pop('error', 'Lỗi', 'Bạn chưa chọn kho muốn nhập hàng tới');
							
						}
						if ($scope.step2.shipment.ShipFromAddress == undefined){
							toaster.pop('error', 'Lỗi', 'Bạn chưa chọn kho hàng/cửa hàng lấy hàng');
							
						}
						if($scope.step2.shipment.TypeTransport == 2 && $scope.step2.shipment.DateReceived == 0){
							toaster.pop('error', 'Lỗi', 'Nếu bạn tự vận chuyển vui lòng cho Boxme biết ngày dự kiến hàng tới');
						}else{
							return ShipmentsV2.update_shippment_by_edit($scope.step2.shipment)
							.then(function (shipment) {
								return shipment.ShipmentId;
							},function(response){
								if(response.status == 422){
									toaster.pop('error',response.data.validation_messages);
								}
							});
							
						}
					}
				};
			//end step 2
			//step3
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
							$confirmModal.ask('Bạn chưa duyệt vận đơn ?', 'Bạn chưa tạo vận đơn để lấy hàng yêu cầu nhập kho này! Nếu bạn chưa chuẩn bị xong, bạn có thể bỏ qua bước này và thực hiện sau trong trang danh sách nhập kho.').then(function() {
								$state.go('product.shipment');
			    			});
						}else{
							
							$scope.step4.shipment.status_update = 2;
							ShipmentsV2.update_status_shipment($scope.step4.shipment)
							.finally(function(){
								$location.url('/product/shipment');
							});
						}
						
					}
				};//end step 4
			//end step 4	
			
			//-----------------------------------------------end edit new
			$scope.edit_shipment = function(){
				$scope.flow.current -- ;
				}
			$scope.goback = function(){
				$scope.flow.back();
			}
			$scope.gonext = function() {
				$scope.step2.saveShipment().then(function (shipmentId) {
					return ShipmentsV2.findById(shipmentId);
				}).then(function (shipment) {
					$scope.step3.shipment = shipment;
					$scope.step3.products = shipment.ShipmentItems;
					
					$scope.flow.next();
				},function(){
					toaster.pop('error', 'Lỗi', 'Yêu cầu của bạn không thành công. Vui lòng thử lại');
				})
			};

			$scope.print_shipmentrachking = function(){
				$window.open( 'http://seller.shipchung.vn/#/print_hvc?code='+$scope.step4.shipment.Tracking+'','_blank');
			}
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