'use strict';

angular.module('app').controller('ForgotPasswordCtrl', 
		['$scope', '$modal', '$http', '$state', '$stateParams', 'toaster', 'UserInfo','$filter',
function($scope,   $modal,   $http,    $state,   $stateParams,   toaster,   UserInfo,  $filter) {
	var tran = $filter('translate');
    $scope.forgotPass = function(email){
        if(email == undefined){
            //toaster.pop('error', 'Thông báo', 'Bạn cần nhập email!');
        	 toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_BanCanNhapEmail'));
        }
        $http({
            url: ApiCron+'user-notification/forgotpassword?email='+email,
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
        if(!result.error){
            //toaster.pop('success', 'Thông báo', 'Thành công!');
            toaster.pop('success',tran('toaster_ss_nitifi'), tran('Toaster_ThanhCong'));
        }        
        else{
            toaster.pop('error', tran('toaster_ss_nitifi'), result.message);
        }
        });
    }
}]);
