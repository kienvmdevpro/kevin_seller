//List Order
angular.module('app').controller('PrintOrderDHLController', 
			['$scope','$http','$state','$window','$stateParams','$filter','toaster','Invoice','$timeout','Api_Path',
 	function($scope,  $http,   $state,  $window,  $stateParams,  $filter,  toaster,  Invoice,  $timeout,  Api_Path) {
	if($stateParams.code == '' || $stateParams.code == undefined){
        $state.go('order.list',{time_start:'7day'});
    }
	var tran = $filter('translate');
	if ($stateParams.code){
		$scope.order_number = $stateParams.code;
	};
	Invoice.get_detail($scope.order_number).then(function (result) {
		$scope.dataInvoice = result.value_data;
		$scope.invoice = result.data_template;
		if (result.lang_active && result.lang_active.toString() == "vi"){
			$scope.invoice = result.data_template;
		}else{
			$scope.invoice = result.data_template_en;
			$scope.dataInvoice.data_oder_info_shipment_type =  $scope.dataInvoice.data_oder_info_shipment_type_en;
		}

	}, function (response) {
		//$scope.dataInvoice ="";
		$timeout(function() {
			Invoice.get_detail($scope.order_number).then(function (result) {
				$scope.dataInvoice = result.value_data;
				/*if($rootScope.keyLang.toString() == 'vi'){
				}else{
					$scope.invoice = result.data_template_en;
				};*/
				if (result.lang_active && result.lang_active.toString() == "vi"){
					$scope.invoice = result.data_template;
					//$scope.dataInvoice
				}else{
					$scope.invoice = result.data_template_en;
					$scope.dataInvoice.data_oder_info_shipment_type =  $scope.dataInvoice.data_oder_info_shipment_type_en;
				}
				}, function (response) {
					$scope.dataInvoice ="";
					$scope.invoice = "";
					toaster.pop('warning',tran('toaster_ss_nitifi'), tran('dhl_ChuaCauHinh'));
					$state.go('invoice',{order:$scope.order_number});
				});
        }, 2000)
        
	});
	
    // List data
    var imgHvc = [1,11,22,6,8,9]
}])
angular.module('app').service('Invoice',
			[ '$http',  'HAL',
				function  ($http,   HAL  ) {
				return {
	     			get: function (data,id) {
	     				return $http({
	     					method: 'GET',
	     					url   : BOXME_API+'list_invoice_by_seller' + "/" + id,
	     					param:data,
	     				}).then(function (response) {
	     					return response.data;
	     				})
	     			},
	     			get_detail: function (id) {
	     				return $http({
	     					method: 'GET',
	     					url   : BOXME_API+'list_invoice_data_by_seller' + "/" + id
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