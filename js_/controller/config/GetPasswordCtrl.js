'use strict';

angular.module('app').controller('GetPasswordCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams','$location', 'toaster', 'UserInfo',
function($scope, $modal, $http, $state, $stateParams,$location, toaster, UserInfo) {
    $scope.token = $stateParams.token;
    //
    $scope.getPass = function(token,new_pass,re_new_pass){
        if(token == undefined){
            toaster.pop('error', 'Thông báo', 'Không tồn tại!');
        }
        $http({
            url: ApiCron+'user-notification/savepassword?token='+token+'&new_pass='+new_pass+'&re_new_pass='+re_new_pass,
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
        if(!result.error){
            toaster.pop('success', 'Thông báo', 'Đổi mật khẩu thành công!');
            $location.path('/access/signin');
        }        
        else{
            toaster.pop('error', 'Thông báo', result.message);
        }
        });
    }
}]);