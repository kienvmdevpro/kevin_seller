'use strict';

//List Order
angular.module('app').controller('PrintOrderKerryController', ['$scope', '$http', '$state', '$window', '$stateParams', 'toaster', 'Print', 'Order', 'Api_Path',
 	function($scope, $http, $state, $window, $stateParams, toaster, Print, Order, Api_Path) {
	if($stateParams.code == '' || $stateParams.code == undefined){
        $state.go('order.list',{time_start:'7day'});
    }
    $scope.item         = {};
    $scope.date         = new Date();
    $scope.url_barcode  = Api_Path.Barcode;
    $scope.code         = $stateParams.code;
    $scope.courier      = {};
    $scope.status       = {};
    $scope.city         = {};
    $scope.service      = {};
    $scope.province     = {};
    $scope.ward         = {};
    $scope.barcode      = {};
    $scope.user         = {};
    $scope.inventory    = {};
    $scope.label_config = {};
    // List data
    var imgHvc = [1,11,22,6,8,9]
    Print.Hvc($stateParams.code).then(function (result) {
        if(!result.data.error){
            $scope.data         = result.data.data;
            $scope.courier      = result.data.courier;
            $scope.status       = result.data.status;
            $scope.city         = result.data.city;
            $scope.service      = result.data.service;
            $scope.province     = result.data.province;
            $scope.ward         = result.data.ward;
            $scope.barcode      = result.data.barcode;
            $scope.user         = result.data.user;
            $scope.inventory    = result.data.inventory;
            $scope.label_config = result.data.label;
            //console.log()
            angular.forEach($scope.data, function(value) {
                $scope.courier[value.id]    = value.name;
                var hvc = $scope.courier[''+value.courier_id+'']
                if(hvc && hvc.id && (imgHvc.indexOf(hvc.id) >=0)){
                	 value.img_courier = '/img/logo-hvc/'+hvc.id+'.png' 
                }else{
                	value.img_courier = '/img/logosc.png' 
                }
            });
        }
    });
}])