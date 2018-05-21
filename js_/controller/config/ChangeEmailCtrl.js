'use strict';

angular.module('app').controller('ChangeEmailCtrl', ['$scope', '$modal', '$http', '$state', '$stateParams', 'toaster', 'UserInfo',
 	function($scope, $modal, $http, $state, $stateParams, toaster, UserInfo) {
        $scope.process  = true;
        $scope.email_nl = '';

        if($stateParams.refer_code){
            UserInfo.result_change_email($stateParams.refer_code).then(function (result) {
                if(!result.data.error){
                    $scope.email_nl     = result.data.data;
                }
                $scope.process  = false;
            });
        }else{
            $scope.process  = false;
        }
}]);
