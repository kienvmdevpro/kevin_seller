'use strict';

//shipment
angular.module('app').controller('ShipmentController',
				['$rootScope','$modal','$scope','$state','ShipmentsV2','$stateParams','$localStorage', 'Shipments', '$confirmModal','$location', 'toaster',  '$anchorScroll', 'WarehouseRepository','ShipLanding','Analytics',
		function ($rootScope,  $modal,  $scope,  $state,   ShipmentsV2,  $stateParams,  $localStorage,   Shipments,   $confirmModal,  $location ,  toaster ,  $anchorScroll,   WarehouseRepository , ShipLanding,  Analytics ) {
		Analytics.trackPage('Shipment/Listing');
		$scope.listAction = [{code: 'cancel', name: 'Hủy'}];
		if(!$rootScope.userFulfillment){
			$state.go('product.thongbao');
		}
		$scope.listProgress = [
			{code: 'Working', name: 'Working', namevi: 'Đang tạo'},
			{code: 'ReadyToShip', name: 'Ready To Ship',namevi: 'Đã sẵn sàng'},
			{code: 'Shipped', name: 'Shipped', namevi: 'Đã giao hàng'},
			{code: 'InTransit', name: 'In Transit',namevi: 'Đang vận chuyển'},
			{code: 'Delivered', name: 'Delivered', namevi: 'Đã nhận hàng'},
			{code: 'CheckedIn', name: 'Checked In', namevi: 'Đang kiểm hàng'},
			{code: 'DirectToPrep', name: 'Direct To Prep', namevi: 'Chuẩn bị nhập kho'},
			{code: 'Receiving', name: 'Receiving', namevi: 'Đang nhập kho'},
			{code: 'Closed', name: 'Closed',namevi :'Đã hoàn thành'},
			{code: 'Cancelled', name: 'Cancelled', namevi: 'Kho báo huỷ'},
			//{code: 'Deleted', name: 'Deleted', namevi: 'Đã xoá '},
			{code: 'ReceivingWithProblems', name: 'Receiving With Problems', namevi: 'Đã nhập một phần'}];

		// Load the inventory list
		$scope.listStore = [];
		WarehouseRepository.list().then(function (result) {
			$scope.listStore = result.listOf('inventory');
		});
		
        $scope.createLanding = function(shipment){
        	$scope.createLandingBtt = true;
        	if(shipment.transport_type == 2){
        		shipment.status_update = 2;
    			ShipmentsV2.update_status_shipment(shipment)
    			$scope.createLandingBtt = false;
    			$scope.search.proceed();
    			// Intercom
            	try {
            		var metadata = {
                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
                 		   active		:"Approve shipment",
                 		   links		:"product/shipment"
            		};
            		Intercom('trackEvent', 'Approve shipment', metadata);
	            }catch(err) {
				    console.log(err)
				}
	            // Intercom
        	}else{
        		
                ShipLanding.post(shipment.ShipmentId).then( function() {
                      $scope.search.proceed();
                      $scope.createLandingBtt = false;
                  }, function(resp) {
                  	$scope.createLandingBtt = false;
      				var data = resp.data;
      				toaster.pop('error', resp.data.message);
      			})
        	}
        	
        	
        };

		// Search service wrapper
		$scope.search = {
			// Default search condition
			condition: {
				page : 1,
				page_size: 25
			},
			// Default search status
			searching: false,
			// Quering for data
			proceed: function () {
				$scope.search.searching = true;
				Shipments.list($scope.search.condition)
					.then(function (result) {
						$scope.search.searching = false;
						return result;
					})
					.then(modellingShipments);
			}
		};

		// List of shipments - the search result
		$scope.shipments = [];
		var modellingShipments = function (rows) {
			$scope.shipments = rows;//raw.listOf('product');
			// Toggle behavior
			$scope.shipments.selectedAll = false;
			$scope.checkboxAll = function () {
				$scope.shipments.selectedAll = !$scope.shipments.selectedAll;
				angular.forEach($scope.shipments.listOf('shipments'), function (shipment) {
					shipment.selected = $scope.shipments.selectedAll;
				});
			};
			$scope.checkboxOne = function () {
				angular.forEach($scope.shipments.listOf('shipments'), function (shipment) {
					if(!shipment.selected) {
						$scope.shipments.selectedAll = false;
					}
				});
			};
			$scope.shipments.filterSelected = function () {
				return $scope.shipments.listOf('shipments').filter(function(shipment){
					return shipment.selected;
				});
			};
		};
		// Call shipments
		$scope.search.proceed();

		// Select Action
		$scope.doAction = {
			deactive: function (collection) {
				var listShipmentId = collection.map(function(shipment){
					return shipment.ShipmentId;
				});
				// Delete list shipments
				$confirmModal.ask('Huỷ yêu cầu chuyển kho', 'Bạn có chắc chắn muốn huỷ yêu cầu chuyển kho này hay không?', 'Đồng ý', 'Hủy bỏ').then(function () {
					return Shipments.remove(listShipmentId).then(function (result) {
						//$scope.search.condition.wms = undefined;
					}, function (response) {
						if (response.status == 422) {
							toaster.pop('error',response.data.error_message);
						}
					});
					
				}).then(function () {
					
					// Intercom
	            	try {
	            		var metadata = {
	                 		   user			: 	$rootScope.userInfo.email 		? $rootScope.userInfo.email 	: "",
	                 		   name 		:   $rootScope.userInfo.fullname 	? $rootScope.userInfo.fullname 	: "",
	                 		   active		:"Cancel shipment",
	                 		   links		:"product/shipment"
	            		};
	            		Intercom('trackEvent', 'Cancel shipment', metadata);
		            }catch(err) {
					    console.log(err)
					}
		            // Intercom
					$scope.search.proceed($scope.search.condition);
				});
			}
		};

		$scope.attemptShipped = function (shipment) {
			shipment.Status = 'Shipped';
			Shipments.update(shipment).then(function () {
				$scope.search.proceed();
			});
		}
	}])
app.service('Shipments',
		[
		  '$http','HAL',
function ( $http,  HAL) {
// Build data template
return {
	statuses: {
		'READY_TO_SHIP': 'ReadyToShip'

	},

	remove : function (ids) {
		return $http({
            url: BOXME_API+'delete_shipment' + '/' + ids.join(','),
            method: "POST"
        }).then(function (resp) {
			return HAL.Collection(resp.data);
		})
	},

	findById: function (id) {
		return $http({
            url: BOXME_API+'shipment' + '/' + id,
            method: "GET"
        }).then(function (resp) {
			return HAL.Collection(resp.data);
		})
	},

	list: function (condition) {
		if (""===condition.status) {
			delete condition.status;
		}
		if (""===condition.key) {
			delete condition.active;
		}
		/** @namespace condition.inventory_inbound_id */
		if (""===condition.inventory_inbound_id) {
			delete condition.inventory_inbound_id;
		}
		/** @namespace condition.inventory_outbound_id */
		if (""===condition.inventory_outbound_id) {
			delete condition.inventory_outbound_id;
		}
		if (""===condition.page) {
			delete condition.page;
		}
		if (""===condition.page_size) {
			delete condition.page_size;
		}
		return $http({
            url: BOXME_API+'shipment',
            method: "GET",
            params  : condition
        }).then(function (resp) {
			return HAL.Collection(resp.data);
		})
	}
}
}])


app.controller('ShipmentsDetailController',
		['$scope', '$stateParams', 'Shipments', 'Analytics',
			function ($scope , $stateParams  , Shipments, Analytics) {
				// Cached shipment promise for multiple time querying
				$scope.id = $stateParams.id;
				if($stateParams.id)
					Analytics.trackPage('Shipment/View/'+$stateParams.id);
				var shipmentPromise = Shipments.findById($scope.id);
				$scope.ShipmentItem = {};

				$scope.load = function () {
					shipmentPromise.then(function (shipment) {
						$scope.ShipmentItem = shipment;
					});
				};
			}])
	