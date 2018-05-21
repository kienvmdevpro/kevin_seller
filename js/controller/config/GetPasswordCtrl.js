'use strict';

angular.module('app').controller('GetPasswordCtrl', 
		['$scope', '$modal', '$http', '$state', '$stateParams','$location', 'toaster', 'UserInfo','$filter',
function( $scope,  $modal,   $http,    $state,   $stateParams,  $location,   toaster,  UserInfo,   $filter) {
    $scope.token = $stateParams.token;
    var tran = $filter('translate');
    $scope.getPass = function(token,new_pass,re_new_pass){
        if(token == undefined){
            //toaster.pop('error', 'Thông báo', 'Không tồn tại!');
            toaster.pop('error',tran('toaster_ss_nitifi'), tran('Toaster_KhongTonTai'));
        }
        $http({
            url: ApiCron+'user-notification/savepassword?token='+token+'&new_pass='+new_pass+'&re_new_pass='+re_new_pass,
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
        if(!result.error){
            //toaster.pop('success', 'Thông báo', 'Đổi mật khẩu thành công!');
            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_DoiMatKhauThanhCong'));
            $location.path('/access/signin');
        }        
        else{
            toaster.pop('error', tran('toaster_ss_nitifi'), result.message);
        }
        });
    }
}]);