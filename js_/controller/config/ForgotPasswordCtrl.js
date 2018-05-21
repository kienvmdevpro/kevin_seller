'use strict';

angular.module('app').controller('ForgotPasswordCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams', 'toaster', 'UserInfo',
function($scope, $modal, $http, $state, $stateParams, toaster, UserInfo) {
    $scope.forgotPass = function(email){
        if(email == undefined){
            toaster.pop('error', 'Thông báo', 'Bạn cần nhập email!');
        }
        $http({
            url: ApiCron+'user-notification/forgotpassword?email='+email,
            method: "GET",
            dataType: 'json',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (result, status, headers, config) {
        if(!result.error){
            toaster.pop('success', 'Thông báo', 'Thành công!');
        }        
        else{
            toaster.pop('error', 'Thông báo', result.message);
        }
        });
    }
}]);
