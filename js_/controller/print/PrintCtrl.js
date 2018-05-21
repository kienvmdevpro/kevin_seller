'use strict';

//List Order
angular.module('app').controller('PrintCtrl', ['$scope', '$http', '$state', '$window', '$stateParams', 'toaster', 'Print', 'Order', 'Api_Path',
 	function($scope, $http, $state, $window, $stateParams, toaster, Print, Order, Api_Path) {
      // config
        if($stateParams.code == '' || $stateParams.code == undefined){
            $state.go('app.dashboard');
        }
        
        $scope.list_data    = {};
        $scope.user         = {};
        $scope.City         = {};
        $scope.District     = {};
        $scope.Ward         = {};

        $scope.date         = new Date();
        $scope.url_barcode  = Api_Path.Barcode;
        $scope.list_courier = {};

        // ListCourier
        $scope.get_courier = function(){
            Order.ListCourier().then(function (result) {
                if(result.data.data){
                    angular.forEach(result.data.data, function(value, key) {
                        $scope.list_courier[value.id] = value;
                    });
                }
            })
        };

        // List data
        Print.Multi($stateParams.code).then(function (result) {
            if(!result.data.error){
                $scope.list_data        = result.data.data;
                $scope.user             = result.data.user;
                $scope.City             = result.data.city;
                $scope.District         = result.data.district;
                $scope.Ward             = result.data.ward;
                $scope.get_courier();
            }else{
                toaster.pop('error', 'Thông báo', 'Không có dữ liệu !');
            }  
        });
        
        
        
      // action
      
 	  
}]);
