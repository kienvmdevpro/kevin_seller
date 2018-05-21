'use strict';

//List Order
angular.module('app').controller('PrintHvcCtrl', ['$scope', '$http', '$state', '$window', '$stateParams', 'toaster', 'Print', 'Api_Path',
 	function($scope, $http, $state, $window, $stateParams, toaster, Print, Api_Path) {
      // config
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

        // List data
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
            }
        });
        
        
        
      // action
      
 	  
}]);
