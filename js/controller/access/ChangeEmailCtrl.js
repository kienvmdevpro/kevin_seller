'use strict';

angular.module('app').controller('ChangeEmailCtrl', 
			['$scope','$filter', '$modal', '$http', '$state', '$stateParams', 'toaster', 'UserInfo',
 	function( $scope,  $filter,   $modal,  $http,   $state,   $stateParams,    toaster,   UserInfo) {
        $scope.process  = true;
        $scope.email_nl = '';
        var tran = $filter('translate');
        $scope.error_message = "";
        if($stateParams.refer_code){
            return $http({
                url: ApiPath + 'access/confirmchangenl/'+$stateParams.refer_code,
                method: "GET",
                dataType: 'json'
            }).success(function (result, status, headers, config) {
                if(!result.error){
                    $scope.email_nl     = result.data;
                }else {
                    $scope.error_message = result.error_message;
                }
                $scope.process  = false;
            }).error(function (data, status, headers, config) {
                if(status == 440){
                    Storage.remove();
                }else{
                    //toaster.pop('warning', 'Thông báo', 'Kết nối dữ liệu thất bại, vui lòng thử lại!');
                    toaster.pop('warning',tran('toaster_ss_nitifi'), tran('Toaster_ketnoidulieuthatbai'));
                }
            });

        }else{
            $scope.process  = false;
        }
        
}]);
