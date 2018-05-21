'use strict';

angular.module('app').controller('ResultAlepayLinkedCtrl', ['$scope', '$filter', '$stateParams', '$rootScope', '$http', '$timeout', 'Storage', 'toaster',
 	function($scope, $filter, $stateParams, $rootScope, $http, $timeout, Storage, toaster) {
        $scope.info   = {};
        $scope.process  = false;
        var tran = $filter('translate');

        if($stateParams.data != undefined && $stateParams.checksum != undefined){
            $scope.process  = true;
            $http({
                url: ApiPath+'user-info/succeed-linked',
                method: "POST",
                data: $stateParams,
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(!result.error){
                    $scope.info = result.data;
                    $rootScope.userInfo.alepay_cardnumber       = result.data.alepay_cardnumber;
                    $rootScope.userInfo.alepay_cardholdername   = result.data.alepay_cardholdername;
                    $rootScope.userInfo.alepay_cardexpdate      = result.data.alepay_cardexpdate;
                    $rootScope.userInfo.alepay_active           = 1;
                }
                $scope.error    = result.message;
                $scope.process  = false;
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('error', 'Thông báo', 'Lỗi kết nối dữ liệu, hãy thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });
        }
}]);
