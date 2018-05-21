'use strict';

//List Order
angular.module('app').controller('PrintStoreCtrl', ['$scope', '$http', '$state', '$window', '$stateParams', 'toaster', 'Print', 'Order', 'Api_Path', '$filter', '$sce',
 	function($scope, $http, $state, $window, $stateParams, toaster, Print, Order, Api_Path, $filter, $sce) {
      // config
        if($stateParams.code == '' || $stateParams.code == undefined){
            $state.go('order.list',{time_start:'7day'});
        }

        if($stateParams.type == '' || $stateParams.type == undefined){
            $state.go('order.list',{time_start:'7day'});
        }

        if($stateParams.platform == '' || $stateParams.platform == undefined){
            $state.go('order.list',{time_start:'7day'});
        }
        $scope.data = "";
        var data = {};
        data.tracking_code  = $stateParams.code;
        data.type           = $stateParams.type;
        data.platform       = $stateParams.platform;
        // List data
        var url = ApiPath + 'print-pdf';

        $scope.renderHtml = function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        };

        var tran = $filter('translate');
        $http({
            url: url,
            data: data,
            method: "POST",
            dataType: 'json'
        }).success(function (result, status, headers, config) {
            $scope.waitting_add_store = false;
            if (result.error) {
                toaster.pop('warning', tran('toaster_ss_nitifi'), result.message);
            } else {
                if (!result.error) {
                    if (Object.keys(result.data).length > 0) {
                        $scope.data = $sce.trustAsHtml(result.data);
                    }
                }
            }
        }).error(function (data, status, headers, config) {
            $scope.waitting_add_store = false;
            if (status == 440) {
                Storage.remove();
            } else {
                toaster.pop('warning', tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
            }
        });
        
        
        
      // action
      
 	  
}]);
